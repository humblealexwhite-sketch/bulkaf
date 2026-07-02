export type Product = {
  name: string;
  unit: "g" | "ml";
  kcal: number;
  p: number;
  c: number;
  f: number;
};

// Platzhalter-Werte pro 100g / 100ml. Fest im Code -> hier später mit echter Liste ersetzen.
export const PRODUCTS: Record<string, Product> = {
  milch: { name: "Vollmilch", unit: "ml", kcal: 65, p: 3.3, c: 4.8, f: 3.6 },
  haferflocken: { name: "Haferflocken", unit: "g", kcal: 370, p: 13, c: 60, f: 7 },
  erdnussbutter: { name: "Erdnussbutter", unit: "g", kcal: 588, p: 25, c: 20, f: 50 },
  banane: { name: "Banane", unit: "g", kcal: 89, p: 1.1, c: 23, f: 0.3 },
  whey: { name: "Molkeprotein-Pulver", unit: "g", kcal: 380, p: 75, c: 10, f: 5 },
  nutella: { name: "Nuss-Nougat-Creme", unit: "g", kcal: 539, p: 6, c: 57, f: 31 },
  honig: { name: "Honig", unit: "g", kcal: 304, p: 0.3, c: 76, f: 0 },
  nudeln: { name: "Nudeln (trocken)", unit: "g", kcal: 353, p: 12, c: 71, f: 1.5 },
  gouda: { name: "Gouda gerieben", unit: "g", kcal: 356, p: 25, c: 0, f: 28 },
  hackfleisch: { name: "Hackfleisch gemischt", unit: "g", kcal: 250, p: 17, c: 0, f: 20 },
  sahne: { name: "Sahne", unit: "g", kcal: 292, p: 2.4, c: 3, f: 30 },
  butter: { name: "Butter", unit: "g", kcal: 717, p: 0.9, c: 0.1, f: 81 },
  haehnchen: { name: "Hähnchenbrust", unit: "g", kcal: 165, p: 31, c: 0, f: 3.6 },
  reis: { name: "Reis (gekocht)", unit: "g", kcal: 130, p: 2.7, c: 28, f: 0.3 },
  gemuese: { name: "Gemüse gemischt", unit: "g", kcal: 35, p: 2, c: 7, f: 0.3 },
  olivenoel: { name: "Olivenöl", unit: "g", kcal: 884, p: 0, c: 0, f: 100 },
};

export type RecipeItem = [productId: string, grams: number];

export type Recipe = {
  key: string;
  label: string;
  pct: number; // Anteil am Tages-Kalorienziel
  items: RecipeItem[];
};

export const RECIPES: Recipe[] = [
  {
    key: "fruehstueck",
    label: "Frühstück — Mieser Shake",
    pct: 0.28,
    items: [
      ["milch", 300],
      ["haferflocken", 60],
      ["erdnussbutter", 30],
      ["banane", 120],
      ["whey", 40],
      ["honig", 20],
    ],
  },
  {
    key: "mittag",
    label: "Mittagessen — Nudeln in Käse-Sahne-Soße mit Hack",
    pct: 0.32,
    items: [
      ["nudeln", 120],
      ["hackfleisch", 140],
      ["sahne", 120],
      ["gouda", 90],
      ["butter", 20],
    ],
  },
  {
    key: "nachmittag",
    label: "Nachmittags-Shake",
    pct: 0.18,
    items: [
      ["milch", 250],
      ["whey", 40],
      ["nutella", 30],
      ["banane", 100],
      ["haferflocken", 40],
    ],
  },
  {
    key: "abend",
    label: "Abendessen — leichter",
    pct: 0.22,
    items: [
      ["haehnchen", 150],
      ["reis", 150],
      ["gemuese", 150],
      ["olivenoel", 10],
    ],
  },
];
