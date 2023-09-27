import {ndkInstance} from "./ndk/instance.js";
import JSConfetti from "js-confetti";

export default (livewireComponent) => ({

    jsConfetti: null,
    follows: [],
    isFollowing: false,

    async followPleb(hexpubkey) {
        this.isFollowing = true;
        console.log('#### followPleb ####', hexpubkey);
        console.log('#### user ####', this.$store.ndk.user);
        const follow = await this.$store.ndk.user.follow(this.$store.ndk.ndk.getUser({hexpubkey: hexpubkey}));
        console.log('#### follow ####', follow);
        this.follows.push(hexpubkey);
        await livewireComponent.call('cacheFollows', this.follows, this.$store.ndk.user._hexpubkey);
        this.isFollowing = false;
    },

    async init() {
        this.isFollowing = true;
        console.log('~~~~ INIT nostrPlebs ~~~~');

        // init confetti
        this.jsConfetti = new JSConfetti();

        await ndkInstance(this).init();

        // get follows
        const follows = await livewireComponent.call('loadFollows', this.$store.ndk.user._hexpubkey);
        console.log('#### follows ####', follows);
        if (follows.length > 0) {
            this.follows = follows;
        }

        if (this.follows.length < 1) {
            const follows = await this.$store.ndk.user.follows();
            // call $wire.cacheFollows() on the Livewire component with array of hexpubs
            livewireComponent.call('cacheFollows', Array.from(follows).map(follow => follow._hexpubkey), this.$store.ndk.user._hexpubkey);
        }
        this.isFollowing = false;
    },

});
