/**
 * Radhe Electrical Motihari - Infinite Seamless Slider
 * Technique: Clone first & last slides with invisible jump on transitionend.
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

    const total = slides.length;
    let currentIndex = 1;
    let isTransitioning = false;
    let autoPlayTimer = null;

    // Clone first & last
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[total - 1].cloneNode(true);
    firstClone.classList.add('clone');
    lastClone.classList.add('clone');

    track.insertBefore(lastClone, slides[0]);
    track.appendChild(firstClone);

    // Position helpers
    function setTrack(index, animate = false) {
        track.style.transition = animate ? 'transform 0.45s cubic-bezier(0.25,1,0.5,1)' : 'none';
        track.style.transform = `translateX(${-index * 100}%)`;
    }

    setTrack(currentIndex);

    // Dots
    dotsContainer.innerHTML = '';
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
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

    // Navigation
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
        if (currentIndex === total + 1) {
            currentIndex = 1;
            setTrack(currentIndex);
        }
        if (currentIndex === 0) {
            currentIndex = total;
            setTrack(currentIndex);
        }
    });

    nextBtn.addEventListener('click', () => { nextSlide(); resetAutoPlay(); });
    prevBtn.addEventListener('click', () => { prevSlide(); resetAutoPlay(); });

    // Autoplay
    function startAutoPlay() {
        stopAutoPlay();
        autoPlayTimer = setInterval(nextSlide, 5000);
    }
    function stopAutoPlay() { clearInterval(autoPlayTimer); }
    function resetAutoPlay() { stopAutoPlay(); startAutoPlay(); }

    // Drag/swipe
    let startX = 0, isDragging = false;
    viewport.addEventListener('mousedown', e => { startDrag(e.pageX); });
    viewport.addEventListener('touchstart', e => { startDrag(e.touches[0].clientX); }, { passive: true });

    function startDrag(pos) {
        if (isTransitioning) return;
        stopAutoPlay();
        isDragging = true;
        startX = pos;
        viewport.classList.add('grabbing');
    }

    window.addEventListener('mousemove', e => dragMove(e.pageX));
    window.addEventListener('touchmove', e => dragMove(e.touches[0].clientX), { passive: true });

    function dragMove(pos) {
        if (!isDragging) return;
        const diff = pos - startX;
        const offsetPct = (diff / viewport.offsetWidth) * 100;
        track.style.transition = 'none';
        track.style.transform = `translateX(${-(currentIndex * 100) + offsetPct}%)`;
    }

    window.addEventListener('mouseup', e => endDrag(e.pageX));
    window.addEventListener('touchend', e => endDrag(e.changedTouches[0].clientX));

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

    viewport.addEventListener('mouseenter', stopAutoPlay);
    viewport.addEventListener('mouseleave', startAutoPlay);

    // Keyboard
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
        resetAutoPlay();
    });

    startAutoPlay();

    // ==========================================
    // 2. MOBILE NAVIGATION DRAWER
    // ==========================================
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => navLinks.classList.toggle('active'));
        navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => navLinks.classList.remove('active')));
    }

    // ==========================================
    // 3. VIDEO SHOWCASE MODAL
    // ==========================================
    const videoCard = document.getElementById('videoCard');
    const videoModal = document.getElementById('videoModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalIframe = document.getElementById('modalIframe');
    const videoURL = "https://www.youtube.com/embed/ScMzIvxBSi4?autoplay=1";

    if (videoCard) videoCard.addEventListener('click', () => {
        if (modalIframe) modalIframe.src = videoURL;
        if (videoModal) videoModal.classList.add('active');
    });

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (videoModal) videoModal.addEventListener('click', e => { if (e.target === videoModal) closeModal(); });

    function closeModal() {
        if (modalIframe) modalIframe.src = "";
        if (videoModal) videoModal.classList.remove('active');
    }
});
