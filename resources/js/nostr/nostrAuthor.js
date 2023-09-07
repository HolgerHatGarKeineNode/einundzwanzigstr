export default (livewireComponent) => ({

    event: livewireComponent.entangle('event'),
    author: livewireComponent.entangle('author', true),

    async init() {
        if (!this.author) {
            await this.loadAuthor();
        }

        // interval to check for new author data
        setInterval(async () => {
            if (!this.author) {
                console.log('~~~~ nostrAuthor interval ~~~~');
                await this.loadAuthor();
            }
        }, 30000);
    },

    loadAuthor: async function () {
        const user = this.$store.ndk.ndk.getUser({hexpubkey: this.event.pubkey});
        await user.fetchProfile();
        let profile = user.profile;
        if (profile) {
            if (!profile.display_name) {
                profile.display_name = user.profile.displayName;
            }
            if (!profile.display_name) {
                profile.display_name = user.profile.name;
            }
            if (!profile.image) {
                profile.image = user.profile.picture;
            }
            if (!profile.hexpubkey) {
                profile.hexpubkey = this.event.pubkey;
            }
            if (!profile.npub) {
                profile.npub = user.npub;
            }
            this.author = profile;
        }
    },
});
