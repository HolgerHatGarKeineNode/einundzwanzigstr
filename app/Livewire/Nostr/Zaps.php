<?php

namespace App\Livewire\Nostr;

use Illuminate\Support\Facades\Redis;
use Livewire\Component;

class Zaps extends Component
{
    public $event;
    public array $zaps;

    public function mount()
    {
        $this->loadCachedZaps();
    }

    public function loadCachedZaps()
    {
        $redisClient = Redis::connection('nostr')->client();
        $zaps = $redisClient->hGet('zaps', $this->event['id']);
        if ($zaps) {
            $this->zaps = json_decode($zaps, true, 512, JSON_THROW_ON_ERROR);
        }
        $this->dispatch('zapsLoaded');
    }

    public function cacheZaps($zaps)
    {
        $redisClient = Redis::connection('nostr')->client();
        $redisClient->hSet('zaps', $this->event['id'], json_encode($zaps, JSON_THROW_ON_ERROR));
    }
    public function render()
    {
        return view('livewire.nostr.zaps');
    }
}
