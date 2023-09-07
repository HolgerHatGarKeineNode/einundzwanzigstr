<?php

namespace App\Livewire\Nostr;

use Illuminate\Support\Facades\Redis;
use Livewire\Component;

class Feed extends Component
{
    public ?string $pubkey = null;
    public bool $isMyFeed = false;
    public array $hexpubkeys = [];
    public array $events = [];
    public int $eventsLength = 0;
    public int $until = 0;
    public int $since = 0;
    public int $timeSteps = 600;

    public function mount()
    {
        if (request()->route()->getName() === 'my-feed') {
            $this->isMyFeed = true;
        }
        if (
            (request()->route()->getName() === 'feed')
            && request()->route()->parameter('pubkey') !== 'npub1dergggklka99wwrs92yz8wdjs952h2ux2ha2ed598ngwu9w7a6fsh9xzpc'
        ) {
            // set timeSteps to 24 hours if not my feed
            $this->timeSteps = 86400;
        }
        $this->until = time();
        // since is set to 10 minutes ago to avoid missing events that were created in the last 10 minutes
        $this->since = time() - $this->timeSteps;
    }

    public function loadCachedEvent()
    {
        $redisClient = Redis::connection('nostr')->client();
        $events = collect($redisClient->hGetAll('events'));
        $events = $events
            ->filter(
                fn($event, $key) => str($key)->contains($this->hexpubkeys)
                    && json_decode($event, true, 512, JSON_THROW_ON_ERROR)['created_at'] > $this->since
            )
            ->values();
        $this->events = $events->map(fn($event) => json_decode($event, true, 512, JSON_THROW_ON_ERROR))
            ->sortByDesc('created_at')
            ->values()
            ->toArray();
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
