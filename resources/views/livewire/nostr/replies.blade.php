<div x-data="nostrReplies(@this)" x-on:replied.window="replied($event.detail)" class="flex flex-col">
    <div>
        <h3 class="pb-2">Replies</h3>
    </div>
    <div class="flow-root">
        <ul class="tree">
            @foreach($replies as $reply)
                <x-nostr.replies.reply-loop :reply="$reply" :event="$event"/>
            @endforeach
        </ul>
    </div>
</div>
