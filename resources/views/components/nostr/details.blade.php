<div x-data="nostrDetails">
    <nav class="flex border-b border-white/10">
        <ul role="list"
            class="flex min-w-full flex-none gap-x-6 px-4 text-sm font-semibold leading-6 text-gray-400 sm:px-6 lg:px-8">
            <template x-for="tab in tabs" :key="tab.name">
                <li>
                    <div @click="switchTab(tab.name)" :class="currentTab === tab.name ? 'text-amber-400' : ''"
                         class="cursor-pointer">
                                <span class="pr-2"
                                      x-text="getReactionCount(tab.name, event)"></span><span
                                x-text="tab.label"></span>
                    </div>
            </template>
        </ul>
    </nav>
    <table class="max-h-[40rem] w-full whitespace-nowrap text-left">
        <colgroup>
            <col class="w-full sm:w-4/12">
            <col class="lg:w-4/12">
            <col class="lg:w-1/12">
        </colgroup>

        <tbody class="divide-y divide-white/5 overflow-x-hidden overflow-y-scroll">

        <template x-if="currentTab === 'reactions'">
            <template
                    x-for="reaction in reactions.reactionEventsData && reactions.reactionEventsData[event.id] && reactions.reactionEventsData[event.id].sort((a, b) => (a.created_at < b.created_at) ? 1 : -1)"
                    :key="reaction.id"
            >
                <template x-if="authorMetaData[reaction.pubkey]">
                    <tr>
                        <td class="py-4 px-4 max-w-[150px]">
                            <div class="flex items-center gap-x-4">
                                <img
                                        :src="authorMetaData[reaction.pubkey].image"
                                        :alt="authorMetaData[reaction.pubkey].display_name && authorMetaData[reaction.pubkey].display_name[0]"
                                        class="h-8 w-8 rounded-full bg-gray-800">
                                <div
                                        class="truncate text-sm font-medium leading-6 text-white"
                                        x-text="authorMetaData[reaction.pubkey].display_name"></div>
                            </div>
                        </td>
                        <td class="py-4 pl-0 pr-4 sm:pr-8">
                            <div class="flex gap-x-3">
                                <div class="font-mono text-sm leading-6 text-gray-400"
                                     x-text="reaction.content === '+' ? '🚀 boost' : reaction.content"></div>
                            </div>
                        </td>
                        <td class="py-4 pl-0 pr-4 text-right text-sm leading-6 text-gray-400 sm:table-cell sm:pr-6 lg:pr-8">
                            <time x-text="formatDate(reaction.created_at)"></time>
                        </td>
                    </tr>
                </template>
            </template>
        </template>

        <template x-if="currentTab === 'zaps'">
            <template
                    x-for="reaction in reactions.reactionZapsData && reactions.reactionZapsData[event.id] && reactions.reactionZapsData[event.id].sort((a, b) => (a.created_at < b.created_at) ? 1 : -1)"
                    :key="reaction.id"
            >
                <tr>
                    <td class="py-4 px-4 max-w-[150px]">
                        <template x-if="authorMetaData[reaction.senderPubkey]">
                            <div class="flex items-center gap-x-4">
                                <img
                                        :src="authorMetaData[reaction.senderPubkey].image"
                                        :alt="authorMetaData[reaction.senderPubkey].display_name[0]"
                                        class="h-8 w-8 rounded-full bg-gray-800">
                                <div
                                        class="truncate text-sm font-medium leading-6 text-white"
                                        x-text="authorMetaData[reaction.senderPubkey].display_name"></div>
                            </div>
                        </template>
                    </td>
                    <td class="py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                        <div class="flex gap-x-3">
                            <div class="font-mono text-sm leading-6 text-amber-500"
                                 x-text="numberFormat(reaction.amount) + ' sats'"></div>
                        </div>
                    </td>
                    <td class="py-4 pl-0 pr-4 text-right text-sm leading-6 text-gray-400 sm:table-cell sm:pr-6 lg:pr-8">
                        <time x-text="formatDate(reaction.created_at)"></time>
                    </td>
                </tr>
            </template>
        </template>

        <template x-if="currentTab === 'reposts'">
            <template
                    x-for="reaction in reactions.reactionRepostsData && reactions.reactionRepostsData[event.id] && reactions.reactionRepostsData[event.id].sort((a, b) => (a.created_at < b.created_at) ? 1 : -1)"
                    :key="reaction.id"
            >
                <tr>
                    <td class="py-4 px-4 max-w-[150px]">
                        <div class="flex items-center gap-x-4">
                            <img
                                    :src="authorMetaData[reaction.pubkey].image"
                                    :alt="authorMetaData[reaction.pubkey].display_name && authorMetaData[reaction.pubkey].display_name[0]"
                                    class="h-8 w-8 rounded-full bg-gray-800">
                            <div
                                    class="truncate text-sm font-medium leading-6 text-white"
                                    x-text="authorMetaData[reaction.pubkey].display_name"></div>
                        </div>
                    </td>
                    <td class="py-4 pl-0 pr-4 sm:table-cell sm:pr-8">

                    </td>
                    <td class="py-4 pl-0 pr-4 text-right text-sm leading-6 text-gray-400 sm:table-cell sm:pr-6 lg:pr-8">
                        <time x-text="formatDate(reaction.created_at)"></time>
                    </td>
                </tr>
            </template>
        </template>

        </tbody>
    </table>
</div>
