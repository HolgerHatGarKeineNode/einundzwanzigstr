// this is a nostr application that uses the sdk from this GitHub repo https://github.com/nostr-dev-kit/ndk
import {NDKKind} from "@nostr-dev-kit/ndk";

export default (livewireComponent) => ({
    init() {
        Alpine.effect(async () => {
            await this.loadEvents();
        });
    },

    isMyProfile: livewireComponent.entangle('isMyProfile'),
    currentNpubs: livewireComponent.entangle('currentNpubs'),

    async loadEvents() {
        let authors = this.currentNpubs;
        if (this.isMyProfile && this.$store.ndk.user) {
            authors = [this.$store.ndk.user.npub];
        } else if (this.isMyProfile && !this.$store.ndk.user) {
            return;
        }

        // set authors
        this.hexpubkeys = [];
        authors.forEach((author) => {
            const ndkUSer = this.$store.ndk.ndk.getUser({
                npub: author.trim(),
            });
            this.hexpubkeys.push(ndkUSer.hexpubkey());
        });

        // fetch profiles
        this.hexpubkeys.forEach(async (pubkey) => {
            const filter = {kinds: [NDKKind.Metadata], authors: [pubkey]};
            const events = Array.from(await this.$store.ndk.ndk.fetchEvents(filter));
            if (events[0]) {
                this.eventsData[pubkey] = JSON.parse(events[0].content);
            }
        });

        const filter = {
            kinds: [NDKKind.Text],
            authors: Array.from(this.hexpubkeys),
            since: this.$store.ndk.loadSince,
            limit: 25,
        };

        this.fetchEvents(filter, this.$store.ndk.loadSince);
    },

    fetchEvents(filter) {
        this.$store.ndk.ndk.connect().then(async () => {
            console.log('NDK Connected - feed events');

            const sub = this.$store.ndk.ndk.subscribe(filter, {closeOnEose: false});

            // subscribe to events
            sub.on('event', (event) => {
                if (!this.events.find((e) => e.id === event.id)) {
                    this.events.push(event);
                }
            });

            sub.on('eose', () => {
                console.log('EOSE feed events');
            });

            sub.on('notice', (notice) => {
                console.log(notice);
            });
        });
    },

    events: [],
    eventsData: {},

});
