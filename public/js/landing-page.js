import { ModalManager } from "./classes/modal-manager.js";
import {
  buildSVGImage,
  buildSVGOverlayOn,
  buildSVGRectangle,
  getLeafValue,
  setAttribute,
  updateCardContentTable,
} from "./utils/index.js";
import { AnimationManager } from "./classes/animation-manager.js";


/* banner animation */
const bannerSteps = [
  {
    id: "intro",
    actionName: "fadeElm",
    absTiming: 1000,
    parameter: { faded: "in" },
    log: "Show intro",
  },
  {
    id: "slogan-words",
    actionName: "fadeElm",
    absTiming: 2500,
    parameter: { faded: "in" },
    log: "Show slogan",
  },
];
document.addEventListener("DOMContentLoaded", () => {
  const bannerAnimation = new AnimationManager(bannerSteps);
  bannerAnimation.start();
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

  processFundingReceived: (fundingObj, marketCap) => {
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

document.querySelectorAll(".popup-company-card").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    // TODO - Duplicated `companyModalConfig`, just make it work with `ModalManager`
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

    const companyCard = new ModalManager(companyModalConfig);
    companyCard.populateModalWithDefaultRecord();
  });
});
