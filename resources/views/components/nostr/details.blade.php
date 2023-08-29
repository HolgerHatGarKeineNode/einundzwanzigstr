<div x-data="nostrDetails">
    <div>
        <nav class="flex overflow-x-auto border-b border-white/10">
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
        <div class="overflow-y-auto" x-ref="table">
            <table class="w-full whitespace-nowrap text-left">
                <colgroup>
                    <col class="w-full sm:w-4/12">
                    <col class="lg:w-4/12">
                    <col class="lg:w-1/12">
                </colgroup>
                <tbody class="divide-y divide-white/5">

                <template
                    x-if="currentTab === 'reactions' && reactions.reactionEventsData && reactions.reactionEventsData[event.id]">
                    <template
                        x-for="reaction in reactions.reactionEventsData[event.id].sort((p1, p2) => (p1.created_at < p2.created_at) ? 1 : (p1.created_at > p2.created_at) ? -1 : 0)"
                        :key="reaction.id"
                    >
                        <tr>
                            <td class="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
                                <template x-if="reactionMetaData[reaction.id]">
                                    <div class="flex items-center gap-x-4">
                                        <img
                                            :src="reactionMetaData[reaction.id].image"
                                            alt="" class="h-8 w-8 rounded-full bg-gray-800">
                                        <div class="truncate text-sm font-medium leading-6 text-white"
                                             x-text="reactionMetaData[reaction.id].display_name ? reactionMetaData[reaction.id].display_name : reactionMetaData[reaction.id].displayName"></div>
                                    </div>
                                </template>
                            </td>
                            <td class="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                                <div class="flex gap-x-3">
                                    <div class="font-mono text-sm leading-6 text-gray-400"
                                         x-text="reaction.content === '+' ? 'repost' : reaction.content"></div>
                                </div>
                            </td>
                            <td class="hidden py-4 pl-0 pr-4 text-right text-sm leading-6 text-gray-400 sm:table-cell sm:pr-6 lg:pr-8">
                                <time datetime="2023-01-23T11:00"
                                      x-text="new Date(reaction.created_at * 1000).toLocaleString()"></time>
                            </td>
                        </tr>
                    </template>
                </template>

                </tbody>
            </table>
        </div>

    </div>
</div>
