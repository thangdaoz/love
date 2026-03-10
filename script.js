document.addEventListener('DOMContentLoaded', () => {
    
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    initCustomCursor();
    initEnvelopeAndHero();

    // ==========================================
    // 1. Smooth Scrolling Setup (Lenis)
    // ==========================================
    let lenisInstance = null;
    function initSmoothScroll() {
        lenisInstance = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical', 
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        lenisInstance.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time)=>{ lenisInstance.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0, 0);
    }

    // ==========================================
    // 2. Custom Magnetic Cursor
    // ==========================================
    function initCustomCursor() {
        const cursor = document.querySelector('.cursor');
        const hoverTargets = document.querySelectorAll('.hover-target, a, button');

        gsap.set(cursor, {xPercent: -50, yPercent: -50});
        
        const xTo = gsap.quickTo(cursor, "x", {duration: 0.2, ease: "power3", force3D: true});
        const yTo = gsap.quickTo(cursor, "y", {duration: 0.2, ease: "power3", force3D: true});

        document.addEventListener('mousemove', (e) => {
            xTo(e.clientX);
            yTo(e.clientY);
        });

        hoverTargets.forEach((target) => {
            target.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
            target.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
        });
    }

    // ==========================================
    // 3. Intro → Hero Transition 
    // ==========================================
    function initEnvelopeAndHero() {
        const envelopeScreen = document.getElementById('envelopeScreen');
        const openBtn = document.getElementById('openEnvelopeBtn');
        const smoothWrapper = document.getElementById('smooth-wrapper');

        // Animate envelope intro elements in
        const introTl = gsap.timeline({ delay: 0.3 });
        introTl.from('.envelope-date', { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" });
        introTl.from('.envelope-heading', { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" }, '-=0.5');
        introTl.from('.envelope-icon', { y: 20, opacity: 0, duration: 1, ease: "power3.out" }, '-=0.5');
        introTl.from('.envelope-btn', { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, '-=0.6');

        openBtn.addEventListener('click', () => {
            openBtn.style.pointerEvents = 'none';

            // Step 1: Fade out button
            gsap.to(openBtn, { opacity: 0, duration: 0.5, ease: "power2.inOut" });

            // Step 2: Fade out entire screen & reveal main content
            setTimeout(() => {
                const transitionTl = gsap.timeline();

                transitionTl.to(envelopeScreen, {
                    opacity: 0,
                    scale: 0.95,
                    duration: 1,
                    ease: "power3.inOut",
                    onComplete: () => {
                        envelopeScreen.style.display = 'none';
                        document.body.classList.remove('loading');
                        ScrollTrigger.refresh();
                    }
                });

                // Show main content wrapper
                transitionTl.call(() => {
                    smoothWrapper.style.visibility = 'visible';
                    initSmoothScroll();
                    setTimeout(() => {
                        initStoryAnimations();
                        initHorizontalScroll();
                        ScrollTrigger.refresh();
                    }, 100);
                }, null, '-=0.5');

                // Hero Kinetic Typography Reveal
                const heroElems = document.querySelectorAll('.hero-elem');
                transitionTl.fromTo(heroElems, 
                    { y: 100, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: "power4.out" },
                    '-=0.3'
                );
            }, 500); // Wait for button fade out
        });
    }

    // ==========================================
    // 4. Story Section Animations
    // ==========================================
    function initStoryAnimations() {
        // Simple Fade In Up for TextBlocks
        const revealElements = document.querySelectorAll('.gs-reveal');
        
        revealElements.forEach((elem) => {
            gsap.fromTo(elem, 
                { y: 50, opacity: 0 },
                {
                    y: 0, 
                    opacity: 1,
                    duration: 1.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: elem,
                        start: "top 85%", // when top of elem hits 85% viewport height
                        toggleActions: "play none none none" // only play once
                    }
                }
            );
        });

        // Parallax Image Effect
        const parallaxMasks = document.querySelectorAll('.gs-parallax-mask');
        
        parallaxMasks.forEach((mask) => {
            const img = mask.querySelector('.gs-parallax-img');
            
            // The image starts physically moved up (yPercent: -10)
            // As we scroll, it moves down (yPercent: 10) creating parallax
            gsap.fromTo(img,
                { yPercent: -15 },
                {
                    yPercent: 15,
                    ease: "none",
                    scrollTrigger: {
                        trigger: mask,
                        start: "top bottom", // start when mask enters from bottom
                        end: "bottom top",   // end when mask leaves top
                        scrub: true         // tie directly to scroll progress
                    }
                }
            );
        });
    }

    // ==========================================
    // 5. Setup Horizontal Scrolling Gallery
    // ==========================================
    function initHorizontalScroll() {
        const horizontalSection = document.querySelector('.horizontal-gallery-section');
        const container = document.querySelector('.horizontal-container');
        
        // Calculate the total scrolling distance needed
        // It's the width of the container MINUS the width of the viewport
        let scrollAmount = () => -(container.scrollWidth - window.innerWidth);

        const horizontalTween = gsap.to(container, {
            x: scrollAmount,
            ease: "none", // important for consistent scroll feel
            scrollTrigger: {
                trigger: horizontalSection,
                start: "center center", 
                // pin the section while scrolling horizontally
                pin: true, 
                // How long the scroll takes (simulate height based on width for normalized scroll feel)
                end: () => `+=${container.scrollWidth}`, 
                scrub: 0.5, // adds a slight smoothing delay to the grab
                invalidateOnRefresh: true
            }
        });

        // BONUS: Image Horizontal Parallax
        // Move the image slightly left-to-right inside its wrapper while the section moves right-to-left
        const galleryImages = document.querySelectorAll('.image-item img');
        
        galleryImages.forEach((img) => {
            gsap.fromTo(img,
                { xPercent: -10 },
                {
                    xPercent: 10,
                    ease: "none",
                    scrollTrigger: {
                        trigger: horizontalSection,
                        start: "center center",
                        end: () => `+=${container.scrollWidth}`,
                        scrub: 0.5,
                        // Tie this to the same timeline to stay synced
                    }
                }
            );
        });
    }
});
