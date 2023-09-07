import {ndkInstance} from "./ndk/instance.js";
import {nostrEvents} from "./ndk/events.js";
import {NDKEvent} from "@nostr-dev-kit/ndk";
import {eventKind} from "nostr-fetch";
import JSConfetti from "js-confetti";
import {requestProvider} from "webln";

export default (livewireComponent) => ({

    timeSteps: livewireComponent.entangle('timeSteps'),

    jsConfetti: null,

    pubkey: livewireComponent.entangle('pubkey'),
    isMyFeed: livewireComponent.entangle('isMyFeed'),
    hexpubkeys: livewireComponent.entangle('hexpubkeys', true),

    until: livewireComponent.entangle('until'),
    since: livewireComponent.entangle('since'),

    eventsLength: livewireComponent.entangle('eventsLength'),

    openReactionModal: false,
    currentEventToReactId: false,

    async init() {
        console.log('~~~~ INIT nostrEvents ~~~~');
        console.log('#### pubkey ####', this.pubkey);
        console.log('#### until ####', this.until);
        console.log('#### since ####', this.since);

        // init confetti
        this.jsConfetti = new JSConfetti();

        await ndkInstance(this).init();

        if (this.isMyFeed) {
            const follows = await this.$store.ndk.user.follows();
            this.hexpubkeys = Array.from(follows).map((follow) => follow.hexpubkey());
        }
        if (this.pubkey) {
            this.hexpubkeys = [this.$store.ndk.ndk.getUser({npub: this.pubkey}).hexpubkey()];
        }
        console.log('#### hexpubkeys ####', Alpine.raw(this.hexpubkeys));

        await this.$wire.call('loadCachedEvent');

        this.since = this.since + 1 // last until
        this.until = Math.floor(Date.now() / 1000); // now
        console.log('#### until ####', this.until);
        console.log('#### since ####', this.since);

        console.log('#### eventsLength ####', this.eventsLength);

        await nostrEvents(this).fetch(this.hexpubkeys);
        if (this.eventsLength < 1) {
            do {
                this.until = Math.floor(Date.now() / 1000); // now
                this.since = this.since - (this.timeSteps);
                console.log('#### until ####', this.until);
                console.log('#### since ####', this.since);
                await nostrEvents(this).fetch(this.hexpubkeys);
            } while (this.eventsLength < 1);
        }
    },

    async loadMore() {
        const oldLength = this.eventsLength;
        do {
            this.until = Math.floor(Date.now() / 1000); // now
            this.since = this.since - (this.timeSteps);
            await nostrEvents(this).fetch(this.hexpubkeys);
            console.log('#### oldLength ####', oldLength);
            console.log('#### this.eventsLength ####', this.eventsLength);
        } while (this.eventsLength <= oldLength)
    },

    openReactionPicker(id) {
        console.log('~~~~ openReactionPicker ~~~~');
        console.log('#### event ####', id);
        this.currentEventToReactId = id;
        this.openReactionModal = true;
    },

    async openCommentEditor(id) {
        await this.jsConfetti.addConfetti({
            emojis: ['🛠️',],
        });
    },

    async love(emoji) {
        console.log('~~~~ love ~~~~');
        console.log('#### emoji ####', emoji);
        console.log('#### currentEventToReactId ####', this.currentEventToReactId);
        const event = await this.$store.ndk.ndk.fetchEvent(this.currentEventToReactId);
        const ndkEvent = new NDKEvent(this.$store.ndk.ndk);
        ndkEvent.content = emoji;
        ndkEvent.kind = eventKind.reaction;
        ndkEvent.tags = [
            ['e', event.id],
            ['p', event.pubkey],
        ];
        await ndkEvent.publish();
        this.openReactionModal = false;
        await this.jsConfetti.addConfetti({
            emojis: [emoji,],
        });
        await this.$dispatch('loved', event.id);
    },

    async zap(id) {
        console.log('~~~~ zap ~~~~');
        console.log('#### id ####', id);
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
        await this.jsConfetti.addConfetti({
            emojis: ['⚡'],
        });
        // wait 2 seconds to give the zap time to propagate
        setTimeout(async () => {
            await this.$dispatch('zapped', event.id);
        }, 2000);
    },

    async repost(id) {
        console.log('~~~~ repost ~~~~');
        console.log('#### id ####', id);
        await this.jsConfetti.addConfetti({
            emojis: ['🛠️',],
        });
        return;
        const event = await this.$store.ndk.ndk.fetchEvent(id);
        const ndkEvent = new NDKEvent(this.$store.ndk.ndk, event);
        ndkEvent.kind = eventKind.repost;
        ndkEvent.tags = [
            ['e', event.id, 'wss://nostr.einundzwanzig.space', 'root'],
            ['p', event.pubkey],
        ];
        await ndkEvent.publish();
        await this.jsConfetti.addConfetti({
            emojis: ['🤙',],
        });
        await this.$dispatch('reposted', event.id);
    },

    async debug(id) {
        const event = await this.$store.ndk.ndk.fetchEvent(id);
        console.log('event', event);
    },

});
