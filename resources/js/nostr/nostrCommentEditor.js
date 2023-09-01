import {eventKind} from "nostr-fetch";
import {NDKEvent} from "@nostr-dev-kit/ndk";
import {parse} from "./nips/nip10.js";

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
        await this.jsConfetti.addConfetti({
            emojis: ['🛠️',],
        });
        return;
        // reply to event
        const ndkEvent = new NDKEvent(this.$store.ndk.ndk);
        ndkEvent.content = this.value;
        ndkEvent.kind = eventKind.text;
        // set tags from this.currentEventToReact.tags raw from proxy
        let tags = Alpine.raw(this.currentEventToReact.tags);
        tags.push(["e", Alpine.raw(this.currentEventToReact.id)]);
        // if now ["p"] tag exists add it
        tags.push(["p", Alpine.raw(this.currentEventToReact.pubkey)]);
        // set tags
        ndkEvent.tags = tags;
        await ndkEvent.publish();
        this.openCommentModal = false;

        this.value = '';

        await this.jsConfetti.addConfetti({
            emojiSize: 100,
            emojis: ['🗣️',],
        });

        const that = this;
        setTimeout(async function () {
            await that.fetchEvents(true);
        }, 1000);
    },
});
