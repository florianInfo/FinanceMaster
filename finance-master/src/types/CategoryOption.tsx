// src/types/CategoryOption.ts
export interface CategoryOption {
  value: string;
  label: string;
  color: string; // hex ou hsl, générée une seule fois et persistée
}
