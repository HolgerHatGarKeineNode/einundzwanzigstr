export default (event) => ({

    init() {
        if (this.$refs.table !== undefined) {
            this.$refs.table.style.maxHeight = this.$refs.left.offsetHeight - 100 + 'px';
            this.$refs.table.style.minHeight = '200px';
        }
    },

    currentTab: 'reactions',

    details(event) {

        if (this.currentTab === 'reactions' && this.reactions.reactionEventsData && this.reactions.reactionEventsData[event.id]) {
            let reactions = [];
            for (const r of this.reactions.reactionEventsData[event.id]) {
                if (this.authorMetaData[r.pubkey]) {
                    const author = this.authorMetaData[r.pubkey];
                    reactions.push({
                        id: r.id,
                        image: author.image,
                        display_name: author.display_name,
                        content: r.content,
                        created_at: r.created_at,
                    });
                }
            }
            return reactions;
        }
        if (this.currentTab === 'zaps' && this.reactions.reactionZapsData && this.reactions.reactionZapsData[event.id]) {
            let reactions = [];
            for (const r of this.reactions.reactionZapsData[event.id]) {
                console.log(r);
                if (this.authorMetaData[r.senderPubkey]) {
                    const author = this.authorMetaData[r.senderPubkey];
                    reactions.push({
                        id: r.id,
                        image: author.image,
                        display_name: author.display_name,
                        content: r.content,
                        created_at: r.created_at,
                    });
                }
            }
            return reactions;
        }

        return [];
    },

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

    switchTab(tab) {
        this.currentTab = tab;
    },

});
