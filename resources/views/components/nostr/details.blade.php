@props([
    'event',
])

<div x-data="{
    currentTab: 'reactions',
    tabs: [
        { name: 'reactions', label: 'Reactions' },
        { name: 'zaps', label: 'Zaps' },
        { name: 'reposts', label: 'Reposts' },
    ],
    switchTab(tabName) {
        this.currentTab = tabName;
    },
}">
    <nav class="flex border-b border-white/10">
        <ul role="list"
            class="flex min-w-full flex-none gap-x-6 px-4 text-sm font-semibold leading-6 text-gray-400 sm:px-6 lg:px-8">
            <template x-for="tab in tabs" :key="tab.name">
                <li>
                    <div @click="switchTab(tab.name)" :class="currentTab === tab.name ? 'text-amber-400' : ''"
                         class="cursor-pointer">
                        <span x-text="tab.label"></span>
                    </div>
            </template>
        </ul>
    </nav>
    <table class="max-h-[40rem] w-full">
        <colgroup>
            <col class="w-full sm:w-4/12">
            <col class="lg:w-4/12">
            <col class="lg:w-1/12">
        </colgroup>

        {{-- REACTIONS --}}
        <livewire:nostr.reactions :$event :key="'reactions_' . $event['id']"/>

        {{-- ZAPS --}}
        <livewire:nostr.zaps :$event :key="'zaps_' . $event['id']"/>

        {{-- BOOSTS --}}
        <livewire:nostr.reposts :$event :key="'reposts_' . $event['id']"/>

    </table>
</div>
