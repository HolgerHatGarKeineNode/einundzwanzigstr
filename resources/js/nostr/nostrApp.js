import NDK, {NDKEvent} from '@nostr-dev-kit/ndk';
import {eventKind, NostrFetcher} from 'nostr-fetch';
import {ndkAdapter} from '@nostr-fetch/adapter-ndk';
import {decode} from "light-bolt11-decoder";
import JSConfetti from 'js-confetti';
import {requestProvider} from "webln";
import {compactNumber} from "./utils/number.js";
import {parseEventContent} from "./parse/parseEventContent.js";
import {nip19} from "nostr-tools";
import {transformToHexpubs} from "./utils/transformToHexpubs.js";
import {filterReplies} from "./utils/filterReplies.js";
import {formatDate} from "./utils/formatDate.js";
import {debug, error, warn} from 'high-console';
import {nested} from "./utils/nested.js";
import defaultRelays from "./defaultRelays.js";

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

async function loadProfile() {
    await this.$store.ndk.nip07signer.user().then(async (user) => {
        if (!!user.npub) {
            // warn("Permission granted to read their public key:", user.npub);
            this.$store.ndk.user = this.$store.ndk.ndk.getUser({
                npub: user.npub,
            });
            await this.$store.ndk.user.fetchProfile();
            const relays = await this.$store.ndk.user.relayList();
            const relayArray = Array.from(relays)[0]?.tags ?? [];
            this.$wire.updateRelays(relayArray);
        }
    }).catch((error) => {
        this.rejected = true;
    });
}

async function initApp() {
    // set authorMetaData from cache
    this.authorMetaData = this.npubsCache;
    //debug('INIT AUTHOR METADATA FROM CACHE', Object.values(Alpine.raw(this.authorMetaData)));

    // init confetti
    this.jsConfetti = new JSConfetti();

    // verify relays
    let explicitRelayUrls = [];
    // pick second value from cachedRelays
    // if (this.cachedRelays.length > 0) {
    //     for (const relay of this.cachedRelays) {
    //         explicitRelayUrls.push(relay[1]);
    //     }
    // }
    explicitRelayUrls = await this.verifyRelays(defaultRelays);
    this.$store.ndk.validatedRelays = explicitRelayUrls;

    // init NDK
    const instance = new NDK({
        explicitRelayUrls: this.$store.ndk.validatedRelays,
        signer: this.$store.ndk.nip07signer,
        cacheAdapter: this.$store.ndk.dexieAdapter,
    });

    // connect to NDK
    try {
        await instance.connect(10000);
    } catch (error) {
        throw new Error('NDK instance init failed: ', error);
    }
    // store NDK instance in store
    this.$store.ndk.ndk = instance;

    // init nip07 signer and fetch profile
    await this.loadProfile();

    // check if isMyFeed is true
    if (this.isMyFeed) {
        // fetch follows of currentUser
        const follows = await this.$store.ndk.user.follows();
        // add npubs to currentNpubs
        this.currentNpubs = Array.from(follows).map((follow) => follow.npub);
        // set hoursAgo to 1
        this.$store.ndk.hoursAgo = 1;
        // set hoursStep to 1
        this.$store.ndk.hoursStep = 1;
    }

    // fetch events
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

    function scrollToTop() {
        if (
            document.body.scrollTop > 20 ||
            document.documentElement.scrollTop > 20
        ) {
            this.$refs.scrollToTop.classList.remove("hidden");
        } else {
            this.$refs.scrollToTop.classList.add("hidden");
        }
    }

    // scroll to top
    window.addEventListener("scroll", scrollToTop.call(this));
}

export default (livewireComponent) => ({

    // loading indicator
    loading: false,

    // mobile menu opened
    open: false,

    shouldPoll: livewireComponent.entangle('shouldPoll'),

    // isMyFeed switch
    isMyFeed: livewireComponent.entangle('isMyFeed'),

    // get cachedRelays
    cachedRelays: livewireComponent.entangle('cachedRelays'),

    // modals
    openCommentModal: false,
    openCreateNoteModal: false,
    openReactionModal: false,
    // current modal event
    currentEventToReact: null,
    openReactionPicker(event) {
        this.currentEventToReact = event;
        this.openReactionModal = true;
    },
    openCommentEditor(event) {
        this.currentEventToReact = event;
        this.openCommentModal = true;
    },

    // utils
    numberFormat(number) {
        return compactNumber.format(number);
    },
    formatDate(date) {
        return formatDate(date);
    },

    // if nip07 is rejected
    rejected: false,

    // confetti instance
    jsConfetti: null,

    // which npubs to fetch
    currentNpubs: livewireComponent.entangle('currentNpubs'),

    // cache
    eventsCache: livewireComponent.entangle('eventsCache'),
    npubsCache: livewireComponent.entangle('npubsCache'),
    usedMemory: livewireComponent.entangle('usedMemory'),

    // events to render
    events: [],
    // new events from poll
    newEvents: [],
    hasNewEvents: false,

    // holds all hexpubs from all authors we want to fetch
    authorHexpubs: [],
    // holds author metadata
    authorMetaData: {},

    // verify relays
    async verifyRelays(relays) {
        return await verifyRelays(relays);
    },

    // init app
    async init() {
        await initApp.call(this);

        // create poll function to check for new events
        const poll = async () => {
            await this.fetchEvents(true);
            warn('_______POLLING FOR NEW EVENTS_______');
            setTimeout(poll, 30000);
        }

        // start polling
        if (this.shouldPoll) {
            await poll();
        }
    },

    mergeNewEvents() {
        this.events = {...this.newEvents, ...this.events};
        this.newEvents = [];
        this.hasNewEvents = false;

        function scrollToTop() {
            if (
                document.body.scrollTop > 20 ||
                document.documentElement.scrollTop > 20
            ) {
                this.$refs.scrollToTop.classList.remove("hidden");
            } else {
                this.$refs.scrollToTop.classList.add("hidden");
            }
        }

        scrollToTop.call(this);
    },

    async loadProfile() {
        await loadProfile.call(this);
    },

    async fetchAllRepliesOfEvent(event) {
        // warn('connected to fetchAllRepliesOfEvents');
        const fetcher = NostrFetcher.withCustomPool(ndkAdapter(this.$store.ndk.ndk));
        return await fetcher.fetchAllEvents(
            this.$store.ndk.validatedRelays,
            {kinds: [eventKind.text], '#e': [event.id],},
            {},
            {sort: true}
        );
    },

    async fetchEvents(fromPoll) {
        // warn('>>> fetchEvents');
        if (!fromPoll) {
            document.querySelector("#loader").style.display = "block";
        }
        const nHoursAgo = (hrs) => Math.floor((Date.now() - hrs * 60 * 60 * 1000) / 1000);
        const fetcher = NostrFetcher.withCustomPool(ndkAdapter(this.$store.ndk.ndk));
        let hexpubs = transformToHexpubs.call(this);
        // push all hexpubs to authorHexpubs
        this.authorHexpubs.push(...hexpubs);
        // debug('???? SEARCH FOR HEXPUBS', hexpubs);
        // FILTER
        let fetchedEvents = await fetcher.fetchAllEvents(
            this.$store.ndk.validatedRelays,
            {kinds: [eventKind.text], authors: hexpubs},
            {since: nHoursAgo(this.$store.ndk.hoursAgo)},
            {sort: true}
        );
        // debug('UNTIL', this.formatDate(nHoursAgo(this.$store.ndk.hoursAgo)));
        //debug('FOUND EVENTS', fetchedEvents);
        // filter events that are replies or reposts
        fetchedEvents = filterReplies(fetchedEvents);
        // hit cache for events
        const eventsIds = fetchedEvents.map((ev) => ev.id);
        await this.$wire.getEventsByIds(eventsIds).then(result => {
            // debug('+++ HIT EVENTS CACHE', result);
            if (result > 0) {
                // warn('*** EVENTS AFTER HITTING CACHE', this.eventsCache);
            }
        });
        // debug('FILTERED EVENTS', fetchedEvents);

        // init events object
        if (fetchedEvents.length > 0) {
            for (const newEv of fetchedEvents) {

                // debug('????? SEARCH ON EVENTS CACHE', Alpine.raw(this.eventsCache[newEv.id] ?? {}));

                if (fromPoll) {
                    if (this.newEvents[newEv.id]) {
                        this.newEvents[newEv.id] = this.eventsCache[newEv.id];
                    }
                    if (!this.newEvents[newEv.id]) {
                        this.newEvents[newEv.id] = newEv;
                    }
                } else {
                    if (this.eventsCache[newEv.id]) {
                        this.events[newEv.id] = this.eventsCache[newEv.id];
                    }
                    if (!this.events[newEv.id]) {
                        this.events[newEv.id] = newEv;
                    }
                }
            }
        }
        // warn('NEW EVENTS OBJECT', Object.values(Alpine.raw(this.events)));

        // replies
        for (const event of fetchedEvents) {
            // fetch replies
            const replies = await this.fetchAllRepliesOfEvent(event);
            //debug('FOUND REPLIES', replies);
            const combinedEventWithReplies = [event, ...replies];
            //debug('combined', combinedEventWithReplies);
            const nestedReplies = nested(combinedEventWithReplies, [event.id], this.authorHexpubs);
            if (fromPoll) {
                this.newEvents[event.id].replies = Array.from(nestedReplies);
            } else {
                this.events[event.id].replies = Array.from(nestedReplies);
            }
        }

        // fetch authors metadata
        // filter this.authorHexpubs for unique values
        hexpubs = [...new Set(this.authorHexpubs)];
        //debug('hexpubs we want to fetch', hexpubs);
        await this.getAuthorsMeta(hexpubs);
        await this.getReactions(fetchedEvents);
        if (fromPoll) {
            // warn('+++ HIT EVENTS CACHE UPDATE FROM POLL', Object.values(Alpine.raw(this.newEvents)));
            this.$wire.updateEventCache(Object.values(Alpine.raw(this.newEvents)));
            // warn('<<< HIT CACHE WITH EVENT IDS', eventsIds);
            this.$wire.getEventsByIds(eventsIds).then(result => {
                // warn('--- NEW CACHE RESULT', result);
            });
            // check if there are new events by id, compare to this.events
            const newEventIds = Object.keys(this.newEvents);
            const oldEventIds = Object.keys(this.events);
            const diff = newEventIds.filter((x) => !oldEventIds.includes(x));
            if (diff.length > 0) {
                this.hasNewEvents = true;
            }
        } else {
            // hit the cache
            // warn('+++ HIT EVENTS CACHE UPDATE', Object.values(Alpine.raw(this.events)));
            this.$wire.updateEventCache(Object.values(Alpine.raw(this.events)));
            // warn('<<< HIT CACHE WITH EVENT IDS', eventsIds);
            this.$wire.getEventsByIds(eventsIds).then(result => {
                // warn('--- NEW CACHE RESULT', result);
            });
            document.querySelector("#loader").style.display = "none";
        }
        debug('AUTHORS', Object.values(Alpine.raw(this.authorMetaData)));
        debug('EVENTS', Object.values(Alpine.raw(this.events)));
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
            // debug('HIT AUTHORS CACHE UPDATE', profile);
            this.$wire.call('updateNpubsCache', profile);
        }
    },

    async parseContent(event) {
        return await parseEventContent(event.content, event.id, this);
    },

    async getReactions(events) {
        if (this.$store.ndk.user) {
            // warn('connected to getReactions');
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
                error('NO NEW REACTIONS', events.length);
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
        // debug(res, window.webln);
        await requestProvider();
        const payment = await window.webln.sendPayment(res);
        // debug(payment);
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
                // warn('nip05 is invalid');
                return;
            }
            // check if nip05 has a valid domain
            const nip05Domain = nip05Parts[1];
            if (!nip05Domain.includes('.')) {
                error('nip05 is invalid');
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
                        // debug(data);
                    }
                });
        }
    },

    async loadMore() {
        this.$store.ndk.hoursAgo += this.$store.ndk.hoursStep;
        // debug('>> NEW HOURS', this.$store.ndk.hoursAgo);
        await this.fetchEvents();
    }

});
