<template x-if="eventsReplies[event.id]">
    <div class="flow-root p-2">
        <ul role="list" class="-mb-8">
            <template x-for="(reply, index) in eventsReplies[event.id]" :key="reply.id">
                <li class="outline outline-amber-500/5 outline-offset-1">
                    <div class="relative pb-8">
                        <span x-show="eventsReplies[reply.id]"
                              class="absolute left-5 top-5 -ml-px h-full w-0.5 bg-amber-500" aria-hidden="true"></span>
                        <div class="relative flex items-start space-x-3">
                            <div class="relative">
                                <template x-if="authorMetaData[reply.pubkey]">
                                    <img class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-amber-500"
                                         :src="authorMetaData[reply.pubkey].image"
                                         :alt="authorMetaData[reply.pubkey].display_name && authorMetaData[reply.pubkey].display_name[0]"
                                    >
                                </template>
                                <span class="absolute -bottom-0.5 -right-1 rounded-tl bg-transparent px-0.5 py-px">
                                  <svg class="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor"
                                       aria-hidden="true">
                                    <path fill-rule="evenodd"
                                          d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579a.78.78 0 01.527-.224 41.202 41.202 0 005.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zm0 7a1 1 0 100-2 1 1 0 000 2zM8 8a1 1 0 11-2 0 1 1 0 012 0zm5 1a1 1 0 100-2 1 1 0 000 2z"
                                          clip-rule="evenodd"/>
                                  </svg>
                                </span>
                            </div>
                            <div class="min-w-0 flex-1">
                                <template x-if="authorMetaData[reply.pubkey]">
                                    <div>
                                        <div class="text-sm">
                                            <div class="font-bold text-gray-200"
                                                 x-text="authorMetaData[reply.pubkey].display_name"></div>
                                        </div>
                                        <p class="mt-0.5 text-sm text-gray-300 italic"
                                           x-text="formatDate(reply.created_at)"></p>
                                    </div>
                                </template>
                                <div class="mt-2 text-sm text-gray-200">
                                    <p x-html="parseContent(reply)"></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <template x-if="eventsReplies[reply.id]">
                        <ul role="list" class="ml-6 mb-3">
                            <template x-for="(r, i) in eventsReplies[reply.id]">
                                <li>
                                    <div class="relative pb-8">
                                        <span
                                                x-show="i + 1 !== eventsReplies[reply.id].length"
                                                class="absolute left-5 top-5 rotate-180 -ml-px h-full w-0.5 bg-amber-500"
                                                aria-hidden="true"></span>
                                        <div class="relative flex items-start space-x-3">
                                            <div class="relative">
                                                <template x-if="authorMetaData[r.pubkey]">
                                                    <img class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-amber-500"
                                                         :src="authorMetaData[r.pubkey].image"
                                                         :alt="authorMetaData[r.pubkey].display_name && authorMetaData[r.pubkey].display_name[0]"
                                                    >
                                                </template>
                                                <span class="absolute -bottom-0.5 -right-1 rounded-tl bg-transparent px-0.5 py-px">
                                                  <svg class="h-5 w-5 text-purple-500" viewBox="0 0 20 20"
                                                       fill="currentColor"
                                                       aria-hidden="true">
                                                    <path fill-rule="evenodd"
                                                          d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579a.78.78 0 01.527-.224 41.202 41.202 0 005.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zm0 7a1 1 0 100-2 1 1 0 000 2zM8 8a1 1 0 11-2 0 1 1 0 012 0zm5 1a1 1 0 100-2 1 1 0 000 2z"
                                                          clip-rule="evenodd"/>
                                                  </svg>
                                                </span>
                                            </div>
                                            <div class="min-w-0 flex-1">
                                                <template x-if="authorMetaData[r.pubkey]">
                                                    <div>
                                                        <div class="text-sm">
                                                            <div class="font-bold text-gray-200"
                                                                 x-text="authorMetaData[r.pubkey].display_name"></div>
                                                        </div>
                                                        <p class="mt-0.5 text-sm text-gray-300 italic"
                                                           x-text="formatDate(r.created_at)"></p>
                                                    </div>
                                                </template>
                                                <div class="mt-2 text-sm text-gray-200">
                                                    <p x-html="parseContent(r)"></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </template>
                        </ul>
                    </template>
                </li>
            </template>
        </ul>
    </div>
</template>
<template x-if="!eventsReplies[event.id]">
    <div>
        keine Antworten vorhanden
    </div>
</template>
