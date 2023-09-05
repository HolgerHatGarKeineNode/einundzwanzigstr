<?php

namespace App\Http\Livewire;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Redis;
use Livewire\Component;

class Feed extends Component
{
    public int $hoursAgo = 1;
    public int $hoursSteps = 1;

    public int $until = 0;
    public int $since = 0;
    public int $limit = 5;
    public array $events = [];
    public int $fetchedEventsLength = 0;
    public array $cachedEvents = [];
    public ?string $pubkey = null;
    public array $pubkeys = [];
    public string $usedMemory = '';
    public bool $loading = false;
    public bool $hasNewEvents = false;
    public bool $showProfileHeader = false;
    public bool $showSignerRejectedAlert = false;
    public array $feedHexpubs = [];

    public array $cachedAuthorIds = [];

    public function rules()
    {
        return [
            'hoursAgo' => 'required',
            'since' => 'required',
            'until' => 'required',
            'eventsCache' => 'required',
            'usedMemory' => 'required',
            'feedHexpubs' => 'required',
            'cachedEvents' => 'required',
        ];
    }

    public function mount()
    {
        if (request()->route()->getName() === 'feed') {
            $this->showProfileHeader = true;
            $this->hoursAgo = 24;
            $this->hoursSteps = 24;
            $this->pubkeys = [$this->pubkey];
        }

        if (request()->route()->getName() === 'my-feed') {
            $this->feedHexpubs = session()->get('feedHexpubs', []);
        }

        if (request()->route()->getName() === 'gigi-feed') {
            $this->hoursAgo = 6;
            $this->hoursSteps = 6;
            $this->pubkeys = ['npub1dergggklka99wwrs92yz8wdjs952h2ux2ha2ed598ngwu9w7a6fsh9xzpc'];
        }

        if (request()->route()->getName() === 'd11n-feed') {
            $this->hoursAgo = 24;
            $this->hoursSteps = 24;
            $this->pubkeys = ['npub14j7wc366rf8efqvnnm8m68pazy04kkj8fgu6uqumh3eqlhfst0kqrngtpf'];
        }

        if (request()->route()->getName() === 'markus-turm-feed') {
            $this->hoursAgo = 24;
            $this->hoursSteps = 24;
            $this->pubkeys = ['npub17fqtu2mgf7zueq2kdusgzwr2lqwhgfl2scjsez77ddag2qx8vxaq3vnr8y'];
        }

        if (request()->route()->getName() === 'snowden-feed') {
            $this->hoursAgo = 24;
            $this->hoursSteps = 24;
            $this->pubkeys = ['npub1sn0wdenkukak0d9dfczzeacvhkrgz92ak56egt7vdgzn8pv2wfqqhrjdv9'];
        }

        if (request()->route()->getName() === 'einundzwanzig-feed') {
            $this->pubkeys = collect(Http::get('https://portal.einundzwanzig.space/api/nostrplebs')
                ->json()
            )->map(fn($item) => trim($item))->toArray();
        }

        if (count($this->feedHexpubs) > 0) {
            $this->setEvents();
        }

        $redisClient = Redis::connection('nostr')->client();
        $this->usedMemory = $redisClient->info('memory')['used_memory_human'];

        $this->cachedAuthorHashpubkeys = collect($redisClient->hGetAll('authors'))->keys()->map(fn($item) => str($item)->before(':')->toString())->toArray();
    }

    public function setEvents()
    {
        $redisClient = Redis::connection('nostr')->client();
        $collectEvents = collect([]);
        foreach ($this->feedHexpubs as $item) {
            $filteredEvents = collect($redisClient->hGetAll('events'))->filter(fn($event, $key) => str($key)->startsWith($item));
            $collectEvents = $collectEvents->merge($filteredEvents);
        }
        $events = $collectEvents
            ->map(fn($event) => json_decode($event, true))
            ->sortByDesc('created_at')->values();

        $this->fetchedEventsLength = $events->count();
        $this->events = $events->toArray();

        $this->since = $events->last()['created_at'] ?? 0;
        $this->until = $events->first()['created_at'] ?? 0;
        $this->cachedEvents = $events->toArray();
    }

    public function setFollowers($followers)
    {
        session()->put('followers', $followers);
        if ($this->pubkey) {
            return;
        }
        $this->setEvents();
    }

    public function setFeedHexpubs($hexpubs)
    {
        $this->feedHexpubs = $hexpubs;
        session()->put('feedHexpubs', $hexpubs);
        $this->setEvents();
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
            //$redisClient->expire($kind, 60 * 60);
        }

        if ($kind === 'events') {
            $this->setEvents();
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
            function ($matches) {
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
