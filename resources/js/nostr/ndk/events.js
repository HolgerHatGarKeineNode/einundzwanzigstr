import {eventKind, NostrFetcher} from "nostr-fetch";
import {ndkAdapter} from "@nostr-fetch/adapter-ndk";
import {nested} from "../utils/nested.js";
import {decode} from "light-bolt11-decoder";

export const nostrEvents = (Alpine) => ({

    async fetch(hexpubkeys) {
        const fetcher = NostrFetcher.withCustomPool(ndkAdapter(Alpine.$store.ndk.ndk));

        let fetchedEvents = await fetcher.fetchAllEvents(
            Alpine.$store.ndk.explicitRelayUrls,
            {kinds: [eventKind.text], authors: hexpubkeys},
            {until: Alpine.until, since: Alpine.since},
            {sort: true}
        );

        fetchedEvents = this.filterReplies(fetchedEvents);

        console.log('#### fetchedEvents ####', fetchedEvents);

        await Alpine.$wire.call('cacheEvents', fetchedEvents);
        await Alpine.$wire.call('loadCachedEvent');
    },

    filterReplies(fetchedEvents) {
        for (const e of fetchedEvents) {
            if (
                e.tags?.[0]?.[0] === 'e' && !e.tags?.[0]?.[3]
                || e.tags.find((el) => el[3] === 'root')?.[1]
                || e.tags.find((el) => el[3] === 'reply')?.[1]
            ) {
                // we will remove event from fetchedEvents
                fetchedEvents = fetchedEvents.filter((el) => el.id !== e.id);
            }
        }
        return fetchedEvents;
    },

    async fetchReplies(event) {
        const fetcher = NostrFetcher.withCustomPool(ndkAdapter(Alpine.$store.ndk.ndk));
        const replies = await fetcher.fetchAllEvents(
            Alpine.$store.ndk.explicitRelayUrls,
            {kinds: [eventKind.text], '#e': [event.id],},
            {},
            {sort: true}
        );
        const combinedEventWithReplies = [event, ...replies];
        const nestedReplies = nested(combinedEventWithReplies, [event.id]);

        return Array.from(nestedReplies);
    },

    async fetchReactions(event) {
        const fetcher = NostrFetcher.withCustomPool(ndkAdapter(Alpine.$store.ndk.ndk));
        return await fetcher.fetchAllEvents(
            Alpine.$store.ndk.explicitRelayUrls,
            {kinds: [eventKind.reaction,], '#e': [event.id],},
            {},
        );
    },

    async fetchReposts(event) {
        const fetcher = NostrFetcher.withCustomPool(ndkAdapter(Alpine.$store.ndk.ndk));
        return await fetcher.fetchAllEvents(
            Alpine.$store.ndk.explicitRelayUrls,
            {kinds: [eventKind.repost,], '#e': [event.id],},
            {},
        );
    },

    async fetchZaps(event) {
        const fetcher = NostrFetcher.withCustomPool(ndkAdapter(Alpine.$store.ndk.ndk));
        let zaps = await fetcher.fetchAllEvents(
            Alpine.$store.ndk.explicitRelayUrls,
            {kinds: [eventKind.zap,], '#e': [event.id],},
            {},
        );
        for (const zap of zaps) {
            const bolt11 = zap.tags.find((tag) => tag[0] === 'bolt11')[1];
            if (bolt11) {
                const decoded = decode(bolt11);
                const amount = decoded.sections.find((item) => item.name === 'amount');
                zap.sats = amount.value / 1000;
                const description = zap.tags.find((tag) => tag[0] === 'description')[1];
                zap.pubkey = JSON.parse(description).pubkey;
            }
        }

        return zaps;
    },
});
