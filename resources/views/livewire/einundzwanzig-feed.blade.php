<div x-data="nostrApp(@this)" @keydown.window.escape="open = false" wire:ignore>

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
            <div class="px-2 sm:px-12">
                <ul role="list" class="space-y-3">

                    <template x-if="rejected">
                        <div class="rounded-md bg-yellow-50 p-4">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"
                                         aria-hidden="true">
                                        <path fill-rule="evenodd"
                                              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                                              clip-rule="evenodd"/>
                                    </svg>
                                </div>
                                <div class="ml-3">
                                    <h3 class="text-sm font-medium text-yellow-800">Attention needed</h3>
                                    <div class="mt-2 text-sm text-yellow-700">
                                        <p>Du kannst diese Seite nicht ohne eingeloggten Nostr Account benutzen.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>

                    <template x-for="event in events" :key="event.id">
                        <li>
                            <div class="grid grid-cols-7 gap-2">
                                <div class="h-[42rem] col-span-3 rounded-md bg-[#1b1b1b] px-6 py-4 shadow text-white overflow-x-hidden">
                                    <div class="flex flex-col justify-between space-y-2 h-full">
                                        <template x-if="authorMetaData[event.pubkey]">
                                            <div class="flex justify-between">
                                                <div class="flex">
                                                    <div class="mr-4 flex-shrink-0">
                                                        <img class="inline-block h-14 w-14 rounded-full"
                                                             :src="authorMetaData[event.pubkey].image"
                                                             :alt="authorMetaData[event.pubkey].display_name[0]"
                                                        />
                                                    </div>
                                                    <div>
                                                        <h4 class="text-lg font-bold"
                                                            x-text="authorMetaData[event.pubkey].display_name"></h4>
                                                        <h4 class="text-md font-bold"
                                                            x-text="authorMetaData[event.pubkey].nip05"></h4>
                                                    </div>
                                                </div>
                                                <div>
                                                <span class="text-gray-300 text-xs"
                                                      x-text="formatDate(event.created_at)"></span>
                                                </div>
                                            </div>
                                        </template>
                                        <template x-if="!authorMetaData[event.pubkey]">
                                            <div class="flex justify-between">
                                                <div class="flex">
                                                    <div class="relative mr-4 flex-shrink-0">
                                                        <img class="inline-block h-14 w-14 rounded-full"/>
                                                        <span class="top absolute"></span>
                                                        <span class="right absolute"></span>
                                                        <span class="bottom absolute"></span>
                                                        <span class="left absolute"></span>
                                                    </div>
                                                    <div>
                                                        <h4 class="text-lg font-bold" x-text="event.pubkey"></h4>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span class="text-gray-300 text-xs">...loading</span>
                                                </div>
                                            </div>
                                        </template>
                                        <div class="pl-16 ml-2 text-lg" x-html="parseContent(event)"></div>
                                        <div class="flex space-x-2 justify-end pb-12">
                                            <template x-for="tag in event.tags.filter((tag) => tag[0] === 't')">
                                                <div
                                                        class="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-amber-500 ring-1 ring-inset ring-gray-800">
                                                    <span x-text="tag[1]"></span>
                                                </div>
                                            </template>
                                        </div>
                                        <x-nostr.reactions/>
                                    </div>
                                </div>
                                <div class="h-[42rem] col-span-2 rounded-md bg-[#1b1b1b] px-6 py-4 shadow text-white overflow-x-hidden">
                                    <x-nostr.replies/>
                                </div>
                                <div class="h-[42rem] col-span-2 rounded-md bg-[#1b1b1b] px-6 py-4 shadow text-white overflow-x-hidden">
                                    <x-nostr.details/>
                                </div>
                            </div>
                        </li>
                    </template>

                </ul>
            </div>

        </main>
    </div>
</div>
