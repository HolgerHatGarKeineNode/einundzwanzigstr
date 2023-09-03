@props([
    'event',
    'reactions',
    'zaps',
    'reposts',
])

@php
    $redisClient = Illuminate\Support\Facades\Redis::connection('nostr')->client();
@endphp

<div x-data="{
    currentTab: 'reactions',
    tabs: [
        { name: 'reactions', label: 'Reactions' },
        { name: 'zaps', label: 'Zaps' },
        { name: 'reposts', label: 'Reposts' },
    ],
    switchTab(tabName) {
        this.currentTab = tabName;
    },
}">
    <nav class="flex border-b border-white/10">
        <ul role="list"
            class="flex min-w-full flex-none gap-x-6 px-4 text-sm font-semibold leading-6 text-gray-400 sm:px-6 lg:px-8">
            <template x-for="tab in tabs" :key="tab.name">
                <li>
                    <div @click="switchTab(tab.name)" :class="currentTab === tab.name ? 'text-amber-400' : ''"
                         class="cursor-pointer">
                        <span x-text="tab.label"></span>
                    </div>
            </template>
        </ul>
    </nav>
    <table class="max-h-[40rem] w-full whitespace-nowrap text-left">
        <colgroup>
            <col class="w-full sm:w-4/12">
            <col class="lg:w-4/12">
            <col class="lg:w-1/12">
        </colgroup>

        <tbody class="divide-y divide-white/5 overflow-x-hidden overflow-y-scroll">

        {{-- REACTIONS --}}
        @foreach($reactions ?? [] as $reaction)
            @php
                $author = json_decode($redisClient->hGet('authors', $reaction['pubkey'] . ':' . $reaction['pubkey']), true);
                if (!isset($author['profile']['image'])) {
                    $author['profile']['image'] = '/img/nostr.png';
                    $author['profile']['display_name'] = 'anon';
                }
            @endphp
            <tr x-show="currentTab === 'reactions'" wire:key="reaction_{{ $reaction['id'] }}">
                <td class="py-4 px-4 max-w-[150px]">
                    <a href="{{ isset($author['npub']) ? '/feed/' . $author['npub'] : '#' }}" class="flex">
                        <div class="flex items-center gap-x-4">
                            <img
                                    src="{{ $author['profile']['image'] }}"
                                    alt="{{ isset($author['profile']['display_name']) ? str($author['profile']['display_name'])->limit(1, '') : 'A' }}"
                                    class="h-8 w-8 rounded-full bg-gray-800">
                            <div class="truncate text-sm font-medium leading-6 text-white">
                                {{ isset($author['profile']['display_name']) ? urldecode($author['profile']['display_name']) : 'anon' }}
                            </div>
                        </div>
                    </a>
                </td>
                <td class="py-4 pl-0 pr-4 sm:pr-8">
                    <div class="flex gap-x-3">
                        <div class="font-mono text-sm leading-6 text-gray-400">
                            {{ $reaction['content'] === '+' ? 'boost': $reaction['content'] }}
                        </div>
                    </div>
                </td>
                <td class="py-4 pl-0 pr-4 text-right text-sm leading-6 text-gray-400 sm:table-cell sm:pr-6 lg:pr-8">
                    <time>
                        {{ \Illuminate\Support\Carbon::parse($reaction['created_at'])->diffForHumans() }}
                    </time>
                </td>
            </tr>
        @endforeach

        {{-- ZAPS --}}
        @foreach($zaps ?? [] as $zap)
            @php
                $author = json_decode($redisClient->hGet('authors', $zap['pubkey'] . ':' . $zap['pubkey']), true);
                if (!isset($author['profile']['image'])) {
                    $author['profile']['image'] = '/img/nostr.png';
                    $author['profile']['display_name'] = 'anon';
                }
            @endphp
            <tr x-show="currentTab === 'zaps'">
                <td class="py-4 px-4 max-w-[150px]">
                    <a
                            {{--:href="authorMetaData[reaction.senderPubkey] ? '/feed/' + authorMetaData[reaction.senderPubkey].npub : '#'"--}}
                    >
                        <div class="flex items-center gap-x-4">
                            <img
                                    src="{{ $author['profile']['image'] }}"
                                    alt="{{ str($author['profile']['display_name'])->limit(1, '') }}"
                                    class="h-8 w-8 rounded-full bg-gray-800">
                            <div
                                    class="truncate text-sm font-medium leading-6 text-white"
                            >
                                {{ urldecode($author['profile']['display_name']) }}
                            </div>
                        </div>
                    </a>
                </td>
                <td class="py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                    <div class="flex gap-x-3">
                        <div class="font-mono text-sm leading-6 text-amber-500"
                                {{--x-text="numberFormat(reaction.amount) + ' sats'"--}}
                        >
                            {{ $zap['sats'] }} sats
                        </div>
                    </div>
                </td>
                <td class="py-4 pl-0 pr-4 text-right text-sm leading-6 text-gray-400 sm:table-cell sm:pr-6 lg:pr-8">
                    <time>
                        {{ \Illuminate\Support\Carbon::parse($zap['created_at'])->diffForHumans() }}
                    </time>
                </td>
            </tr>
        @endforeach

        {{-- BOOSTS --}}
        @foreach($reposts ?? [] as $repost)
            @php
                $author = json_decode($redisClient->hGet('authors', $repost['pubkey'] . ':' . $repost['pubkey']), true);
                if (!isset($author['profile']['image'])) {
                    $author['profile']['image'] = '/img/nostr.png';
                    $author['profile']['display_name'] = 'anon';
                }
            @endphp
            <tr x-show="currentTab === 'reposts'">
                <td class="py-4 px-4 max-w-[150px]">
                    <a
                            {{--:href="authorMetaData[reaction.pubkey] ? '/feed/' + authorMetaData[reaction.pubkey].npub : '/img/nostr.png'"--}}
                    >
                        <div class="flex items-center gap-x-4">
                            <img
                                    src="{{ $author['profile']['image'] }}"
                                    alt="{{ str($author['profile']['display_name'])->limit(1, '') }}"
                                    class="h-8 w-8 rounded-full bg-gray-800">
                            <div class="truncate text-sm font-medium leading-6 text-white">
                                {{ urldecode($author['profile']['display_name']) }}
                            </div>
                        </div>
                    </a>
                </td>
                <td class="py-4 pl-0 pr-4 sm:table-cell sm:pr-8">

                </td>
                <td class="py-4 pl-0 pr-4 text-right text-sm leading-6 text-gray-400 sm:table-cell sm:pr-6 lg:pr-8">
                    <time>
                        {{ \Illuminate\Support\Carbon::parse($repost['created_at'])->diffForHumans() }}
                    </time>
                </td>
            </tr>
        @endforeach

        </tbody>
    </table>
</div>
