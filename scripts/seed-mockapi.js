// Run with Node.js >=18: node scripts/seed-mockapi.js
// Only POSTs missing sample records; never deletes existing records.
const MSSV = 'BIT242958';
const base = 'https://6ad714b5f71f154ac487b791.mockapi.io';
const f = (s) => `${MSSV}_${s}`;
const res = (s) => `${MSSV}_${s}`;

async function api(resource, method = 'GET', body) {
  const r = await fetch(`${base}/${resource}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(`${method} ${resource}: HTTP ${r.status} ${await r.text()}`);
  return r.json();
}

const categories = [
  { code: 'CAT01', name: 'Main dishes', description: 'Main course meals' },
  { code: 'CAT02', name: 'Appetizers', description: 'Small dishes and starters' },
  { code: 'CAT03', name: 'Drinks', description: 'Beverages' },
];
const dishes = [
  { code: 'DISH01', name: 'Fried Rice', price: 45000, mins: 15, cat: 'CAT01', available: true, images: ['https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=900&q=85', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=900&q=85'] },
  { code: 'DISH02', name: 'Beef Pho', price: 55000, mins: 20, cat: 'CAT01', available: true, images: ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=900&q=85'] },
  { code: 'DISH03', name: 'Spring Rolls', price: 35000, mins: 10, cat: 'CAT02', available: true, images: ['https://images.unsplash.com/photo-1544025162-d76694265947?w=900&q=85'] },
  { code: 'DISH04', name: 'Chicken Wings', price: 60000, mins: 25, cat: 'CAT02', available: false, images: ['https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=900&q=85'] },
  { code: 'DISH05', name: 'Lemon Tea', price: 20000, mins: 5, cat: 'CAT03', available: true, images: ['https://images.unsplash.com/photo-1544145945-f90425340c7e?w=900&q=85'] },
];

async function main() {
  const categoryResource = res('DishCategory');
  const dishResource = res('Dish');
  let existingCategories = await api(categoryResource);
  if (!Array.isArray(existingCategories)) throw new Error('Category endpoint must return an array.');
  for (const category of categories) {
    if (!existingCategories.some((x) => x[f('Id')] === category.code || x[f('Name')] === category.name)) {
      const created = await api(categoryResource, 'POST', {
        [f('Id')]: category.code,
        [f('Name')]: category.name,
        [f('Description')]: category.description,
      });
      console.log('Created category:', created[f('Name')]);
    }
  }
  const existingDishes = await api(dishResource);
  if (!Array.isArray(existingDishes)) throw new Error('Dish endpoint must return an array.');
  for (const dish of dishes) {
    if (!existingDishes.some((x) => x[f('Id')] === dish.code || x[f('Name')] === dish.name && x[f('DishCategoryId')] === dish.cat)) {
      const created = await api(dishResource, 'POST', {
        [f('Id')]: dish.code,
        [f('Name')]: dish.name,
        [f('Price')]: dish.price,
        [f('PreparationTime')]: dish.mins,
        [f('IsAvailable')]: dish.available,
        [f('Description')]: `${dish.name} - sample item`,
        [f('DishCategoryId')]: dish.cat,
        [f('DishImage')]: (dish.images || []).map((url,index)=>({[f('ImageUrl')]:url,[f('IsThumbnail')]:index===0})),
      });
      console.log('Created dish:', created[f('Name')]);
    }
  }
  console.log('Done! Check the two endpoints in your browser.');
}
main().catch((e) => { console.error(e.message); process.exitCode = 1; });
