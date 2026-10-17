// Firestore save/load helpers used by AdminScreen and App.js
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

// ---------- Ingredients ----------
export const saveIngredient = (ing) =>
  setDoc(doc(db, 'ingredients', String(ing.id)), ing);

export const updateIngredientDoc = (id, fields) =>
  updateDoc(doc(db, 'ingredients', String(id)), fields);

export const deleteIngredientDoc = (id) =>
  deleteDoc(doc(db, 'ingredients', String(id)));

// ---------- Ingredient categories ----------
export const saveIngredientCategory = (name) =>
  setDoc(doc(db, 'ingredientCategories', name), { name });

export const deleteIngredientCategoryDoc = (name) =>
  deleteDoc(doc(db, 'ingredientCategories', name));

export async function renameIngredientCategoryDocs(oldName, newName, ingredientIds) {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'ingredientCategories', oldName));
  batch.set(doc(db, 'ingredientCategories', newName), { name: newName });
  ingredientIds.forEach((id) =>
    batch.update(doc(db, 'ingredients', String(id)), { category: newName })
  );
  await batch.commit();
}

// ---------- Products ----------
export const saveProduct = (product) =>
  setDoc(doc(db, 'products', String(product.id)), product);

// Deletes by document ID and also any document whose "id" field matches,
// in case the product was saved under a different document ID
export async function deleteProductDoc(id) {
  const matches = await getDocs(
    query(collection(db, 'products'), where('id', 'in', [id, String(id)]))
  );
  const batch = writeBatch(db);
  batch.delete(doc(db, 'products', String(id)));
  matches.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

// ---------- Menu categories ----------
export const saveMenuCategory = (name, color) =>
  setDoc(doc(db, 'menuCategories', name), { name, color });

export const deleteMenuCategoryDoc = (name) =>
  deleteDoc(doc(db, 'menuCategories', name));

// ---------- Sales (admin only) ----------
// Turns a Firestore sale document into the shape Reports expects
const mapSale = (d) => {
  const s = d.data();
  const when = s.date ? new Date(s.date) : null;
  return {
    id: d.id,
    orderNumber: s.orderNumber ?? null,
    sortKey: when ? when.getTime() : 0,
    date: when
      ? when.toLocaleString('en-PH', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : '',
    paymentMode: s.paymentMode,
    items: s.items || [],
    total: s.total || 0,
    proofUrl: s.proofUrl || null,
  };
};

// Oldest first, because Reports reverses the list so the newest shows first
const sortSales = (list) => list.sort((a, b) => a.sortKey - b.sortKey);

export async function fetchSales() {
  const snap = await getDocs(collection(db, 'sales'));
  return sortSales(snap.docs.map(mapSale));
}

// Live version: calls onData every time a sale is added or changed. Returns the unsubscribe function.
export const subscribeSales = (onData, onError) =>
  onSnapshot(
    collection(db, 'sales'),
    (snap) => onData(sortSales(snap.docs.map(mapSale))),
    onError
  );