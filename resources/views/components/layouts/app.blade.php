<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'Einundzwanzigstr') }}</title>

    <!-- Fonts -->
    @googlefonts

    <!-- Scripts -->
    <wireui:scripts />
    <script src="{{ asset('vendor/inline-attachment.js') }}"></script>
    <script src="{{ asset('vendor/codemirror-4.inline-attachment.js') }}"></script>
    <script src="https://cdn.jsdelivr.net/simplemde/1.11/simplemde.min.js"></script>
    @vite(['resources/css/app.css', 'resources/js/app.js'])

    <!-- Styles -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/simplemde/1.11/simplemde.min.css">
    <style>
        [x-cloak] {
            display: none !important;
        }
    </style>
</head>
<body class="overflow-y-auto bg-[#222222]">
<div>
    <!-- Navigation -->
    <livewire:layout.navigation/>

    <div class="xl:pl-72 relative">

        <!-- Sticky search header -->
        <livewire:layout.sticky-header/>

        <main>
            <!-- CONTENT -->
            <div class="px-2 sm:px-12 pt-12 pb-32">
                {{ $slot }}
            </div>
        </main>
    </div>
</div>
@livewireScriptConfig
</body>
</html>
