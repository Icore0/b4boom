document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initParticles();
    initSkillModals();
    initPixelBirds();
    initNameplateMagnet();
    initB4boomLetters();
    initAchievements();
    initSectionNameplates();
});

/* ─────────────────────────────────────────────
   Parallax Hero (Scroll + Cursor Tracking)
───────────────────────────────────────────── */
function initParallaxHero() {
    const hero = document.getElementById('home');
    if (!hero) return;

    const orb = document.getElementById('parallaxOrb');
    const layers = hero.querySelectorAll('.parallax-layer');
    const storyItems = hero.querySelectorAll('.scroll-story-item');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let targetOrbX = mouseX;
    let targetOrbY = mouseY;
    let currentOrbX = mouseX;
    let currentOrbY = mouseY;

    // Track mouse for parallax depth
    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;

        targetOrbX = mouseX;
        targetOrbY = mouseY;
    });

    // Animation Loop for smooth interpolation
    function renderFrame() {
        // Smooth orb follow
        currentOrbX += (targetOrbX - currentOrbX) * 0.1;
        currentOrbY += (targetOrbY - currentOrbY) * 0.1;

        if (orb) {
            orb.style.transform = `translate(calc(-50% + ${currentOrbX}px), calc(-50% + ${currentOrbY}px))`;
        }

        // Mouse Parallax (Layers move opposite to mouse)
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const shiftX = mouseX - centerX;
        const shiftY = mouseY - centerY;

        layers.forEach(layer => {
            const speed = parseFloat(layer.getAttribute('data-speed')) || 0;
            // Negative speed implies layer moves opposite to cursor
            const x = shiftX * speed * -1;
            const y = shiftY * speed * -1;

            // Also check scroll position for scroll parallax
            const scrollY = window.scrollY;
            const scrollShiftY = scrollY * speed * 4; // multiplier for stronger effect

            layer.style.transform = `translate3d(${x}px, ${y + scrollShiftY}px, 0)`;
        });

        requestAnimationFrame(renderFrame);
    }
    requestAnimationFrame(renderFrame);

    // Scroll Storytelling sequence
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Determine stagger based on index if multiple exist within view
                const index = Array.from(storyItems).indexOf(entry.target);
                setTimeout(() => {
                    entry.target.classList.add('story-visible');
                }, index * 200);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

    storyItems.forEach(item => {
        observer.observe(item);
    });
}

/* ─────────────────────────────────────────────
   b4boom Letter Proximity Animation
───────────────────────────────────────────── */
function initB4boomLetters() {
    const letters = document.querySelectorAll('#pixelTitle .letter');
    if (!letters.length) return;

    // Center of screen as default
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    // Track mouse globally
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const maxDist = 300;

    function updateLetters() {
        letters.forEach((letter, index) => {
            const rect = letter.getBoundingClientRect();
            // Center of the current letter
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;

            const dx = mouseX - cx;
            const dy = mouseY - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Calculate influence 0 to 1
            let influence = 1 - Math.min(dist / maxDist, 1);
            // Non-linear easing for snappier reaction
            influence = Math.pow(influence, 2);

            if (influence > 0) {
                // Determine random-like direction based on index to scatter them uniquely
                const directionX = (index % 2 === 0 ? 1 : -1) * (index + 1) * 2;
                const directionY = (index % 3 === 0 ? -1 : 1) * (index + 2) * 2;

                // Position offset
                const moveX = dx * -0.2 * influence + (directionX * influence * 10);
                const moveY = dy * -0.2 * influence + (directionY * influence * 10);

                // Spin based on influence and position
                const rotate = dx * 0.1 * influence;

                // Scale effect
                const scale = 1 + (0.4 * influence);

                // Blink/Shape via font weight and skew
                const weight = Math.round(100 + (700 * influence));
                const skewX = directionX * influence * 5;

                letter.style.display = 'inline-block';
                letter.style.fontVariationSettings = `"wght" ${weight}`;
                letter.style.fontWeight = weight;
                letter.style.transform = `translate(${moveX}px, ${moveY}px) scale(${scale}) rotate(${rotate}deg) skewX(${skewX}deg)`;

                // Allow headings to keep their native color unless highly influenced
                letter.style.color = influence > 0.5 ? 'var(--neon-red)' : 'inherit';
                letter.style.textShadow = `0 0 ${20 * influence}px var(--neon-red), 0 0 ${40 * influence}px var(--neon-red)`;
                letter.style.zIndex = Math.round(100 * influence);
            } else {
                // Reset to default
                letter.style.transform = `translate(0px, 0px) scale(1) rotate(0deg) skewX(0deg)`;
                letter.style.fontVariationSettings = `"wght" 100`;
                letter.style.fontWeight = 100;
                letter.style.color = 'inherit';
                letter.style.textShadow = 'none';
                letter.style.zIndex = 1;
            }
        });
        requestAnimationFrame(updateLetters);
    }

    updateLetters();
}

/* ─────────────────────────────────────────────
   Pixel Birds
───────────────────────────────────────────── */
function initPixelBirds() {
    const pixelTitle = document.getElementById('pixelTitle');
    const birdsContainer = document.getElementById('birdsContainer');
    if (!pixelTitle || !birdsContainer) return;

    let birdCooldown = false;
    let birdCount = 0;
    const MAX_BIRDS = 12;

    function spawnBird() {
        if (birdCount >= MAX_BIRDS) return;
        birdCount++;

        const bird = document.createElement('div');
        bird.className = 'pixel-bird';

        const angle = Math.random() * Math.PI * 2;
        const dist = 60 + Math.random() * 80;
        const ex = Math.cos(angle) * dist;
        const ey = Math.sin(angle) * dist - 20;
        const ex2 = ex * 1.4;
        const ey2 = ey * 1.4 - 20;
        const rot = (Math.random() - 0.5) * 30;
        const rot2 = rot + (Math.random() - 0.5) * 20;
        const rot3 = rot2 + (Math.random() - 0.5) * 20;
        const dur = 1.2 + Math.random() * 0.8;
        const delay = Math.random() * 0.3;

        bird.style.cssText = `
            left: 50%; top: 50%;
            --sx: 0px; --sy: 0px;
            --ex: ${ex}px; --ey: ${ey}px;
            --ex2: ${ex2}px; --ey2: ${ey2}px;
            --rot: ${rot}deg; --rot2: ${rot2}deg; --rot3: ${rot3}deg;
            --fly-dur: ${dur}s; --fly-delay: ${delay}s;
            --wing-l: ${-15 - Math.random() * 15}deg;
            --wing-r: ${15 + Math.random() * 15}deg;
        `;

        birdsContainer.appendChild(bird);

        setTimeout(() => {
            bird.remove();
            birdCount--;
        }, (dur + delay + 0.1) * 1000);
    }

    function spawnBirds() {
        if (birdCooldown) return;
        birdCooldown = true;
        const count = 6 + Math.floor(Math.random() * 5);
        for (let i = 0; i < count; i++) {
            setTimeout(spawnBird, i * 60);
        }
        setTimeout(() => { birdCooldown = false; }, 1800);
    }

    // Trigger on hover occasionally if not active
    pixelTitle.addEventListener('mousemove', (e) => {
        if (Math.random() > 0.98) spawnBirds();
    });

    pixelTitle.addEventListener('click', spawnBirds);
}

/* ─────────────────────────────────────────────
   Nameplate Magnetic Follow
───────────────────────────────────────────── */
function initNameplateMagnet() {
    const wrap = document.querySelector('.hero-title-wrap');
    if (!wrap) return;

    let tx = 0, ty = 0;
    let rx = 0, ry = 0;
    let targetTx = 0, targetTy = 0;
    let targetRx = 0, targetRy = 0;

    const STIFFNESS = 0.08;
    const MAX_SHIFT = 40; // increased shift for the magnetic pop
    const MAX_TILT = 30;
    const MAGNET_RADIUS = 300; // max distance for effect

    function onMouseMove(e) {
        const rect = wrap.getBoundingClientRect();
        // Calculate the center of the nameplate
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const distanceX = mouseX - centerX;
        const distanceY = mouseY - centerY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        // Check if cursor is within magnet radius
        if (distance < MAGNET_RADIUS) {
            // Calculate pull strength (0 to 1, strongest at center)
            const pull = 1 - (distance / MAGNET_RADIUS);

            // Ease-out pull curve
            const easePull = Math.pow(pull, 1.5);

            // Shift towards cursor (true magnet pull)
            targetTx = distanceX * 0.4 * easePull;
            targetTy = distanceY * 0.4 * easePull;

            // Tilt based on position (parallax effect)
            targetRy = (distanceX / rect.width) * MAX_TILT * easePull;
            targetRx = -(distanceY / rect.height) * MAX_TILT * easePull;

            // Clamp shift to bounds just in case
            targetTx = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, targetTx));
            targetTy = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, targetTy));
        } else {
            // Smoothly fall back to resting position
            targetTx = 0;
            targetTy = 0;
            targetRx = 0;
            targetRy = 0;
        }
    }

    function springStep() {
        tx += (targetTx - tx) * STIFFNESS;
        ty += (targetTy - ty) * STIFFNESS;
        rx += (targetRx - rx) * STIFFNESS;
        ry += (targetRy - ry) * STIFFNESS;

        wrap.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
        requestAnimationFrame(springStep);
    }

    document.addEventListener('mousemove', onMouseMove);
    requestAnimationFrame(springStep);

    const heroContent = document.querySelector('.hero-content');
    if (heroContent) heroContent.style.perspective = '1000px';
}

/* ─────────────────────────────────────────────
   Magnetic Content Cards Spring Physics
───────────────────────────────────────────── */
function initSectionNameplates() {
    const wrapElements = document.querySelectorAll('.magnetic-card-wrap');

    wrapElements.forEach(wrap => {
        const plate = wrap.querySelector('.magnetic-card-target');
        const glare = wrap.querySelector('.card-glare');
        if (!plate) return;

        let tx = 0, ty = 0, rx = 0, ry = 0;
        let targetTx = 0, targetTy = 0, targetRx = 0, targetRy = 0;
        let glareX = 50, glareY = 50;

        // Spring physics parameters
        let vx = 0, vy = 0, vrx = 0, vry = 0;
        const k = 200; // stiffness
        const d = 15;  // damping
        const mass = 1;
        let lastTime = performance.now();
        let isHovered = false;

        wrap.addEventListener('mousemove', (e) => {
            isHovered = true;
            plate.classList.add('active');
            const rect = wrap.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const mouseX = e.clientX;
            const mouseY = e.clientY;

            // percentage from -1 to 1 based on center
            const percX = (mouseX - centerX) / (rect.width / 2);
            const percY = (mouseY - centerY) / (rect.height / 2);

            // Subtle magnetic translation (max 10px) to keep text readable
            targetTx = percX * 10;
            targetTy = percY * 10;

            // Subtle tilt limit (10deg) so text remains readable
            targetRy = percX * 10;
            targetRx = -percY * 10;

            // Glare specular highlight moves opposite to the cursor
            // When mouse is at left (0%), glare is at right (100%)
            if (glare) {
                glareX = 100 - ((mouseX - rect.left) / rect.width * 100);
                glareY = 100 - ((mouseY - rect.top) / rect.height * 100);
                glare.style.left = `${glareX}%`;
                glare.style.top = `${glareY}%`;
            }
        });

        wrap.addEventListener('mouseleave', () => {
            isHovered = false;
            plate.classList.remove('active');

            // Revert towards origin
            targetTx = 0;
            targetTy = 0;
            targetRx = 0;
            targetRy = 0;

            if (glare) {
                // Return glare loosely to center
                glare.style.left = `50%`;
                glare.style.top = `50%`;
            }
        });

        function animate(time) {
            // Calculate delta time, cap at 0.05s to prevent huge jumps if tab is inactive
            const dt = Math.min((time - lastTime) / 1000, 0.05);
            lastTime = time;

            // F = -k*(current - target) - d*v
            const ax = (-k * (tx - targetTx) - d * vx) / mass;
            const ay = (-k * (ty - targetTy) - d * vy) / mass;
            const arx = (-k * (rx - targetRx) - d * vrx) / mass;
            const ary = (-k * (ry - targetRy) - d * vry) / mass;

            vx += ax * dt;
            vy += ay * dt;
            vrx += arx * dt;
            vry += ary * dt;

            tx += vx * dt;
            ty += vy * dt;
            rx += vrx * dt;
            ry += vry * dt;

            // Optimization check: if close enough to 0 & not hovered, we can technically skip updating transform
            plate.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    });
}

// Skill Modal Logic
function initSkillModals() {
    const modal = document.getElementById('skill-modal');
    const closeBtn = document.getElementById('close-modal'); // Fixed ID
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const skillChips = document.querySelectorAll('.skill-chips .chip');

    if (!modal || !closeBtn) return;

    const skillContent = {
        'editor': 'knows how to use Davinci Resolve, Adobe is js dog shit bruh, can do basic ediitng and some advanced things',
        'gamer': 'play 2 games Minecraft and Smash Karts (under dawg), am HT3 in minecraft, have been playing games for like 5 years, started in Covid 💀',
        'ai': 'Passionate about leveraging Large Language Models, generative art, and automated workflows to enhance productivity and create unique content.',
        'cook': 'I cook too, loves to make new dishes, cottage cheese is my fav. yo its best, most of my dishes got cottage cheese in it :p',
        'sketch': 'loves to make drawings :> won\'t show cuz am shy hehe',
        'rizzler': '100% success rate, slide in digits to test me 😭🙏🏼, I am that appetitive fruit that people wants to bite'
    };

    function openModal(skill) {
        if (skill && skillContent[skill]) {
            // Find the chip title based on data attribute
            const chip = document.querySelector(`.chip[data-skill="${skill}"]`);
            modalTitle.textContent = chip ? chip.querySelector('.social-platform').textContent : skill;
            modalBody.textContent = skillContent[skill];
            modal.classList.add('active');
        }
    }

    function closeModal() {
        modal.classList.remove('active');
    }

    skillChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent document click from immediately closing
            const skill = chip.getAttribute('data-skill');
            openModal(skill);
        });
    });

    // Close logic
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeModal();
    });

    // Close when clicking outside the modal content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Custom Cursor Implementation
function initCursor() {
    const cursor = document.getElementById('cursor');

    // Position state
    let mouseX = 0;
    let mouseY = 0;

    const glassPanels = document.querySelectorAll('.glass-panel');

    // Listeners for mouse movement
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Immediately move the small dot
        cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;

        // Set variables on document for global grid glow
        document.documentElement.style.setProperty('--mouse-x', `${mouseX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${mouseY}px`);

        glassPanels.forEach(panel => {
            const rect = panel.getBoundingClientRect();
            const x = mouseX - rect.left;
            const y = mouseY - rect.top;
            panel.style.setProperty('--mouse-x', `${x}px`);
            panel.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    initScrollAnimations();
    initScrollSpy();
}

/* ─────────────────────────────────────────────
   Reveal on Scroll — full-page auto-tagging
───────────────────────────────────────────── */
function initScrollAnimations() {
    const rules = [
        { sel: '.section-title', dir: 'reveal-up' },
        { sel: '.hero-subtitle', dir: 'reveal-up' },
        { sel: '.hero-tagline', dir: 'reveal-up' },
        { sel: '.social-icons', dir: 'reveal-scale' },
        { sel: '.scroll-indicator', dir: 'reveal-fade' },
        { sel: '.about-text', dir: 'reveal-up' },
        { sel: '.status-badge', dir: 'reveal-fade' },
        { sel: '.chip', dir: 'reveal-scale' },
        { sel: '.contact-item', dir: 'reveal-right' },
        { sel: '.nav-item', dir: 'reveal-left' },
        { sel: '.glass-card', dir: 'reveal-up' },
        { sel: '.achievement-card', dir: 'reveal-scale' },
        { sel: '.mission-card', dir: 'reveal-scale' },
    ];

    const alreadyTagged = new Set();

    document.querySelectorAll('[class*="reveal-"]').forEach(el => {
        const hasDir = ['reveal-up', 'reveal-down', 'reveal-left', 'reveal-right', 'reveal-scale', 'reveal-fade']
            .some(c => el.classList.contains(c));
        if (!hasDir) el.classList.add('reveal-up');

        if (!el.classList.contains('reveal-item')) {
            el.classList.add('reveal-item');
        }
        alreadyTagged.add(el);
    });

    rules.forEach(({ sel, dir }) => {
        document.querySelectorAll(sel).forEach(el => {
            if (el.id === 'home' || el.closest('#home')) return; // let hero animate specially if needed
            if (alreadyTagged.has(el)) return;
            el.classList.add('reveal-item', dir);
            alreadyTagged.add(el);
        });
    });

    const staggerGroups = [
        '.skill-chips',
        '.achievements-grid',
        '.missions-grid',
        '.social-icons',
        '.sidebar-nav',
    ];

    staggerGroups.forEach(groupSel => {
        document.querySelectorAll(groupSel).forEach(group => {
            const children = Array.from(group.querySelectorAll('.reveal-item'));
            children.forEach((child, i) => {
                if (!child.style.getPropertyValue('--delay')) {
                    child.style.setProperty('--delay', (i * 0.07) + 's');
                }
            });
        });
    });

    document.querySelectorAll('.nav-item').forEach((item, i) => {
        item.style.setProperty('--delay', (0.1 + i * 0.09) + 's');
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -48px 0px'
    });

    document.querySelectorAll('.reveal-item').forEach(el => revealObserver.observe(el));
}

// Sidebar Active State Sync (ScrollSpy)
function initScrollSpy() {
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-item');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });
}

/* ─────────────────────────────────────────────
   Removed Mission Tilt (now uses Magnetic Cards)
───────────────────────────────────────────── */

// Discord Copy Functionality
window.copyDiscord = function () {
    navigator.clipboard.writeText('frboom_').then(() => {
        const btn = document.getElementById('discord-btn');
        const originalTitle = btn.getAttribute('title');

        // Visual feedback
        btn.style.borderColor = 'var(--status-green)';
        btn.setAttribute('title', 'Copied to clipboard!');

        // Also show a small alert or toast
        let toast = document.createElement('div');
        toast.className = 'copy-toast';
        toast.innerText = 'Copied frboom_ to clipboard!';
        document.body.appendChild(toast);

        // Trigger reflow to ensure the transition happens
        void toast.offsetWidth;
        toast.classList.add('show-toast');

        setTimeout(() => {
            btn.style.borderColor = '';
            btn.setAttribute('title', 'Copy Discord Username');

            toast.classList.remove('show-toast');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300); // match transition duration
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
};

/* ─────────────────────────────────────────────
   Background Particles (Constellation effect)
───────────────────────────────────────────── */
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];
    const PARTICLE_COUNT = 200;
    const MAX_DISTANCE = 110;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    class Particle {
        constructor(x, y, isTrail = false) {
            this.x = x !== undefined ? x : Math.random() * width;
            this.y = y !== undefined ? y : Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.radius = Math.random() * 1.5 + 0.5;

            this.isTrail = isTrail;
            this.life = isTrail ? 1.0 : 1.0;
            this.decay = isTrail ? (Math.random() * 0.05 + 0.04) : 0;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.isTrail) {
                this.life -= this.decay;
            } else {
                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
            }
        }

        draw() {
            if (this.life <= 0) return;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.isTrail ? this.life * 0.6 : 0.6})`;
            ctx.fill();
        }
    }

    function init() {
        resize();
        window.addEventListener('resize', resize);
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }

        // Add fading star particles on mouse move to form drawing pattern
        window.addEventListener('mousemove', (e) => {
            // Spawn just 1 particle per mouse move for minimal trail
            for (let i = 0; i < 1; i++) {
                particles.push(new Particle(
                    e.clientX + (Math.random() - 0.5) * 10,
                    e.clientY + (Math.random() - 0.5) * 10,
                    true
                ));
            }
        });

        animate();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Filter out dead trail particles
        particles = particles.filter(p => p.life > 0);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            for (let j = i + 1; j < particles.length; j++) {
                const p1 = particles[i];
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < MAX_DISTANCE) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);

                    // Constellation line alpha considers distance and trail fading state
                    const lifeFactor = Math.min(p1.life, p2.life);
                    const alpha = (1 - (dist / MAX_DISTANCE)) * lifeFactor * 0.25;

                    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }

    init();
}

/* ─────────────────────────────────────────────
/* ─────────────────────────────────────────────
   Achievements Tabs Logic
───────────────────────────────────────────── */
window.changeAchievementTab = function (btn) {
    console.log('Tab clicked via onclick!', btn.getAttribute('data-tab'));

    const tabBtns = document.querySelectorAll('.tab-btn');
    const achPanes = document.querySelectorAll('.ach-pane');

    // Remove active from all
    tabBtns.forEach(b => b.classList.remove('active'));
    achPanes.forEach(p => p.classList.remove('active'));

    // Add active to clicked and matching pane
    btn.classList.add('active');
    const targetId = btn.getAttribute('data-tab');
    const targetPane = document.getElementById(targetId);
    if (targetPane) {
        targetPane.classList.add('active');
    }
};

function initAchievements() {
    // Empty initialization. Logic is securely handled via onclick in HTML.
}


