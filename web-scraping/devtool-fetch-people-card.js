async function fetcher(params) {
  const { start, count, company_ids } = params;
  const res = await fetch(
    `https://www.linkedin.com/voyager/api/graphql?variables=(start:${
      start ?? 0
    },origin:FACETED_SEARCH,query:(flagshipSearchIntent:ORGANIZATIONS_PEOPLE_ALUMNI,queryParameters:List((key:currentCompany,value:List(${
      company_ids?.toString() ?? ""
    })),(key:resultType,value:List(ORGANIZATION_ALUMNI))),includeFiltersInResponse:true),count:${
      count ?? 20
    })&queryId=voyagerSearchDashClusters.95320680745fac26b18ba5d78fdd267d`,
    {
      headers: {
        accept: "application/vnd.linkedin.normalized+json+2.1",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "csrf-token": `ajax:${
          /ajax\:(?<csrf_token>\d+)/.exec(document.cookie).groups.csrf_token
        }`,
        priority: "u=1, i",
        "sec-ch-prefers-color-scheme": "dark",
        "sec-ch-ua":
          '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-li-lang": "en_US",
        "x-li-page-instance":
          "urn:li:page:d_flagship3_company;PkuKoDlZRmC9x8r5EFGUcQ==",
        "x-li-pem-metadata":
          "Voyager - Organization - Member=organization-people-card",
        "x-li-track":
          '{"clientVersion":"1.13.33185","mpVersion":"1.13.33185","osName":"web","timezoneOffset":11,"timezone":"Australia/Sydney","deviceFormFactor":"DESKTOP","mpName":"voyager-web","displayDensity":1.5,"displayWidth":5160,"displayHeight":2160}',
        "x-restli-protocol-version": "2.0.0",
      },
      referrer: "https://www.linkedin.com/company/plentiau/people/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    },
  );
  const content = await res.json();
  console.log("content", content);
}
fetcher({ start: 24, count: 20, company_ids: [18944742] });
