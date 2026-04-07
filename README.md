# CrawlKeep

An open-source data crawling and intelligence platform that lets you crawl, classify, and analyze people and company data. Customize crawling processes without coding, create custom tags and classifications using generative AI, and gain insights through AI-driven analytics.

Thanks to its revolutionary [Saasufy](https://saasufy.com) backend, CrawlKeep is open and flexible unlike any other platform of its kind. You can either set up your own fully isolated instance/distro with its own accounts, schema and data from scratch or you can opt in to share everything with the main CrawlKeep distro and community.

You should think about which aspect you want differentiate yourself on; the crawling, the keeping or both?
For example, your distro could end up having a very different crawling mechanism and UI but it could be hooked into the main/shared CrawlKeep backend and tapping into existing accounts and data; potentially sharing that data with other trusted distros... Or your distro could have the same crawling mechanism and UI as the main CrawlKeep distro but its data would be fully isolated into a separate Saasufy instance... Or you can do both!

## Built for the AI coding era

Because CrawlKeep is a frontend-only application with a fully managed backend, the entire product surface is ordinary HTML, CSS, and JavaScript — exactly the kind of code that AI coding tools excel at generating and modifying. This means anyone, regardless of technical skill, can use tools like [Claude Code](https://docs.anthropic.com/en/docs/claude-code) to reshape the UI, add dashboards, build new workflows, or create an entirely new distro without ever touching backend infrastructure, writing database migrations, or worrying about security vulnerabilities in server-side code. The backend handles authentication, data storage, real-time communication, and AI scoring so you can focus entirely on making the product your own.

## Features

- Crawl and store people and company profiles
- AI-powered classification and tagging
- Custom tag taxonomies
- Analytics dashboards (people, company, network, competitive intelligence)
- Data export and import (including Excel)
- Chrome extension for on-page data capture
- Google OAuth authentication

## Architecture

CrawlKeep is a frontend-only application that connects to a [Saasufy](https://saasufy.com) backend for data storage and real-time communication. You do not need to create or operate your own backend server. By default, the app hooks into the main Saasufy backend.

If you want full control over your own data and collections, you can create a free account on [saasufy.com](https://saasufy.com), then go to the **Models** section of the control panel and import the `saasufy-schema-latest.json` file included in this repo. This will set up all the required data models and collections for your own instance.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended) — used to run the HTTP server. Alternatively, any other HTTP server can be used (e.g. [Nginx](https://nginx.org/), [Apache](https://httpd.apache.org/), or [Caddy](https://caddyserver.com/))
- [Git](https://git-scm.com/) — to clone the repository
- A [Google Cloud](https://console.cloud.google.com/) project with OAuth 2.0 credentials

## Setup

### 1. Clone the repository

```sh
git clone https://github.com/jondubois/crawlkeep.git
cd crawlkeep
```

### 2. Serve the frontend

Serve the `public/` directory on port 8081 using any HTTP server. For example, using [http-server](https://www.npmjs.com/package/http-server):

```sh
npx http-server public -p 8081
```

The app will be available at `http://localhost:8081/app/`.

### 3. Set up Google OAuth

CrawlKeep uses Google OAuth for user authentication. You need to create OAuth 2.0 credentials in the Google Cloud Console and configure the correct redirect URIs.

#### Create OAuth credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to **APIs & Services > Credentials** ([direct link](https://console.cloud.google.com/apis/credentials)).
4. Click **Create Credentials > OAuth client ID**.
5. Select **Web application** as the application type.
6. Under **Authorized redirect URIs**, add the redirect URI that matches your setup. For example, if you're serving on port 8081:
   ```
   http://localhost:8081/app/oauth.html
   ```
   For production, add your domain-based URI as well (e.g. `https://yourdomain.com/app/oauth.html`).
7. Click **Create** and note your **Client ID**.

For more details, see the [Google OAuth 2.0 documentation](https://developers.google.com/identity/protocols/oauth2) and the [Setting up OAuth 2.0 guide](https://support.google.com/cloud/answer/6158849).

#### Configure the consent screen

Before users can authenticate, you also need to configure the OAuth consent screen:

1. Go to **APIs & Services > OAuth consent screen** ([direct link](https://console.cloud.google.com/apis/credentials/consent)).
2. Choose **External** (or **Internal** if using Google Workspace).
3. Fill in the required app information and save.

See the [OAuth consent screen documentation](https://developers.google.com/identity/protocols/oauth2/openid-connect#consentpageexperience) for more details.

#### Update the config

Open `public/app/config.js` and replace the `clientId` and `redirectURI` values under the `dev` and/or `prod` keys with your own:

```js
dev: {
  oauth: {
    google: {
      redirectURI: 'http://localhost:8081/app/oauth.html',
      clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com'
    }
  }
},
```

Make sure the `redirectURI` here matches exactly what you entered in the Google Cloud Console.

### 4. Set up your own Saasufy backend (optional)

By default, CrawlKeep connects to the shared Saasufy backend, which includes the parsing and AI scoring endpoints. It is recommended that you use the defaults.

If you want your own isolated instance with full control over your data:

1. Create an account at [saasufy.com](https://saasufy.com).
2. Open the **Models** section in the Saasufy control panel.
3. Import the `saasufy-schema-latest.json` file from the root of this repo. This creates all the required data models and collections.
4. Update the WebSocket URL in `public/app/index.html` and `public/app/oauth.html` to point to your own Saasufy service ID.

You can also use [Claude Code](https://docs.anthropic.com/en/docs/claude-code) with the [Saasufy skills marketplace](https://github.com/Saasufy/skills) to help you set up and administer your Saasufy instance. Claude can be given direct access to your Saasufy control panel to add or modify your backend schema, access rules or to manipulate data directly.

## Project structure

```
public/             Frontend application (serve this directory)
  app/              Main SPA application
    config.js       OAuth and app configuration
    oauth.html      OAuth callback handler
chrome-extension/   Chrome extension for on-page data capture
```

## License

[MIT](LICENCE.txt)
