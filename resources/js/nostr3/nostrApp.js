import NDK, {NDKEvent} from "@nostr-dev-kit/ndk";
import JSConfetti from "js-confetti";
import {error} from "high-console";
import defaultRelays from "../nostr/defaultRelays.js";
import {eventKind, NostrFetcher} from "nostr-fetch";
import {ndkAdapter} from "@nostr-fetch/adapter-ndk";
import {filterReplies} from "../nostr/utils/filterReplies.js";
import {nested} from "../nostr/utils/nested.js";
import {decode} from "light-bolt11-decoder";
import {requestProvider} from "webln";

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

async function fetchEventsByHexpubs(fetcher, hexpubs) {
    console.log('fetch since', this.since);
    console.log('fetch until', this.until);
    let fetchedEvents = await fetcher.fetchAllEvents(
        this.$store.ndk.explicitRelayUrls,
        {kinds: [eventKind.text], authors: hexpubs},
        {until: this.until, since: this.since},
        {sort: true}
    );

    return {fetcher, fetchedEvents};
}

async function cacheAuthors(fetchedEvents) {
    let cachedAuthors = {};
    for (const event of fetchedEvents) {
        if (!this.cachedAuthorHashpubkeys.includes(event.pubkey) && !cachedAuthors[event.pubkey]) {
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
    //console.log('cachedAuthors', cachedAuthors);
    return cachedAuthors;
}

async function cacheReplies(fetchedEvents, fetcher) {
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
    //console.log('cachedReplies', cachedReplies);
    await this.$wire.setCache(cachedReplies, 'replies');
}

async function cacheReactions(fetchedEvents, fetcher, cachedAuthors) {
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
                        // get pubkey from tags where key is description
                        const description = ev.tags.find((tag) => tag[0] === 'description')[1];
                        ev.sender = JSON.parse(description).pubkey;
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
    //console.log('cachedReposts', cachedReposts);
    //console.log('cachedReactions', cachedReactions);
    //console.log('cachedZaps', cachedZaps);
    return {cachedReposts, cachedReactions, cachedZaps};
}

export default (livewireComponent) => ({

    // hours ago
    hoursAgo: livewireComponent.entangle('hoursAgo'),
    hoursSteps: livewireComponent.entangle('hoursSteps'),
    tries: 0,

    until: livewireComponent.entangle('until'),
    since: livewireComponent.entangle('since'),

    // limit
    limit: 5,

    // current fetchedEventsLength
    fetchedEventsLength: 0,

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
    pubkeys: livewireComponent.entangle('pubkeys'),

    // used memory in redis
    usedMemory: livewireComponent.entangle('usedMemory'),

    // used memory in redis
    loading: livewireComponent.entangle('loading'),

    // hasNewEvents
    hasNewEvents: livewireComponent.entangle('hasNewEvents'),

    // feedHexpubs
    feedHexpubs: livewireComponent.entangle('feedHexpubs'),

    // cachedEvents
    cachedEvents: livewireComponent.entangle('cachedEvents'),

    // cachedAuthorHashpubkeys
    cachedAuthorHashpubkeys: livewireComponent.entangle('cachedAuthorHashpubkeys'),

    // showProfileHeader
    showProfileHeader: livewireComponent.entangle('showProfileHeader'),

    // showSignerRejectedAlert
    showSignerRejectedAlert: livewireComponent.entangle('showSignerRejectedAlert'),

    async verifyRelays(relays) {
        return await verifyRelays(relays);
    },

    async init() {
        const nHoursAgo = (hrs) => Math.floor((Date.now() - hrs * 60 * 60 * 1000) / 1000);

        Alpine.effect(async () => {
            console.log('cachedEvents', this.cachedEvents);
            console.log('cachedEventsLength', this.cachedEvents.length);
            if (this.feedHexpubs.length > 0 && this.cachedEvents.length === 0 && this.tries < 20) {
                this.since = nHoursAgo(this.hoursAgo);
                this.until = Math.floor(Date.now() / 1000);
                this.hoursAgo = this.hoursAgo + this.hoursSteps;
                await this.fetchEvents();
            }
        });

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
        if (this.pubkeys) {
            hexpubs = [];
            for (const pubkey of this.pubkeys) {
                const pubkeyUser = this.$store.ndk.ndk.getUser({
                    npub: pubkey,
                });
                hexpubs.push(pubkeyUser.hexpubkey());
            }
        }

        // call cache to load data
        await this.$wire.setFeedHexpubs(hexpubs);

        // interval to fetch new events every minute
        // setInterval(async () => {
        //     await this.fetchEvents();
        // }, 60000);
    },

    fetchEvents: async function (reload = true) {
        const fetcher = NostrFetcher.withCustomPool(ndkAdapter(this.$store.ndk.ndk));

        // get all events from hexpubs
        let {fetchedEvents} = await fetchEventsByHexpubs.call(this, fetcher, this.feedHexpubs);

        let cachedAuthors = {};
        if (reload) {
            // cache every author of fetched events
            cachedAuthors = await cacheAuthors.call(this, fetchedEvents);
        }

        // filter replies
        fetchedEvents = filterReplies(fetchedEvents);
        if (fetchedEvents.length > 0) {
            console.log('setCache EVENTS', fetchedEvents);
            await this.$wire.setCache(fetchedEvents, 'events');

            if (reload) {
                // replies
                await cacheReplies.call(this, fetchedEvents, fetcher);

                // reactions
                let {
                    cachedReposts,
                    cachedReactions,
                    cachedZaps,
                } = await cacheReactions.call(this, fetchedEvents, fetcher, cachedAuthors);

                // set cached authors
                await this.$wire.setCache(cachedAuthors, 'authors');
                // set cached reposts
                await this.$wire.setCache(cachedReposts, 'reposts');
                // set cached reactions
                await this.$wire.setCache(cachedReactions, 'reactions');
                // set cached zaps
                await this.$wire.setCache(cachedZaps, 'zaps');
            }
        }
    },

    reloadEventReactions: async function (events) {
        const fetcher = NostrFetcher.withCustomPool(ndkAdapter(this.$store.ndk.ndk));
        // reactions
        let {
            cachedReposts,
            cachedReactions,
            cachedZaps,
        } = await cacheReactions.call(this, events, fetcher, {});
        // set cached reposts
        await this.$wire.setCache(cachedReposts, 'reposts');
        // set cached reactions
        await this.$wire.setCache(cachedReactions, 'reactions');
        // set cached zaps
        await this.$wire.setCache(cachedZaps, 'zaps');
    },

    async loadMoreEvents() {
        const oldFetchedLength = this.fetchedEventsLength;
        const nHoursAgo = (hrs) => Math.floor((Date.now() - hrs * 60 * 60 * 1000) / 1000);
        while (this.fetchedEventsLength === oldFetchedLength) {
            this.hoursAgo = this.hoursAgo + this.hoursSteps;
            this.until = Math.floor(Date.now() / 1000);
            this.since = nHoursAgo(this.hoursAgo);
            await this.fetchEvents(false);
        }
        await this.fetchEvents(true);
    },

    openReactionPicker(id) {
        this.currentEventToReactId = id;
        this.openReactionModal = true;
    },

    async love(id, emoticon) {
        const event = await this.$store.ndk.ndk.fetchEvent(id);
        // react to event
        const ndkEvent = new NDKEvent(this.$store.ndk.ndk);
        ndkEvent.content = emoticon;
        ndkEvent.kind = eventKind.reaction;
        ndkEvent.tags = [
            ['e', event.id],
            ['p', event.pubkey],
        ];
        await ndkEvent.publish();
        await this.jsConfetti.addConfetti({
            emojis: [emoticon,],
        });
        await this.reloadEventReactions([event]);
    },

    async zap(id) {
        const event = await this.$store.ndk.ndk.fetchEvent(id);
        const ndkEvent = new NDKEvent(this.$store.ndk.ndk, event);
        const res = await ndkEvent
            .zap(
                69000,
                'This is a test zap from my experimental nostr web client at https://einundzwanzigstr.codingarena.de'
            );
        // debug(res, window.webln);
        await requestProvider();
        const payment = await window.webln.sendPayment(res);
        // debug(payment);
        await this.jsConfetti.addConfetti({
            emojis: ['⚡'],
        });
        // reload reactions after 10 seconds
        setTimeout(async () => {
            await this.reloadEventReactions([event]);
        }, 3000);
    },

});
