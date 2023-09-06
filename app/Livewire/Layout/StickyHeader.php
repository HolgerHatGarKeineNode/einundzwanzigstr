<?php

namespace App\Livewire\Layout;

use Livewire\Component;

class StickyHeader extends Component
{
    public bool $hasNewEvents = false;

    public function render()
    {
        return view('livewire.layout.sticky-header');
    }
}
