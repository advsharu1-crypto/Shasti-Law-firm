// Court guides added 9 November 2026: Poonamallee, Pallavaram, Kanchipuram.
// Facts come from the official district-judiciary pages named in shasti-three-location-court-research.md. Needs counsel review before publication.
// The firm's only office is West Mambalam, Chennai. A listed court or locality is not an office.

const SOURCES = {
  tiruvallur: [
    ['Tiruvallur District Judiciary', 'https://tiruvallur.dcourts.gov.in/'],
    ['Tiruvallur: courts at Poonamallee', 'https://tiruvallur.dcourts.gov.in/?p=5694'],
    ['Tiruvallur: list of judges', 'https://tiruvallur.dcourts.gov.in/list-of-judges/'],
  ],
  kanchipuram: [
    ['Kancheepuram District Judiciary', 'https://kanchipuram.dcourts.gov.in/'],
    ['Kancheepuram: court complexes and establishments', 'https://kanchipuram.dcourts.gov.in/?p=5688'],
  ],
};

const COURTS = [
  {
    slug: 'poonamallee-courts-guide',
    short: 'Poonamallee Courts Guide',
    h1: 'Poonamallee Courts Guide',
    district: 'Tiruvallur district',
    reviewed: '9 November 2026',
    metaDesc: 'The courts the Tiruvallur pages list at Poonamallee, the separate special Bomb Blast Sessions Court, and how a case is matched to a court. Consultations at West Mambalam.',
    subtitle: 'What the official Tiruvallur pages list at Poonamallee, how the special Bomb Blast Sessions Court differs from the ordinary courts, and why the case and not the locality decides where it is heard.',
    sources: ['tiruvallur', 'chennai'],
    official: [
      { h: 'Combined Courts, Poonamallee (listed on the Tiruvallur district pages)', items: [
        'Additional District and Sessions Courts. The two Tiruvallur pages reviewed name them differently (II and III Additional District and Sessions Court on one, IV Additional District and Sessions Judge on the other), so this guide does not say how many there are.',
        'A Sub Court. The judges list also names an Additional Sub Judge.',
        'A Principal District Munsif Court. The judges list names a District Munsif.',
        'Judicial Magistrate Courts No. I and No. II.',
        'A Fast Track Court at Magisterial Level.',
      ] },
      { h: 'A separate special court at Poonamallee', items: [
        'The Chennai City Courts directory lists a Sessions Court for the exclusive trial of Bomb Blast Cases at Poonamallee.',
        'It is a special court listed by the Chennai City Courts. It is separate from the ordinary Poonamallee Combined Courts above.',
        'This guide does not say that the special court hears ordinary criminal, bail, family or divorce matters.',
      ] },
      { h: 'Not shown in the Poonamallee listings reviewed', items: [
        'A Family Court. This does not prove that none serves the area; see Part 4.',
        'A street address for the complex. This guide gives none.',
      ] },
    ],
    matters: [
      ['Anticipatory bail', 'Court of Session or the Madras High Court. A Magistrate court does not usually hear it. See our anticipatory bail page for Poonamallee.'],
      ['Regular bail and criminal trials', 'Magistrate courts or the Court of Session, depending on the offence and the stage.'],
      ['Divorce, custody, maintenance', 'A Family Court, subject to territorial jurisdiction. The Poonamallee listing reviewed does not show one.'],
      ['Domestic Violence Act applications', 'A Magistrate; Section 27 of the Act allows more than one possible court.'],
      ['Civil suits and recovery', 'Munsif, Sub and District courts, according to value and territorial jurisdiction.'],
      ['Quashing, appeals, revisions', 'Madras High Court.'],
    ],
    general: [
      'Poonamallee is in the Tiruvallur district, and its courts are listed on the Tiruvallur district judiciary pages as "Combined Courts, Poonamallee". The district has its own judiciary, separate from the Chennai City Courts, although one special court at Poonamallee is listed in the Chennai City Courts directory (above).',
      'The Tiruvallur pages reviewed list the courts by name. They do not describe each court’s powers or the areas it serves, so this guide does not either. A court being listed in a place does not mean it hears every kind of case from that area.',
      'People often ask whether a case from Poonamallee goes to the Poonamallee court. The answer depends on the case: the offence or the cause of action, its value for a civil claim, the stage, and where the parties live or the event happened.',
    ],
    jurisdiction: [
      'Whether a court can hear a case depends on the subject, the stage, the value of a civil claim, and where the offence or the cause of action arose or the parties live. A police station or a postal address is a pointer, not the answer.',
      'Chennai, Chengalpattu and Kancheepuram have their own judiciaries. This guide covers only what the Tiruvallur pages list at Poonamallee and the one special court named above.',
    ],
    confirm: [
      'Whether the two Tiruvallur pages, which name the Poonamallee courts differently, are both current.',
      'Whether a Family Court serves petitions from a Poonamallee address, and which one.',
      'Which Poonamallee court takes up an application for anticipatory bail or regular bail in a particular case.',
      'Current address and building of the complex, which this guide does not state.',
      'Whether Shasti Law Firm appears before these courts. Nothing here says that it does, and the firm’s only office is at West Mambalam, Chennai.',
    ],
    related: ['criminal-lawyer-poonamallee', 'bail-lawyer-poonamallee', 'anticipatory-bail-lawyer-poonamallee', 'divorce-lawyer-poonamallee', 'domestic-violence-lawyer-poonamallee'],
    courtLinks: ['chennai-courts-guide', 'kanchipuram-courts-guide'],
  },
  {
    slug: 'pallavaram-courts-guide',
    short: 'Pallavaram Courts Guide',
    h1: 'Pallavaram Courts Guide',
    district: 'Chengalpattu district',
    reviewed: '9 November 2026',
    metaDesc: 'The single court the Chengalpattu district directory lists at Pallavaram, what it does not list there, and how a case is matched to a court. Consultations at West Mambalam.',
    subtitle: 'What the official Chengalpattu district directory lists at Pallavaram, what it does not, and why the case and not the locality decides where it is heard.',
    sources: ['chengalpattu', 'hc'],
    official: [
      { h: 'Single Court Complex, Pallavaram (listed in the Chengalpattu district directory)', items: [
        'A District Munsif cum Judicial Magistrate Court. The entry names Pallavaram as its taluk.',
      ] },
      { h: 'Not listed at Pallavaram', items: [
        'The directory lists no Family Court, Sessions Court or Mahila Court at Pallavaram. This guide does not say that Pallavaram has any of them.',
        'A street address. The entry shows only a court email, and this guide gives none.',
      ] },
      { h: 'Where the directory lists those courts', items: [
        'Chengalpattu: the Principal District Court and an Additional District Court, a Family Court, a Mahila Court and an Additional Mahila Court, Commercial Courts, and Magistrate courts.',
        'Alandur and Tambaram: combined complexes of civil and Magistrate courts. See the Alandur Courts Guide and the Tambaram Courts Guide.',
      ] },
    ],
    matters: [
      ['Anticipatory bail', 'Court of Session or the Madras High Court. A Magistrate court does not usually hear it. See our anticipatory bail page for the Chengalpattu district.'],
      ['Regular bail and criminal trials', 'Magistrate courts or the Court of Session, depending on the offence and the stage.'],
      ['Divorce, custody, maintenance', 'A Family Court, subject to territorial jurisdiction. The directory lists one at Chengalpattu and none at Pallavaram.'],
      ['Domestic Violence Act applications', 'A Magistrate; Section 27 of the Act allows more than one possible court.'],
      ['Civil suits and recovery', 'Munsif, Sub and District courts, according to value and territorial jurisdiction.'],
      ['Quashing, appeals, revisions', 'Madras High Court.'],
    ],
    general: [
      'Pallavaram is in the Chengalpattu district, not in the Chennai City Courts. The district directory lists a Single Court Complex at Pallavaram with one court, a District Munsif cum Judicial Magistrate Court.',
      'A single-court complex is not a full court complex. A court being listed at Pallavaram does not mean it hears every kind of case from the area, and the directory does not describe its powers, so this guide does not.',
      'Chengalpattu has its own district judiciary, constituted in March 2024 when the Kancheepuram judiciary was divided. The Chengalpattu Courts Guide sets out the whole district listing.',
    ],
    jurisdiction: [
      'Whether a court can hear a case depends on the subject, the stage, the value of a civil claim, and where the offence or the cause of action arose or the parties live. A police station or a postal address is a pointer, not the answer.',
      'Chennai, Tiruvallur and Kancheepuram have their own judiciaries. This guide covers only what the Chengalpattu district directory lists.',
    ],
    confirm: [
      'Which court (Pallavaram, Tambaram, Alandur or Chengalpattu) takes up a particular criminal case or bail application.',
      'Which Family Court serves a petition from a Pallavaram address.',
      'Whether any Family Court, Sessions Court or Mahila Court serves Pallavaram, which the directory does not list.',
      'Current address of the Pallavaram court, which this guide does not state.',
      'Whether Shasti Law Firm appears before these courts. Nothing here says that it does, and the firm’s only office is at West Mambalam, Chennai.',
    ],
    related: ['criminal-lawyer-pallavaram', 'divorce-lawyer-pallavaram', 'domestic-violence-lawyer-pallavaram', 'anticipatory-bail-lawyer-chengalpattu'],
    courtLinks: ['chengalpattu-courts-guide', 'tambaram-courts-guide', 'alandur-courts-guide'],
  },
  {
    slug: 'kanchipuram-courts-guide',
    short: 'Kanchipuram Courts Guide',
    h1: 'Kanchipuram Courts Guide',
    district: 'Kancheepuram district',
    reviewed: '9 November 2026',
    metaDesc: 'The courts the Kancheepuram (Kanchipuram) district pages list, what they do not list, and how a case is matched to a court. Consultations at West Mambalam, Chennai.',
    subtitle: 'What the official Kancheepuram (Kanchipuram) district pages list, what they do not, and why the case and not the locality decides where it is heard.',
    sources: ['kanchipuram', 'chengalpattu'],
    official: [
      { h: 'Combined Courts, Kancheepuram (listed on the district pages)', items: [
        'The Principal District and Sessions Court.',
        'A Sub Court and a Principal District Munsif Court.',
        'The Chief Judicial Magistrate Court, and Judicial Magistrate Courts No. I and No. II.',
        'A Special District Court to deal with MCOP cases (motor accident claims).',
      ] },
      { h: 'Other establishments listed at Kancheepuram', items: [
        'A Labour Court.',
        'A Motor Accident Claim Tribunal Court, listed as a complex of its own.',
      ] },
      { h: 'Other places in the district', items: [
        'Sriperumbudur: Combined Courts, with a Judicial Magistrate Court and a District Munsif Court.',
        'Uthiramerur: a District Munsif cum Judicial Magistrate Court.',
      ] },
      { h: 'Not shown in the listing reviewed', items: [
        'A Family Court. This guide does not say that Kanchipuram has none, and does not say where a family case from Kanchipuram is heard; see Part 4.',
        'Street addresses or a building name. This guide gives none.',
      ] },
    ],
    matters: [
      ['Anticipatory bail', 'Court of Session or the Madras High Court. A Magistrate court does not usually hear it. See our anticipatory bail page for Kanchipuram.'],
      ['Regular bail and criminal trials', 'Magistrate courts or the Court of Session, depending on the offence and the stage.'],
      ['Divorce, custody, maintenance', 'A Family Court, subject to territorial jurisdiction. The listing reviewed does not show one.'],
      ['Domestic Violence Act applications', 'A Magistrate; Section 27 of the Act allows more than one possible court.'],
      ['Civil suits and recovery', 'Munsif, Sub and District courts, according to value and territorial jurisdiction.'],
      ['Quashing, appeals, revisions', 'Madras High Court.'],
    ],
    general: [
      'The official pages spell the district "Kancheepuram" and use "Kanchipuram" in the web address. This guide uses Kanchipuram, and quotes the official spelling where it reproduces a listing.',
      'Kancheepuram has its own district judiciary, separate from Chengalpattu. The Chengalpattu judiciary was constituted in March 2024 when the Kancheepuram judiciary was divided, so older documents may show courts under the earlier arrangement. This guide does not mix the two districts’ courts, addresses or jurisdiction.',
      'The district pages list the courts by name and place. They do not describe each court’s powers or the areas it serves, so this guide does not either. A court being listed in a place does not mean it hears every kind of case from that area.',
    ],
    jurisdiction: [
      'Whether a court can hear a case depends on the subject, the stage, the value of a civil claim, and where the offence or the cause of action arose or the parties live. A police station or a postal address is a pointer, not the answer.',
      'Chennai, Chengalpattu and Tiruvallur have their own judiciaries. This guide covers only what the Kancheepuram district pages list.',
    ],
    confirm: [
      'Whether the Kancheepuram Contact Us page, which could not be opened when this guide was prepared, lists further courts such as additional courts or a mobile court.',
      'Whether a Family Court serves a petition from a Kanchipuram address, and which one.',
      'Which Kanchipuram court takes up an application for anticipatory bail or regular bail in a particular case.',
      'Current address and building of the Combined Courts, which this guide does not state.',
      'Whether Shasti Law Firm appears before these courts. Nothing here says that it does, and the firm’s only office is at West Mambalam, Chennai.',
    ],
    related: ['criminal-lawyer-kanchipuram', 'bail-lawyer-kanchipuram', 'anticipatory-bail-lawyer-kanchipuram', 'divorce-lawyer-kanchipuram', 'domestic-violence-lawyer-kanchipuram'],
    courtLinks: ['chengalpattu-courts-guide', 'chennai-courts-guide', 'poonamallee-courts-guide'],
  },
];

module.exports = { COURTS, SOURCES };
