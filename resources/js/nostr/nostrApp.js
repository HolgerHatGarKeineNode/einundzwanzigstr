import NDK, {NDKEvent} from '@nostr-dev-kit/ndk';
import {eventKind, NostrFetcher} from 'nostr-fetch';
import {ndkAdapter} from '@nostr-fetch/adapter-ndk';
import defaultRelays from "./defaultRelays.js";
import {decode} from "light-bolt11-decoder";
import JSConfetti from 'js-confetti';
import {requestProvider} from "webln";

export default (livewireComponent) => ({

    open: false,

    jsConfetti: null,

    currentNpubs: livewireComponent.entangle('currentNpubs'),

    events: [],
    authorMetaData: {},
    reactionMetaData: {},
    reactions: {},

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
        });
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
        const nHoursAgo = (hrs) => Math.floor((Date.now() - hrs * 60 * 60 * 1000) / 1000);
        this.events = await fetcher.fetchLatestEvents(
            this.$store.ndk.validatedRelays,
            {kinds: [eventKind.text], authors: hexpubs},
            10,
        );
        for (const ev of this.events) {
            await this.getAuthorMeta(ev);
        }
        await this.getReactions(this.events);
    },

    async getAuthorMeta(event) {
        if (!this.authorMetaData[event.pubkey]) {
            const fetcher = NostrFetcher.withCustomPool(ndkAdapter(this.$store.ndk.ndk));
            const latestEvents = await fetcher.fetchLatestEvents(
                this.$store.ndk.validatedRelays,
                {kinds: [eventKind.metadata], authors: [event.pubkey]},
                2,
            )
            for await (const latestEvent of latestEvents) {
                if (latestEvent.kind !== eventKind.metadata) return;
                let profile = JSON.parse(latestEvent.content);
                this.authorMetaData[event.pubkey] = JSON.parse(latestEvent.content);
            }
        }
    },

    parseContent(event) {
        let content = event.content;

        // replace \n with <br>
        content = event.content.replace(/\n/g, ' <br> ');

        // replace all images with img tags
        content = content.replace(/(https?:\/\/[^\s]+(\.jpg|\.jpeg|\.png|\.gif))/g, '<a target="_blank" href="$1"><div class="max-w-sm py-2"><img class="aspect-[3/2] w-full rounded-2xl object-cover" src="$1" /></div></a>');

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
                    console.log(ev);
                    continue;
                }
                switch (ev.kind) {
                    case 6:
                        if (!this.reactions.reposts) {
                            this.reactions.reposts = {};
                        }
                        if (!this.reactions.reposts[reactedToEvent]) {
                            this.reactions.reposts[reactedToEvent] = {
                                reposts: 0,
                            };
                        }
                        this.reactions.reposts[reactedToEvent].reposts += 1;
                        break;
                    case 7:
                        if (!this.reactions.reacted) {
                            this.reactions.reacted = {};
                        }
                        if (!this.reactions.reacted[reactedToEvent]) {
                            this.reactions.reacted[reactedToEvent] = {
                                reacted: false,
                            };
                        }
                        if (!this.reactions.reacted[reactedToEvent].reacted) {
                            this.reactions.reacted[reactedToEvent].reacted = ev.pubkey === this.$store.ndk.user.hexpubkey();
                        }
                        if (!this.reactions.reactions) {
                            this.reactions.reactions = {};
                        }
                        if (!this.reactions.reactions[reactedToEvent]) {
                            this.reactions.reactions[reactedToEvent] = {
                                reactions: 0,
                            };
                        }
                        this.reactions.reactions[reactedToEvent].reactions += 1;
                        if (!ev.content.includes('"kind":1')) {
                            if (!this.reactions.reactionEventsData) {
                                this.reactions.reactionEventsData = {};
                            }
                            if (!this.reactions.reactionEventsData[reactedToEvent]) {
                                this.reactions.reactionEventsData[reactedToEvent] = [];
                            }
                            this.reactions.reactionEventsData[reactedToEvent].push(ev);
                        }
                        break;
                    case 9735: {
                        const bolt11 = ev.tags.find((tag) => tag[0] === 'bolt11')[1];
                        if (bolt11) {
                            const decoded = decode(bolt11);
                            const amount = decoded.sections.find((item) => item.name === 'amount');
                            const sats = amount.value / 1000;
                            if (!this.reactions.zaps) {
                                this.reactions.zaps = {};
                            }
                            if (!this.reactions.zaps[reactedToEvent]) {
                                this.reactions.zaps[reactedToEvent] = {
                                    zaps: 0,
                                };
                            }
                            this.reactions.zaps[reactedToEvent].zaps += sats;
                        }
                        break;
                    }
                    default:
                        break;
                }
            }
            // if no reactions where found, set to empty object
            for (const ev of events){
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

            for (const ev in this.reactions.reactionEventsData) {
                for (const r of this.reactions.reactionEventsData[ev]) {
                    this.getReactionMetaData(r);
                }
            }
        }
    },

    async getReactionMetaData(event) {
        if (!this.reactionMetaData[event.id]) {
            const ndkUser = this.$store.ndk.ndk.getUser({
                hexpubkey: event.pubkey,
            });
            await ndkUser.fetchProfile();
            this.reactionMetaData[event.id] = ndkUser.profile;
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
        window.$wireui.notify({
            title: 'Success',
            description: 'You reacted to this event with ❤️',
            icon: 'success'
        });
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
        const res = await ndkEvent.zap(69000);
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
        window.$wireui.notify({
            title: 'Success',
            description: 'You reposted this event',
            icon: 'success'
        })
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
        if (tabName === 'reactions' && this.reactions[event.id]) {
            return this.reactions[event.id].reactions;
        }
        if (tabName === 'reposts' && this.reactions[event.id]) {
            return this.reactions[event.id].reposts;
        }
        if (tabName === 'zaps' && this.reactions[event.id]) {
            return this.reactions[event.id].zaps;
        }
    },

});
