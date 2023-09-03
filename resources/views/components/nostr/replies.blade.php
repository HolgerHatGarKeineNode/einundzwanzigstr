@props([
    'event',
])

@php
    $redisClient = Illuminate\Support\Facades\Redis::connection('nostr')->client();
    $replies = json_decode($redisClient->hGet('replies', $event['pubkey'] . ':' . $event['id']), true);
@endphp

<div class="flex flex-col">
    <div>
        <h3 class="pb-2">Replies</h3>
    </div>
    <div class="flow-root">
        <ul class="tree">
            {{-- LEVEL1 --}}
            <li class="">
                {{--<div class="relative pb-2">
                    <div class="relative flex items-start space-x-3">
                        <a :href="'/feed/' + authorMetaData[reply.pubkey].npub">
                            <div class="relative">
                                <img
                                        class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-amber-500"
                                        :src="authorMetaData[reply.pubkey].image"
                                        :alt="authorMetaData[reply.pubkey].display_name && authorMetaData[reply.pubkey].display_name[0]"
                                >
                                <span
                                        class="absolute -bottom-0.5 -right-1 rounded-tl bg-transparent px-0.5 py-px">
                                          <svg class="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor"
                                               aria-hidden="true">
                                            <path fill-rule="evenodd"
                                                  d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579a.78.78 0 01.527-.224 41.202 41.202 0 005.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zm0 7a1 1 0 100-2 1 1 0 000 2zM8 8a1 1 0 11-2 0 1 1 0 012 0zm5 1a1 1 0 100-2 1 1 0 000 2z"
                                                  clip-rule="evenodd"/>
                                          </svg>
                                        </span>
                            </div>
                        </a>
                        <div class="min-w-0 flex-1">
                            <template x-if="authorMetaData[reply.pubkey]">
                                <div class="flex justify-between px-2 pt-2">
                                    <div class="text-sm">
                                        <div class="font-bold text-gray-200"
                                             x-text="decodeURI(authorMetaData[reply.pubkey].display_name)"></div>
                                    </div>
                                    <p class="mt-0.5 text-sm text-gray-300 italic"
                                       x-text="formatDate(reply.created_at)"></p>
                                </div>
                            </template>
                            <div class="mt-2 text-sm text-gray-200">
                                <p x-html="renderedContentCache[reply]"></p>
                            </div>
                        </div>
                    </div>
                    <div class="ml-12 p-4 bg-[#1b1b1b] shadow rounded-lg">
                        <div class="flex justify-between w-full">
                            <div class="cursor-pointer flex space-x-2" @click="openReactionPicker(reply)">
                                <x-fat-heart class="w-3 h-3 hover:text-amber-500"/>
                            </div>
                            <div class="cursor-pointer flex space-x-2" @click="zap(reply)">
                                <x-fat-bolt class="w-3 h-3 hover:text-amber-500"/>
                            </div>
                            <div class="cursor-pointer flex space-x-2" @click="repost(reply)">
                                <x-fat-arrows-turn-right class="w-3 h-3 hover:text-amber-500"/>
                            </div>
                            <div class="cursor-pointer flex space-x-2" @click="openCommentEditor(reply)">
                                <x-fat-comment class="w-3 h-3 hover:text-amber-500"/>
                            </div>
                            <div class="cursor-pointer flex space-x-2"
                                 @click="console.log(JSON.parse(JSON.stringify(reply)))">
                                <x-fat-ban-bug class="w-3 h-3 hover:text-amber-500"/>
                            </div>
                        </div>
                    </div>
                </div>--}}
            </li>
        </ul>
    </div>
</div>
