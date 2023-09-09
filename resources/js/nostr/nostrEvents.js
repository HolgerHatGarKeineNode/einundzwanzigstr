import {ndkInstance} from "./ndk/instance.js";
import {nostrEvents} from "./ndk/events.js";
import {NDKEvent} from "@nostr-dev-kit/ndk";
import {eventKind} from "nostr-fetch";
import JSConfetti from "js-confetti";
import {requestProvider} from "webln";
import {editors} from "./utils/editors.js";
import {Picker} from "emoji-mart";
import data from "@emoji-mart/data";

export default (livewireComponent) => ({

    timeSteps: livewireComponent.entangle('timeSteps'),

    jsConfetti: null,

    commentValue: '',
    newNoteValue: '',

    pubkey: livewireComponent.entangle('pubkey'),
    loadNpubs: livewireComponent.entangle('loadNpubs'),
    isMyFeed: livewireComponent.entangle('isMyFeed'),
    hexpubkeys: livewireComponent.entangle('hexpubkeys', true),

    until: livewireComponent.entangle('until'),
    since: livewireComponent.entangle('since'),

    alreadyCachedEventIds: livewireComponent.entangle('alreadyCachedEventIds'),
    eventsLength: livewireComponent.entangle('eventsLength'),

    openReactionModal: false,
    openCommentModal: false,
    openCreateNoteModal: false,
    currentEventToReactId: false,

    async init() {
        console.log('~~~~ INIT nostrEvents ~~~~');
        console.log('#### pubkey ####', this.pubkey);
        console.log('#### until ####', this.until);
        console.log('#### since ####', this.since);

        editors(this).initEditors();

        // init confetti
        this.jsConfetti = new JSConfetti();

        await ndkInstance(this).init();

        if (this.isMyFeed) {
            const follows = await this.$store.ndk.user.follows();
            this.hexpubkeys = Array.from(follows).map((follow) => follow.hexpubkey);
        }
        if (this.pubkey) {
            const key = this.$store.ndk.ndk.getUser({npub: this.pubkey}).hexpubkey;
            this.hexpubkeys = [key];
        }
        if (this.loadNpubs.length > 0) {
            let hexpubkeys = [];
            for (const npub of this.loadNpubs) {
                hexpubkeys.push(this.$store.ndk.ndk.getUser({npub: npub.trim()}).hexpubkey);
            }
            this.hexpubkeys = hexpubkeys;
        }
        console.log('#### hexpubkeys ####', Alpine.raw(this.hexpubkeys));

        await this.$wire.call('loadCachedEvent');

        this.since = this.since + 1 // last until
        this.until = Math.floor(Date.now() / 1000); // now
        console.log('#### until ####', this.until);
        console.log('#### since ####', this.since);

        console.log('#### eventsLength ####', this.eventsLength);

        await nostrEvents(this).fetch(this.hexpubkeys, this.alreadyCachedEventIds);

        if (this.eventsLength < 1) {
            document.querySelector("#loader").style.display = "block";
            do {
                this.until = Math.floor(Date.now() / 1000); // now
                this.since = this.since - (this.timeSteps);
                console.log('#### until ####', this.until);
                console.log('#### since ####', this.since);
                await nostrEvents(this).fetch(this.hexpubkeys, this.alreadyCachedEventIds);
            } while (this.eventsLength < 1);
        }
        document.querySelector("#loader").style.display = "none";
    },

    async intersect() {
        if (this.eventsLength > 0) {
            console.log('~~~~ intersect ~~~~');
            await this.loadMore();
        }
    },

    async loadMore() {
        document.querySelector("#loader").style.display = "block";
        const oldLength = this.eventsLength;
        do {
            this.until = Math.floor(Date.now() / 1000); // now
            this.since = this.since - (this.timeSteps);
            await nostrEvents(this).fetch(this.hexpubkeys, this.alreadyCachedEventIds);
            console.log('#### oldLength ####', oldLength);
            console.log('#### this.eventsLength ####', this.eventsLength);
        } while (this.eventsLength <= oldLength)

        document.querySelector("#loader").style.display = "none";
    },

    openReactionPicker(id) {
        this.currentEventToReactId = id;

        if (this.openReactionModal) {
            // check if this.$refs['react_' + id] has a child
            // if so, remove it
            if (this.$refs['react_' + id].hasChildNodes()) {
                this.$refs['react_' + id].removeChild(this.$refs['react_' + id].childNodes[0]);
            }
            this.openReactionModal = false;
        } else {
            this.openReactionModal = true;

            console.log('~~~~ openReactionPicker ~~~~');
            console.log('#### event ####', id);

            const picker = new Picker({
                data,
                onEmojiSelect: async (emoji) => {
                    console.log('#### emoji ####', emoji);
                    this.$refs['react_' + id].removeChild(this.$refs['react_' + id].childNodes[0]);
                    this.openReactionModal = false;
                    await this.love(emoji.native);
                },
            });

            this.$refs['react_' + id].appendChild(picker);
        }
    },

    async openCommentEditor(id) {
        this.currentEventToReactId = id;
        this.openCommentModal = true;
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
        this.openReactionModal = false;
        await ndkEvent.publish();
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
        const event = await this.$store.ndk.ndk.fetchEvent(id);
        await event.repost();
        await this.jsConfetti.addConfetti({
            emojis: ['🤙',],
        });
        await this.$dispatch('reposted', event.id);
    },

    async comment() {
        console.log('~~~~ comment ~~~~');
        const event = await this.$store.ndk.ndk.fetchEvent(this.currentEventToReactId);
        console.log('#### event ####', event);
        console.log('#### commentValue ####', this.commentValue);
        const ndkEvent = new NDKEvent(this.$store.ndk.ndk);
        ndkEvent.content = this.commentValue;
        ndkEvent.kind = eventKind.text;
        let tags = [];
        tags.push(['e', event.id, '', 'reply']);
        tags.push(['p', event.pubkey]);
        ndkEvent.tags = tags;
        this.commentValue = '';
        this.openCommentModal = false;
        await ndkEvent.publish();
        await this.jsConfetti.addConfetti({
            emojiSize: 100,
            emojis: ['🗣️',],
        });
        await this.$dispatch('replied', event.id);
    },

    async createNote() {
        console.log('~~~~ createNote ~~~~');
        const ndkEvent = new NDKEvent(this.$store.ndk.ndk);
        ndkEvent.kind = eventKind.text;
        ndkEvent.content = this.newNoteValue;
        this.newNoteValue = '';
        this.openCreateNoteModal = false;
        await ndkEvent.publish();
        await this.jsConfetti.addConfetti({
            emojiSize: 100,
            emojis: ['📣',],
        });
        this.until = Math.floor(Date.now() / 1000); // now
        console.log('#### until ####', this.until);
        console.log('#### since ####', this.since);
        await nostrEvents(this).fetch(this.hexpubkeys, this.alreadyCachedEventIds);
    },

    async debug(id) {
        const event = await this.$store.ndk.ndk.fetchEvent(id);
        console.log('event', event);
    },

});
