<div x-data="nostrPlebs(@this)">
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
