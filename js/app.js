import {data, chartState} from './data.js';
import {getCurrentIslamicDate, toEasternNumber} from './utils.js';
import {applyTheme, restoreThemeFromStorage} from './theme.js';
import {renderStats, renderProjects, renderTeam, renderSkills, renderContacts, closeCV, renderHomeAnalysis} from './ui.js';
import {renderStatistics, populateYearFilter} from './statistics.js';
import {gotoSection, animateSectionElements} from './navigation.js';
import {animateStats, typeHero} from './animation.js';

document.addEventListener("DOMContentLoaded", function () {
    restoreThemeFromStorage();
    updateHijriDate();
    setInterval(updateHijriDate, 60000);
    renderStats();
    renderProjects();
    renderTeam();
    renderSkills();
    renderContacts();
    renderHomeAnalysis();
    populateYearFilter();
    renderStatistics();
    document.getElementById("home").classList.add("visible");
    setTimeout(() => {
        animateSectionElements("home");
        animateStats();
    }, 200);
});

document.getElementById("cvModal").addEventListener("click", function (event) {
    if (event.target === this) closeCV();
});
document.getElementById("cvModalClose").addEventListener("click", closeCV);

document.querySelectorAll(".nav-btn").forEach(button => {
    button.addEventListener("click", function () {
        gotoSection(this.dataset.section);
    });
});

document.querySelectorAll("[data-goto]").forEach(button => {
    button.addEventListener("click", function () {
        gotoSection(this.dataset.goto);
    });
});

document.querySelectorAll(".theme-swatch").forEach(swatch => {
    swatch.addEventListener("click", function () {
        applyTheme(this.dataset.color, this.dataset.light, this.dataset.dim, this);
    });
});

document.getElementById("contactForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const form = this;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = "جاري الإرسال...";

    let iframe = document.getElementById("hiddenIframe");
    if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.id = "hiddenIframe";
        iframe.name = "hiddenIframe";
        iframe.style.display = "none";
        document.body.appendChild(iframe);
    }

    form.target = "hiddenIframe";
    form.action = "https://script.google.com/macros/s/AKfycbz3f0ojY8M-RpvcIlTcvMTdgceF-ZnHMlSI817_4juuJQ1SuzOibmJuF98pNYekT_b5/exec";
    form.method = "POST";

    iframe.onload = function () {
        alert("✅ تم إرسال رسالتك بنجاح!");
        form.reset();

        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        iframe.onload = null;
    };

    setTimeout(function () {
        if (submitBtn.disabled) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            alert("حدث خطأ في الإرسال، يرجى المحافظة على اتصالك والمحاولة مرة أخرى.");
        }
    }, 15000);

    form.submit();
});

document.getElementById("yearFilter").addEventListener("change", function () {
    chartState.selectedYear = this.value;
    renderStatistics();
});

document.getElementById("resetStatistics").addEventListener("click", function () {
    chartState.selectedYear = "all";
    document.getElementById("yearFilter").value = "all";
    renderStatistics();
});

const backBtn = document.getElementById("backToTop");
window.addEventListener("scroll", function () {
    if (window.scrollY > 400) backBtn.classList.add("show");
    else backBtn.classList.remove("show");
});
backBtn.addEventListener("click", function () {
    window.scrollTo({top: 0, behavior: "smooth"});
});

let resizeTimer = null;
window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (document.getElementById("statistics").classList.contains("active")) renderStatistics();
    }, 150);
});

function updateHijriDate() {
    const el = document.getElementById("hijriDate");
    if (!el) return;
    const islamic = getCurrentIslamicDate();
    const months = ["محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"];
    el.textContent = `${toEasternNumber(islamic.day)} ${months[islamic.month - 1]} ${toEasternNumber(islamic.year)}`;
}

typeHero();