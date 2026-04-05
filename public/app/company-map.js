import './geo-map.js';
import {
  getNormalizedFiltersFromQuery,
  getEmployeeIdsByPeopleFilter,
  getCompanyIdsByCompanyFilter,
  getCompanyData,
  getPersonData,
  getBatches,
  sleep
} from './utils.js';

// TODO: Allow customizing
const MAX_COMPANY_PAGES = 50;
const MAX_COMPANIES_PER_PAGE = 25;
const RENDER_ROUND_DELAY = 200;

class CompanyMap extends HTMLElement {
  constructor() {
    super();
    this.isReady = false;
    this.currentRender = 0;
  }

  static get observedAttributes() {
    return [
      'company-filters',
      'people-filters',
      'include-companies',
      'exclude-companies',
      'default-longitude',
      'default-latitude'
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
    this.currentRender++;
  }

  async updateEmployeeCityCounts(companyIds, peopleFilters, citiesCounts) {
    let rawPeopleFilters = getNormalizedFiltersFromQuery(peopleFilters);
    let employeeIds = await getEmployeeIdsByPeopleFilter(companyIds, rawPeopleFilters);
    let stats = await Promise.all(
      employeeIds.map(async (employeeId) => {
        let [ location, city ] = await Promise.all([
          getPersonData(employeeId, 'location'),
          getPersonData(employeeId, 'city')
        ]);
        let locationParts = (location || '').split(',').map(part => part.trim());
        let country = locationParts[locationParts.length - 1];
        if (country && city) {
          return `${country}.${city}`;
        }
        return locationParts[0];
      })
    );
    for (let statValue of stats) {
      if (!statValue) continue;
      if (!citiesCounts[statValue]) {
        citiesCounts[statValue] = 0;
      }
      citiesCounts[statValue]++;
    }
    return citiesCounts;
  }

  async updateCompanyCityCounts(companyIds, citiesCounts) {
    let cities = await this.getCompanyEmployeeCities(companyIds);
    for (let city of cities) {
      if (!city) continue;
      let locations = city.split(',').map(part => part.trim());
      for (let location of locations) {
        let locationParts = location.split('=');
        let locationName = locationParts[0].trim();
        let locationValue = parseInt(locationParts[1] || '0') || 1;
        if (!citiesCounts[locationName]) {
          citiesCounts[locationName] = 0;
        }
        citiesCounts[locationName] += locationValue;
      }
    }
  }

  async getCompanyEmployeeCities(companyIds) {
    return Promise.all(
      companyIds.map(async (companyId) => {
        return getCompanyData(companyId, 'employeeLocations');
      })
    );
  }

  async renderData() {
    let currentRender = ++this.currentRender;
    let companyFilters = this.getAttribute('company-filters');
    let disableCompanyCache = this.hasAttribute('disable-company-cache') && this.getAttribute('disable-company-cache') !== 'false';
    let peopleFilters = this.getAttribute('people-filters');
    let includeCompanies = (this.getAttribute('include-companies') || '').split('+').filter(companyId => companyId);
    let excludeCompaniesSet = new Set((this.getAttribute('exclude-companies') || '').split('+').filter(companyId => companyId));
    let filterCompanyIds = getFilterFromURLPart(companyFilters, 'id', 'contains')
      .split('|')
      .filter(companyId => companyId);

    let hasOnlyExplicitCompanies = includeCompanies.length && !filterCompanyIds.length;

    includeCompanies = ([ ...new Set([ ...includeCompanies, ...filterCompanyIds ]) ])
      .filter(companyId => !excludeCompaniesSet.has(companyId));
    
    let processedCompanyIds = new Set();
    let citiesCounts = {};
    let isFullSample = false;
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

        for (let companyId of companyIds) {
          processedCompanyIds.add(companyId);
        }

        if (currentRender !== this.currentRender) break;
        if (!this.isReady) break;

        if (!companyIds.length) {
          isFullSample = true;
          this.updateMap(citiesCounts, false);
          break;
        }

        companyIds = companyIds.filter(companyId => !excludeCompaniesSet.has(companyId));
  
        if (peopleFilters || disableCompanyCache) {
          await this.updateEmployeeCityCounts(companyIds, peopleFilters, citiesCounts);
        } else {
          await this.updateCompanyCityCounts(companyIds, citiesCounts);
        }

        if (currentRender !== this.currentRender) break;
        if (!this.isReady) break;
        
        this.updateMap(citiesCounts, false);
        if (companyIds.length) {
          await sleep(RENDER_ROUND_DELAY);
        }

        if (currentRender !== this.currentRender) break;
        if (!this.isReady) break;
      }

      if (currentRender !== this.currentRender) return;
      if (!this.isReady) return;

      let unprocessedCompanies = includeCompanies.filter((companyId) => !processedCompanyIds.has(companyId));
      let idBatches = getBatches(unprocessedCompanies, MAX_COMPANIES_PER_PAGE);

      if (!idBatches.length) {
        this.updateMap(citiesCounts, isFullSample);
      }

      for (let companyIds of idBatches) {
        if (currentRender !== this.currentRender) break;
        
        if (peopleFilters || disableCompanyCache) {
          await this.updateEmployeeCityCounts(companyIds, peopleFilters, citiesCounts);
        } else {
          await this.updateCompanyCityCounts(companyIds, citiesCounts);
        }
        
        if (currentRender !== this.currentRender) break;
        if (!this.isReady) break;
        
        this.updateMap(citiesCounts, false);

        await sleep(RENDER_ROUND_DELAY);

        if (currentRender !== this.currentRender) break;
        if (!this.isReady) break;
      }

      this.updateMap(citiesCounts, isFullSample);
    } catch (error) {
      console.error(`Failed to fetch company locations: ${error.message}`);
    }
  }

  updateMap(citiesCounts, isFullSample) {
    let cityEntries = Object.entries(citiesCounts);

    let spinner = this.querySelector('.loading-spinner-container');
    spinner.style.display = 'none';

    let geoMap = this.querySelector('.main-app-map');
    geoMap.style.display = 'block';
    
    geoMap.setAttribute(
      'city-scores',
      cityEntries.map(
        ([ city, score ]) => `${city}=${score}`
      ).join(', ')
    );
    
    geoMap.setAttribute('data-label', isFullSample ? 'Matches' : 'Matches (partial)');
  }

  render() {
    let defaultLatitude = this.getAttribute('default-latitude') || '134';
    let defaultLongitude = this.getAttribute('default-longitude') || '-27';
    this.innerHTML = `
      <div class="loading-spinner-container">
        <div class="spinning">&#8635;</div>
      </div>
      <geo-map style="display: none" class="main-app-map" default-latitude="${defaultLatitude}" default-longitude="${defaultLongitude}"></geo-map>
    `;
    this.renderData();
  }
}

window.customElements.define('company-map', CompanyMap);