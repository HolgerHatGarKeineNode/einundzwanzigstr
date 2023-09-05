<div
    x-data="nostrApp(@this)"
    @keydown.window.escape="openReactionModal = false"
>
    @include('layouts.partials.navigation')

    <div class="xl:pl-72 relative">
        <div id="loader" class="fixed"></div>

        <!-- Sticky search header -->
        @include('layouts.partials.header')

        <main>
            {{--<x-nostr.secondary-header/>--}}

            <x-nostr.profile-header/>

            <!-- CONTENT -->
            <div class="px-2 sm:px-12 pt-12 pb-32">

                <x-nostr.no-nip07-alert/>

                <ul role="list" class="space-y-3">

                    @foreach($events as $event)
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

                        <li wire:key="{{ $event['id'] }}">
                            <x-nostr.events.loop
                                :event="$event"
                                :author="$author"
                                :reactionsCount="$reactionsCount"
                                :zapsCount="$zapsCount"
                                :repostsCount="$repostsCount"
                                :replies="$replies"
                                :reactions="$reactions"
                                :zaps="$zaps"
                                :reposts="$reposts"
                            />

                            {{-- MODALS --}}
                            <x-nostr.modals.reaction/>
                            {{--<x-nostr.modals.comment/>--}}
                            {{--<x-nostr.modals.create-note/>--}}
                        </li>
                    @endforeach

                </ul>

                <div class="flex justify-center mt-12">
                    <x-button x-bind:disabled="loading" amber @click="loadMoreEvents" spinner loading-delay="shortest">
                        <x-fat-loader class="w-6 h-6 mr-2"/>
                        <span>Load more...</span>
                    </x-button>
                </div>
            </div>

        </main>
    </div>

    <x-button.circle x-ref="scrollToTop" amber lg class="!fixed hidden bottom-5 right-5"
                     @click="window.scrollTo({ top: 0, behavior: 'smooth' });">
        <x-fat-arrow-up class="w-6 h-6"/>
    </x-button.circle>
</div>
