<tbody x-data="nostrReactions(@this)" class="divide-y divide-white/5" x-show="currentTab === 'reactions'">
@foreach($reactions as $reaction)
    <tr wire:key="reaction_{{ $reaction['id'] }}">
        <td class="py-4 px-4 max-w-[300px]">
            <livewire:nostr.author-card :event="$reaction" :compact="true"/>
        </td>
        <td class="py-4 pl-0 pr-4 sm:pr-8 w-16">
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
</tbody>
