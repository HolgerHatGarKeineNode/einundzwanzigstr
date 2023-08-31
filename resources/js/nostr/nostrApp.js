import NDK, {NDKEvent} from '@nostr-dev-kit/ndk';
import {eventKind, NostrFetcher} from 'nostr-fetch';
import {ndkAdapter} from '@nostr-fetch/adapter-ndk';
import defaultRelays from "./defaultRelays.js";
import {decode} from "light-bolt11-decoder";
import JSConfetti from 'js-confetti';
import {requestProvider} from "webln";
import {compactNumber} from "./utils/number.js";
import {parseEventContent} from "./parse/parseEventContent.js";
import {nip19} from "nostr-tools";

function transformToHexpubs() {
    let hexpubs = [];
    // last part from current url
    if (this.currentNpubs.length === 0) {
        const npub = window.location.href.split('/').pop();
        this.currentNpubs.push(npub);
    }
    for (const npub of this.currentNpubs) {
        // convert npub to hexpub
        const hexpub = nip19.decode(npub);
        // check if hexpub is valid
        if (hexpub) {
            // add hexpub to hexpubs array
            hexpubs.push(hexpub.data);
        }
    }
    return hexpubs;
}

function filterReplies(fetchedEvents) {
    for (const e of fetchedEvents) {
        if (
            e.tags?.[0]?.[0] === 'e' && !e.tags?.[0]?.[3]
            || e.tags.find((el) => el[3] === 'root')?.[1]
            || e.tags.find((el) => el[3] === 'reply')?.[1]
        ) {
            // we will remove event from fetchedEvents
            fetchedEvents = fetchedEvents.filter((el) => el.id !== e.id);
        }
    }
    return fetchedEvents;
}

export default (livewireComponent) => ({

    loading: false,
    open: false,
    openCommentModal: false,
    openReactionModal: false,
    currentEventToReact: null,
    openReactionPicker(event) {
        this.currentEventToReact = event;
        this.openReactionModal = true;
    },
    openCommentEditor(event) {
        this.currentEventToReact = event;
        this.openCommentModal = true;
    },

    numberFormat(number) {
        return compactNumber.format(number);
    },

    formatDate(date) {
        // human readable age from timestamp in multiple formates (seconds, minutes, hours, days, weeks, months, years)
        const time = Math.floor((Date.now() - date * 1000) / 1000);
        if (time < 60) {
            return time + 's ago';
        }
        if (time < 3600) {
            return Math.floor(time / 60) + 'm ago';
        }
        if (time < 86400) {
            return Math.floor(time / 3600) + 'h ago';
        }
        if (time < 604800) {
            return Math.floor(time / 86400) + 'd ago';
        }
        if (time < 2629800) {
            return Math.floor(time / 604800) + 'w ago';
        }
        if (time < 31557600) {
            return Math.floor(time / 2629800) + 'm ago';
        }
        return Math.floor(time / 31557600) + 'y ago';
    },

    rejected: false,

    jsConfetti: null,

    currentNpubs: livewireComponent.entangle('currentNpubs'),
    limit: livewireComponent.entangle('limit'),

    eventsCache: livewireComponent.entangle('eventsCache'),
    npubsCache: livewireComponent.entangle('npubsCache'),
    usedMemory: livewireComponent.entangle('usedMemory'),

    events: [],

    authorMetaData: {},

    async verifyRelays(relays) {
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
            console.error(e);
        }
    },

    async init() {
        this.authorMetaData = this.npubsCache;

        this.jsConfetti = new JSConfetti();
        const nHoursAgo = (hrs) => Math.floor((Date.now() - hrs * 60 * 60 * 1000) / 1000);
        let explicitRelayUrls = [];
        explicitRelayUrls = await this.verifyRelays(defaultRelays);
        this.$store.ndk.validatedRelays = explicitRelayUrls;
        const instance = new NDK({
            explicitRelayUrls: this.$store.ndk.validatedRelays,
            signer: this.$store.ndk.nip07signer,
            cacheAdapter: this.$store.ndk.dexieAdapter,
        });
        try {
            await instance.connect(10000);
        } catch (error) {
            throw new Error('NDK instance init failed: ', error);
        }
        this.$store.ndk.ndk = instance;

        await this.loadProfile();

        await this.fetchEvents();

        // this.loadMore() until we have 2 events and stop after too many tries
        let tries = 0;
        while (Object.keys(this.events).length < 2 && tries < 2) {
            await this.loadMore();
            tries++;
        }

        Alpine.effect(async () => {
            if (this.$store.ndk.user) {

            }
        });
    },

    async loadProfile() {
        await this.$store.ndk.nip07signer.user().then(async (user) => {
            if (!!user.npub) {
                console.log("Permission granted to read their public key:", user.npub);
                this.$store.ndk.user = this.$store.ndk.ndk.getUser({
                    npub: user.npub,
                });
                await this.$store.ndk.user.fetchProfile();
            }
        }).catch((error) => {
            this.rejected = true;
        });
    },

    async fetchAllRepliesOfEvent(event) {
        console.log('connected to fetchAllRepliesOfEvents');
        const fetcher = NostrFetcher.withCustomPool(ndkAdapter(this.$store.ndk.ndk));
        const events = await fetcher.fetchAllEvents(
            this.$store.ndk.validatedRelays,
            {kinds: [eventKind.text], '#e': [event.id],},
            {},
            {sort: true}
        );
        if (events.length > 0) {
            const replies = new Set();
            events.forEach((ev) => {
                const tags = ev.tags.filter((el) => el[0] === 'e' && el[1] !== ev.id);
                if (tags.length > 0) {
                    tags.forEach((tag) => {
                        const rootIndex = events.findIndex((el) => el.id === tag[1]);
                        if (rootIndex !== -1) {
                            const rootEvent = events[rootIndex];
                            if (rootEvent && rootEvent.replies) {
                                rootEvent.replies.push(ev);
                            } else {
                                rootEvent.replies = [ev];
                            }
                            replies.add(ev.id);
                        }
                    });
                }
            });
            const filtered = events.filter((ev) => !replies.has(ev.id));
            this.events[event.id].replies = filtered;
            // unique pubkeys from events
            const authorIds = [...new Set(this.events[event.id].replies.map((ev) => ev.pubkey))];
            // filter authorIds that are already in this.authorMetaData with filter method
            authorIds.filter((authorId) => !this.authorMetaData[authorId]);
            await this.getAuthorsMeta(authorIds);
            // loop through replies and find replies of replies
            for (const reply of this.events[event.id].replies) {
                //await this.fetchAllRepliesOfEvent(reply);
            }
            return filtered;
        }
    },

    async fetchEvents() {
        console.log('>>> fetchEvents');
        document.querySelector("#loader").style.display = "block";
        const nHoursAgo = (hrs) => Math.floor((Date.now() - hrs * 60 * 60 * 1000) / 1000);
        const fetcher = NostrFetcher.withCustomPool(ndkAdapter(this.$store.ndk.ndk));
        let hexpubs = transformToHexpubs.call(this);
        console.log('???? SEARCH FOR HEXPUBS', hexpubs.length, hexpubs);
        // FILTER
        let fetchedEvents = await fetcher.fetchAllEvents(
            this.$store.ndk.validatedRelays,
            {kinds: [eventKind.text], authors: hexpubs},
            {since: nHoursAgo(this.$store.ndk.hoursAgo)},
            {sort: true}
        );
        console.log('UNTIL', this.formatDate(nHoursAgo(this.$store.ndk.hoursAgo)));
        console.log('FOUND EVENTS', fetchedEvents.length, fetchedEvents);
        // filter events that are replies or reposts
        fetchedEvents = filterReplies(fetchedEvents);

        // hit cache for events
        const eventsIds = fetchedEvents.map((ev) => ev.id);
        await this.$wire.getEventsByIds(eventsIds).then(result => {
            console.log('+++ HIT EVENTS CACHE', result);
            if (result > 0) {
                console.log('*** EVENTS AFTER HITTING CACHE', this.eventsCache);
            }
        });
        console.log('FILTERED EVENTS', fetchedEvents.length, fetchedEvents);
        // init events object
        if (fetchedEvents.length > 0) {
            for (const newEv of fetchedEvents) {

                console.log('????? SEARCH ON EVENTS CACHE', newEv.id, this.eventsCache[newEv.id]);

                if (this.eventsCache[newEv.id]) {
                    this.events[newEv.id] = this.eventsCache[newEv.id];
                }
                if (!this.events[newEv.id]) {
                    this.events[newEv.id] = newEv;
                }
            }
        }
        console.log('NEW EVENTS OBJECT', this.events);
        // fetch all replies of events
        for (const f of fetchedEvents) {
            const newReplies = await this.fetchAllRepliesOfEvent(f);
            this.events[f.id].replies = newReplies
            if (f.id === '9985ec1c27f968f6b3400cc3d4a5ecb5055c2e3ae8ef92f1962c568d6575d5eb') {
                console.log('NEW REPLIES', newReplies);
            }
        }
        // fetch authors metadata
        await this.getAuthorsMeta(hexpubs);
        await this.getReactions(fetchedEvents);

        // hit the cache
        console.log('+++ HIT EVENTS CACHE UPDATE', Object.values(Alpine.raw(this.events)));
        this.$wire.updateEventCache(Object.values(Alpine.raw(this.events)));
        console.log('<<< HIT CACHE WITH EVENT IDS', eventsIds);
        this.$wire.getEventsByIds(eventsIds).then(result => {
            console.log('--- NEW CACHE RESULT', result);
        });
        document.querySelector("#loader").style.display = "none";
    },

    async getAuthorsMeta(authorIds) {
        // filter authorIds that are already in this.authorMetaData with filter function
        authorIds = authorIds.filter((authorId) => !this.authorMetaData[authorId]);
        // todo: console.log('SEARCH FOR NEW AUTHORS', authorIds.length, authorIds);
        if (authorIds.length === 0) return;

        const fetcher = NostrFetcher.withCustomPool(ndkAdapter(this.$store.ndk.ndk));
        const nHoursAgo = (hrs) => Math.floor((Date.now() - hrs * 60 * 60 * 1000) / 1000);
        const latestEvents = await fetcher.fetchAllEvents(
            this.$store.ndk.validatedRelays,
            {kinds: [eventKind.metadata], authors: authorIds},
            {},
            {skipVerification: true}
        )
        for await (const latestEvent of latestEvents) {
            if (latestEvent.kind !== eventKind.metadata) return;
            let profile = JSON.parse(latestEvent.content);
            if (!profile.image) {
                profile.image = profile.picture;
            }
            // convert latestEvent.id from hex to npub
            const npub = nip19.npubEncode(latestEvent.pubkey);
            profile.npub = npub;
            profile.pubkey = latestEvent.pubkey;
            if (!profile.display_name) {
                profile.display_name = profile.displayName;
            }
            if (!profile.display_name) {
                profile.display_name = profile.name;
            }
            // loop through profile values and sanitize them
            for (const [key, value] of Object.entries(profile)) {
                // remove malformed strings from values
                if (typeof value === 'string' && (key === 'image' || key === 'picture' || key === 'banner' || key === 'display_name' || key === 'displayName')) {
                    profile[key] = encodeURI(value);
                }
            }

            this.authorMetaData[latestEvent.pubkey] = profile;
            // hit cache
            console.log('HIT AUTHORS CACHE UPDATE', profile);
            this.$wire.call('updateNpubsCache', profile);
        }
    },

    async parseContent(event) {
        return await parseEventContent(event.content, event.id, this);
    },

    async getReactions(events) {
        if (this.$store.ndk.user) {
            console.log('connected to getReactions');
            // if events is an array
            if (events.length > 0) {
                const eventIds = events.map((event) => event.id);
                const fetcher = NostrFetcher.withCustomPool(ndkAdapter(this.$store.ndk.ndk));
                const reactionEvents = await fetcher.allEventsIterator(
                    this.$store.ndk.validatedRelays,
                    {kinds: [eventKind.reaction, eventKind.zap, eventKind.repost], '#e': eventIds,},
                    {},
                );
                for await (const ev of reactionEvents) {
                    const reactedToEvent = ev.tags.find((tag) => tag[0] === 'e')[1];
                    if (!this.events[reactedToEvent]) {
                        continue;
                    }
                    switch (ev.kind) {
                        case 6:
                            if (!this.events[reactedToEvent].reactionRepostsData) {
                                this.events[reactedToEvent].reactionRepostsData = [];
                            }
                            if (!this.events[reactedToEvent].reactionRepostsData.find((e) => e.id === ev.id)) {
                                if (!this.events[reactedToEvent].reposts) {
                                    this.events[reactedToEvent].reposts = 0;
                                }
                                this.events[reactedToEvent].reposts += 1;
                                this.events[reactedToEvent].reactionRepostsData.push(ev);
                            }
                            break;
                        case 7:
                            if (!this.events[reactedToEvent].reacted) {
                                this.events[reactedToEvent].reacted = ev.pubkey === this.$store.ndk.user.hexpubkey();
                            }
                            if (!ev.content.includes('"kind":1')) {
                                if (!this.events[reactedToEvent].reactions) {
                                    this.events[reactedToEvent].reactions = 0;
                                }
                                if (!this.events[reactedToEvent].reactionEventsData) {
                                    this.events[reactedToEvent].reactionEventsData = [];
                                }
                                if (!this.events[reactedToEvent].reactionEventsData.find((e) => e.id === ev.id)) {
                                    this.events[reactedToEvent].reactions += 1;
                                    this.events[reactedToEvent].reactionEventsData.push(ev);
                                }
                            }
                            break;
                        case 9735: {
                            const bolt11 = ev.tags.find((tag) => tag[0] === 'bolt11')[1];
                            if (bolt11) {
                                const decoded = decode(bolt11);
                                const amount = decoded.sections.find((item) => item.name === 'amount');
                                const sats = amount.value / 1000;
                                ev.indexId = 'zap_' + ev.id;
                                ev.amount = sats;
                                ev.senderPubkey = JSON.parse(ev.tags.find((tag) => tag[0] === 'description')[1]).pubkey;
                                if (!this.events[reactedToEvent].reactionZapsData) {
                                    this.events[reactedToEvent].reactionZapsData = [];
                                }
                                if (!this.events[reactedToEvent].reactionZapsData.find((e) => e.id === ev.id)) {
                                    if (!this.events[reactedToEvent].zaps) {
                                        this.events[reactedToEvent].zaps = 0;
                                    }
                                    this.events[reactedToEvent].zaps += sats;
                                    this.events[reactedToEvent].reactionZapsData.push(ev);
                                }
                            }
                            break;
                        }
                        default:
                            break;
                    }
                }

                // todo: unique pubkeys from events
                //await this.getAuthorsMeta(pubkeys);
            } else {
                console.log('NO NEW REACTIONS', events.length);
            }
        }
    },

    async love(event, emoticon) {
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
        })
        setTimeout(async () => await this.getReactions([event]), 1000);
    },

    async zap(event) {
        if (!this.$store.ndk.ndk.signer) {
            this.$store.ndk.ndk.signer = this.$store.ndk.nip07signer;
        }
        const ndkEvent = new NDKEvent(this.$store.ndk.ndk, event);
        const res = await ndkEvent
            .zap(
                69000,
                'This is a test zap from my experimental nostr web client at https://einundzwanzigstr.codingarena.de'
            );
        console.log(res, decode(res), window.webln);
        await requestProvider();
        const payment = await window.webln.sendPayment(res);
        console.log(payment);
        await this.jsConfetti.addConfetti({
            emojis: ['⚡'],
        });
        setTimeout(async () => await this.getReactions([event]), 5000);
    },

    async repost(event) {
        const ndkEvent = new NDKEvent(this.$store.ndk.ndk);
        ndkEvent.kind = eventKind.repost;
        ndkEvent.tags = [
            ['e', event.id, 'wss://relayable.org', 'root'],
            ['p', event.pubkey],
        ];
        await ndkEvent.publish();
        await this.jsConfetti.addConfetti({
            emojis: ['🤙',],
        });
        setTimeout(async () => await this.getReactions([event]), 1000);
    },

    checkNip05(nip05) {
        if (nip05) {
            // split nip05 into parts
            const nip05Parts = nip05.split('@');
            // check if nip05 has 2 parts
            if (nip05Parts.length !== 2) {
                console.log('nip05 is invalid');
                return;
            }
            // check if nip05 has a valid domain
            const nip05Domain = nip05Parts[1];
            if (!nip05Domain.includes('.')) {
                console.log('nip05 is invalid');
                return;
            }
            // construct nip05 check url
            const nip05CheckUrl = 'https://' + nip05Domain + '/.well-known/nostr.json';

            // check nostr nip05 with http fetch on .well-known/nostr.json and look for nip05
            fetch(nip05CheckUrl)
                .then((response) => response.json())
                .then((data) => {
                    if (data.names) {
                        // check if in data.names there is a name with the nip05
                        const nip05Name = nip05Parts[0];
                        return data.names.find((name) => name === nip05Name);
                    } else {
                        console.log(data);
                    }
                });
        }
    },

    async loadMore() {
        this.$store.ndk.hoursAgo += 24;
        console.log('>> NEW HOURS', this.$store.ndk.hoursAgo);
        await this.fetchEvents();
    }

});
