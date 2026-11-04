export interface Recipe {
  id: string;
  name: string;
  subtitle: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner';
  minutes: number;
  color: string;
  energy: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  steps: string[];
}

/** Curated offline recipes. Quantities and estimated macros are for one serving. */
export const recipes: Recipe[] = [
  { id: 'sunrise-oats', name: 'Sunrise oats', subtitle: 'A little morning magic', category: 'Breakfast', minutes: 5, color: '#9b68ba', energy: 410, protein: 27, carbs: 53, fat: 10,
    ingredients: ['45 g rolled oats', '170 g plain Greek yoghurt', '80 ml milk', '80 g mixed berries', '10 g chia seeds'],
    steps: ['Stir the oats, yoghurt, milk and chia seeds together in a jar.', 'Cover and refrigerate overnight (at least 4 hours).', 'Top with the berries before eating. Prep time excludes chilling.'] },
  { id: 'chicken-rice', name: 'Power bowl', subtitle: 'The adventurer’s staple', category: 'Lunch', minutes: 25, color: '#b74a65', energy: 540, protein: 48, carbs: 53, fat: 15,
    ingredients: ['140 g cooked chicken breast', '150 g cooked brown rice', '100 g broccoli', '50 g avocado', '1 tsp olive oil', 'Lemon juice, salt and pepper'],
    steps: ['Steam the broccoli until tender.', 'Warm the cooked chicken and rice until hot throughout.', 'Add everything to a bowl. Top with sliced avocado, olive oil and lemon. Season to taste.'] },
  { id: 'garden-chickpeas', name: 'Garden harvest', subtitle: 'Fresh fuel from the garden', category: 'Lunch', minutes: 10, color: '#438f80', energy: 430, protein: 18, carbs: 54, fat: 16,
    ingredients: ['150 g drained canned chickpeas', '100 g cucumber', '100 g tomatoes', '40 g feta', '1 tsp olive oil', 'Lemon juice and fresh parsley'],
    steps: ['Rinse and drain the chickpeas.', 'Dice the cucumber and tomatoes, then toss with the chickpeas.', 'Crumble over the feta. Dress with oil, lemon and chopped parsley.'] },
  { id: 'salmon-supper', name: 'Moonlit salmon', subtitle: 'A well-earned evening feast', category: 'Dinner', minutes: 30, color: '#477ba6', energy: 570, protein: 39, carbs: 51, fat: 24,
    ingredients: ['150 g salmon fillet', '250 g potatoes', '100 g green beans', '1 tsp olive oil', 'Lemon, dill and black pepper'],
    steps: ['Heat the oven to 200°C. Cut the potatoes into small cubes and toss with the oil.', 'Roast the potatoes for 15 minutes. Add salmon and roast for a further 12–15 minutes, until cooked through.', 'Steam the beans until tender. Serve with the salmon, potatoes, lemon and dill.'] },
  { id: 'tofu-noodles', name: 'Ember noodles', subtitle: 'A plant-powered restore', category: 'Dinner', minutes: 20, color: '#b9763f', energy: 510, protein: 30, carbs: 57, fat: 18,
    ingredients: ['180 g firm tofu', '60 g dry rice noodles', '150 g mixed stir-fry vegetables', '1 tsp sesame oil', '1 tbsp soy sauce', 'Ginger and garlic to taste'],
    steps: ['Cook the noodles according to their packet instructions, then drain.', 'Pat the tofu dry and cube. Fry in sesame oil until golden.', 'Add vegetables, ginger and garlic. Stir-fry until tender, then toss with noodles and soy sauce.'] },
  { id: 'egg-toast', name: 'Golden toast', subtitle: 'Your first quest of the day', category: 'Breakfast', minutes: 10, color: '#bf8f3d', energy: 390, protein: 24, carbs: 35, fat: 17,
    ingredients: ['2 eggs', '2 slices wholegrain bread (70 g)', '50 g baby spinach', '50 g tomatoes', 'Salt and pepper'],
    steps: ['Toast the bread and slice the tomatoes.', 'Wilt the spinach in a non-stick pan with a splash of water.', 'Whisk the eggs, add to the pan and gently scramble until set. Serve over toast with the tomatoes.'] },
];

export function recipeMacros(recipe: Recipe, servings: number) {
  return { energy: Math.round(recipe.energy * servings), protein: Math.round(recipe.protein * servings), carbs: Math.round(recipe.carbs * servings), fat: Math.round(recipe.fat * servings) };
}
