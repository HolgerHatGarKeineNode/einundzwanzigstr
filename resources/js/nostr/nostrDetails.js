export default (event) => ({

    init() {

        Alpine.effect(async () => {

            if (this.$refs.table !== undefined) {
                this.$refs.table.style.maxHeight = this.$refs.left.offsetHeight - 100 + 'px';
                this.$refs.table.style.minHeight = '200px';
            }

            if (this.alreadyReactedData && this.alreadyReactedData[event.id]) {

                this.reactions = this.alreadyReactedData[event.id].reactionsData;

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
        this.jsConfetti.addConfetti({
            emojiSize: 100,
            emojis: ['🛠️',],
        });
    },

    async loadUserData(reaction) {
        const filter = {kinds: [0], authors: [reaction.pubkey]};
        const sub = this.$store.ndk.ndk.subscribe(filter, {closeOnEose: true});
        sub.on('event', (event) => {
            if (event) {
                this.profileData[reaction.pubkey] = JSON.parse(event.content);
            }
        });
    },
})
