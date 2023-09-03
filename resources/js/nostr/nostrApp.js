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
            //const relays = await this.$store.ndk.user.relayList();
            //const relayArray = Array.from(relays)[0]?.tags ?? [];
            //this.$wire.updateRelays(relayArray);
        }
    }).catch((error) => {
        this.rejected = true;
    });
}

async function initApp() {

    // set currentFeedAuthor
    if (this.isCustomFeed) {
        // get last part of current path
        // get hexpub from currentNpub
        const currentHexpub = nip19.decode(this.currentNpubs[0]).data;
        await this.getAuthorsMeta([currentHexpub]);
        this.currentFeedAuthor = currentHexpub;
    }

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
    //await this.fetchEvents(true);

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

    // scroll to top
    const that = this;
    window.addEventListener("scroll", function () {
        if (
            document.body.scrollTop > 20 ||
            document.documentElement.scrollTop > 20
        ) {
            that.$refs.scrollToTop.classList.remove("hidden");
        } else {
            that.$refs.scrollToTop.classList.add("hidden");
        }
    });
}

export default (livewireComponent) => ({

    // loading indicator
    loading: false,

    // mobile menu opened
    open: false,

    shouldPoll: livewireComponent.entangle('shouldPoll'),

    // isMyFeed switch
    isMyFeed: livewireComponent.entangle('isMyFeed'),
    // isCustomFeed switch
    isCustomFeed: livewireComponent.entangle('isCustomFeed'),

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
    renderedContentCache: livewireComponent.entangle('renderedContentCache'),
    replies: {},
    repliesCache: livewireComponent.entangle('repliesCache'),
    reactionsCache: livewireComponent.entangle('reactionsCache'),
    eventsCache: livewireComponent.entangle('eventsCache'),
    npubsCache: livewireComponent.entangle('npubsCache'),
    usedMemory: livewireComponent.entangle('usedMemory'),

    // events to render
    events: [],
    renderedEvents: [],
    // new events from poll
    newEvents: [],
    hasNewEvents: false,

    // holds all hexpubs from all authors we want to fetch
    authorHexpubs: [],
    // holds author metadata
    authorMetaData: {},
    currentFeedAuthor: null,

    // verify relays
    async verifyRelays(relays) {
        return await verifyRelays(relays);
    },

    // init app
    async init() {
        await initApp.call(this);

        // create poll function to check for new events
        const poll = async () => {
            //await this.fetchEvents(true);
            warn('_______POLLING FOR NEW EVENTS_______');
            setTimeout(poll, 60000);
        }

        // start polling
        if (this.shouldPoll) {
            // wait 1 minute before polling
            setTimeout(poll, 60000);
        }
    },

    mergeNewEvents() {
        this.events = {...this.newEvents, ...this.events};
        this.newEvents = [];
        this.hasNewEvents = false;

        // scroll to top
        window.scrollTo(0, 0, {behavior: 'smooth'});
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

        // init events object
        if (fetchedEvents.length > 0) {
            for (const newEv of fetchedEvents) {
                // render content
                await this.parseContent(newEv);
            }
        }
        // warn('NEW EVENTS OBJECT', Object.values(Alpine.raw(this.events)));

        // replies
        for (const event of fetchedEvents) {
            // fetch replies
            const replies = await this.fetchAllRepliesOfEvent(event);
            // loop through replies and push hexpubs to authorHexpubs
            for (const reply of replies) {
                this.authorHexpubs.push(reply.pubkey);
            }
            //debug('FOUND REPLIES', replies);
            const combinedEventWithReplies = [event, ...replies];
            //debug('combined', combinedEventWithReplies);
            const nestedReplies = nested(combinedEventWithReplies, [event.id], this.authorHexpubs);
            this.repliesCache[event.id] = Array.from(nestedReplies);
        }

        // fetch authors metadata
        // filter this.authorHexpubs for unique values
        hexpubs = [...new Set(this.authorHexpubs)];
        //debug('hexpubs we want to fetch', hexpubs);
        await this.getAuthorsMeta(Array.from(hexpubs));
        await this.getReactions(fetchedEvents);
        if (fromPoll) {
            const newEventIds = Object.keys(this.newEvents);
            const oldEventIds = Object.keys(this.events);
            const diff = newEventIds.filter((x) => !oldEventIds.includes(x));
            if (diff.length > 0) {
                this.hasNewEvents = true;
            }
        } else {
            // // hit the cache
            // // warn('+++ HIT EVENTS CACHE UPDATE', Object.values(Alpine.raw(this.events)));
            // this.$wire.updateEventCache(Object.values(Alpine.raw(this.events)));
            // console.log(this.reactionsCache);
            // //this.$wire.updateReactionsCache(Object.values(Alpine.raw(this.reactionsCache)));
            // // map repliesCache to array and key by event.id
            // let repliesCache = [];
            // for (const [key, value] of Object.entries(this.repliesCache)) {
            //     repliesCache.push({
            //         id: key,
            //         replies: Object.values(Alpine.raw(value)),
            //     });
            // }
            // this.$wire.updateRepliesCache(Object.values(Alpine.raw(repliesCache)));
            // let renderedContentCache = [];
            // for (const [key, value] of Object.entries(this.renderedContentCache)) {
            //     renderedContentCache.push({
            //         id: key,
            //         content: value,
            //     });
            // }
            // this.$wire.updateRenderedContentCache(Object.values(Alpine.raw(renderedContentCache)));
            // let reactionsCache = [];
            // for (const [key, value] of Object.entries(this.reactionsCache)) {
            //     reactionsCache.push({
            //         id: key,
            //         reactions: value,
            //     });
            // }
            // this.$wire.updateReactionsCache(Object.values(Alpine.raw(reactionsCache)));
            // // warn('<<< HIT CACHE WITH EVENT IDS', eventsIds);
            // this.$wire.getEventsByIds(eventsIds).then(result => {
            //     // warn('--- NEW CACHE RESULT', result);
            // });
            // document.querySelector("#loader").style.display = "none";
        }
        debug('AUTHOR META DATA', Alpine.raw(this.authorMetaData));
        debug('EVENTS CACHE', Alpine.raw(this.eventsCache));
        debug('REACTIONS CACHE', Alpine.raw(this.reactionsCache));
        debug('RENDERED CONTENT CACHE', Alpine.raw(this.renderedContentCache));
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
        // if (!this.renderedContentCache[event.id]) {
        //     this.renderedContentCache[event.id] = await parseEventContent(event.content, event.id, this);
        // }
    },

    async getReactions(events) {
        if (this.$store.ndk.user) {
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
                    if (!this.reactionsCache[reactedToEvent]) {
                        this.reactionsCache[reactedToEvent] = {
                            id: reactedToEvent,
                        };
                    }
                    switch (ev.kind) {
                        case 6:
                            if (!this.reactionsCache[reactedToEvent].reactionRepostsData) {
                                this.reactionsCache[reactedToEvent].reactionRepostsData = [];
                            }
                            if (!this.reactionsCache[reactedToEvent].reactionRepostsData.find((e) => e.id === ev.id)) {
                                if (!this.reactionsCache[reactedToEvent].reposts) {
                                    this.reactionsCache[reactedToEvent].reposts = 0;
                                }
                                this.reactionsCache[reactedToEvent].reposts += 1;
                                this.reactionsCache[reactedToEvent].reactionRepostsData.push(ev);
                            }
                            break;
                        case 7:
                            if (!this.reactionsCache[reactedToEvent].reacted) {
                                this.reactionsCache[reactedToEvent].reacted = ev.pubkey === this.$store.ndk.user.hexpubkey();
                            }
                            if (!ev.content.includes('"kind":1')) {
                                if (!this.reactionsCache[reactedToEvent].reactions) {
                                    this.reactionsCache[reactedToEvent].reactions = 0;
                                }
                                if (!this.reactionsCache[reactedToEvent].reactionEventsData) {
                                    this.reactionsCache[reactedToEvent].reactionEventsData = [];
                                }
                                if (!this.reactionsCache[reactedToEvent].reactionEventsData.find((e) => e.id === ev.id)) {
                                    this.reactionsCache[reactedToEvent].reactions += 1;
                                    this.reactionsCache[reactedToEvent].reactionEventsData.push(ev);
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
                                if (!this.reactionsCache[reactedToEvent].reactionZapsData) {
                                    this.reactionsCache[reactedToEvent].reactionZapsData = [];
                                }
                                if (!this.reactionsCache[reactedToEvent].reactionZapsData.find((e) => e.id === ev.id)) {
                                    if (!this.reactionsCache[reactedToEvent].zaps) {
                                        this.reactionsCache[reactedToEvent].zaps = 0;
                                    }
                                    this.reactionsCache[reactedToEvent].zaps += sats;
                                    this.reactionsCache[reactedToEvent].reactionZapsData.push(ev);
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

    async follow() {
        await this.jsConfetti.addConfetti({
            emojis: ['🛠️',],
        });
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
        //await this.fetchEvents();
    }

});
