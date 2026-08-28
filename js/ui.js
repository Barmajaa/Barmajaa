import {data, chartState} from './data.js';
import {toEasternNumber, getAllTechnologies, getMemberExperience, getTotalExperience, getAllCvSkillsCount, getTopTechnologyFromCVs, getAverageTechnologiesPerMember, getProjectsByYear, getFilteredProjects, getTechnologyUsage, getCategoryUsage, extractTechnologiesFromMember, yearToIslamic, normalizeYear} from './utils.js';

export function renderStats() {
    const container = document.getElementById("statsContainer");
    if (!container) return;
    const totalExperience = getTotalExperience();
    const technologyCount = getAllTechnologies().length;
    const cvSkillsCount = getAllCvSkillsCount();
    const stats = [
        {val: data.projects.length, label: "مشروعاً مكتملًا", target: data.projects.length},
        {val: totalExperience, label: "سنوات خبرة إجمالي الفريق", target: totalExperience},
        {val: data.members.length, label: "عضو في الفريق", target: data.members.length},
        {val: technologyCount, label: "أداة وتقنية", target: technologyCount}
    ];
    container.innerHTML = stats.map(stat => `
        <div class="pixel-card stat-card" data-target="${stat.target}">
            <div class="stat-val" data-count="0">٠</div>
            <div class="stat-label">${stat.label}</div>
        </div>
    `).join("");
    container.dataset.cvSkills = cvSkillsCount;
}

export function renderProjects() {
    const container = document.getElementById("projectsContainer");
    if (!container) return;
    container.innerHTML = data.projects.map((project, index) => {
        const islamicYear = yearToIslamic(parseInt(normalizeYear(project.year)));
        return `
        <div class="pixel-card project-card" data-delay="${index * 80}">
            <div class="proj-head">
                <h3>${project.title}</h3>
                <span class="proj-year">${toEasternNumber(islamicYear)}</span>
            </div>
            <p>${project.desc}</p>
            <div class="tag-list">${project.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}</div>
        </div>
    `
    }).join("");
}

export function renderTeam() {
    const container = document.getElementById("teamContainer");
    if (!container) return;
    container.innerHTML = data.members.map((member, index) => `
        <div class="pixel-card team-card" data-delay="${index * 100}">
            <h3>${member.name}</h3>
            <p class="team-role">${member.role.replace(/\n/g, "<br/>")}</p>
            <p class="team-bio">${member.bio || ""}</p>
            <button class="pixel-btn" data-member="${member.id}" style="margin-top:16px;">السيرة الذاتية</button>
        </div>
    `).join("");
    container.querySelectorAll("[data-member]").forEach(button => {
        button.addEventListener("click", function () {
            openCV(Number(this.dataset.member));
        });
    });
}

export function renderSkills() {
    const container = document.getElementById("skillsContainer");
    if (!container) return;
    const technologies = getAllTechnologies();
    container.innerHTML = technologies.map((technology, index) => `
        <div class="skill-card" data-delay="${index * 50}">
            <span class="skill-name">${technology}</span>
        </div>
    `).join("");
}

export function renderContacts() {
    const container = document.getElementById("contactLinks");
    if (!container) return;
    container.innerHTML = data.contacts.map((contact, index) => `
        <div class="pixel-card contact-card" data-delay="${index * 120}">
            <span class="contact-icon">${contact.icon}</span>
            <div>
                <div class="contact-label">${contact.label}</div>
                <div class="contact-val">${contact.value}</div>
            </div>
        </div>
    `).join("");
}

export function openCV(id) {
    const member = data.members.find(item => item.id === id);
    if (!member) return;
    const content = document.getElementById("cvContent");
    const experience = getMemberExperience(member);
    let html = `
        <p><strong>الاسم:</strong> ${member.name}</p>
        <p><strong>المهنة:</strong> ${member.role}</p>
        <p><strong>سنوات الخبرة:</strong> ${toEasternNumber(experience)}</p>
        <p><strong>الخبرات التقنية:</strong></p>
        <ul class="cv-list">
    `;
    Object.entries(member.cvDetails).forEach(([category, techs]) => {
        html += `<li><strong>${category}</strong>: ${techs.join(", ")}</li>`;
    });
    html += "</ul>";
    content.innerHTML = html;
    document.getElementById("cvModal").classList.add("active");
}

export function closeCV() {
    document.getElementById("cvModal").classList.remove("active");
}

export function renderHomeAnalysis() {
    const yearStats = getProjectsByYear(data.projects);
    const years = Object.keys(yearStats);
    const bestYear = years.length ? years.reduce((best, year) => yearStats[year] > yearStats[best] ? year : best, years[0]) : null;
    const topTechFromCV = getTopTechnologyFromCVs();
    const avgTechPerMember = getAverageTechnologiesPerMember();
    const yearElement = document.getElementById("homeBestYear");
    const yearMeta = document.getElementById("homeBestYearMeta");
    const techElement = document.getElementById("homeTopTech");
    const techMeta = document.getElementById("homeTopTechMeta");
    const avgElement = document.getElementById("homeAvgTech");
    if (yearElement) yearElement.textContent = bestYear ? toEasternNumber(bestYear) : "—";
    if (yearMeta) yearMeta.textContent = bestYear ? `${toEasternNumber(yearStats[bestYear])} مشاريع` : "—";
    if (techElement) techElement.textContent = topTechFromCV ? topTechFromCV[0] : "—";
    if (techMeta) techMeta.textContent = topTechFromCV ? `ظهر في ${toEasternNumber(topTechFromCV[1])} سيرة ذاتية` : "—";
    if (avgElement) avgElement.textContent = toEasternNumber(avgTechPerMember.toFixed(1));
}

export function renderStatisticsKpis(projects) {
    const container = document.getElementById("statisticsKpis");
    if (!container) return;
    const totalProjects = projects.length;
    const technologyUsage = getTechnologyUsage(projects);
    const categories = getCategoryUsage(projects);
    const totalTechnologyUses = projects.reduce((sum, project) => sum + project.tags.length, 0);
    const averageTechnologies = totalProjects ? (totalTechnologyUses / totalProjects).toFixed(1) : "0.0";
    const topTechnology = technologyUsage.length ? technologyUsage[0][0] : "—";
    const topTechnologyCount = technologyUsage.length ? technologyUsage[0][1] : 0;
    const topCategory = categories.length ? categories[0][0] : "—";
    const cards = [
        {label: "المشاريع المعروضة", value: totalProjects, description: "حسب الفترة المختارة"},
        {label: "التقنيات المختلفة", value: new Set(projects.flatMap(project => project.tags)).size, description: "تقنيات فريدة"},
        {label: "متوسط التقنيات", value: averageTechnologies, description: "لكل مشروع"},
        {label: "الأكثر استخداماً", value: topTechnology, description: `ظهر في ${toEasternNumber(topTechnologyCount)} مشاريع`}
    ];
    container.innerHTML = cards.map(card => `
        <div class="pixel-card statistics-kpi">
            <div class="kpi-label">${card.label}</div>
            <div class="kpi-value">${typeof card.value === "number" ? toEasternNumber(card.value) : card.value}</div>
            <div class="kpi-description">${card.description}</div>
        </div>
    `).join("");
}

export function renderStatisticsTable(projects) {
    const body = document.getElementById("statisticsTableBody");
    if (!body) return;
    const totalProjects = data.projects.length;
    const projectCount = projects.length;
    const technologyUsage = getTechnologyUsage(projects);
    const categoryUsage = getCategoryUsage(projects);
    const totalTechnologies = new Set(projects.flatMap(project => project.tags)).size;
    const average = projectCount ? (projects.reduce((sum, project) => sum + project.tags.length, 0) / projectCount).toFixed(1) : "0.0";
    const topTechnology = technologyUsage.length ? technologyUsage[0] : ["—", 0];
    const topCategory = categoryUsage.length ? categoryUsage[0] : ["—", 0];
    const rows = [
        {name: "عدد المشاريع", value: projectCount, percentage: totalProjects ? `${Math.round(projectCount / totalProjects * 100)}%` : "0%", description: "عدد المشاريع ضمن الفلتر الحالي"},
        {name: "التقنيات المختلفة", value: totalTechnologies, percentage: "—", description: "عدد التقنيات الفريدة"},
        {name: "متوسط التقنيات", value: average, percentage: "—", description: "متوسط عدد التقنيات في المشروع"},
        {name: "التقنية الأكثر استخداماً", value: topTechnology[0], percentage: projectCount ? `${Math.round(topTechnology[1] / projectCount * 100)}%` : "0%", description: "نسبة المشاريع التي تستخدمها"},
        {name: "المجال الأكثر حضوراً", value: topCategory[0], percentage: projectCount ? `${Math.round(topCategory[1] / projectCount * 100)}%` : "0%", description: "الفئة الأكثر تمثيلاً"}
    ];
    body.innerHTML = rows.map(row => `
        <tr>
            <td>${row.name}</td>
            <td>${typeof row.value === "number" ? toEasternNumber(row.value) : row.value}</td>
            <td>${row.percentage}</td>
            <td>${row.description}</td>
        </tr>
    `).join("");
}