import {toEasternNumber} from './utils.js';

let statsObserver = null;

export function animateStats() {
    if (statsObserver) statsObserver.disconnect();
    const cards = document.querySelectorAll(".stat-card");
    if (!cards.length) return;

    const startCounting = () => {
        cards.forEach(card => {
            const valueElement = card.querySelector(".stat-val");
            const target = Number(card.dataset.target) || 0;
            const duration = 600 + Math.random() * 900;
            let current = 0;
            let startTime = null;

            function update(timestamp) {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                current = Math.floor(target * eased);
                valueElement.textContent = toEasternNumber(current);
                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    valueElement.textContent = toEasternNumber(target);
                }
            }

            requestAnimationFrame(update);
        });
        if (statsObserver) statsObserver.disconnect();
    };

    if (!window.IntersectionObserver) {
        startCounting();
        return;
    }

    let triggered = false;
    statsObserver = new IntersectionObserver(entries => {
        if (triggered) return;
        const anyVisible = entries.some(entry => entry.isIntersecting);
        if (!anyVisible) return;
        triggered = true;
        startCounting();
    }, {threshold: 0.15});

    cards.forEach(card => statsObserver.observe(card));
}

export function typeHero() {
    const target = document.getElementById("typeTarget");
    const text = "برمجة";
    let index = 0;
    let isDeleting = false;

    function typeLoop() {
        if (!isDeleting) {
            target.textContent = text.substring(0, index + 1);
            index++;
            if (index === text.length) {
                setTimeout(() => {
                    isDeleting = true;
                    typeLoop();
                }, 1200);
                return;
            }
            setTimeout(typeLoop, 120);
        } else {
            target.textContent = text.substring(0, index);
            index--;
            if (index === 0) {
                isDeleting = false;
                setTimeout(typeLoop, 400);
                return;
            }
            setTimeout(typeLoop, 60);
        }
    }

    setTimeout(typeLoop, 400);
}