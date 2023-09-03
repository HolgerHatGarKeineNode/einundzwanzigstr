@props([
    'event',
    'replies',
])

@php
    $redisClient = Illuminate\Support\Facades\Redis::connection('nostr')->client();
@endphp

<div class="flex flex-col">
    <div>
        <h3 class="pb-2">Replies</h3>
    </div>
    <div class="flow-root">
        <ul class="tree">
            @foreach($replies ?? [] as $reply)
                <x-nostr.replies.reply-loop :reply="$reply" :event="$event"/>
            @endforeach
        </ul>
    </div>
</div>
