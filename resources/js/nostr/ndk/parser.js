import {nip19} from "nostr-tools";
import {eventKind} from "nostr-fetch";

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
                    if (e.kind === eventKind.text) {
                        event.content = event.content.replace(match[0], `${e.content}`);
                    }
                    if (e.kind !== eventKind.text) {
                        // if event tags contains ["url"] then replace match with link to url
                        if (e.tags.find((el) => el[0] === 'url')?.[1]) {
                            event.content = event.content.replace(match[0], `${e.tags.find((el) => el[0] === 'url')?.[1]}`);
                        }
                    }
                }

                if (decoded.type === 'naddr') {
                    console.log('#### decoded ####', decoded);
                    if (decoded.data.kind === eventKind.liveEvent) {
                        const e = await Alpine.$store.ndk.ndk.fetchEvent({kinds: [eventKind.liveEvent], id: decoded.data.id});
                        console.log('#### event ####', e);
                        // find title in tags
                        const title = e.tags.find((el) => el[0] === 'title')?.[1];
                        // find starts in tags
                        const starts = e.tags.find((el) => el[0] === 'starts')?.[1];
                        const date = new Date(starts * 1000);
                        // Hours part from the timestamp
                        const hours = date.getHours();
                        const minutes = "0" + date.getMinutes();
                        const seconds = "0" + date.getSeconds();
                        const formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
                        console.log('#### title ####', title);
                        // find status in tags
                        const status = e.tags.find((el) => el[0] === 'status')?.[1];
                        // replace match with link to live event
                        event.content = event.content.replace(match[0], `<div class="py-4 pl-0 pr-4 text-sm leading-6 sm:pr-8 lg:pr-20"><div class="flex items-center justify-end gap-x-2 sm:justify-start"><time class="text-amber-500">Starts: ${formattedTime}</time><div class="flex-none rounded-full p-1 text-green-400 bg-green-400/10"><div class="h-1.5 w-1.5 rounded-full bg-current"></div></div><div class="hidden text-white sm:block">${status === 'live' ? 'Live' : 'Offline'}</div></div></div>`);
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
