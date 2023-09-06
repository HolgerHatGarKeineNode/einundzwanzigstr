<?php

namespace App\Livewire\Nostr;

use Illuminate\Support\Facades\Redis;
use Livewire\Component;

class Actions extends Component
{
    public $event;
    public bool $compact = false;
    public int $reactionCount = 0;
    public int $zapAmount = 0;
    public int $repostCount = 0;

    public function mount()
    {
        $this->loadCounts();
    }

    public function loadCounts(): void
    {
        $redisClient = Redis::connection('nostr')->client();
        $reactions = $redisClient->hGet('reactions', $this->event['id']);
        if ($reactions) {
            $this->reactionCount = count(json_decode($reactions, true, 512, JSON_THROW_ON_ERROR));
        }
        $zaps = $redisClient->hGet('zaps', $this->event['id']);
        if ($zaps) {
            $this->zapAmount = collect(json_decode($zaps, true, 512, JSON_THROW_ON_ERROR))
                ->sum('sats');
        }
        $reposts = $redisClient->hGet('reposts', $this->event['id']);
        if ($reposts) {
            $this->repostCount = count(json_decode($reposts, true, 512, JSON_THROW_ON_ERROR));
        }
    }

    public function render()
    {
        return view('livewire.nostr.actions');
    }
}
