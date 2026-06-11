# Product Document: AI Study Workflow System

## Documentation Map

Read these in order when you need current project context:

1. `docs/GUARDRAILS.md`
2. `docs/architecture.md`
3. `docs/tasks.md`
4. `docs/agents.md`
5. `docs/roadmap.md`

Current-state note:

- `docs/tasks.md` is the original phased plan.
- `docs/roadmap.md` is the current implementation and handoff snapshot.
- Use both together when deciding what is already built versus what was originally planned.

## Project Name
AI Study Workflow System

## The Problem
Students frequently experience cognitive overload from static materials such as textbooks, lecture slides, and long PDFs. Studying often feels passive, leading to low retention, disengagement, and inefficient use of time.

## The Solution
A streamlined platform that ingests static files (PDF, DOCX) and utilizes AI to transform them into interactive, engaging study workflows. The system automatically processes the material to generate concise summaries, active-recall flashcards, and multiple-choice quizzes to promote active, high-retention learning.

## Target Users
- University and college students
- High school students preparing for exams
- Lifelong learners and professionals digesting large documents

## Core Philosophy
- **Actionable > Passive:** Every feature must encourage the user to actively engage with the material rather than passively read it.
- **Zero Friction:** The user should be able to upload a document and start studying in seconds without complex configurations.
- **Minimalist UI:** Clean, distraction-free interfaces that prioritize the content and the study experience.

## MVP Scope Limits
To ensure a tight, deliverable MVP, the following constraints are strictly enforced:
- **Supported File Types:** PDF and DOCX only.
- **File Limits:** Maximum file size of 10MB, up to 50 pages per document.
- **Output Limits:** Exactly 1 Document Summary, 15 Flashcards, and a 10-Question Quiz per upload.
