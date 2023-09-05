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

    public ?string $currentFeedAuthorHexpubkey = null;

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
            'currentFeedAuthorHexpubkey' => 'required',
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
            $this->showProfileHeader = true;
            $this->hoursAgo = 6;
            $this->hoursSteps = 6;
            $this->pubkeys = ['npub1dergggklka99wwrs92yz8wdjs952h2ux2ha2ed598ngwu9w7a6fsh9xzpc'];
        }

        if (request()->route()->getName() === 'd11n-feed') {
            $this->showProfileHeader = true;
            $this->hoursAgo = 24;
            $this->hoursSteps = 24;
            $this->pubkeys = ['npub14j7wc366rf8efqvnnm8m68pazy04kkj8fgu6uqumh3eqlhfst0kqrngtpf'];
        }

        if (request()->route()->getName() === 'markus-turm-feed') {
            $this->showProfileHeader = true;
            $this->hoursAgo = 24;
            $this->hoursSteps = 24;
            $this->pubkeys = ['npub17fqtu2mgf7zueq2kdusgzwr2lqwhgfl2scjsez77ddag2qx8vxaq3vnr8y'];
        }

        if (request()->route()->getName() === 'snowden-feed') {
            $this->showProfileHeader = true;
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
        if ($this->showProfileHeader) {
            $this->currentFeedAuthorHexpubkey = $hexpubs[0];
        }
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
        // parse urls to images to img tags
        $text = preg_replace(
            '/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:.+)\.(?:jpg|jpeg|gif|png|webp)/',
            '<div class="aspect-auto max-w-sm"><img src="$0" alt="image" class="rounded-lg"></div>',
            $text
        );

        // parse urls with video like mp4, webm, ogg to video controls
        $text = preg_replace(
            '/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:.+)\.(?:mp4|webm|ogg)/',
            '<div class="aspect-auto max-w-sm"><video controls><source src="$0" type="video/mp4"></video></div>',
            $text
        );

        // parse video urls to video embeds
        $text = $this->parseVideoUrls($text);

        // replace \n by <br>
        $text = str_replace("\n", '<br>', $text);

        return $text;
    }

    protected function parseVideoUrls($text) {
        $text = preg_replace(
            '/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/',
            '<div class=""><iframe src="https://www.youtube.com/embed/$1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>',
            $text
        );
        $text = preg_replace(
            '/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:vimeo\.com)\/(?:watch\?v=)?(.+)/',
            '<div class=""><iframe src="https://player.vimeo.com/video/$1" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>',
            $text
        );
        $text = preg_replace(
            '/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:twitch\.tv)\/(?:watch\?v=)?(.+)/',
            '<div class=""><iframe src="https://player.twitch.tv/?channel=$1" frameborder="0" allowfullscreen></iframe></div>',
            $text
        );
        $text = preg_replace(
            '/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:twitter\.com)\/(?:watch\?v=)?(.+)/',
            '<div class=""><iframe src="https://twitter.com/i/status/$1" frameborder="0" allowfullscreen></iframe></div>',
            $text
        );
        $text = preg_replace(
            '/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:instagram\.com)\/(?:watch\?v=)?(.+)/',
            '<div class=""><iframe src="https://www.instagram.com/p/$1/embed" frameborder="0" allowfullscreen></iframe></div>',
            $text
        );
        $text = preg_replace(
            '/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:facebook\.com)\/(?:watch\?v=)?(.+)/',
            '<div class=""><iframe src="https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2F$1&show_text=0&width=560" width="560" height="315" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen></iframe></div>',
            $text
        );

        return $text;
    }
}
