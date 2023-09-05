@props([
    'reactionEmoticons' => [
        '⚡',
        '🫂',
        '💜',
        '🧡',
        '🥰',
        '🎯',
        '💯',
        '👍',
        '🔥',
        '🤙',
        '🤔',
        '🤮',
        '🤯',
        '🤬',
        '🤗',
        '🤩',
        '🤪',
        '🤫',
        '🤭',
        '🍻',
        '🥱',
        '🥳',
        '🥴',
        '🥵',
        '🥶',
        '🥺',
        '🦄',
        '🦾',
        '🤡',
        '👎',
    ]
])

<div
    wire:ignore
    x-show="openReactionModal"
    style="display: none"
    x-on:keydown.escape.prevent.stop="openReactionModal = false"
    role="dialog"
    aria-modal="true"
    x-id="['modal-title']"
    :aria-labelledby="$id('modal-title')"
    class="fixed inset-0 z-10 overflow-y-auto"
>
    <!-- Overlay -->
    <div x-show="openReactionModal" x-transition.opacity
         class="fixed inset-0"></div>

    <!-- Panel -->
    <div
        x-show="openReactionModal" x-transition
        x-on:click="openReactionModal = false"
        class="relative flex min-h-screen items-center justify-center p-4"
    >
        <div
            x-on:click.stop
            class="relative w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-12 shadow-lg"
        >
            <!-- Title -->
            <h2 class="text-3xl font-bold" :id="$id('modal-title')">Choose an emoji for your
                reaction</h2>

            <!-- Content -->
            <div class="mt-3 text-gray-600">
                @foreach($reactionEmoticons as $r)
                    <div
                        @click="love(currentEventToReactId, '{{ $r }}'); openReactionModal = false"
                        class="text-xl cursor-pointer relative z-30 inline-block h-10 w-10 rounded-full ring-1 ring-amber-500 hover:scale-125 pl-2 pt-1">{{ $r }}</div>
                @endforeach
            </div>

            <div class="flex flex-col py-4">
                <div class="text-xs"
                     x-text="currentEventToReactId"></div>
            </div>
        </div>
    </div>
</div>
