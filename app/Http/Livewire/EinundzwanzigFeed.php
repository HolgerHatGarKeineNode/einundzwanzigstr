<?php

namespace App\Http\Livewire;

use Illuminate\Support\Facades\Http;
use Livewire\Component;

class EinundzwanzigFeed extends Component
{
    public array $currentNpubs = [];

    public function mount()
    {
        $this->currentNpubs = match (true) {
            request()->is('einundzwanzig-feed') => Http::get('https://portal.einundzwanzig.space/api/nostrplebs')->json(),
            request()->is('gigi-feed') => ['npub1dergggklka99wwrs92yz8wdjs952h2ux2ha2ed598ngwu9w7a6fsh9xzpc'],
            request()->is('d11n-feed') => ['npub14j7wc366rf8efqvnnm8m68pazy04kkj8fgu6uqumh3eqlhfst0kqrngtpf'],
            request()->is('markus-turm-feed') => ['npub17fqtu2mgf7zueq2kdusgzwr2lqwhgfl2scjsez77ddag2qx8vxaq3vnr8y'],
        };
    }

    public function render()
    {
        return view('livewire.einundzwanzig-feed')
            ->layout('layouts.guest');
    }
}
