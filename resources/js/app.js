import nostrApp from './nostr/nostrApp';
import nostrNoteEditor from './nostr/nostrNoteEditor';
import nostrCommentEditor from './nostr/nostrCommentEditor';

import Alpine from 'alpinejs';
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";
import {NDKNip07Signer} from "@nostr-dev-kit/ndk";

window.Alpine = Alpine;

Alpine.store('ndk', {
    // fetcher
    fetcher: null,
    // nostr ndk
    ndk: null,
    // signer
    nip07signer: new NDKNip07Signer(),
    // dexie cache adapter
    dexieAdapter: new NDKCacheAdapterDexie({dbName: 'einundzwanzigNostrDB', expirationTime: 60 * 60 * 24 * 7}),
    // current nostr user
    user: null,
    // hours ago
    lastEventTimestamp: null,
    // hours ago
    explicitRelayUrls: [],
})

Alpine.data('nostrApp', nostrApp);
Alpine.data('nostrNoteEditor', nostrNoteEditor);
Alpine.data('nostrCommentEditor', nostrCommentEditor);

Alpine.start();
