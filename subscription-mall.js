const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;
const deck = document.querySelector('.deck');
const slides = [...document.querySelectorAll('.slide-shell')];
const prevButton = document.querySelector('[data-direction="prev"]');
const nextButton = document.querySelector('[data-direction="next"]');

function scaleSlides() {
    const scale = Math.min(window.innerWidth / BASE_WIDTH, window.innerHeight / BASE_HEIGHT);
    document.documentElement.style.setProperty('--deck-scale', scale.toString());
}

function getCurrentSlideIndex() {
    if (!deck || slides.length === 0) {
        return 0;
    }

    const center = deck.scrollTop + deck.clientHeight / 2;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
        const top = slide.offsetTop;
        const slideCenter = top + slide.offsetHeight / 2;
        const distance = Math.abs(slideCenter - center);

        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index;
        }
    });

    return nearestIndex;
}

function moveSlide(direction) {
    const currentIndex = Math.max(0, getCurrentSlideIndex());
    const nextIndex = Math.min(
        slides.length - 1,
        Math.max(0, currentIndex + (direction === 'next' ? 1 : -1))
    );

    scrollToSlide(nextIndex);
}

function scrollToSlide(index) {
    if (!deck || !slides[index]) {
        return;
    }

    deck.scrollTo({
        top: slides[index].offsetTop,
        behavior: 'smooth',
    });
}

function updateNavState() {
    if (!prevButton || !nextButton || slides.length === 0) {
        return;
    }

    const currentIndex = getCurrentSlideIndex();
    prevButton.disabled = currentIndex <= 0;
    nextButton.disabled = currentIndex >= slides.length - 1;
}

window.addEventListener('resize', scaleSlides);
window.addEventListener('DOMContentLoaded', () => {
    scaleSlides();
    updateNavState();

    document.querySelectorAll('.deck-nav-button').forEach((button) => {
        button.addEventListener('click', () => moveSlide(button.dataset.direction));
    });

    if (deck) {
        deck.addEventListener('scroll', updateNavState, { passive: true });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') {
            event.preventDefault();
            moveSlide('next');
        }
        if (event.key === 'ArrowUp' || event.key === 'PageUp') {
            event.preventDefault();
            moveSlide('prev');
        }
    });
});

window.addEventListener('resize', updateNavState);
window.addEventListener('orientationchange', scaleSlides);
window.addEventListener('orientationchange', updateNavState);
