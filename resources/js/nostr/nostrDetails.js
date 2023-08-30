export default (event) => ({

    init() {

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
    ],

    switchTab(tab) {
        this.currentTab = tab;
    },

});
