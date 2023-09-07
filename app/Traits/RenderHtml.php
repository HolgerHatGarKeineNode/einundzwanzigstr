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
                return '<a class="text-amber-500 font-bold" href="' . $matches[1] . '" target="_blank">' . $matches[1] . '</a>';
            },
            $text);

        // replace image urls by img tag
        $text = preg_replace_callback('/(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i',
            function ($matches) {
                return '<img class="max-w-full" src="' . $matches[1] . '" />';
            },
            $text);

        // replace all video urls by video tag
        $text = preg_replace_callback('/(https?:\/\/.*\.(?:mov|mp4|ogg))/i',
            function ($matches) {
                return '<video class="max-w-full" controls><source src="' . $matches[1] . '" type="video/mp4"></video>';
            },
            $text);

        // replace \n by <br>
        $text = str_replace("\n", '<br>', $text);

        return $text;
    }
}
