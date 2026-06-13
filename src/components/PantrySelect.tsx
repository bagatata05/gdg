import React from "react";
import { Check, Plus } from "lucide-react";

interface PantrySelectProps {
  selectedStaples: string[];
  onToggleStaple: (staple: string) => void;
}

const STAPLES = [
  "Garlic",
  "Onion",
  "Tomato",
  "Ginger",
  "Egg",
  "Rice",
  "Sardines",
  "Canned Tuna",
  "Cabbage",
  "Eggplant (Talong)",
  "Pechay",
  "Pork",
  "Chicken",
  "Soy Sauce",
  "Vinegar",
  "Fish Sauce (Patis)"
];

export const PantrySelect: React.FC<PantrySelectProps> = ({
  selectedStaples,
  onToggleStaple
}) => {
  return (
    <div className="form-group">
      <label className="form-label">Filipino Pantry Staples (Tap to add)</label>
      <div className="staples-grid">
        {STAPLES.map(staple => {
          const isSelected = selectedStaples.includes(staple);
          return (
            <button
              key={staple}
              type="button"
              className={`staple-tag ${isSelected ? "active" : ""}`}
              onClick={() => onToggleStaple(staple)}
              aria-pressed={isSelected}
            >
              {isSelected ? (
                <Check size={14} strokeWidth={3} className="staple-icon" />
              ) : (
                <Plus size={14} className="staple-icon" />
              )}
              {staple}
            </button>
          );
        })}
      </div>
    </div>
  );
};
