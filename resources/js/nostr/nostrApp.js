import NDK, {NDKEvent} from '@nostr-dev-kit/ndk';
import {eventKind, normalizeRelayUrlSet, NostrFetcher} from 'nostr-fetch';
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
    reactions: {},

    async init() {
        this.jsConfetti = new JSConfetti();

        const nHoursAgo = (hrs) => Math.floor((Date.now() - hrs * 60 * 60 * 1000) / 1000);
        const explicitRelays = normalizeRelayUrlSet(defaultRelays);
        this.$store.ndk.ndk = new NDK({
            explicitRelayUrls: explicitRelays,
            signer: this.$store.ndk.nip07signer,
            cacheAdapter: this.$store.ndk.dexieAdapter,
        });
        await this.$store.ndk.ndk.connect();
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
        this.events = await fetcher.fetchAllEvents(
            normalizeRelayUrlSet(defaultRelays),
            {kinds: [eventKind.text], authors: hexpubs},
            {since: nHoursAgo(24)},
            {sort: true}
        );
        for (const ev of this.events) {
            await this.getAuthorMeta(ev);
        }
    },

    async getAuthorMeta(event) {
        if (!this.authorMetaData[event.pubkey]) {
            const fetcher = NostrFetcher.withCustomPool(ndkAdapter(this.$store.ndk.ndk));
            const latestEvent = await fetcher.fetchLastEvent(
                normalizeRelayUrlSet(defaultRelays),
                {kinds: [eventKind.metadata], authors: [event.pubkey]},
                {sort: true}
            )
            let profile = JSON.parse(latestEvent.content);
            console.log(profile);
            this.authorMetaData[event.pubkey] = JSON.parse(latestEvent.content);
        }
    },

    parseContent(event) {
        let content = event.content;
        // replace \n with <br>
        content = event.content.replace(/\n/g, '<br>');
        // replace all images with img tags
        content = content.replace(/(https?:\/\/[^\s]+(\.jpg|\.jpeg|\.png|\.gif))/g, '<a target="_blank" href="$1"><div class="max-w-sm py-2"><img class="aspect-[3/2] w-full rounded-2xl object-cover" src="$1" /></div></a>');

        // replace all YouTube links with embedded videos
        content = content.replace(/(https?:\/\/[^\s]+(\.youtube\.com\/watch\?v=|\.youtu\.be\/))([^\s]+)/g, '<div class="aspect-w-16 aspect-h-9 py-2"><iframe src="https://www.youtube.com/embed/$3" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>');

        // replace video links with embedded videos
        content = content.replace(/(https?:\/\/[^\s]+(\.mp4|\.webm|\.ogg))/g, '<div class="aspect-w-16 aspect-h-9 py-2"><video controls><source src="$1" type="video/mp4"></video></div>');

        return content;
    },

    async getReactions(event) {
        if (this.$store.ndk.user) {
            console.log('connected to getReactions');
            const fetcher = NostrFetcher.withCustomPool(ndkAdapter(this.$store.ndk.ndk));
            const reactionEvents = await fetcher.allEventsIterator(
                normalizeRelayUrlSet(defaultRelays),
                {kinds: [eventKind.reaction, eventKind.zap, eventKind.repost], '#e': [event.id],},
                {},
            );
            let reactionEventsData = [];
            let reacted = false;
            let reactions = 0;
            let reposts = 0;
            let zaps = 0;
            for await (const ev of reactionEvents) {
                switch (ev.kind) {
                    case 6:
                        reposts += 1;
                        break;
                    case 7:
                        if (!reacted) {
                            reacted = ev.pubkey === this.$store.ndk.user.hexpubkey();
                        }
                        reactions += 1;
                        if (!ev.content.includes('"kind":1')) {
                            reactionEventsData.push(ev);
                        }
                        break;
                    case 9735: {
                        const bolt11 = ev.tags.find((tag) => tag[0] === 'bolt11')[1];
                        if (bolt11) {
                            const decoded = decode(bolt11);
                            const amount = decoded.sections.find((item) => item.name === 'amount');
                            const sats = amount.value / 1000;
                            zaps += sats;
                        }
                        break;
                    }
                    default:
                        break;
                }
            }
            this.reactions[event.id] = {
                reacted,
                reactions,
                reposts,
                zaps,
                reactionEventsData,
            };
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
        setTimeout(async () => await this.getReactions(event), 1000);
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
        setTimeout(async () => await this.getReactions(event), 5000);
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
        setTimeout(async () => await this.getReactions(event), 1000);
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
