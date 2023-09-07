@php
    $imgClass = $compact ? 'h-8 w-8' : 'h-14 w-14';
    $textClass = $compact ? 'text-xs' : 'text-lg';
@endphp

<div x-data="nostrAuthor(@this)" class="flex justify-between">
    <a href="{{ isset($author['npub']) ? route('feed', ['pubkey' => $author['npub']]) : '#' }}" class="flex">
        <div class="mr-4 flex-shrink-0">
            <img class="inline-block {{ $imgClass }} rounded-full"
                 src="{{ $author['image'] ?? '/img/nostr.png' }}"
                 alt="{{ isset($author['display_name']) ? str($author['display_name'])->substr(0, 1) : 'A' }}"
            />
        </div>
        <div>
            <h4 class="{{ $textClass }} font-bold">{{ $author['display_name'] ?? 'anon' }}</h4>
            @if(!$compact)
                <h4 class="text-md font-bold">{{ $author['nip05'] ?? '' }}</h4>
            @endif
        </div>
    </a>
    <div>
        @if(!$compact || $withTimestamp)
            <span
                class="text-gray-300 text-xs">{{ \Illuminate\Support\Carbon::parse($event['created_at'])->diffForHumans() }}</span>
        @endif
    </div>
</div>
