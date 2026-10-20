import { API_BASE_URL, CATEGORY_RESOURCE, DISH_RESOURCE, key } from '../config';

async function request(resource, method = 'GET', body) {
  const res = await fetch(`${API_BASE_URL}/${resource}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API HTTP ${res.status}: ${method} ${resource}`);
  if (res.status === 204) return null;
  return res.json();
}

const normalizeCategory = row => ({
  id: String(row[key('Id')] || row.id), apiId: String(row.id),
  name: String(row[key('Name')] || ''), description: String(row[key('Description')] || ''),
});
export const normalizeDish = row => {
  let images = row[key('DishImage')] || [];
  if (typeof images === 'string') {
    try { images = JSON.parse(images); } catch { images = []; }
  }
  return {
    id: String(row[key('Id')] || row.id), apiId: String(row.id),
    name: String(row[key('Name')] || ''), price: Number(row[key('Price')] || 0),
    preparationTime: Number(row[key('PreparationTime')] || 0),
    isAvailable: row[key('IsAvailable')] === true || row[key('IsAvailable')] === 'true',
    description: String(row[key('Description')] || ''),
    categoryId: String(row[key('DishCategoryId')] || ''),
    images: Array.isArray(images) ? images : [],
  };
};
export async function getCategories() {
  const rows = await request(CATEGORY_RESOURCE);
  if (!Array.isArray(rows)) throw new Error('Category API did not return an array');
  return rows.map(normalizeCategory);
}
export async function getDishes() {
  const rows = await request(DISH_RESOURCE);
  if (!Array.isArray(rows)) throw new Error('Dish API did not return an array');
  return rows.map(normalizeDish);
}
function toPayload(dish) {
  return {
    [key('Id')]: dish.id,
    [key('Name')]: dish.name.trim(),
    [key('Price')]: Number(dish.price),
    [key('PreparationTime')]: Number(dish.preparationTime),
    [key('IsAvailable')]: Boolean(dish.isAvailable),
    [key('Description')]: dish.description.trim(),
    [key('DishCategoryId')]: dish.categoryId,
    [key('DishImage')]: dish.images,
  };
}
export async function saveDish(dish) {
  const editing = Boolean(dish.apiId);
  const res = await request(editing ? `${DISH_RESOURCE}/${encodeURIComponent(dish.apiId)}` : DISH_RESOURCE,
    editing ? 'PUT' : 'POST', toPayload(dish));
  return normalizeDish(res);
}
export async function deleteDish(apiId) {
  return request(`${DISH_RESOURCE}/${encodeURIComponent(apiId)}`, 'DELETE');
}
