<?php

namespace App\Livewire\Nostr;

use Illuminate\Support\Facades\Redis;
use Livewire\Component;

class Reposts extends Component
{
    public $event;
    public array $reposts = [];

    public function mount()
    {
        $this->loadCachedReposts();
    }

    public function loadCachedReposts()
    {
        $redisClient = Redis::connection('nostr')->client();
        $reposts = $redisClient->hGet('reposts', $this->event['id']);
        if ($reposts) {
            $this->reposts = json_decode($reposts, true, 512, JSON_THROW_ON_ERROR);
        }
        $this->dispatch('repostsLoaded');
    }

    public function cacheReposts($reposts)
    {
        $redisClient = Redis::connection('nostr')->client();
        $redisClient->hSet('reposts', $this->event['id'], json_encode($reposts, JSON_THROW_ON_ERROR));
    }

    public function render()
    {
        return view('livewire.nostr.reposts');
    }
}
