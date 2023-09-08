<?php

use Illuminate\Support\Facades\Route;

Route::get('/img/{path}', \App\Http\Controllers\ImageController::class)
    ->where('path', '.*')->name('img');
Route::get('/img-proxy', \App\Http\Controllers\ImageProxyController::class)
    ->name('img.proxy');

Route::get('/', function () {
    return to_route('feed', ['pubkey' => 'npub17fqtu2mgf7zueq2kdusgzwr2lqwhgfl2scjsez77ddag2qx8vxaq3vnr8y']);
});

Route::get('/feed/{pubkey}', \App\Livewire\Nostr\Feed::class)->name('feed');
Route::get('/my-feed', \App\Livewire\Nostr\Feed::class)->name('my-feed');
Route::get('/einundzwanzig-feed', \App\Livewire\Nostr\Feed::class)->name('einundzwanzig-feed');

Route::post('/upload-attachment', \App\Http\Controllers\Upload\InlineAttachment::class)->name('upload.attachment');
