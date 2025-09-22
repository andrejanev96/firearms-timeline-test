import type { Firearm } from '@/types/quiz';

export const firearms: Firearm[] = [
  { id: '1', name: 'Kentucky Long Rifle', description: 'American frontier hunting rifle', correctPosition: 0, year: 1750, image: `${import.meta.env.BASE_URL}images/kentucky_rifle.png` },
  { id: '2', name: 'Colt Walker Revolver', description: 'Powerful six-shooter for Texas Rangers', correctPosition: 1, year: 1847, image: `${import.meta.env.BASE_URL}images/colt_walker.png` },
  { id: '3', name: 'Spencer Repeating Rifle', description: 'Civil War seven-shot repeater', correctPosition: 2, year: 1860, image: `${import.meta.env.BASE_URL}images/spencer_rifle.png` },
  { id: '4', name: 'Winchester Model 1873', description: 'The Gun That Won the West', correctPosition: 3, year: 1873, image: `${import.meta.env.BASE_URL}images/winchester_1873.png` },
  { id: '5', name: 'Colt Single Action Army', description: 'Peacemaker revolver of the Old West', correctPosition: 4, year: 1873, image: `${import.meta.env.BASE_URL}images/colt_saa.png` },
  { id: '6', name: 'Winchester Model 1894', description: 'Popular lever-action hunting rifle', correctPosition: 5, year: 1894, image: `${import.meta.env.BASE_URL}images/winchester_1894.png` },
  { id: '7', name: 'Colt M1911', description: 'Legendary military semi-automatic pistol', correctPosition: 6, year: 1911, image: `${import.meta.env.BASE_URL}images/colt_1911.png` },
  { id: '8', name: 'Thompson Submachine Gun', description: 'Tommy Gun of the Prohibition era', correctPosition: 7, year: 1918, image: `${import.meta.env.BASE_URL}images/thompson_smg.png` },
  { id: '9', name: 'M1 Garand', description: 'WWII semi-automatic battle rifle', correctPosition: 8, year: 1936, image: `${import.meta.env.BASE_URL}images/m1_garand.png` },
  { id: '10', name: 'ArmaLite AR-15', description: 'Modern sporting rifle platform', correctPosition: 9, year: 1959, image: `${import.meta.env.BASE_URL}images/ar15.png` },
  { id: '11', name: 'Ruger 10/22', description: 'Popular .22 caliber rifle', correctPosition: 10, year: 1964, image: `${import.meta.env.BASE_URL}images/ruger_1022.png` },
  { id: '12', name: 'Glock 17 (US Production)', description: 'Austrian design, American-made variant', correctPosition: 11, year: 2013, image: `${import.meta.env.BASE_URL}images/glock_17.png` }
];
