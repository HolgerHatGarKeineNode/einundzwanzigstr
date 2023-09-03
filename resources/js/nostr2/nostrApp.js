import NDK, {NDKEvent} from "@nostr-dev-kit/ndk";
import JSConfetti from "js-confetti";
import {error} from "high-console";
import defaultRelays from "../nostr/defaultRelays.js";
import {eventKind, NostrFetcher} from "nostr-fetch";
import {ndkAdapter} from "@nostr-fetch/adapter-ndk";
import {filterReplies} from "../nostr/utils/filterReplies.js";
import {nested} from "../nostr/utils/nested.js";
import {decode} from "light-bolt11-decoder";

async function verifyRelays(relays) {
    try {
        const urls = relays.map((relay) => {
            if (relay.startsWith('ws')) {
                return relay.replace('ws', 'http');
            }
            if (relay.startsWith('wss')) {
                return relay.replace('wss', 'https');
            }
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort('timeout'), 5000);

        const requests = urls.map((url) =>
            fetch(url, {
                headers: {Accept: 'application/nostr+json'},
                signal: controller.signal,
            })
        );
        const responses = await Promise.all(requests);
        const errors = responses.filter((response) => !response.ok);

        if (errors.length > 0) {
            throw errors.map((response) => Error(response.statusText));
        }

        let verifiedRelays = responses.map((res) => {
            if (res.url.startsWith('http')) {
                return res.url.replace('http', 'ws');
            }
            if (res.url.startsWith('https')) {
                return res.url.replace('https', 'wss');
            }
        });

        // clear timeout
        clearTimeout(timeoutId);

        // return all validate relays
        return verifiedRelays;
    } catch (e) {
        error(e);
    }
}

export default (livewireComponent) => ({

    // hours ago
    hoursAgo: 6,

    // mobile menu opened
    mobileMenuOpened: false,

    // modals
    openCommentModal: false,
    openCreateNoteModal: false,
    openReactionModal: false,
    // current modal event
    currentEventToReactId: null,
    currentEventToReactPubkey: null,

    // load from pubkey
    pubkey: livewireComponent.entangle('pubkey'),

    // used memory in redis
    usedMemory: livewireComponent.entangle('usedMemory'),

    // used memory in redis
    loading: livewireComponent.entangle('loading'),

    // hasNewEvents
    hasNewEvents: livewireComponent.entangle('hasNewEvents'),

    // feedHexpubs
    feedHexpubs: livewireComponent.entangle('feedHexpubs'),

    // showProfileHeader
    showProfileHeader: livewireComponent.entangle('showProfileHeader'),

    // showSignerRejectedAlert
    showSignerRejectedAlert: livewireComponent.entangle('showSignerRejectedAlert'),

    async verifyRelays(relays) {
        return await verifyRelays(relays);
    },

    async init() {
        // init confetti
        this.jsConfetti = new JSConfetti();

        this.$store.ndk.explicitRelayUrls = await this.verifyRelays(defaultRelays);
        const instance = new NDK({
            explicitRelayUrls: this.$store.ndk.explicitRelayUrls,
            signer: this.$store.ndk.nip07signer,
            cacheAdapter: this.$store.ndk.dexieAdapter,
        });

        try {
            await instance.connect(10000);
        } catch (error) {
            throw new Error('NDK instance init failed: ', error);
        }

        // store NDK instance in store
        this.$store.ndk.ndk = instance;

        // init nip07 signer and fetch profile
        await this.$store.ndk.nip07signer.user().then(async (user) => {
            if (!!user.npub) {
                this.$store.ndk.user = this.$store.ndk.ndk.getUser({
                    npub: user.npub,
                });
                await this.$store.ndk.user.fetchProfile();
            }
        }).catch((error) => {
            this.rejected = true;
        });

        // fetch follows of currentUser
        const follows = await this.$store.ndk.user.follows();
        let hexpubs = Array.from(follows).map((follow) => follow.hexpubkey());
        this.$wire.setFollowers(hexpubs);

        // hexpubs current pubkey
        if (this.pubkey) {
            const pubkeyUser = this.$store.ndk.ndk.getUser({
                npub: this.pubkey,
            });
            hexpubs = [pubkeyUser.hexpubkey()];
        }

        // call cache to load data
        await this.$wire.setFeedHexpubs(hexpubs);

        this.$wire.reloadFeed();

        await this.fetchEvents(hexpubs);

        this.$wire.reloadFeed();
    },

    fetchEvents: async function (hexpubs) {
        // get all events from hexpubs
        const nHoursAgo = (hrs) => Math.floor((Date.now() - hrs * 60 * 60 * 1000) / 1000);
        const fetcher = NostrFetcher.withCustomPool(ndkAdapter(this.$store.ndk.ndk));
        let fetchedEvents = await fetcher.fetchAllEvents(
            this.$store.ndk.explicitRelayUrls,
            {kinds: [eventKind.text], authors: hexpubs},
            {since: nHoursAgo(this.hoursAgo)},
            {sort: true}
        );

        // cache every author of fetched events
        let cachedAuthors = {};
        for (const event of fetchedEvents) {
            if (!cachedAuthors[event.pubkey]) {
                const user = await this.$store.ndk.ndk.getUser({hexpubkey: event.pubkey});
                await user.fetchProfile();
                if (!user.profile.display_name) {
                    user.profile.display_name = user.profile.displayName;
                }
                if (!user.profile.display_name) {
                    user.profile.display_name = user.profile.name;
                }
                if (!user.profile.image) {
                    user.profile.image = user.profile.picture;
                }
                cachedAuthors[event.pubkey] = {
                    pubkey: event.pubkey,
                    value: {
                        npub: user.npub,
                        profile: {...user.profile}
                    }
                };
            }
        }

        // filter replies
        fetchedEvents = filterReplies(fetchedEvents);
        await this.$wire.setCache(fetchedEvents, 'events');

        // replies
        let cachedReplies = {};
        for (const event of fetchedEvents) {
            const replies = await fetcher.fetchAllEvents(
                this.$store.ndk.explicitRelayUrls,
                {kinds: [eventKind.text], '#e': [event.id],},
                {},
                {sort: true}
            );
            const combinedEventWithReplies = [event, ...replies];
            const nestedReplies = nested(combinedEventWithReplies, [event.id]);
            cachedReplies[event.id] = {
                pubkey: event.pubkey,
                value: Array.from(nestedReplies)
            };
        }
        // set cached replies
        await this.$wire.setCache(cachedReplies, 'replies');

        // reactions
        let cachedReposts = {};
        let cachedReactions = {};
        let cachedZaps = {};
        const eventIds = fetchedEvents.map((event) => event.id);
        const reactionEvents = await fetcher.allEventsIterator(
            this.$store.ndk.explicitRelayUrls,
            {kinds: [eventKind.reaction, eventKind.zap, eventKind.repost], '#e': eventIds,},
            {},
        );
        for await (const ev of reactionEvents) {
            const reactedToEvent = ev.tags.find((tag) => tag[0] === 'e')[1];
            const reactedToEventPubkey = ev.tags.find((tag) => tag[0] === 'p')?.[1];
            if (!reactedToEventPubkey) {
                continue;
            }
            switch (ev.kind) {
                case 6:
                    if (!cachedReposts[reactedToEvent]) {
                        cachedReposts[reactedToEvent] = {};
                    }
                    if (!cachedReposts[reactedToEvent]['pubkey']) {
                        cachedReposts[reactedToEvent]['pubkey'] = reactedToEventPubkey;
                    }
                    if (!cachedReposts[reactedToEvent]['value']) {
                        cachedReposts[reactedToEvent]['value'] = [];
                    }
                    if (!cachedReposts[reactedToEvent]['value'].find((e) => e.id === ev.id)) {
                        cachedReposts[reactedToEvent]['value'].push(ev);
                    }
                    break;
                case 7:
                    if (!cachedReactions[reactedToEvent]) {
                        cachedReactions[reactedToEvent] = {};
                    }
                    if (!cachedReactions[reactedToEvent]['pubkey']) {
                        cachedReactions[reactedToEvent]['pubkey'] = reactedToEventPubkey;
                    }
                    if (!cachedReactions[reactedToEvent]['value']) {
                        cachedReactions[reactedToEvent]['value'] = [];
                    }
                    if (!cachedReactions[reactedToEvent]['value'].find((e) => e.id === ev.id)) {
                        cachedReactions[reactedToEvent]['value'].push(ev);
                    }
                    break;
                case 9735:
                    const bolt11 = ev.tags.find((tag) => tag[0] === 'bolt11')[1];
                    if (bolt11) {
                        const decoded = decode(bolt11);
                        const amount = decoded.sections.find((item) => item.name === 'amount');
                        const sats = amount.value / 1000;
                        if (!cachedZaps[reactedToEvent]) {
                            cachedZaps[reactedToEvent] = {};
                        }
                        if (!cachedZaps[reactedToEvent]['pubkey']) {
                            cachedZaps[reactedToEvent]['pubkey'] = reactedToEventPubkey;
                        }
                        if (!cachedZaps[reactedToEvent]['value']) {
                            cachedZaps[reactedToEvent]['value'] = [];
                        }
                        if (!cachedZaps[reactedToEvent]['value'].find((e) => e.id === ev.id)) {
                            cachedZaps[reactedToEvent]['value'].push({...ev, sats: sats});
                        }
                    }
                    break;
                default:
                    break;
            }
            if (!cachedAuthors[ev.pubkey]) {
                const user = await this.$store.ndk.ndk.getUser({hexpubkey: ev.pubkey});
                await user.fetchProfile();
                if (!user.profile.display_name) {
                    user.profile.display_name = user.profile.displayName;
                }
                if (!user.profile.display_name) {
                    user.profile.display_name = user.profile.name
                }
                if (!user.profile.image) {
                    user.profile.image = user.profile.picture;
                }
                cachedAuthors[ev.pubkey] = {
                    pubkey: ev.pubkey,
                    value: {
                        npub: user.npub,
                        profile: {...user.profile}
                    }
                }
            }
        }
        // set cached authors
        await this.$wire.setCache(cachedAuthors, 'authors');
        // set cached reposts
        await this.$wire.setCache(cachedReposts, 'reposts');
        // set cached reactions
        await this.$wire.setCache(cachedReactions, 'reactions');
        // set cached zaps
        await this.$wire.setCache(cachedZaps, 'zaps');

        // set last event timestamp
        if (fetchedEvents.length > 0) {
            this.$store.ndk.lastEventTimestamp = fetchedEvents[0].created_at;
        }
    },

    // load more events
    async loadMoreEvents() {
        this.loading = true;
        this.hoursAgo += 6;
        await this.fetchEvents(this.feedHexpubs);
        this.loading = false;
        console.log('hours ago', this.hoursAgo);
        this.$wire.reloadFeed();
    },

    openReactionPicker(id, pubkey) {
        console.log(id);
        this.currentEventToReactId = id;
        this.currentEventToReactPubkey = pubkey;
        this.openReactionModal = true;
    },

    async love(id, pubkey, emoticon) {
        // react to event
        const ndkEvent = new NDKEvent(this.$store.ndk.ndk);
        ndkEvent.content = emoticon;
        ndkEvent.kind = eventKind.reaction;
        ndkEvent.tags = [
            ['e', id],
            ['p', pubkey],
        ];
        await ndkEvent.publish();
        await this.jsConfetti.addConfetti({
            emojis: [emoticon,],
        })
    },
});
