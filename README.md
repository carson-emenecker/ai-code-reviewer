# CodeReview AI

AI-powered code reviewer that catches bugs, security 
vulnerabilities, and suggests improvements.

## Live Demo
[Try it here](https://ai-code-reviewer-six-beige.vercel.app)

## Features
- AI code review powered by Claude (Haiku)
- Detects bugs, security issues, and improvements
- Severity ratings (low, medium, high, critical)
- Supports JavaScript, TypeScript, Python, C, C++, Java, Go, Rust
- Freemium — 3 free reviews/day, unlimited on Pro plan
- Auth via Supabase, payments via Stripe

## Tech Stack
- React 18 + Vite + Tailwind CSS
- Supabase (auth + database)
- Anthropic Claude API
- Stripe Checkout
- Vercel (deployment)

## Local Development
clone the repo, add .env.local with your keys, npm install, npm run dev
