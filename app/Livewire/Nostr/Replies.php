<?php

namespace App\Livewire\Nostr;

use Illuminate\Support\Facades\Redis;
use Livewire\Component;

class Replies extends Component
{
    public $event;
    public array $replies = [];

    public function mount()
    {
        $this->loadCachedReplies();
    }

    public function loadCachedReplies()
    {
        $redisClient = Redis::connection('nostr')->client();
        $replies = $redisClient->hGet('replies', $this->event['id']);
        if ($replies) {
            $this->replies = json_decode($replies, true, 512, JSON_THROW_ON_ERROR);
        }
    }

    public function cacheReplies($replies)
    {
        $redisClient = Redis::connection('nostr')->client();
        $redisClient->hSet('replies', $this->event['id'], json_encode($replies, JSON_THROW_ON_ERROR));
    }

    public function render()
    {
        return view('livewire.nostr.replies');
    }
}
