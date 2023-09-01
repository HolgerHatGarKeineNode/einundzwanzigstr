<?php

namespace App\Traits;

trait RelaysTrait
{
    public array $cachedRelays = [];

    public function mountRelaysTrait()
    {
        $this->cachedRelays = session()->get('relays', []);
    }

    public function updateRelays($value)
    {
        session()->put('relays', $value);
    }
}
