export function formatDate(date) {
    // human-readable age from timestamp in multiple formates (seconds, minutes, hours, days, weeks, months, years)
    const time = Math.floor((Date.now() - date * 1000) / 1000);
    if (time < 60) {
        return time + 's ago';
    }
    if (time < 3600) {
        return Math.floor(time / 60) + 'm ago';
    }
    if (time < 86400) {
        return Math.floor(time / 3600) + 'h ago';
    }
    if (time < 604800) {
        return Math.floor(time / 86400) + 'd ago';
    }
    if (time < 2629800) {
        return Math.floor(time / 604800) + 'w ago';
    }
    if (time < 31557600) {
        return Math.floor(time / 2629800) + 'm ago';
    }
    return Math.floor(time / 31557600) + 'y ago';
}
