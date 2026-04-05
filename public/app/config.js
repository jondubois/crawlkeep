const YEAR_IN_MILLISECONDS = 366 * 24 * 60 * 60 * 1000;

export const config = {
  dev: {
    fullCompanySetSize: '80k',
    oauth: {
      google: {
        redirectURI: 'http://localhost:8081/app/oauth.html',
        clientId: '952857183720-65rtfeqc16eih241e047gp5c17rpsq51.apps.googleusercontent.com'
      }
    }
  },
  prod: {
    fullCompanySetSize: '80k',
    oauth: {
      google: {
        redirectURI: 'https://crawlkeep.com/app/oauth.html',
        clientId: '952857183720-65rtfeqc16eih241e047gp5c17rpsq51.apps.googleusercontent.com'
      }
    }
  },
  seniorities: [
    {
      name: 'Executive',
      regex: new RegExp('\\bEGM\\b|\\bEM\\b|\\bGM\\b|\\bMD\\b|\\bVP\\b|\\bExec.{0,20}Advisor\\w*\\b|\\bAdvisor.{0,20}Exec\\w*\\b|\\bExec.{0,20}Dir\\w*\\b|\\bDir.{0,20}Exec\\w*\\b|\\bExec.{0,20}GMs?\\b|\\bGM.{0,20}Execs?\\b|\\bExec.{0,20}Lead\\w*\\b|\\bLead.{0,20}Exec\\w*\\b|\\bExec.{0,20}Manag\\w*\\b|\\bManag.{0,20}Exec\\w*\\b|\\bExec.{0,20}MDs?\\b|\\bMD.{0,20}Execs?\\b|\\bGeneral Manag\\w*\\b|\\bGeneral.{0,20}Manag\\w*\\b|\\bManag.{0,20}General\\w*\\b|\\bGroup.{0,20}Head\\b|\\bHead.{0,20}Group\\b|\\bGroup.{0,20}Manag\\w*\\b|\\bManag.{0,20}Group\\w*\\b|\\bLead.{0,20}Partner\\b|\\bPartner.{0,20}Lead\\b|\\bManag.{0,20}Dir\\w*\\b|\\bDir.{0,20}Manag\\w*\\b|\\bManag.{0,20}Partner\\b|\\bPartner.{0,20}Manag\\b|\\bPartner\\b|\\bPartner.{0,20}Dir\\w*\\b|\\bDir.{0,20}Partner\\w*\\b|\\bPMDs?\\b|\\bPresident\\b|\\bSurveyor.{0,20}General\\b|\\bGeneral.{0,20}Surveyor\\b|\\bSVPs?\\b|\\bVice.{0,20}President\\b|\\bPresident.{0,20}Vice\\b', 'i')
    },
    {
      name: 'Director',
      regex: new RegExp('\\bDelivery.{0,20}Dir\\w*\\b|\\bDir.{0,20}Delivery\\w*\\b|\\bDevelopment.{0,20}Dir\\w*\\b|\\bDir.{0,20}Development\\w*\\b|\\bDirector\\b|\\bHead Of\\b|\\bHead.{0,20}Data\\b|\\bData.{0,20}Head\\b|\\bHead.{0,20}Department\\b|\\bDepartment.{0,20}Head\\b|\\bHead.{0,20}Develop\\w*\\b|\\bDevelop.{0,20}Head\\w*\\b|\\bHead.{0,20}Engineer\\w*\\b|\\bEngineer.{0,20}Head\\w*\\b|\\bHead.{0,20}Sftw\\b|\\bSftw.{0,20}Head\\b|\\bHead.{0,20}Software\\b|\\bSoftware.{0,20}Head\\b|\\bIndustry.{0,20}Dir\\w*\\b|\\bDir.{0,20}Industry\\w*\\b|\\bIndustry.{0,20}Head\\b|\\bHead.{0,20}Industry\\b|\\bPlace.{0,20}Dir\\w*\\b|\\bDir.{0,20}Place\\w*\\b|\\bProgram.{0,20}Dir\\w*\\b|\\bDir.{0,20}Program\\w*\\b|\\bProject.{0,20}Dir\\w*\\b|\\bDir.{0,20}Project\\w*\\b|\\bTech.{0,20}Dir\\w*\\b|\\bDir.{0,20}Tech\\w*\\b', 'i')
    },
    {
      name: 'Founder',
      regex: new RegExp('\\bCo.{0,2}found\\w*\\b|\\bfound.{0,2}Co\\w*\\b|\\bEntrepreneur\\w*\\b|\\bFound.{0,20}Member\\b|\\bMember.{0,20}Found\\b|\\bFound.{0,20}Partner\\b|\\bPartner.{0,20}Found\\b|\\bFounder\\b', 'i')
    },
    {
      name: 'Middle Manager',
      regex: new RegExp('\\bCPPM\\b|\\bCPSPM\\b|\\bMTS\\b|\\bApplication.{0,20}Architects?\\b|\\bArchitect.{0,20}Applications?\\b|\\bArchitects?\\b|\\bAsset Managers?\\b|\\bCertified.{0,20}Managers?\\b|\\bManager.{0,20}Certifieds?\\b|\\bConstruction Managers?\\b|\\bD&C.{0,20}Managers?\\b|\\bManager.{0,20}D&Cs?\\b|\\bDelivery.{0,20}Lead\\w*\\b|\\bLead.{0,20}Delivery\\w*\\b|\\bDelivery.{0,20}Managers?\\b|\\bManager.{0,20}Deliverys?\\b|\\bDesign Authoritys?\\b|\\bDesign.{0,20}Managers?\\b|\\bManager.{0,20}Designs?\\b|\\bDevelop.{0,20}Managers?\\b|\\bManager.{0,20}Develops?\\b|\\bDivision Managers?\\b|\\bEngineer.{0,20}Architects?\\b|\\bArchitect.{0,20}Engineers?\\b|\\bEngineer.{0,20}Lead\\w*\\b|\\bLead.{0,20}Engineer\\w*\\b|\\bEngineer.{0,20}Managers?\\b|\\bManager.{0,20}Engineers?\\b|\\bEnterprise.{0,20}Architects?\\b|\\bArchitect.{0,20}Enterprises?\\b|\\bFE.{0,20}Architect\\w*\\b|\\bArchitect.{0,20}FE\\w*\\b|\\bFront.{0,20}End.{0,20}Architect\\w*\\b|\\bFront.{0,20}Architect.{0,20}End\\w*\\b|\\bEnd.{0,20}Front.{0,20}Architect\\w*\\b|\\bEnd.{0,20}Architect.{0,20}Front\\w*\\b|\\bArchitect.{0,20}Front.{0,20}End\\w*\\b|\\bArchitect.{0,20}End.{0,20}Front\\w*\\b|\\bInteg.{0,20}Architects?\\b|\\bArchitect.{0,20}Integs?\\b|\\bIntegration.{0,20}Architects?\\b|\\bArchitect.{0,20}Integrations?\\b|\\bInterface.{0,20}Managers?\\b|\\bManager.{0,20}Interfaces?\\b|\\bLead.{0,20}Civils?\\b|\\bCivil.{0,20}Leads?\\b|\\bLead.{0,20}Engineers?\\b|\\bEngineer.{0,20}Leads?\\b|\\bLead.{0,20}Engineer\\w*\\b|\\bEngineer.{0,20}Lead\\w*\\b|\\bManag.{0,20}Contract Managements?\\b|\\bContract Management.{0,20}Manags?\\b|\\bManag.{0,20}Place Managements?\\b|\\bPlace Management.{0,20}Manags?\\b|\\bManagers?\\b|\\bMember.{0,20}Technical Staffs?\\b|\\bTechnical Staff.{0,20}Members?\\b|\\bPortfolio.{0,20}Managers?\\b|\\bManager.{0,20}Portfolios?\\b|\\bPractice.{0,20}Lead\\w*\\b|\\bLead.{0,20}Practice\\w*\\b|\\bPractice.{0,20}Managers?\\b|\\bManager.{0,20}Practices?\\b|\\bPrincip.{0,20}Engineer\\w*\\b|\\bEngineer.{0,20}Princip\\w*\\b|\\bProduct.{0,20}Architects?\\b|\\bArchitect.{0,20}Products?\\b|\\bProduct.{0,20}Lead\\w*\\b|\\bLead.{0,20}Product\\w*\\b|\\bProduct.{0,20}Managers?\\b|\\bManager.{0,20}Products?\\b|\\bProgram & Project.{0,20}Managers?\\b|\\bManager.{0,20}Program & Projects?\\b|\\bProgram&Project.{0,20}Managers?\\b|\\bManager.{0,20}Program&Projects?\\b|\\bProgram.{0,20}Lead\\w*\\b|\\bLead.{0,20}Program\\w*\\b|\\bProgram.{0,20}Managers?\\b|\\bManager.{0,20}Programs?\\b|\\bProject.{0,20}Engineers?\\b|\\bEngineer.{0,20}Projects?\\b|\\bProject.{0,20}Lead\\w*\\b|\\bLead.{0,20}Project\\w*\\b|\\bProject.{0,20}Managers?\\b|\\bManager.{0,20}Projects?\\b|\\bSenior.{0,20}Managers?\\b|\\bManager.{0,20}Seniors?\\b|\\bSftw.{0,20}Architects?\\b|\\bArchitect.{0,20}Sftws?\\b|\\bSoftware.{0,20}Architects?\\b|\\bArchitect.{0,20}Softwares?\\b|\\bSolution.{0,20}Architects?\\b|\\bArchitect.{0,20}Solutions?\\b|\\bStaff.{0,20}Engineers?\\b|\\bEngineer.{0,20}Staffs?\\b|\\bStrategic.{0,20}Leads?\\b|\\bLead.{0,20}Strategics?\\b|\\bSupervis\\w*\\b|\\bSystem.{0,20}Architects?\\b|\\bArchitect.{0,20}Systems?\\b|\\bTeam.{0,20}Lead\\w*\\b|\\bLead.{0,20}Team\\w*\\b|\\bTech.{0,20}Lead\\w*\\b|\\bLead.{0,20}Tech\\w*\\b|\\bTech.{0,20}Staff\\b|\\bStaff.{0,20}Tech\\b', 'i')
    },
    {
      name: 'Senior Specialist',
      minExp: 5 * YEAR_IN_MILLISECONDS
    },
    {
      name: 'Specialist',
      minExp: 2 * YEAR_IN_MILLISECONDS,
      maxExp: 5 * YEAR_IN_MILLISECONDS
    },
    {
      name: 'Junior Specialist',
      maxExp: 2 * YEAR_IN_MILLISECONDS
    }
  ],
  educations: [
    {
      name: 'PhD',
      regex: new RegExp('P\.?h\.?D\.?|\\bDoctor\\b|Doctor of\\b', 'i')
    },
    {
      name: 'Master',
      regex: new RegExp('^M\.? ?E\.?$|^MSc$|M\.Eng|^M\.?S\.? ?Eng|\\bMaster\\b', 'i')
    },
    {
      name: 'Bachelor',
      regex: new RegExp('^B\. ?E\.?$|^B\. Eng|\\bB. ?I. ?T\\b|\\bB\.?Comp\.?Sc\.?|\\bBachelor\\b', 'i')
    }
  ],
  extensionParsing: {
    // For testing the parse server running locally from data-miner-server directory.
    // parseURL: 'http://localhost:3000/api/parse',
    parseURL: 'https://saasufy.com/insnare/api/parse',
    aiRatePersonURL: 'https://saasufy.com/insnare/api/ai/rate-person',
    aiRateCompanyURL: 'https://saasufy.com/insnare/api/ai/rate-company',
    aiComputeCategoryEmbeddingsURL: 'https://saasufy.com/insnare/api/ai/compute-category-embeddings',
    headers: {
      clientVersionSelector: 'meta[name="serviceVersion"]',
      clientVersionAttributeName: 'content',
      fallbackClientVersion: '1.13.40773',
      values: {
        'accept': 'application/vnd.linkedin.normalized+json+2.1',
        'accept-language': 'en-US,en;q=0.9',
        'priority': "u=1, i",
        'sec-ch-prefers-color-scheme': 'light',
        'x-restli-protocol-version': '2.0.0',
        'x-li-pageforestid': '$x-li-pageforestid',
        'x-li-traceparent': '$x-li-traceparent',
        'x-li-tracestate': '$x-li-tracestate',
        'x-li-track': '$x-li-track'
      }
    },
    params: {
      companyURL: 'https://www.linkedin.com/company/{{company_id}}',
    },
    endpoints: {
      company: {
        type: 'html-object',
        settings: {}
      },
      companyIdFromUniversalName: {
        type: 'json-array',
        settings: {
          requestURL: 'https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(universalName:{{universal_name}})&queryId=voyagerOrganizationDashCompanies.148b1aebfadd0a455f32806df656c3c1',
          pageInstanceId: 'd_flagship3_company_posts'
        }
      },
      companyIdFromName: {
        type: 'json-array',
        settings: {
          requestURL: 'https://www.linkedin.com/voyager/api/graphql?variables=(start:0,count:1,origin:SWITCH_SEARCH_VERTICAL,query:(keywords:{{company_name}},flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:resultType,value:List(COMPANIES))),includeFiltersInResponse:false))&queryId=voyagerSearchDashClusters.c0f8645a22a6347486d76d5b9d985fd7',
          pageInstanceId: 'd_flagship3_search_srp_all'
        }
      },
      companyEmployees: {
        type: 'json-array',
        settings: {
          basicRequestURL: 'https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(start:{{start}},origin:FACETED_SEARCH,query:(flagshipSearchIntent:ORGANIZATIONS_PEOPLE_ALUMNI,queryParameters:List((key:currentCompany,value:List({{company_ids}})),(key:resultType,value:List(ORGANIZATION_ALUMNI))),includeFiltersInResponse:true),count:{{count}})&queryId=voyagerSearchDashClusters.95320680745fac26b18ba5d78fdd267d',
          advancedRequestURL: 'https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(start:{{start}},origin:FACETED_SEARCH,query:(keywords:{{keywords}},flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:currentCompany,value:List({{company_ids}})),(key:industry,value:List({{industry_ids}})),(key:network,value:List(F,S,O)),(key:resultType,value:List(PEOPLE))),includeFiltersInResponse:false),count:{{count}})&queryId=voyagerSearchDashClusters.ed237181fcdbbd288bfcde627a5e2a07',
          sanitizeURLRegex: 'keywords:,',
          sanitizeURLReplaceWith: '',
          pageInstanceId: 'companies_company_people_index'
        }
      },
      companyProfile: {
        type: 'html-json-array',
        settings: {
          requestURL: 'https://www.linkedin.com/company/{{company_id}}/about/?viewAsMember=true',
          pageInstanceId: 'd_flagship3_company'
        }
      },
      person: {
        type: 'json-array',
        settings: {
          requestURL: 'https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(vanityName:{{public_id}})&queryId=voyagerIdentityDashProfiles.ee32334d3bd69a1900a077b5451c646a',
          pageInstanceId: 'd_flagship3_profile_view_base'
        }
      },
      personProfile: {
        type: 'json-array',
        settings: {
          requestURL: 'https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(profileUrn:{{profile_urn}})&queryId=voyagerIdentityDashProfileCards.55af784c21dc8640b500ab5b45937064',
          pageInstanceId: 'd_flagship3_profile_view_base'
        }
      },
      // skill: {
      //   type: 'json-array',
      //   settings: {
      //     requestURL: 'https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(profileUrn:{{profile_urn}},sectionType:skills,locale:en_US)&queryId=voyagerIdentityDashProfileComponents.84f39294e53f2af3ef885b07cdc744b4',
      //     pageInstanceId: 'd_flagship3_profile_view_base'
      //   }
      // },
      // education: {
      //   type: 'json-array',
      //   settings: {
      //     requestURL: 'https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(profileUrn:{{profile_urn}},sectionType:education,locale:en_US)&queryId=voyagerIdentityDashProfileComponents.84f39294e53f2af3ef885b07cdc744b4',
      //     pageInstanceId: 'd_flagship3_profile_view_base'
      //   }
      // },
      // job: {
      //   type: 'json-array',
      //   settings: {
      //     requestURL: 'https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(profileUrn:{{profile_urn}},sectionType:experience,locale:en_US)&queryId=voyagerIdentityDashProfileComponents.84f39294e53f2af3ef885b07cdc744b4',
      //     pageInstanceId: 'd_flagship3_profile_view_base'
      //   }
      // },
      industryIds: {
        type: 'json-array',
        settings: {
          requestURL: 'https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(keywords:{{keywords}},query:(),type:INDUSTRY)&queryId=voyagerSearchDashReusableTypeahead.35c83322e303eeb7ced9eb48e83a165c',
          pageInstanceId: 'd_flagship3_search_srp_all'
        }
      }
    }
  }
};
