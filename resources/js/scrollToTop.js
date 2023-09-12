export const scrollToTop = (Alpine) => ({

    scrollFunction() {
        if (
            document.body.scrollTop > 20 ||
            document.documentElement.scrollTop > 20
        ) {
            Alpine.$refs.scrollToTopBtn.classList.remove("hidden");
        } else {
            Alpine.$refs.scrollToTopBtn.classList.add("hidden");
        }
    },

    backToTop() {
        window.scrollTo({top: 0, behavior: "smooth"});
    },

    initScrollToTop() {

        Alpine.$refs.scrollToTopBtn.addEventListener("click", this.backToTop);

        window.addEventListener("scroll", this.scrollFunction);
    },

});
