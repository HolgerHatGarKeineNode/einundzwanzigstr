@php
    $iconSize = $compact ? 'w-4 h-4' : 'w-6 h-6';
@endphp

<div class="relative p-4 sticky bottom-0 bg-[#1b1b1b] shadow rounded-lg">
    <div class="flex justify-between w-full">
        <div class="cursor-pointer flex space-x-2 items-center relative">
            <div class="text-amber-500">
                {{ $reactionCount }}
            </div>
            <x-fat-heart
                @click="openReactionPicker('{{ $event['id'] }}')"
                class="{{ $iconSize }} hover:text-amber-500"
            />
        </div>
        <div class="cursor-pointer flex space-x-2 items-center" @click="zap('{{ $event['id'] }}')">
            <div class="text-amber-500">
                {{ $zapAmount }}
            </div>
            <x-fat-bolt class="{{ $iconSize }} hover:text-amber-500"/>
        </div>
        <div class="cursor-pointer flex space-x-2 items-center" @click="repost('{{ $event['id'] }}')">
            <div class="text-amber-500">
                {{ $repostCount }}
            </div>
            <x-fat-arrows-turn-right class="{{ $iconSize }} hover:text-amber-500"
            />
        </div>
        <div class="cursor-pointer flex space-x-2 items-center" @click="openCommentEditor('{{ $event['id'] }}')">
            <x-fat-comment class="{{ $iconSize }} hover:text-amber-500"/>
        </div>
        <div class="cursor-pointer flex space-x-2 items-center" @click="debug('{{ $event['id'] }}')">
            <div class="text-amber-500"></div>
            <x-fat-ban-bug class="{{ $iconSize }} hover:text-amber-500"/>
        </div>
    </div>
</div>
