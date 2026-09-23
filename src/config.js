// ✏️ Everything personal lives here — edit freely.

export const NAME = 'Affaq';
export const AGE = 21; // born 2005

// 1st, 2nd, 3rd, 4th … 11th, 12th, 13th, 21st, 22nd …
export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// 🔒 Everything stays blurred and locked until this exact moment, then opens for everyone.
// Midnight Pakistan time on his birthday, e.g. '2026-10-05T00:00:00+05:00'. null = never locked.
export const UNLOCK_AT = '2026-09-24T00:00:00+05:00';

// Who the letter is from
export const FROM = 'All friends and well-wishers';

export const LETTER = [
  'Dear Affaq,',
  "Happy 21st birthday! This year a text message didn't feel like enough, so I built you a whole website instead.",
  'Thank you for being the kind of friend who always shows up: for the late-night talks, the jokes nobody else gets, and for having my back every single time.',
  "21 is going to be a great year. I hope it brings you big wins, wild adventures, and every bit of happiness you deserve. Never stop being you. The world's better with you in it.",
  "Here's to you, today and every day.",
];

// One wish per year of his age, shown as flip cards (only the first AGE are used)
export const WISHES = [
  ['🗺️', 'Adventures worth retelling for years'],
  ['😂', 'Laughs that make your stomach hurt'],
  ['💪', 'Good health, always'],
  ['🏆', 'Wins, big and small'],
  ['🌙', 'Late-night talks with the right people'],
  ['🎧', 'A playlist that never needs skipping'],
  ['📅', 'Plans that actually work out'],
  ['🍕', 'Food that hits every single time'],
  ['😎', 'Confidence in every room you walk into'],
  ['🕊️', 'Peace of mind'],
  ['✨', 'Dreams that start turning real'],
  ['🤝', 'Friends who stay'],
  ['✈️', "A trip you'll never forget"],
  ['🎯', 'New skills unlocked'],
  ['🌅', 'Sunsets worth stopping for'],
  ['💛', 'Kindness coming back to you'],
  ['☕', 'Mornings that start right'],
  ['🚀', 'The courage to take the leap'],
  ['🏡', 'Proud moments with family'],
  ['🍀', 'Zero bad days (okay, very few)'],
  ['🎉', 'Your best year yet'],
];

export const BALLOON_MESSAGES = [
  '21 looks good on you!',
  'Level 21 unlocked',
  'Legend status: confirmed',
  'Make a wish!',
  'Cake first, questions later',
  'Main character energy',
  'Another lap around the sun',
  'Party mode: ON',
  'You deserve the world',
  'Still young, just cooler',
];

// Instagram-style profile above the memories grid
export const HANDLE = 'affaq.21';
export const BIO = ['Birthday boy · Level 21 unlocked', 'Send a wish or share a memory below'];
// Profile picture: put a photo in /public (e.g. public/affaq.jpg) and set AVATAR = 'affaq.jpg'
export const AVATAR = null;
