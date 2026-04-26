// ==================== MOBILE MENU ==================== //
document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('js-ready');

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = document.querySelectorAll('.mobile-menu a, .nav-links a');

    // Toggle mobile menu
    mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });

    // Close mobile menu when link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    });

    // ==================== FAQ ACCORDION ==================== //
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            // Close other items (one at a time pattern)
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });

    // ==================== DEMO FORM (PREVIEW MODE - DISABLED) ==================== //
    // Demo section is now a preview only - all inputs are disabled
    // This prevents any interaction as login is required

    // ==================== UTILITY FUNCTIONS ==================== //
    function generateShortCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // ==================== SMOOTH SCROLL & SECTION STAGGER ==================== //
    const staggerGroups = document.querySelectorAll('.stagger-group');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.14,
            rootMargin: '0px 0px -8% 0px'
        });

        staggerGroups.forEach((group, groupIndex) => {
            const items = group.querySelectorAll('.reveal-item');
            items.forEach((item, itemIndex) => {
                const delay = Math.min(itemIndex * 80 + groupIndex * 20, 560);
                item.style.transitionDelay = `${delay}ms`;
                revealObserver.observe(item);
            });
        });
    } else {
        // Fallback for very old browsers
        document.querySelectorAll('.reveal-item').forEach(item => {
            item.classList.add('revealed');
        });
    }

    // ==================== CTA BUTTONS ==================== //
    const ctaButtons = document.querySelectorAll('.btn-primary[href="#"], .btn-large:not([type])');
    
    ctaButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (!this.hasAttribute('type') && this.getAttribute('href') === '#') {
                e.preventDefault();
                // You can redirect to your app/signup page here
                console.log('Navigate to signup/app');
            }
        });
    });

    // ==================== ACTIVE LINK HIGHLIGHTING ==================== //
    const sections = document.querySelectorAll('section[id]');
    const navLinkItems = document.querySelectorAll('.nav-links a[href*="#"]');

    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinkItems.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.style.color = '#0F63DC';
                link.style.fontWeight = '700';
            } else {
                link.style.color = 'inherit';
                link.style.fontWeight = '500';
            }
        });
    });

    // ==================== BUTTON RIPPLE EFFECT ==================== //
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            // Add ripple styles dynamically
            if (!document.querySelector('style[data-ripple]')) {
                const style = document.createElement('style');
                style.setAttribute('data-ripple', 'true');
                style.textContent = `
                    .btn { position: relative; overflow: hidden; }
                    .ripple {
                        position: absolute;
                        border-radius: 50%;
                        background: rgba(255, 255, 255, 0.5);
                        transform: scale(0);
                        animation: ripple-animation 0.6s ease-out;
                        pointer-events: none;
                    }
                    @keyframes ripple-animation {
                        to {
                            transform: scale(4);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
            }

            this.appendChild(ripple);
        });
    });

    // ==================== PAGE LOAD ANIMATION ==================== //
    window.addEventListener('load', function() {
        document.body.style.opacity = '1';
    });

    // ==================== FORM VALIDATION ==================== //
    const urlInputs = document.querySelectorAll('input[type="url"]');
    
    urlInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !isValidUrl(this.value)) {
                this.style.borderColor = '#EF4444';
                this.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
            } else {
                this.style.borderColor = '';
                this.style.boxShadow = '';
            }
        });
    });

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    // ==================== SCROLL TO TOP BUTTON ==================== //
    // Create scroll to top button
    const scrollBtn = document.createElement('button');
    scrollBtn.textContent = '↑';
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #0F63DC;
        color: white;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s ease-out;
        z-index: 999;
        font-size: 1.5rem;
        font-weight: bold;
        display: none;
        box-shadow: 0 4px 12px rgba(15, 99, 220, 0.3);
    `;

    document.body.appendChild(scrollBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.display = 'flex';
            scrollBtn.style.alignItems = 'center';
            scrollBtn.style.justifyContent = 'center';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.display = 'none';
        }
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    scrollBtn.addEventListener('mouseenter', function() {
        this.style.background = '#0a47aa';
    });

    scrollBtn.addEventListener('mouseleave', function() {
        this.style.background = '#0F63DC';
    });

    // ==================== PERFORMANCE OPTIMIZATION ==================== //
    // Lazy load images if needed
    if ('IntersectionObserver' in window) {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });
        images.forEach(img => imageObserver.observe(img));
    }
});

// ==================== CONSOLE LOG ==================== //
console.log('%c Welcome to Shortify!', 'color: #0F63DC; font-size: 20px; font-weight: bold;');
console.log('%c Shorten. Share. Track.', 'color: #0F63DC; font-size: 14px;');