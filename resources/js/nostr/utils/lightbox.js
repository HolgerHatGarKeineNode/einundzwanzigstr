export function reloadLightbox() {
    new window.VenoBox({
        selector: ".lightbox",
        numeration: true,
        infinigall: true,
        share: true,
        spinner: "rotating-plane"
    });

    new window.VenoBox({
        selector: ".video-links",
    });
}
