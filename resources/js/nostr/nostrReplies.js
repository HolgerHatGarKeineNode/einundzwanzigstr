import {nostrEvents} from "./ndk/events.js";

export default (livewireComponent) => ({

    event: livewireComponent.entangle('event'),
    replies: livewireComponent.entangle('replies', true),

    async init() {
        if (this.replies.length < 1) {
            await this.loadReplies();
        }

        // interval to check for new replies
        setInterval(async () => {
            console.log('~~~~ nostrReplies interval ~~~~');
            await this.loadReplies();
        }, 100000);
    },

    async loadReplies() {
        this.$wire.call('cacheReplies', await nostrEvents(this).fetchReplies(this.event));
        await this.$wire.call('loadCachedReplies');
    },

    async replied() {
        await this.loadReplies();
    },

});
