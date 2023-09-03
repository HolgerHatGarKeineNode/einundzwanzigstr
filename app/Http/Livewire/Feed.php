<?php

namespace App\Http\Livewire;

use Illuminate\Support\Facades\Redis;
use Livewire\Component;

class Feed extends Component
{
    public array $events = [];
    public string $usedMemory = '';
    public bool $loading = false;
    public bool $hasNewEvents = false;
    public bool $showProfileHeader = false;
    public bool $showSignerRejectedAlert = false;

    public array $feedHexpubs = [];

    public function rules()
    {
        return [
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

    public function setFollowers($followers)
    {
        session()->put('followers', $followers);
        $this->updatedFeedHexpubs($followers);
    }

    public function updatedFeedHexpubs($value)
    {
        $redisClient = Redis::connection('nostr')->client();
        $collectEvents = collect([]);
        foreach ($value as $item) {
            $cachedEvents = $redisClient->hGetAll('events');
            $filteredEvents = collect($redisClient->hGetAll('events'))->filter(fn($event, $key) => str($key)->startsWith($item));
            $collectEvents = $collectEvents->merge($filteredEvents);
        }
        $this->events = $collectEvents
            ->map(fn($event) => json_decode($event, true))
            ->sortByDesc('created_at')->values()->toArray();
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
}
