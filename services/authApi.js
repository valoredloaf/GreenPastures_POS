import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { auth, db } from './firebase';

const profilesRef = collection(db, 'profiles');

const makeEmail = (name) => {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
  return `${slug}${Date.now().toString(36)}@greenpastures.app`;
};

export async function fetchProfiles() {
  try {
    const snap = await getDocs(profilesRef);
    console.log('profiles found:', snap.size);
    return snap.docs.map((d) => ({
      id: d.id,
      name: d.data().name,
      verified: d.data().verified,
    }));
  } catch (e) {
    console.log('fetchProfiles error:', e.code, e.message);
    return [];
  }
}

export async function fetchAllProfiles() {
  const snap = await getDocs(profilesRef);
  return snap.docs.map((d) => ({
    id: d.id,
    name: d.data().name,
    verified: d.data().verified,
    role: d.data().role,
  }));
}

export async function createProfile(name, password) {
  try {
    const email = makeEmail(name);
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'profiles', cred.user.uid), {
      name,
      email,
      role: 'cashier',
      verified: false,
    });
    await signOut(auth);
    return { success: true };
  } catch (e) {
    console.log('createProfile error:', e.message);
    return { success: false, error: e.message };
  }
}

export async function login(profileId, password) {
  try {
    const snap = await getDoc(doc(db, 'profiles', profileId));
    if (!snap.exists()) return { success: false, error: 'Profile not found' };

    const profile = snap.data();
    if (!profile.verified) {
      return { success: false, error: 'Profile not yet verified by owner' };
    }

    await signInWithEmailAndPassword(auth, profile.email, password);

    return {
      success: true,
      profile: { id: profileId, name: profile.name, role: profile.role },
    };
  } catch (e) {
    console.log('login error:', e.message);
    return { success: false, error: 'Incorrect password' };
  }
}

export async function logout() {
  await signOut(auth);
}

export async function verifyProfile(id) {
  await updateDoc(doc(db, 'profiles', id), { verified: true });
  return { success: true };
}

export async function deleteProfile(id) {
  await deleteDoc(doc(db, 'profiles', id));
  return { success: true };
}