// Firestore save/load helpers used by AdminScreen and App.js
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
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

export const deleteProductDoc = (id) =>
  deleteDoc(doc(db, 'products', String(id)));

// ---------- Menu categories ----------
export const saveMenuCategory = (name, color) =>
  setDoc(doc(db, 'menuCategories', name), { name, color });

// Deletes every category document whose "name" matches, plus the one whose ID is the name.
// (A plain deleteDoc by name silently does nothing if the document has a different ID.)
export async function deleteMenuCategoryDoc(name) {
  const snap = await getDocs(query(collection(db, 'menuCategories'), where('name', '==', name)));
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(doc(db, 'menuCategories', name));
}

// ---------- Sales (admin only) ----------
export async function fetchSales() {
  const snap = await getDocs(collection(db, 'sales'));

  return snap.docs
    .map((d) => {
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
    })
    .sort((a, b) => a.sortKey - b.sortKey); // Reports reverses, so newest shows first
}