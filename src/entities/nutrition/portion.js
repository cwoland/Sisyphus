export const scale = (per100g, grams) => {
  const value = (Number(per100g) || 0) * (Number(grams) || 0) / 100;
  return Math.round(value * 10) / 10;
};

export const portionOf = (product, grams) => ({
  calories: Math.round(scale(product.kcal_100g, grams)),
  protein: scale(product.protein_100g, grams),
  fat: scale(product.fat_100g, grams),
  carbs: scale(product.carbs_100g, grams),
});