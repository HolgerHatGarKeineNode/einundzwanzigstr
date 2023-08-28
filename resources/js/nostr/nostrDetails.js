export default (event) => ({

    init() {

        Alpine.effect(async () => {

            if (this.$refs.table !== undefined) {
                this.$refs.table.style.maxHeight = this.$refs.left.offsetHeight - 100 + 'px';
                this.$refs.table.style.minHeight = '200px';
            }

            if (this.alreadyReactedData && this.alreadyReactedData[event.id]) {

                this.reactions = this.alreadyReactedData[event.id].reactionsData;
                this.zaps = this.alreadyReactedData[event.id].zapsData;

                this.tabs = [
                    {
                        name: 'reactions',
                        label: 'Reactions',
                        count: this.alreadyReactedData[event.id].reactions,
                    },
                    {
                        name: 'zaps',
                        label: 'Zaps',
                        count: this.alreadyReactedData[event.id].zaps,
                    },
                    {
                        name: 'reposts',
                        label: 'Reposts',
                        count: this.alreadyReactedData[event.id].reposts,
                    },
                    {
                        name: 'thread',
                        label: 'Thread',
                        count: -1,
                    },
                ];
            }
        });
    },

    currentTab: 'reactions',

    reactions: [],
    zaps: [],
    reposts: [],

    profileData: {},

    tabs: [
        {
            name: 'likes',
            label: 'Likes',
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

    loadLikes(event) {
        console.log(event);
    },

    switchTab(name) {
        this.currentTab = name;
    },

    async loadUserData(event) {
        const filter = {kinds: [0], authors: [event.pubkey]};
        const sub = this.$store.ndk.ndk.subscribe(filter, {closeOnEose: true});
        sub.on('event', (e) => {
            if (event) {
                this.profileData[event.pubkey] = JSON.parse(e.content);
            }
        });
    },

    async parseZapEventDescription(event) {
        await this.loadUserData(event);
    },
})
