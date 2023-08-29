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

    switchTab(tab) {
        this.currentTab = tab;
    },

});
