import { pipeline } from '@xenova/transformers';
import { softmax, computeVectorSimilarity } from './public/app/utils.js';

const MAX_WORD_COUNT = 200;
const AI_COMPUTE_PAUSE = 500;

export class AIClassifier {
  constructor() {
    this.categories = [];
    this.tagCategories = {};
    this.classifyFn = () => {
      throw new Error('AI classifier was not initiated');
    };
  }

  async createFeatureExtractor() {
    return pipeline('feature-extraction', 'Xenova/all-distilroberta-v1');
  }

  async init(options = {}) {
    let featureExtractor = await this.createFeatureExtractor();

    let categoryEmbeddings;

    // If pre-computed embeddings are provided, use them
    if (options.categoryEmbeddings && options.categoryEmbeddings.length > 0) {
      categoryEmbeddings = options.categoryEmbeddings.map((embeddingData) => {
        // embeddingData is an object with category metadata and embedding property
        return {
          ...embeddingData,
          vector: embeddingData.embedding
        };
      });
      // Extract categories from categoryEmbeddings
      this.categories = categoryEmbeddings.map(({ vector, embedding, ...category }) => category);
    } else {
      this.categories = options.categories || [];
      // Otherwise, compute embeddings from categories
      categoryEmbeddings = await Promise.all(
        this.categories.map(async (category) => {
          let embedding = await featureExtractor(category.category, { pooling: 'mean', normalize: true });
          return {
            ...category,
            vector: embedding.data
          };
        })
      );
    }

    this.tagCategories = {};
    for (let category of this.categories) {
      if (category.tag) {
        this.tagCategories[category.tag] = category.category;
      }
    }

    this.classifyFn = async (text, scoreThreshold) => {
      let textTensor = await featureExtractor(text, { pooling: 'mean', normalize: true });
      let textVector = textTensor.data;
      let categoryScores = categoryEmbeddings.map(({ category, sensitivity, focus, vector, tag }) => {
        let score = computeVectorSimilarity(textVector, vector) * (sensitivity ?? 0.5);
        return { category, vector, focus, score, tag };
      });
      categoryScores.sort((a, b) => b.score - a.score);
      for (let i = 0; i < categoryScores.length; i++) {
        let currentCatScore = categoryScores[i];
        let { vector, score } = currentCatScore;
        if (scoreThreshold != null && score < scoreThreshold) {
          currentCatScore.redundancyScore = 1;
          continue;
        }
        let greaterCategoryScores = categoryScores.slice(0, i);
        if (greaterCategoryScores.length) {
          let categorySimilarities = greaterCategoryScores.map(catScore => computeVectorSimilarity(vector, catScore.vector));
          currentCatScore.redundancyScore = Math.max(...categorySimilarities);
        } else {
          currentCatScore.redundancyScore = 0;
        }
      }
      return categoryScores;
    };

    // Return category objects with embeddings (as arrays instead of Tensors for serialization)
    return categoryEmbeddings.map(({ vector, ...categoryData }) => ({
      ...categoryData,
      embedding: Array.from(vector)
    }));
  }

  async classify(text, scoreThreshold) {
    // Ensure text is a string
    if (typeof text !== 'string') {
      text = text ? String(text) : '';
    }
    text = text.split(' ').slice(0, MAX_WORD_COUNT).join(' ');
    try {
      return await this.classifyFn(text, scoreThreshold);
    } catch (error) {
      return [];
    }
  }

  normalize(number) {
    return Math.max(0, Math.min(1, number));
  }

  async computePersonAITags(person, scoreThreshold, temperature = .5, propWeights = {}, maxJobExpCategories = 5, redundancyPenaltyFactor = .25) {
    let topCategories = await this.computePersonAIScores(person, scoreThreshold, temperature, propWeights, maxJobExpCategories, redundancyPenaltyFactor);
    let addedTagSet = new Set();

    return topCategories.filter(item => {
      let tag = item.tag ?? item.category;
      if (addedTagSet.has(tag)) return false;
      addedTagSet.add(tag);
      return item.score >= scoreThreshold;
    });
  }

  async computePersonAIScores(person, scoreThreshold, temperature = .5, propWeights = {}, maxJobExpCategories = 5, redundancyPenaltyFactor = .25) {
    let weights = {
      headline: propWeights.headline ?? 6,
      summary: propWeights.summary ?? 4,
      skills: propWeights.skills ?? 6,
      jobs: propWeights.jobs ?? 2,
      educations: propWeights.educations ?? 2
    };

    let weightSum = Object.values(weights).reduce((sum, value) => sum + value, 0);

    let headline = person.headline || '';
    let summary = person.summary || '';
    let skills = (person.skills || '').replace(/\t/g, ', ');
    let educations = (person.educations || []).map(edu => `${edu.eduDegreeName ? edu.eduDegreeName : 'Education'}${edu.eduFieldOfStudy ? ` (${edu.eduFieldOfStudy})`: ''} at ${edu.eduSchoolName}`).join(', ');

    let allJobsResults = await Promise.all(
      (person.jobs || []).map(async (job) => {
        let jobString = (`${job.jobTitle || 'Unspecified title'} at ${job.companyName || job.jobCompanyName || 'Unspecified company'}. ${job.jobDescription || ''}`).trim();
        let jobResult = await this.classify(jobString, scoreThreshold);
        let jobCategories = jobResult.sort((a, b) => b.score - a.score).slice(0, maxJobExpCategories);
        for (let cat of jobCategories) {
          let expMillis = ((job.jobEndTimestamp ?? Date.now()) - job.jobStartTimestamp) ?? 0;
          if (cat.experience == null) {
            cat.experience = 0;
          }
          cat.experience += expMillis;
        }
        return jobResult;
      })
    );

    await new Promise(resolve => setTimeout(resolve, AI_COMPUTE_PAUSE));

    let [ topHeadlineCategories, topSummaryCategories, topSkillsCategories, topEducationsCategories ] = await Promise.all([
      this.classify(headline, scoreThreshold),
      this.classify(summary, scoreThreshold),
      this.classify(skills, scoreThreshold),
      this.classify(educations, scoreThreshold)
    ]);

    let topJobCategories = allJobsResults[0] || [];

    let jobExps = {};
    for (let jobResult of allJobsResults) {
      let tagExps = {};
      for (let cat of jobResult) {
        if (cat.experience != null) {
          let category = cat.category;
          let tag = cat.tag ?? category;
          if (tagExps[tag] == null) {
            tagExps[tag] = cat.experience;
          } else if (cat.experience > tagExps[tag]) {
            tagExps[tag] = cat.experience;
          }
        }
      }

      let tagExpEntries = Object.entries(tagExps);
      for (let [ tag, exp ] of tagExpEntries) {
        if (jobExps[tag] == null) {
          jobExps[tag] = 0;
        }
        jobExps[tag] += exp;
      }
    }

    let topCategories = this.categories.map((cat) => {
      let tag = cat.tag;
      let isRawTag = !!tag;
      let category = cat.category;
      let headlineCat;
      let summaryCat;
      let skillsCat;
      let jobCat;
      let educationsCat;
      if (isRawTag) {
        headlineCat = topHeadlineCategories.find(currentCat => currentCat.tag === tag) || {};
        summaryCat = topSummaryCategories.find(currentCat => currentCat.tag === tag) || {};
        skillsCat = topSkillsCategories.find(currentCat => currentCat.tag === tag) || {};
        jobCat = topJobCategories.find(currentCat => currentCat.tag === tag) || {};
        educationsCat = topEducationsCategories.find(currentCat => currentCat.tag === tag) || {};
      } else {
        headlineCat = topHeadlineCategories.find(currentCat => !currentCat.tag && currentCat.category === category) || {};
        summaryCat = topSummaryCategories.find(currentCat => !currentCat.tag && currentCat.category === category) || {};
        skillsCat = topSkillsCategories.find(currentCat => !currentCat.tag && currentCat.category === category) || {};
        jobCat = topJobCategories.find(currentCat => !currentCat.tag && currentCat.category === category) || {};
        educationsCat = topEducationsCategories.find(currentCat => !currentCat.tag && currentCat.category === category) || {};
      }
      let experience = jobExps[tag || category] || 0;

      return {
        tag,
        category,
        score: softmax([
          this.normalize(((headlineCat.score || 0) - (headlineCat.redundancyScore || 0) * redundancyPenaltyFactor) * (headlineCat?.focus?.headline ?? 0.5) * weights.headline / weightSum * 5),
          this.normalize(((summaryCat.score || 0) - (summaryCat.redundancyScore || 0) * redundancyPenaltyFactor) * (summaryCat?.focus?.summary ?? 0.5) * weights.summary / weightSum * 5),
          this.normalize(((skillsCat.score || 0) - (skillsCat.redundancyScore || 0) * redundancyPenaltyFactor) * (skillsCat?.focus?.skills ?? 0.5) * weights.skills / weightSum * 5),
          this.normalize(((jobCat.score || 0) - (jobCat.redundancyScore || 0) * redundancyPenaltyFactor) * (jobCat?.focus?.jobs ?? 0.5) * weights.jobs / weightSum * 5),
          this.normalize(((educationsCat.score || 0) - (educationsCat.redundancyScore || 0) * redundancyPenaltyFactor) * (educationsCat?.focus?.educations ?? 0.5) * weights.educations / weightSum * 5)
        ], temperature),
        experience
      };
    });

    return topCategories.sort((a, b) => b.score - a.score);
  }

  async computeCompanyAIScores(company, scoreThreshold, temperature = .5, propWeights = {}, redundancyPenaltyFactor = .25) {
    let weights = {
      companyName: propWeights.companyName ?? 2,
      specialities: propWeights.specialities ?? 5,
      companyDescription: propWeights.companyDescription ?? 5
    };

    let weightSum = Object.values(weights).reduce((sum, value) => sum + value, 0);

    let companyName = company.companyName || '';
    let specialities = company.specialities || '';
    let companyDescription = company.companyDescription || '';

    await new Promise(resolve => setTimeout(resolve, AI_COMPUTE_PAUSE));

    let [ topCompanyNameCategories, topSpecialitiesCategories, topCompanyDescriptionCategories ] = await Promise.all([
      this.classify(companyName, scoreThreshold),
      this.classify(specialities, scoreThreshold),
      this.classify(companyDescription, scoreThreshold)
    ]);

    let topCategories = this.categories.map((cat) => {
      let tag = cat.tag;
      let isRawTag = !!tag;
      let category = cat.category;
      let companyNameCat;
      let summaryCat;
      let companyDescriptionCat;
      if (isRawTag) {
        companyNameCat = topCompanyNameCategories.find(currentCat => currentCat.tag === tag) || {};
        summaryCat = topSpecialitiesCategories.find(currentCat => currentCat.tag === tag) || {};
        companyDescriptionCat = topCompanyDescriptionCategories.find(currentCat => currentCat.tag === tag) || {};
      } else {
        companyNameCat = topCompanyNameCategories.find(currentCat => !currentCat.tag && currentCat.category === category) || {};
        summaryCat = topSpecialitiesCategories.find(currentCat => !currentCat.tag && currentCat.category === category) || {};
        companyDescriptionCat = topCompanyDescriptionCategories.find(currentCat => !currentCat.tag && currentCat.category === category) || {};
      }

      return {
        tag,
        category,
        score: softmax([
          this.normalize(((companyNameCat.score || 0) - (companyNameCat.redundancyScore || 0) * redundancyPenaltyFactor) * (companyNameCat?.focus?.companyName ?? 0.5) * weights.companyName / weightSum * 5),
          this.normalize(((summaryCat.score || 0) - (summaryCat.redundancyScore || 0) * redundancyPenaltyFactor) * (summaryCat?.focus?.specialities ?? 0.5) * weights.specialities / weightSum * 5),
          this.normalize(((companyDescriptionCat.score || 0) - (companyDescriptionCat.redundancyScore || 0) * redundancyPenaltyFactor) * (companyDescriptionCat?.focus?.companyDescription ?? 0.5) * weights.companyDescription / weightSum * 5),
        ], temperature)
      };
    });

    return topCategories.sort((a, b) => b.score - a.score);
  }
}

