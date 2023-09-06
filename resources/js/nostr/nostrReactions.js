import {nostrEvents} from "./ndk/events.js";

export default (livewireComponent) => ({

    event: livewireComponent.entangle('event'),
    reactions: livewireComponent.entangle('reactions', true),

    async init() {
        if (this.reactions.length < 1) {
            await this.loadReactions();
        }
        // interval to check for new reactions
        setInterval(async () => {
            console.log('~~~~ nostrReactions interval ~~~~');
            await this.loadReactions();
        }, 60000);
    },

    async loved(detail) {
        if (detail === this.event.id) {
            await this.loadReactions();
        }
    },

    async loadReactions() {
        this.$wire.call('cacheReactions', await nostrEvents(this).fetchReactions(this.event));
        await this.$wire.call('loadCachedReactions');
    },

});
