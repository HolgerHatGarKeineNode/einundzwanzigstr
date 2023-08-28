export default (event) => ({

    init() {
        if (this.$refs.table !== undefined) {
            this.$refs.table.style.maxHeight = this.$refs.left.offsetHeight - 100 + 'px';
            this.$refs.table.style.minHeight = '200px';
        }
    },

    currentTab: 'reactions',

    tabs: [
        {
            name: 'reactions',
            label: 'Reactions',
        },
        {
            name: 'zaps',
            label: 'Zaps',
        },
        {
            name: 'reposts',
            label: 'Reposts',
        },
        {
            name: 'thread',
            label: 'Thread',
        },
    ],

    reactionMetaData: {},

    async getReactionMetaData(event) {
        if (!this.reactionMetaData[event.id]) {
            const ndkUser = this.$store.ndk.ndk.getUser({
                hexpubkey: event.pubkey,
            });
            await ndkUser.fetchProfile();
            this.reactionMetaData[event.id] = ndkUser.profile;
        }
    },

    switchTab(tab) {
        this.currentTab = tab;
    },

});
