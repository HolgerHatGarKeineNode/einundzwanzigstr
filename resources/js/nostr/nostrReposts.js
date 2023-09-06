import {nostrEvents} from "./ndk/events.js";

export default (livewireComponent) => ({

    event: livewireComponent.entangle('event'),
    reposts: livewireComponent.entangle('reposts', true),

    async init() {
        if (this.reposts.length < 1) {
            await this.loadReposts();
        }
    },

    async reposted(detail) {
        if (detail === this.event.id) {
            await this.loadReposts();
        }
    },

    async loadReposts() {
        this.$wire.call('cacheReposts', await nostrEvents(this).fetchReposts(this.event));
        await this.$wire.call('loadCachedReposts');
    },

});
