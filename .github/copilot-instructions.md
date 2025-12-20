# Copilot Instructions for AI Agents

## Project Overview
- This is a web app for translating and reviewing Chinese historical novels, built with React (TypeScript), Vite, and Tailwind CSS.
- The app uses Google Gemini API (2.5 Flash/Pro) for translation and context analysis.
- Data is managed locally (localStorage) and via Firebase for user/project persistence.
- The UI is optimized for both desktop and mobile, with modals for editing, review, and onboarding.

## Key Files & Structure
- `components/TranslationArea.tsx`: Main workspace, translation, context review, and output rendering logic.
- `services/geminiService.ts`: Handles all Gemini API calls, model selection, and prompt formatting.
- `services/firebaseService.ts`: (If present) Handles Firestore CRUD for user/project data.
- `contexts/ThemeContext.tsx`: Theme switching (dark/light mode).
- `.env.local`: API keys for Gemini and Firebase.
- `README.md`: Quickstart, features, and system instructions.

## Patterns & Conventions
- **Translation workflow:**
  1. User pastes raw Chinese text.
  2. App sends prompt to Gemini API (see `translateText` in `geminiService.ts`).
  3. Output is split into title and content for display.
  4. Context review uses a modal with change log and preview/edit toggle.
- **Accessibility:** All form elements must have labels or aria-labels. Lists must use `<ul>`/`<ol>` for `<li>`.
- **Styling:** Uses Tailwind classes. For production, use Tailwind as a PostCSS plugin (not CDN).
- **State:** Project/novel data is stored in localStorage as `my_novels`.
- **Modals:** All major edits (profile, settings, review) use modal overlays for better UX.
- **Markdown rendering:** Uses `react-markdown` with custom components for consistent style.

## Developer Workflows
- **Run locally:**
  - `npm install`
  - `npm run dev`
- **Deploy:**
  - `npm run deploy` (uses gh-pages for GitHub Pages)
- **API keys:**
  - Set `VITE_GEMINI_API_KEY` and Firebase keys in `.env.local`.
- **Debugging:**
  - Use browser console for API errors (quota, invalid key, etc).
  - Check for accessibility warnings in Edge/Chrome DevTools.

## Examples
- To add a new context review rule, update the prompt in `handleAnalyze` in `TranslationArea.tsx`.
- To change output formatting, edit the output rendering logic in `TranslationArea.tsx` (see how title/content are split).
- To add a new model, update `geminiService.ts` and expose a toggle in the UI if needed.

## Integration Points
- **Gemini API:** All translation and context analysis.
- **Firebase:** (Optional) For user/project persistence.
- **localStorage:** For offline/quick project state.

---
For more, see `README.md` and comments in key files. Please keep these instructions up to date as the project evolves.
