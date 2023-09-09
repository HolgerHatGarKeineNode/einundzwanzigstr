import {nip19} from "nostr-tools";

export default (livewireComponent) => ({

    event: livewireComponent.entangle('event'),
    author: livewireComponent.entangle('author', true),

    async init() {

        Alpine.effect(async () => {

            if (this.$store.ndk.ndk) {
                // check if this.event.pubkey contains npub1
                if (this.event.pubkey.includes('npub1')) {
                    // convert npub1 to hexpubkey
                    const decoded = nip19.decode(this.event.pubkey.trim());
                    this.event.pubkey = decoded.data;
                }

                if (!this.author) {
                    await this.loadAuthor();
                }
            }
        });
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
            if (profile.npub && profile.display_name) {
                this.author = profile;
            }
        }
    },
});
