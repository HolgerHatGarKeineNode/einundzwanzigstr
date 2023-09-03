@props([
    'event',
])

@php
    $redisClient = Illuminate\Support\Facades\Redis::connection('nostr')->client();
    $reactions = json_decode($redisClient->hGet('reactions', $event['pubkey'] . ':' . $event['id']), true);
@endphp

<div class="relative p-4 sticky bottom-0 bg-[#1b1b1b] shadow rounded-lg">
        <div class="flex justify-between w-full">
            <div class="cursor-pointer flex space-x-2" @click="openReactionModal = true">
                <div class="text-amber-500">
                    0
                </div>
                <div class="flex justify-center">
                    <!-- Trigger -->
                    <x-fat-heart
                            @click="openReactionPicker(event)"
                            class="w-6 h-6 hover:text-amber-500"
                            {{--::class="reactionsCache[event.id].reacted ? 'text-amber-500' : ''"--}}
                    />
                </div>
            </div>
            <div class="cursor-pointer flex space-x-2" @click="zap(event)">
                <div class="text-amber-500"
                     {{--x-text="numberFormat(reactionsCache[event.id].zaps ?? 0)"--}}
                >
                    0
                </div>
                <x-fat-bolt class="w-6 h-6 hover:text-amber-500"/>
            </div>
            <div class="cursor-pointer flex space-x-2" @click="repost(event)">
                <div class="text-amber-500"
                     {{--x-text="numberFormat(reactionsCache[event.id].reposts ?? 0)"--}}
                >
                    0
                </div>
                <x-fat-arrows-turn-right class="w-6 h-6 hover:text-amber-500"
                    {{--::class="reactionsCache[event.id].reposted ? 'text-amber-500' : ''"--}}
                />
            </div>
            <div class="cursor-pointer flex space-x-2" @click="openCommentEditor(event)">
                <div class="text-amber-500"
                     {{--x-text="reactionsCache[event.id].replies && reactionsCache[event.id].replies.length"--}}
                >
                    0
                </div>
                <x-fat-comment class="w-6 h-6 hover:text-amber-500"/>
            </div>
            <div class="cursor-pointer flex space-x-2"
                 {{--@click="console.log(JSON.parse(JSON.stringify(event)))"--}}
            >
                <div class="text-amber-500"></div>
                <x-fat-ban-bug class="w-6 h-6 hover:text-amber-500"/>
            </div>
        </div>
</div>
