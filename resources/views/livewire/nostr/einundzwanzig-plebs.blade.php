<div x-data="nostrPlebs(@this)" x-on:followall.window="followall">

    <div class="py-4" x-show="isFollowingAll" x-cloak>
        <div
            class="bg-purple-900 rounded h-6 mt-5"
            role="progressbar"
            :aria-valuenow="width"
            aria-valuemin="0"
            aria-valuemax="100"
        >
            <div
                class="bg-purple-800 rounded h-6 text-center text-white text-sm transition"
                :style="`width: ${width}%; transition: width 2s;`"
                x-text="`${width}%`"
            >
            </div>
        </div>
    </div>

    <ul role="list" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

        @foreach($plebs as $pleb)
            <li class="col-span-1 rounded-lg bg-[#1b1b1b] shadow p-4">
                <livewire:nostr.author-card
                    :key="'pleb_' . $pleb"
                    :event="['pubkey' => $pleb]"
                    :compact="true"
                    :withTimestamp="false"
                />
            </li>
        @endforeach

    </ul>
</div>
