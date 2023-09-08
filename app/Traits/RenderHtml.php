<?php

namespace App\Traits;

trait RenderHtml
{
    public function renderHtml($text, $id)
    {
        // replace links by a tag
        $text = preg_replace_callback('/(https?:\/\/[^\s]+)/i',
            function ($matches) {
                // check if matches does not include images
                if (preg_match('/(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|mov|mp4|ogg))/i', $matches[1])) {
                    return $matches[0];
                }
                // check if matches does include the string youtu
                if (preg_match('/(youtu)/i', $matches[1])) {
                    return $matches[0];
                }
                return '<a class="text-amber-500 font-bold" href="' . $matches[1] . '" target="_blank">' . $matches[1] . '</a>';
            },
            $text);

        // replace image urls by img tag
        $text = preg_replace_callback('/(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i',
            function ($matches) use ($id) {
                $proxyUrl = route('img.proxy', ['url' => base64_encode($matches[1]), 'w' => 348]);
                $proxyUrlOriginal = route('img.proxy', ['url' => base64_encode($matches[1])]);
                return '
                    <a class="lightbox" data-gall="' . $id . '" href="'.$proxyUrlOriginal.'"><img class="object-contain w-96" src="' . $proxyUrl . '" /></a>
                ';
            },
            $text);

        // replace all video urls by video tag
        $text = preg_replace_callback('/(https?:\/\/.*\.(?:mov|mp4|ogg))/i',
            function ($matches) {
                return '<a class="video-links" data-autoplay="true" data-vbtype="video" data-ratio="1x1" data-maxwidth="400px" href="'.$matches[1].'"><div class="object-contain w-96 aspect-auto relative overflow-hidden flex items-center justify-center flex-col"><svg class="w-16 h-16 absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center" fill="#ffffff" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60" xml:space="preserve"><g><path d="M45.563,29.174l-22-15c-0.307-0.208-0.703-0.231-1.031-0.058C22.205,14.289,22,14.629,22,15v30 c0,0.371,0.205,0.711,0.533,0.884C22.679,45.962,22.84,46,23,46c0.197,0,0.394-0.059,0.563-0.174l22-15 C45.836,30.64,46,30.331,46,30S45.836,29.36,45.563,29.174z M24,43.107V16.893L43.225,30L24,43.107z"/><path d="M30,0C13.458,0,0,13.458,0,30s13.458,30,30,30s30-13.458,30-30S46.542,0,30,0z M30,58C14.561,58,2,45.439,2,30 S14.561,2,30,2s28,12.561,28,28S45.439,58,30,58z"/></g></svg><video><source src="' . $matches[1] . '" type="video/mp4"></video></div> </a>';
            },
            $text);

        // replace \n by <br>
        $text = str_replace("\n", '<br>', $text);

        // Replace YouTube video URLs
        $text = preg_replace_callback('#https?://(?:www\.)?(?:youtube\.com/watch\?v=|m\.youtube\.com/watch\?v=|youtu\.be/)([\w-]+)#i',
            function ($matches) {
                //dd($matches);
                return '<iframe class="w-full aspect-video" src="https://www.youtube.com/embed/' . $matches[1] . '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
            }
            , $text, -1, $count);

        //$text = preg_replace('#https?://(?:www\.)?(?:youtube\.com/watch\?v=|m\.youtube\.com/watch\?v=|youtu\.be/)([\w-]+)(?:&|\?|$)#i', '<iframe class="w-full aspect-video" src="https://www.youtube.com/embed/$1" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>', $text, -1, $count);

        return $text;
    }
}
