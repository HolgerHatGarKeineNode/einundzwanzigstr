import {nip19} from "nostr-tools";

export default (Alpine) => ({

    async findNostrEventsInContent(events) {

        console.log('#### findNostrEventsInContent ####', events);

        for (const event of events) {

            // find all strings starting with nostr:
            const matches = event.content.matchAll(/nostr:[a-zA-Z0-9]+/g);
            for (const match of matches) {
                // ndkEvent from match
                const eventString = match[0].split(':')[1];
                // decode eventString to hexpubkey
                const decoded = nip19.decode(eventString);

                console.log('#### decoded ####', decoded);

                if (decoded.type === 'npub') {
                    console.log('#### decoded ####', decoded);
                    await this.loadAuthor(decoded.data);
                    // replace match with link to author
                    event.content = event.content.replace(match[0], `nostrAuthor:${decoded.data}`);
                }

                if (decoded.type === 'nevent') {
                    console.log('#### decoded ####', decoded);
                    const e = await Alpine.$store.ndk.ndk.fetchEvent(decoded.data.id);
                    console.log('#### event ####', e);
                    // if event tags contains ["url"] then replace match with link to url
                    if (e.tags.find((el) => el[0] === 'url')?.[1]) {
                        event.content = event.content.replace(match[0], `${e.tags.find((el) => el[0] === 'url')?.[1]}`);
                    }
                }
            }

        }

    },

    async loadAuthor(hexpubkey) {
        const user = Alpine.$store.ndk.ndk.getUser({hexpubkey: hexpubkey});
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
                profile.hexpubkey = hexpubkey;
            }
            if (!profile.npub) {
                profile.npub = user.npub;
            }
            if (profile.npub && profile.display_name) {
                Alpine.$wire.call('cacheAuthor', profile);
            }
        }
    },

});
