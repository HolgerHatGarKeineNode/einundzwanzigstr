@props([
    'event',
    'reply',
])

<li class="" wire:key="reply_{{ $reply['id'] }}">
    <div class="relative pb-2">
        @if(!isset($reply['renderedHtml']))
            @dd($reply)
        @endif
        <livewire:nostr.author-card :event="$reply"/>
        <div class="ml-2 text-lg">{!! $reply['renderedHtml'] !!}</div>
        <livewire:nostr.actions :event="$reply" :compact="true"/>
    </div>
    @if(isset($reply['children']) && count($reply['children']) > 0)
        <ul class="ml-2">
            @foreach($reply['children'] as $reply)
                <x-nostr.replies.reply-loop :$reply :$event/>
            @endforeach
        </ul>
    @endif
</li>
