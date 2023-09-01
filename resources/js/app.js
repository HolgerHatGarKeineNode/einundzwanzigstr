import nostrApp from './nostr/nostrApp';
import nostrDetails from './nostr/nostrDetails';
import nostrReplies from './nostr/nostrReplies';
import nostrNoteEditor from './nostr/nostrNoteEditor';
import nostrCommentEditor from './nostr/nostrCommentEditor';

import Alpine from 'alpinejs';
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";
import {NDKNip07Signer} from "@nostr-dev-kit/ndk";

window.Alpine = Alpine;

const date = new Date();

Alpine.store('ndk', {
    // fetcher
    fetcher: null,
    // nostr ndk
    ndk: null,
    // signer
    nip07signer: new NDKNip07Signer(),
    // dexie cache adapter
    dexieAdapter: new NDKCacheAdapterDexie({dbName: 'einundzwanzigNostrDB'}),
    // current nostr user
    user: null,
    // loadSince
    loadSince: new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1).getTime() / 1000,
    // validated relays
    validatedRelays: [],
    // limit results
    limit: 1,
    // hours ago
    hoursAgo: 24,
    // hours step
    hoursStep: 24,
})

Alpine.data('nostrApp', nostrApp);
Alpine.data('nostrDetails', nostrDetails);
Alpine.data('nostrReplies', nostrReplies);
Alpine.data('nostrNoteEditor', nostrNoteEditor);
Alpine.data('nostrCommentEditor', nostrCommentEditor);
Alpine.start();
