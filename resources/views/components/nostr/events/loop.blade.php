<div class="grid grid-cols-7 gap-2">
    <div
            class="h-[42rem] col-span-3 rounded-md bg-[#1b1b1b] px-6 py-4 shadow text-white overflow-x-hidden">
        <div class="flex flex-col justify-between space-y-2 h-full">
            <template x-if="authorMetaData[event.pubkey]">
                <div class="flex justify-between">
                    <a :href="'/feed/' + authorMetaData[event.pubkey].npub" class="flex">
                        <div class="mr-4 flex-shrink-0">
                            <img class="inline-block h-14 w-14 rounded-full"
                                 :src="authorMetaData[event.pubkey].image"
                                 :alt="authorMetaData[event.pubkey].display_name[0]"
                            />
                        </div>
                        <div>
                            <h4 class="text-lg font-bold"
                                x-text="decodeURI(authorMetaData[event.pubkey].display_name)"></h4>
                            <h4 class="text-md font-bold"
                                x-text="authorMetaData[event.pubkey].nip05"></h4>
                        </div>
                    </a>
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
            <div class="pl-16 ml-2 text-lg pb-12" x-html="parseContent(event)"></div>
            <div x-show="event.tags.filter((tag) => tag[0] === 't').length"
                 class="flex space-x-2 justify-end py-2">
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
    <div
            class="h-[42rem] col-span-2 rounded-md bg-[#1b1b1b] px-6 py-4 shadow text-white overflow-x-hidden">
        <x-nostr.replies/>
    </div>
    <div
            class="h-[42rem] col-span-2 rounded-md bg-[#1b1b1b] px-6 py-4 shadow text-white overflow-x-hidden">
        <x-nostr.details/>
    </div>
</div>
