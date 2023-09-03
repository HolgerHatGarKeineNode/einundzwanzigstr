<?php

namespace App\Http\Livewire;

use Illuminate\Support\Facades\Redis;
use Livewire\Component;

class Feed extends Component
{
    public int $hoursAgo = 6;

    public array $events = [];
    public ?string $pubkey = null;
    public string $usedMemory = '';
    public bool $loading = false;
    public bool $hasNewEvents = false;
    public bool $showProfileHeader = false;
    public bool $showSignerRejectedAlert = false;

    public array $feedHexpubs = [];

    public function rules()
    {
        return [
            'hoursAgo' => 'required',
            'eventsCache' => 'required',
            'usedMemory' => 'required',
            'feedHexpubs' => 'required',
        ];
    }

    public function mount()
    {
        $redisClient = Redis::connection('nostr')->client();
        $this->usedMemory = $redisClient->info('memory')['used_memory_human'];
    }

    public function reloadFeed()
    {
        $this->updatedFeedEvents();
    }

    public function updatedFeedEvents()
    {
        $redisClient = Redis::connection('nostr')->client();
        $collectEvents = collect([]);
        foreach ($this->feedHexpubs as $item) {
            $cachedEvents = $redisClient->hGetAll('events');
            $filteredEvents = collect($redisClient->hGetAll('events'))->filter(fn($event, $key) => str($key)->startsWith($item));
            $collectEvents = $collectEvents->merge($filteredEvents);
        }
        $this->events = $collectEvents
            ->map(fn($event) => json_decode($event, true))
            ->sortByDesc('created_at')->values()->toArray();
    }

    public function setFollowers($followers)
    {
        session()->put('followers', $followers);
        if ($this->pubkey) {
            return;
        }
        $this->updatedFeedEvents();
    }

    public function setFeedHexpubs($hexpubs)
    {
        $this->feedHexpubs = $hexpubs;
    }

    public function setCache($items, $kind)
    {
        $redisClient = Redis::connection('nostr')->client();
        foreach ($items as $key => $item) {
            if ($kind === 'events') {
                $key = $item['id'];
                $item['value'] = $item;
            }
            if (!isset($item['pubkey'])) {
                dd($items, $kind);
            }
            $redisClient->hSet($kind, $item['pubkey'] . ':' . $key, json_encode($item['value']));
        }
    }

    public function render()
    {
        return view('livewire.feed')->layout('layouts.guest');
    }

    protected function renderHtml($text, $id)
    {
        // replace \n by <br>
        $text = str_replace("\n", '<br>', $text);

        // replace links by a tag
        $text = preg_replace_callback('/(https?:\/\/[^\s]+)/i',
            function($matches) {
                // check if matches does not include images
                if (preg_match('/(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|mov|mp4|ogg))/i', $matches[1])) {
                    return $matches[0];
                }
                return '<a class="text-amber-500 font-bold" href="' . $matches[1] . '" target="_blank">' . $matches[1] . '</a>';
            },
            $text);

        return $text;
    }
}
