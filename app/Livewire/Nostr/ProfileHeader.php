<?php

namespace App\Livewire\Nostr;

use Illuminate\Support\Facades\Redis;
use Livewire\Component;

class ProfileHeader extends Component
{
    public $pubkey = '';
    public $author;
    public $hexpubkeys;

    public function mount()
    {
        $redisClient = Redis::connection('nostr')->client();
        $author = $redisClient->hGet('authors', $this->hexpubkeys[0]);
        if ($author) {
            $this->author = json_decode($redisClient->hGet('authors', $this->hexpubkeys[0]), true, 512, JSON_THROW_ON_ERROR);
        }
    }

    public function render()
    {
        return view('livewire.nostr.profile-header');
    }

    public function getProxyImageUrl($url, $isBanner = false)
    {
        if (isset($url)) {
            $width = $isBanner ? 1080 : 128;
            return route('img.proxy', ['url' => base64_encode($url), 'w' => $width,]);
        }
        if ($isBanner) {
            return asset('/img/nostr.gif');
        }
        return asset('/img/nostr.png');
    }
}
