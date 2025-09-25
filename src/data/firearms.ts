import type { Firearm } from '@/types/quiz';

export const firearms: Firearm[] = [
  {
    id: '1',
    name: 'Kentucky Long Rifle',
    description: 'American frontier hunting rifle',
    correctPosition: 0,
    year: 1750,
    image: `${import.meta.env.BASE_URL}images/kentucky_rifle.png`,
    imageLarge: `${import.meta.env.BASE_URL}images/large/kentucky_rifle.png`,
    facts: [
      'Also called the Pennsylvania rifle; developed by German-American gunsmiths.',
      'Long barrel and small-caliber ball gave excellent accuracy for the era.',
      'Used by American riflemen in the Revolutionary War and on the frontier.'
    ]
  },
  {
    id: '2',
    name: 'Colt Walker Revolver',
    description: 'Powerful six-shooter for Texas Rangers',
    correctPosition: 1,
    year: 1847,
    image: `${import.meta.env.BASE_URL}images/colt_walker.png`,
    imageLarge: `${import.meta.env.BASE_URL}images/large/colt_walker.png`,
    facts: [
      'Designed by Samuel Colt with Texas Ranger Capt. Samuel Walker.',
      'Massive .44 caliber cap-and-ball; among the most powerful handguns of its time.',
      'Issued during the Mexican–American War; heavy weight made it challenging to carry.'
    ]
  },
  {
    id: '3',
    name: 'Spencer Repeating Rifle',
    description: 'Civil War seven-shot repeater',
    correctPosition: 2,
    year: 1860,
    image: `${import.meta.env.BASE_URL}images/spencer_rifle.png`,
    imageLarge: `${import.meta.env.BASE_URL}images/large/spencer_rifle.png`,
    facts: [
      'Lever-action repeater with a 7-round tubular magazine in the buttstock.',
      'Used by Union cavalry and infantry in the American Civil War.',
      'Fired rimfire cartridges; greatly increased rate of fire versus muzzleloaders.'
    ]
  },
  {
    id: '4',
    name: 'Winchester Rifle',
    description: 'The Gun That Won the West',
    correctPosition: 3,
    year: 1873,
    image: `${import.meta.env.BASE_URL}images/winchester_1873.png`,
    imageLarge: `${import.meta.env.BASE_URL}images/large/winchester_1873.png`,
    facts: [
      'Model 1873; famous lever action for the .44-40 centerfire cartridge.',
      'Shared ammunition with many revolvers of the day for convenience.',
      'Widely used across the American West by settlers, lawmen, and outlaws.'
    ]
  },
  {
    id: '5',
    name: 'Colt Single Action Army',
    description: 'Peacemaker revolver of the Old West',
    correctPosition: 4,
    year: 1873,
    image: `${import.meta.env.BASE_URL}images/colt_saa.png`,
    imageLarge: `${import.meta.env.BASE_URL}images/large/colt_saa.png`,
    facts: [
      'Also known as the “Peacemaker”; adopted by the U.S. Army in the 1870s.',
      'Single-action, gate-loaded revolver most commonly chambered in .45 Colt.',
      'Iconic sidearm of the American West in law enforcement and ranching.'
    ]
  },
  {
    id: '6',
    name: 'Winchester Carbine',
    description: 'Popular lever-action hunting rifle',
    correctPosition: 5,
    year: 1894,
    image: `${import.meta.env.BASE_URL}images/winchester_1894.png`,
    imageLarge: `${import.meta.env.BASE_URL}images/large/winchester_1894.png`,
    facts: [
      'Model 1894 by John M. Browning; among the first rifles for smokeless powder.',
      'Famously chambered in .30-30 Winchester (originally .30 WCF).',
      'One of the best-selling sporting rifles of all time in North America.'
    ]
  },
  {
    id: '7',
    name: 'Colt Pistol',
    description: 'Legendary military semi-automatic pistol',
    correctPosition: 6,
    year: 1911,
    image: `${import.meta.env.BASE_URL}images/colt_1911.png`,
    imageLarge: `${import.meta.env.BASE_URL}images/large/colt_1911.png`,
    facts: [
      'John M. Browning design; adopted as the U.S. M1911 in .45 ACP.',
      'Served as the standard U.S. military sidearm for over 70 years.',
      'Short-recoil, single-action pistol; renowned for reliability and ergonomics.'
    ]
  },
  {
    id: '8',
    name: 'Thompson Submachine Gun',
    description: 'Tommy Gun of the Prohibition era',
    correctPosition: 7,
    year: 1918,
    image: `${import.meta.env.BASE_URL}images/thompson_smg.png`,
    imageLarge: `${import.meta.env.BASE_URL}images/large/thompson_smg.png`,
    facts: [
      'Fires .45 ACP; early models known for drum magazines and high rate of fire.',
      'Used by law enforcement and criminals in the Prohibition era.',
      'Saw extensive service with U.S. and Allied forces during World War II.'
    ]
  },
  {
    id: '9',
    name: 'M1 Garand',
    description: 'WWII semi-automatic battle rifle',
    correctPosition: 8,
    year: 1936,
    image: `${import.meta.env.BASE_URL}images/m1_garand.png`,
    imageLarge: `${import.meta.env.BASE_URL}images/large/m1_garand.png`,
    facts: [
      'Adopted in 1936; primary U.S. service rifle in WWII and Korea.',
      'Semiautomatic .30-06 with 8-round en bloc clip and distinctive “ping”.',
      'Described by Gen. Patton as “the greatest battle implement ever devised.”'
    ]
  },
  {
    id: '10',
    name: 'ArmaLite AR-15',
    description: 'Modern sporting rifle platform',
    correctPosition: 9,
    year: 1959,
    image: `${import.meta.env.BASE_URL}images/ar15.png`,
    imageLarge: `${import.meta.env.BASE_URL}images/large/ar15.png`,
    facts: [
      'Eugene Stoner design emphasizing lightweight materials and modularity.',
      'Civilian AR-15 platform inspired the U.S. military’s M16/M4 family.',
      'Typically chambered in .223 Remington/5.56×45mm; widely customizable.'
    ]
  },
  {
    id: '11',
    name: 'Ruger 10/22',
    description: 'Popular .22 caliber rifle',
    correctPosition: 10,
    year: 1964,
    image: `${import.meta.env.BASE_URL}images/ruger_1022.png`,
    imageLarge: `${import.meta.env.BASE_URL}images/large/ruger_1022.png`,
    facts: [
      'Semi-automatic .22 LR with a 10-round rotary magazine.',
      'Known for reliability, affordability, and vast aftermarket support.',
      'Common for training, small game, and target shooting.'
    ]
  },
  {
    id: '12',
    name: 'Smith & Wesson M&P9',
    description: 'Military & Police 9mm pistol',
    correctPosition: 11,
    year: 2005,
    image: `${import.meta.env.BASE_URL}images/sw_mp9.png`,
    imageLarge: `${import.meta.env.BASE_URL}images/large/sw_mp9.png`,
    facts: [
      'Polymer-framed, striker-fired 9×19mm pistol introduced in the mid‑2000s.',
      'Interchangeable backstraps and ambidextrous controls for broad fit.',
      'Adopted by many U.S. law enforcement agencies; 2.0 line refined the trigger and grip.'
    ]
  }
];
