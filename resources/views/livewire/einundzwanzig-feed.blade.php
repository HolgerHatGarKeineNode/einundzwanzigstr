<div x-data="nostrApp" @keydown.window.escape="open = false">

    @include('layouts.partials.navigation')

    <div class="xl:pl-72">
        <!-- Sticky search header -->
        @include('layouts.partials.header')

        <main>
            {{--<header class="border-b border-white/5">
                <!-- Secondary navigation -->
                <nav class="flex overflow-x-auto py-4">
                    <ul role="list" class="flex min-w-full flex-none gap-x-6 px-4 text-sm font-semibold leading-6 text-gray-400 sm:px-6 lg:px-8">
                        <li>
                            <a href="#" class="text-indigo-400">Account</a>
                        </li>
                        <li>
                            <a href="#" class="">Notifications</a>
                        </li>
                        <li>
                            <a href="#" class="">Billing</a>
                        </li>
                        <li>
                            <a href="#" class="">Teams</a>
                        </li>
                        <li>
                            <a href="#" class="">Integrations</a>
                        </li>

                    </ul>
                </nav>
            </header>--}}

            <!-- CONTENT -->
            <div class="px-12" x-data="nostrEinundzwanzigFeed(@this)">
                <ul role="list" class="space-y-3">

                    <template x-for="event in einundzwanzigEvents.sort((a, b) => b.created_at - a.created_at)"
                              :key="event.id"
                              x-transition:enter="transition ease-out duration-300"
                              x-transition:enter-start="opacity-0 transform scale-90"
                              x-transition:enter-end="opacity-100 transform scale-100"
                              x-transition:leave="transition ease-in duration-300"
                              x-transition:leave-start="opacity-100 transform scale-100"
                              x-transition:leave-end="opacity-0 transform scale-90">
                        <li class="overflow-hidden rounded-md bg-[#1b1b1b] px-6 py-4 shadow text-white">
                            <div class="flex flex-col space-y-2">
                                <div class="flex justify-between">
                                    <template x-if="einundzwanzigEventsProfiles[event.pubkey]">
                                        <div class="flex">
                                            <div class="mr-4 flex-shrink-0">
                                                <img class="inline-block h-14 w-14 rounded-full"
                                                     :src="einundzwanzigEventsProfiles[event.pubkey].picture" alt=""
                                                />
                                            </div>
                                            <div>
                                                <h4 class="text-lg font-bold"
                                                    x-text="einundzwanzigEventsProfiles[event.pubkey].display_name"></h4>
                                            </div>
                                        </div>
                                    </template>
                                    <div>
                                        <span class="text-gray-300 text-xs"
                                              x-text="new Date(event.created_at * 1000).toLocaleString()"></span>
                                    </div>
                                </div>
                                <div class="pl-16 ml-2" x-html="parseText(event.content.replaceAll('\n','<br>'))"></div>
                                <div class="flex space-x-2 justify-end">
                                    <template x-for="tag in event.tags.filter((tag) => tag[0] === 't')">
                                        <div
                                            class="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-amber-500 ring-1 ring-inset ring-gray-800">
                                            <span x-text="tag[1]"></span>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </li>
                    </template>

                </ul>
            </div>

        </main>
    </div>
</div>
