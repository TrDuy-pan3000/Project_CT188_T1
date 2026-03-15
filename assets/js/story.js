document.addEventListener('DOMContentLoaded', () => {
    initStoryScrollReveal();
    initStoryHeroParallax();
});

function initStoryScrollReveal() {
    const revealItems = document.querySelectorAll('.reveal-item');
    if (!revealItems.length) {
        return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        revealItems.forEach((item) => {
            item.style.setProperty('--reveal-x', '0px');
            item.style.setProperty('--reveal-y', '0px');
            item.style.setProperty('--reveal-scale', '1');
        });
        return;
    }

    const getOffsetConfig = (item) => {
        if (item.classList.contains('reveal-left')) {
            return { x: -100, y: 18 };
        }
        if (item.classList.contains('reveal-right')) {
            return { x: 100, y: 18 };
        }
        return { x: 0, y: 76 };
    };

    const itemStates = Array.from(revealItems).map((item) => ({
        item,
        currentX: 0,
        currentY: 0,
        currentScale: 1,
        targetX: 0,
        targetY: 0,
        targetScale: 1
    }));

    let ticking = false;
    let animationFrameId = 0;

    const updateTargets = () => {
        const viewportHeight = window.innerHeight || 1;

        itemStates.forEach((state) => {
            const { item } = state;
            const rect = item.getBoundingClientRect();
            const itemCenter = rect.top + rect.height / 2;
            const progressRaw = (viewportHeight * 0.9 - itemCenter) / (viewportHeight * 0.65);
            const progress = Math.max(0, Math.min(1, progressRaw));
            const eased = 1 - Math.pow(1 - progress, 2);

            const { x, y } = getOffsetConfig(item);
            state.targetX = x * (1 - eased);
            state.targetY = y * (1 - eased);
            state.targetScale = 0.982 + eased * 0.018;
        });

        ticking = false;
        if (!animationFrameId) {
            animationFrameId = window.requestAnimationFrame(animateTowardsTargets);
        }
    };

    const lerp = (start, end, factor) => start + (end - start) * factor;

    const animateTowardsTargets = () => {
        let hasMotion = false;

        itemStates.forEach((state) => {
            state.currentX = lerp(state.currentX, state.targetX, 0.14);
            state.currentY = lerp(state.currentY, state.targetY, 0.14);
            state.currentScale = lerp(state.currentScale, state.targetScale, 0.14);

            state.item.style.setProperty('--reveal-x', `${state.currentX.toFixed(2)}px`);
            state.item.style.setProperty('--reveal-y', `${state.currentY.toFixed(2)}px`);
            state.item.style.setProperty('--reveal-scale', state.currentScale.toFixed(3));

            if (
                Math.abs(state.currentX - state.targetX) > 0.12 ||
                Math.abs(state.currentY - state.targetY) > 0.12 ||
                Math.abs(state.currentScale - state.targetScale) > 0.002
            ) {
                hasMotion = true;
            }
        });

        if (hasMotion) {
            animationFrameId = window.requestAnimationFrame(animateTowardsTargets);
            return;
        }

        animationFrameId = 0;
    };

    const requestUpdate = () => {
        if (ticking) {
            return;
        }
        ticking = true;
        window.requestAnimationFrame(updateTargets);
    };

    requestUpdate();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
}

function initStoryHeroParallax() {
    const hero = document.getElementById('storyHero');
    const heroBg = document.getElementById('storyHeroBg');
    const heroContent = document.getElementById('storyHeroContent');
    if (!hero || !heroBg || !heroContent) {
        return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        return;
    }

    let ticking = false;

    const updateParallax = () => {
        const rect = hero.getBoundingClientRect();
        const heroHeight = rect.height || 1;

        if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
            ticking = false;
            return;
        }

        const scrollProgress = Math.max(0, Math.min(1, -rect.top / heroHeight));
        const bgOffset = scrollProgress * 18;
        const contentOffset = scrollProgress * 26;
        const contentOpacity = Math.max(0.7, 1 - scrollProgress * 0.26);

        heroBg.style.transform = `translateY(${bgOffset}px)`;
        heroContent.style.transform = `translateY(${contentOffset}px)`;
        heroContent.style.opacity = String(contentOpacity);

        ticking = false;
    };

    const onScroll = () => {
        if (ticking) {
            return;
        }
        ticking = true;
        window.requestAnimationFrame(updateParallax);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
}
