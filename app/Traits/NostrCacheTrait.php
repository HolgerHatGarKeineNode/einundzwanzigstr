<?php

namespace App\Traits;

use Illuminate\Support\Facades\Redis;

trait NostrCacheTrait
{
    public array $eventsCache = [];
    public array $npubCache = [];

    public function rules()
    {
        return [
            'eventsCache' => 'required',
            'npubsCache' => 'required',
        ];
    }

    public function mountNostrCacheTrait()
    {
        // load events cache from redis
        $redis = Redis::connection('nostr')->client();
        $this->eventsCache = array_map(function ($item) {
            return json_decode($item, true, 512, JSON_THROW_ON_ERROR);
        }, $redis->hGetAll('events'));
        $this->npubsCache = array_map(function ($item) {
            return json_decode($item, true, 512, JSON_THROW_ON_ERROR);
        }, $redis->hGetAll('npubs'));
    }

    public function updateEventCache($value)
    {
        $redis = Redis::connection('nostr')->client();
        $redis->hSet('events', $value['id'], json_encode($value, JSON_THROW_ON_ERROR));
    }

    public function updateNpubsCache($value)
    {
        $redis = Redis::connection('nostr')->client();
        $redis->hSet('npubs', $value['pubkey'], json_encode($value, JSON_THROW_ON_ERROR));
    }
}
