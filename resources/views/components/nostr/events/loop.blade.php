@props([
    'event',
    'npubsCache',
    'renderedContentCache',
])

@php
    $redisClient = Illuminate\Support\Facades\Redis::connection('nostr')->client();
    $author = json_decode($redisClient->hGet('authors', $event['pubkey'] . ':' . $event['pubkey']), true);
    $reactions = json_decode($redisClient->hGet('reactions', $event['pubkey'] . ':' . $event['id']), true);
    $reactionsCount= count($reactions ?? []);
    $zaps = json_decode($redisClient->hGet('zaps', $event['pubkey'] . ':' . $event['id']), true);
    $zapsCount = collect($zaps)->sum('sats');
    $reposts = json_decode($redisClient->hGet('reposts', $event['pubkey'] . ':' . $event['id']), true);
    $repostsCount = count($reposts ?? []);
    $replies = json_decode($redisClient->hGet('replies', $event['pubkey'] . ':' . $event['id']), true);
@endphp

<div class="grid grid-cols-7 gap-2">
    <div
        class="h-[42rem] col-span-3 rounded-md bg-[#1b1b1b] px-6 py-4 shadow text-white overflow-x-hidden">
        <div class="flex flex-col justify-between space-y-2 h-full">
            <div class="flex justify-between">
                <a href="{{ isset($author['npub']) ? '/feed/' . $author['npub'] : '#' }}" class="flex">
                    <div class="mr-4 flex-shrink-0">
                        <img class="inline-block h-14 w-14 rounded-full"
                             src="{{ $author['profile']['image'] ?? '/img/nostr.png' }}"
                             alt="{{ urldecode($author['profile']['display_name'] ?? 'anon') }}"
                        />
                    </div>
                    <div>
                        <h4 class="text-lg font-bold">{{ urldecode($author['profile']['display_name'] ?? 'anon') }}</h4>
                        <h4 class="text-md font-bold">{{ $author['profile']['nip05'] ?? '' }}</h4>
                    </div>
                </a>
                <div>
                    <span
                        class="text-gray-300 text-xs">{{ \Illuminate\Support\Carbon::parse($event['created_at'])->diffForHumans() }}</span>
                </div>
            </div>
            <div class="ml-2 text-lg pb-12">{!! $this->renderHtml($event['content'], $event['id']) !!}</div>

            <div class="flex flex-wrap space-x-2 justify-end py-2">
                @foreach(collect($event['tags'])->filter(fn($tag) => $tag[0] === 't')->map(fn($tag) => $tag[1]) as $tag)
                    <div
                        class="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-amber-500 ring-1 ring-inset ring-gray-800">
                        <span>{{ $tag }}</span>
                    </div>
                @endforeach
            </div>

            <x-nostr.reactions
                :event="$event"
                :reactionsCount="$reactionsCount"
                :zapsCount="$zapsCount"
                :repostsCount="$repostsCount"
            />
        </div>
    </div>
    <div
        class="h-[42rem] col-span-2 rounded-md bg-[#1b1b1b] px-6 py-4 shadow text-white overflow-x-hidden">
        <x-nostr.replies :event="$event" :replies="$replies"/>
    </div>
    <div
        class="h-[42rem] col-span-2 rounded-md bg-[#1b1b1b] px-6 py-4 shadow text-white overflow-x-hidden">
        <x-nostr.details
            :event="$event"
            :reactions="$reactions"
            :zaps="$zaps"
            :reposts="$reposts"
        />
    </div>
</div>
