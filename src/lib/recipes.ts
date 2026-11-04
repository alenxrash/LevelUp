import type { SQLiteDatabase } from 'expo-sqlite';

export const foodIcons = ['stew', 'chicken', 'beef', 'fish', 'salad', 'bread', 'dessert'] as const;
export type FoodIcon = typeof foodIcons[number];
export const starterTags = ['soup', 'curry', 'stew', 'japanese', 'korean', 'beef', 'chicken', 'seafood', 'quickmeal'];
export interface Recipe {
  id: string;
  name: string;
  minutes: number;
  icon: FoodIcon;
  energy: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  steps: string[];
  tags: string[];
  tiktokUrl: string;
}
export type RecipeInput = Omit<Recipe, 'id'>;
export function normalizeTag(value: string) { return value.trim().toLowerCase().replace(/\s+/g, ' '); }
export function validateTikTok(value: string): string {
  if (!value.trim()) return '';
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || !(url.hostname === 'tiktok.com' || url.hostname.endsWith('.tiktok.com')) || url.username || url.password) throw new Error();
    return url.toString();
  } catch { throw new Error('Enter a full https:// TikTok link (including short share links).'); }
}
export async function initCookbook(db: SQLiteDatabase) {
  await db.execAsync(`CREATE TABLE IF NOT EXISTS recipes (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS food_tags (name TEXT PRIMARY KEY NOT NULL);`);
  for (const tag of starterTags) await db.runAsync('INSERT OR IGNORE INTO food_tags (name) VALUES (?)', tag);
}
function decodeRecipe(data: string): RecipeInput {
  const recipe = JSON.parse(data);
  if (recipe.icon === 'carrot') recipe.icon = 'salad';
  return recipe;
}
export async function deleteRecipe(db: SQLiteDatabase, id: string) {
  await db.runAsync('DELETE FROM recipes WHERE id = ?', id);
}
export async function getRecipes(db: SQLiteDatabase): Promise<Recipe[]> {
  const rows = await db.getAllAsync<{ id: number; data: string }>('SELECT id, data FROM recipes ORDER BY id DESC');
  return rows.map((row) => ({ ...decodeRecipe(row.data), id: String(row.id) }));
}
export async function getRecipe(db: SQLiteDatabase, id: string): Promise<Recipe | null> {
  const row = await db.getFirstAsync<{ id: number; data: string }>('SELECT id, data FROM recipes WHERE id = ?', id);
  return row ? { ...decodeRecipe(row.data), id: String(row.id) } : null;
}
export async function getTags(db: SQLiteDatabase): Promise<string[]> {
  const rows = await db.getAllAsync<{ name: string }>('SELECT name FROM food_tags ORDER BY name');
  return rows.map((row) => row.name);
}
export async function createTag(db: SQLiteDatabase, value: string) {
  const tag = normalizeTag(value);
  if (!tag) return '';
  await db.runAsync('INSERT OR IGNORE INTO food_tags (name) VALUES (?)', tag);
  return tag;
}
export async function saveRecipe(db: SQLiteDatabase, input: RecipeInput, id?: string): Promise<string> {
  const tags = [...new Set(input.tags.map(normalizeTag).filter(Boolean))];
  const number = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0;
  const data: RecipeInput = { ...input, name: input.name.trim() || 'Untitled recipe', tags,
    energy: number(input.energy), protein: number(input.protein), carbs: number(input.carbs), fat: number(input.fat), minutes: number(input.minutes),
    tiktokUrl: input.tiktokUrl.trim() };
  for (const tag of tags) await createTag(db, tag);
  if (id) {
    const result = await db.runAsync('UPDATE recipes SET data = ? WHERE id = ?', JSON.stringify(data), id);
    if (!result.changes) throw new Error('This recipe no longer exists.');
    return id;
  }
  const result = await db.runAsync('INSERT INTO recipes (data) VALUES (?)', JSON.stringify(data));
  return String(result.lastInsertRowId);
}
export function recipeMacros(recipe: RecipeInput, servings: number) {
  return { energy: Math.round(recipe.energy * servings), protein: Math.round(recipe.protein * servings), carbs: Math.round(recipe.carbs * servings), fat: Math.round(recipe.fat * servings) };
}
