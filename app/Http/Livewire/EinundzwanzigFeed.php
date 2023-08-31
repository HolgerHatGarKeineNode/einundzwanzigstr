<?php

namespace App\Http\Livewire;

use App\Traits\NostrCacheTrait;
use Illuminate\Support\Facades\Http;
use Livewire\Component;

class EinundzwanzigFeed extends Component
{
    use NostrCacheTrait;

    public ?string $pubkey = '';
    public array $currentNpubs = [];
    public int $limit = 10;

    public function mount()
    {
        $this->currentNpubs = match (true) {
            request()->is('einundzwanzig-feed') => collect(Http::get('https://portal.einundzwanzig.space/api/nostrplebs')
                ->json()
            )->map(fn($item) => trim($item))->toArray(),
            request()->is('gigi-feed') => ['npub1dergggklka99wwrs92yz8wdjs952h2ux2ha2ed598ngwu9w7a6fsh9xzpc'],
            request()->is('d11n-feed') => ['npub14j7wc366rf8efqvnnm8m68pazy04kkj8fgu6uqumh3eqlhfst0kqrngtpf'],
            request()->is('markus-turm-feed') => ['npub17fqtu2mgf7zueq2kdusgzwr2lqwhgfl2scjsez77ddag2qx8vxaq3vnr8y'],
            request()->is('snowden-feed') => ['npub1sn0wdenkukak0d9dfczzeacvhkrgz92ak56egt7vdgzn8pv2wfqqhrjdv9'],
            default => [$this->pubkey],
        };
        if ($this->pubkey) {
            //abort(404, 'work in progress, some issues with loading the events...');
            //$this->currentNpubs = [$this->pubkey];
        }

        $this->limit = match (true) {
            request()->is('snowden-feed') => 3,
            default => 10,
        };
    }

    public function render()
    {
        return view('livewire.einundzwanzig-feed')
            ->layout('layouts.guest');
    }
}
