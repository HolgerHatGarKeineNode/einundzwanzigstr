export default (event) => ({

    init() {

        Alpine.effect(async () => {

            this.$refs.table.style.maxHeight = this.$refs.left.offsetHeight + 'px';

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
        const events = Array.from(await this.$store.ndk.ndk.fetchEvents(filter));
        if (events[0]) {
            this.profileData[reaction.pubkey] = JSON.parse(events[0].content);
        }
    },
})
