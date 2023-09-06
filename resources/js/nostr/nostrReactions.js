import {nostrEvents} from "./ndk/events.js";

export default (livewireComponent) => ({

    event: livewireComponent.entangle('event'),
    reactions: livewireComponent.entangle('reactions', true),

    async init() {
        if (this.reactions.length < 1) {
            this.$wire.call('cacheReactions', await nostrEvents(this).fetchReactions(this.event));
            await this.$wire.call('loadCachedReactions');
        }
    }

});
