<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return to_route('feed', ['pubkey' => 'npub1pt0kw36ue3w2g4haxq3wgm6a2fhtptmzsjlc2j2vphtcgle72qesgpjyc6']);
});

Route::get('/feed/{pubkey}', \App\Livewire\Nostr\Feed::class)->name('feed');
