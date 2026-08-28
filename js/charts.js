import {getFilteredProjects, getTechnologyUsage, getCategoryUsage, computeSkillsRadarData, toEasternNumber, getCSSVariable, getProjectsByYear} from './utils.js';

export function prepareCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(rect.width, 280);
    const height = Math.max(rect.height, 220);
    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    return {ctx: context, width, height};
}

export function getChartColors() {
    return {
        accent: getCSSVariable("--accent"),
        light: getCSSVariable("--accent-light"),
        dim: getCSSVariable("--accent-dim"),
        border: getCSSVariable("--border"),
        text: getCSSVariable("--text"),
        muted: getCSSVariable("--text-muted"),
        bg: getCSSVariable("--bg2"),
        bg3: getCSSVariable("--bg3")
    };
}

export function drawGrid(ctx, width, height, padding, steps, maxValue) {
    const colors = getChartColors();
    ctx.font = "11px RooyinFree";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let i = 0; i <= steps; i++) {
        const ratio = i / steps;
        const y = height - padding.bottom - ratio * (height - padding.top - padding.bottom);
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
        const value = Math.round(maxValue * ratio);
        ctx.fillStyle = colors.muted;
        ctx.fillText(toEasternNumber(value), padding.left - 8, y);
    }
}

export function drawProjectsYearChart() {
    const canvas = document.getElementById("projectsYearChart");
    if (!canvas) return;
    const {ctx, width, height} = prepareCanvas(canvas);
    const colors = getChartColors();
    const projects = getFilteredProjects();
    const grouped = getProjectsByYear(projects);
    const years = Object.keys(grouped).sort((a, b) => a - b);
    if (!years.length) return;
    const padding = {top: 20, right: 30, bottom: 50, left: 50};
    const maxValue = Math.max(...Object.values(grouped), 1);
    ctx.clearRect(0, 0, width, height);
    drawGrid(ctx, width, height, padding, 4, maxValue);
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const slot = chartWidth / years.length;
    const barWidth = Math.min(70, slot * 0.55);
    years.forEach((year, index) => {
        const value = grouped[year];
        const barHeight = (value / maxValue) * chartHeight;
        const x = padding.left + slot * index + (slot - barWidth) / 2;
        const y = height - padding.bottom - barHeight;
        ctx.fillStyle = colors.accent;
        ctx.fillRect(x, y, barWidth, barHeight);
        ctx.fillStyle = colors.light;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.font = "bold 12px RooyinFree";
        ctx.fillText(toEasternNumber(value), x + barWidth / 2, y - 7);
        ctx.fillStyle = colors.muted;
        ctx.font = "11px RooyinFree";
        ctx.textBaseline = "top";
        ctx.fillText(toEasternNumber(year), x + barWidth / 2, height - padding.bottom + 12);
    });
}

export function drawProjectsTrendChart() {
    const canvas = document.getElementById("projectsTrendChart");
    if (!canvas) return;
    const {ctx, width, height} = prepareCanvas(canvas);
    const colors = getChartColors();
    const projects = getFilteredProjects();
    const grouped = getProjectsByYear(projects);
    const years = Object.keys(grouped).sort((a, b) => a - b);
    if (!years.length) return;
    const values = years.map(year => grouped[year]);
    const padding = {top: 25, right: 30, bottom: 50, left: 50};
    const maxValue = Math.max(...values, 1);
    ctx.clearRect(0, 0, width, height);
    drawGrid(ctx, width, height, padding, 4, maxValue);
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const points = years.map((_, index) => {
        const x = years.length === 1 ? padding.left + chartWidth / 2 : padding.left + (chartWidth / (years.length - 1)) * index;
        const y = height - padding.bottom - (values[index] / maxValue) * chartHeight;
        return {x, y};
    });
    ctx.beginPath();
    points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
    });
    ctx.strokeStyle = colors.light;
    ctx.lineWidth = 3;
    ctx.stroke();
    points.forEach((point, index) => {
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = colors.text;
        ctx.font = "bold 11px RooyinFree";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(toEasternNumber(values[index]), point.x, point.y - 10);
        ctx.fillStyle = colors.muted;
        ctx.font = "11px RooyinFree";
        ctx.textBaseline = "top";
        ctx.fillText(toEasternNumber(years[index]), point.x, height - padding.bottom + 12);
    });
}

export function drawTechnologyChart() {
    const canvas = document.getElementById("technologyChart");
    if (!canvas) return;
    const {ctx, width, height} = prepareCanvas(canvas);
    const colors = getChartColors();
    const usage = getTechnologyUsage(getFilteredProjects()).slice(0, 7);
    if (!usage.length) return;
    const padding = {top: 15, right: 105, bottom: 20, left: 40};
    const maxValue = Math.max(...usage.map(item => item[1]), 1);
    ctx.clearRect(0, 0, width, height);
    const rowHeight = (height - padding.top - padding.bottom) / usage.length;
    usage.forEach(([technology, value], index) => {
        const y = padding.top + index * rowHeight + rowHeight * 0.2;
        const barHeight = Math.min(25, rowHeight * 0.55);
        const maxBarWidth = width - padding.left - padding.right;
        const barWidth = (value / maxValue) * maxBarWidth;
        ctx.fillStyle = colors.border;
        ctx.fillRect(padding.left, y, maxBarWidth, barHeight);
        ctx.fillStyle = colors.accent;
        ctx.fillRect(padding.left, y, barWidth, barHeight);
        ctx.fillStyle = colors.text;
        ctx.font = "11px RooyinFree";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(technology, width - 12, y + barHeight / 2);
        ctx.fillStyle = colors.light;
        ctx.textAlign = "left";
        ctx.fillText(toEasternNumber(value), padding.left + barWidth + 8, y + barHeight / 2);
    });
}

export function drawCategoryChart() {
    const canvas = document.getElementById("categoryChart");
    if (!canvas) return;
    const {ctx, width, height} = prepareCanvas(canvas);
    const colors = getChartColors();
    const categories = getCategoryUsage(getFilteredProjects());
    if (!categories.length) return;
    const total = categories.reduce((sum, item) => sum + item[1], 0);
    const centerX = width * 0.42;
    const centerY = height / 2;
    const radius = Math.min(width * 0.25, height * 0.34);
    const innerRadius = radius * 0.58;
    const palette = [colors.accent, colors.light, colors.muted, colors.border, "rgba(255,255,255,0.16)"];
    let startAngle = -Math.PI / 2;
    ctx.clearRect(0, 0, width, height);
    categories.forEach(([category, value], index) => {
        const angle = (value / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
        ctx.closePath();
        ctx.fillStyle = palette[index % palette.length];
        ctx.fill();
        startAngle += angle;
    });
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = colors.bg;
    ctx.fill();
    ctx.fillStyle = colors.light;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 22px RooyinFree";
    ctx.fillText(toEasternNumber(total), centerX, centerY - 8);
    ctx.font = "10px RooyinFree";
    ctx.fillStyle = colors.muted;
    ctx.fillText("مشروع", centerX, centerY + 15);
    const legendX = width * 0.68;
    const legendStart = centerY - categories.length * 18;
    categories.forEach(([category, value], index) => {
        const y = legendStart + index * 36;
        ctx.fillStyle = palette[index % palette.length];
        ctx.fillRect(legendX, y, 10, 10);
        ctx.fillStyle = colors.text;
        ctx.font = "11px RooyinFree";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(category, legendX - 8, y + 5);
        ctx.fillStyle = colors.muted;
        ctx.textAlign = "left";
        ctx.fillText(toEasternNumber(value), legendX + 18, y + 5);
    });
}

export function drawSkillsRadarChart() {
    const canvas = document.getElementById("skillsRadarChart");
    if (!canvas) return;
    const {ctx, width, height} = prepareCanvas(canvas);
    const colors = getChartColors();
    const {labels, values, maxValue} = computeSkillsRadarData();
    if (!labels.length) return;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.31;
    const levels = 5;
    ctx.clearRect(0, 0, width, height);
    for (let level = 1; level <= levels; level++) {
        const currentRadius = radius * (level / levels);
        ctx.beginPath();
        for (let index = 0; index < labels.length; index++) {
            const angle = -Math.PI / 2 + index * (Math.PI * 2 / labels.length);
            const x = centerX + Math.cos(angle) * currentRadius;
            const y = centerY + Math.sin(angle) * currentRadius;
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    for (let index = 0; index < labels.length; index++) {
        const angle = -Math.PI / 2 + index * (Math.PI * 2 / labels.length);
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = colors.border;
        ctx.stroke();
        const labelRadius = radius + 28;
        const labelX = centerX + Math.cos(angle) * labelRadius;
        const labelY = centerY + Math.sin(angle) * labelRadius;
        ctx.fillStyle = colors.text;
        ctx.font = "11px RooyinFree";
        ctx.textAlign = labelX < centerX - 10 ? "right" : labelX > centerX + 10 ? "left" : "center";
        ctx.textBaseline = labelY < centerY ? "bottom" : labelY > centerY ? "top" : "middle";
        ctx.fillText(labels[index], labelX, labelY);
    }
    ctx.beginPath();
    values.forEach((value, index) => {
        const angle = -Math.PI / 2 + index * (Math.PI * 2 / labels.length);
        const currentRadius = radius * (value / maxValue);
        const x = centerX + Math.cos(angle) * currentRadius;
        const y = centerY + Math.sin(angle) * currentRadius;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = colors.dim;
    ctx.fill();
    ctx.strokeStyle = colors.light;
    ctx.lineWidth = 2;
    ctx.stroke();
    values.forEach((value, index) => {
        const angle = -Math.PI / 2 + index * (Math.PI * 2 / labels.length);
        const currentRadius = radius * (value / maxValue);
        const x = centerX + Math.cos(angle) * currentRadius;
        const y = centerY + Math.sin(angle) * currentRadius;
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
}