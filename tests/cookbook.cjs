const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Exercise production TypeScript against an isolated SQLite database.
function load(relative) {
  const filename = path.resolve(__dirname, '../src/lib', `${relative}.ts`);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', outputText)((name) => load(name), module, module.exports);
  return module.exports;
}

async function main() {
  const { initDatabase, saveMeal, getTodaysMeals, getDailyMacros } = load('db');
  const { getRecipes, getRecipe, getTags, createTag, saveRecipe, validateTikTok, recipeMacros } = load('recipes');
  const { toDayKey } = load('dates');
  const sqlite = new DatabaseSync(':memory:');
  const db = {
    execAsync: async (sql) => sqlite.exec(sql),
    getAllAsync: async (sql, ...params) => sqlite.prepare(sql).all(...params),
    getFirstAsync: async (sql, ...params) => sqlite.prepare(sql).get(...params) ?? null,
    runAsync: async (sql, ...params) => { const result = sqlite.prepare(sql).run(...params); return { ...result, lastInsertRowId: result.lastInsertRowid }; },
  };
  // An old installation with a meal must survive the additive migration.
  sqlite.exec("CREATE TABLE meals (id INTEGER PRIMARY KEY, date TEXT NOT NULL, name TEXT NOT NULL, energy REAL NOT NULL, carbs REAL NOT NULL, protein REAL NOT NULL)");
  sqlite.prepare('INSERT INTO meals VALUES (1, ?, ?, 100, 10, 5)').run(new Date().toISOString(), 'Existing meal');
  await initDatabase(db);
  await initDatabase(db);
  assert.equal((await getTodaysMeals(db)).length, 1);
  assert.equal((await getTodaysMeals(db))[0].fat, 0);
  assert.deepEqual(await getRecipes(db), []);
  assert.equal((await getTags(db)).length, 9);
  await createTag(db, '  Vegetarian  ');
  await createTag(db, 'VEGETARIAN');
  assert.equal((await getTags(db)).filter((t) => t === 'vegetarian').length, 1);
  const input = { name: 'Test curry', minutes: 25, icon: 'stew', energy: 450, protein: 30, carbs: 50, fat: 14, ingredients: ['150 g tofu'], steps: ['Cook the tofu.'], tags: ['curry', 'Vegetarian'], tiktokUrl: 'https://vm.tiktok.com/abc/' };
  const id = await saveRecipe(db, input);
  assert.equal((await getRecipe(db, id)).tiktokUrl, input.tiktokUrl);
  assert.deepEqual((await getRecipe(db, id)).tags, ['curry', 'vegetarian']);
  await saveRecipe(db, { ...input, name: 'Updated curry', tags: ['quickmeal'], tiktokUrl: '' }, id);
  await initDatabase(db);
  assert.equal((await getRecipe(db, id)).name, 'Updated curry');
  assert.equal((await getRecipe(db, id)).tiktokUrl, '');
  assert.equal(await getRecipe(db, '999'), null);
  assert.equal(validateTikTok('https://www.tiktok.com/@chef/video/123'), 'https://www.tiktok.com/@chef/video/123');
  for (const url of ['https://tiktok.com.evil.com/x', 'javascript:alert(1)', 'http://tiktok.com/x', 'https://tiktok.com@evil.com/x']) assert.throws(() => validateTikTok(url));
  await assert.rejects(saveRecipe(db, { ...input, ingredients: [] }));
  await assert.rejects(saveRecipe(db, { ...input, energy: Infinity }));
  const recipes = await getRecipes(db);
  assert.equal(recipes.length, 1);
  for (const recipe of recipes) {
    const portion = recipeMacros(recipe, 1.5);
    assert.equal(portion.energy, Math.round(recipe.energy * 1.5));
    assert.equal(portion.fat, Math.round(recipe.fat * 1.5));
    await saveMeal(db, { name: recipe.name, ...portion });
  }
  const meals = await getTodaysMeals(db);
  assert.equal(meals.length, recipes.length + 1);
  const totals = await getDailyMacros(db, 1);
  assert.equal(totals.get(toDayKey(new Date())).energy, meals.reduce((sum, m) => sum + m.energy, 0));
  for (const invalid of [NaN, Infinity, -1]) {
    await assert.rejects(saveMeal(db, { name: 'Invalid', energy: 100, carbs: invalid, protein: 1 }));
  }
  await assert.rejects(saveMeal(db, { name: ' ', energy: 100, carbs: 1, protein: 1 }));
  assert.equal((await getTodaysMeals(db)).length, meals.length);
  const plan = sqlite.prepare('EXPLAIN QUERY PLAN SELECT * FROM meals WHERE date >= ?').all('2026-01-01');
  assert.ok(plan.some((row) => row.detail.includes('meals_date_idx')));
  sqlite.close();
  console.log('PASS: empty cookbook, recipe create/edit/reload, tags, TikTok validation, migration preservation, portion logging, totals and indexes.');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
