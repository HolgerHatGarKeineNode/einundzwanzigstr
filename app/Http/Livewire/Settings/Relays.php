<?php

namespace App\Http\Livewire\Settings;

use App\Traits\NostrCacheTrait;
use Livewire\Component;

class Relays extends Component
{
    use NostrCacheTrait;
    public bool $isMyFeed = false;
    public array $currentNpubs = [];

    public $shouldPoll = false;

    public function render()
    {
        return view('livewire.settings.relays');
    }
}
