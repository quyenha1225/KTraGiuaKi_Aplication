import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDishes, getCategories, saveDish, deleteDish } from './api';
// Offline-first cache and durable operation queue.
const STORE = 'BIT242958_FoodManager_cache_v1';
const QUEUE = 'BIT242958_FoodManager_queue_v1';
const get = async (key, fallback) => { try { const value = await AsyncStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } };
export const readCache = () => get(STORE, { dishes: [], categories: [] });
export const writeCache = (data) => AsyncStorage.setItem(STORE, JSON.stringify(data));
export const pendingCount = async () => (await get(QUEUE, [])).length;
// Use stable local IDs for pending creations; coalesce edits of unuploaded creations.
export async function queueSave(dish) {
  const queue = await get(QUEUE, []);
  if (!dish.apiId) {
    const localId = dish.localId || `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const item = { ...dish, localId };
    const at = queue.findIndex(op => op.type === 'create' && op.dish.localId === localId);
    if (at >= 0) queue[at] = { type: 'create', dish: item };
    else queue.push({ type: 'create', dish: item });
    await AsyncStorage.setItem(QUEUE, JSON.stringify(queue));
    return item;
  }
  const at = queue.findIndex(op => op.type === 'update' && op.dish.apiId === dish.apiId);
  if (at >= 0) queue[at] = { type: 'update', dish };
  else queue.push({ type: 'update', dish });
  await AsyncStorage.setItem(QUEUE, JSON.stringify(queue));
  return dish;
}
export async function queueDelete(dish) {
  const queue = await get(QUEUE, []);
  // Unsynced creation never reached the server, so just discard its queued creation.
  if (!dish.apiId) {
    await AsyncStorage.setItem(QUEUE, JSON.stringify(queue.filter(op => !(op.type === 'create' && op.dish.localId === dish.localId))));
    return;
  }
  const rest = queue.filter(op => !(op.type === 'update' && op.dish.apiId === dish.apiId));
  if (!rest.some(op => op.type === 'delete' && op.apiId === dish.apiId)) rest.push({ type: 'delete', apiId: dish.apiId });
  await AsyncStorage.setItem(QUEUE, JSON.stringify(rest));
}
// Perform queued actions in order and refresh from server ONLY after all succeed.
// Important: Request failure after server accepted a POST needs reconciliation to avoid duplicates.
export async function syncNow() {
  let queue = await get(QUEUE, []);
  for (const op of queue) {
    if (op.type === 'create') {
      // Recovery check when previous POST succeeded but acknowledgement was lost.
      const remote = await getDishes();
      const already = remote.find(d => d.id === op.dish.id);
      if (!already) await saveDish(op.dish);
    } else if (op.type === 'update') await saveDish(op.dish);
    else if (op.type === 'delete') {
      try { await deleteDish(op.apiId); }
      catch (e) { if (!String(e.message).includes('404')) throw e; }
    }
    queue = queue.slice(1);
    await AsyncStorage.setItem(QUEUE, JSON.stringify(queue));
  }
  const [categories, dishes] = await Promise.all([getCategories(), getDishes()]);
  await writeCache({ categories, dishes });
  return { categories, dishes };
}
