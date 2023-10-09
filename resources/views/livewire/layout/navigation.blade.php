<header class="sticky top-0 z-40 inset-x-0 top-0 z-50 flex flex-col h-16 border-b border-gray-900/10 bg-[#1b1b1b]">
    <div class="mx-auto flex w-full items-center justify-between px-8 py-4 z-50">
        <div class="flex flex-1 items-center gap-x-6">
            <img class="h-8 w-auto" src="{{ asset('img/einundzwanzig-horizontal-inverted.svg') }}"
                 alt="Einundzwanzig">
        </div>
        <nav class="md:flex md:gap-x-11 md:text-sm md:font-semibold md:leading-6 md:text-gray-200"
             x-data="Components.popoverGroup()" x-init="init()">
            <div x-data="Components.popover({ open: false, focus: false })" x-init="init()" @keydown.escape="onEscape"
                 @close-popover-group.window="onClosePopoverGroup">
                <button type="button" class="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-100"
                        @click="toggle" @mousedown="if (open) $event.preventDefault()" aria-expanded="true"
                        :aria-expanded="open.toString()">
                    Einundzwanzig
                    <svg class="h-5 w-5 flex-none text-gray-400" viewBox="0 0 20 20" fill="currentColor"
                         aria-hidden="true">
                        <path fill-rule="evenodd"
                              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                              clip-rule="evenodd"></path>
                    </svg>
                </button>
                <div x-show="open" x-transition:enter="transition ease-out duration-200"
                     x-transition:enter-start="opacity-0 -translate-y-1"
                     x-transition:enter-end="opacity-100 translate-y-0"
                     x-transition:leave="transition ease-in duration-150"
                     x-transition:leave-start="opacity-100 translate-y-0"
                     x-transition:leave-end="opacity-0 -translate-y-1"
                     x-description="'Product' flyout menu, show/hide based on flyout menu state."
                     class="absolute inset-x-0 top-0 -z-10 bg-[#222222] pt-16 shadow-lg ring-1 ring-gray-900/5"
                     x-ref="panel" @click.away="open = false" x-cloak>
                    <div class="mx-auto grid max-w-7xl grid-cols-1 gap-y-10 gap-x-8 py-10 px-6 lg:grid-cols-2 lg:px-8">
                        <div class="grid grid-cols-2 gap-x-6 sm:gap-x-8">
                            <div>
                                <h3 class="text-sm font-medium leading-6 text-gray-200">OGs</h3>
                                <div class="mt-6 flow-root">
                                    <div class="-my-2">
                                        <a href="{{ route('feed', ['pubkey' => 'npub1dergggklka99wwrs92yz8wdjs952h2ux2ha2ed598ngwu9w7a6fsh9xzpc']) }}"
                                           class="flex gap-x-4 py-2 text-sm font-semibold leading-6 text-gray-100">
                                            <x-fat-user class="w-6 h-6 mr-2"/>
                                            Gigi
                                        </a>
                                        <a href="{{ route('feed', ['pubkey' => 'npub14j7wc366rf8efqvnnm8m68pazy04kkj8fgu6uqumh3eqlhfst0kqrngtpf']) }}"
                                           class="flex gap-x-4 py-2 text-sm font-semibold leading-6 text-gray-100">
                                            <x-fat-user class="w-6 h-6 mr-2"/>
                                            d11n
                                        </a>
                                        <a href="{{ route('feed', ['pubkey' => 'npub17fqtu2mgf7zueq2kdusgzwr2lqwhgfl2scjsez77ddag2qx8vxaq3vnr8y']) }}"
                                           class="flex gap-x-4 py-2 text-sm font-semibold leading-6 text-gray-100">
                                            <x-fat-user class="w-6 h-6 mr-2"/>
                                            Markus Turm
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 class="text-sm font-medium leading-6 text-gray-200">Tools</h3>
                                <div class="mt-6 flow-root">
                                    <div class="-my-2">
                                        <a href="{{ route('einundzwanzig-plebs') }}"
                                           class="flex gap-x-4 py-2 text-sm font-semibold leading-6 text-gray-100">
                                            <x-fat-users class="w-6 h-6 mr-2"/>
                                            Follow Einundzwanzig plebs
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div x-data="Components.popover({ open: false, focus: false })" x-init="init()" @keydown.escape="onEscape"
                 @close-popover-group.window="onClosePopoverGroup">
                <button type="button" class="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-100"
                        @click="toggle" @mousedown="if (open) $event.preventDefault()" aria-expanded="true"
                        :aria-expanded="open.toString()">
                    Notes
                    <svg class="h-5 w-5 flex-none text-gray-400" viewBox="0 0 20 20" fill="currentColor"
                         aria-hidden="true">
                        <path fill-rule="evenodd"
                              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                              clip-rule="evenodd"></path>
                    </svg>
                </button>
                <div x-show="open" x-transition:enter="transition ease-out duration-200"
                     x-transition:enter-start="opacity-0 -translate-y-1"
                     x-transition:enter-end="opacity-100 translate-y-0"
                     x-transition:leave="transition ease-in duration-150"
                     x-transition:leave-start="opacity-100 translate-y-0"
                     x-transition:leave-end="opacity-0 -translate-y-1"
                     x-description="'Product' flyout menu, show/hide based on flyout menu state."
                     class="absolute inset-x-0 top-0 -z-10 bg-[#222222] pt-16 shadow-lg ring-1 ring-gray-900/5"
                     x-ref="panel" @click.away="open = false" x-cloak>
                    <div class="mx-auto grid max-w-7xl grid-cols-1 gap-y-10 gap-x-8 py-10 px-6 lg:grid-cols-2 lg:px-8">
                        <div class="grid grid-cols-2 gap-x-6 sm:gap-x-8">
                            <div>
                                <h3 class="text-sm font-medium leading-6 text-gray-200">Notes</h3>
                                <div class="mt-6 flow-root">
                                    <div class="-my-2">
                                        <a href="{{ route('my-feed') }}"
                                           class="flex gap-x-4 py-2 text-sm font-semibold leading-6 text-gray-100">
                                            <x-fat-user class="w-6 h-6 mr-2"/>
                                            Notes
                                        </a>
                                        <template x-if="$store.ndk.user && $store.ndk.user.profile">
                                            <a :href="'/feed/' + $store.ndk.user.npub"
                                               class="flex gap-x-4 py-2 text-sm font-semibold leading-6 text-gray-100">
                                                <x-fat-user class="w-6 h-6 mr-2"/>
                                                My profile
                                            </a>
                                        </template>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div x-data="Components.popover({ open: false, focus: false })" x-init="init()" @keydown.escape="onEscape"
                 @close-popover-group.window="onClosePopoverGroup">
                <button type="button" class="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-100"
                        @click="toggle" @mousedown="if (open) $event.preventDefault()" aria-expanded="true"
                        :aria-expanded="open.toString()">
                    Info
                    <svg class="h-5 w-5 flex-none text-gray-400" viewBox="0 0 20 20" fill="currentColor"
                         aria-hidden="true">
                        <path fill-rule="evenodd"
                              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                              clip-rule="evenodd"></path>
                    </svg>
                </button>
                <div x-show="open" x-transition:enter="transition ease-out duration-200"
                     x-transition:enter-start="opacity-0 -translate-y-1"
                     x-transition:enter-end="opacity-100 translate-y-0"
                     x-transition:leave="transition ease-in duration-150"
                     x-transition:leave-start="opacity-100 translate-y-0"
                     x-transition:leave-end="opacity-0 -translate-y-1"
                     x-description="'Product' flyout menu, show/hide based on flyout menu state."
                     class="absolute inset-x-0 top-0 -z-10 bg-[#222222] pt-16 shadow-lg ring-1 ring-gray-900/5"
                     x-ref="panel" @click.away="open = false" x-cloak>
                    <div class="mx-auto grid max-w-7xl grid-cols-1 gap-y-10 gap-x-8 py-10 px-6 lg:grid-cols-2 lg:px-8">
                        <div class="grid grid-cols-2 gap-x-6 sm:gap-x-8">
                            <div>
                                <h3 class="text-sm font-medium leading-6 text-gray-200">Info</h3>
                                <div class="mt-6 flow-root">
                                    <div class="-my-2">
                                        <a href="https://github.com/HolgerHatGarKeineNode/einundzwanzigstr"
                                           target="_blank"
                                           class="flex gap-x-4 py-2 text-sm font-semibold leading-6 text-gray-100">
                                            <x-fab-github class="w-6 h-6 mr-2"/>
                                            <span>Open-sourced</span>
                                            <span>v{{ exec('git describe --tags --abbrev=0') }}</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 class="text-sm font-medium leading-6 text-gray-200">Server</h3>
                                <div class="mt-6 flow-root">
                                    <div class="-my-2">
                                        <div
                                            x-data="{
                                                usedMemory: @entangle('usedMemory'),
                                            }"
                                            class="flex gap-x-4 py-2 text-sm font-semibold leading-6 text-gray-100">
                                            <span class="text-xs text-amber-500 font-bold">
                                                <x-fat-database class="w-6 h-6"/>
                                            </span>
                                            <span class="text-xs text-amber-500 font-bold">Redis memory</span>
                                            <span class="text-xs text-amber-500" x-text="usedMemory"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
        <div class="flex flex-1 items-center justify-end gap-x-8">
            <template x-if="$store.ndk.user">
                <a :href="'/feed/' + $store.ndk.user.npub" class="-m-1.5 p-1.5">
                    <template x-if="$store.ndk.user && $store.ndk.user.profile">
                        <img class="h-8 w-8 rounded-full bg-gray-800"
                             :src="$store.ndk.user.profile.image"
                             alt="">
                    </template>
                </a>
            </template>
        </div>
    </div>
    <div>
        <livewire:layout.sticky-header/>
    </div>
</header>
