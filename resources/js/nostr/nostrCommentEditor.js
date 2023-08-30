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

    async comment() {

        // reply to event
        const ndkEvent = new NDKEvent(this.$store.ndk.ndk);
        ndkEvent.content = this.value;
        ndkEvent.kind = eventKind.text;
        // set tags for a reply
        ndkEvent.tags = [
            ['e', this.currentEventToReact.id, '', 'root'],
            ['p', this.currentEventToReact.pubkey],
        ];
        await ndkEvent.publish();

        await this.jsConfetti.addConfetti({
            emojiSize: 100,
            emojis: ['🗣️',],
        });

        this.value = '';
        this.openCommentModal = false;

        const that = this;
        setTimeout(async function () {
            await that.getReactions([that.currentEventToReact]);
            await that.fetchAllRepliesOfEvent(that.currentEventToReact);
        }, 1000);
    },
});
