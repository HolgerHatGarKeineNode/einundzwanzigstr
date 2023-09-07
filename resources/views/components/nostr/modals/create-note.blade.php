<div
        wire:ignore
        x-show="openCreateNoteModal"
        style="display: none"
        x-on:keydown.escape.prevent.stop="openCreateNoteModal = false"
        role="dialog"
        aria-modal="true"
        x-id="['modal-title']"
        :aria-labelledby="$id('modal-title')"
        class="fixed inset-0 z-10 overflow-y-auto"
>
    <!-- Overlay -->
    <div x-show="openCreateNoteModal" x-transition.opacity
         class="fixed inset-0"></div>

    <!-- Panel -->
    <div
            x-show="openCreateNoteModal" x-transition
            x-on:click="openCreateNoteModal = false"
            class="relative flex min-h-screen items-center justify-center p-4"
    >
        <div
             x-on:click.stop
             class="relative w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-12 shadow-lg"
        >
            <!-- Title -->
            <h2 class="text-3xl font-bold" :id="$id('modal-title')">Create a note</h2>

            <!-- Content -->
            <div class="mt-3 text-gray-600">
                <div
                        class="prose w-full"
                >
                    <textarea x-ref="noteEditor"></textarea>
                </div>
            </div>

            <!-- Buttons -->
            <div class="mt-8 flex space-x-2 justify-between">
                <div>
                    <x-button x-on:click="openCreateNoteModal = false">
                        Cancel
                    </x-button>
                </div>

                <div>
                    <x-button amber
                              x-on:click="createNote">
                        <x-fat-plus class="w-6 h-6 mr-2"/>
                        Create
                    </x-button>
                </div>
            </div>
        </div>
    </div>
</div>
