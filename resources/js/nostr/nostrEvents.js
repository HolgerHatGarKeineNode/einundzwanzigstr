import {ndkInstance} from "./ndk/instance.js";
import {nostrEvents} from "./ndk/events.js";

export default (livewireComponent) => ({

    pubkey: livewireComponent.entangle('pubkey'),
    hexpubkeys: livewireComponent.entangle('hexpubkeys', true),

    until: livewireComponent.entangle('until'),
    since: livewireComponent.entangle('since'),

    eventsLength: livewireComponent.entangle('eventsLength'),

    async init() {
        console.log('~~~~ INIT nostrEvents ~~~~');
        console.log('#### pubkey ####', this.pubkey);
        console.log('#### until ####', this.until);
        console.log('#### since ####', this.since);

        await ndkInstance(this).init();

        if (this.pubkey) {
            this.hexpubkeys = [this.$store.ndk.ndk.getUser({npub: this.pubkey}).hexpubkey()];
        } else {
            const follows = await this.$store.ndk.user.follows();
            this.hexpubkeys = Array.from(follows).map((follow) => follow.hexpubkey());
        }
        console.log('#### hexpubkeys ####', Alpine.raw(this.hexpubkeys));

        await this.$wire.call('loadCachedEvent');

        if (this.until === 0 && this.since === 0) {
            this.until = Math.floor(Date.now() / 1000); // now
            this.since = this.until - (60 * 60 * 24); // 24 hours ago
            console.log('#### until ####', this.until);
            console.log('#### since ####', this.since);
        } else {
            this.since = this.until + 1 // last until
            this.until = Math.floor(Date.now() / 1000); // now
            console.log('#### until ####', this.until);
            console.log('#### since ####', this.since);
        }

        console.log('#### eventsLength ####', this.eventsLength);

        if (this.eventsLength < 1) {
            do {
                this.until = Math.floor(Date.now() / 1000); // now
                this.since = this.since - (60 * 60 * 24);
                await nostrEvents(this).fetch(this.hexpubkeys);
            } while (this.eventsLength < 1);
        }

    }
});
