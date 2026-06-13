import { useState } from "react";
import { ChefHat, Sparkles, AlertCircle } from "lucide-react";
import { generateRecipes } from "./api/gemini";
import type { Recipe } from "./api/gemini";
import { PantrySelect } from "./components/PantrySelect";
import { RecipeCard } from "./components/RecipeCard";

function App() {
  const [budget, setBudget] = useState<number>(150);
  const [people, setPeople] = useState<number>(2);
  const [ingredients, setIngredients] = useState<string>("");
  const [selectedStaples, setSelectedStaples] = useState<string[]>([]);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFirstSearch, setIsFirstSearch] = useState<boolean>(true);
  const [fallbackWarning, setFallbackWarning] = useState<string | null>(null);

  // Check if API Key is configured in the .env file
  const hasApiKey = !!import.meta.env.VITE_GEMINI_API_KEY;

  // Sync ingredients text field when selectedStaples changes
  const handleToggleStaple = (staple: string) => {
    let nextStaples: string[];
    if (selectedStaples.includes(staple)) {
      nextStaples = selectedStaples.filter((s) => s !== staple);
    } else {
      nextStaples = [...selectedStaples, staple];
    }
    setSelectedStaples(nextStaples);

    // Reconstruct ingredients input text based on tags + any custom words typed
    const inputWords = ingredients
      .split(",")
      .map((w) => w.trim())
      .filter(
        (w) =>
          w !== "" &&
          !selectedStaples.some((s) => s.toLowerCase() === w.toLowerCase()),
      );

    const combined = [...nextStaples, ...inputWords].join(", ");
    setIngredients(combined);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (budget <= 0) {
      setError("Please set a valid budget above ₱0.");
      return;
    }
    if (people <= 0) {
      setError("Please input at least 1 person.");
      return;
    }

    setLoading(true);
    setError(null);
    setFallbackWarning(null);
    setIsFirstSearch(false);

    try {
      const results = await generateRecipes(budget, people, ingredients);
      setRecipes(results);
      if (results.length > 0 && results[0].fallbackError) {
        setFallbackWarning(results[0].fallbackError);
      }
      if (results.length === 0) {
        setError(
          "We couldn't find any recipes fitting your budget. Try increasing your budget or listing more ingredients!",
        );
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message || "An unexpected error occurred while generating recipes. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Sticky Header Nav */}
      <nav className="navbar">
        <div className="navbar-content">
          <a href="#" className="brand">
            <div className="brand-icon">UG</div>
            <div>
              <span className="brand-text">ma anong ulam?</span>
              <span className="brand-tagline"> • Tipid Chef Assistant</span>
            </div>
          </a>

          <div className="navbar-actions">
            {hasApiKey ? (
              <span
                className="status-pill status-pill-real"
                title="Real Gemini AI queries enabled."
              >
                AI ACTIVE
              </span>
            ) : (
              <span
                className="status-pill status-pill-mock"
                title="Running in Mock Mode. Real AI API Key is not configured in .env."
              >
                Demo Mock Mode
              </span>
            )}
          </div>
        </div>
      </nav>

      {!hasApiKey && (
        <div className="env-warning-banner">
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>
            <strong>Demo Mock Mode Active:</strong> No Gemini API key detected by the app. If you recently updated your <code>.env</code> file, <strong>please stop and restart your terminal development server (run <code>npm run dev</code> again)</strong> and refresh the browser.
          </span>
        </div>
      )}

      {/* Main Grid */}
      <main className="main-layout">
        {/* Sidebar Form */}
        <aside className="card">
          <h2 className="card-title">
            <ChefHat size={22} />
            Ano ang ulam natin?
          </h2>

          <form onSubmit={handleSearch}>
            <div className="form-group">
              <label htmlFor="budget-input" className="form-label">
                Target Budget (PHP ₱)
              </label>
              <div className="input-container">
                <span
                  className="input-icon"
                  style={{ left: "0.85rem", fontWeight: "bold" }}
                >
                  ₱
                </span>
                <input
                  type="number"
                  id="budget-input"
                  className="input-control"
                  style={{ paddingLeft: "1.75rem" }}
                  value={budget || ""}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  placeholder="e.g. 150"
                  min="20"
                  max="5000"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="people-input" className="form-label">
                How many people are eating?
              </label>
              <div className="input-container">
                <span className="input-icon">👥</span>
                <input
                  type="number"
                  id="people-input"
                  className="input-control"
                  style={{ paddingLeft: "2.25rem" }}
                  value={people || ""}
                  onChange={(e) => setPeople(Number(e.target.value))}
                  placeholder="e.g. 2"
                  min="1"
                  max="100"
                  required
                />
              </div>
            </div>

            <PantrySelect
              selectedStaples={selectedStaples}
              onToggleStaple={handleToggleStaple}
            />

            <div className="form-group">
              <label htmlFor="ingredients-input" className="form-label">
                Other ingredients at home (comma separated)
              </label>
              <div className="input-container">
                <span className="input-icon">🥫</span>
                <textarea
                  id="ingredients-input"
                  className="input-control textarea-control"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="e.g. Leftover pork, egg, sitaw..."
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "1rem" }}
              disabled={loading}
            >
              <Sparkles size={16} />
              <span>{loading ? "Thinking..." : "Mag-generate ng Ulam"}</span>
            </button>
          </form>
        </aside>

        {/* Content Display Area */}
        <section>
          {/* Welcome Screen */}
          {isFirstSearch && !loading && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <ChefHat size={32} />
              </div>
              <h3>Worry no more, Ka-Ulam!</h3>
              <p style={{ marginTop: "0.5rem" }}>
                Solve the daily "Anong ulam?" question. Put in your budget and
                ingredients at home, and let UlamGPT generate delicious,
                budget-friendly Pinoy recipe ideas.
              </p>
              <button
                className="btn btn-accent-green"
                style={{ marginTop: "1.5rem" }}
                onClick={() => {
                  setBudget(150);
                  setPeople(3);
                  setSelectedStaples(["Egg", "Cabbage", "Sardines"]);
                  setIngredients("Egg, Cabbage, Sardines");
                }}
              >
                Load Try-out Example
              </button>
            </div>
          )}

          {/* Loading Screen */}
          {loading && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p className="loading-text">Nagluluto ng recipe ideas...</p>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--color-text-light)",
                  marginTop: "0.5rem",
                }}
              >
                Estimating costs and checking nutritional values
              </p>
            </div>
          )}

          {/* Error display */}
          {error && !loading && (
            <div
              style={{
                backgroundColor: "var(--color-error-light)",
                color: "var(--color-error)",
                padding: "1rem 1.5rem",
                borderRadius: "var(--radius-lg)",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                border: "1px solid rgba(220, 38, 38, 0.2)",
              }}
            >
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ display: "block", fontSize: "0.95rem" }}>
                  Cooking Hiccup!
                </strong>
                <span style={{ fontSize: "0.85rem" }}>{error}</span>
              </div>
            </div>
          )}

          {/* Recipe List */}
          {!loading && recipes.length > 0 && (
            <div>
              {fallbackWarning && (
                <div
                  style={{
                    backgroundColor: "var(--color-accent-gold-light)",
                    color: "var(--color-accent-gold)",
                    padding: "1rem 1.5rem",
                    borderRadius: "var(--radius-lg)",
                    marginBottom: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    border: "1px solid rgba(217, 119, 6, 0.2)",
                  }}
                >
                  <AlertCircle size={20} style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: "block", fontSize: "0.95rem" }}>
                      Gemini API Error (Fell back to Mock Recipes)
                    </strong>
                    <span style={{ fontSize: "0.85rem" }}>
                      The API query failed: "{fallbackWarning}". Showing realistic mock recipes matching your staples instead.
                    </span>
                  </div>
                </div>
              )}

              <div className="results-header">
                <div>
                  <h2
                    style={{
                      fontFamily: "var(--font-headings)",
                      fontSize: "1.5rem",
                    }}
                  >
                    Suggested Recipes
                  </h2>
                  <p style={{ fontSize: "0.85rem" }}>
                    Sourced and cost-estimated for {people} people
                  </p>
                </div>
              </div>

              <div className="results-grid">
                {recipes.map((recipe, index) => (
                  <RecipeCard
                    key={index}
                    recipe={recipe}
                    peopleCount={people}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div>UlamGPT — Built with ❤️ for the Filipino home.</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              justifyContent: "center",
            }}
          >
            <span>A project for the</span>
            <span className="footer-credit">Google Developer Groups (GDG)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
