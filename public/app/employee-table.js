import {
  getCompanyIdsByCompanyFilter,
  getNormalizedFiltersFromQuery,
  getIndexedFiltersFromCompanyQueryObject
} from './utils.js';

const MAX_COMPANY_PAGES = 100;
const MAX_COMPANIES_PER_PAGE = 20;

class EmployeeTable extends HTMLElement {
  constructor() {
    super();
    this.isReady = false;
    this.currentRender = 0;
    this.refreshScheduled = false;
  }

  static get observedAttributes() {
    return ['company-filters', 'people-filters', 'data-source', 'source-id'];
  }

  attributeChangedCallback() {
    if (!this.isReady) return;
    if (this.refreshScheduled) return;
    this.refreshScheduled = true;
    queueMicrotask(() => {
      this.refreshScheduled = false;
      this.refresh();
    });
  }

  connectedCallback() {
    this.isReady = true;
    this.refresh();
  }

  disconnectedCallback() {
    this.isReady = false;
    this.currentRender++;
  }

  async refresh() {
    let companyFilters = this.getAttribute('company-filters') || '';
    let peopleFilters = this.getAttribute('people-filters') || '';
    let dataSource = this.getAttribute('data-source') || '';
    let sourceId = this.getAttribute('source-id') || '';

    let viewer = this.querySelector('.employee-viewer');
    if (!viewer) return;

    let personQuery = getNormalizedFiltersFromQuery(peopleFilters);

    if (dataSource === 'custom' && !companyFilters) {
      viewer.setAttribute(
        'collection-view-params',
        `dataGroupId='${sourceId}',query='${personQuery}'`
      );
      viewer.setAttribute('collection-view', 'groupIdQueryView');
      return;
    }

    let nonTagFilters = getNormalizedFiltersFromQuery(companyFilters);

    if (!nonTagFilters && dataSource !== 'custom') {
      let tags = (getIndexedFiltersFromCompanyQueryObject(
        encodeURIComponent(companyFilters)
      ).tags || '').replace(/[.]count-[0-9]+$/, '');
      viewer.setAttribute(
        'collection-view-params',
        `dataGroupId='',tags='${tags}',query='${personQuery}'`
      );
      viewer.setAttribute('collection-view', 'tagSearchView');
      return;
    }

    let currentRender = ++this.currentRender;
    let allIds = [];

    for (let i = 0; i < MAX_COMPANY_PAGES; i++) {
      let companyIds = await getCompanyIdsByCompanyFilter(
        companyFilters,
        i,
        1,
        MAX_COMPANIES_PER_PAGE
      );
      if (!companyIds.length) break;
      allIds.push(...companyIds);
      if (currentRender !== this.currentRender) return;
    }

    viewer = this.querySelector('.employee-viewer');
    if (!viewer || currentRender !== this.currentRender) return;

    let companyIdsValue = allIds.length ?
      allIds.join(', ') : '00000000-0000-4000-8000-000000000000';
    viewer.setAttribute(
      'collection-view-params',
      `currentCompanyId='${companyIdsValue}',query='${personQuery}'`
    );
    viewer.setAttribute('collection-view', 'companySearchView');
  }
}

customElements.define('employee-table', EmployeeTable);
