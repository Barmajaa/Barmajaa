import {renderStatistics} from './statistics.js';
import {animateStats} from './animation.js';

export function gotoSection(name) {
    document.querySelectorAll(".page-section").forEach(section => section.classList.remove("active", "visible"));
    document.querySelectorAll(".nav-btn").forEach(button => button.classList.remove("active"));
    const section = document.getElementById(name);
    if (section) section.classList.add("active");
    const button = document.querySelector(`.nav-btn[data-section="${name}"]`);
    if (button) button.classList.add("active");
    window.scrollTo({top: 0, behavior: "smooth"});
    requestAnimationFrame(() => {
        if (name === "statistics") {
            renderStatistics(() => {
                section.classList.add("visible");
                animateSectionElements(name);
            });
        } else {
            section.classList.add("visible");
            animateSectionElements(name);
            if (name === "home") animateStats();
        }
    });
}

export function animateSectionElements(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const items = section.querySelectorAll(".project-card, .team-card, .skill-card, .contact-card");
    items.forEach(element => {
        const delay = Number(element.getAttribute("data-delay")) || 0;
        setTimeout(() => {
            element.classList.add("visible");
        }, delay);
    });
}