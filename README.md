# Examinr AI

> Examinr AI is my contribution towards helping students prepare for and succeed in external examinations. I created the project with the intention of making it a completely zero-cost platform where students can access and absorb past questions, syllabus notes, educational games, online challenges and other learning materials.
>
> Examinr also aims to give schools a better way to get involved in the examination preparation of their students. Schools using Examinr should be able to analyse their students' level of preparedness, provide learning materials and organise mock examinations to help students prepare more effectively.
>
> My business model for Examinr is built around a simple principle: **students should not have to pay to access quality educational resources.** Instead, the platform is designed to generate revenue from schools that can conveniently afford educational software. This way, schools help sustain the platform while students get to use Examinr entirely for free.

## Overview

Examinr is a platform designed to help Nigerian secondary school students prepare for external examinations, completely free of charge.

The platform is primarily intended for students in examination classes, particularly JSS 3 and SS 3, who are preparing for examinations such as WAEC, NECO and JAMB.

One of the problems I want Examinr to address is the financial barrier to accessing quality examination preparation materials. There are already several good educational platforms available, but some require subscriptions or recurring payments that not every student can conveniently afford.

I personally experienced financial setbacks that made it difficult to ask my parents to purchase additional learning materials because I was uncertain about the response I might receive. That experience made me think about other students who might be facing similar circumstances.

From that experience, the idea for Examinr was born: a platform that gives students access to the resources they need to prepare, regardless of their financial circumstances. Not just students who cannot afford paid alternatives, but even those who simply want a better way to learn.

Ultimately, I want Examinr to make quality examination preparation more accessible to everyone.

## My approach

Examinr is built around making existing educational resources easier to access, understand and use.

The platform intends to make use of publicly available past-question resources and APIs provided by examination-related organisations, where their availability and licensing permit, and present them through a seamless interface that makes practising questions and tracking progress easier.

Rather than simply providing students with a collection of questions, I want Examinr to become a more complete learning environment. Students should be able to practise, identify their weaknesses, understand difficult concepts, challenge themselves and monitor their improvement over time.

To be completely upfront, there are already several good examination preparation platforms available. However, one of the things that makes some of them inaccessible to me and other students is their pricing. The cost of accessing educational software can become a recurring burden, especially when students have several other educational expenses.

What makes Examinr different is its approach to accessibility and sustainability. I want students to have the freedom to learn without worrying about subscriptions, while schools that can afford the software help support the platform financially.

I also intend to integrate AI into the learning experience, making it possible for students to receive explanations, understand challenging concepts and get additional learning assistance when they need it.

## Planned features

### Student Learning

- **Past Questions:** Access to examination past questions, organised by subject, topic, examination body and year.
- **AI-Assisted Learning:** An AI learning assistant that helps students understand difficult concepts, explain answers and explore topics beyond simply memorising them.
- **Syllabus Notes:** Accessible learning materials organised around relevant examination syllabuses.
- **Educational Games:** Fun, bite-sized learning experiences that make studying more engaging.
- **Online Challenges:** Subject-based challenges that encourage students to test their knowledge.
- **Learning Roadmaps:** Structured learning paths that help students understand what to study and what to prioritise.
- **Progress Tracking:** Tools that help students monitor their performance, identify weaknesses and understand their improvement over time.
- **Leaderboards:** Friendly competition that gives students additional motivation to practise and improve.

### School Management

- **Student Performance Analytics:** Allow schools to understand how prepared their students are, identify weak subjects and monitor academic progress.
- **Mock Examinations:** Enable schools to create and organise mock examinations for their students.
- **Learning Resource Sharing:** Allow schools and teachers to provide students with relevant educational materials.
- **Student Management:** Give schools a centralised way to manage participating students and their learning activities.

### AI Infrastructure

- **AI Model Integration:** Use Google's Gemini models to power the AI-assisted learning experience.
- **AI Request Router:** A routing system intended to distribute AI requests across available Gemini API keys and projects, making better use of available quotas and reducing the likelihood of interruptions when individual quotas are exhausted.

## How It Works

Examinr is structured as a monorepo that contains a student-facing web application and a separate API service.

The web application is responsible for the user experience, while the API handles the backend operations, data access and communication with external services.

I made the decision to separate the API from the frontend rather than putting all backend functionality inside the web application. This gives me more control over backend infrastructure and allows me to take advantage of Cloudflare's platform capabilities (espiecially realtime and schedule events).

The API is built with Hono and deployed as a cloudflare worker. Cloudflare durable objects provide a way to implement stateful and real-time functionality, while scheduled events and cron triggers allow background operations to run without requiring a continuously running server.

The architecture is intended to support features such as mock examinations, school operations, AI requests, scheduled tasks and other services that may be introduced as the platform grows.

### The AI Router

AI is an important part of the Examinr learning experience, but relying on a single API key introduces a potential limitation: API quotas.

To address this, I intend to implement an AI request router that can distribute requests across multiple available Gemini API keys and projects.

The idea is to make better use of available quotas, handle quota-related failures and provide a more reliable AI experience for students.

This is not intended to bypass provider restrictions or usage limits. Each API key and project must operate within the applicable provider terms and quotas.

### Educational Resources and External APIs

Examinr intends to integrate publicly available educational resources and APIs where possible.

The goal is to reduce the cost and complexity of making examination materials available to students while ensuring that the resources used are properly attributed and their licensing conditions are respected.

Some of the APIs and resources considered for the platform are open-source or available under licences that permit commercial use.

## Technology Stack

The project uses the following technologies:

| Technology | Purpose |
|---|---|
| Next.js | Frontend framework for the student and school-facing web application. |
| TypeScript | Application logic and type safety across the project. |
| Hono | Lightweight API framework used for the backend service. |
| Cloudflare Workers | Serverless runtime and deployment platform for the API. |
| Cloudflare D1 | Relational database for application data. |
| Cloudflare Durable Objects | Stateful backend functionality and real-time features. |
| Cloudflare Cron Triggers | Scheduled and recurring backend operations. |
| UploadThing | File and object storage for uploaded resources. |
| Google Gemini | AI capabilities for learning assistance and explanations. |

## Project Philosophy

There are a few principles I want Examinr to remain committed to as it develops.

**1. Education should be accessible.**

A student's financial circumstances should not determine whether they can access useful examination preparation resources.

**2. Free does not mean low quality.**

Making Examinr free for students should not mean compromising the quality of its learning experience. I want the platform to be genuinely useful, reliable and easy to use.

**3. Schools should be part of the solution.**

Schools are in a position to make a significant difference in how students prepare for examinations. Examinr should give them the tools to participate more actively in that process.

**4. Technology should solve actual problems.**

Every feature should have a reason to exist. I don't want Examinr to become a collection of impressive technologies that do little to improve the student's learning experience.

**5. Sustainability matters.**

A platform that intends to provide free access to students must have a way to sustain its operations. The school-focused business model is my approach to making that possible.

## What I Hope to Achieve

I want Examinr to become more than another examination preparation website.

My goal is to create an educational platform that students can depend on throughout their preparation, one that helps them practise, understand, improve and approach their examinations with greater confidence.

I also hope to give schools better insight into their students' academic preparedness and provide them with practical tools to improve examination outcomes.

Most importantly, I want to build something that makes a genuine difference to students who might otherwise have limited access to these resources.

**Quality education should not be a privilege reserved for those who can afford it.**

---

*Examinr AI — Making examination preparation accessible to everyone.*