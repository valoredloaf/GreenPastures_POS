// Offline support for the POS
//  1. Catalog cache - the last known menu and stock, so the app opens without internet
//  2. Saved session - the cashier stays logged in on this phone until they log out
//  3. Sales outbox  - sales made offline are kept on the phone and uploaded later
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { doc, runTransaction } from 'firebase/firestore';
import { db } from './firebase';

const KEYS = {
  catalog: 'gp.catalog.v1',
  queue: 'gp.outbox.v1',
  failed: 'gp.outboxFailed.v1',
  session: 'gp.session.v1',
  device: 'gp.deviceTag.v1',
  seq: 'gp.saleSeq.v1',
};

export const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ---------------------------------------------------------------
// Small storage helpers
// ---------------------------------------------------------------
const readJson = async (key, fallback) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

const writeJson = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.log('Offline storage error:', key, e.message);
  }
};

// ---------------------------------------------------------------
// 1. Catalog cache (products, ingredients, categories)
// ---------------------------------------------------------------
let catalog = {};
let catalogTimer = null;

export async function loadCatalogCache() {
  catalog = await readJson(KEYS.catalog, {});
  return catalog;
}

// name: 'products' | 'ingredients' | 'menuCategories' | 'ingredientCategories'
export function saveCatalogPart(name, value) {
  catalog = { ...catalog, [name]: value };
  clearTimeout(catalogTimer);
  catalogTimer = setTimeout(() => writeJson(KEYS.catalog, catalog), 400);
}

// ---------------------------------------------------------------
// 2. Saved session (so the app can reopen without internet)
// ---------------------------------------------------------------
export const saveSession = (profile) => writeJson(KEYS.session, profile);
export const loadSession = () => readJson(KEYS.session, null);
export const clearSession = () => AsyncStorage.removeItem(KEYS.session).catch(() => {});

// ---------------------------------------------------------------
// Connection helpers
// ---------------------------------------------------------------
const reachable = (state) =>
  !!state && !!state.isConnected && state.isInternetReachable !== false;

export async function isOnline() {
  try {
    return reachable(await NetInfo.fetch());
  } catch (e) {
    return true;
  }
}

// True for errors caused by the connection, not by the data or the rules
export function isNetworkError(e) {
  const code = e?.code || '';
  const message = String(e?.message || '').toLowerCase();
  return (
    code === 'unavailable' ||
    code === 'deadline-exceeded' ||
    message.includes('offline') ||
    message.includes('network') ||
    message.includes('timed out') ||
    message.includes('failed to get document')
  );
}

export function withTimeout(promise, ms = 15000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const err = new Error('Request timed out');
      err.code = 'deadline-exceeded';
      reject(err);
    }, ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); }
    );
  });
}

// ---------------------------------------------------------------
// 3. Sales
// ---------------------------------------------------------------

// Every sale gets an id of its own, used as the Firestore document id.
// If the same sale is sent twice (for example after a timeout), the second try is
// recognised and skipped instead of being saved again.
export async function newSaleIds() {
  let tag = null;
  try {
    tag = await AsyncStorage.getItem(KEYS.device);
  } catch (e) {}
  if (!tag) {
    tag = Math.random().toString(36).slice(2, 6).toUpperCase();
    try {
      await AsyncStorage.setItem(KEYS.device, tag);
    } catch (e) {}
  }

  const seq = ((await readJson(KEYS.seq, 0)) || 0) + 1;
  await writeJson(KEYS.seq, seq);

  return {
    localId: `${Date.now().toString(36)}-${tag}-${seq}`,
    offlineRef: `OFF-${tag}-${String(seq).padStart(3, '0')}`,
  };
}

// ONE transaction: order number + sale + stock deduction.
// sale = { localId, offlineRef, date, cashier, paymentMode, amountPaid, change,
//          total, items, proofUrl, needs }
// needs = { "<ingredient id>": amount used }
export function saveSaleTransaction(sale) {
  const counterRef = doc(db, 'counters', 'orders');
  const saleRef = doc(db, 'sales', sale.localId);
  const stockIds = Object.keys(sale.needs || {});
  const today = getTodayString();

  return runTransaction(db, async (tx) => {
    // Firestore requires every read to happen before any write
    const saleSnap = await tx.get(saleRef);
    if (saleSnap.exists()) {
      // Already saved by an earlier try
      return { number: saleSnap.data().orderNumber, newQuantities: {}, duplicate: true };
    }

    const counterSnap = await tx.get(counterRef);
    const stockSnaps = await Promise.all(
      stockIds.map((id) => tx.get(doc(db, 'ingredients', id)))
    );

    const data = counterSnap.exists() ? counterSnap.data() : null;
    const lastToday = data && data.date === today ? data.last : 0;
    const next = lastToday + 1;

    // Uses the CURRENT stock in Firestore, not the copy on this phone
    const newQuantities = {};
    stockSnaps.forEach((snap, i) => {
      if (!snap.exists()) return;
      const id = stockIds[i];
      const current = Number(snap.data().quantity) || 0;
      const remaining = Math.max(0, current - sale.needs[id]);
      tx.update(snap.ref, { quantity: remaining });
      newQuantities[id] = remaining;
    });

    tx.set(counterRef, { last: next, date: today });
    tx.set(saleRef, {
      orderNumber: next,
      offlineRef: sale.offlineRef || null,
      date: sale.date,
      cashier: sale.cashier,
      paymentMode: sale.paymentMode,
      amountPaid: sale.amountPaid,
      change: sale.change,
      total: sale.total,
      items: sale.items,
      proofUrl: sale.proofUrl || null,
    });

    return { number: next, newQuantities, duplicate: false };
  });
}

// ---------------------------------------------------------------
// Outbox: sales waiting to be uploaded
// ---------------------------------------------------------------
let queue = null;
let failedList = null;
let flushing = false;
const listeners = new Set();

const getQueue = async () => {
  if (!queue) queue = await readJson(KEYS.queue, []);
  return queue;
};

const getFailed = async () => {
  if (!failedList) failedList = await readJson(KEYS.failed, []);
  return failedList;
};

async function notify() {
  const counts = {
    pending: (await getQueue()).length,
    failed: (await getFailed()).length,
  };
  listeners.forEach((fn) => fn(counts));
}

export function subscribeQueue(fn) {
  listeners.add(fn);
  notify();
  return () => listeners.delete(fn);
}

// Keeps a sale on this phone until it can be uploaded.
// Throws if the phone could not store it, so the sale is never "accepted" and then lost.
export async function enqueueSale(sale) {
  const q = await getQueue();
  q.push(sale);
  try {
    await AsyncStorage.setItem(KEYS.queue, JSON.stringify(q));
  } catch (e) {
    q.pop();
    throw new Error(`Could not store the sale on this phone: ${e.message}`);
  }
  notify();
}

// Uploads waiting sales one at a time, oldest first
export async function flushOutbox() {
  if (flushing) return;
  flushing = true;

  try {
    const q = await getQueue();
    if (q.length === 0) return;
    if (!(await isOnline())) return;

    while (q.length > 0) {
      const sale = q[0];

      try {
        await withTimeout(saveSaleTransaction(sale));
      } catch (e) {
        // No connection: stop and try again later. The sale stays in the queue.
        if (isNetworkError(e)) break;

        // Rejected for another reason (for example the rules): move it aside
        // so it does not block the sales behind it, but never throw it away.
        console.log('Sale could not sync:', sale.offlineRef, e.message);
        const failed = await getFailed();
        failed.push({ ...sale, error: e.message });
        await writeJson(KEYS.failed, failed);
      }

      q.shift();
      await writeJson(KEYS.queue, q);
      notify();
    }
  } finally {
    flushing = false;
  }
}

// Start watching the connection. Call once after login, and call the returned function to stop.
export function startSync() {
  flushOutbox();

  const stopNet = NetInfo.addEventListener((state) => {
    if (reachable(state)) flushOutbox();
  });
  const timer = setInterval(() => flushOutbox(), 30000);

  return () => {
    stopNet();
    clearInterval(timer);
  };
}

// For screens: { online, pending, failed }
export function useSyncStatus() {
  const [online, setOnline] = useState(true);
  const [counts, setCounts] = useState({ pending: 0, failed: 0 });

  useEffect(() => {
    NetInfo.fetch().then((state) => setOnline(reachable(state))).catch(() => {});
    const stopNet = NetInfo.addEventListener((state) => setOnline(reachable(state)));
    const stopQueue = subscribeQueue(setCounts);

    return () => {
      stopNet();
      stopQueue();
    };
  }, []);

  return { online, pending: counts.pending, failed: counts.failed };
}