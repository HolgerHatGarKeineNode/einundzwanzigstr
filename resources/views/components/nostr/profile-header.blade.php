<div class="pb-6" x-show="isCustomFeed">
    <div>
        <img class="h-32 w-full object-cover"
             :src="authorMetaData[currentFeedAuthor] && authorMetaData[currentFeedAuthor].banner"
             alt="">
    </div>
    <div class="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div class="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
            <div class="flex">
                <img class="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                     :src="authorMetaData[currentFeedAuthor] && authorMetaData[currentFeedAuthor].image"
                     alt=""
                >
            </div>
            <div class="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
                <div class="mt-6 min-w-0 flex-1 sm:hidden md:block">
                    <h1 class="truncate text-2xl font-bold text-gray-200"></h1>
                </div>
                <div class="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
                    <button @click="follow" type="button"
                            class="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        <x-fat-user-plus class="w-6 h-6 mr-2"/>
                        <span>Follow</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
