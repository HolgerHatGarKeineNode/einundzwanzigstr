@props([
    'event',
    'reactionsCount',
    'zapsCount',
    'repostsCount',
])

@php
    $redisClient = Illuminate\Support\Facades\Redis::connection('nostr')->client();
    $human_readable = new \NumberFormatter('en_US', \NumberFormatter::PADDING_POSITION);
@endphp

<div class="relative p-4 sticky bottom-0 bg-[#1b1b1b] shadow rounded-lg">
    <div class="flex justify-between w-full">
        <div class="cursor-pointer flex space-x-2">
            <div class="text-amber-500">
                {{ $reactionsCount }}
            </div>
            <div class="flex justify-center">
                <!-- Trigger -->
                <x-fat-heart
                    @click="openReactionPicker('{{ $event['id'] }}')"
                    class="w-6 h-6 hover:text-amber-500"
                />
            </div>
        </div>
        <div class="cursor-pointer flex space-x-2" @click="zap('{{ $event['id'] }}')">
            <div class="text-amber-500">
                {{ $human_readable->format($zapsCount) }}
            </div>
            <x-fat-bolt class="w-6 h-6 hover:text-amber-500"/>
        </div>
        <div class="cursor-pointer flex space-x-2" @click="repost('{{ $event['id'] }}')">
            <div class="text-amber-500">
                {{ $human_readable->format($repostsCount) }}
            </div>
            <x-fat-arrows-turn-right class="w-6 h-6 hover:text-amber-500"
            />
        </div>
        <div class="cursor-pointer flex space-x-2" @click="openCommentEditor('{{ $event['id'] }}')">
            <x-fat-comment class="w-6 h-6 hover:text-amber-500"/>
        </div>
        <div class="cursor-pointer flex space-x-2" @click="debug('{{ $event['id'] }}')">
            <div class="text-amber-500"></div>
            <x-fat-ban-bug class="w-6 h-6 hover:text-amber-500"/>
        </div>
    </div>
</div>
