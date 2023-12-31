<div x-data="{
    hasNewEvents: @entangle('hasNewEvents'),
}"
     class="flex shrink-0 items-center gap-x-6 border-b border-white/5 bg-[#1b1b1b] shadow-sm px-8">
    <button type="button" class="-m-2.5 p-2.5 text-white xl:hidden" @click="open = true">
        <span class="sr-only">Open sidebar</span>
        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd"
                  d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
                  clip-rule="evenodd"></path>
        </svg>
    </button>

    <div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {{--<form class="flex flex-1" action="#" method="GET">
            <label for="search-field" class="sr-only">Search</label>
            <div class="relative w-full">
                <svg class="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"></path>
                </svg>
                <input id="search-field" class="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-white focus:ring-0 sm:text-sm" placeholder="Search..." type="search" name="search">
            </div>
        </form>--}}
    </div>

    @if(!request()->is('einundzwanzig-plebs'))
        <div x-cloak class="flex justify-center py-4">
            <x-button outline amber @click="$dispatch('loadnew')">
                <x-fat-rotate class="w-6 h-6 mr-2"/>
                <span>Load new posts</span>
            </x-button>
        </div>

        <div>
            <x-button outline amber @click="$dispatch('noteeditor')">
                <x-fat-pen-nib class="w-6 h-6 mr-2"/>
                Create a note
            </x-button>
        </div>
    @else
        <div>
            <x-button outline amber @click="$dispatch('followall')">
                <x-fat-people-group class="w-6 h-6 mr-2"/>
                Follow all plebs
            </x-button>
        </div>
    @endif
</div>
