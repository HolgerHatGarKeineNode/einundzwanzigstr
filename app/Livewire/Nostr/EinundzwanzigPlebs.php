<?php

namespace App\Livewire\Nostr;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Redis;
use Livewire\Component;

class EinundzwanzigPlebs extends Component
{
    public array $plebs = [];
    public array $follows = [];

    public function mount()
    {
        $this->plebs = Http::get('https://portal.einundzwanzig.space/api/nostrplebs')->json();
    }

    public function loadFollows($me)
    {
        $redisClient = Redis::connection('nostr')->client();
        $follows = json_decode($redisClient->hGet('follows', $me), true, 512, JSON_THROW_ON_ERROR);

        return $follows;
    }

    public function cacheFollows($follows, $me)
    {
        $redisClient = Redis::connection('nostr')->client();
        $redisClient->hSet('follows', $me, json_encode($follows, JSON_THROW_ON_ERROR));
        // set expire time to 1 day of hashkey
        $redisClient->expire('follows', 86400);
    }

    public function render()
    {
        return view('livewire.nostr.einundzwanzig-plebs');
    }
}
