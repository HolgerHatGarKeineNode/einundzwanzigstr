@php
    $imgClass = $compact ? 'h-8 w-8' : 'h-14 w-14';
    $textClass = $compact ? 'text-xs text-white' : 'text-lg text-white';
@endphp

<div x-data="nostrAuthor(@this)" class="flex justify-between">
    <div>
        <a href="{{ isset($author['npub']) ? route('feed', ['pubkey' => $author['npub']]) : '#' }}">
            <div class="flex">
                <div class="mr-4 flex-shrink-0">
                    <img class="inline-block {{ $imgClass }} rounded-full"
                         src="{{ $this->getProxyImageUrl($author['image'] ?? null) }}"
                         alt="{{ isset($author['display_name']) ? str($author['display_name'])->substr(0, 1) : 'A' }}"
                    />
                </div>
                <div>
                    <h4 class="{{ $textClass }} font-bold">{{ $author['display_name'] ?? 'anon' }}</h4>
                    @if(!$compact)
                        <h4 class="text-md font-bold">{{ $author['nip05'] ?? '' }}</h4>
                    @endif
                </div>
            </div>
        </a>
    </div>
    <div>
        @if(!$compact || $withTimestamp)
            <span
                class="text-gray-300 text-xs">{{ \Illuminate\Support\Carbon::parse($event['created_at'])->diffForHumans() }}</span>
        @elseif($withFollowButton)
            @if(isset($author['hexpubkey']) && $author['display_name'])
                <template x-if="!isFollowing && follows.length > 0 && follows.includes('{{ $author['hexpubkey'] }}')">
                    <x-button disabled xs outline gray label="Following"/>
                </template>
                <template x-if="!isFollowing && follows.length > 0 && !follows.includes('{{ $author['hexpubkey'] }}')">
                    <x-button xs outline amber label="Follow" @click="followPleb('{{ $author['hexpubkey'] }}')"/>
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
            @endif
        @endif
    </div>
</div>
