<?php

namespace App\Livewire\Nostr;

use Illuminate\Support\Facades\Redis;
use Livewire\Component;

class Reactions extends Component
{
    public $event;
    public array $reactions;

    public function mount()
    {
        $this->loadCachedReactions();
    }

    public function loadCachedReactions()
    {
        $redisClient = Redis::connection('nostr')->client();
        $reactions = $redisClient->hGet('reactions', $this->event['id']);
        if ($reactions) {
            $this->reactions = json_decode($reactions, true, 512, JSON_THROW_ON_ERROR);
        }
        $this->dispatch('reactionsLoaded');
    }

    public function cacheReactions($reactions)
    {
        $redisClient = Redis::connection('nostr')->client();
        $redisClient->hSet('reactions', $this->event['id'], json_encode($reactions, JSON_THROW_ON_ERROR));
    }

    public function render()
    {
        return view('livewire.nostr.reactions');
    }
}
