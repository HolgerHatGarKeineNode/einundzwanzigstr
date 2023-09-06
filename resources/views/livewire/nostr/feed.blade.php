<div x-data="nostrEvents(@this)">
    <ul role="list" class="space-y-3">

        @foreach($events as $event)
            <li wire:key="{{ $event['id'] }}">
                <div class="grid grid-cols-7 gap-2">

                    <div
                        class="col-span-3 rounded-md bg-[#1b1b1b] px-6 py-4 shadow text-white overflow-x-hidden">
                        <div class="flex flex-col justify-between space-y-2 h-full">
                            <livewire:nostr.author-card :$event/>
                            <div class="ml-2 text-lg pb-12">{!! $event['content'] !!}</div>
                            <div class="flex flex-wrap space-x-2 justify-end py-2">
                                @foreach(collect($event['tags'])->filter(fn($tag) => $tag[0] === 't')->map(fn($tag) => $tag[1]) as $tag)
                                    <div
                                        class="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-amber-500 ring-1 ring-inset ring-gray-800">
                                        <span>{{ $tag }}</span>
                                    </div>
                                @endforeach
                            </div>
                            <livewire:nostr.actions :$event/>
                        </div>
                    </div>

                    <div
                        class="h-[42rem] col-span-2 rounded-md bg-[#1b1b1b] px-6 py-4 shadow text-white overflow-x-auto">
                        <livewire:nostr.replies :$event/>
                    </div>

                    <div
                        class="h-[42rem] col-span-2 rounded-md bg-[#1b1b1b] px-6 py-4 shadow text-white overflow-x-auto">
                        <x-nostr.details :$event/>
                    </div>

                </div>
            </li>
        @endforeach

    </ul>
</div>
