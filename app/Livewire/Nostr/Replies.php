<?php

namespace App\Livewire\Nostr;

use App\Traits\RenderHtml;
use Illuminate\Support\Facades\Redis;
use Livewire\Component;

class Replies extends Component
{
    use RenderHtml;

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
            $this->replies = collect(json_decode($replies, true, 512, JSON_THROW_ON_ERROR))
                ->map($this->renderReplyHtml())->toArray();
        }
    }

    public function renderReplyHtml(): \Closure
    {
        return function ($reply) {
            $reply['renderedHtml'] = $this->renderHtml($reply['content'], $reply['id']);
            if (count($reply['children']) > 0) {
                $reply['children'] = collect($reply['children'])
                    ->map($this->renderReplyHtml())
                    ->toArray();
            }
            return $reply;
        };
    }

    public function cacheReplies($replies)
    {
        $redisClient = Redis::connection('nostr')->client();
        $redisClient->hSet('replies', $this->event['id'], json_encode(collect($replies)
            ->map($this->renderReplyHtml())->toArray(), JSON_THROW_ON_ERROR));
    }

    public function render()
    {
        return view('livewire.nostr.replies');
    }
}
