// Token Dashboard Logic

import { api, auth } from './api.js';

let currentProjectId = null;
let tokenData = null;
let agentChart = null;
let modelChart = null;
let dateChart = null;

document.addEventListener('DOMContentLoaded', async () => {
    // OpenRetro doesn't require authentication for Token Dashboard
    // Display default user info
    const userDisplay = document.getElementById('user-display');
    if (userDisplay) {
        userDisplay.textContent = 'Token Usage Dashboard';
    }
    
    // Load projects
    await loadProjects();
    
    // Setup event listeners
    setupEventListeners();
});

async function loadProjects() {
    try {
        const projects = await api.getProjectsWithTokenUsage();
        const select = document.getElementById('project-select');
        
        // Clear existing options
        select.innerHTML = '<option value="">-- Select Project --</option>';
        
        // Add project options
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project;
            option.textContent = project;
            select.appendChild(option);
        });
        
        // Load first project by default
        if (projects.length > 0) {
            select.value = projects[0];
            await loadTokenDashboard(projects[0]);
        }
        
        hideLoading();
        
    } catch (error) {
        console.error('Error loading projects:', error);
        hideLoading();
        alert('Failed to load projects. Please try again.');
    }
}

async function loadTokenDashboard(projectId) {
    showLoading();
    currentProjectId = projectId;
    
    try {
        tokenData = await api.getTokensByProject(projectId);
        updateSummary();
        updateCharts();
        updateTables('agents');
        
    } catch (error) {
        console.error('Error loading token data:', error);
        hideLoading();
        alert('Failed to load token data. Please try again.');
    }
}

function updateSummary() {
    if (!tokenData) return;
    
    const summary = tokenData.summary;
    
    // Update summary cards
    animateNumber('total-tokens', summary.total_tokens);
    document.getElementById('total-cost').textContent = `$${summary.total_cost.toFixed(2)}`;
    document.getElementById('agent-count').textContent = summary.agent_count;
}

function updateCharts() {
    if (!tokenData) return;
    
    // Destroy existing charts
    if (agentChart) agentChart.destroy();
    if (modelChart) modelChart.destroy();
    if (dateChart) dateChart.destroy();
    
    // Create Agent Chart
    createAgentChart();
    
    // Create Model Chart
    createModelChart();
    
    // Create Date Chart
    createDateChart();
}

function createAgentChart() {
    const ctx = document.getElementById('agent-chart').getContext('2d');
    
    const data = {
        labels: tokenData.by_agent.map(a => a.agent),
        datasets: [{
            label: 'Tokens Used',
            data: tokenData.by_agent.map(a => a.total_tokens),
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(139, 92, 246, 0.8)',
                'rgba(236, 72, 153, 0.8)'
            ],
            borderColor: [
                'rgb(59, 130, 246)',
                'rgb(16, 185, 129)',
                'rgb(245, 158, 11)',
                'rgb(139, 92, 246)',
                'rgb(236, 72, 153)'
            ],
            borderWidth: 2
        }]
    };
    
    agentChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000000) {
                                return (value / 1000) + 'K';
                            }
                            return value;
                        }
                    }
                }
            }
        }
    });
}

function createModelChart() {
    const ctx = document.getElementById('model-chart').getContext('2d');
    
    const data = {
        labels: tokenData.by_model.map(m => m.model),
        datasets: [{
            label: 'Tokens Used',
            data: tokenData.by_model.map(m => m.total_tokens),
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 2
        }]
    };
    
    modelChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        }
    });
}

function createDateChart() {
    const ctx = document.getElementById('date-chart').getContext('2d');
    
    const sortedDates = [...tokenData.by_date].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const data = {
        labels: sortedDates.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        datasets: [{
            label: 'Daily Token Usage',
            data: sortedDates.map(d => d.tokens),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
        }]
    };
    
    dateChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateTables(tab = 'agents') {
    const container = document.getElementById('table-container');
    
    if (tab === 'agents') {
        renderAgentTable(container);
    } else if (tab === 'models') {
        renderModelTable(container);
    } else if (tab === 'dates') {
        renderDateTable(container);
    }
}

function renderAgentTable(container) {
    const tableHtml = `
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-gray-200">
                        <th class="text-left p-3 font-semibold">Agent</th>
                        <th class="text-right p-3 font-semibold">Tokens</th>
                        <th class="text-right p-3 font-semibold">Cost</th>
                        <th class="text-right p-3 font-semibold">Models</th>
                    </tr>
                </thead>
                <tbody>
                    ${tokenData.by_agent.map(agent => `
                        <tr class="border-b border-gray-100">
                            <td class="p-3 font-medium">${escapeHtml(agent.agent)}</td>
                            <td class="p-3 text-right font-mono text-blue-600">${formatNumber(agent.total_tokens)}</td>
                            <td class="p-3 text-right font-mono text-green-600">$${agent.total_cost.toFixed(2)}</td>
                            <td class="p-3 text-xs text-gray-600">${agent.model_count} models</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = tableHtml;
}

function renderModelTable(container) {
    const tableHtml = `
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-gray-200">
                        <th class="text-left p-3 font-semibold">Model</th>
                        <th class="text-right p-3 font-semibold">Tokens</th>
                        <th class="text-right p-3 font-semibold">Cost</th>
                    </tr>
                </thead>
                <tbody>
                    ${tokenData.by_model.map(model => `
                        <tr class="border-b border-gray-100">
                            <td class="p-3 font-medium">${escapeHtml(model.model)}</td>
                            <td class="p-3 text-right font-mono text-blue-600">${formatNumber(model.total_tokens)}</td>
                            <td class="p-3 text-right font-mono text-green-600">$${model.total_cost.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = tableHtml;
}

function renderDateTable(container) {
    const sortedDates = [...tokenData.by_date].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const tableHtml = `
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-gray-200">
                        <th class="text-left p-3 font-semibold">Date</th>
                        <th class="text-right p-3 font-semibold">Tokens</th>
                        <th class="text-right p-3 font-semibold">Cost</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedDates.map(d => `
                        <tr class="border-b border-gray-100">
                            <td class="p-3 font-medium">${formatDate(d.date)}</td>
                            <td class="p-3 text-right font-mono text-blue-600">${formatNumber(d.tokens)}</td>
                            <td class="p-3 text-right font-mono text-green-600">$${d.cost.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = tableHtml;
}

function setupEventListeners() {
    // Project selection
    document.getElementById('project-select').addEventListener('change', async (e) => {
        const projectId = e.target.value;
        if (projectId) {
            await loadTokenDashboard(projectId);
        }
    });
    
    // Refresh projects
    document.getElementById('refresh-projects-btn').addEventListener('click', async () => {
        await loadProjects();
    });
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateTables(btn.dataset.tab);
        });
    });
}

// Utility functions
function showLoading() {
    document.getElementById('loading-overlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function animateNumber(elementId, target) {
    const element = document.getElementById(elementId);
    const duration = 1000;
    const steps = 20;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        element.textContent = formatNumber(Math.floor(current));
        
        if (current >= target) {
            clearInterval(timer);
            element.textContent = formatNumber(target);
        }
    }, duration / steps);
}
