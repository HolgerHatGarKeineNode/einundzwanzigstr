<?php

namespace App\Http\Livewire;

use Livewire\Component;

class EinundzwanzigFeed extends Component
{
    public function render()
    {
        return view('livewire.einundzwanzig-feed')
            ->layout('layouts.guest');
    }
}
