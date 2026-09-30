// Mock auth/profile API — swap internals for real fetch() calls
// to Firebase later. Keep function signatures the same.

let mockProfiles = [
  { id: '1', name: 'Maria Santos', password: '1234', verified: true, role: 'cashier' },
  { id: '2', name: 'Juan Dela Cruz', password: 'abcd', verified: true, role: 'cashier' },
  { id: '3', name: 'Ana Reyes', password: 'pass', verified: false, role: 'cashier' },
  { id: '4', name: 'Owner Admin', password: 'admin123', verified: true, role: 'admin' },
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// For the login profile grid — no role/password exposed
export async function fetchProfiles() {
  await delay(400);
  return mockProfiles.map(({ id, name, verified }) => ({ id, name, verified }));
}

// For Admin's account management screen — includes role, no password
export async function fetchAllProfiles() {
  await delay(400);
  return mockProfiles.map(({ id, name, verified, role }) => ({ id, name, verified, role }));
}

export async function createProfile(name, password) {
  await delay(600);
  const newProfile = {
    id: String(Math.max(...mockProfiles.map(p => Number(p.id))) + 1),
    name,
    password,
    verified: false,
    role: 'cashier', // signup always creates a cashier/barista account
  };
  mockProfiles.push(newProfile);
  return { success: true, profile: newProfile };
}

export async function login(profileId, password) {
  await delay(400);
  const profile = mockProfiles.find((p) => p.id === profileId);

  if (!profile) return { success: false, error: 'Profile not found' };
  if (!profile.verified) return { success: false, error: 'Profile not yet verified by owner' };
  if (profile.password !== password) return { success: false, error: 'Incorrect password' };

  return {
    success: true,
    profile: { id: profile.id, name: profile.name, role: profile.role },
  };
}

// ADMIN ACTIONS

export async function verifyProfile(id) {
  await delay(300);
  mockProfiles = mockProfiles.map((p) =>
    p.id === id ? { ...p, verified: true } : p
  );
  return { success: true };
}

export async function deleteProfile(id) {
  await delay(300);
  mockProfiles = mockProfiles.filter((p) => p.id !== id);
  return { success: true };
}