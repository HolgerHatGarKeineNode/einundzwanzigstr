import "./components.js"
import {Alpine, Livewire} from '../../vendor/livewire/livewire/dist/livewire.esm';
import {NDKNip07Signer} from "@nostr-dev-kit/ndk";
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";
import nostrEvents from "./nostr/nostrEvents";
import nostrAuthor from "./nostr/nostrAuthor";
import nostrReplies from "./nostr/nostrReplies";
import nostrReactions from "./nostr/nostrReactions";
import nostrZaps from "./nostr/nostrZaps";
import nostrReposts from "./nostr/nostrReposts";
import nostrPlebs from "./nostr/nostrPlebs";

import "venobox/dist/venobox.min.css";

Alpine.store('ndk', {
    // nostr ndk
    ndk: null,
    // signer
    nip07signer: new NDKNip07Signer(),
    // dexie cache adapter
    dexieAdapter: new NDKCacheAdapterDexie({dbName: 'einundzwanzigNostrDB', expirationTime: 60 * 60 * 24 * 7}),
    // current nostr user
    user: null,
    // hours ago
    explicitRelayUrls: [],
});
Alpine.data('nostrEvents', nostrEvents);
Alpine.data('nostrAuthor', nostrAuthor);
Alpine.data('nostrReplies', nostrReplies);
Alpine.data('nostrReactions', nostrReactions);
Alpine.data('nostrZaps', nostrZaps);
Alpine.data('nostrReposts', nostrReposts);
Alpine.data('nostrPlebs', nostrPlebs);

Livewire.start();
