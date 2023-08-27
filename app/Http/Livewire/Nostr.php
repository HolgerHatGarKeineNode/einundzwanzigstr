<?php

namespace App\Http\Livewire;

use Livewire\Component;

class Nostr extends Component
{
    public function render()
    {
        return view('livewire.nostr')
            ->layout('layouts.guest');
    }
}
