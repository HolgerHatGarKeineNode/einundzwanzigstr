<?php

namespace App\Traits;

use Illuminate\Support\Facades\Redis;

trait NostrCacheTrait
{
    public array $eventsCache = [];
    public array $npubCache = [];
    public array $reactionsCache = [];

    public function rules()
    {
        return [
            'eventsCache' => 'required',
            'npubsCache' => 'required',
        ];
    }

    public function mountNostrCacheTrait()
    {
        $redis = Redis::connection('nostr')->client();
        //$redis->del('events');
        //$redis->del('npubs');
        // load events cache from redis
        // $this->eventsCache = array_map(function ($item) {
        //    return json_decode($item, true, 512, JSON_THROW_ON_ERROR);
        // }, $redis->hGetAll('events'));
        $this->npubsCache = array_map(function ($item) {
            return json_decode($item, true, 512, JSON_THROW_ON_ERROR);
        }, $redis->hGetAll('npubs'));
        //dd($redis->hGet('events', '2060259c44e198af67616e7d1776bed37d76ec0b448c98d335bc881a104acfa3'));
    }

    public function getEventsByIds($ids)
    {
        $redis = Redis::connection('nostr')->client();

        $this->eventsCache = collect($ids)->map(function ($id) use ($redis) {
            try {
                $value = $redis->hGet('events', $id);
                if ($value) {
                    return json_decode($redis->hGet('events', $id), false, 512, JSON_THROW_ON_ERROR);
                }
            } catch (\JsonException $e) {
                dd($id, $redis->hGet('events', $id));
            }
        })->keyBy('id')->toArray();

        return count($this->eventsCache);
    }

    public function updateEventCache($value)
    {
        foreach ($value as $item) {
            $redis = Redis::connection('nostr')->client();
            $redis->hSet('events', $item['id'], json_encode($item, JSON_THROW_ON_ERROR));
        }
    }

    public function updateNpubsCache($value)
    {
        $redis = Redis::connection('nostr')->client();
        $redis->hSet('npubs', $value['pubkey'], json_encode($value, JSON_THROW_ON_ERROR));
    }

    public function getCache($what)
    {
        $redis = Redis::connection('nostr')->client();
        return array_map(function ($item) {
            return json_decode($item, true, 512, JSON_THROW_ON_ERROR);
        }, $redis->hGetAll($what));
    }
}
