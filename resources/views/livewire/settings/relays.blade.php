<div x-data="nostrApp(@this)"
     @keydown.window.escape="openReactionModal = false">

    @include('layouts.partials.navigation')

    <div class="xl:pl-72 relative">
        <div id="loader" class="fixed"></div>

        <!-- Sticky search header -->
        @include('layouts.partials.header', [
            'withHasNewEvents' => false,
            'withCreateNoteModal' => false,
        ])

        <main>
            <x-nostr.secondary-header/>

            <div class="px-2 sm:px-12 pb-32">

                <x-nostr.no-nip07-alert/>

                <div class="px-4 py-16 sm:px-6 lg:flex-auto lg:px-0 lg:py-20">
                    <div class="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
                        <div>
                            <h2 class="text-base font-semibold leading-7 text-gray-200">Current relays</h2>
                            <p class="mt-1 text-sm leading-6 text-gray-500"></p>

                            <template x-for="relay in cachedRelays" :key="relay[1]">
                                <dl class="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
                                    <div class="pt-6 flex justify-between">
                                        <dt class="font-medium text-gray-200 sm:pr-6" x-text="relay[1]"></dt>
                                        <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0">
                                            {{--<button type="button" class="font-semibold text-amber-600 hover:text-amber-500">Update</button>--}}
                                        </dd>
                                    </div>
                                </dl>
                            </template>

                        </div>
                    </div>
                </div>

            </div>

        </main>
    </div>

    <x-button.circle x-ref="scrollToTop" amber lg class="!fixed hidden bottom-5 right-5"
                     @click="window.scrollTo({ top: 0, behavior: 'smooth' });">
        <x-fat-arrow-up class="w-6 h-6"/>
    </x-button.circle>

</div>
