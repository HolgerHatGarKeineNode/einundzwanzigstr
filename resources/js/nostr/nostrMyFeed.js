// this is a nostr application that uses the sdk from this GitHub repo https://github.com/nostr-dev-kit/ndk
export default () => ({
    init() {
        Alpine.effect(async () => {
            if (Alpine.store('ndk').user) {
                await this.loadUserFeed();
            }
        })
    },

    async loadUserFeed() {
        if (this.$store.ndk.user) {
            const date = new Date();
            const startOfCurrentDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 1000;
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getTime() / 1000;

            const filter = {kinds: [1], authors: [this.$store.ndk.user.hexpubkey()], since: startOfMonth};
            this.userEvents = Array.from(await this.$store.ndk.ndk.fetchEvents(filter))
                //.filter((event) => event.id === 'ba23aa4be2fcdbc25fb318a994c2d9b43c3bd5d91fe4e375c5b40af09a6e7016')
                .sort((a, b) => b.created_at - a.created_at);
            console.log(this.userEvents);
        }
    },

    userEvents: [],
});
