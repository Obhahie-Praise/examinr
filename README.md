# Examinr AI
Examinr AI was created as my way of helping students prep for and succeed in their external examinations. I also made it to give students a completely zero-cost platform where they can access and grind on past questions, syllabus notes, educational games, online challenges and other learning materials.

Examinr will also give schools a better way to get involved in the preparation of their students. Schools using Examinr will be able to analyse their students level of preparedness, provide learning materials and organise mock examinations to help students prepare better.

The business model for examinr was born from a single idea which was 'students should not have to pay to access quality educational resources'. So I designed the platform to generate revenue from schools that can easily afford educational software. This way, schools help keep the platform alive while students get to use examinr completely for free.

## Overview

I made examinr to help Nigerian secondary school students prepare for external examinations, completely for free.

Its is mainly for students in examination classes, JSS 3 and SS 3, who are preparing for examinations like WAEC, NECO, BECE and JAMB.

One of the problems I want examinr to solve is the cost to getting your hands on good examination prep materials. I acknowledge that there are already several good educational platforms available, but you have to pay for them and its not smth every student can conveniently afford.

I too have experienced money issues that made it impossible to ask my parents to buy extra learning materials because I didn't know how they would react. That made me think about other students who might be facing similar problems.

From that experience, the idea for examinr was born: a platform that gives students access to the resources that they need to prepare, regardless of their financial situation. Not just students who cannot afford paid alternatives, but even those who just want a better way to learn.

Ultimately, I want examinr to make good, sensible examination preparation better accessible to everyone.

## My approach

Examinr is meant to make existing educational resources easier to access, understand and use.

The platform will use publicly available past question resources and APIs provided by examination bodies, bringing them together in one place. I hope this makes it easy for students to practice past questions, find learning materials like notes and keep track of their progress.

But I don't want Examinr to be another platform where students go to answer past questions. I want it to become a more complete learning site where students can practice, know their weaknesses, understand hard concepts like calc, challenge themselves and others and see how they are getting better over time.

To be completely honest, I know there are already many good examination prep platforms out there. But smth that makes them 'not the right fit' is the cost. Paying for software can become another expense, especially when students already have other things to spend money on.

What makes Examinr different is how I am going to approach accessibility and sustainability. I want students to be able to learn without worrying about costs.

I also plan integrate AI into the learning. Instead of just leaving students to figure everything out on their own, I want them to be able to ask questions, get good and understandble explanations when they are stuck and receive actual help understanding topics they find difficult.

## Planned features

### Student learning

- **Past questions:** Students will be able to access past questions from different examination bodies, subjects, topics and years.
- **AI assisted learning:** An AI assistant that students can interact with when they need help. They can ask questions, get explanations for answers and get help understanding topics they find difficult.
- **Notes:** Notes and other learning materials based on the relevant examination syllabuses. This should make it easier to know what to read and what topics to cover.
- **Games:** I want to include games that make learning more fun.
- **Challenges:** Challenges across different subjects where students can test what they know and compete with other students.
- **Roadmaps:** I want to provide roadmaps that show students what to study and the topics they should pay attention to.
- **Progress tracking:** Students should be able to see how they are doing, the questions they've answered, topics they need to work on and how much they've improved.
- **Leader boards:** So students can how they rank against others.

### School management

- **Student analytics:** Schools should be able to see how prepared their students are for their examinations.
- **Mock examinations:** Schools will be able to organise mock examinations for their students directly on Examinr and use the results to see how well they are doing.
- **Resource sharing:** Teachers and schools can upload learning materials and make them available to their students.
- **Student management:** Schools will have a way to manage the students using Examinr and track their activity on the platform.

### AI infrastructure

- **AI model integration:** I'm using Google's Gemini models for the AI features on Examinr. This will allow students to ask questions, get explanations and receive help with topics they don't understand.
- **AI request router:** One problem with using free AI API quotas is that you can easily run out of requests. I plan to build a router that distributes requests across my different Gemini API keys and projects. This should help me get the most out of the available quota and stop interruptions when they of them runs out.

## How it Works

Examinr was created as a monorepo that contains a student-facing web application and a separate cloudflare worker (hono) for the API service.

The web application is for the user experience, while the API is for backend operations, and communication with external services.

I decide to separate the API from the frontend instead of putting all backend stuff inside the web application. This gives me more control over the backend and allows me to take advantage of Cloudflare's platform capabilities (espiecially realtime and schedule events).

The API is built with Hono and deployed as a cloudflare worker. Cloudflare durable objects gives me a way to implement stateful and realtime functionality, while scheduled events and cron triggers allow background jobs

The architecture is intended to support features such as mock examinations, school operations, AI requests, scheduled tasks and other services that may be introduced as the platform grows.

### The AI router

AI is an big part of the examinrs learning experience, but relying on one API key will create an envitable problem: API quotas.

To address this, I have a plan to implement an AI router that can split requests across my different available Gemini API keys and projects.

The idea is to maximize quotas, handle quota related errors/failures and provide a more reliable AI experience for students.

### Educational resources and external API(s)

Examinr will make publicly available educational resources and APIs where possible.

I am just starting out, so dont to see here just yet actually.

## Technology stack

The project uses the following technologies:

| Technology | Purpose |
|---|---|
| Next.js | Used to build the web application for students and schools. |
| TypeScript | Used throughout the project to write the application logic and catch type-related errors. |
| Hono | Handles the backend API and communication between the frontend and backend. |
| Cloudflare Workers | Runs and hosts the backend API. |
| Cloudflare D1 | Stores application data in a relational database. |
| Cloudflare Durable Objects | Handles features that need to maintain state or support real-time communication. |
| Cloudflare Cron Triggers | Runs scheduled tasks and other recurring backend operations. |
| UploadThing | Handles file uploads and storage for learning resources and other uploaded files. |
| Google Gemini | Powers the AI features, including learning assistance and explanations. |

## How to run examinr locally

Ofcourse you are going to need [Node.js](https://nodejs.org/), [pnpm](https://pnpm.io/) and Git installed on your device.

### Clone the repository

```sh
git clone https://github.com/Obhahie-Praise/examinr
cd examinr
```

### Install the dependencies

Examinr uses pnpm, so install the packages from the project root.

```sh
pnpm install
```

### Set up your environment variables

There are two environments; web and api. So you'll need to config for both

**For the API (`apps/api/.env`):**

```env
APP_ENV=development

BETTER_AUTH_SECRET=your_secret_here
BETTER_AUTH_URL=http://localhost:8787

GOOGLE_CLIENT_ID=google_client_id
GOOGLE_CLIENT_SECRET=google_client_secret

APP_URL=http://localhost:3000

UPLOADTHING_TOKEN=your_uploadthing_token
GEMINI_API_KEY=your_gemini_api_key
```

**For the web (`apps/web/.env`):**

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8787
```

You're gonna need your own API keys for uploadthing and gemini.

You can get them here:

- [Google AI Studio](https://aistudio.google.com/apikey)
- [UploadThing](https://uploadthing.com/)

For the `BETTER_AUTH_SECRET`, just generate a secure random secret for the terminal

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Run the servers

You'll need to run the frontend and API separately.

**Run the API:**

```sh
pnpm --filter ./apps/api dev
```

The API can be seen on `http://localhost:8787`.

**Run the web:**

```sh
pnpm --filter ./apps/web dev
```
**Or just run the start the servers from the root:**
```sh
pnpm dev
```


The web application should be available at `http://localhost:3000`.

And just about it. You should now have Examinr running locally

### Building the project

To build the applications, run the following from the project root:

```sh
pnpm build
```