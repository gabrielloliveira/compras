import AsyncStorage from "@react-native-async-storage/async-storage";
import { FilterStatus } from "@/types/FilterStatus";

const ITEMS_STORAGE_KEY = "@comprar:items";

export type ItemStorage = {
  id: string;
  status: FilterStatus;
  description: string;
};

async function get(): Promise<ItemStorage[]> {
  try {
    const storage = await AsyncStorage.getItem(ITEMS_STORAGE_KEY);
    return storage ? JSON.parse(storage) : [];
  } catch (error) {
    throw new Error("itemsStorage.get: " + error);
  }
}

async function getById(id: string): Promise<ItemStorage | null> {
  const items = await get();
  const item = items.find((item) => item.id === id);
  return item ?? null;
}

async function getByStatus(status: FilterStatus): Promise<ItemStorage[]> {
  const items = await get();
  return items.filter((item) => item.status === status);
}

async function save(items: ItemStorage[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    throw new Error("itemsStorage.save: " + error);
  }
}

async function add(newItem: ItemStorage): Promise<ItemStorage[]> {
  const items = await get();
  const updatedItems = [...items, newItem];
  await save(updatedItems);
  return updatedItems;
}

async function remove(id: string): Promise<void> {
  const items = await get();
  const updatedItems = items.filter((item) => item.id !== id);
  await save(updatedItems);
}

async function clear(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ITEMS_STORAGE_KEY);
  } catch (error) {
    throw new Error("itemsStorage.clear: " + error);
  }
}

async function toggleStatus(id: string): Promise<void> {
  const items = await get();
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    throw new Error(`itemsStorage.toggleStatus: Item com id ${id} não encontrado`);
  }

  const current = items[index];
  items[index] = {
    ...current,
    status:
      current.status === FilterStatus.DONE
        ? FilterStatus.PENDING
        : FilterStatus.DONE,
  };

  await save(items);
}

export const itemsStorage = {
  get,
  getByStatus,
  add,
  remove,
  clear,
  toggleStatus,
};
