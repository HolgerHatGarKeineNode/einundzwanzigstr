import {nip19} from "nostr-tools";

export const nostrFetcher = async (string, alpine) => {

    let decoded = null;
    try {
        decoded = nip19.decode(string.replace('nostr:', '').replace('\'', ''));
    } catch (e) {
        return {
            data: {},
            type: 'error',
        }
    }

    if (decoded.type === 'note') {
        // Will return only the first event
        const event = await alpine.$store.ndk.ndk.fetchEvent(decoded.data);

        return {
            data: event,
            type: decoded.type,
        };
    }

    if (decoded.type === 'nevent') {
        // Will return only the first event
        const event = await alpine.$store.ndk.ndk.fetchEvent(decoded.data.id);

        // fetch authorMetaData
        await alpine.getAuthorsMeta([decoded.data.author]);

        return {
            data: event,
            type: decoded.type,
        };
    }

    if (decoded.type === 'npub') {
        // fetch authorMetaData
        await alpine.getAuthorsMeta([decoded.data]);

        return {
            data: decoded.data,
            type: decoded.type,
        };
    }

    return {
        data: {},
        type: decoded.type,
    };
}
