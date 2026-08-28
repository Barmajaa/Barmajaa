import {data, chartState} from './data.js';

export function normalizeYear(year) {
    const eastern = "٠١٢٣٤٥٦٧٨٩";
    return String(year).replace(/[٠-٩]/g, digit => eastern.indexOf(digit));
}

export function toEasternNumber(value) {
    return String(value).replace(/\d/g, digit => "٠١٢٣٤٥٦٧٨٩"[digit]);
}

export function getCSSVariable(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function splitTechnologyValue(value) {
    return String(value).split(/[،,]\s*/).map(item => item.trim()).filter(Boolean).map(item => item.replace(/\((.*?)\)/g, "").trim()).filter(Boolean);
}

export function isLeapYear(hy) {
    return hy % 30 === 2 || hy % 30 === 5 || hy % 30 === 7 || hy % 30 === 10 || hy % 30 === 13 || hy % 30 === 16 || hy % 30 === 18 || hy % 30 === 21 || hy % 30 === 24 || hy % 30 === 26 || hy % 30 === 29;
}

export function daysInYear(hy) {
    return isLeapYear(hy) ? 355 : 354;
}

export function daysInMonth(hy, hm) {
    if (hm === 12 && isLeapYear(hy)) return 30;
    return hm % 2 === 1 ? 30 : 29;
}

export function gregorianToJulianDay(gy, gm, gd) {
    if (gm <= 2) {
        gy--;
        gm += 12;
    }
    let A = Math.floor(gy / 100);
    let B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (gy + 4716)) + Math.floor(30.6001 * (gm + 1)) + gd + B - 1524.5;
}

export function gregorianToIslamic(gy, gm, gd) {
    const jd = gregorianToJulianDay(gy, gm, gd);
    const islamicEpoch = 1948439.5;
    let days = Math.floor(jd - islamicEpoch);
    days += 1;
    let hy = 1;
    while (days >= daysInYear(hy)) {
        days -= daysInYear(hy);
        hy++;
    }
    let hm = 1;
    while (days >= daysInMonth(hy, hm)) {
        days -= daysInMonth(hy, hm);
        hm++;
    }
    let hd = days + 1;
    return {year: hy, month: hm, day: hd};
}

export function yearToIslamic(gy) {
    const result = gregorianToIslamic(gy, 1, 1);
    return result.year;
}

export function getCurrentIslamicDate() {
    const now = new Date();
    return gregorianToIslamic(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function calculateExperienceYears(startDate) {
    if (!startDate) return 0;
    const parts = startDate.split("-").map(Number);
    if (parts.length !== 3) return 0;
    const startIslamic = {year: parts[0], month: parts[1], day: parts[2]};
    const now = getCurrentIslamicDate();
    let years = now.year - startIslamic.year;
    if (now.month < startIslamic.month ||
        (now.month === startIslamic.month && now.day < startIslamic.day)) {
        years--;
    }
    return Math.max(0, years);
}

export function getMemberExperience(member) {
    return calculateExperienceYears(member.experienceStart);
}

export function getTotalExperience() {
    return data.members.reduce((total, member) => total + getMemberExperience(member), 0);
}

export function extractTechnologiesFromMember(member) {
    const technologySet = new Set();
    Object.values(member.cvDetails).forEach(techArray => {
        techArray.forEach(tech => technologySet.add(tech));
    });
    return Array.from(technologySet);
}

export function getAllTechnologies() {
    const technologySet = new Set();
    data.members.forEach(member => {
        extractTechnologiesFromMember(member).forEach(tech => technologySet.add(tech));
    });
    return Array.from(technologySet).sort((a, b) => a.localeCompare(b));
}

export function getAllCvSkillsCount() {
    return getAllTechnologies().length;
}

export function getProjectsByYear(projects) {
    const result = {};
    projects.forEach(project => {
        const year = yearToIslamic(parseInt(normalizeYear(project.year)));
        result[year] = (result[year] || 0) + 1;
    });
    return result;
}

export function getFilteredProjects() {
    if (chartState.selectedYear === "all") return data.projects;
    return data.projects.filter(project => yearToIslamic(parseInt(normalizeYear(project.year))) === parseInt(chartState.selectedYear));
}

export function getTechnologyUsage(projects) {
    const usage = {};
    projects.forEach(project => {
        project.tags.forEach(tag => {
            usage[tag] = (usage[tag] || 0) + 1;
        });
    });
    return Object.entries(usage).sort((a, b) => b[1] - a[1]);
}

export function getCategoryUsage(projects) {
    const usage = {};
    projects.forEach(project => {
        usage[project.category] = (usage[project.category] || 0) + 1;
    });
    return Object.entries(usage).sort((a, b) => b[1] - a[1]);
}

export function computeSkillsRadarData() {
    const categoryUsage = {};
    data.members.forEach(member => {
        Object.entries(member.cvDetails).forEach(([category, techArray]) => {
            categoryUsage[category] = (categoryUsage[category] || 0) + techArray.length;
        });
    });
    const entries = Object.entries(categoryUsage).sort((a, b) => b[1] - a[1]);
    const labels = entries.map(entry => entry[0]);
    const values = entries.map(entry => entry[1]);
    const maxValue = Math.max(...values, 1);
    return {labels, values, maxValue};
}

export function getTopTechnologyFromCVs() {
    const techCount = {};
    data.members.forEach(member => {
        const techs = extractTechnologiesFromMember(member);
        techs.forEach(tech => {
            techCount[tech] = (techCount[tech] || 0) + 1;
        });
    });
    const sorted = Object.entries(techCount).sort((a, b) => b[1] - a[1]);
    return sorted.length ? sorted[0] : null;
}

export function getAverageTechnologiesPerMember() {
    const total = data.members.reduce((sum, member) => {
        return sum + extractTechnologiesFromMember(member).length;
    }, 0);
    return data.members.length ? (total / data.members.length) : 0;
}