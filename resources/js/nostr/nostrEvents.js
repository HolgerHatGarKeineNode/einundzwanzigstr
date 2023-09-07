import {ndkInstance} from "./ndk/instance.js";
import {nostrEvents} from "./ndk/events.js";
import {NDKEvent} from "@nostr-dev-kit/ndk";
import {eventKind} from "nostr-fetch";
import JSConfetti from "js-confetti";
import {requestProvider} from "webln";

export default (livewireComponent) => ({

    timeSteps: livewireComponent.entangle('timeSteps'),

    jsConfetti: null,

    commentValue: '',
    newNoteValue: '',

    pubkey: livewireComponent.entangle('pubkey'),
    isMyFeed: livewireComponent.entangle('isMyFeed'),
    hexpubkeys: livewireComponent.entangle('hexpubkeys', true),

    until: livewireComponent.entangle('until'),
    since: livewireComponent.entangle('since'),

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

        let editor = new window.SimpleMDE({
            element: this.$refs.editor,
            hideIcons: ['image', 'side-by-side', 'fullscreen'],
            toolbar: false
        });

        editor.value(this.commentValue);

        editor.codemirror.on('change', () => {
            this.commentValue = editor.value();
        });

        let noteEditor = new window.SimpleMDE({
            element: this.$refs.noteEditor,
            hideIcons: ['image', 'side-by-side', 'fullscreen'],
            toolbar: false
        });

        noteEditor.value(this.newNoteValue);

        noteEditor.codemirror.on('change', () => {
            this.newNoteValue = noteEditor.value();
        });
    },

    async loadMore() {
        document.querySelector("#loader").style.display = "block";
        const oldLength = this.eventsLength;
        do {
            this.until = Math.floor(Date.now() / 1000); // now
            this.since = this.since - (this.timeSteps);
            await nostrEvents(this).fetch(this.hexpubkeys);
            console.log('#### oldLength ####', oldLength);
            console.log('#### this.eventsLength ####', this.eventsLength);
        } while (this.eventsLength <= oldLength)

        document.querySelector("#loader").style.display = "none";
    },

    openReactionPicker(id) {
        console.log('~~~~ openReactionPicker ~~~~');
        console.log('#### event ####', id);
        this.currentEventToReactId = id;
        this.openReactionModal = true;
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
        await ndkEvent.publish();
        this.newNoteValue = '';
        this.openCreateNoteModal = false;
        await this.jsConfetti.addConfetti({
            emojiSize: 100,
            emojis: ['📣',],
        });
        this.until = Math.floor(Date.now() / 1000); // now
        console.log('#### until ####', this.until);
        console.log('#### since ####', this.since);
        await nostrEvents(this).fetch(this.hexpubkeys);
    },

    async debug(id) {
        const event = await this.$store.ndk.ndk.fetchEvent(id);
        console.log('event', event);
    },

});
