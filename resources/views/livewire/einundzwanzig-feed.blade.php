<div
        x-data="nostrApp(@this)"
        wire:ignore
        @keydown.window.escape="openReactionModal = false"
>
    @include('layouts.partials.navigation')

    <div class="xl:pl-72 relative">
        <div id="loader" class="fixed"></div>
        <!-- Sticky search header -->
        @include('layouts.partials.header')

        <main>
            {{--<x-nostr.secondary-header/>--}}

            <!-- CONTENT -->
            <div class="px-2 sm:px-12 pb-32">

                <ul role="list" class="space-y-3">

                    <x-nostr.no-nip07-alert/>

                    <template
                            x-for="event in Object.fromEntries(Object.entries(events).sort(([,a],[,b]) => b.created_at-a.created_at))"
                            :key="event.id">
                        <li :id="event.id">
                            <x-nostr.events.loop/>

                            {{-- MODALS --}}
                            <x-nostr.modals.reaction/>
                            <x-nostr.modals.comment/>
                            <x-nostr.modals.create-note/>
                        </li>
                    </template>

                </ul>

                <div class="flex justify-center mt-12">
                    <x-button x-bind:disabled="loading" amber @click="loadMore" spinner loading-delay="shortest">
                        <x-fat-loader class="w-6 h-6 mr-2"/>
                        <span>Load more...</span>
                    </x-button>
                </div>
            </div>

        </main>
    </div>

    <x-button.circle x-ref="scrollToTop" amber lg class="!fixed hidden bottom-5 right-5"
                     @click="window.scrollTo({ top: 0, behavior: 'smooth' });">
        <x-fat-arrow-up class="w-6 h-6"/>
    </x-button.circle>
</div>
