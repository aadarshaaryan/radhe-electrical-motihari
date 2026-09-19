/**
 * Radhe Electrical Motihari - Complete Script
 * Features:
 * 1. Infinite Seamless Carousel (Touch, Drag, Auto-play, Clones)
 * 2. Navigation Active State & Smooth Scroll-Spy
 * 3. Mobile Navigation Drawer
 * 4. Video Showcase Modal
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. INFINITE SEAMLESS SLIDER
    // ==========================================
    const track = document.getElementById('carouselTrack');
    const viewport = document.getElementById('carouselViewport');
    const slides = Array.from(track.querySelectorAll('.carousel-slide'));
    const prevBtn = document.getElementById('prevSlide');
    const nextBtn = document.getElementById('nextSlide');
    const dotsContainer = document.getElementById('sliderDots');

    if (track && viewport && slides.length > 0) {
        const total = slides.length;
        let currentIndex = 1;
        let isTransitioning = false;
        let autoPlayTimer = null;

        // Clone first & last slides for infinite loop
        const firstClone = slides[0].cloneNode(true);
        const lastClone = slides[total - 1].cloneNode(true);
        firstClone.classList.add('clone');
        lastClone.classList.add('clone');

        track.insertBefore(lastClone, slides[0]);
        track.appendChild(firstClone);

        function setTrack(index, animate = false) {
            track.style.transition = animate ? 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
            track.style.transform = `translateX(${-index * 100}%)`;
        }

        // Initialize position to Slide 1
        setTrack(currentIndex);

        // Build pagination dots
        dotsContainer.innerHTML = '';
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.addEventListener('click', () => {
                if (!isTransitioning) {
                    goToSlide(i + 1);
                    resetAutoPlay();
                }
            });
            dotsContainer.appendChild(dot);
        });
        const dots = Array.from(dotsContainer.querySelectorAll('.slider-dot'));

        function updateDots() {
            let dotIndex = currentIndex - 1;
            if (currentIndex === 0) dotIndex = total - 1;
            if (currentIndex === total + 1) dotIndex = 0;
            dots.forEach((dot, i) => dot.classList.toggle('active', i === dotIndex));
        }

        function goToSlide(index) {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex = index;
            setTrack(currentIndex, true);
            updateDots();
        }

        function nextSlide() { goToSlide(currentIndex + 1); }
        function prevSlide() { goToSlide(currentIndex - 1); }

        track.addEventListener('transitionend', () => {
            isTransitioning = false;
            // Loop forward: snap from end clone back to real slide 1
            if (currentIndex === total + 1) {
                currentIndex = 1;
                setTrack(currentIndex);
            }
            // Loop backward: snap from start clone to real last slide
            if (currentIndex === 0) {
                currentIndex = total;
                setTrack(currentIndex);
            }
        });

        if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoPlay(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoPlay(); });

        // Auto-Play
        function startAutoPlay() {
            stopAutoPlay();
            autoPlayTimer = setInterval(nextSlide, 5000);
        }
        function stopAutoPlay() { clearInterval(autoPlayTimer); }
        function resetAutoPlay() { stopAutoPlay(); startAutoPlay(); }

        // Touch & Mouse Drag Gestures
        let startX = 0;
        let isDragging = false;

        function startDrag(pos) {
            if (isTransitioning) return;
            stopAutoPlay();
            isDragging = true;
            startX = pos;
            viewport.classList.add('grabbing');
        }

        function dragMove(pos) {
            if (!isDragging) return;
            const diff = pos - startX;
            const offsetPct = (diff / viewport.offsetWidth) * 100;
            track.style.transition = 'none';
            track.style.transform = `translateX(${-(currentIndex * 100) + offsetPct}%)`;
        }

        function endDrag(pos) {
            if (!isDragging) return;
            isDragging = false;
            viewport.classList.remove('grabbing');
            const movedBy = pos - startX;
            if (movedBy < -50) nextSlide();
            else if (movedBy > 50) prevSlide();
            else setTrack(currentIndex, true);
            startAutoPlay();
        }

        viewport.addEventListener('mousedown', e => startDrag(e.pageX));
        viewport.addEventListener('touchstart', e => startDrag(e.touches[0].clientX), { passive: true });

        window.addEventListener('mousemove', e => dragMove(e.pageX));
        window.addEventListener('touchmove', e => {
            if (isDragging) dragMove(e.touches[0].clientX);
        }, { passive: true });

        window.addEventListener('mouseup', e => endDrag(e.pageX));
        window.addEventListener('touchend', e => {
            if (e.changedTouches && e.changedTouches.length > 0) {
                endDrag(e.changedTouches[0].clientX);
            }
        });

        viewport.addEventListener('mouseenter', stopAutoPlay);
        viewport.addEventListener('mouseleave', startAutoPlay);

        // Keyboard Controls
        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft') { prevSlide(); resetAutoPlay(); }
            if (e.key === 'ArrowRight') { nextSlide(); resetAutoPlay(); }
        });

        startAutoPlay();
    }

    // ==========================================
    // 2. NAVBAR ACTIVE STATE & SCROLL-SPY
    // ==========================================
    const navItems = document.querySelectorAll('.nav-links .nav-item');
    const sections = document.querySelectorAll('section[id], footer[id]');
    const mobileMenu = document.getElementById('navLinks');

    // Click handler: immediately shift active state to clicked item
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            navItems.forEach(link => link.classList.remove('active'));
            this.classList.add('active');

            if (mobileMenu && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
            }
        });
    });

    // Scroll-Spy: detect which section is on screen and highlight corresponding link
    function updateActiveNavOnScroll() {
        const scrollPosition = window.scrollY + 180;
        let activeSectionId = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                activeSectionId = sectionId;
            }
        });

        // Near top of page defaults to Home
        if (window.scrollY < 150) {
            activeSectionId = 'home';
        }

        if (activeSectionId) {
            navItems.forEach(link => {
                const href = link.getAttribute('href');
                const isMatch = href === `#${activeSectionId}` || (activeSectionId === 'home' && href === '#');
                link.classList.toggle('active', isMatch);
            });
        }
    }

    window.addEventListener('scroll', updateActiveNavOnScroll, { passive: true });
    updateActiveNavOnScroll(); // Trigger once on initial load

    // ==========================================
    // 3. MOBILE NAVIGATION DRAWER
    // ==========================================
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenu.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenu.classList.remove('active');
            }
        });
    }

    // ==========================================
    // 4. VIDEO SHOWCASE MODAL
    // ==========================================
    const videoCard = document.getElementById('videoCard');
    const videoModal = document.getElementById('videoModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalIframe = document.getElementById('modalIframe');
    const videoURL = "https://www.youtube.com/embed/ScMzIvxBSi4?autoplay=1";

    function closeModal() {
        if (modalIframe) modalIframe.src = "";
        if (videoModal) videoModal.classList.remove('active');
    }

    if (videoCard) {
        videoCard.addEventListener('click', () => {
            if (modalIframe) modalIframe.src = videoURL;
            if (videoModal) videoModal.classList.add('active');
        });
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (videoModal) {
        videoModal.addEventListener('click', e => {
            if (e.target === videoModal) closeModal();
        });
    }
});