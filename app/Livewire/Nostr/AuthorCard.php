<?php

namespace App\Livewire\Nostr;

use Illuminate\Support\Facades\Redis;
use Livewire\Component;

class AuthorCard extends Component
{
    public $event;
    public $author;
    public $compact = false;

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
        $redisClient->hSet('authors', $author['hexpubkey'], json_encode($author, JSON_THROW_ON_ERROR));
    }

    public function render()
    {
        return view('livewire.nostr.author-card');
    }
}
