<div x-data="nostrEvents(@this)" @noteeditor.window="openCreateNoteModal = true" @loadnew.window="loadNewPosts">
    <div id="loader" class="fixed" wire:ignore></div>

    @if($pubkey && count($hexpubkeys) > 0)
        <livewire:nostr.profile-header :pubkey :hexpubkeys="$hexpubkeys"/>
    @endif

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

    <button
            wire:ignore
            x-ref="scrollToTopBtn"
            type="button"
            class="!fixed bottom-5 right-5 hidden rounded-full bg-amber-600 p-3 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-amber-700 hover:shadow-lg focus:bg-amber-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-amber-800 active:shadow-lg">
        <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                class="h-4 w-4"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512">
            <path
                    fill="currentColor"
                    d="M34.9 289.5l-22.2-22.2c-9.4-9.4-9.4-24.6 0-33.9L207 39c9.4-9.4 24.6-9.4 33.9 0l194.3 194.3c9.4 9.4 9.4 24.6 0 33.9L413 289.4c-9.5 9.5-25 9.3-34.3-.4L264 168.6V456c0 13.3-10.7 24-24 24h-32c-13.3 0-24-10.7-24-24V168.6L69.2 289.1c-9.3 9.8-24.8 10-34.3.4z"></path>
        </svg>
    </button>

</div>
