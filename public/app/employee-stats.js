import ApexCharts from './apexcharts.esm.js';
import {
  getEmployeeIdsByPeopleFilter,
  getCompanyIdsByCompanyFilter,
  getNormalizedFiltersFromQuery,
  getFilterFromURLPart,
  getCompanyData,
  getPersonData,
  getBatches,
  sleep
} from './utils.js';
import { convertStringToFieldParams } from 'https://saasufy.com/node_modules/saasufy-components/utils.js';

const MAX_COMPANY_PAGES = 100;
const MAX_COMPANIES_PER_PAGE = 20;
const RENDER_ROUND_DELAY = 100;
const SHOW_NO_DATA_THRESHOLD = 10;

function getSeniorityPoints(title) {
  if (title.startsWith('Executive')) {
    return 6;
  }
  if (title.startsWith('Director')) {
    return 5;
  }
  if (title.startsWith('Founder')) {
    return 4;
  }
  if (title.startsWith('Senior')) {
    return 3;
  }
  if (title.startsWith('Junior')) {
    return 1;
  }
  if (title === 'Other') {
    return 0;
  }
  return 2;
}

function compareSeniorityEntries([seniorityA], [seniorityB]) {
  let pointsA = getSeniorityPoints(seniorityA);
  let pointsB = getSeniorityPoints(seniorityB);
  if (pointsA > pointsB) {
    return -1;
  }
  if (pointsA < pointsB) {
    return 1;
  }
  // Alphabetical comparison as fallback.
  if (seniorityA > seniorityB) {
    return 1;
  }
  if (seniorityA < seniorityB) {
    return -1;
  }
  return 0;
}

function getEducationPoints(educationTitle) {
  if (educationTitle.startsWith('PhD')) {
    return 3;
  }
  if (educationTitle.startsWith('Master')) {
    return 2;
  }
  if (educationTitle.startsWith('Bachelor')) {
    return 1;
  }
  return 0;
}

function compareEducationEntries([educationA], [educationB]) {
  let pointsA = getEducationPoints(educationA);
  let pointsB = getEducationPoints(educationB);
  if (pointsA > pointsB) {
    return -1;
  }
  if (pointsA < pointsB) {
    return 1;
  }
  // Alphabetical comparison as fallback.
  if (educationA > educationB) {
    return 1;
  }
  if (educationA < educationB) {
    return -1;
  }
  return 0;
}

class EmployeeStats extends HTMLElement {
  constructor() {
    super();
    this.isReady = false;
    this.currentRender = 0;
    this.updateCount = 0;
    this.defaultChartTitle = '';
    this.hasFocus = false;
    this.resumeLoading = () => {};
  }

  static get observedAttributes() {
    return [
      'stats-type',
      'chart-type',
      'company-filters',
      'people-filters',
      'include-companies',
      'exclude-companies'
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.isReady) return;
    this.render();
  }

  connectedCallback() {
    this.isReady = true;
    this.render();
  }
  
  disconnectedCallback() {
    this.isReady = false;
    this.statsChart && this.statsChart.destroy();
    this.statsChart = null;
  }

  async updateEmployeeStatCounts(companyIds, peopleFilters, fieldName, statCounts) {
    if (!statCounts) statCounts = {};
    let rawPeopleFilters = getNormalizedFiltersFromQuery(peopleFilters);
    let employeeIds = await getEmployeeIdsByPeopleFilter(companyIds, rawPeopleFilters);
    let stats = await Promise.all(
      employeeIds.map(async (employeeId) => {
        return getPersonData(employeeId, fieldName);
      })
    );
    for (let statValue of stats) {
      if (!statValue) continue;
      let statValues = statValue.split(',').map(part => part.trim());
      for (let value of statValues) {
        if (!statCounts[value]) {
          statCounts[value] = 0;
        }
        statCounts[value]++;
      }
    }
    return statCounts;
  }

  async updateCompanyStatCounts(companyIds, fieldName, statCounts) {
    if (!statCounts) statCounts = {};
    let stats = await Promise.all(
      companyIds.map(async (companyId) => {
        return getCompanyData(companyId, fieldName);
      })
    );
    for (let statValue of stats) {
      if (!statValue) continue;
      let statValues = statValue.split(',').map(part => part.trim());
      for (let value of statValues) {
        let statsParts = value.split('=');
        let statName = statsParts[0].trim();
        let cleanStatValue = parseInt(statsParts[1] || '0') || 1;
        if (!statCounts[statName]) {
          statCounts[statName] = 0;
        }
        statCounts[statName] += cleanStatValue;
      }
    }
    return statCounts;
  }

  async renderChart() {
    this.updateCount = 0;
    let currentRender = ++this.currentRender;
    let companyFilters = this.getAttribute('company-filters');
    let peopleFilters = this.getAttribute('people-filters');
    let disableCompanyCache = this.hasAttribute('disable-company-cache') && this.getAttribute('disable-company-cache') !== 'false';
    let chartType = this.getAttribute('chart-type') || 'bar';
    let statsType = this.getAttribute('stats-type') || 'seniority';
    let includeCompanies = (this.getAttribute('include-companies') || '').split('+').filter(companyId => companyId);
    let excludeCompaniesSet = new Set((this.getAttribute('exclude-companies') || '').split('+').filter(companyId => companyId));
    let filterCompanyIds = getFilterFromURLPart(companyFilters, 'id', 'contains')
      .split('|')
      .filter(companyId => companyId);

    let hasOnlyExplicitCompanies = includeCompanies.length && !filterCompanyIds.length;
    
    includeCompanies = ([ ...new Set([ ...includeCompanies, ...filterCompanyIds ]) ])
      .filter(companyId => !excludeCompaniesSet.has(companyId));

    let chartOptions = {
      series: chartType === 'bar' ?
        [{ name: 'Matches', data: [] }] : [],
      title: {
        align: 'center',
        style: {
          fontSize: '16px',
          fontWeight: 'bold'
        }
      },
      chart: {
        type: chartType,
        height: '100%',
        events: {
          dataPointSelection: (event, chartContext, config) => {
            this.hasFocus = false;
            let dataPointIndex = config?.dataPointIndex ?? '';
            let value = config?.w?.config?.xaxis?.categories?.[dataPointIndex] ?? '';
            this.dispatchEvent(
              new CustomEvent('employee-stats-selected', {
                detail: { type: statsType, value },
                bubbles: true
              })
            );
          },
          click: () => {
            if (this.hasFocus) {
              this.hasFocus = false;
              this.resumeLoading();
            } else {
              this.hasFocus = true;
            }
          }
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          borderRadiusApplication: 'end',
          horizontal: true,
        }
      },
      labels: [],
      dataLabels: {
        enabled: false
      },
      grid: {
        padding: {
          bottom: 50
        }
      },
      xaxis: {
        categories: [],
        labels: {
          rotate: -45,
          trim: false,
          rotateAlways: true,
          showDuplicates: false
        }
      },
      legend: {
        position: 'bottom'
      },
      noData: {
        text: '',
        align: 'center',
        verticalAlign: 'middle',
        offsetX: 0,
        offsetY: 0,
        style: {
          color: '#000000',
          fontSize: '16px',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }
      }
    };

    this.defaultChartTitle = `${statsType.replace(/^./, char => char.toUpperCase())} Distribution`;

    let statsChartOptions = { ...chartOptions, title: { ...chartOptions.title } };
    statsChartOptions.title.text = `${this.defaultChartTitle} (searching...)`;

    this.statsChart && this.statsChart.destroy();
    this.statsChart = new ApexCharts(this.querySelector('.stats-chart'), statsChartOptions);
    this.statsChart.render();

    let employeeStatsMap = {
      'seniority': 'employeeSeniorities',
      'education': 'employeeEducations'
    };

    let processedCompanyIds = new Set();
    let statsCounts = {};
    let traversedFullSet = false;
    try {
      for (let i = 0; i < MAX_COMPANY_PAGES; i++) {
        if (hasOnlyExplicitCompanies) break;
        if (currentRender !== this.currentRender) break;
        let companyIds = await getCompanyIdsByCompanyFilter(
          companyFilters,
          i,
          1,
          MAX_COMPANIES_PER_PAGE
        );

        if (!companyIds.length) {
          traversedFullSet = true;
          break;
        }

        for (let companyId of companyIds) {
          processedCompanyIds.add(companyId);
        }

        if (currentRender !== this.currentRender) break;
        if (!this.statsChart) break;

        companyIds = companyIds.filter(companyId => !excludeCompaniesSet.has(companyId));

        if (peopleFilters || disableCompanyCache) {
          await this.updateEmployeeStatCounts(companyIds, peopleFilters, statsType, statsCounts);
        } else {
          await this.updateCompanyStatCounts(companyIds, employeeStatsMap[statsType], statsCounts);
        }

        if (currentRender !== this.currentRender) break;
        if (!this.statsChart) break;
        if (this.hasFocus) await this.pauseLoadingChart();

        let chartState = i < MAX_COMPANY_PAGES - 1 ? 'searching...' : 'partial sample';
        this.updateChart(this.statsChart, statsCounts, chartState);
        if (companyIds.length) {
          await sleep(RENDER_ROUND_DELAY);
        }

        if (currentRender !== this.currentRender) break;
        if (!this.statsChart) break;
        if (this.hasFocus) await this.pauseLoadingChart();
      }

      if (!processedCompanyIds.size) {
        traversedFullSet = true;
      }

      if (currentRender !== this.currentRender) return;
      if (!this.statsChart) return;
      if (this.hasFocus) await this.pauseLoadingChart();

      let unprocessedCompanies = includeCompanies.filter((companyId) => !processedCompanyIds.has(companyId));
      let idBatches = getBatches(unprocessedCompanies, MAX_COMPANIES_PER_PAGE);

      for (let companyIds of idBatches) {
        if (peopleFilters || disableCompanyCache) {
          await this.updateEmployeeStatCounts(companyIds, peopleFilters, statsType, statsCounts);
        } else {
          await this.updateCompanyStatCounts(companyIds, employeeStatsMap[statsType], statsCounts);
        }

        if (currentRender !== this.currentRender) break;
        if (!this.statsChart) break;
        if (this.hasFocus) await this.pauseLoadingChart();

        this.updateChart(this.statsChart, statsCounts, 'searching...');
        await sleep(RENDER_ROUND_DELAY);

        if (currentRender !== this.currentRender) break;
        if (!this.statsChart) break;
        if (this.hasFocus) await this.pauseLoadingChart();
      }

      if (currentRender !== this.currentRender) return;
      if (!this.statsChart) return;
      if (this.hasFocus) await this.pauseLoadingChart();
      
      this.updateChart(this.statsChart, statsCounts, traversedFullSet ? null : 'partial sample');
    } catch (error) {
      console.error(`Failed to fetch company stats: ${error.message}`);
    }
  }

  async pauseLoadingChart() {
    if (this.statsChart) {
      let chartTitle = this.statsChart.options.title?.text || this.defaultChartTitle;
      this.statsChart.updateOptions({
        title: {
          text: `${chartTitle} (paused by click)`
        }
      });
      return new Promise((resolve) => {
        this.resumeLoading = resolve;
      });
    }
  }



  getColorForLabel(label) {
    let hash = 0;
    for (let i = 0; i < label.length; i++) {
      hash = ((hash << 5) - hash) + label.charCodeAt(i);
      hash = hash & hash;
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 80%, 50%`;
  }

  updateChart(chart, statsCounts, state) {
    if (!chart) return;
    this.updateCount++;
    let chartType = this.getAttribute('chart-type') || 'bar';
    let statsType = this.getAttribute('stats-type') || 'seniority';

    let statsEntries = Object.entries(statsCounts);
    if (statsType === 'seniority') {
      statsEntries.sort(compareSeniorityEntries);
    } else {
      statsEntries.sort(compareEducationEntries);
    }

    let keys = statsEntries.map(([key, value]) => key);
    let values = statsEntries.map(([key, value]) => value);

    let colorMapString = this.getAttribute('color-map');
    let { fieldValues: colorMap } = convertStringToFieldParams(colorMapString);

    let optionalConfigs = {};
    if (colorMapString != null) {
      optionalConfigs.colors = keys.map(key => colorMap[key] ?? this.getColorForLabel(key));
    }

    let chartTitle = chart.options.title?.text || this.defaultChartTitle;
    chart.updateOptions({
      title: {
        text: state ? `${chartTitle} (${state})` : chartTitle
      },
      series: chartType === 'bar' ?
        [{ data: values }] : values,
      labels: keys,
      xaxis: {
        categories: keys
      },
      noData: {
        text: (!state || state === 'partial sample' || this.updateCount >= SHOW_NO_DATA_THRESHOLD) ? 'No data available' : ''
      },
      ...optionalConfigs
    });
  }

  render() {
    this.innerHTML = `<div class="stats-chart"></div>`;
    this.renderChart();
  }
}

window.customElements.define('employee-stats', EmployeeStats);