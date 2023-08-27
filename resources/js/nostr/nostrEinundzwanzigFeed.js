// this is a nostr application that uses the sdk from this GitHub repo https://github.com/nostr-dev-kit/ndk
export default (livewireComponent) => ({
    init() {
        Alpine.effect(async () => {
            await this.loadEinundzwanzigEvents();
        })
    },

    currentNpubs:  livewireComponent.entangle('currentNpubs'),

    hexpubkeys: [],

    async getEinundzwanzigNostrPlebs() {
        const response = await fetch('https://portal.einundzwanzig.space/api/nostrplebs');
        return await response.json();
    },

    async loadEinundzwanzigEvents() {
        const date = new Date();
        const startOfCurrentDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 1000;
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getTime() / 1000;

        this.hexpubkeys = [];
        const authors = this.currentNpubs;
        authors.forEach((author) => {
            const ndkUSer = this.$store.ndk.ndk.getUser({
                npub: author.trim(),
            });
            this.hexpubkeys.push(ndkUSer.hexpubkey());
        });

        this.hexpubkeys.forEach(async (pubkey) => {
            const filter = {kinds: [0], authors: [pubkey]};
            const events = Array.from(await this.$store.ndk.ndk.fetchEvents(filter));
            if (events[0]) {
                this.einundzwanzigEventsProfiles[pubkey] = JSON.parse(events[0].content);
            }
        });

        const filter = {kinds: [1], authors: this.hexpubkeys, since: startOfCurrentDay};

        this.$store.ndk.ndk.connect().then(async () => {
            console.log('NDK Connected!!!');

            const sub = this.$store.ndk.ndk.subscribe(filter, {closeOnEose: false});

            sub.on('event', (event) => {
                if (this.einundzwanzigEvents.find((einundzwanzigEvent) => einundzwanzigEvent.id === event.id)) {
                    return;
                } else {
                    this.einundzwanzigEvents.push(event);
                }
            });

            sub.on('eose', () => {
               console.log('EOSE');
            });

            sub.on('notice', (notice) => {
                console.log(notice);
            });

            this.einundzwanzigEvents = Array.from(await this.$store.ndk.ndk.fetchEvents(filter));
        })
    },

    einundzwanzigEvents: [],
    einundzwanzigEventsProfiles: {},

});
