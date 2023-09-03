import {parse} from "../nips/nip10.js";
import {unflatten} from "./unflatten.js";
import {debug} from "high-console";

export function nested(events, anchorIds) {
    // If anchorIds are supplied, use them to find the rootId and replyId
    // Otherwise, use the nip10 parser to find the rootId and replyId
    const nestedEvents = events
        .map(e => {
            let rootId
            let replyId

            const nip10Result = parse(e)
            rootId = events.find(e2 => e2.id === nip10Result.root?.id)?.id
            replyId = events.find(e2 => e2.id === nip10Result.reply?.id)?.id

            return {...e, rootId, replyId, children: []}
        });

    //debug("nestedEvents", nestedEvents)

    return unflatten(nestedEvents, anchorIds);
}
