import {ndkInstance} from "./ndk/instance.js";
import JSConfetti from "js-confetti";

export default (livewireComponent) => ({

    jsConfetti: null, follows: [], isFollowing: false,

    plebs: livewireComponent.entangle('plebs'),

    isFollowingAll: false, width: 0,

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

    async unfollowPleb(hexpubkey) {
        this.isFollowing = true;
        console.log('#### unfollowPleb ####', hexpubkey);
        console.log('#### user ####', this.$store.ndk.user);
        const unfollow = await this.$store.ndk.user.unfollow(this.$store.ndk.ndk.getUser({hexpubkey: hexpubkey}));
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
        if (follows.length > 0) {
            this.follows = follows;
        }
        console.log('#### follows ####', this.follows);

        if (this.follows.length < 1) {
            const follows = await this.$store.ndk.user.follows();
            // call $wire.cacheFollows() on the Livewire component with array of hexpubs
            await livewireComponent.call('cacheFollows', Array.from(follows).map(follow => follow._hexpubkey), this.$store.ndk.user._hexpubkey);
            this.follows = await livewireComponent.call('loadFollows', this.$store.ndk.user._hexpubkey);
        }
        console.log('#### follows ####', this.follows);
        this.isFollowing = false;
    },

    async followall() {
        this.isFollowingAll = true;
        this.isFollowing = true;
        console.log('#### followall ####');
        console.log('#### user ####', this.$store.ndk.user);
        console.log('#### plebs ####', this.plebs);
        this.width = 0;
        const length = this.plebs.length;
        let index = 0;
        for (const pleb of this.plebs) {
            const followUser = this.$store.ndk.ndk.getUser({npub: pleb.trim()});
            // skip if already following
            if (this.follows.includes(followUser.hexpubkey)) {
                index++;
                this.width = Math.round((index / length) * 100);
                continue;
            }
            console.log('#### pleb npub ####', pleb);
            console.log('#### pleb hexpubkey ####', followUser.hexpubkey);
            try {
                const follow = await this.$store.ndk.user.follow(followUser);
                console.log('#### follow ####', follow);
            } catch (e) {
                console.log('#### follow error ####', e);
                window.$wireui.notify({
                    title: 'Error',
                    description: 'Error following ' + followUser.hexpubkey + ' ' + e.message,
                    icon: 'error'
                })
                index++;
                this.width = Math.round((index / length) * 100);
                continue;
            }
            this.follows.push(followUser.hexpubkey);
            // current progressbar width in percentage rounded without decimals
            index++;
            this.width = Math.round((index / length) * 100);
        }
        await livewireComponent.call('cacheFollows', this.follows, this.$store.ndk.user._hexpubkey);
        this.isFollowing = false;
        this.isFollowingAll = false;
    },

});
