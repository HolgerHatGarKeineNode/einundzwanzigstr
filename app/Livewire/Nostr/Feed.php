<?php

namespace App\Livewire\Nostr;

use Illuminate\Support\Facades\Redis;
use Livewire\Attributes\Rule;
use Livewire\Component;

class Feed extends Component
{
    public ?string $pubkey = null;
    #[Rule('array')]
    public array $hexpubkeys = [];
    public array $events = [];
    public int $eventsLength = 0;
    public int $until = 0;
    public int $since = 0;

    public function loadCachedEvent()
    {
        $redisClient = Redis::connection('nostr')->client();
        $events = collect($redisClient->hGetAll('events'));
        $events = $events->filter(fn($event, $key) => str($key)->contains($this->hexpubkeys))->values();
        $this->events = $events->map(fn($event) => json_decode($event, true, 512, JSON_THROW_ON_ERROR))->sortByDesc('created_at')->toArray();
        if (count($this->events) > 0){
            $this->until = $this->events[0]['created_at'];
            $this->since = last($this->events)['created_at'];
        }
        $this->eventsLength = count($this->events);
    }

    public function cacheEvents($fetchedEvents)
    {
        $redisClient = Redis::connection('nostr')->client();
        foreach ($fetchedEvents as $fetchedEvent) {
            $redisClient->hSet('events', $fetchedEvent['pubkey'] . ':' . $fetchedEvent['id'], json_encode($fetchedEvent, JSON_THROW_ON_ERROR));
        }
    }

    public function render()
    {
        return view('livewire.nostr.feed');
    }
}
