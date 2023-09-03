@props([
    'event',
    'npubsCache',
    'renderedContentCache',
])

@php
    $redisClient = Illuminate\Support\Facades\Redis::connection('nostr')->client();
    $author = json_decode($redisClient->hGet('authors', $event['pubkey'] . ':' . $event['pubkey']), true);
@endphp

<div class="grid grid-cols-7 gap-2">
    <div
            class="h-[42rem] col-span-3 rounded-md bg-[#1b1b1b] px-6 py-4 shadow text-white overflow-x-hidden">
        <div class="flex flex-col justify-between space-y-2 h-full">
            <div class="flex justify-between">
                <a href="/feed/{{ $author['npub'] }}" class="flex">
                    <div class="mr-4 flex-shrink-0">
                        <img class="inline-block h-14 w-14 rounded-full"
                             src="{{ $author['profile']['image'] }}"
                             alt="{{ urldecode($author['profile']['display_name']) }}"
                        />
                    </div>
                    <div>
                        <h4 class="text-lg font-bold">{{ urldecode($author['profile']['display_name']) }}</h4>
                        <h4 class="text-md font-bold">{{ $author['profile']['nip05'] }}</h4>
                    </div>
                </a>
                <div>
                    <span class="text-gray-300 text-xs">{{ \Illuminate\Support\Carbon::parse($event['created_at'])->diffForHumans() }}</span>
                </div>
            </div>
            <div class="pl-16 ml-2 text-lg pb-12">{!! $event['content'] !!}</div>
            {{--todo: add tags again --}}
            {{--<div x-show="event.tags.filter((tag) => tag[0] === 't').length"
                 class="flex space-x-2 justify-end py-2">
                <template x-for="tag in event.tags.filter((tag) => tag[0] === 't')">

                    <div
                        class="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-amber-500 ring-1 ring-inset ring-gray-800">
                        <span x-text="tag[1]"></span>
                    </div>
                </template>
            </div>--}}

            <x-nostr.reactions :event="$event"/>
        </div>
    </div>
    <div
            class="h-[42rem] col-span-2 rounded-md bg-[#1b1b1b] px-6 py-4 shadow text-white overflow-x-hidden">
        <x-nostr.replies :event="$event"/>
    </div>
    <div
            class="h-[42rem] col-span-2 rounded-md bg-[#1b1b1b] px-6 py-4 shadow text-white overflow-x-hidden">
        <x-nostr.details :event="$event"/>
    </div>
</div>
