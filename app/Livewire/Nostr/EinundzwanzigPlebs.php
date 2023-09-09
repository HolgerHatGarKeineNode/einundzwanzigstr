<?php

namespace App\Livewire\Nostr;

use Illuminate\Support\Facades\Http;
use Livewire\Component;

class EinundzwanzigPlebs extends Component
{
    public array $plebs = [];

    public function mount()
    {
        $this->plebs = Http::get('https://portal.einundzwanzig.space/api/nostrplebs')->json();
    }

    public function render()
    {
        return view('livewire.nostr.einundzwanzig-plebs');
    }
}
