@props([
    'reactionEmoticons' => [
        '👍',
        '👎',
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
    ]
])

@foreach($reactionEmoticons as $r)
    <div @click="love(event, '{{ $r }}')"
         class="relative z-30 inline-block h-8 w-8 rounded-full ring-2 ring-white hover:scale-125 pl-2 pt-1">{{ $r }}</div>
@endforeach


