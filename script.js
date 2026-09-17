/* ============================================
   SYNEVYR PRESENTATION - INTERACTIVITY
   ============================================ */

(function () {
    'use strict';

    // ----- DOM ELEMENTS -----
    const slides = document.querySelectorAll('.slide');
    const slidesViewport = document.getElementById('slidesViewport');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentSlideEl = document.getElementById('currentSlide');
    const totalSlidesEl = document.getElementById('totalSlides');
    const progressFill = document.getElementById('progressFill');
    const dotsContainer = document.getElementById('dotsContainer');

    // ----- STATE -----
    const totalSlides = slides.length;
    let currentIndex = 0;
    let isTransitioning = false;

    // ----- INITIAL SETUP -----
    function init() {
        totalSlidesEl.textContent = String(totalSlides).padStart(2, '0');
        createDots();
        activateSlide(0);
        setupEventListeners();
        // Disable body scroll during slide changes
        document.addEventListener('touchmove', preventScroll, { passive: false });
    }

    function preventScroll(e) {
        // Allow scrolling only inside slide content, not the background
        if (!e.target.closest('.slide-content')) {
            e.preventDefault();
        }
    }

    // ----- CREATE DOTS -----
    function createDots() {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            dot.className = 'dot';
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.dataset.index = i;
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    // ----- ACTIVATE SLIDE -----
    function activateSlide(index) {
        if (index < 0 || index >= totalSlides) return;
        if (isTransitioning) return;
        if (index === currentIndex) return;

        isTransitioning = true;

        // Determine direction
        const direction = index > currentIndex ? 1 : -1;

        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            // Reset transform based on direction
            slide.style.transform = direction > 0 ? 'translateX(-30px) scale(1.02)' : 'translateX(30px) scale(1.02)';
        });

        currentIndex = index;
        const activeSlide = slides[currentIndex];

        // Reset its starting transform
        activeSlide.style.transform = direction > 0 ? 'translateX(40px) scale(1.02)' : 'translateX(-40px) scale(1.02)';

        // Force reflow
        void activeSlide.offsetWidth;

        // Trigger animations
        requestAnimationFrame(() => {
            activeSlide.classList.add('active');
            activeSlide.style.transform = '';
        });

        // Update UI
        updateCounter();
        updateDots();
        updateProgress();
        updateButtons();

        // Reset transition lock
        setTimeout(() => {
            isTransitioning = false;
        }, 700);
    }

    // ----- UPDATE UI ELEMENTS -----
    function updateCounter() {
        currentSlideEl.textContent = String(currentIndex + 1).padStart(2, '0');
    }

    function updateDots() {
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    function updateProgress() {
        const percent = ((currentIndex + 1) / totalSlides) * 100;
        progressFill.style.width = percent + '%';
    }

    function updateButtons() {
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === totalSlides - 1;
    }

    // ----- NAVIGATION FUNCTIONS -----
    function nextSlide() {
        if (currentIndex < totalSlides - 1) {
            activateSlide(currentIndex + 1);
        }
    }

    function prevSlide() {
        if (currentIndex > 0) {
            activateSlide(currentIndex - 1);
        }
    }

    function goToSlide(index) {
        activateSlide(index);
    }

    // ----- EVENT LISTENERS -----
    function setupEventListeners() {
        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
                e.preventDefault();
                nextSlide();
            } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                e.preventDefault();
                prevSlide();
            } else if (e.key === 'Home') {
                e.preventDefault();
                goToSlide(0);
            } else if (e.key === 'End') {
                e.preventDefault();
                goToSlide(totalSlides - 1);
            } else if (/^[1-7]$/.test(e.key)) {
                // Press number keys to jump to slide
                const idx = parseInt(e.key, 10) - 1;
                if (idx < totalSlides) goToSlide(idx);
            }
        });

        // Mouse wheel navigation (debounced)
        let wheelTimeout = null;
        document.addEventListener('wheel', (e) => {
            // Only navigate when not scrolling slide content
            if (e.target.closest('.slide-content')) {
                const el = e.target.closest('.slide-content');
                const isAtTop = el.scrollTop === 0;
                const isAtBottom = el.scrollHeight - el.scrollTop === el.clientHeight;
                if ((e.deltaY < 0 && !isAtTop) || (e.deltaY > 0 && !isAtBottom)) {
                    return;
                }
            }

            if (wheelTimeout) return;
            wheelTimeout = setTimeout(() => {
                wheelTimeout = null;
            }, 900);

            if (e.deltaY > 0) {
                nextSlide();
            } else if (e.deltaY < 0) {
                prevSlide();
            }
        }, { passive: true });

        // Touch / swipe support
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            // Only horizontal swipes, ignore vertical scroll
            if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
                if (dx < 0) nextSlide();
                else prevSlide();
            }
        }
    }

    // ----- RUN ON DOM READY -----
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
