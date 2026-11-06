/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContentType } from '../config/constants';
import { RawGeneration, UserItem, AdminAction } from '../types/api';

// Realistic Indian names for mock data
const FIRST_NAMES = [
  'Aarav', 'Priya', 'Rohan', 'Ananya', 'Vikram', 'Neha', 'Aditya', 'Pooja',
  'Rajesh', 'Sneha', 'Devansh', 'Kavya', 'Tarun', 'Meera', 'Ishaan', 'Shreya',
  'Arjun', 'Divya', 'Siddharth', 'Ritu', 'Karan', 'Tanvi', 'Varun', 'Nandini',
  'Nikhil', 'Simran', 'Akash', 'Swati', 'Manish', 'Pallavi', 'Pranav', 'Deepika',
  'Gaurav', 'Bhavna', 'Harsh', 'Anjali', 'Kunal', 'Rupal', 'Sameer', 'Preeti',
  'Zubair', 'Rohit', 'Alok', 'Smita', 'Rahul', 'Jyoti', 'Sunil', 'Komal'
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Verma', 'Iyer', 'Malhotra', 'Gupta', 'Joshi', 'Nair',
  'Menon', 'Kulkarni', 'Mathur', 'Choudhury', 'Reddy', 'Deshmukh', 'Saxena',
  'Bhatia', 'Chauhan', 'Singhania', 'Kapoor', 'Mehta', 'Wani', 'Banerjee',
  'Sengupta', 'Pillai', 'Rao', 'Pandey', 'Mishra', 'Trivedi', 'Agarwal', 'Shah'
];

const MODELS = [
  'Gemini 2.5 Flash',
  'Gemini 2.5 Pro',
  'Imagen 3 Fast',
  'Claude 3.5 Sonnet (Parser)',
];

// Helper to seed deterministic pseudo-random numbers
let seed = 42;
function pseudoRandom() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

// Fixed anchor date for 90 days range (Reference: 2026-11-05)
const ANCHOR_DATE = new Date('2026-11-05T18:30:00.000Z');

// Build 120 users
export const MOCK_USERS: UserItem[] = [];
export const MOCK_GENERATIONS: RawGeneration[] = [];
export const MOCK_ADMIN_ACTIONS: Record<string, AdminAction[]> = {};

// Generate 120 deterministic users over 90 days
for (let i = 1; i <= 120; i++) {
  const fName = FIRST_NAMES[(i * 7) % FIRST_NAMES.length];
  const lName = LAST_NAMES[(i * 11) % LAST_NAMES.length];
  const name = `${fName} ${lName}`;

  // Make ~10 accounts internal @appinventiv.com
  const isInternal = i === 1 || i === 4 || i === 12 || i === 23 || i === 38 || i === 57 || i === 72 || i === 89 || i === 104 || i === 115;
  const isTest = isInternal && (i === 12 || i === 38 || i === 89);
  
  let email = '';
  if (i === 1) {
    email = 'zubair.wani@appinventiv.com';
  } else if (isInternal) {
    email = `${fName.toLowerCase()}.${lName.toLowerCase()}@appinventiv.com`;
  } else {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'startup.in', 'designhub.co', 'venture.in'];
    const domain = domains[i % domains.length];
    email = `${fName.toLowerCase()}.${lName.toLowerCase()}${i > 40 ? i : ''}@${domain}`;
  }

  // Days ago signed up: from 1 to 90 days ago
  const daysAgo = Math.floor(pseudoRandom() * 88) + 1;
  const signupDate = new Date(ANCHOR_DATE.getTime() - daysAgo * 24 * 60 * 60 * 1000 - Math.floor(pseudoRandom() * 40000000));
  
  // Last active: between signup date and anchor date
  const activeDaysAgo = Math.max(0, daysAgo - Math.floor(pseudoRandom() * daysAgo));
  const lastActiveDate = new Date(ANCHOR_DATE.getTime() - activeDaysAgo * 24 * 60 * 60 * 1000);

  const userId = `usr_${String(i).padStart(4, '0')}`;

  MOCK_USERS.push({
    id: userId,
    name,
    email,
    signupAt: signupDate.toISOString(),
    lastActiveAt: lastActiveDate.toISOString(),
    createdByType: {
      landing: 0,
      deck: 0,
      poster: 0,
      mobile: 0,
      dashboard: 0,
    },
    liveSites: 0,
    generations: 0,
    spendInr: 0,
    freeGenerationsLeft: Math.floor(pseudoRandom() * 8) + (isInternal ? 25 : 3),
    isInternal,
    isTest,
  });
}

// Generate ~1500 generations spread across these users
const TOTAL_GENERATIONS = 1520;
const USER_GEN_WEIGHTS = MOCK_USERS.map((_, idx) => {
  // Heavy users (top 10%), moderate, light
  if (idx < 12) return 30; // heavy
  if (idx < 35) return 15; // medium
  if (idx < 80) return 6;  // normal
  return 2; // casual
});
const TOTAL_WEIGHT = USER_GEN_WEIGHTS.reduce((a, b) => a + b, 0);

function pickUserIndex(): number {
  let rand = Math.floor(pseudoRandom() * TOTAL_WEIGHT);
  for (let i = 0; i < USER_GEN_WEIGHTS.length; i++) {
    rand -= USER_GEN_WEIGHTS[i];
    if (rand <= 0) return i;
  }
  return 0;
}

for (let g = 1; g <= TOTAL_GENERATIONS; g++) {
  const userIdx = pickUserIndex();
  const user = MOCK_USERS[userIdx];
  const userSignup = new Date(user.signupAt).getTime();
  const now = ANCHOR_DATE.getTime();

  // Timestamp between user signup and anchor date
  const genTimestamp = userSignup + Math.floor(pseudoRandom() * (now - userSignup));
  const createdAt = new Date(genTimestamp).toISOString();

  // Pick content type: landing (~34%), deck (~30%), poster (~15%), mobile (~12%), dashboard (~9%)
  const typeRand = pseudoRandom();
  let type: ContentType = 'landing';
  let sizeCount = 8;
  let baseCost = 28.5;
  let aiCalls = 4;
  let aiImages = 2;
  let durationMs = 12000;

  if (typeRand < 0.34) {
    type = 'landing';
    sizeCount = Math.floor(pseudoRandom() * 6) + 6; // 6-11 sections
    aiCalls = Math.floor(pseudoRandom() * 3) + 4;   // 4-6 calls
    aiImages = Math.floor(pseudoRandom() * 4) + 1;  // 1-4 images
    baseCost = 24 + sizeCount * 2.1 + aiImages * 4.2;
    durationMs = 9000 + Math.floor(pseudoRandom() * 9000);
  } else if (typeRand < 0.64) {
    type = 'deck';
    sizeCount = Math.floor(pseudoRandom() * 14) + 10; // 10-23 slides
    aiCalls = Math.floor(pseudoRandom() * 4) + 5;     // 5-8 calls
    aiImages = Math.floor(pseudoRandom() * 3) + 1;
    baseCost = 22 + sizeCount * 1.5 + aiImages * 3.8;
    durationMs = 11000 + Math.floor(pseudoRandom() * 11000);
  } else if (typeRand < 0.79) {
    type = 'poster';
    sizeCount = Math.floor(pseudoRandom() * 3) + 2;   // 2-4 layout elements
    aiCalls = Math.floor(pseudoRandom() * 2) + 2;
    aiImages = Math.floor(pseudoRandom() * 2) + 1;
    baseCost = 14 + sizeCount * 1.8 + aiImages * 5.0;
    durationMs = 5000 + Math.floor(pseudoRandom() * 6000);
  } else if (typeRand < 0.91) {
    type = 'mobile';
    sizeCount = Math.floor(pseudoRandom() * 6) + 4;   // 4-9 screens
    aiCalls = Math.floor(pseudoRandom() * 3) + 4;
    aiImages = Math.floor(pseudoRandom() * 3) + 1;
    baseCost = 20 + sizeCount * 2.4 + aiImages * 3.5;
    durationMs = 10000 + Math.floor(pseudoRandom() * 8000);
  } else {
    type = 'dashboard';
    sizeCount = Math.floor(pseudoRandom() * 8) + 6;   // 6-13 widgets
    aiCalls = Math.floor(pseudoRandom() * 3) + 3;
    aiImages = Math.floor(pseudoRandom() * 2);
    baseCost = 18 + sizeCount * 2.2 + aiImages * 4.0;
    durationMs = 8000 + Math.floor(pseudoRandom() * 7000);
  }

  // Outcome: 91% OK, 6% Failed, 3% Stopped
  const outcomeRand = pseudoRandom();
  let outcome: 'OK' | 'Failed' | 'Stopped' = 'OK';
  if (outcomeRand > 0.97) {
    outcome = 'Stopped';
    baseCost = baseCost * 0.45; // partial cost consumed
    durationMs = Math.floor(durationMs * 0.4);
  } else if (outcomeRand > 0.91) {
    outcome = 'Failed';
    baseCost = baseCost * 0.7; // compute ran before error
    durationMs = Math.floor(durationMs * 0.75);
  }

  // Model assignment
  const model = MODELS[Math.floor(pseudoRandom() * MODELS.length)];

  // Live site? Only for landing pages with OK outcome (~28% of OK landing pages get published)
  const isLiveSite = type === 'landing' && outcome === 'OK' && pseudoRandom() < 0.28;

  const costInr = Number(baseCost.toFixed(2));

  MOCK_GENERATIONS.push({
    id: `gen-${String(g).padStart(4, '0')}`,
    userId: user.id,
    createdAt,
    type,
    outcome,
    durationMs,
    aiCalls,
    sizeCount,
    aiImages,
    costInr,
    model,
    isLiveSite,
  });

  // Update user aggregates
  user.createdByType[type] += 1;
  user.generations += 1;
  user.spendInr = Number((user.spendInr + costInr).toFixed(2));
  if (isLiveSite) {
    user.liveSites += 1;
  }
}

// Sort generations descending by date
MOCK_GENERATIONS.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

// Add initial admin actions for demo realism
MOCK_ADMIN_ACTIONS['usr_0001'] = [
  {
    adminEmail: 'lead@appinventiv.com',
    amount: 50,
    reason: 'Internal testing quota for Go Live prototype testing',
    createdAt: new Date('2026-10-15T10:30:00.000Z').toISOString(),
  },
];
MOCK_ADMIN_ACTIONS['usr_0003'] = [
  {
    adminEmail: 'zubair.wani@appinventiv.com',
    amount: 15,
    reason: 'Support request: customer faced failed poster rasterization',
    createdAt: new Date('2026-10-28T14:15:00.000Z').toISOString(),
  },
];
MOCK_ADMIN_ACTIONS['usr_0005'] = [
  {
    adminEmail: 'zubair.wani@appinventiv.com',
    amount: 25,
    reason: 'Early beta advocate reward',
    createdAt: new Date('2026-11-02T09:45:00.000Z').toISOString(),
  },
];
