// this is a nostr application that uses the sdk from this GitHub repo https://github.com/nostr-dev-kit/ndk
export default (livewireComponent) => ({
    init() {
        Alpine.effect(async () => {
            await this.loadEvents();
        });
    },

    currentNpubs:  livewireComponent.entangle('currentNpubs'),

    async loadEvents() {
        // set authors
        this.hexpubkeys = [];
        const authors = this.currentNpubs;
        authors.forEach((author) => {
            const ndkUSer = this.$store.ndk.ndk.getUser({
                npub: author.trim(),
            });
            this.hexpubkeys.push(ndkUSer.hexpubkey());
        });

        // fetch profiles
        this.hexpubkeys.forEach(async (pubkey) => {
            const filter = {kinds: [0], authors: [pubkey]};
            const events = Array.from(await this.$store.ndk.ndk.fetchEvents(filter));
            if (events[0]) {
                this.eventsData[pubkey] = JSON.parse(events[0].content);
            }
        });

        const filter = {kinds: [1], authors: this.hexpubkeys, since: this.$store.ndk.loadSince};

        this.fetchEvents(filter, this.$store.ndk.loadSince);
    },

    fetchEvents(filter) {
        this.$store.ndk.ndk.connect().then(async () => {
            console.log('NDK Connected!!!');
            console.log(filter);

            const sub = this.$store.ndk.ndk.subscribe(filter, {closeOnEose: true});

            // subscribe to events
            sub.on('event', (event) => {
                if (this.events.find((einundzwanzigEvent) => einundzwanzigEvent.id === event.id)) {
                    return;
                } else {
                    this.events.push(event);
                }
            });

            sub.on('eose', () => {
                console.log('EOSE');
            });

            sub.on('notice', (notice) => {
                console.log(notice);
            });

            // fetch events
            this.events = Array.from(await this.$store.ndk.ndk.fetchEvents(filter));
        });
    },

    events: [],
    eventsData: {},

});
