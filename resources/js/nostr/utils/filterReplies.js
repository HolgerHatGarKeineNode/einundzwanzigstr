export function filterReplies(fetchedEvents) {
    for (const e of fetchedEvents) {
        if (
            e.tags?.[0]?.[0] === 'e' && !e.tags?.[0]?.[3]
            || e.tags.find((el) => el[3] === 'root')?.[1]
            || e.tags.find((el) => el[3] === 'reply')?.[1]
        ) {
            // we will remove event from fetchedEvents
            fetchedEvents = fetchedEvents.filter((el) => el.id !== e.id);
        }
    }
    return fetchedEvents;
}
