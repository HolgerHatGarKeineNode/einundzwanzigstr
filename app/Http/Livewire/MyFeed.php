<?php

namespace App\Http\Livewire;

use Livewire\Component;

class MyFeed extends Component
{
    public function render()
    {
        return view('livewire.my-feed')
            ->layout('layouts.guest');
    }
}
