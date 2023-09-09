<?php

namespace App\Livewire\Nostr;

use Illuminate\Support\Facades\Redis;
use Livewire\Component;

class AuthorCard extends Component
{
    public $event;
    public $author;
    public $compact = false;
    public $withTimestamp = true;

    public function mount()
    {
        $redisClient = Redis::connection('nostr')->client();
        $author = $redisClient->hGet('authors', $this->event['pubkey']);
        if ($author) {
            $this->author = json_decode($redisClient->hGet('authors', $this->event['pubkey']), true, 512, JSON_THROW_ON_ERROR);
        }
    }

    public function updatedAuthor($author)
    {
        $redisClient = Redis::connection('nostr')->client();

        if (is_string($author)) {
            return;
        }

        if (is_int($author)) {
            return;
        }

        $redisClient->hSet('authors', $author['hexpubkey'], json_encode($author, JSON_THROW_ON_ERROR));
    }

    public function getProxyImageUrl($url){
        if (isset($url)) {
            return route('img.proxy', ['url' => base64_encode($url), 'w' => 54,]);
        }
        return asset('/img/nostr.png');
    }

    public function render()
    {
        return view('livewire.nostr.author-card');
    }
}
