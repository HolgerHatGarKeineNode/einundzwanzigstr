<tbody x-data="nostrZaps(@this)" x-on:zapped.window="zapped($event.detail)" class="divide-y divide-white/5"
       x-show="currentTab === 'zaps'">
@foreach($zaps as $zap)
    <tr wire:key="zap_{{ $zap['id'] }}">
        <td class="py-4 px-4 max-w-[300px]">
            <livewire:nostr.author-card :event="$zap" :compact="true" :withTimestamp="false" :key="'zap_author_' . $zap['id']"/>
        </td>
        <td class="py-4 pl-0 pr-4 sm:pr-8 w-16">
            <div class="flex gap-x-3">
                <div class="font-mono text-sm leading-6 text-amber-500">
                    {{ $zap['sats'] }}
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
</tbody>
