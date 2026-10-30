---
title: Decklify
summary:
  en: An AI presentation studio that turns prompts, documents, or old PPTX files into editable decks. I founded it, designed the system, and led the team to the PIMNAS 2026 finals.
  id: Studio presentasi AI yang mengubah perintah, dokumen, atau PPTX lama menjadi slide yang bisa disunting. Saya mendirikannya, merancang sistemnya, dan memimpin tim hingga final PIMNAS 2026.
role: { en: Founder & CEO, id: Pendiri & CEO }
year: 2026
tags: [Product, System Design, Generative AI, SaaS, Self-hosting]
metrics:
  - { value: "3", label: { en: months from idea to launch, id: bulan dari ide hingga daring } }
  - { value: "200", label: { en: concurrent generations with zero errors, id: generasi serentak tanpa galat } }
  - { value: "45", label: { en: "paid transactions in October 2026, mostly launch vouchers", id: "transaksi berbayar Oktober 2026, sebagian besar voucher peluncuran" } }
links:
  live: https://decklify.id
featured: true
order: 1
draft: false
---

## Problem
Making a presentation takes two skills at once, summarizing the content and designing the slides, and few people have both. In our market research with 38 respondents (mostly students), **92.1%** needed more than 30 minutes for a single presentation, and visual design was the hardest part (73.7%). Most already used several separate tools: one to summarize, another to design. Global tools charge monthly subscriptions in dollars and handle long Indonesian documents poorly.

## Approach
Decklify started as a national student entrepreneurship grant (PKM-K 2026) that I led as CEO of a five-person team, from 22 May to 3 October 2026. My part was the planning and the evaluation; our CTO wrote the code.

- **System design:** I designed the service architecture: a Next.js studio, a Go API, PostgreSQL, object storage, and an AI pipeline that drafts the sections and the story first, then applies a template, so a structured draft is ready in under 20 seconds. Users start from a short prompt, Markdown, PDF, DOCX, or an old PPTX, and export to PPTX and PDF that stay editable. Payments go through a local gateway (QRIS and virtual accounts) as prepaid credits in rupiah.
- **Infrastructure:** I assembled and run the company's own Debian 13 server, with Docker and a Cloudflare Tunnel so the server is never exposed directly. Owning the server keeps fixed costs at IDR 428,862 a month.
- **Evaluation:** I planned and ran the quality checks across 25 development iterations: a load test of 40 accounts each running 5 generations at once, two focus groups with experts, three validations with prospective users (including small business owners), five product trials, and a user questionnaire. Feedback went straight into the next iteration, for example the mobile layout and the generation history.
- **Business and legal:** I built the cost model and break-even analysis, wrote the proposal, progress and final reports, and the scientific article, kept the activity and finance logbook, and handled the business license (NIB), copyright registrations for the program and the logo, the trademark filing, and an agreement with the Universitas Gunadarma Business Incubator.

## Result
- **Live at decklify.id since 27 August 2026**, three months after the program started; more than 50 accounts and 100 decks by the end of the program.
- Load test: **200 concurrent generations with zero errors**, median queue time 3.06 seconds.
- Questionnaire (38 respondents): ease of use **8.39/10**, relevance 8.26/10, and **NPS +45**.
- **83.68% contribution margin** per paid package and break-even at 11 packages a month; **45 paid transactions** in October 2026, the first month with paying customers, mostly through a launch voucher campaign.
- The IDR 8,125,000 grant was 100% spent and reported, across 82 logged activities validated by the ministry. All required outputs were met, plus a user manual, two copyright certificates, a business license, and a trademark filing.
- Selected as a **finalist at PIMNAS 2026**, the national student science week.

## What I learned
- **Product:** turning an idea into something people use and pay for, from deciding what to build first to letting test results and user feedback shape the next iteration.
- **Leading without writing the code:** designing the system clearly enough that the team could build it, and checking the result with real tests instead of trusting a demo.
- **Running a business:** cost models and break-even, honest financial reporting, business licenses, and intellectual property.
