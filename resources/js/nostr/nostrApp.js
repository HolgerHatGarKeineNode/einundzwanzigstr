import NDK, {NDKNip07Signer} from "@nostr-dev-kit/ndk";
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";
import defaultRelays from "./defaultRelays.js";

// this is a nostr application that uses the sdk from this GitHub repo https://github.com/nostr-dev-kit/ndk
export default () => ({

    open: false,

    init() {
        this.$store.ndk.ndk = new NDK({
            cacheAdapter: this.$store.ndk.dexieAdapter,
            signer: this.$store.ndk.nip07signer,
            explicitRelayUrls: defaultRelays
        });

        const that = this;
        that.$store.ndk.ndk.connect().then(function () {
            console.log('NDK Connected');
            that.$store.ndk.nip07signer.user().then(async (user) => {
                if (!!user.npub) {
                    console.log('Permission granted to read their public key:', user.npub);
                    user.ndk = that.$store.ndk.ndk;
                    that.$store.ndk.user = user;
                    await that.$store.ndk.user.fetchProfile();
                }
            });
        });
    },

    parseText(text) {
        const replaceWithThis = '<a target="_blank" href="$1"><div class="max-w-xl"><img class="w-full object-contain object-left" src="$1" /></div></a>';

        return text
            .replace(/(https?:\/\/\S+(\.png|\.jpg|\.gif|\.webp))/g, replaceWithThis);
    },
});
