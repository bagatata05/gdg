# 🍳 UlamGPT — Smart Tipid Filipino Chef Assistant

**UlamGPT** is a responsive, budget-friendly Filipino kitchen companion built for the Google Developer Groups (GDG) showcase. It solves the daily *"Ano ang ulam natin?"* question by generating delicious, cost-efficient recipes matching your budget, portion headcount, and available pantry items.

---

## ✨ Features

*   **Philippine Commodity Price Dictionary:** Calculates ingredient costs using real-world NCR wet market and supermarket benchmarks (e.g., canned sardines for ₱25, eggs for ₱9, cabbage for ₱35).
*   **Out-of-Pocket Cost Calculator:** Smarter budget checks! Any ingredients you already mark as owned are excluded from the calculated out-of-pocket budget, so you only see what you actually need to spend at the store.
*   **Gemini AI Real-Time Queries:** Uses the Google Generative AI SDK with the `gemini-3.5-flash` model to dynamically craft tailored recipes in JSON format.
*   **Fail-Safe Mock Engine:** If your API key is missing or fails, it switches to a smart local mock database. In mock mode, strict staple-matching ensures it only suggests recipes you have the key ingredients for.
*   **Integrated YouTube Tutorials:** Dynamically searches the YouTube Data API v3 for Tagalog tutorial videos matching each recipe and embeds them directly inside the card in a modal popup.
*   **Modern Carinderia Chic Design:** A beautiful HSL CSS layout featuring warm terracotta orange, banana leaf green, garlic gold, and cream backgrounds, responsive layouts, glassmorphism cards, and interactive cooking checklists.

---

## 🛠️ Tech Stack

*   **Framework:** React 19 + TypeScript
*   **Bundler:** Vite 8
*   **Styling:** Vanilla CSS (no framework wrappers, custom properties design tokens)
*   **Icons:** Lucide React
*   **AI:** `@google/generative-ai` SDK (`gemini-3.5-flash`)
*   **Video Integration:** YouTube Search API v3

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have Node.js (version 18+) installed.

### 2. Set Up Environment Variables
Create a file named `.env` in the root directory of the project and add your API keys:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
```

> [!IMPORTANT]
> If the development server is already running, **you must restart it** after creating/editing the `.env` file so Vite loads the variables.

### 3. Installation & Run
Install dependencies and run the local development server:

```bash
# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## 📂 Codebase Breakdown

*   **[App.tsx](file:///c:/Users/NaphierNODE/Documents/APP%20DEV/gdg/src/App.tsx):** Coordinates state, filters, searches, and controls status pills and error banners.
*   **[gemini.ts](file:///c:/Users/NaphierNODE/Documents/APP%20DEV/gdg/src/api/gemini.ts):** Formulates Gemini prompt instructions, uses JSON modes, and handles the local mock database and error-fallback.
*   **[youtube.ts](file:///c:/Users/NaphierNODE/Documents/APP%20DEV/gdg/src/api/youtube.ts):** Queries YouTube to fetch and display recipe tutorial video overlays.
*   **[PantrySelect.tsx](file:///c:/Users/NaphierNODE/Documents/APP%20DEV/gdg/src/components/PantrySelect.tsx):** Houses the staples grid (Egg, Cabbage, Pork, Rice, etc.).
*   **[RecipeCard.tsx](file:///c:/Users/NaphierNODE/Documents/APP%20DEV/gdg/src/components/RecipeCard.tsx):** Displays costs, prep times, calories, checklist ingredients, and triggers tutorial modals.
*   **[index.css](file:///c:/Users/NaphierNODE/Documents/APP%20DEV/gdg/src/index.css):** Theme colors, custom keyframes, scroll behaviors, and responsive breakpoints.

---

## 🎨 Theme & Colors (Modern Carinderia Chic)

*   `--color-bg-cream` (`#FAF6EE`): Cozy cream canvas background.
*   `--color-primary-terracotta` (`#C2410C`): Clay pot terracotta for actions and primary branding.
*   `--color-accent-green` (`#15803D`): Fresh banana leaf green for owned ingredients and active tags.
*   `--color-accent-gold` (`#D97706`): Garlic gold for warnings, fallbacks, and secondary details.
