export const parseEventContent = (content, id) => {
    let body = content;

    function imageReplacer(match, p1, p2, p3, offset, string) {

        return `<div class="max-w-sm p-2 rounded-2xl bg-black"><a href="#${hashCode(p1)}"><img class="aspect-[3/2] w-full object-contain" src="${p1}" /></a></div>${lightbox(p1)}`;
    }

    function lightbox(url) {
        // md5 hash of the url
        const hash = hashCode(url);

        return `<a href="#${id}" class="lightbox" id="${hash}"><span style="background-image: url(\'${url}\')"></span></a>`;
    }

    function hashCode(s) {
        let h;
        for (let i = 0; i < s.length; i++)
            h = Math.imul(31, h) + s.charCodeAt(i) | 0;

        return h;
    }

    // replace \n with <br>
    body = body.replace(/\n/g, ' <br> ');

    // replace all images with img tags
    body = body.replace(/(https?:\/\/[^\s]+(\.jpg|\.jpeg|\.png|\.gif|\.webp))/g, imageReplacer);

    // replace all YouTube links with embedded videos
    body = body.replace(/(https?:\/\/[^\s]+(\.youtube\.com\/watch\?v=|\.youtu\.be\/))([^\s]+)/g, '<div class="aspect-w-16 aspect-h-9 py-2"><iframe src="https://www.youtube.com/embed/$3" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>');

    // replace video links with embedded videos
    body = body.replace(/(https?:\/\/[^\s]+(\.mp4|\.webm|\.ogg))/g, '<div class="aspect-w-16 aspect-h-9 py-2"><video controls><source src="$1" type="video/mp4"></video></div>');

    return body;
}
