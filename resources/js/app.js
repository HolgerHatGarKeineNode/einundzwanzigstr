import './bootstrap';
import nostrApp from './nostr/nostrApp';
import nostrDetails from './nostr/nostrDetails';

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
})

Alpine.data('nostrApp', nostrApp);
Alpine.data('nostrDetails', nostrDetails);
Alpine.start();
