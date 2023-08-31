export function scrollToTop() {
    const scrollFunction = () => {
        if (
            document.body.scrollTop > 20 ||
            document.documentElement.scrollTop > 20
        ) {
            this.$refs.scrollToTop.classList.remove("hidden");
        } else {
            this.$refs.scrollToTop.classList.add("hidden");
        }
    };
    return scrollFunction;
}
