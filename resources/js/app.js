import './bootstrap';
import nostrApp from './nostr/nostrApp';
import nostrMyFeed from './nostr/nostrMyFeed';
import nostrEinundzwanzigFeed from './nostr/nostrEinundzwanzigFeed';

import Alpine from 'alpinejs';
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";
import {NDKNip07Signer} from "@nostr-dev-kit/ndk";

window.Alpine = Alpine;

const date = new Date();

Alpine.store('ndk', {
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
})

Alpine.data('nostrApp', nostrApp);
Alpine.data('nostrMyFeed', nostrMyFeed);
Alpine.data('nostrEinundzwanzigFeed', nostrEinundzwanzigFeed);
Alpine.start();
