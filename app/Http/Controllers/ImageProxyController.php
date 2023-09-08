<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use League\Glide\Responses\LaravelResponseFactory;
use League\Glide\ServerFactory;

class ImageProxyController extends Controller
{
    public function __invoke(Request $request, Filesystem $filesystem)
    {
        $server = ServerFactory::create([
            'response' => new LaravelResponseFactory(app('request')),
            'source' => $filesystem->getDriver(),
            'cache' => $filesystem->getDriver(),
            'cache_path_prefix' => '.cache',
            'base_url' => 'img',
        ]);

        $key = $request->input('url');
        $url = base64_decode($key, true);
        // get extension from url after last dot from $url
        $fileExtension = explode('.', $url)[count(explode('.', $url)) - 1];

        // set path
        $path = 'public/proxy/' . $key . '.' . $fileExtension;

        if (Storage::disk('public')->exists(str($path)->after('public/'))) {
            return $server->getImageResponse($path, request()->except('url'));
        }

        // download file from url as a stream
        $download = Storage::disk('public')
            ->put('proxy/' . $key, fopen($url, 'rb'));
        if ($download) {
            // rename file with mime type
            Storage::disk('public')
                ->move('proxy/' . $key, 'proxy/' . $key . '.' . $fileExtension);

            return $server->getImageResponse($path, request()->except('url'));
        }

        return $server->getImageResponse('public/nostr.png', request()->except('url'));
    }

}
