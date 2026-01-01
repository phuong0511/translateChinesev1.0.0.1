# Copilot Instructions for AI Agents

## Project Overview
Classical Chinese Historical Novel Translator—a React (TypeScript) web app for translating Chinese novels to Vietnamese using Gemini 2.5 Flash API. Built with Vite + Tailwind CSS, Firebase Firestore for persistence, and localStorage fallback.

## Critical Architecture Patterns

### Gemini API: Two-Mode System
`geminiService.ts` has **unified `translateText()` with mode selection**:
- **`mode: 'translate'`** (default): Full translation pipeline
  - Injects "Fixed Profile" (character names/pronouns) + "Dynamic Context" (relationships, setting)
  - Uses **Gemini 2.5 Flash** (not Pro—quota efficiency on free tier)
  - Prompt: `[THÔNG TIN HỒ SƠ & NGỮ CẢNH] → [VĂN BẢN GỐC CẦN DỊCH]`
  - Returns translated Vietnamese text only
- **`mode: 'analyze'`** (context extraction): Lightweight analysis
  - Same Flash model, low temp (0.3) for factual extraction
  - Extracts character mentions, tones, plot hints from raw input
  - Used by "Soi Context" button to auto-populate context fields

### Novel/Project State Management
- **Per-novel state stored as `Novel` type** (see `database.schema.ts#Novel`)
- Each novel has:
  - `fixedProfile`: String of character names + pronouns rules (editable in modal)
  - `history`: Translation versions with timestamps
  - `contextNotes`: Dynamic context about relationships, settings
- Firebase Firestore collections: `users`, `novels`, `chapters`, `translations`, `static_profiles`, `dynamic_contexts` (see `FIREBASE_SETUP.md`)
- **Security Rules** enforce: user owns their novels, context/profiles public-readable but user-writable only

### Translation Workflow (TranslationArea.tsx)
1. User pastes raw Chinese → `inputText` state
2. Click "Soi Context" → calls `translateText(text, prompt, 'analyze')` → updates context fields
3. Click "Dịch Ngay" → combines fixed profile + dynamic context → calls `translateText(text, combined, 'translate')`
4. Output split: first line as **chapter title** (bold), rest as body
5. Modal-based review: shows diff between old/new, toggle preview/edit

## Key Files & Structure
- **`components/TranslationArea.tsx`** (890 lines): Main workspace, state management, translation/analysis logic, modals (profile, review, new novel)
- **`services/geminiService.ts`**: Unified `translateText()` with mode switching, error handling
- **`services/firebaseService.ts`**: DatabaseService class—CRUD for novels, chapters, users, profiles, contexts
- **`services/authService.ts`**: Firebase Auth + Firestore user sync (auto-creates user in DB on first login)
- **`database.schema.ts`**: TypeScript interfaces (User, Novel, Chapter, Translation, Genre, StaticProfile, DynamicContext)
- **`contexts/ThemeContext.tsx`**: Dark mode provider (defaults to 'dark', toggles via localStorage)
- **`.env.local`**: `VITE_GEMINI_API_KEY`, Firebase config (API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID)

## Developer Workflows
- **Run locally:** `npm install` → `npm run dev` (Vite on `http://localhost:5173`)
- **Build:** `npm run build` (outputs `dist/`)
- **Deploy:** `npm run deploy` (runs build, then `gh-pages -d dist` to GitHub Pages branch)
- **Debugging API issues:**
  - Check Gemini quota/key in console (Network tab)
  - Firebase errors: Check Firestore security rules + auth state
  - Check `.env.local` is loaded (restart dev server if added/changed)

## Patterns & Conventions
- **Modal-based UX:** Profile edits, novel creation, context review all use fixed-overlay modals (`isOpen` state triggers render)
- **Tailwind theming:** `dark:` prefix for dark mode, color palette uses stone-* + red-* accents
- **Accessibility:** All inputs have explicit `<label>` or `aria-label`; lists use semantic `<ul>`/`<li>`
- **Vietnamese content:** Comments, UI, error messages in Vietnamese
- **React patterns:** Hooks (useState, useContext, useCallback), debounce from lodash for search
- **Character profile format:** Plain text with rules like "Main: Ta (internal), Hắn (narrative); Enemy: Gã; Female: Nàng"—AI parses from this string

## Integration Points
- **Gemini 2.5 Flash API:** Translation (`mode: 'translate'`) and context analysis (`mode: 'analyze'`)
- **Firebase Firestore:** User auth, novel/chapter/translation persistence, genre/profile references
- **Firebase Auth:** Email/password + future OAuth support (see `OAUTH_SETUP.md`)
- **localStorage:** Theme, temp drafts (not primary state)
- **lucide-react:** Icon components (FileText, Languages, Sparkles, etc.)
- **react-markdown:** Rendering translations with custom styling

## Common Tasks
- **Add new Gemini model:** Update `geminiService.ts`, expose toggle in UI (check `README.md` for deprecation note on older models)
- **Change translation prompt:** Edit `SYSTEM_INSTRUCTION` in `constants.ts` or inject context differently in `translateText()` call
- **Add context extraction rule:** Modify `mode: 'analyze'` prompt logic in `geminiService.ts` to parse/return structured data
- **Styling updates:** Edit Tailwind classes in component JSX; check `tailwind.config.js` for custom values (colors, fonts)
- **Firebase schema changes:** Update `database.schema.ts` interfaces + corresponding CRUD methods in `firebaseService.ts`

## Known Limitations & Notes
- Gemini uses **Flash model only** (not Pro) for cost/quota; context analysis is lightweight (0.3 temp)
- Character profile is **string-based, not structured**—AI reads prose format, add parser if JSON structure needed
- Translations are **not real-time synced** between browser tabs (no WebSocket/Realtime DB)
- GitHub Pages deployment requires `base: '/repo-name/'` in `vite.config.ts` (set to `/classical-chinese-novel/`)

---
See `README.md`, `FIREBASE_SETUP.md`, `GITHUB_PAGES_DEPLOY.md` for additional setup steps. Keep these instructions updated as architectural decisions evolve.
