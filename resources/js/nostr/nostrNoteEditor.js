import {eventKind} from "nostr-fetch";
import {NDKEvent} from "@nostr-dev-kit/ndk";

export default (event) => ({
    value: '',
    init() {

        let editor = new window.SimpleMDE({
            element: this.$refs.editor,
            hideIcons: ['image', 'side-by-side', 'fullscreen'],
            toolbar: false
        })

        editor.value(this.value)

        editor.codemirror.on('change', () => {
            this.value = editor.value()
        })

    },

    async createNote() {

        // reply to event
        const ndkEvent = new NDKEvent(this.$store.ndk.ndk);
        ndkEvent.kind = eventKind.text;
        ndkEvent.content = this.value;
        await ndkEvent.publish();

        this.openCreateNoteModal = false;

        this.value = '';

        await this.jsConfetti.addConfetti({
            emojiSize: 100,
            emojis: ['📣',],
        });

        const that = this;
        setTimeout(async function () {
            await that.fetchEvents();
        }, 1000);
    },
});
