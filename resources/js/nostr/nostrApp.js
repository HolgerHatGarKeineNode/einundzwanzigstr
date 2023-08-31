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

export default (livewireComponent) => ({

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

    currentNpubs:
        livewireComponent.entangle('currentNpubs'),
    limit:
        livewireComponent.entangle('limit'),

    oldEventsLength: 0,
    newEventsLength: 0,

    eventsCache: livewireComponent.entangle('eventsCache'),
    npubsCache: livewireComponent.entangle('npubsCache'),

    events: [],
    eventsReplies: {},

    authorMetaData: {},

    reactions: {
        reposts: {},
        reacted: {},
        reposted: {},
        reactions: {},
        zaps: {},
        reactionRepostsData: {},
        reactionEventsData: {},
        reactionZapsData: {},
    },

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

            const verifiedRelays = responses.map((res) => {
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

        Alpine.effect(async () => {
            if (this.$store.ndk.user) {
                await this.fetchEvents();
                this.oldEventsLength = this.events.length;
            }
        });
    },

    async loadProfile() {
        this.$store.ndk.nip07signer.user().then(async (user) => {
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
            this.eventsReplies[event.id] = events.filter((ev) => !replies.has(ev.id));
            // unique pubkeys from events
            const authorIds = [...new Set(this.eventsReplies[event.id].map((ev) => ev.pubkey))];
            // filter authorIds that are already in this.authorMetaData with filter method
            authorIds.filter((authorId) => !this.authorMetaData[authorId]);
            await this.getAuthorsMeta(authorIds);
            // loop through replies and find replies of replies
            for (const reply of this.eventsReplies[event.id]) {
                await this.fetchAllRepliesOfEvent(reply);
            }
        }
    },

    async fetchEvents() {
        console.log('connected to fetchEvents');
        const fetcher = NostrFetcher.withCustomPool(ndkAdapter(this.$store.ndk.ndk));
        let hexpubs = [];
        for (const npub of this.currentNpubs) {
            const user = this.$store.ndk.ndk.getUser({
                npub,
            });
            hexpubs.push(user.hexpubkey());
        }
        let fetchedEvents = await fetcher.fetchLatestEvents(
            this.$store.ndk.validatedRelays,
            {kinds: [eventKind.text], authors: hexpubs},
            this.$store.ndk.limit,
        );
        // find children of events
        for (const event of fetchedEvents) {
            if (
                event.tags?.[0]?.[0] === 'e' && !event.tags?.[0]?.[3]
                || event.tags.find((el) => el[3] === 'root')?.[1]
                || event.tags.find((el) => el[3] === 'reply')?.[1]
            ) {
                // we will remove event from fetchedEvents
                fetchedEvents = fetchedEvents.filter((el) => el.id !== event.id);
            } else {
                await this.fetchAllRepliesOfEvent(event);
            }
        }
        // unique pubkeys from events
        const authorIds = [...new Set(fetchedEvents.map((event) => event.pubkey))];
        // filter authorIds that are already in this.authorMetaData
        for (const authorId of authorIds) {
            if (this.authorMetaData[authorId]) {
                const index = authorIds.indexOf(authorId);
                if (index > -1) {
                    authorIds.splice(index, 1);
                }
            }
        }
        await this.getAuthorsMeta(authorIds);
        await this.getReactions(fetchedEvents);

        this.events = fetchedEvents;
        if (this.events.length === 0) {
            // load more events
            console.log('LOAD MORE');
            await this.loadMore();
        }
    },

    async getAuthorsMeta(authorIds) {
        // filter authorIds that are already in this.authorMetaData with filter function
        authorIds = authorIds.filter((authorId) => !this.authorMetaData[authorId]);
        console.log('fetched AUTHORS META', authorIds.length, authorIds);

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
            const npub = nip19.npubEncode(latestEvent.id);
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
                    if (!reactedToEvent) {
                        console.log('reactedToEvent not found', ev);
                        continue;
                    }
                    switch (ev.kind) {
                        case 6:
                            if (!this.reactions.reposts[reactedToEvent]) {
                                this.reactions.reposts[reactedToEvent] = {
                                    reposts: 0,
                                };
                            }
                            if (!this.reactions.reposted[reactedToEvent]) {
                                this.reactions.reposted[reactedToEvent] = {
                                    reposted: false,
                                };
                            }
                            if (!this.reactions.reposted[reactedToEvent].reposted) {
                                this.reactions.reposted[reactedToEvent].reposted = ev.pubkey === this.$store.ndk.user.hexpubkey();
                            }
                            if (!this.reactions.reactionRepostsData[reactedToEvent]) {
                                this.reactions.reactionRepostsData[reactedToEvent] = [];
                            }
                            if (!this.reactions.reactionRepostsData[reactedToEvent].find((e) => e.id === ev.id)) {
                                this.reactions.reposts[reactedToEvent].reposts += 1;
                                this.reactions.reactionRepostsData[reactedToEvent].push(ev);
                            }
                            break;
                        case 7:
                            if (!this.reactions.reacted[reactedToEvent]) {
                                this.reactions.reacted[reactedToEvent] = {
                                    reacted: false,
                                };
                            }
                            if (!this.reactions.reacted[reactedToEvent].reacted) {
                                this.reactions.reacted[reactedToEvent].reacted = ev.pubkey === this.$store.ndk.user.hexpubkey();
                            }
                            if (!this.reactions.reactions[reactedToEvent]) {
                                this.reactions.reactions[reactedToEvent] = {
                                    reactions: 0,
                                };
                            }
                            if (!ev.content.includes('"kind":1')) {
                                if (!this.reactions.reactionEventsData[reactedToEvent]) {
                                    this.reactions.reactionEventsData[reactedToEvent] = [];
                                }
                                if (!this.reactions.reactionEventsData[reactedToEvent].find((e) => e.id === ev.id)) {
                                    this.reactions.reactions[reactedToEvent].reactions += 1;
                                    this.reactions.reactionEventsData[reactedToEvent].push(ev);
                                }
                            }
                            break;
                        case 9735: {
                            const bolt11 = ev.tags.find((tag) => tag[0] === 'bolt11')[1];
                            if (bolt11) {
                                const decoded = decode(bolt11);
                                const amount = decoded.sections.find((item) => item.name === 'amount');
                                const sats = amount.value / 1000;
                                if (!this.reactions.zaps[reactedToEvent]) {
                                    this.reactions.zaps[reactedToEvent] = {
                                        zaps: 0,
                                    };
                                }
                                if (!this.reactions.reactionZapsData[reactedToEvent]) {
                                    this.reactions.reactionZapsData[reactedToEvent] = [];
                                }
                                ev.indexId = 'zap_' + ev.id;
                                ev.amount = sats;
                                ev.senderPubkey = JSON.parse(ev.tags.find((tag) => tag[0] === 'description')[1]).pubkey;
                                if (!this.reactions.reactionZapsData[reactedToEvent].find((e) => e.id === ev.id)) {
                                    this.reactions.zaps[reactedToEvent].zaps += sats;
                                    this.reactions.reactionZapsData[reactedToEvent].push(ev);
                                }
                            }
                            break;
                        }
                        default:
                            break;
                    }
                }
                // if no reactions where found, set to empty object
                for (const ev of events) {
                    if (!this.reactions.reposts) {
                        this.reactions.reposts = {};
                    }
                    if (!this.reactions.reactions) {
                        this.reactions.reactions = {};
                    }
                    if (!this.reactions.zaps) {
                        this.reactions.zaps = {};
                    }
                    if (!this.reactions.reacted) {
                        this.reactions.reacted = {};
                    }
                    if (!this.reactions.reposts[ev.id]) {
                        this.reactions.reposts[ev.id] = {
                            reposts: 0,
                        };
                    }
                    if (!this.reactions.reactions[ev.id]) {
                        this.reactions.reactions[ev.id] = {
                            reactions: 0,
                        };
                    }
                    if (!this.reactions.zaps[ev.id]) {
                        this.reactions.zaps[ev.id] = {
                            zaps: 0,
                        };
                    }
                    if (!this.reactions.reacted[ev.id]) {
                        this.reactions.reacted[ev.id] = {
                            reacted: false,
                        };
                    }
                }

                // collect unique pubkeys from reactionEventsData
                let pubkeys = [];
                for (const ev of Object.values(this.reactions.reactionEventsData)) {
                    for (const e of ev) {
                        if (!pubkeys.includes(e.pubkey)) {
                            pubkeys.push(e.pubkey);
                        }
                    }
                }
                // collect unique pubkeys from reactionZapsData
                for (const ev of Object.values(this.reactions.reactionZapsData)) {
                    for (const e of ev) {
                        // get pubkey from description pubkey
                        const pubkey = JSON.parse(e.tags.find((tag) => tag[0] === 'description')[1]).pubkey;
                        if (!pubkeys.includes(pubkey)) {
                            pubkeys.push(pubkey);
                        }
                    }
                }
                // collect unique pubkeys from reactionRepostsData
                for (const ev of Object.values(this.reactions.reactionRepostsData)) {
                    for (const e of ev) {
                        if (!pubkeys.includes(e.pubkey)) {
                            pubkeys.push(e.pubkey);
                        }
                    }
                }

                // filter pubkeys that are already in this.authorMetaData
                pubkeys = pubkeys.filter((pubkey) => !this.authorMetaData[pubkey]);
                await this.getAuthorsMeta(pubkeys);
            } else {
                console.log('NO ARRAY', events.length);
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

    getReactionCount(tabName, event) {
        if (tabName === 'reactions' && this.reactions.reactions && this.reactions.reactions[event.id]) {
            return this.numberFormat(this.reactions.reactions[event.id].reactions);
        }
        if (tabName === 'reposts' && this.reactions.reposts && this.reactions.reposts[event.id]) {
            return this.numberFormat(this.reactions.reposts[event.id].reposts);
        }
        if (tabName === 'zaps' && this.reactions.zaps && this.reactions.zaps[event.id]) {
            return this.numberFormat(this.reactions.zaps[event.id].zaps);
        }
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
                    console.log(data);
                    return true;
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
        this.$store.ndk.limit++;
        await this.fetchEvents();
        this.newEventsLength = this.events.length;
        if (this.newEventsLength === this.oldEventsLength) {
            await this.loadMore();
        }
    }

});
