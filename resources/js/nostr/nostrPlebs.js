import {ndkInstance} from "./ndk/instance.js";
import {nostrEvents} from "./ndk/events.js";
import {NDKEvent} from "@nostr-dev-kit/ndk";
import {eventKind} from "nostr-fetch";
import JSConfetti from "js-confetti";

export default (livewireComponent) => ({

    jsConfetti: null,

    commentValue: '',
    newNoteValue: '',

    openCreateNoteModal: false,

    async init() {
        console.log('~~~~ INIT nostrPlebs ~~~~');

        // init confetti
        this.jsConfetti = new JSConfetti();

        await ndkInstance(this).init();
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
        await nostrEvents(this).fetch(this.hexpubkeys);
    },

});
