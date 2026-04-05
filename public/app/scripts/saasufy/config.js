module.exports.sampleRestrictionThreshold = 10;
module.exports.companyPersonCountThresholds = [ 2, 5, 10, 20, 50 ];

const tagYears = {
  0: '.years-0',
  1: '.years-1',
  5: '.years-5',
  10: '.years-10'
};

module.exports.tagYears = tagYears;

const baseTagMap = {
  'IC-design': 'electronics-engineering',
  'electro-optical-sensor': 'electronics-engineering',
  'PCB-assembly': 'electronics-engineering',
  'PCB-design': 'electronics-engineering'
};

module.exports.baseTagMap = baseTagMap;

// These suffixes will be used to produce tag variants and
// then tagged with additional metrics at the company level.
const tagSuffixes = Object.values(tagYears);

const baseTagList = [
  {
    sourceFields: {
      Person: [ 'specializations' ],
      Job: [ 'specializations' ]
    },
    baseTagName: 'mechanical-engineering',
    companyConcentrationThresholds: {
      low: .07,
      medium: .15,
      high: .26
    },
    regex: new RegExp('\\bmechanical-engineering\\b', 'i')
  },
  {
    sourceFields: {
      Person: [ 'specializations' ],
      Job: [ 'specializations' ]
    },
    baseTagName: 'mechatronics-engineering',
    companyConcentrationThresholds: {
      low: .07,
      medium: .15,
      high: .26
    },
    regex: new RegExp('\\bmechatronics-engineering\\b', 'i')
  },
  {
    sourceFields: {
      Person: [ 'specializations' ],
      Job: [ 'specializations' ]
    },
    baseTagName: 'electronics-engineering',
    companyConcentrationThresholds: {
      low: .07,
      medium: .15,
      high: .26
    },
    regex: new RegExp('\\belectronics-engineering\\b', 'i')
  },
  {
    sourceFields: {
      Person: [ 'specializations' ],
      Job: [ 'specializations' ]
    },
    baseTagName: 'systems-engineering',
    companyConcentrationThresholds: {
      low: .2,
      medium: .5,
      high: .8
    },
    regex: new RegExp('\\bsystems-engineering\\b', 'i')
  },
  {
    sourceFields: {
      Person: [ 'specializations' ],
      Job: [ 'specializations' ]
    },
    baseTagName: 'optical-engineering',
    companyConcentrationThresholds: {
      low: .07,
      medium: .15,
      high: .26
    },
    regex: new RegExp('\\boptical-engineering\\b', 'i')
  },
  {
    sourceFields: {
      Person: [ 'currentJobTitle', 'skills' ],
      Job: [ 'jobTitle', 'jobDescription', 'jobIndustries', 'jobSkills' ]
    },
    baseTagName: 'software-engineering',
    companyConcentrationThresholds: {
      low: .07,
      medium: .15,
      high: .26
    },
    regex: new RegExp('\\bSoftware Eng|\\bSoftware Dev|\\bFront ?End Dev|\\bBack ?End Dev|\\bBack ?End Eng|\\bFront ?End Eng', 'i')
  },
  {
    sourceFields: {
      Person: [ 'currentJobTitle', 'skills' ],
      Job: [ 'jobTitle', 'jobDescription', 'jobIndustries', 'jobSkills' ]
    },
    baseTagName: 'software-architecture',
    companyConcentrationThresholds: {
      low: .07,
      medium: .15,
      high: .26
    },
    regex: new RegExp('BDD|Behaviour Driven Design|DDD|Domain Driven Design|Model View Controller|Model View Presenter|Model View Viewmodel|Model.View.Controller|Mode.View.Controller|Model.View.Viewmodel|MVC|MVVM|Serverless|Service Oriented Architecture|SOA|TDD|Test Driven Design|\\b(?:software|solution|technical|system|enterprise)\s+architect\\b|(?:chief|lead|principal)\s+(?:architect|technical\s+architect)|architecture\s+(?:design|planning|development|governance)|(?:distributed|cloud|system|software)\s+architecture|technical\s+(?:roadmap|vision|strategy)|cross-system\s+integration', 'i')
  },
  {
    sourceFields: {
      Person: [ 'currentJobTitle', 'skills' ],
      Job: [ 'jobTitle', 'jobDescription', 'jobIndustries', 'jobSkills' ]
    },
    baseTagName: 'software-front-end',
    companyConcentrationThresholds: {
      low: .2,
      medium: .5,
      high: .8
    },
    regex: new RegExp('\\bFront ?End.{0,20}Dev\\w*\\b|\\bFront ?End Eng|\\bFront ?End.{0,20}Dev|\\bDev.{0,20}Front ?End\\b|\\bFront ?End.{0,20}Integration|\\bIntegration.{0,20}Front ?End\\b|\\bMobile.{0,20}First\\b|\\bFirst.{0,20}Mobile\\b|\\bResponsive.{0,20}Design\\w*\\b|\\bDesign.{0,20}Responsive\\w*\\b|\\bResponsive.{0,20}Dev\\w*\\b|\\bDev.{0,20}Responsive\\w*\\b|\\bJavaScript\\b|\\bTypeScript\\b|\\bReact\.js\\b|\\bVue\.js\\b|\\bAngular\\b', 'i')
  },
  {
    sourceFields: {
      Person: [ 'currentJobTitle', 'skills' ],
      Job: [ 'jobTitle', 'jobDescription', 'jobIndustries', 'jobSkills' ]
    },
    baseTagName: 'software-back-end',
    companyConcentrationThresholds: {
      low: .2,
      medium: .5,
      high: .8
    },
    regex: new RegExp('\\bBack ?End.{0,20}Dev\\w*\\b|\\bBack ?End Eng|\\bBack ?End.{0,20}Dev|\\bDev.{0,20}Back ?End\\b|\\bBack ?End.{0,20}Integration|\\bIntegration.{0,20}Back ?End\\b|\\bPython (programming|coding)\\b|\\bPyTorch\\b|\\bFlask Framework\\b|\\bNode\.?js\\b|\\bC#\\b|\\bASP\.net\\b|\\bRuby on rails\\b|\\bMySQL\\b|\\bMongoDB\\b|\\bRedis\\b|\\bPostgres\\b', 'i')
  },
  {
    sourceFields: {
      Person: [ 'currentJobTitle', 'skills' ],
      Job: [ 'jobTitle', 'jobDescription', 'jobIndustries', 'jobSkills' ]
    },
    baseTagName: 'software-dev-ops',
    companyConcentrationThresholds: {
      low: .2,
      medium: .5,
      high: .8
    },
    regex: new RegExp('\\bDev\.? ?Ops\\b|\\bDevOps\\b|\\bManag.{0,10} (Kubernetes|AWS|EC2|Azure|GKE|GCE|Digital ?Ocean|) infra', 'i')
  },
  {
    sourceFields: {
      Person: [ 'currentJobTitle' ],
      Job: [ 'jobTitle', 'jobDescription', 'jobSkills' ]
    },
    baseTagName: 'director',
    companyConcentrationThresholds: {
      low: .01,
      medium: .1,
      high: .2
    },
    regex: new RegExp('\\bDelivery.{0,20}Dir\\w*\\b|\\bDir.{0,20}Delivery\\w*\\b|\\bDevelopment.{0,20}Dir\\w*\\b|\\bDir.{0,20}Development\\w*\\b|\\bDirector\\b|\\bHead Of\\b|\\bHead.{0,20}Data\\b|\\bData.{0,20}Head\\b|\\bHead.{0,20}Department\\b|\\bDepartment.{0,20}Head\\b|\\bHead.{0,20}Develop\\w*\\b|\\bDevelop.{0,20}Head\\w*\\b|\\bHead.{0,20}Engineer\\w*\\b|\\bEngineer.{0,20}Head\\w*\\b|\\bHead.{0,20}Sftw\\b|\\bSftw.{0,20}Head\\b|\\bHead.{0,20}Software\\b|\\bSoftware.{0,20}Head\\b|\\bIndustry.{0,20}Dir\\w*\\b|\\bDir.{0,20}Industry\\w*\\b|\\bIndustry.{0,20}Head\\b|\\bHead.{0,20}Industry\\b|\\bPlace.{0,20}Dir\\w*\\b|\\bDir.{0,20}Place\\w*\\b|\\bProgram.{0,20}Dir\\w*\\b|\\bDir.{0,20}Program\\w*\\b|\\bProject.{0,20}Dir\\w*\\b|\\bDir.{0,20}Project\\w*\\b|\\bTech.{0,20}Dir\\w*\\b|\\bDir.{0,20}Tech\\w*\\b', 'i')
  },
  {
    sourceFields: {
      Person: [ 'currentJobTitle' ],
      Job: [ 'jobTitle', 'jobDescription', 'jobSkills' ]
    },
    baseTagName: 'executive-director',
    companyConcentrationThresholds: {
      low: .01,
      medium: .1,
      high: .2
    },
    regex: new RegExp('\\bEGM\\b|\\bEM\\b|\\bGM\\b|\\bMD\\b|\\bVP\\b|\\bExec.{0,20}Advisor\\w*\\b|\\bAdvisor.{0,20}Exec\\w*\\b|\\bExec.{0,20}Dir\\w*\\b|\\bDir.{0,20}Exec\\w*\\b|\\bExec.{0,20}GMs?\\b|\\bGM.{0,20}Execs?\\b|\\bExec.{0,20}Lead\\w*\\b|\\bLead.{0,20}Exec\\w*\\b|\\bExec.{0,20}Manag\\w*\\b|\\bManag.{0,20}Exec\\w*\\b|\\bExec.{0,20}MDs?\\b|\\bMD.{0,20}Execs?\\b|\\bGeneral Manag\\w*\\b|\\bGeneral.{0,20}Manag\\w*\\b|\\bManag.{0,20}General\\w*\\b|\\bGroup.{0,20}Head\\b|\\bHead.{0,20}Group\\b|\\bGroup.{0,20}Manag\\w*\\b|\\bManag.{0,20}Group\\w*\\b|\\bLead.{0,20}Partner\\b|\\bPartner.{0,20}Lead\\b|\\bManag.{0,20}Dir\\w*\\b|\\bDir.{0,20}Manag\\w*\\b|\\bManag.{0,20}Partner\\b|\\bPartner.{0,20}Manag\\b|\\bPartner\\b|\\bPartner.{0,20}Dir\\w*\\b|\\bDir.{0,20}Partner\\w*\\b|\\bPMDs?\\b|\\bPresident\\b|\\bSurveyor.{0,20}General\\b|\\bGeneral.{0,20}Surveyor\\b|\\bSVPs?\\b|\\bVice.{0,20}President\\b|\\bPresident.{0,20}Vice\\b', 'i')
  },
  {
    sourceFields: {
      Person: [ 'currentJobTitle' ],
      Job: [ 'jobTitle', 'jobDescription', 'jobSkills' ]
    },
    baseTagName: 'founder',
    companyConcentrationThresholds: {
      low: .01,
      medium: .1,
      high: .2
    },
    regex: new RegExp('\\bCo.{0,2}found\\w*\\b|\\bfound.{0,2}Co\\w*\\b|\\bEntrepreneur\\w*\\b|\\bFound.{0,20}Member\\b|\\bMember.{0,20}Found\\b|\\bFound.{0,20}Partner\\b|\\bPartner.{0,20}Found\\b|\\bFounder\\b', 'i')
  },
  {
    sourceFields: {
      Person: [ 'currentJobTitle' ],
      Job: [ 'jobTitle', 'jobDescription', 'jobSkills' ]
    },
    baseTagName: 'middle-manager',
    companyConcentrationThresholds: {
      low: .07,
      medium: .15,
      high: .26
    },
    regex: new RegExp('\\bCPPM\\b|\\bCPSPM\\b|\\bMTS\\b|\\bApplication.{0,20}Architects?\\b|\\bArchitect.{0,20}Applications?\\b|\\bArchitects?\\b|\\bAsset Managers?\\b|\\bCertified.{0,20}Managers?\\b|\\bManager.{0,20}Certifieds?\\b|\\bConstruction Managers?\\b|\\bD&C.{0,20}Managers?\\b|\\bManager.{0,20}D&Cs?\\b|\\bDelivery.{0,20}Lead\\w*\\b|\\bLead.{0,20}Delivery\\w*\\b|\\bDelivery.{0,20}Managers?\\b|\\bManager.{0,20}Deliverys?\\b|\\bDesign Authoritys?\\b|\\bDesign.{0,20}Managers?\\b|\\bManager.{0,20}Designs?\\b|\\bDevelop.{0,20}Managers?\\b|\\bManager.{0,20}Develops?\\b|\\bDivision Managers?\\b|\\bEngineer.{0,20}Architects?\\b|\\bArchitect.{0,20}Engineers?\\b|\\bEngineer.{0,20}Lead\\w*\\b|\\bLead.{0,20}Engineer\\w*\\b|\\bEngineer.{0,20}Managers?\\b|\\bManager.{0,20}Engineers?\\b|\\bEnterprise.{0,20}Architects?\\b|\\bArchitect.{0,20}Enterprises?\\b|\\bFE.{0,20}Architect\\w*\\b|\\bArchitect.{0,20}FE\\w*\\b|\\bFront.{0,20}End.{0,20}Architect\\w*\\b|\\bFront.{0,20}Architect.{0,20}End\\w*\\b|\\bEnd.{0,20}Front.{0,20}Architect\\w*\\b|\\bEnd.{0,20}Architect.{0,20}Front\\w*\\b|\\bArchitect.{0,20}Front.{0,20}End\\w*\\b|\\bArchitect.{0,20}End.{0,20}Front\\w*\\b|\\bInteg.{0,20}Architects?\\b|\\bArchitect.{0,20}Integs?\\b|\\bIntegration.{0,20}Architects?\\b|\\bArchitect.{0,20}Integrations?\\b|\\bInterface.{0,20}Managers?\\b|\\bManager.{0,20}Interfaces?\\b|\\bLead.{0,20}Civils?\\b|\\bCivil.{0,20}Leads?\\b|\\bLead.{0,20}Engineers?\\b|\\bEngineer.{0,20}Leads?\\b|\\bLead.{0,20}Engineer\\w*\\b|\\bEngineer.{0,20}Lead\\w*\\b|\\bManag.{0,20}Contract Managements?\\b|\\bContract Management.{0,20}Manags?\\b|\\bManag.{0,20}Place Managements?\\b|\\bPlace Management.{0,20}Manags?\\b|\\bManagers?\\b|\\bMember.{0,20}Technical Staffs?\\b|\\bTechnical Staff.{0,20}Members?\\b|\\bPortfolio.{0,20}Managers?\\b|\\bManager.{0,20}Portfolios?\\b|\\bPractice.{0,20}Lead\\w*\\b|\\bLead.{0,20}Practice\\w*\\b|\\bPractice.{0,20}Managers?\\b|\\bManager.{0,20}Practices?\\b|\\bPrincip.{0,20}Engineer\\w*\\b|\\bEngineer.{0,20}Princip\\w*\\b|\\bProduct.{0,20}Architects?\\b|\\bArchitect.{0,20}Products?\\b|\\bProduct.{0,20}Lead\\w*\\b|\\bLead.{0,20}Product\\w*\\b|\\bProduct.{0,20}Managers?\\b|\\bManager.{0,20}Products?\\b|\\bProgram & Project.{0,20}Managers?\\b|\\bManager.{0,20}Program & Projects?\\b|\\bProgram&Project.{0,20}Managers?\\b|\\bManager.{0,20}Program&Projects?\\b|\\bProgram.{0,20}Lead\\w*\\b|\\bLead.{0,20}Program\\w*\\b|\\bProgram.{0,20}Managers?\\b|\\bManager.{0,20}Programs?\\b|\\bProject.{0,20}Engineers?\\b|\\bEngineer.{0,20}Projects?\\b|\\bProject.{0,20}Lead\\w*\\b|\\bLead.{0,20}Project\\w*\\b|\\bProject.{0,20}Managers?\\b|\\bManager.{0,20}Projects?\\b|\\bSenior.{0,20}Managers?\\b|\\bManager.{0,20}Seniors?\\b|\\bSftw.{0,20}Architects?\\b|\\bArchitect.{0,20}Sftws?\\b|\\bSoftware.{0,20}Architects?\\b|\\bArchitect.{0,20}Softwares?\\b|\\bSolution.{0,20}Architects?\\b|\\bArchitect.{0,20}Solutions?\\b|\\bStaff.{0,20}Engineers?\\b|\\bEngineer.{0,20}Staffs?\\b|\\bStrategic.{0,20}Leads?\\b|\\bLead.{0,20}Strategics?\\b|\\bSupervis\\w*\\b|\\bSystem.{0,20}Architects?\\b|\\bArchitect.{0,20}Systems?\\b|\\bTeam.{0,20}Lead\\w*\\b|\\bLead.{0,20}Team\\w*\\b|\\bTech.{0,20}Lead\\w*\\b|\\bLead.{0,20}Tech\\w*\\b|\\bTech.{0,20}Staff\\b|\\bStaff.{0,20}Tech\\b', 'i')
  }
];

const skillTagList = baseTagList.map((tagItem) => {
  return {
    ...tagItem,
    tagName: `skill:${tagItem.baseTagName}`,
    tagMetricSuffixes: tagSuffixes
  };
});

const positionTagList = baseTagList.map((tagItem) => {
  return {
    ...tagItem,
    tagName: `position:${tagItem.baseTagName}`,
    tagMetricSuffixes: tagSuffixes,
    sourceSelectors: {
      Job: (job) => job && job.jobIsCurrent
    },
    computeExperienceFromTag: `skill:${tagItem.baseTagName}`
  };
});

module.exports.tagList = [
  ...skillTagList,
  ...positionTagList,
  {
    sourceFields: {
      Education: [ 'eduDegreeName' ]
    },
    tagName: 'edu:engineering-bachelor',
    tagMetricSuffixes: [],
    companyConcentrationThresholds: {
      low: .07,
      medium: .15,
      high: .26
    },
    regex: new RegExp('^B\. ?E\.?$|^B\. Eng|Bachelor Engineering|Bachelor of Engineering|Bachelor of [^ ]+ Engineering|B\.? of Engineering|Engineering Bachelor', 'i')
  },
  {
    sourceFields: {
      Education: [ 'eduDegreeName' ]
    },
    tagName: 'edu:engineering-master',
    tagMetricSuffixes: [],
    companyConcentrationThresholds: {
      low: .03,
      medium: .07,
      high: .13
    },
    regex: new RegExp('^M\.? ?E\.?$|^MSc$|M\.Eng|^M\.?S\.? ?Eng|Master Engineering|Master of Engineering|Master of [^ ]+ Engineering|M\.? of Engineering|Engineering Master', 'i')
  },
  {
    sourceFields: {
      Education: [ 'eduDegreeName' ]
    },
    tagName: 'edu:engineering-phd',
    tagMetricSuffixes: [],
    companyConcentrationThresholds: {
      low: .01,
      medium: .03,
      high: .06
    },
    regex: new RegExp('Eng.? P\.?h\.?D\.?|P\.?h\.?D\.? Eng|Engineer[^ ]* Doctor|Doctor of Engineering|Doctor of [^ ]+ Engineering|P\.?h\.?D\.? (in|of) Engineering|P\.?h\.?D\.? (in|of) [^ ]+ Engineering', 'i')
  },
  {
    sourceFields: {
      Education: [ 'eduDegreeName' ]
    },
    tagName: 'edu:info-tech-bachelor',
    tagMetricSuffixes: [],
    companyConcentrationThresholds: {
      low: .07,
      medium: .15,
      high: .26
    },
    regex: new RegExp('Bachelor of Information Technology|Bachelor of Info\.? Tech\.?|Bachelor of I\.?T\.?|B\.?Inf\.?Tech', 'i')
  },
  {
    sourceFields: {
      Education: [ 'eduDegreeName' ]
    },
    tagName: 'edu:info-tech-master',
    tagMetricSuffixes: [],
    companyConcentrationThresholds: {
      low: .03,
      medium: .07,
      high: .13
    },
    regex: new RegExp('Master of Information Technology|Master of Info\.? Tech\.?|Master of I\.?T\.?|M\.?Sc\.?IT|MSIT', 'i')
  },
  {
    sourceFields: {
      Education: [ 'eduDegreeName' ]
    },
    tagName: 'edu:info-tech-phd',
    tagMetricSuffixes: [],
    companyConcentrationThresholds: {
      low: .01,
      medium: .03,
      high: .06
    },
    regex: new RegExp('P\.?h\.?D\.? (of|in) Information Technology|P\.?h\.?D\.? (of|in) Info\.? Tech\.?|P\.?h\.?D\.? (of|in) I\.?T\.?', 'i')
  },
  {
    sourceFields: {
      Education: [ 'eduDegreeName' ]
    },
    tagName: 'edu:comp-sci-bachelor',
    tagMetricSuffixes: [],
    companyConcentrationThresholds: {
      low: .07,
      medium: .15,
      high: .26
    },
    regex: new RegExp('Bachelor of Computer Science|Bachelor of Comp\.? Sci\.?|B\.?Comp\.?Sc\.?', 'i')
  },
  {
    sourceFields: {
      Education: [ 'eduDegreeName' ]
    },
    tagName: 'edu:comp-sci-master',
    tagMetricSuffixes: [],
    companyConcentrationThresholds: {
      low: .03,
      medium: .07,
      high: .13
    },
    regex: new RegExp('Master of Computer Science|Master of Comp\.? Sci\.?|M\.?Comp\.?Sc\.?', 'i')
  },
  {
    sourceFields: {
      Education: [ 'eduDegreeName' ]
    },
    tagName: 'edu:comp-sci-phd',
    tagMetricSuffixes: [],
    companyConcentrationThresholds: {
      low: .01,
      medium: .03,
      high: .06
    },
    regex: new RegExp('P\.?h\.?D\.? (of|in) Computer Science|P\.?h\.?D\.? (of|in) Comp\.? Sci\.?|P\.?h\.?D\.? Comp\.?Sc\.?', 'i')
  },
  {
    sourceFields: {
      Education: [ 'eduDegreeName' ]
    },
    tagName: 'edu:bachelor',
    tagMetricSuffixes: [],
    companyConcentrationThresholds: {
      low: .07,
      medium: .15,
      high: .26
    },
    regex: new RegExp('\\bBachelor\\b', 'i')
  },
  {
    sourceFields: {
      Education: [ 'eduDegreeName' ]
    },
    tagName: 'edu:master',
    tagMetricSuffixes: [],
    companyConcentrationThresholds: {
      low: .03,
      medium: .07,
      high: .13
    },
    regex: new RegExp('\\bMaster\\b', 'i')
  },
  {
    sourceFields: {
      Education: [ 'eduDegreeName' ]
    },
    tagName: 'edu:phd',
    tagMetricSuffixes: [],
    companyConcentrationThresholds: {
      low: .01,
      medium: .03,
      high: .06
    },
    regex: new RegExp('\\bP\.?h\.?D\.?\\b', 'i')
  }
];