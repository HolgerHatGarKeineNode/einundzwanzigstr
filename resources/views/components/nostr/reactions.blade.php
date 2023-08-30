<div class="relative py-4 pl-16 ml-2 sticky bottom-0 bg-[#1b1b1b] shadow rounded-lg">
    <div class="flex justify-between w-full">

        <div class="cursor-pointer flex space-x-2" @click="open = true">
            <div class="text-amber-500"
                 x-text="numberFormat(reactions.reactions[event.id] && reactions.reactions[event.id].reactions)"></div>

            <div class="flex justify-center">
                <!-- Trigger -->
                <x-fat-heart
                        @click="openReactionPicker(event)"
                        class="hover:text-amber-500"
                        ::class="reactions.reacted[event.id] && reactions.reacted[event.id].reacted ? 'text-amber-500' : ''"
                />
            </div>
        </div>

        <template x-if="reactions.zaps && reactions.zaps[event.id]">
            <div class="cursor-pointer flex space-x-2" @click="zap(event)">
                <div class="text-amber-500" x-text="numberFormat(reactions.zaps[event.id].zaps)"></div>
                <x-fat-bolt class="hover:text-amber-500"/>
            </div>
        </template>
        <template x-if="reactions.reposts && reactions.reposts[event.id]">
            <div class="cursor-pointer flex space-x-2" @click="repost(event)">
                <div class="text-amber-500" x-text="numberFormat(reactions.reposts[event.id].reposts)"></div>
                <x-fat-arrows-turn-right class="hover:text-amber-500"
                                         ::class="reactions.reposted[event.id] && reactions.reposted[event.id].reposted ? 'text-amber-500' : ''"
                />
            </div>
        </template>
        <div class="cursor-pointer flex space-x-2" @click="comment(event)">
            <div class="text-amber-500">0</div>
            <x-fat-comment class="hover:text-amber-500"/>
        </div>
        <div class="cursor-pointer flex space-x-2" @click="console.log(JSON.parse(JSON.stringify(event)))">
            <div class="text-amber-500"></div>
            <x-fat-ban-bug class="hover:text-amber-500"/>
        </div>
    </div>
    <template x-if="!reactions.reacted || !reactions.reacted[event.id]">
        <div class="relative reaction-card block w-full rounded-lg border-dashed border-amber-500 p-12 text-center">
            <span class="mt-2 block text-sm font-semibold text-gray-100">Loading reactions...</span>
            <span class="top absolute"></span>
            <span class="right absolute"></span>
            <span class="bottom absolute"></span>
            <span class="left absolute"></span>
        </div>
    </template>
</div>
