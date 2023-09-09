<div>
    <!-- Static sidebar for desktop -->
    <div class="fixed inset-y-0 flex w-72 flex-col z-10">
        <!-- Sidebar component, swap this element with another sidebar if you like -->
        <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-black/10 px-6 ring-1 ring-white/5">
            <div class="flex h-16 shrink-0 items-center">
                <img class="h-8 w-auto" src="{{ asset('img/einundzwanzig-horizontal-inverted.svg') }}"
                     alt="Einundzwanzig">
            </div>
            @php
                $activeClass = 'bg-amber-500 text-white group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold';
                $notActiveClass = 'text-gray-400 hover:text-white hover:bg-amber-500 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold';
            @endphp
            <nav class="flex flex-1 flex-col">
                <ul role="list" class="flex flex-1 flex-col gap-y-7">
                    <li>
                        <ul role="list" class="-mx-2 space-y-1">
                            <li>
                                <a href="{{ route('my-feed') }}"
                                   class="{{ request()->is('my-feed') ? $activeClass : $notActiveClass }}"
                                   x-state:on="Current" x-state:off="Default"
                                   x-state-description="Current: &quot;bg-gray-800 text-white&quot;, Default: &quot;text-gray-400 hover:text-white hover:bg-gray-800&quot;">
                                    <svg class="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                         stroke="currentColor" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                              d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"></path>
                                    </svg>
                                    My Feed
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('einundzwanzig-feed') }}"
                                   class="{{ request()->is('einundzwanzig-feed') ? $activeClass : $notActiveClass }}"
                                   x-state:on="Current" x-state:off="Default"
                                   x-state-description="Current: &quot;bg-gray-800 text-white&quot;, Default: &quot;text-gray-400 hover:text-white hover:bg-gray-800&quot;">
                                    <svg class="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                         stroke="currentColor" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                              d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"></path>
                                    </svg>
                                    Einundzwanzig Feed
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('feed', ['pubkey' => 'npub1dergggklka99wwrs92yz8wdjs952h2ux2ha2ed598ngwu9w7a6fsh9xzpc']) }}"
                                   class="{{ request()->route()->parameter('pubkey') === 'npub1dergggklka99wwrs92yz8wdjs952h2ux2ha2ed598ngwu9w7a6fsh9xzpc' ? $activeClass : $notActiveClass }}"
                                   x-state:on="Current" x-state:off="Default"
                                   x-state-description="Current: &quot;bg-gray-800 text-white&quot;, Default: &quot;text-gray-400 hover:text-white hover:bg-gray-800&quot;">
                                    <svg class="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                         stroke="currentColor" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                              d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"></path>
                                    </svg>
                                    Gigi's Feed
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('feed', ['pubkey' => 'npub14j7wc366rf8efqvnnm8m68pazy04kkj8fgu6uqumh3eqlhfst0kqrngtpf']) }}"
                                   class="{{ request()->route()->parameter('pubkey') === 'npub14j7wc366rf8efqvnnm8m68pazy04kkj8fgu6uqumh3eqlhfst0kqrngtpf' ? $activeClass : $notActiveClass }}"
                                   x-state:on="Current" x-state:off="Default"
                                   x-state-description="Current: &quot;bg-gray-800 text-white&quot;, Default: &quot;text-gray-400 hover:text-white hover:bg-gray-800&quot;">
                                    <svg class="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                         stroke="currentColor" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                              d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"></path>
                                    </svg>
                                    d11n's Feed
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('feed', ['pubkey' => 'npub17fqtu2mgf7zueq2kdusgzwr2lqwhgfl2scjsez77ddag2qx8vxaq3vnr8y']) }}"
                                   class="{{ request()->route()->parameter('pubkey') === 'npub17fqtu2mgf7zueq2kdusgzwr2lqwhgfl2scjsez77ddag2qx8vxaq3vnr8y' ? $activeClass : $notActiveClass }}"
                                   x-state:on="Current" x-state:off="Default"
                                   x-state-description="Current: &quot;bg-gray-800 text-white&quot;, Default: &quot;text-gray-400 hover:text-white hover:bg-gray-800&quot;">
                                    <svg class="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                         stroke="currentColor" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                              d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"></path>
                                    </svg>
                                    Markus Turm's Feed
                                </a>
                            </li>
                            {{--<li>
                                <a href="{{ route('einundzwanzig-plebs') }}"
                                   class="{{ request()->is('einundzwanzig-plebs') ? $activeClass : $notActiveClass }}"
                                   x-state:on="Current" x-state:off="Default"
                                   x-state-description="Current: &quot;bg-gray-800 text-white&quot;, Default: &quot;text-gray-400 hover:text-white hover:bg-gray-800&quot;">
                                    <svg class="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                         stroke="currentColor" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                              d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"></path>
                                    </svg>
                                    Einundzwanzig Plebs
                                </a>
                            </li>--}}
                        </ul>
                    </li>
                    <li x-data="{
                            usedMemory: @entangle('usedMemory'),
                        }"
                    >
                        <div class="text-xs font-semibold leading-6 text-gray-400">Server</div>
                        <ul role="list" class="-mx-2 mt-2 space-y-4">
                            <li class="flex space-x-2 justify-end text-gray-300">
                                <a href="https://github.com/HolgerHatGarKeineNode/einundzwanzigstr"
                                   class="flex space-x-2"
                                   target="_blank">
                                    <x-fab-github class="w-6 h-6 mr-2"/>
                                    <span>Open-sourced</span>
                                    <span>v{{ exec('git describe --tags --abbrev=0') }}</span>
                                </a>
                            </li>
                            <li class="flex space-x-2 justify-end">
                                <span class="text-xs text-amber-500 font-bold">
                                    <x-fat-database class="w-6 h-6"/>
                                </span>
                                    <span class="text-xs text-amber-500 font-bold">Redis memory</span>
                                    <span class="text-xs text-amber-500" x-text="usedMemory"></span>
                            </li>
                        </ul>
                    </li>
                    <li class="-mx-6 mt-auto">
                        <template x-if="$store.ndk.user && $store.ndk.user.profile">
                            <a :href="'/feed/' + $store.ndk.user.npub"
                               class="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-amber-500">
                                <img class="h-8 w-8 rounded-full bg-gray-800"
                                     :src="$store.ndk.user.profile.image"
                                     alt="">
                                <span class="sr-only">Your profile</span>
                                <span aria-hidden="true" x-text="$store.ndk.user.profile.name"></span>
                            </a>
                        </template>
                    </li>
                </ul>
            </nav>
        </div>
    </div>
</div>
