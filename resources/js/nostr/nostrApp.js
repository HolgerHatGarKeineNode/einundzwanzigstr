import NDK, {NDKEvent} from '@nostr-dev-kit/ndk';
import {eventKind, NostrFetcher} from 'nostr-fetch';
import {ndkAdapter} from '@nostr-fetch/adapter-ndk';
import defaultRelays from "./defaultRelays.js";
import {decode} from "light-bolt11-decoder";
import JSConfetti from 'js-confetti';
import {requestProvider} from "webln";
import {compactNumber} from "./utils/number.js";

export default (livewireComponent) => ({

    numberFormat(number) {
        return compactNumber.format(number);
    },

    formatDate(date) {
        // human readable age from timestamp in multiple formates (seconds, minutes, hours, days, weeks, months, years)
        const time = Math.floor((Date.now() - date * 1000) / 1000);
        if (time < 60) {
            return time + 's';
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

    open: false,

    jsConfetti: null,

    currentNpubs: livewireComponent.entangle('currentNpubs'),

    events: [],
    eventsReplies: {},

    authorMetaData: {},

    currentTab: 'reactions',

    tabs: [
        {
            name: 'reactions',
            label: 'Reactions',
        },
        {
            name: 'zaps',
            label: 'Zaps',
        },
        {
            name: 'reposts',
            label: 'Reposts',
        },
    ],

    switchTab(tab) {
        this.currentTab = tab;
    },

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
            events.forEach((event) => {
                const tags = event.tags.filter((el) => el[0] === 'e' && el[1] !== event.id);
                if (tags.length > 0) {
                    tags.forEach((tag) => {
                        const rootIndex = events.findIndex((el) => el.id === tag[1]);
                        if (rootIndex !== -1) {
                            const rootEvent = events[rootIndex];
                            if (rootEvent && rootEvent.replies) {
                                rootEvent.replies.push(event);
                            } else {
                                rootEvent.replies = [event];
                            }
                            replies.add(event.id);
                        }
                    });
                }
            });
            this.eventsReplies[event.id] = events.filter((ev) => !replies.has(ev.id));
            // unique pubkeys from events
            const authorIds = [...new Set(this.eventsReplies[event.id].map((ev) => ev.pubkey))];
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
        this.events = await fetcher.fetchLatestEvents(
            this.$store.ndk.validatedRelays,
            {kinds: [eventKind.text], authors: hexpubs},
            25,
        );
        // find children of events
        for (const event of this.events) {
            if (event.tags.find((el) => el[3] === 'reply')?.[1]) {
                // remove current event from this.events
                const index = this.events.indexOf(event);
                if (index > -1) {
                    this.events.splice(index, 1);
                }
            } else {
                await this.fetchAllRepliesOfEvent(event);
            }
        }
        // unique pubkeys from events
        const authorIds = [...new Set(this.events.map((event) => event.pubkey))];
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
        await this.getReactions(this.events);
    },

    async getAuthorsMeta(authorIds) {
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
            if (!profile.display_name) {
                profile.display_name = profile.displayName;
            }
            if (!profile.display_name) {
                profile.display_name = profile.name;
            }
            this.authorMetaData[latestEvent.pubkey] = profile;
        }
        console.log(this.authorMetaData);
    },

    parseContent(event) {
        let content = event.content;

        // replace \n with <br>
        content = event.content.replace(/\n/g, ' <br> ');

        // replace all images with img tags
        content = content.replace(/(https?:\/\/[^\s]+(\.jpg|\.jpeg|\.png|\.gif|\.webp))/g, '<div class="max-w-sm py-2"><a target="_blank" href="$1"><img class="aspect-[3/2] w-full rounded-2xl object-cover" src="$1" /></a></div>');

        // replace all YouTube links with embedded videos
        content = content.replace(/(https?:\/\/[^\s]+(\.youtube\.com\/watch\?v=|\.youtu\.be\/))([^\s]+)/g, '<div class="aspect-w-16 aspect-h-9 py-2"><iframe src="https://www.youtube.com/embed/$3" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>');

        // replace video links with embedded videos
        content = content.replace(/(https?:\/\/[^\s]+(\.mp4|\.webm|\.ogg))/g, '<div class="aspect-w-16 aspect-h-9 py-2"><video controls><source src="$1" type="video/mp4"></video></div>');

        return content;
    },

    async getReactions(events) {
        if (this.$store.ndk.user) {
            console.log('connected to getReactions');
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
            for (const authorId of pubkeys) {
                if (this.authorMetaData[authorId]) {
                    const index = pubkeys.indexOf(authorId);
                    if (index > -1) {
                        pubkeys.splice(index, 1);
                    }
                }
            }
            await this.getAuthorsMeta(pubkeys);
        }
    },

    async love(event) {
        // react to event
        const ndkEvent = new NDKEvent(this.$store.ndk.ndk);
        ndkEvent.content = '❤️';
        ndkEvent.kind = eventKind.reaction;
        ndkEvent.tags = [
            ['e', event.id],
            ['p', event.pubkey],
        ];
        await ndkEvent.publish();
        await this.jsConfetti.addConfetti({
            emojis: ['❤️',],
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
                'This is a test zap from my experimental Nostr app on https://einundzwanzigstr.codingarena.de'
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

    async comment(event) {
        await this.jsConfetti.addConfetti({
            emojiSize: 100,
            emojis: ['🛠️',],
        });
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
    }

});
