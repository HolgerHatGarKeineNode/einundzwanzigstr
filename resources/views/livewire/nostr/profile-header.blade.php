<div class="pb-6">
    <div>
        <img class="h-64 w-full object-cover"
             src="{{ $this->getProxyImageUrl($author['banner'] ?? null, true) }}"
             alt="{{ isset($author['display_name']) ? $author['display_name'] : 'banner' }}">
    </div>
    <div class="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div class="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
            <div class="flex">
                <img class="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                     src="{{ $this->getProxyImageUrl($author['image'] ?? null) }}"
                     alt="{{ isset($author['display_name']) ? $author['display_name'] : 'A' }}"
                >
            </div>
            <div class="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center justify-start sm:space-x-6 sm:pb-1">
                <div class="mt-6 min-w-0">
                    <h1 class="truncate text-2xl font-bold text-gray-200">
                        {{ isset($author['display_name']) ? $author['display_name'] : 'anon' }}
                    </h1>
                </div>
                <div class="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
                    <template
                        x-if="!isFollowing && follows.length > 0 && !follows.includes('{{ $author['hexpubkey'] }}')">
                        <x-button
                            outline
                            amber
                            label="Follow"
                            @click="followPleb('{{ $author['hexpubkey'] }}')"
                        />
                    </template>
                    <template
                        x-if="!isFollowing && follows.length > 0 && follows.includes('{{ $author['hexpubkey'] }}')">
                        <x-button
                            disabled
                            outline
                            gray
                            label="Following"
                        />
                    </template>
                    <template x-if="isFollowing">
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
                             fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </template>
                </div>
            </div>
        </div>
    </div>
</div>
