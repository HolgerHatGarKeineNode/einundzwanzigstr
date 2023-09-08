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
            function ($matches) {
                $proxyUrl = route('img.proxy', ['url' => base64_encode($matches[1]), 'w' => 348]);
                return '<img class="object-contain w-96" src="' . $proxyUrl . '" />';
            },
            $text);

        // replace all video urls by video tag
        $text = preg_replace_callback('/(https?:\/\/.*\.(?:mov|mp4|ogg))/i',
            function ($matches) {
                return '<div class="object-contain w-96 aspect-auto"><video controls><source src="' . $matches[1] . '" type="video/mp4"></video></div>';
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
