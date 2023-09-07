<?php

namespace App\Http\Controllers\Upload;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InlineAttachment extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $file = $request->file('file');
        $mime = $file->getMimeType();
        $fileExtension = match ($mime) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
            default => 'txt',
        };
        $randomFileNameByUUID = (string)Str::uuid();
        $url = \Storage::disk('public')->putFileAs('images', $file, $randomFileNameByUUID . '.' . $fileExtension);

        return response()->json([
            'filename' => asset('storage/' . $url),
        ]);
    }
}
