<div
    wire:ignore
    x-show="openCommentModal"
    style="display: none"
    x-on:keydown.escape.prevent.stop="openCommentModal = false"
    role="dialog"
    aria-modal="true"
    x-id="['create-comment']"
    :aria-labelledby="$id('create-comment')"
    class="fixed inset-0 z-10 overflow-y-auto"
>
    <!-- Overlay -->
    <div x-show="openCommentModal" x-transition.opacity
         class="fixed inset-0"></div>

    <!-- Panel -->
    <div
        x-show="openCommentModal" x-transition
        x-on:click="openCommentModal = false"
        class="relative flex min-h-screen items-center justify-center p-4"
    >
        <div
            x-on:click.stop
            class="relative w-full max-w-screen-7xl overflow-y-auto rounded-xl bg-white p-12 shadow-lg"
        >
            <!-- Title -->
            <h2 class="text-3xl font-bold" :id="$id('create-comment')">Write your reply</h2>

            <!-- Content -->
            <div class="mt-3 text-gray-600">
                <div class="flex w-full">
                    <div class="prose w-8/12">
                        <textarea x-ref="commentEditor"></textarea>
                    </div>
                    <div class="w-4/12 px-2 xl:px-16" x-ref="commentPicker"></div>
                </div>
            </div>

            <!-- Buttons -->
            <div class="mt-8 flex space-x-2 justify-between">
                <div>
                    <x-button x-on:click="openCommentModal = false">
                        Cancel
                    </x-button>
                </div>

                <div>
                    <x-button amber
                              x-on:click="comment">
                        <x-fat-envelope class="w-6 h-6 mr-2"/>
                        Reply
                    </x-button>
                </div>
            </div>
        </div>
    </div>
</div>
