import {data, chartState} from './data.js';
import {getFilteredProjects, yearToIslamic, normalizeYear, toEasternNumber} from './utils.js';
import {renderStatisticsKpis, renderStatisticsTable} from './ui.js';
import {drawProjectsYearChart, drawProjectsTrendChart, drawTechnologyChart, drawCategoryChart, drawSkillsRadarChart} from './charts.js';

export function populateYearFilter() {
    const select = document.getElementById("yearFilter");
    if (!select) return;
    const years = [...new Set(data.projects.map(project => yearToIslamic(parseInt(normalizeYear(project.year)))))].sort((a, b) => a - b);
    select.innerHTML = `
        <option value="all">كل السنوات</option>
        ${years.map(year => `<option value="${year}">${toEasternNumber(year)}</option>`).join("")}
    `;
    select.value = chartState.selectedYear;
}

export function renderStatistics(callback) {
    const projects = getFilteredProjects();
    renderStatisticsKpis(projects);
    renderStatisticsTable(projects);
    drawProjectsYearChart();
    drawProjectsTrendChart();
    drawTechnologyChart();
    drawCategoryChart();
    drawSkillsRadarChart();
    if (callback) callback();
}