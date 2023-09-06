import {nostrEvents} from "./ndk/events.js";

export default (livewireComponent) => ({

    event: livewireComponent.entangle('event'),
    zaps: livewireComponent.entangle('zaps', true),

    async init() {
        if (this.zaps.length < 1) {
            this.$wire.call('cacheZaps', await nostrEvents(this).fetchZaps(this.event));
            await this.$wire.call('loadCachedZaps');
        }
    }

});
