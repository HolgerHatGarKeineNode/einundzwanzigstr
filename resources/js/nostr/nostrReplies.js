import {nostrEvents} from "./ndk/events.js";

export default (livewireComponent) => ({

    event: livewireComponent.entangle('event'),
    replies: livewireComponent.entangle('replies', true),

    async init() {
        if (this.replies.length < 1) {
            this.$wire.call('cacheReplies', await nostrEvents(this).fetchReplies(this.event));
            await this.$wire.call('loadCachedReplies');
        }
    }

});
