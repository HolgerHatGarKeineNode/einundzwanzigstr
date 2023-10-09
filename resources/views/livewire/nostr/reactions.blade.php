<tbody x-data="nostrReactions(@this)" x-on:loved.window="loved($event.detail)" class="divide-y divide-white/5" x-show="currentTab === 'reactions'">
@foreach($reactions as $reaction)
    <tr wire:key="reaction_{{ $reaction['id'] }}">
        <td class="p-2 table-cell">
            <livewire:nostr.author-card :event="$reaction" :compact="true" :withTimestamp="false" :key="'reaction_author_' . $reaction['id']"/>
        </td>
        <td class="p-2 flex justify-center items-center table-cell">
            <div class="font-mono text-sm leading-6 text-gray-400">
                {{ $reaction['content'] === '+' ? 'boost': $reaction['content'] }}
            </div>
        </td>
        <td class="p-2 table-cell">
            <time>
                {{ \Illuminate\Support\Carbon::parse($reaction['created_at'])->diffForHumans() }}
            </time>
        </td>
    </tr>
@endforeach
</tbody>
