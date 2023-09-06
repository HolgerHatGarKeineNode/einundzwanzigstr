<?php

namespace App\Livewire\Layout;

use Illuminate\Support\Facades\Redis;
use Livewire\Component;

class Navigation extends Component
{
    public string $usedMemory = '';

    public function mount()
    {
        $redisClient = Redis::connection('nostr')->client();
        $this->usedMemory = $redisClient->info('memory')['used_memory_human'];
    }

    public function render()
    {
        return view('livewire.layout.navigation');
    }
}
