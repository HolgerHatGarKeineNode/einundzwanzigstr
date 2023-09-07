<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return to_route('feed', ['pubkey' => 'npub17fqtu2mgf7zueq2kdusgzwr2lqwhgfl2scjsez77ddag2qx8vxaq3vnr8y']);
});

Route::get('/feed/{pubkey}', \App\Livewire\Nostr\Feed::class)->name('feed');
Route::get('/my-feed', \App\Livewire\Nostr\Feed::class)->name('my-feed');
