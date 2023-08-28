<div class="py-4 pl-16 ml-2" x-data="loadReactions(event)">
    <template x-if="alreadyReactedData[event.id]">
        <div class="flex justify-between w-full">
            <div class="cursor-pointer flex space-x-2" @click="love(event)">
                <div class="text-amber-500" x-text="alreadyReactedData[event.id].reactions"></div>
                <x-fat-heart class="hover:text-amber-500"
                             ::class="alreadyReactedData[event.id].reacted ? 'text-amber-500' : ''"/>
            </div>
            <div class="cursor-pointer flex space-x-2" @click="zap(event)">
                <div class="text-amber-500" x-text="alreadyReactedData[event.id].zaps"></div>
                <x-fat-bolt class="hover:text-amber-500"/>
            </div>
            <div class="cursor-pointer flex space-x-2">
                <div class="text-amber-500" x-text="alreadyReactedData[event.id].reposts"></div>
                <x-fat-arrows-turn-right class="hover:text-amber-500"/>
            </div>
            <div class="cursor-pointer flex space-x-2">
                <div class="text-amber-500">0</div>
                <x-fat-comment class="hover:text-amber-500"/>
            </div>
        </div>
    </template>
</div>
