<tbody x-data="nostrReposts(@this)" x-on:reposted.window="zapped($event.detail)" class="divide-y divide-white/5" x-show="currentTab === 'reposts'">
@foreach($reposts as $repost)
    <tr wire:key="repost_{{ $repost['id'] }}">
        <td class="py-4 px-4 max-w-[300px]">
            <livewire:nostr.author-card :event="$repost" :compact="true" :key="'repost_author_' . $repost['id']"/>
        </td>
        <td class="py-4 pl-0 pr-4 sm:pr-8 w-16">
            <div class="flex gap-x-3">
                <div class="font-mono text-sm leading-6 text-gray-400">

                </div>
            </div>
        </td>
        <td class="py-4 pl-0 pr-4 text-right text-sm leading-6 text-gray-400 sm:table-cell sm:pr-6 lg:pr-8">
            <time>
                {{ \Illuminate\Support\Carbon::parse($repost['created_at'])->diffForHumans() }}
            </time>
        </td>
    </tr>
@endforeach
</tbody>
