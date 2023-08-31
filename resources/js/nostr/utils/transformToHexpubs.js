import {nip19} from "nostr-tools";

export function transformToHexpubs() {
    let hexpubs = [];
    for (const npub of this.currentNpubs) {
        // convert npub to hexpub
        const hexpub = nip19.decode(npub);
        // check if hexpub is valid
        if (hexpub) {
            // add hexpub to hexpubs array
            hexpubs.push(hexpub.data);
        }
    }
    return hexpubs;
}
