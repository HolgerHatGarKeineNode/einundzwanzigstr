<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return to_route('my-feed');
});


Route::get('/my-feed', \App\Http\Livewire\Feed::class)->name('my-feed');

Route::get('/feed/{pubkey?}', \App\Http\Livewire\Feed::class)->name('feed');
Route::get('/einundzwanzig-feed', \App\Http\Livewire\EinundzwanzigFeed::class)->name('einundzwanzig-feed');
Route::get('/gigi-feed', \App\Http\Livewire\EinundzwanzigFeed::class)->name('gigi-feed');
Route::get('/d11n-feed', \App\Http\Livewire\EinundzwanzigFeed::class)->name('d11n-feed');
Route::get('/markus-turm-feed', \App\Http\Livewire\EinundzwanzigFeed::class)->name('markus-turm-feed');
Route::get('/snowden-feed', \App\Http\Livewire\EinundzwanzigFeed::class)->name('snowden-feed');

Route::get('/settings/relays', \App\Http\Livewire\Settings\Relays::class)->name('settings.relays');


Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
