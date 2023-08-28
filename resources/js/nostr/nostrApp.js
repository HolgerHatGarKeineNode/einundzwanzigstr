import NDK, {NDKEvent} from "@nostr-dev-kit/ndk";
import defaultRelays from "./defaultRelays.js";
import {Parser} from "simple-text-parser";
import {decode} from 'light-bolt11-decoder';
import {compactNumber} from "./utils/number.js";
import {requestProvider} from "webln";
import JSConfetti from 'js-confetti';

// this is a nostr application that uses the sdk from this GitHub repo https://github.com/nostr-dev-kit/ndk
export default () => ({

    open: false,
    jsConfetti: null,

    alreadyReactedData: {},

    init() {
        this.jsConfetti = new JSConfetti();

        this.$store.ndk.ndk = new NDK({
            cacheAdapter: this.$store.ndk.dexieAdapter,
            signer: this.$store.ndk.nip07signer,
            explicitRelayUrls: defaultRelays
        });

        const that = this;
        that.$store.ndk.ndk.connect().then(function () {
            console.log('NDK Connected');
            that.$store.ndk.nip07signer.user().then(async (user) => {
                if (!!user.npub) {
                    console.log('Permission granted to read their public key:', user.npub);
                    user.ndk = that.$store.ndk.ndk;
                    that.$store.ndk.user = user;
                    await that.$store.ndk.user.fetchProfile();
                }
            });
        });
    },

    async parseText(event) {
        const parser = new Parser();
        if (event === null) {
            console.log(event);
            return;
        }
        let content = event.content;

        parser.addRule(/\n/g, function (tag) {
            // Return the tag minus the `#` and surrond with html tags
            return `<br>`;
        });
        // images
        parser.addRule(/(https?:\/\/\S+(\.png|\.jpg|\.gif|\.webp))/g, function (tag) {
            return `<a target="_blank" href="${tag}"><div class="max-w-xl"><img class="w-full object-contain object-left" src="${tag}" /></div></a>`;
        });
        // youtube
        parser.addRule(/(youtu.be\/|youtube.com\/watch\?v=)([^&]+)/, function (tag) {
            return `<div><iframe width="560" height="315" src="https://www.youtube.com/embed/${tag.split('v=')[1]}" frameborder="0" allowfullscreen></iframe></div>`;
        });
        // video
        parser.addRule(/(https?:\/\/\S+(\.mp4|\.webm|\.ogg|\.mov))/g, function (tag) {
            return `<div><video style="max-width: 60%; max-height: 600px; height: auto;" controls src=${tag}></video></div>`;
        });
        // hashtags
        parser.addRule(/\#[\S]+/gi, function (tag) {
            // Return the tag minus the `#` and surrond with html tags
            return `<br>`;
        });

        return parser.render(content);
    },

    async loadSubEvents(event) {
        let subEvents = [];

        // find string starting with nostr:
        const regex = /nostr:[a-zA-Z0-9]+/g;
        const matches = event.content.match(regex);
        if (matches) {
            for (let i = 0; i < matches.length; i++) {
                const match = matches[i];
                const subEvent = await this.$store.ndk.ndk.fetchEvent(match.split('nostr:')[1]);
                if (subEvent) {
                    subEvents.push(subEvent);
                }
            }
        }

        return subEvents;
    },

    async loadEvent(event) {
        return this.parseText(await this.$store.ndk.ndk.fetchEvent(event.id));
    },

    async loadReactions(event) {
        let reactions = 0;
        let reposts = 0;
        let zaps = 0;

        const filter = {
            '#e': [event.id],
            kinds: [6, 7, 9735],
        };
        const awaitReactions = await this.$store.ndk.ndk.fetchEvents(filter);
        awaitReactions.forEach((event) => {
            switch (event.kind) {
                case 6:
                    reposts += 1;
                    break;
                case 7:
                    reactions += 1;
                    break;
                case 9735: {
                    const bolt11 = event.tags.find((tag) => tag[0] === 'bolt11')[1];
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
        });

        const alreadyReactedFilter = {
            '#e': [event.id],
            'p': [this.$store.ndk.user.hexpubkey()],
            kinds: [7],
        }
        const awaitAlreadyReacted = await this.$store.ndk.ndk.fetchEvents(alreadyReactedFilter);
        this.alreadyReactedData[event.id] = {};
        this.alreadyReactedData[event.id].reacted = awaitAlreadyReacted.size > 0;
        this.alreadyReactedData[event.id].reactions = compactNumber.format(reactions);
        this.alreadyReactedData[event.id].reposts = compactNumber.format(reposts);
        this.alreadyReactedData[event.id].zaps = compactNumber.format(zaps);
    },

    async love(event) {
        // react to event
        const ndkEvent = new NDKEvent(this.$store.ndk.ndk);
        ndkEvent.content = '❤️';
        ndkEvent.kind = 7;
        ndkEvent.tags = [
            ['e', event.id],
            ['p', event.pubkey],
        ];
        await ndkEvent.publish();
        window.$wireui.notify({
            title: 'Success',
            description: 'You reacted to this event with ❤️',
            icon: 'success'

        })
        setTimeout(() =>
            this.jsConfetti.addConfetti({
                emojis: ['❤️',],
            }), 1000);
        setTimeout(async () => await this.loadReactions(event), 1000)
    },

    async zap(event) {
        if (!this.$store.ndk.ndk.signer) {
            const signer = this.$store.ndk.nip07signer;
            this.$store.ndk.ndk.signer = signer;
        }
        const ndkEvent = new NDKEvent(this.$store.ndk.ndk, event);
        const res = await ndkEvent.zap(69000);
        console.log(res, decode(res), window.webln);
        await requestProvider();
        const payment = await window.webln.sendPayment(res);
        console.log(payment);
        setTimeout(() =>
            this.jsConfetti.addConfetti({
                emojis: ['🤙', '⚡'],
            }), 1000);
        setTimeout(async () => await this.loadReactions(event), 5000)
    },

    async repost(event) {
        const ndkEvent = new NDKEvent(this.$store.ndk.ndk);
        ndkEvent.kind = 6;
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
        setTimeout(() =>
            this.jsConfetti.addConfetti({
                emojis: ['🤙',],
            }), 1000);
        setTimeout(async () => await this.loadReactions(event), 1000)
    },

    comment(event) {
        this.jsConfetti.addConfetti({
            emojiSize: 100,
            emojis: ['🛠️',],
        });
    },

});
