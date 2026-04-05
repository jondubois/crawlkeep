import {
  buildSVGOverlayOn,
  getLeafValue,
  updateCardContentTable,
} from "./utils/index.js";

import { AnimationManager } from "./classes/animation-manager.js";
import { ModalManager } from "./classes/modal-manager.js";

// Crawling Animation
const SAMPLE_LI_URLS = [
  "https://www.sentinelone.com/",
  "https://linkedin.com/company/crowdstrike",
  "https://www.paloaltonetworks.com/",
  "https://linkedin.com/company/akto",
  "https://www.bitdefender.com/en-au/",
];

const EMPLOYEE_MAP_IMAGE_ID = "source-employee-map-image";

// automated sequence of interactions with the web page
const companyModalConfig = {
  cards: [
    {
      company: {
        name: "CrowdStrike",
        company_page: "https://linkedin.com/company/crowdstrike",
        description:
          "A cybersecurity technology firm pioneering cloud-delivered next-generation endpoint protection and services.",
        country: "USA",
        specialities: "Cybersecurity, Cloud Security, Threat Intelligence",
        industries: "Technology, Cybersecurity",
        employee_count: "158",
        type: "Public company",
        actively_hiring: {
          href: "https://www.glassdoor.com.au/job-listing/sr-medical-editor-australia-home-base-syneos-clinical-and-corporate-prod-JV_IC2218494_KO0,37_KE38,72.htm?",
          source: "glassdoor",
        },
      },
      company_analytics: {
        project_budget: {
          data_science: 170,
          software_development: 85,
          gen_ai: 120,
          marketing: 10,
          operations: 5,
          other: 2,
        },
        yoy_revenue_growth_rate: "41%",
        yoy_headcount_growth_rate: "32%",
        funding_received: {
          seed: 5,
          Series_a: 18,
          series_b: 50,
          series_c: 118,
        },
        market_capitalization: "$12.5Bn",
      },
      sentiment_analysis: {
        team_culture:
          "Fast-paced, results-oriented culture with strong focus on threat hunting excellence",
        employee_reviews:
          "4.1/5.0 (Glassdoor) - High-energy environment with excellent learning opportunities",
        employee_well_being_score:
          "72/100 - Good benefits package with room for improvement in work-life balance",
        staff_turn_over:
          "15% annually - Slightly below industry average, higher in sales roles",
      },
      talent_insights: {
        level_of_seniority:
          "Expert level - 70% senior/principal engineers, 20% mid-level, 10% junior",
        tech_stack:
          "Go, Python, Rust, AWS, Azure, React, GraphQL, Kafka, Redis, Falcon platform",
        staff_turnover:
          "15% annual turnover with 60% moving to leadership roles in other companies",
        talent_pool_analysis:
          "Premium talent pool in threat intelligence, 35% referral hiring, strong security clearance pipeline",
        referral_program:
          "Competitive referral program with $7,500 bonus for senior roles, $3,000 for mid-level",
        community_engagement:
          "CrowdStrike University, SANS partnerships, DEF CON sponsorships, threat research publications",
      },
    },
    {
      company: {
        name: "SentinelOne",
        company_page: "https://linkedin.com/company/sentinel-one",
        description:
          "SentinelOne is a pioneer in developing anti-malware software. We specialise in autonomous AI-based endpoint protection that successfully prevents, detects, and responds to attacks across all major vectors.",
        country: "USA",
        specialities:
          "Cybersecurity, Blockchain Technology, Internet of Things (IoT)",
        industries: "Technology, Research & Development",
        employee_count: "217",
        type: "Privately held",
        actively_hiring: null,
      },
      company_analytics: {
        project_budget: {
          data_science: 45,
          software_development: 10,
          gen_ai: 9,
          marketing: 5,
          operations: 5,
          other: 1,
        },
        yoy_revenue_growth_rate: "35%",
        yoy_headcount_growth_rate: "28%",
        funding_received: {
          seed: 1,
          Series_a: 18,
          series_b: 5,
          series_c: 30,
          series_d: 45,
          series_e: 15,
          series_f: 26,
        },
        market_capitalization: "$3.2Bn",
      },
      sentiment_analysis: {
        team_culture:
          "Collaborative and innovation-driven environment with strong emphasis on autonomous decision-making",
        employee_reviews:
          "4.3/5.0 (Glassdoor) - Employees praise work-life balance and cutting-edge technology",
        employee_well_being_score:
          "78/100 - Above industry average with comprehensive health benefits",
        staff_turn_over: "12% annually - Below industry standard of 18%",
      },
      talent_insights: {
        level_of_seniority:
          "Senior level - 65% senior engineers, 25% mid-level, 10% junior",
        tech_stack:
          "Python, Go, C++, Kubernetes, AWS, React, PostgreSQL, Elasticsearch, Docker",
        staff_turnover:
          "12% annual turnover with 85% voluntary departures for career advancement",
        talent_pool_analysis:
          "Strong pipeline in cybersecurity and AI/ML domains, 40% referral hiring rate",
        referral_program:
          "Active employee referral program with $5,000 bonus for successful hires",
        community_engagement:
          "Regular tech meetups, open-source contributions, university partnerships",
      },
    },
  ],
  options: [
    { id: "company-info-list", pathSegments: ["company"] },
    { id: "company-analytics-list", pathSegments: ["company_analytics"] },
    { id: "sentiment-analysis-list", pathSegments: ["sentiment_analysis"] },
    { id: "talent-insights-list", pathSegments: ["talent_insights"] },

    {
      id: "project-budget-chart",
      pathSegments: ["company_analytics", "project_budget"],
      chartType: "pie",
    },
    {
      id: "growth-rate-chart",
      pathSegments: ["company_analytics"],
      chartType: "bar",
    },
    {
      id: "funding-received-chart",
      pathSegments: ["company_analytics", "funding_received"],
      chartType: "line",
    },
    {
      id: "employee-wellbeing-score-chart",
      pathSegments: ["sentiment_analysis", "employee_well_being_score"],
      chartType: "pie",
    },
    {
      id: "employee-reviews-stars",
      pathSegments: ["sentiment_analysis", "employee_reviews"],
      chartType: "stars",
    },
  ],
  templateId: "company-card",
  updateCardContent: updateCardContent,
  dataTableSelector: "#company-table",
  dataRowSelector: ".popup-company-card",
};
const employeeModalConfig = {
  cards: [
    {
      id: 0,
      profile_picture_file_path: "assets/images/generic-profile-icon-small.png",
      profile: {
        name: "Teo Tea",
        education: "PhD in Computer Science",
        location: "San Francisco, California, United States",
        score: "0.88",
        linkedin_url: "linkedin.com/in/teotea",
        contact_details: "Get email / phone",
      },
      career: {
        company: "SentinelOne",
        job_title: "Executive Manager - Data Science",
        reports_to: "Chief Technology Officer",
        works_in_consultation_with: "VP of Engineering, Product Strategy Team",
        responsibilities:
          "Oversee data science operations, strategic planning, team leadership, stakeholder communication.",
        duties_tasks:
          "Strategic planning, team management, budget allocation, performance reviews.",
        skills:
          "Leadership, Strategic Planning, Data Science, Team Management, Budget Planning, Stakeholder Communication",
      },
    },
    {
      id: 1,
      profile_picture_file_path: "assets/images/generic-profile-icon-small.png",
      profile: {
        name: "Thao Yuang",
        education: "Master's in Data Science",
        location: "Paris, France",
        score: "0.62",
        linkedin_url: "linkedin.com/in/thaoyuang",
        contact_details:
          "email:\nthao.yuang@sentinelone.com\nthao.yuang@gmail.com\nphone: 0412 345 678",
      },
      career: {
        company: "SentinelOne",
        job_title: "Senior Manager - Data Science",
        reports_to: "Executive Manager - Data Science",
        works_in_consultation_with:
          "Data Engineering Team, Product Managers, DevOps",
        responsibilities:
          "Manage data science projects, coordinate cross-functional teams, mentor senior data scientists.",
        duties_tasks:
          "Project management, team coordination, technical reviews, resource allocation.",
        skills:
          "Project Management, Data Science, Team Leadership, Cross-functional Collaboration, Technical Strategy",
      },
    },
    {
      id: 2,
      profile_picture_file_path:
        "assets/images/gemini-generated-profile-picture.png",
      profile: {
        name: "Amy Lee",
        education: "Bachelor's in Computer Science",
        location: "San Francisco, California, United States",
        score: "0.85",
        linkedin_url: "https://www.linkedin.com/in/amy-Lee-1234abcd/",
        contact_details: "email:\nphone: 0412 645 879",
      },
      career: {
        company: "SentinelOne",
        job_title: "Lead Data Scientist",
        reports_to: "Head of Data Science",
        works_in_consultation_with: "Data Engineers, Product Managers",
        responsibilities:
          "Lead data science projects, develop predictive models, mentor junior data scientists.",
        duties_tasks: "Data analysis, algorithm development, model validation.",
        skills:
          "Machine Learning, Data Analysis, Python, SQL, Big Data Technologies, Cloud Platforms",
      },
    },
    {
      id: 3,
      profile_picture_file_path: "assets/images/generic-profile-icon-small.png",
      profile: {
        name: "Jo Nathan",
        education: "Bachelor's in Data Engineering",
        location: "Sydney, New South Wales, Australia",
        score: "0.90",
        linkedin_url: "linkedin.com/in/jonathan",
        contact_details: "email:\njonathan@sentinelone.com\nphone: ",
      },
      career: {
        company: "SentinelOne",
        job_title: "Data Scientist",
        reports_to: "Lead Data Scientist",
        works_in_consultation_with: "Data Engineering Team, Security Analysts",
        responsibilities:
          "Develop machine learning models, analyze security data, support threat detection systems.",
        duties_tasks:
          "Model development, data preprocessing, feature engineering, performance monitoring.",
        skills:
          "Python, Machine Learning, Statistical Analysis, Data Visualization, Security Analytics, TensorFlow",
      },
    },
    {
      id: 4,
      profile_picture_file_path: "assets/images/generic-profile-icon-small.png",
      profile: {
        name: "Ke Vin",
        education: "Master's in Business Administration",
        location: "Canberra, Australian Capital Territory, Australia",
        score: "0.75",
        linkedin_url: "linkedin.com/in/kevin",
        contact_details: "email:\nkevin@sentinelone.com\nphone: 0412 987 123",
      },
      career: {
        company: "SentinelOne",
        job_title: "Junior Data Scientist",
        reports_to: "Data Scientist",
        works_in_consultation_with: "Senior Data Scientists, QA Team",
        responsibilities:
          "Support data analysis projects, assist in model development, conduct exploratory data analysis.",
        duties_tasks:
          "Data cleaning, basic modeling, report generation, testing support.",
        skills:
          "Python, R, Statistics, Data Visualization, SQL, Excel, Basic Machine Learning",
      },
    },
    {
      id: 5,
      profile_picture_file_path: "assets/images/generic-profile-icon-small.png",
      profile: {
        name: "Tarick tampion",
        education: "Bachelor's in Commerce",
        location: "Canberra, Australian Capital Territory, Australia",
        score: "0.86",
        linkedin_url: "linkedin.com/in/tarick-tampion",
        contact_details: "email:\ntar.tampion@sentinelone.com",
      },
      career: {
        company: "SentinelOne",
        job_title: "Talent Acquisition Partner - Data Science",
        reports_to: "Head of Talent Acquisition",
        works_in_consultation_with:
          "HR Business Partners, Hiring Managers, Data Science Team",
        responsibilities:
          "Source and recruit data science talent, manage recruitment pipeline, coordinate interviews.",
        duties_tasks:
          "Candidate sourcing, interview coordination, offer negotiations, onboarding support.",
        skills:
          "Recruiting, Talent Sourcing, Interview Management, Stakeholder Communication, ATS Systems, LinkedIn Recruiting",
      },
    },
    {
      id: 6,
      profile_picture_file_path: "assets/images/generic-profile-icon-small.png",
      profile: {
        name: "Surendran Varnijapur",
        education: "Bachelor's in Psychology",
        location: "San Francisco, California, United States",
        score: "0.72",
        linkedin_url: "linkedin.com/in/surendran-varnijapur",
        contact_details: "email:\nSurendran@sentinelone.com",
      },
      career: {
        company: "SentinelOne",
        job_title: "HR Business Partner",
        reports_to: "Head of Human Resources",
        works_in_consultation_with:
          "Department Managers, Talent Acquisition, Legal Team",
        responsibilities:
          "Support HR initiatives, manage employee relations, facilitate organizational development.",
        duties_tasks:
          "Employee counseling, policy implementation, performance management, conflict resolution.",
        skills:
          "HR Management, Employee Relations, Organizational Development, Conflict Resolution, Policy Development, HRIS Systems",
      },
    },
  ],
  options: [
    {
      id: "employee-profile-image",
      pathSegments: ["profile_picture_file_path"],
    },
    { id: "profile-info-list", pathSegments: ["profile"] },
    { id: "career-info-list", pathSegments: ["career"] },
  ],
  templateId: "employee-card",
  updateCardContent: updateCardContent,
  dataTableSelector: "#employee-table",
  dataRowSelector: ".popup-employee-card",
};
const employeeModal = new ModalManager(employeeModalConfig);
const companyModal = new ModalManager(companyModalConfig);
AnimationManager.actions = {
  closePopup: () => {
    employeeModal.closeModal();
  },
  popupCard: ({ parameter }) => {
    const { modalInstance, recordIndex } = parameter;
    modalInstance.showModal(recordIndex);
  },
};
const steps = [
  {
    actionName: "scrollElmInView",
    absTiming: 0,
    parameter: { alignToTop: true },
    log: "Scroll to top of the page at animation start",
  },
  {
    id: "company-prompt",
    actionName: "triggerClick",
    absTiming: 1000,
    classNames: [],
    log: "Type ideal company description",
  },
  {
    id: "job-prompt",
    actionName: "triggerClick",
    absTiming: 2000,
    classNames: [],
    log: "Type ideal job description",
  },
  {
    id: "crawl-btn",
    absTiming: 8000,
    classNames: ["green-bg-border"],
    duration: 1000,
    log: "Highlight crawl button",
  },
  {
    id: "crawl-message",
    actionName: "addClass",
    absTiming: 8000,
    parameter: { className: "show" },
    log: "Display crawling message",
  },
  {
    id: "crawl-message",
    actionName: "scrollElmInView",
    absTiming: 8500,
    parameter: {
      behavior: "smooth",
      block: "start",
    },
    log: "Scroll to top of the crawling message",
  },
  {
    id: "url-list",
    actionName: "populateUrlList",
    absTiming: 9000,
    classNames: [],
    parameter: {
      urls: SAMPLE_LI_URLS,
    },
    log: "Populate discovered URLs",
  },
  {
    id: "nl-interface-step",
    actionName: "displayElm",
    absTiming: 14000,
    classNames: [],
    parameter: { isDisplayed: false },
    log: "Remove natural language interface from DOM layout",
  },
  {
    id: "project-dashboard-step",
    actionName: "displayElm",
    absTiming: 14500,
    classNames: [],
    parameter: { isDisplayed: true },
    log: "Insert project dashboard into DOM layout",
  },
  {
    actionName: "scrollElmInView",
    absTiming: 14500,
    parameter: { alignToTop: true },
    log: "Scroll to top of the viewport",
  },
  {
    id: "company-card",
    actionName: "popupCard",
    absTiming: 16000,
    parameter: { recordIndex: 0, modalInstance: companyModal },
    log: "Show company modal for CrowdStrike",
  },
  {
    id: "talent-insights-list",
    actionName: "scrollElmInView",
    absTiming: 18000,
    parameter: {
      behavior: "smooth",
      block: "end",
    },
    log: "Scroll to the bottom of the company card",
  },
  {
    id: "company-card-instance",
    actionName: "closePopup",
    absTiming: 20000,
    classNames: [],
    log: "Close company card popup",
  },
  {
    id: "employee-table",
    absTiming: 21000,
    classNames: ["green-bg-border"],
    areaSelection: { rowIndices: [2, 3, 4, 5, 6], colIndices: [2] },
    log: "Highlight team",
  },
  {
    id: "employee-table",
    absTiming: 23000,
    classNames: ["green-bg-border"],
    areaSelection: { rowIndices: [4] },
    log: "Highlight Amy's row",
  },
  {
    id: "employee-card",
    actionName: "popupCard",
    absTiming: 25000,
    parameter: { recordIndex: 2, modalInstance: employeeModal },
    log: "Show Amy's card",
  },
  {
    id: "employee-card-instance",
    actionName: "closePopup",
    absTiming: 27000,
    classNames: [],
    log: "Close Amy's card popup",
  },
  {
    id: "natural-language-input-company",
    absTiming: 29000,
    classNames: ["green-bg-border"],
    log: "Highlight company prompt",
  },
  {
    id: "natural-language-input-company",
    actionName: "triggerClick",
    absTiming: 29000,
    classNames: [],
    log: "Type text in company prompt",
  },
  {
    id: "natural-language-input-employee",
    absTiming: 31000,
    classNames: ["green-bg-border"],
    log: "Highlight employee prompt",
  },
  {
    id: "natural-language-input-employee",
    actionName: "triggerClick",
    absTiming: 31000,
    classNames: [],
    log: "Type text in employee prompt",
  },
  {
    id: "add-sentinelone-to-selection",
    actionName: "triggerClick",
    absTiming: 33000,
    classNames: [],
    log: "Type text in employee prompt",
  },
  {
    id: "view-mode-company",
    absTiming: 35000,
    classNames: ["green-bg-border"],
    log: "Highlight company select",
  },
  {
    id: "company-table",
    absTiming: 37000,
    classNames: ["red-bg-border"],
    areaSelection: { rowIndices: [3], colIndices: [5] },
    log: "Highlight no matched job advertised",
  },
  {
    id: "senior-manager-contact-details",
    actionName: "triggerClick",
    absTiming: 39000,
    classNames: [],
    log: "Show Senior Manager contact details",
  },
  {
    id: "tap-contact-details",
    actionName: "triggerClick",
    absTiming: 41000,
    classNames: [],
    log: "Show Talent Acquisition Partner contact details",
  },
];
let animationManager = null;
document.addEventListener("DOMContentLoaded", () => {
  animationManager = new AnimationManager(steps);

  setTimeout(() => {
    animationManager.start();
  }, 1000);
  // Stop animation on any user interaction
  ["click", "keydown", "mousedown", "touchstart"].forEach((eventType) => {
    document.addEventListener(eventType, () => animationManager.stop(), {
      once: true,
    });
  });
});

/**
 * @description chart rendering
 * @param {HTMLCanvasElement} canvasElement - The canvas element to render the chart on
 * @param {Object} propsContainer - The specific chart data to render
 * @param {string} chartType - The type of chart to render ('pie', 'bar', 'line', 'stars')
 */
function updateCardContentChart(canvasElement, propsContainer, chartType) {
  const canvasId = canvasElement.id;

  // Destroy existing chart instance if it exists
  if (canvasElement.chart) {
    canvasElement.chart.destroy();
    canvasElement.chart = null;
  }

  let chart = null;

  switch (chartType) {
    case "pie":
      if (canvasId === "project-budget-chart") {
        const budgetData =
          ChartDataProcessor.processProjectBudget(propsContainer);
        chart = ChartRenderer.renderPieChart(
          canvasId,
          budgetData,
          "R&D Budget Allocation",
        );
      } else if (canvasId === "employee-wellbeing-score-chart") {
        const wellbeingData =
          ChartDataProcessor.processWellBeingScore(propsContainer);
        chart = ChartRenderer.renderPieChart(
          canvasId,
          wellbeingData,
          "Employee Well-being Score",
        );
      }
      break;

    case "bar":
      if (canvasId === "growth-rate-chart") {
        const growthData = ChartDataProcessor.processGrowthRates(
          propsContainer.yoy_revenue_growth_rate,
          propsContainer.yoy_headcount_growth_rate,
        );
        chart = ChartRenderer.renderBarChart(
          canvasId,
          growthData,
          "Year-over-Year Growth Rates",
          "Growth Percentage",
        );
      }
      break;

    case "line":
      if (canvasId === "funding-received-chart") {
        chart = ChartRenderer.renderTimeSeries(
          canvasId,
          propsContainer,
          "Funding History",
        );
      }
      break;

    default:
      console.warn(`Unknown chart type: ${chartType} for canvas: ${canvasId}`);
  }

  // Store the chart instance on the canvas element for future cleanup
  if (chart) {
    canvasElement.chart = chart;
  }
}

/**
 * @description Higher-order function
 * @param {Object} card - The object containing the data to display
 * @param {Object} options - An array of objects containing the pathSegments and IDs of the elements to update
 */
function updateCardContent(card, options) {
  options.forEach((opt) => {
    const { id, pathSegments, chartType } = opt;
    const target_elm = document.getElementById(id);
    if (!target_elm) return;

    const cardData = getLeafValue(card, pathSegments);

    switch (target_elm.tagName) {
      case "IMG":
        target_elm.src = cardData;
        break;
      case "TBODY":
        updateCardContentTable(target_elm, cardData);
        break;
      case "CANVAS":
        updateCardContentChart(target_elm, cardData, chartType);
        break;
      case "DIV":
        if (id === "employee-reviews-stars" && chartType === "stars") {
          const reviewData =
            ChartDataProcessor.processEmployeeReviews(cardData);
          ChartRenderer.renderStarRating(id, reviewData);
        }
        break;
      default:
        console.warn(
          `Unsupported element type: ${target_elm.tagName} for ${id}`,
        );
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const statusOptions = [
    { value: "blank", label: "" },
    { value: "selected", label: "selected" },
    { value: "reviewed", label: "reviewed" },
    { value: "rejected", label: "rejected" },
    { value: "contacted", label: "contacted" },
    { value: "not interested", label: "not interested" },
  ];

  const viewOptions = [
    {
      value: "",
      label: "Switch view",
      disabled: true,
      selected: true,
      hidden: true,
    },
    { value: "Table", label: "Table" },
    { value: "Seniority", label: "Seniority pyramid" },
    { value: "Education", label: "Education (pie chart)" },
    {
      value: "Map",
      label: "Location (plots on a map)",
    },
    {
      value: "Top 20 by size",
      label: "Top 20 by size (bar chart)",
    },
  ];

  // Populate all dropdowns
  document.querySelectorAll("select.status-select").forEach((select) => {
    const currentValue = select.value;
    select.innerHTML = "";
    statusOptions.forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt.value;
      option.textContent = opt.label;
      if (opt.value === currentValue) option.selected = true;
      select.appendChild(option);
    });
  });
  document.querySelectorAll("select.view-mode-select").forEach((select) => {
    select.innerHTML = "";
    viewOptions.forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt.value;
      option.textContent = opt.label;
      if (opt.disabled) option.disabled = true;
      if (opt.selected) option.selected = true;
      if (opt.hidden) option.hidden = true;
      select.appendChild(option);
    });
  });

  // Handle view mode switching for Companies table
  const companyViewSelect = document.querySelector("#view-mode-company");
  const employeeViewSelect = document.querySelector("#view-mode-employee");
  const companyTableContainer = document.querySelector("#company-container");
  const employeeTableContainer = document.querySelector("#employee-container");
  const companyTableHTML = companyTableContainer.innerHTML;
  const employeeTableHTML = employeeTableContainer.innerHTML;

  companyViewSelect.addEventListener("change", function () {
    if (this.value === "Map") {
      const IMG_SOURCE = "assets/images/map-office-locations.png";
      const container = document.getElementById("company-container");
      const wrapper = document.createElement("div");
      wrapper.className =
        "flex justify-center items-center bg-white rounded shadow min-h-[300px]";
      const img = document.createElement("img");
      img.src = IMG_SOURCE;
      img.alt = "Map";
      img.className = "max-w-full max-h-96 rounded";
      wrapper.appendChild(img);
      container.replaceChildren(wrapper);
    } else {
      companyTableContainer.innerHTML = companyTableHTML;
      // Repopulate status-selects after restoring table
      document.querySelectorAll("select.status-select").forEach((select) => {
        const currentValue = select.value;
        select.innerHTML = "";
        statusOptions.forEach((opt) => {
          const option = document.createElement("option");
          option.value = opt.value;
          option.textContent = opt.label;
          if (opt.value === currentValue) option.selected = true;
          select.appendChild(option);
        });
      });
    }
  });

  employeeViewSelect.addEventListener("change", function () {
    if (this.value === "Map") {
      const IMG_SOURCE = "assets/images/map-employee-locations.png";
      const container = document.getElementById("employee-container");
      const imagePositioner = document.createElement("div");
      imagePositioner.className = "map-positioner";

      const overlayImageWrapper = document.createElement("div");
      overlayImageWrapper.className = "svg-overlay-image-wrapper";

      const img = document.createElement("img");
      img.id = EMPLOYEE_MAP_IMAGE_ID;
      img.src = IMG_SOURCE;
      img.alt = "Map";
      img.className = "max-w-full max-h-96 rounded block";
      overlayImageWrapper.appendChild(img);

      imagePositioner.appendChild(overlayImageWrapper);
      container.replaceChildren(imagePositioner);

      // Wait for the image to be loaded before overlaying SVG canva
      img.onload = function () {
        buildSVGOverlayOn(img, "employee-map-overlay");
      };
      // If the image is already cached and loaded, trigger manually
      if (img.complete) {
        buildSVGOverlayOn(img, "employee-map-overlay");
      }
    } else {
      employeeTableContainer.innerHTML = employeeTableHTML;
      // Repopulate status-selects after restoring table
      document.querySelectorAll("select.status-select").forEach((select) => {
        const currentValue = select.value;
        select.innerHTML = "";
        statusOptions.forEach((opt) => {
          const option = document.createElement("option");
          option.value = opt.value;
          option.textContent = opt.label;
          if (opt.value === currentValue) option.selected = true;
          select.appendChild(option);
        });
      });
    }
  });
});

const ChartDataProcessor = {
  // Extract budget values: "$180M annual R&D investment, $45M in Data Science"
  processProjectBudget: (budgetObj) => {
    const {
      data_science,
      software_development,
      gen_ai,
      marketing,
      operations,
      other,
    } = budgetObj;

    return {
      labels: [
        "Data Science",
        "Software Development",
        "Gen AI",
        "Marketing",
        "Operations",
        "Other",
      ],
      data: [
        data_science,
        software_development,
        gen_ai,
        marketing,
        operations,
        other,
      ],
      colors: [
        "#6366f1",
        "#3b82f6",
        "#8b5cf6",
        "#10b981",
        "#f59e0b",
        "#e5e7eb",
      ],
    };
  },

  processGrowthRates: (revenueGrowth, headcountGrowth) => {
    const revenueValue = revenueGrowth
      ? parseInt(revenueGrowth.replace("%", ""))
      : 35;
    const headcountValue = headcountGrowth
      ? parseInt(headcountGrowth.replace("%", ""))
      : 28;

    return {
      labels: ["Revenue Growth", "Headcount Growth"],
      data: [revenueValue, headcountValue],
      colors: ["#22c55e", "#3b82f6"],
      backgroundColor: ["rgba(34, 197, 94, 0.2)", "rgba(59, 130, 246, 0.2)"],
    };
  },

  processFundingReceived: (fundingObj) => {
    const { seed, Series_a, series_b, series_c, series_d, series_e, series_f } =
      fundingObj;

    let labels = [];
    let data = [];

    if (seed) {
      labels.push("Seed");
      data.push(seed);
    }

    if (Series_a) {
      labels.push("Series A");
      data.push(Series_a);
    }

    if (series_b) {
      labels.push("Series B");
      data.push(series_b);
    }

    if (series_c) {
      labels.push("Series C");
      data.push(series_c);
    }

    if (series_d) {
      labels.push("Series D");
      data.push(series_d);
    }

    if (series_e) {
      labels.push("Series E");
      data.push(series_e);
    }

    if (series_f) {
      labels.push("Series F");
      data.push(series_f);
    }

    // Convert to cumulative values for funding progression
    const cumulativeData = [];
    let cumulative = 0;

    data.forEach((value) => {
      cumulative += value;
      cumulativeData.push(cumulative);
    });

    return {
      labels: labels,
      data: cumulativeData,
      colors: "#8b5cf6",
    };
  },

  // Extract rating: "4.3/5.0 (Glassdoor)"
  processEmployeeReviews: (reviewText) => {
    const ratingMatch = reviewText.match(/(\d+\.\d+)\/5\.0/);
    const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 4.3;

    return {
      rating: rating,
      maxRating: 5,
      fullStars: Math.floor(rating),
      halfStar: rating % 1 >= 0.5,
      emptyStars: 5 - Math.ceil(rating),
    };
  },

  // Extract score: "78/100"
  processWellBeingScore: (scoreText) => {
    const scoreMatch = scoreText.match(/(\d+)\/100/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 78;

    return {
      labels: ["Well-being Score", "Remaining"],
      data: [score, 100 - score],
      colors: ["#10b981", "#f3f4f6"],
    };
  },
};

const ChartRenderer = {
  renderPieChart: (canvasId, chartData, title) => {
    const ctx = document.getElementById(canvasId).getContext("2d");
    const chart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            data: chartData.data,
            backgroundColor: chartData.colors,
            borderWidth: 2,
            borderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title,
            font: { size: 14, weight: "bold" },
          },
          legend: {
            position: "bottom",
            labels: { padding: 10, font: { size: 12 } },
          },
        },
      },
    });
    return chart; // Return the chart instance
  },

  renderBarChart: (canvasId, chartData, title, yAxisLabel) => {
    const ctx = document.getElementById(canvasId).getContext("2d");
    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: yAxisLabel,
            data: chartData.data,
            backgroundColor: chartData.backgroundColor,
            borderColor: chartData.colors,
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title,
            font: { size: 14, weight: "bold" },
          },
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: Math.max(...chartData.data) + 10,
            grid: { color: "#e5e7eb" },
            ticks: {
              font: { size: 11 },
              callback: function (value) {
                return value + "%";
              },
            },
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } },
          },
        },
      },
    });
    return chart; // Return the chart instance
  },

  renderTimeSeries(canvasId, fundingData, title) {
    const fundingEntries = Object.entries(fundingData);

    // Format labels (capitalize and clean up series names)
    const labels = fundingEntries.map(([round]) => {
      return round
        .replace(/_/g, " ")
        .replace(/series/i, "Series")
        .replace(/^(\w)/, (match) => match.toUpperCase());
    });

    // Get funding amounts
    const amounts = fundingEntries.map(([, amount]) => amount);

    const ctx = document.getElementById(canvasId).getContext("2d");

    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Funding Amount",
            data: amounts,
            borderColor: "#3b82f6",
            backgroundColor: "#3b82f620",
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#3b82f6",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title,
            font: { size: 16, weight: "bold" },
            padding: 20,
          },
          legend: {
            display: true,
            position: "top",
            labels: {
              font: { size: 12 },
              usePointStyle: true,
              padding: 15,
            },
          },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              title: function (context) {
                return context[0].label + " Round";
              },
              label: function (context) {
                const value = context.parsed.y;
                return `Funding Amount: $${value}M`;
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Funding Rounds",
              font: { size: 12, weight: "bold" },
            },
            grid: {
              color: "#f3f4f6",
              display: true,
            },
            ticks: {
              font: { size: 11 },
              maxRotation: 45,
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Funding Amount ($ Millions)",
              font: { size: 12, weight: "bold" },
            },
            grid: {
              color: "#e5e7eb",
            },
            ticks: {
              font: { size: 11 },
              callback: function (value) {
                return "$" + value + "M";
              },
            },
          },
        },
        interaction: {
          mode: "index",
          intersect: false,
        },
        elements: {
          point: {
            hoverRadius: 8,
            hoverBorderWidth: 3,
          },
        },
      },
    });
    return chart;
  },

  renderStarRating: (containerId, ratingData) => {
    const container = document.getElementById(containerId);
    const { rating, fullStars, halfStar, emptyStars } = ratingData;

    let starsHTML = "";

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      starsHTML += '<span class="text-yellow-400 text-xl">★</span>';
    }

    // Half star
    if (halfStar) {
      starsHTML += '<span class="text-yellow-400 text-xl">☆</span>';
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += '<span class="text-gray-300 text-xl">☆</span>';
    }

    container.innerHTML = `
      <div class="flex items-center justify-center gap-2">
        <div class="flex">${starsHTML}</div>
        <span class="text-lg font-semibold text-gray-700 dark:text-gray-300">${rating}/5.0</span>
      </div>
    `;
  },
};

// Manual interaction
// automated typing simulation of natural language user input
document
  .getElementById("company-prompt")
  .addEventListener("click", function () {
    this.value = "";
    this.disabled = true;
    const textToType =
      "A fast-paced series-B and above scaleup with approximately 150 to 300 employees, in the Cybersecurity space with a strong focus on Data Science, and a flexible remote work policy";
    AnimationManager.actions.typeChar(0, textToType, this);
  });
document.getElementById("job-prompt").addEventListener("click", function () {
  this.value = "";
  const textToType =
    "A Lead Data Scientist role where I can be collaborating with cross-functional teams on an Agentic AI product";
  AnimationManager.actions.typeChar(0, textToType, this);
});
// Manual trigger for crawl animation
document.getElementById("crawl-btn").addEventListener("click", (e) => {
  e.preventDefault();

  // Find the step index for showing the crawl message
  const crawlStepIndex = steps.findIndex((step) => step.id === "crawl-btn");

  if (crawlStepIndex !== -1) {
    animationManager.stop(); // Stop any running animation
    animationManager.playAnimation(crawlStepIndex);
  }
});

document.querySelectorAll(".popup-company-card").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();

    const companyCard = new ModalManager(companyModalConfig);
    companyCard.populateModalWithSelectedRecord(e.target);
  });
});

document.querySelectorAll(".popup-employee-card").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();

    const employeeCard = new ModalManager(employeeModalConfig);
    employeeCard.populateModalWithSelectedRecord(e.target);
  });
});

// automated typing simulation of natural language user input
document
  .getElementById("natural-language-input-company")
  .addEventListener("click", function () {
    const textarea = this;
    const text = "How much funding has SentinelOne received?";
    let i = 0;
    textarea.value = "";
    textarea.disabled = true; // Prevent user input during animation
    AnimationManager.actions.typeChar(i, text, textarea);
  });
document
  .getElementById("natural-language-input-employee")
  .addEventListener("click", function () {
    const textarea = this;
    const text = "What's the tech stack used by the Data Science team?";
    let i = 0;
    textarea.value = "";
    textarea.disabled = true;
    AnimationManager.actions.typeChar(i, text, textarea);
  });
