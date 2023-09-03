export default () => ({
    eventLoop: {},
    eventContents: {},

    init() {
        this.eventLoop = {...this.eventsCache};
        this.eventContents = {...this.renderedContentCache};
    }
});
