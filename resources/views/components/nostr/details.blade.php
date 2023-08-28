<div x-data="nostrDetails(event)">
    <div>
        <nav class="flex overflow-x-auto border-b border-white/10">
            <ul role="list"
                class="flex min-w-full flex-none gap-x-6 px-4 text-sm font-semibold leading-6 text-gray-400 sm:px-6 lg:px-8">
                <template x-for="tab in tabs">
                    <li>
                        <div @click="switchTab(tab.name)" :class="currentTab === tab.name ? 'text-amber-400' : ''"
                             class="cursor-pointer">
                            <span class="pr-2" x-text="tab.count > -1 ? tab.count : ''"></span><span
                                x-text="tab.label"></span>
                        </div>
                    </li>
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
                {{--<thead class="border-b border-white/10 text-sm leading-6 text-white">
                <tr>
                    <th scope="col" class="py-2 pl-4 pr-8 font-semibold sm:pl-6 lg:pl-8">User</th>
                    <th scope="col" class="hidden py-2 pl-0 pr-8 font-semibold sm:table-cell">Commit</th>
                    <th scope="col" class="py-2 pl-0 pr-4 text-right font-semibold sm:pr-8 sm:text-left lg:pr-20">Status</th>
                    <th scope="col" class="hidden py-2 pl-0 pr-8 font-semibold md:table-cell lg:pr-20">Duration</th>
                    <th scope="col" class="hidden py-2 pl-0 pr-4 text-right font-semibold sm:table-cell sm:pr-6 lg:pr-8">Deployed at</th>
                </tr>
                </thead>--}}
                <tbody class="divide-y divide-white/5">

                <template x-if="currentTab === 'reactions'">
                    <template x-for="reaction in reactions" :key="reaction.id">
                        <tr>
                            <td class="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8" x-data="loadUserData(reaction)">
                                <template x-if="profileData[reaction.pubkey]">
                                    <div class="flex items-center gap-x-4">
                                        <img
                                            :src="profileData[reaction.pubkey].picture"
                                            alt="" class="h-8 w-8 rounded-full bg-gray-800">
                                        <div class="truncate text-sm font-medium leading-6 text-white"
                                             x-text="profileData[reaction.pubkey].display_name ? profileData[reaction.pubkey].display_name : profileData[reaction.pubkey].name"></div>
                                    </div>
                                </template>
                            </td>
                            <td class="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                                <div class="flex gap-x-3">
                                    <div class="font-mono text-sm leading-6 text-gray-400" x-text="reaction.content === '+' ? 'repost' : reaction.content"></div>
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
