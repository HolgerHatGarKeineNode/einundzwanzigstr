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
            <div class="px-2 sm:px-12" x-data="nostrMyFeed">
                <ul role="list" class="space-y-3">

                    <template x-for="event in userEvents" :key="event.id"
                              x-transition:enter="transition ease-out duration-300"
                              x-transition:enter-start="opacity-0 transform scale-90"
                              x-transition:enter-end="opacity-100 transform scale-100"
                              x-transition:leave="transition ease-in duration-300"
                              x-transition:leave-start="opacity-100 transform scale-100"
                              x-transition:leave-end="opacity-0 transform scale-90"
                    >
                        <li class="overflow-hidden rounded-md bg-[#1b1b1b] px-6 py-4 shadow text-white">
                            <div class="flex flex-col space-y-2">
                                <div class="flex justify-between">
                                    <div class="flex">
                                        <div class="mr-4 flex-shrink-0">
                                            <img class="inline-block h-14 w-14 rounded-full"
                                                 :src="$store.ndk.user.profile.image" alt="$store.ndk.user.profile.name"
                                            />
                                        </div>
                                        <div>
                                            <h4 class="text-lg font-bold" x-text="$store.ndk.user.profile.name"></h4>
                                        </div>
                                    </div>
                                    <div>
                                        <span class="text-gray-300 text-xs"
                                              x-text="new Date(event.created_at * 1000).toLocaleString()"></span>
                                    </div>
                                </div>
                                <div class="pl-16 ml-2" x-html="parseText(event)"></div>
                                <template x-if="event.content.includes('nostr:')">
                                    <button type="button"
                                            class="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                        <span class="mt-2 block text-sm font-semibold text-gray-100">nostr:</span>
                                    </button>
                                </template>
                                <div class="flex space-x-2 justify-end">
                                    <template x-for="tag in event.tags.filter((tag) => tag[0] === 't')">
                                        <div
                                            class="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-amber-500 ring-1 ring-inset ring-gray-800">
                                            <span x-text="tag[1]"></span>
                                        </div>
                                    </template>
                                </div>
                                <x-nostr.reactions />
                            </div>
                        </li>
                    </template>

                </ul>
            </div>

        </main>
    </div>
</div>
