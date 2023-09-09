<div x-data="nostrEvents(@this)" @noteeditor.window="openCreateNoteModal = true" @loadmore.window="loadMore">
    <div id="loader" class="fixed" wire:ignore></div>

    <ul role="list" class="space-y-3">

        @foreach($events as $event)
            <li wire:key="{{ $event['id'] }}">
                <div class="grid grid-cols-7 gap-2" x-data="{
                    left: 0,
                    display: 'none',
                    init() {
                        setTimeout(() => {
                            this.left = $refs.events_{{ $event['id'] }}.offsetHeight;
                            this.display = 'block';
                            $refs.replies_{{ $event['id'] }}.style.height = this.left + 'px';
                            $refs.replies_{{ $event['id'] }}.style.display = 'block';
                            $refs.details_{{ $event['id'] }}.style.height = this.left + 'px';
                            $refs.details_{{ $event['id'] }}.style.display = 'block';
                        }, 1500);
                    },
                }">

                    <div x-ref="events_{{ $event['id'] }}"
                         class="col-span-3 rounded-md bg-[#1b1b1b] px-6 py-4 shadow text-white overflow-x-hidden">
                        <div class="sticky top-0 z-50" wire:ignore>
                            <div x-ref="react_{{ $event['id'] }}"></div>
                        </div>
                        <div class="flex flex-col justify-between space-y-2 h-full">
                            <livewire:nostr.author-card :$event :key="'event_author_' . $event['id']"/>
                            <div class="ml-2 text-lg">{!! $event['renderedHtml'] !!}</div>
                            <div class="flex flex-wrap space-x-2 justify-end py-2">
                                @foreach(collect($event['tags'])->filter(fn($tag) => $tag[0] === 't')->map(fn($tag) => $tag[1]) as $tag)
                                    <div
                                            class="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-amber-500 ring-1 ring-inset ring-gray-800">
                                        <span>{{ $tag }}</span>
                                    </div>
                                @endforeach
                            </div>
                            <livewire:nostr.actions :$event :key="'event_actions_' . $event['id']"/>
                        </div>
                    </div>

                    <div x-ref="replies_{{ $event['id'] }}" style="height: 64px; display: none;"
                         :style="{ height: left + 'px', display }"
                         class="col-span-2 rounded-md bg-[#1b1b1b] px-6 py-4 shadow text-white overflow-x-auto">
                        <livewire:nostr.replies :$event :key="'event_replies_' . $event['id']"/>
                    </div>

                    <div x-ref="details_{{ $event['id'] }}" style="height: 64px; display: none;"
                         :style="{ height: left + 'px', display }"
                         class="col-span-2 rounded-md bg-[#1b1b1b] px-6 py-4 shadow text-white overflow-x-auto">
                        <x-nostr.details :$event :key="'event_details_' . $event['id']"/>
                    </div>

                </div>
            </li>
        @endforeach
    </ul>

    <div x-intersect:enter="intersect"></div>

    <div class="flex w-full justify-center mt-12">
        <x-button @click="loadMore" class="btn-outline btn-warning">
            <x-fat-spinner class="w-6 h-6 mr-2"/>
            Load more
        </x-button>
    </div>

    <x-nostr.modals.comment/>
    <x-nostr.modals.create-note/>
</div>
