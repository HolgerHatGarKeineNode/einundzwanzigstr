import {debug} from "high-console";

export function unflatten(events, parentIds) {
    // Find all events at this level of recursion (filter by parent)
    // NIP-10: For top level replies only the "root" marker should be used
    const result = new Set(
        events.filter(e => {
            if (parentIds) {
                return parentIds.includes(e.replyId || e.rootId)
            }
            // If no parentEvents are supplied, match those without it
            return (e.replyId || e.rootId) === undefined
        })
    )

    // Remove found events from the original event array
    events = events.filter(e => !result.has(e))

    // For every event at this level, apply the same logic and add to children
    for (let e of result) {
        e.children.push(...unflatten(events, [e.id]))
    }

    // Return an array of nested events
    return result;
}
