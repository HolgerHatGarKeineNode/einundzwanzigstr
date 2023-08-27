import NDK from "@nostr-dev-kit/ndk";
import defaultRelays from "./defaultRelays.js";
import {Parser} from "simple-text-parser";

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

    async parseText(event) {
        const parser = new Parser();
        let content = event.content;

        parser.addRule(/\n/g, function (tag) {
            // Return the tag minus the `#` and surrond with html tags
            return `<br>`;
        });
        // images
        parser.addRule(/(https?:\/\/\S+(\.png|\.jpg|\.gif|\.webp))/g, function (tag) {
            return `<a target="_blank" href="${tag}"><div class="max-w-xl"><img class="w-full object-contain object-left" src="${tag}" /></div></a>`;
        });
        // youtube
        parser.addRule(/(youtu.be\/|youtube.com\/watch\?v=)([^&]+)/, function (tag) {
            return `<div><iframe width="560" height="315" src="https://www.youtube.com/embed/${tag.split('v=')[1]}" frameborder="0" allowfullscreen></iframe></div>`;
        });
        // video
        parser.addRule(/(https?:\/\/\S+(\.mp4|\.webm|\.ogg))/g, function (tag) {
            return `<div><video style="max-width: 60%; max-height: 600px; height: auto;" controls src=${tag}></video></div>`;
        });
        // hashtags
        parser.addRule(/\#[\S]+/gi, function (tag) {
            // Return the tag minus the `#` and surrond with html tags
            return `<br>`;
        });

        return parser.render(content);
    },

    async loadSubEvents(event) {
        let subEvents = [];

        // find string starting with nostr:
        const regex = /nostr:[a-zA-Z0-9]+/g;
        const matches = event.content.match(regex);
        if (matches) {
            for (let i = 0; i < matches.length; i++) {
                const match = matches[i];
                const subEvent = await this.$store.ndk.ndk.fetchEvent(match.split('nostr:')[1]);
                if (subEvent) {
                    subEvents.push(subEvent);
                }
            }
        }
        console.log(subEvents);

        return subEvents;
    },

    async loadEvent(event) {
        return this.parseText(await this.$store.ndk.ndk.fetchEvent(event.id));
    },

});
