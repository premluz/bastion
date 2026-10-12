// People's photos (app/public/images, 2026-10-12): the signed-in user, the two
// Daniels of the send-money scenario and the people in the wallet's transactions.
// Looked up by display name, so a scene or a store only ever names a person and
// never a file. A name with no photo keeps
// Astryx's initials avatar.
export const USER_NAME = 'Preview user';

const PHOTOS: Record<string, string> = {
  [USER_NAME]: '/images/user.jpg',
  Prem: '/images/user.jpg',
  'Bastion demo': '/images/user.jpg',
  'Daniel Smith': '/images/smith.jpg',
  'Daniel Jones': '/images/jones.jpg',
  Ana: '/images/ana.jpg',
  'Dane Twelly': '/images/dane.jpg',
  'Priya Nair': '/images/priya.jpg',
};

/** Props for Astryx's Avatar: the name, plus `src` when this person has a photo (omitted otherwise). */
export function avatarProps(name: string): { name: string } | { name: string; src: string } {
  const src = PHOTOS[name];
  return src ? { name, src } : { name };
}
