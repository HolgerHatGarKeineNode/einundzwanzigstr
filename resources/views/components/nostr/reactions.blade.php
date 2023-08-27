<div class="py-4 flex justify-between w-full pl-16 ml-2" x-data="loadReactions(event)">
    <div class="cursor-pointer" @click="love(event)">
        <x-fat-heart class="hover:text-amber-500" ::class="alreadyReactedData[event.id] ? 'text-amber-500' : ''"/>
    </div>
    <div class="cursor-pointer" @click="love(event)">
        <x-fat-bolt class="hover:text-amber-500"/>
    </div>
    <div class="cursor-pointer" @click="love(event)">
        <x-fat-arrows-turn-right class="hover:text-amber-500"/>
    </div>
    <div class="cursor-pointer" @click="love(event)">
        <x-fat-comment class="hover:text-amber-500"/>
    </div>
</div>
