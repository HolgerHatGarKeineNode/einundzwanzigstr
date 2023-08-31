<?php

namespace App\Http\Livewire;

use App\Traits\NostrCacheTrait;
use Livewire\Component;

class Feed extends Component
{
    use NostrCacheTrait;

    public ?string $pubkey = '';
    public array $currentNpubs = [];
    public int $limit = 10;

    public function mount()
    {
        $this->currentNpubs = [$this->pubkey];
    }

    public function render()
    {
        return view('livewire.feed')
            ->layout('layouts.guest');
    }
}
