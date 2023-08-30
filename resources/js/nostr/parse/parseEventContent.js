import {nostrFetcher} from "../fetcher/nostrFetcher.js";

export const parseEventContent = async (content, id, alpine) => {
    let body = content;

    async function replaceAsync(string, regexp, replacerFunction) {
        const replacements = await Promise.all(
            Array.from(string.matchAll(regexp),
                match => replacerFunction(...match)));
        let i = 0;
        return string.replace(regexp, () => replacements[i++]);
    }

    async function nostrReplacer(match, p1, p2, p3, offset, string) {
        const c = await nostrFetcher(match, alpine);

        if (c.type === 'nevent') {
            const parsed = await parseEventContent(c.data.content, c.data.id, alpine);

            return `
                <div class="border border-amber-500 p-4 rounded flex flex-col">
                    <div class="flex justify-between p-2">
                        <div class="flex pb-4 justify-between">
                            <div class="mr-4 flex-shrink-0"><img class="inline-block h-14 w-14 rounded-full" alt="${alpine.authorMetaData[c.data.pubkey].display_name ?? 'A'}" src="${alpine.authorMetaData[c.data.pubkey].image ?? ''}"/></div>
                            <div>
                                <h4 class="text-lg font-bold">${alpine.authorMetaData[c.data.pubkey].display_name}</h4>
                                <h4 class="text-md font-bold">${alpine.authorMetaData[c.data.pubkey].nip05}</h4>
                            </div>
                        </div>
                        <div><span class="text-gray-300 text-xs">${alpine.formatDate(c.data.created_at)}</span></div>
                    </div>
                    <div>${parsed}</div>
                </div>
            `;
        }

        if (c.type === 'npub') {
            if (alpine.authorMetaData[c.data]) {
                return `
                <a href="/feed/${alpine.authorMetaData[c.data].npub}">
                    <div class="border border-dashed border-amber-500 p-4 rounded flex flex-col my-2">
                        <div class="flex justify-between p-2">
                            <div class="flex justify-between">
                                <div class="mr-4 flex-shrink-0"><img class="inline-block h-8 w-8 rounded-full" alt="${alpine.authorMetaData[c.data].display_name ?? 'A'}"  src="${alpine.authorMetaData[c.data].image ?? ''}"/></div>
                                <div>
                                    <h4 class="text-lg font-bold">${alpine.authorMetaData[c.data].display_name}</h4>
                                    <h4 class="text-md font-bold">${alpine.authorMetaData[c.data].nip05 ?? ''}</h4>
                                </div>
                            </div>
                            <div></div>
                        </div>
                    </div>
                </a>
            `;
            }
        }

        if (c.type === 'note') {
            const parsed = await parseEventContent(c.data.content, c.data.id, alpine);

            return `
                <div class="border border-amber-500 p-4 rounded flex flex-col my-2">
                    <div class="flex justify-between p-2">
                        <div class="flex justify-between">
                            <div class="mr-4 flex-shrink-0"><img class="inline-block h-8 w-8 rounded-full" alt="${alpine.authorMetaData[c.data.pubkey].display_name ?? 'A'}"  src="${alpine.authorMetaData[c.data.pubkey].image ?? ''}"/></div>
                            <div>
                                <h4 class="text-lg font-bold">${alpine.authorMetaData[c.data.pubkey].display_name}</h4>
                                <h4 class="text-md font-bold">${alpine.authorMetaData[c.data.pubkey].nip05 ?? ''}</h4>
                            </div>
                        </div>
                        <div><span class="text-gray-300 text-xs">${alpine.formatDate(c.data.created_at)}</span></div>
                    </div>
                    <div>${parsed}</div>
                </div>
            `;
        }

        return `${match}`;
    }

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

    // check for nostr:
    body = await replaceAsync(body, /nostr:([^\s]+)/g, await nostrReplacer);

    // replace all YouTube links with embedded videos
    body = body.replace(/(https?:\/\/[^\s]+(\.youtube\.com\/watch\?v=|\.youtu\.be\/))([^\s]+)/g, '<div class="aspect-w-16 aspect-h-9 py-2"><iframe src="https://www.youtube.com/embed/$3" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>');

    // replace video links with embedded videos
    body = body.replace(/(https?:\/\/[^\s]+(\.mp4|\.webm|\.ogg))/g, '<div class="aspect-w-16 aspect-h-9 py-2"><video controls><source src="$1" type="video/mp4"></video></div>');

    return body;
}
