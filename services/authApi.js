// Mock auth/profile API — swap internals for real fetch() calls
// to your Laravel endpoints later. Keep function signatures the same.

let mockProfiles = [
  { id: '1', name: 'Maria Santos', password: '1234', verified: true },
  { id: '2', name: 'Juan Dela Cruz', password: 'abcd', verified: true },
  { id: '3', name: 'Ana Reyes', password: 'pass', verified: false },
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchProfiles() {
  await delay(500);
  return mockProfiles.map(({ id, name, verified }) => ({ id, name, verified }));
}

export async function createProfile(name, password) {
  await delay(700);
  const newProfile = {
    id: String(mockProfiles.length + 1),
    name,
    password,
    verified: false,
  };
  mockProfiles.push(newProfile);
  return { success: true, profile: newProfile };
}

export async function login(profileId, password) {
  await delay(500);
  const profile = mockProfiles.find((p) => p.id === profileId);

  if (!profile) return { success: false, error: 'Profile not found' };
  if (!profile.verified) return { success: false, error: 'Profile not yet verified by owner' };
  if (profile.password !== password) return { success: false, error: 'Incorrect password' };

  return { success: true, profile: { id: profile.id, name: profile.name } };
}