import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  ClipboardList,
  GraduationCap,
  Lightbulb,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { L, Lang } from '../i18n';

/*
 * Site content in English and French, side by side. Text fields are `L`
 * values ({ en, fr }); pages pick the current language with `tx()` from
 * useI18n(). Enum-like fields (animal, level, format, job type, experience)
 * stay in English — they're used for filtering and stored values — and are
 * translated for display via src/i18n/messages.ts.
 */

export interface Service {
  id: string;
  icon: LucideIcon;
  title: L;
  summary: L;
  features: L<string[]>;
  link: string;
  linkLabel: L;
}

export const SERVICES: Service[] = [
  {
    id: 'startup',
    icon: Lightbulb,
    title: { en: 'Business Start-Up Consulting', fr: 'Conseil à la création d’entreprise' },
    summary: {
      en: 'Turn your idea into a bankable livestock business with a clear plan, the right site and a realistic budget.',
      fr: 'Transformez votre idée en un élevage finançable, avec un plan clair, le bon site et un budget réaliste.',
    },
    features: {
      en: [
        'Feasibility study & market assessment',
        'Business plan and financial projections',
        'Site selection, housing & equipment design',
        'Licensing, permits and biosecurity setup',
      ],
      fr: [
        'Étude de faisabilité et analyse de marché',
        'Business plan et prévisions financières',
        'Choix du site, conception des bâtiments et équipements',
        'Licences, autorisations et mise en place de la biosécurité',
      ],
    },
    link: '/start-a-farm',
    linkLabel: { en: 'See the start-up roadmap', fr: 'Voir la feuille de route' },
  },
  {
    id: 'management',
    icon: ClipboardList,
    title: { en: 'Farm Management', fr: 'Gestion d’exploitation' },
    summary: {
      en: 'Hands-on support to run healthy, efficient flocks and herds — from young stock to market.',
      fr: 'Un accompagnement concret pour des troupeaux sains et performants — des jeunes animaux jusqu’à la vente.',
    },
    features: {
      en: [
        'Animal health, vaccination & biosecurity plans',
        'Feed formulation and feed-efficiency optimisation',
        'Record keeping and production dashboards',
        'Routine farm audits and troubleshooting',
      ],
      fr: [
        'Plans de santé animale, de vaccination et de biosécurité',
        'Formulation des rations et optimisation de l’efficacité alimentaire',
        'Tenue des registres et tableaux de bord de production',
        'Audits réguliers et résolution de problèmes',
      ],
    },
    link: '/contact?service=management',
    linkLabel: { en: 'Request a farm visit', fr: 'Demander une visite' },
  },
  {
    id: 'training',
    icon: GraduationCap,
    title: { en: 'Training & Mentorship', fr: 'Formation et accompagnement' },
    summary: {
      en: 'Practical courses in poultry, pigs, goats, rabbits and many more animals — for beginners, farm workers and managers.',
      fr: 'Des formations pratiques en volailles, porcs, chèvres, lapins et bien d’autres animaux — pour débutants, ouvriers et responsables.',
    },
    features: {
      en: [
        'Courses in poultry, pigs, goats, rabbits, sheep, cattle, fish & bees',
        'Beginner-friendly — no experience needed',
        'Hands-on farm attachments',
        'Farm manager leadership programme',
        'Certificates of completion',
      ],
      fr: [
        'Formations en volailles, porcs, chèvres, lapins, moutons, bovins, poissons et abeilles',
        'Accessibles aux débutants — aucune expérience requise',
        'Stages pratiques en ferme',
        'Programme de leadership pour chefs d’exploitation',
        'Certificats de fin de formation',
      ],
    },
    link: '/training',
    linkLabel: { en: 'Browse courses', fr: 'Voir les formations' },
  },
  {
    id: 'hiring',
    icon: Users,
    title: { en: 'Hiring & Workforce', fr: 'Recrutement et main-d’œuvre' },
    summary: {
      en: 'We connect farms with reliable people — experienced hands and motivated newcomers we train for you.',
      fr: 'Nous mettons les fermes en relation avec du personnel fiable — des travailleurs expérimentés et des débutants motivés que nous formons pour vous.',
    },
    features: {
      en: [
        'Recruitment of farm managers & attendants',
        'No-experience trainee placement programme',
        'Skills screening and onboarding',
        'Staff performance & retention advice',
      ],
      fr: [
        'Recrutement de chefs d’exploitation et d’ouvriers agricoles',
        'Programme de placement de stagiaires sans expérience',
        'Évaluation des compétences et intégration',
        'Conseils en performance et fidélisation du personnel',
      ],
    },
    link: '/careers',
    linkLabel: { en: 'Visit the jobs board', fr: 'Voir les offres d’emploi' },
  },
  {
    id: 'profitability',
    icon: TrendingUp,
    title: { en: 'Profitability Planning', fr: 'Planification de la rentabilité' },
    summary: {
      en: 'Know your numbers. We help you cut costs, price right and grow margins cycle after cycle.',
      fr: 'Maîtrisez vos chiffres. Nous vous aidons à réduire vos coûts, à bien fixer vos prix et à améliorer vos marges, cycle après cycle.',
    },
    features: {
      en: [
        'Cost-of-production analysis',
        'Break-even and pricing strategy',
        'Market linkages & off-take agreements',
        'Financing and investor readiness',
      ],
      fr: [
        'Analyse des coûts de production',
        'Seuil de rentabilité et stratégie de prix',
        'Accès aux marchés et contrats d’achat',
        'Financement et préparation aux investisseurs',
      ],
    },
    link: '/calculator',
    linkLabel: { en: 'Try the profit calculator', fr: 'Essayer le calculateur' },
  },
  {
    id: 'investors',
    icon: Briefcase,
    title: { en: 'Investor & Expansion Advisory', fr: 'Conseil aux investisseurs et croissance' },
    summary: {
      en: 'Scaling up or investing in livestock? Get independent due diligence and an expansion blueprint.',
      fr: 'Vous agrandissez votre élevage ou investissez dans le secteur ? Obtenez un audit indépendant et un plan de développement.',
    },
    features: {
      en: [
        'Farm valuation & due diligence',
        'Expansion and automation planning',
        'Hatchery, breeding & feed mill integration',
        'Value-addition (processing, dairy, packaging)',
      ],
      fr: [
        'Évaluation d’exploitation et audit préalable',
        'Plans d’extension et d’automatisation',
        'Intégration couvoir, reproduction et provenderie',
        'Valorisation (transformation, laiterie, conditionnement)',
      ],
    },
    link: '/contact?service=investors',
    linkLabel: { en: 'Talk to an advisor', fr: 'Parler à un conseiller' },
  },
];

/** Animals we train on. 'All animals' courses appear under every animal filter. */
export const ANIMALS = ['Poultry', 'Pigs', 'Goats', 'Rabbits', 'Sheep', 'Cattle', 'Fish', 'Bees'] as const;
export type Animal = (typeof ANIMALS)[number] | 'All animals';

/** Shown on the "Don't see your animal?" card — trained on request. */
export const OTHER_ANIMALS: L<string[]> = {
  en: ['snails', 'quail', 'turkeys', 'ducks', 'guinea fowl', 'grasscutter (cane rat)'],
  fr: ['d’escargots', 'de cailles', 'de dindes', 'de canards', 'de pintades', 'd’aulacodes'],
};

export type Level = 'Beginner' | 'Intermediate' | 'Advanced';
export type Format = 'Online' | 'On-farm' | 'Hybrid';

export interface Course {
  id: string;
  animal: Animal;
  level: Level;
  format: Format;
  title: L;
  duration: L;
  audience: L;
  description: L;
  modules: L<string[]>;
}

const weeks = (n: number): L => ({ en: `${n} week${n > 1 ? 's' : ''}`, fr: `${n} semaine${n > 1 ? 's' : ''}` });
const days = (n: number): L => ({ en: `${n} days`, fr: `${n} jours` });

export const COURSES: Course[] = [
  {
    id: 'intro',
    animal: 'Poultry',
    level: 'Beginner',
    format: 'Hybrid',
    title: { en: 'Poultry Farming Foundations', fr: 'Les bases de l’aviculture' },
    duration: weeks(4),
    audience: { en: 'New entrepreneurs & career changers', fr: 'Nouveaux entrepreneurs et personnes en reconversion' },
    description: {
      en: 'Everything you need to understand before buying your first birds.',
      fr: 'Tout ce qu’il faut savoir avant d’acheter vos premières volailles.',
    },
    modules: {
      en: ['Broilers vs layers vs dual-purpose', 'Housing & equipment basics', 'Brooding day-old chicks', 'Costs and first budget'],
      fr: ['Chair, ponte ou mixte', 'Bases du logement et des équipements', 'Démarrage des poussins d’un jour', 'Coûts et premier budget'],
    },
  },
  {
    id: 'broiler',
    animal: 'Poultry',
    level: 'Intermediate',
    format: 'On-farm',
    title: { en: 'Broiler Production Masterclass', fr: 'Masterclass poulets de chair' },
    duration: weeks(2),
    audience: { en: 'Farm owners & supervisors', fr: 'Éleveurs et chefs d’équipe' },
    description: {
      en: 'Grow birds to target weight faster with lower feed cost and mortality.',
      fr: 'Atteignez plus vite le poids cible, avec moins d’aliment et moins de mortalité.',
    },
    modules: {
      en: ['Feed conversion ratio (FCR)', 'Lighting & ventilation', 'Disease prevention', 'Harvest & marketing'],
      fr: ['Indice de consommation (IC)', 'Éclairage et ventilation', 'Prévention des maladies', 'Enlèvement et commercialisation'],
    },
  },
  {
    id: 'layer',
    animal: 'Poultry',
    level: 'Intermediate',
    format: 'Hybrid',
    title: { en: 'Layer & Egg Production', fr: 'Poules pondeuses et production d’œufs' },
    duration: weeks(3),
    audience: { en: 'Farm owners & supervisors', fr: 'Éleveurs et chefs d’équipe' },
    description: {
      en: 'Maximise hen-day production and egg quality across the laying cycle.',
      fr: 'Optimisez le taux de ponte et la qualité des œufs tout au long du cycle.',
    },
    modules: {
      en: ['Pullet rearing', 'Lay-rate management', 'Egg handling & grading', 'Spent-hen planning'],
      fr: ['Élevage des poulettes', 'Pilotage du taux de ponte', 'Manipulation et calibrage des œufs', 'Gestion des poules de réforme'],
    },
  },
  {
    id: 'attendant',
    animal: 'Poultry',
    level: 'Beginner',
    format: 'On-farm',
    title: { en: 'Farm Attendant Certificate', fr: 'Certificat d’ouvrier avicole' },
    duration: days(10),
    audience: { en: 'Job seekers with no experience', fr: 'Chercheurs d’emploi sans expérience' },
    description: {
      en: 'Job-ready skills for daily farm work — graduates join our placement pool.',
      fr: 'Des compétences opérationnelles pour le travail quotidien — les diplômés rejoignent notre vivier de placement.',
    },
    modules: {
      en: ['Daily routines & hygiene', 'Feeding & watering', 'Spotting sick birds', 'Record keeping'],
      fr: ['Routines quotidiennes et hygiène', 'Alimentation et abreuvement', 'Repérer les oiseaux malades', 'Tenue des registres'],
    },
  },
  {
    id: 'biosecurity',
    animal: 'Poultry',
    level: 'Advanced',
    format: 'Online',
    title: { en: 'Biosecurity & Flock Health', fr: 'Biosécurité et santé du troupeau' },
    duration: weeks(2),
    audience: { en: 'Managers & veterinary assistants', fr: 'Responsables et auxiliaires vétérinaires' },
    description: {
      en: 'Protect your investment with disease control protocols that actually get followed.',
      fr: 'Protégez votre investissement avec des protocoles sanitaires réellement appliqués.',
    },
    modules: {
      en: ['Vaccination schedules', 'Outbreak response', 'Visitor & vehicle control', 'Audit checklists'],
      fr: ['Programmes de vaccination', 'Réponse aux foyers de maladie', 'Contrôle des visiteurs et véhicules', 'Listes de contrôle d’audit'],
    },
  },
  {
    id: 'business',
    animal: 'All animals',
    level: 'Intermediate',
    format: 'Online',
    title: { en: 'Livestock Business & Finance', fr: 'Gestion et finances de l’élevage' },
    duration: weeks(3),
    audience: { en: 'Owners & investors', fr: 'Exploitants et investisseurs' },
    description: {
      en: 'Build budgets, read your numbers and present your farm to lenders.',
      fr: 'Construisez vos budgets, lisez vos chiffres et présentez votre ferme aux financeurs.',
    },
    modules: {
      en: ['Cost of production', 'Pricing & break-even', 'Cash-flow planning', 'Pitching to lenders'],
      fr: ['Coût de production', 'Prix et seuil de rentabilité', 'Plan de trésorerie', 'Convaincre les financeurs'],
    },
  },
  {
    id: 'pigs',
    animal: 'Pigs',
    level: 'Beginner',
    format: 'Hybrid',
    title: { en: 'Pig Farming Essentials', fr: 'L’essentiel de l’élevage porcin' },
    duration: weeks(3),
    audience: { en: 'New and small-scale pig farmers', fr: 'Éleveurs de porcs débutants ou à petite échelle' },
    description: {
      en: 'Set up and run a profitable piggery, from sow to market weight.',
      fr: 'Créez et gérez une porcherie rentable, de la truie jusqu’au porc charcutier.',
    },
    modules: {
      en: ['Breeds, pens & farrowing housing', 'Feeding from weaning to finishing', 'Breeding & farrowing management', 'Biosecurity, African swine fever & deworming'],
      fr: ['Races, loges et maternité', 'Alimentation du sevrage à la finition', 'Reproduction et gestion des mises bas', 'Biosécurité, peste porcine africaine et déparasitage'],
    },
  },
  {
    id: 'goats',
    animal: 'Goats',
    level: 'Beginner',
    format: 'On-farm',
    title: { en: 'Goat Farming for Meat & Milk', fr: 'Élevage caprin : viande et lait' },
    duration: weeks(2),
    audience: { en: 'Beginners & smallholders', fr: 'Débutants et petits exploitants' },
    description: {
      en: 'Raise healthy meat or dairy goats on pasture, browse or in zero-grazing units.',
      fr: 'Élevez des chèvres à viande ou laitières en bonne santé, au pâturage ou en stabulation.',
    },
    modules: {
      en: ['Choosing meat vs dairy breeds', 'Housing, pasture & feeding', 'Kidding & kid care', 'Hoof care, deworming & PPR vaccination'],
      fr: ['Choisir entre races à viande et laitières', 'Logement, pâturage et alimentation', 'Mises bas et soins aux chevreaux', 'Parage, déparasitage et vaccination contre la PPR'],
    },
  },
  {
    id: 'rabbits',
    animal: 'Rabbits',
    level: 'Beginner',
    format: 'Hybrid',
    title: { en: 'Rabbit Farming', fr: 'Cuniculture (élevage de lapins)' },
    duration: days(10),
    audience: { en: 'Beginners, youth & backyard farmers', fr: 'Débutants, jeunes et petits éleveurs familiaux' },
    description: {
      en: 'A low-cost, fast-return enterprise — ideal if you have little space or capital.',
      fr: 'Une activité peu coûteuse et vite rentable — idéale avec peu d’espace ou de capital.',
    },
    modules: {
      en: ['Hutch design & hygiene', 'Breeding cycles & record keeping', 'Pellets, forage & water', 'Disease prevention & selling rabbit meat'],
      fr: ['Conception des clapiers et hygiène', 'Cycles de reproduction et registres', 'Granulés, fourrage et eau', 'Prévention des maladies et vente de la viande'],
    },
  },
  {
    id: 'sheep',
    animal: 'Sheep',
    level: 'Intermediate',
    format: 'On-farm',
    title: { en: 'Sheep Production', fr: 'Élevage ovin' },
    duration: weeks(2),
    audience: { en: 'Farm owners & herders', fr: 'Éleveurs et bergers' },
    description: {
      en: 'Grow a productive flock with better lambing rates and market-ready rams.',
      fr: 'Développez un troupeau productif, avec de meilleurs taux d’agnelage et des béliers prêts pour la vente.',
    },
    modules: {
      en: ['Flock planning & breed selection', 'Lambing & lamb survival', 'Grazing & supplementary feeding', 'Parasite control & fattening for festive markets'],
      fr: ['Planification du troupeau et choix des races', 'Agnelage et survie des agneaux', 'Pâturage et complémentation', 'Lutte antiparasitaire et embouche pour les fêtes'],
    },
  },
  {
    id: 'cattle',
    animal: 'Cattle',
    level: 'Intermediate',
    format: 'Hybrid',
    title: { en: 'Dairy & Beef Cattle Management', fr: 'Élevage bovin : lait et viande' },
    duration: weeks(4),
    audience: { en: 'Farm owners & herd managers', fr: 'Éleveurs et responsables de troupeau' },
    description: {
      en: 'Improve milk yield, weight gain and herd health on small and commercial farms.',
      fr: 'Améliorez la production laitière, le gain de poids et la santé du troupeau, en petite ou grande exploitation.',
    },
    modules: {
      en: ['Breed selection for milk or beef', 'Forage, silage & ration planning', 'Milking hygiene & milk handling', 'Breeding, AI basics & herd health'],
      fr: ['Choix des races laitières ou à viande', 'Fourrage, ensilage et rationnement', 'Hygiène de traite et manipulation du lait', 'Reproduction, bases de l’insémination et santé du troupeau'],
    },
  },
  {
    id: 'fish',
    animal: 'Fish',
    level: 'Beginner',
    format: 'Hybrid',
    title: { en: 'Fish Farming: Catfish & Tilapia', fr: 'Pisciculture : silure et tilapia' },
    duration: weeks(3),
    audience: { en: 'Beginners & landowners with water access', fr: 'Débutants et propriétaires ayant accès à l’eau' },
    description: {
      en: 'Start a pond or tank fish farm and harvest your first batch with confidence.',
      fr: 'Lancez votre élevage en étang ou en bac et réussissez votre première récolte.',
    },
    modules: {
      en: ['Pond & tank construction', 'Water quality management', 'Fingerlings, stocking & feeding', 'Harvesting, smoking & marketing'],
      fr: ['Construction d’étangs et de bacs', 'Gestion de la qualité de l’eau', 'Alevins, empoissonnement et alimentation', 'Récolte, fumage et commercialisation'],
    },
  },
  {
    id: 'bees',
    animal: 'Bees',
    level: 'Beginner',
    format: 'On-farm',
    title: { en: 'Beekeeping & Honey Production', fr: 'Apiculture et production de miel' },
    duration: weeks(1),
    audience: { en: 'Anyone — great as a side income', fr: 'Tout public — idéal comme revenu complémentaire' },
    description: {
      en: 'Keep healthy colonies and harvest, process and sell quality honey and wax.',
      fr: 'Entretenez des colonies saines et récoltez, transformez et vendez un miel et une cire de qualité.',
    },
    modules: {
      en: ['Hive types & apiary siting', 'Colony inspection & management', 'Honey harvesting & processing', 'Pests, diseases & safe handling'],
      fr: ['Types de ruches et emplacement du rucher', 'Visite et conduite des colonies', 'Récolte et transformation du miel', 'Nuisibles, maladies et manipulation en sécurité'],
    },
  },
];

export interface RoadmapStep {
  id: string;
  title: L;
  timeframe: L;
  description: L;
  tasks: L<string[]>;
}

export const ROADMAP: RoadmapStep[] = [
  {
    id: 'research',
    title: { en: 'Research & choose your model', fr: 'S’informer et choisir son modèle' },
    timeframe: { en: 'Weeks 1–2', fr: 'Semaines 1 à 2' },
    description: {
      en: 'Decide what you will produce and for whom before spending money.',
      fr: 'Décidez de ce que vous allez produire, et pour qui, avant de dépenser.',
    },
    tasks: {
      en: [
        'Choose your animal and model (e.g. broilers, layers, pigs, goats)',
        'Identify buyers (markets, hotels, retailers, processors)',
        'Visit at least two working farms',
        'Check local prices for young stock, feed and products',
      ],
      fr: [
        'Choisir son animal et son modèle (ex. poulets de chair, pondeuses, porcs, chèvres)',
        'Identifier les acheteurs (marchés, hôtels, commerçants, transformateurs)',
        'Visiter au moins deux fermes en activité',
        'Relever les prix locaux des jeunes animaux, de l’aliment et des produits',
      ],
    },
  },
  {
    id: 'plan',
    title: { en: 'Business plan & budget', fr: 'Business plan et budget' },
    timeframe: { en: 'Weeks 2–4', fr: 'Semaines 2 à 4' },
    description: {
      en: 'Put your numbers on paper — this is what lenders and partners will ask for.',
      fr: 'Mettez vos chiffres sur papier — c’est ce que demanderont banques et partenaires.',
    },
    tasks: {
      en: [
        'Estimate start-up costs (housing, equipment, first animals)',
        'Estimate profitability (poultry calculator, or with a consultant)',
        'Plan working capital for at least 2 cycles',
        'Identify funding: savings, loans, grants, partners',
      ],
      fr: [
        'Estimer les coûts de démarrage (bâtiments, équipements, premiers animaux)',
        'Estimer la rentabilité (calculateur avicole ou avec un consultant)',
        'Prévoir un fonds de roulement pour au moins 2 cycles',
        'Trouver le financement : épargne, prêts, subventions, partenaires',
      ],
    },
  },
  {
    id: 'site',
    title: { en: 'Site, permits & housing', fr: 'Site, autorisations et bâtiments' },
    timeframe: { en: 'Weeks 4–10', fr: 'Semaines 4 à 10' },
    description: {
      en: 'Secure a suitable location and build housing designed for your climate.',
      fr: 'Trouvez un emplacement adapté et construisez des bâtiments conçus pour votre climat.',
    },
    tasks: {
      en: [
        'Select a site with water, road access and good drainage',
        'Obtain required permits and registrations',
        'Build or adapt housing suited to your animals and climate',
        'Install feeders, drinkers and any brooding or farrowing equipment',
      ],
      fr: [
        'Choisir un site avec de l’eau, un accès routier et un bon drainage',
        'Obtenir les autorisations et enregistrements nécessaires',
        'Construire ou adapter des bâtiments adaptés à vos animaux et au climat',
        'Installer mangeoires, abreuvoirs et équipements de démarrage ou de maternité',
      ],
    },
  },
  {
    id: 'people',
    title: { en: 'Team & training', fr: 'Équipe et formation' },
    timeframe: { en: 'Weeks 8–10', fr: 'Semaines 8 à 10' },
    description: {
      en: 'Hire and train the people who will care for your animals every day.',
      fr: 'Recrutez et formez les personnes qui s’occuperont de vos animaux au quotidien.',
    },
    tasks: {
      en: [
        'Define roles: manager, attendants, security',
        'Recruit through the PoultryPath jobs board',
        'Complete a beginner course for your animal',
        'Write daily & weekly routine checklists',
      ],
      fr: [
        'Définir les rôles : responsable, ouvriers, gardiennage',
        'Recruter via le site d’emploi PoultryPath',
        'Suivre une formation pour débutants sur votre animal',
        'Rédiger les listes de tâches quotidiennes et hebdomadaires',
      ],
    },
  },
  {
    id: 'stock',
    title: { en: 'Source animals & inputs', fr: 'Acheter les animaux et les intrants' },
    timeframe: { en: 'Weeks 10–11', fr: 'Semaines 10 à 11' },
    description: {
      en: 'Buy healthy young stock and feed from trusted suppliers.',
      fr: 'Achetez des jeunes animaux sains et de l’aliment auprès de fournisseurs de confiance.',
    },
    tasks: {
      en: [
        'Book chicks, piglets, kids or fingerlings from certified breeders',
        'Arrange a reliable feed supplier',
        'Stock vaccines and a basic medicine kit',
        'Clean, disinfect and prepare housing before arrival',
      ],
      fr: [
        'Réserver poussins, porcelets, chevreaux ou alevins auprès d’éleveurs certifiés',
        'Trouver un fournisseur d’aliment fiable',
        'Constituer un stock de vaccins et une trousse de soins',
        'Nettoyer, désinfecter et préparer les bâtiments avant l’arrivée',
      ],
    },
  },
  {
    id: 'operate',
    title: { en: 'Launch, record & sell', fr: 'Lancer, enregistrer et vendre' },
    timeframe: { en: 'Week 12 onward', fr: 'À partir de la semaine 12' },
    description: {
      en: 'Raise your first batch, track everything and close your first sales.',
      fr: 'Élevez votre premier lot, suivez tout et concluez vos premières ventes.',
    },
    tasks: {
      en: [
        'Record feed, mortality and weight daily',
        'Follow the vaccination schedule',
        'Confirm buyers before your first sales',
        'Review results and improve for the next cycle',
      ],
      fr: [
        'Noter chaque jour l’aliment, la mortalité et le poids',
        'Suivre le programme de vaccination',
        'Confirmer les acheteurs avant les premières ventes',
        'Analyser les résultats et s’améliorer pour le cycle suivant',
      ],
    },
  },
];

export type ExperienceLevel = 'No experience' | 'Entry level' | 'Experienced';
/** Livestock a job involves (same list as the training filter). */
export type JobAnimal = (typeof ANIMALS)[number];
export type JobType = 'Full-time' | 'Part-time' | 'Internship' | 'Contract';

/** A job as displayed on the board (approved employer posts arrive like this from Convex). */
export interface Job {
  id: string;
  title: string;
  farm: string;
  location: string;
  type: JobType;
  experience: ExperienceLevel;
  trainingProvided: boolean;
  animals: JobAnimal[];
  description: string;
  requirements: string[];
  postedAt: string; // ISO date
}

interface SampleJob extends Omit<Job, 'title' | 'farm' | 'location' | 'description' | 'requirements'> {
  title: L;
  farm: L;
  location: L;
  description: L;
  requirements: L<string[]>;
}

const RURAL: L = { en: 'Rural', fr: 'Zone rurale' };

/**
 * Example listings shown alongside real (admin-approved) job posts.
 * Set to false once you have real vacancies on the board.
 */
export const SHOW_SAMPLE_JOBS = true;

/** Example listings — replace or hide via SHOW_SAMPLE_JOBS. */
const SAMPLE_JOBS: SampleJob[] = [
  {
    id: 'sample-1',
    title: { en: 'Farm Attendant Trainee', fr: 'Ouvrier agricole stagiaire' },
    farm: { en: 'Sunrise Layers (sample)', fr: 'Sunrise Layers (exemple)' },
    location: { en: 'Peri-urban', fr: 'Périurbain' },
    type: 'Full-time',
    experience: 'No experience',
    trainingProvided: true,
    animals: ['Poultry'],
    description: {
      en: 'Join our team and learn feeding, egg collection and hygiene routines from day one.',
      fr: 'Rejoignez notre équipe et apprenez dès le premier jour l’alimentation, le ramassage des œufs et les routines d’hygiène.',
    },
    requirements: {
      en: ['Reliable and punctual', 'Willing to work early mornings', 'Completes the Attendant Certificate'],
      fr: ['Fiable et ponctuel', 'Disponible tôt le matin', 'Suivre le Certificat d’ouvrier avicole'],
    },
    postedAt: '2026-11-05',
  },
  {
    id: 'sample-2',
    title: { en: 'Broiler Farm Supervisor', fr: 'Chef d’équipe — poulets de chair' },
    farm: { en: 'GreenValley Broilers (sample)', fr: 'GreenValley Broilers (exemple)' },
    location: RURAL,
    type: 'Full-time',
    experience: 'Experienced',
    trainingProvided: false,
    animals: ['Poultry'],
    description: {
      en: 'Lead a team of 6 managing 10,000 birds per cycle with a focus on FCR and mortality.',
      fr: 'Encadrez une équipe de 6 personnes pour 10 000 oiseaux par cycle, avec un objectif d’IC et de mortalité.',
    },
    requirements: {
      en: ['3+ years broiler experience', 'Team leadership', 'Basic record keeping & reporting'],
      fr: ['3 ans ou plus en poulets de chair', 'Encadrement d’équipe', 'Tenue de registres et reporting'],
    },
    postedAt: '2026-11-02',
  },
  {
    id: 'sample-3',
    title: { en: 'Livestock Farming Intern', fr: 'Stagiaire en élevage' },
    farm: { en: 'PoultryPath Training Centre', fr: 'Centre de formation PoultryPath' },
    location: { en: 'Training centre', fr: 'Centre de formation' },
    type: 'Internship',
    experience: 'No experience',
    trainingProvided: true,
    animals: ['Poultry', 'Pigs', 'Goats'],
    description: {
      en: '3-month paid internship rotating through poultry, pigs, goats, feed and sales.',
      fr: 'Stage rémunéré de 3 mois en rotation : volailles, porcs, chèvres, aliment et vente.',
    },
    requirements: {
      en: ['Interest in agriculture', 'Age 18+', 'Eager to learn'],
      fr: ['Intérêt pour l’agriculture', '18 ans ou plus', 'Envie d’apprendre'],
    },
    postedAt: '2026-10-28',
  },
  {
    id: 'sample-7',
    title: { en: 'Piggery Attendant', fr: 'Ouvrier en porcherie' },
    farm: { en: 'Riverside Pig Farm (sample)', fr: 'Riverside Pig Farm (exemple)' },
    location: RURAL,
    type: 'Full-time',
    experience: 'No experience',
    trainingProvided: true,
    animals: ['Pigs'],
    description: {
      en: 'Feed, clean and monitor sows and growers. Full training in hygiene and farrowing care.',
      fr: 'Nourrir, nettoyer et surveiller truies et porcs en croissance. Formation complète à l’hygiène et aux mises bas.',
    },
    requirements: {
      en: ['Physically fit', 'Comfortable working with animals', 'Willing to learn'],
      fr: ['Bonne condition physique', 'À l’aise avec les animaux', 'Envie d’apprendre'],
    },
    postedAt: '2026-11-04',
  },
  {
    id: 'sample-8',
    title: { en: 'Goat & Sheep Herd Assistant', fr: 'Aide-berger — chèvres et moutons' },
    farm: { en: 'Hillside Small Ruminants (sample)', fr: 'Hillside Small Ruminants (exemple)' },
    location: RURAL,
    type: 'Full-time',
    experience: 'Entry level',
    trainingProvided: true,
    animals: ['Goats', 'Sheep'],
    description: {
      en: 'Help manage a 150-head goat and sheep herd: grazing, kidding season and health checks.',
      fr: 'Participez à la conduite d’un troupeau de 150 chèvres et moutons : pâturage, mises bas et suivi sanitaire.',
    },
    requirements: {
      en: ['Some livestock experience is a plus', 'Early starts', 'Basic record keeping'],
      fr: ['Une première expérience en élevage est un plus', 'Horaires matinaux', 'Tenue de registres simple'],
    },
    postedAt: '2026-10-30',
  },
  {
    id: 'sample-9',
    title: { en: 'Fish Farm Assistant', fr: 'Aide-pisciculteur' },
    farm: { en: 'Lakeside Aquaculture (sample)', fr: 'Lakeside Aquaculture (exemple)' },
    location: RURAL,
    type: 'Full-time',
    experience: 'No experience',
    trainingProvided: true,
    animals: ['Fish'],
    description: {
      en: 'Feed catfish and tilapia, check water quality and help at harvest. Full training provided.',
      fr: 'Nourrir silures et tilapias, contrôler la qualité de l’eau et aider aux récoltes. Formation complète assurée.',
    },
    requirements: {
      en: ['Comfortable working outdoors and near water', 'Reliable and punctual', 'Willing to learn'],
      fr: ['À l’aise en extérieur et près de l’eau', 'Fiable et ponctuel', 'Envie d’apprendre'],
    },
    postedAt: '2026-11-03',
  },
  {
    id: 'sample-10',
    title: { en: 'Dairy Herd Hand', fr: 'Agent d’élevage laitier' },
    farm: { en: 'Green Pastures Dairy (sample)', fr: 'Green Pastures Dairy (exemple)' },
    location: RURAL,
    type: 'Full-time',
    experience: 'Entry level',
    trainingProvided: true,
    animals: ['Cattle'],
    description: {
      en: 'Milk, feed and care for a 40-cow dairy herd. Early-morning milking shifts.',
      fr: 'Traire, nourrir et soigner un troupeau laitier de 40 vaches. Traite tôt le matin.',
    },
    requirements: {
      en: ['Some experience with cattle is a plus', 'Early starts', 'Good hygiene habits'],
      fr: ['Une expérience avec les bovins est un plus', 'Horaires matinaux', 'Rigueur en matière d’hygiène'],
    },
    postedAt: '2026-10-27',
  },
  {
    id: 'sample-4',
    title: { en: 'Egg Grading & Packing Assistant', fr: 'Agent de calibrage et d’emballage des œufs' },
    farm: { en: 'Golden Yolk Farms (sample)', fr: 'Golden Yolk Farms (exemple)' },
    location: { en: 'Town centre', fr: 'Centre-ville' },
    type: 'Part-time',
    experience: 'Entry level',
    trainingProvided: true,
    animals: ['Poultry'],
    description: {
      en: 'Sort, grade and pack eggs for retail customers. Afternoons, 4 days per week.',
      fr: 'Trier, calibrer et emballer les œufs pour la vente au détail. L’après-midi, 4 jours par semaine.',
    },
    requirements: {
      en: ['Careful with detail', 'Some farm or warehouse experience is a plus'],
      fr: ['Minutieux', 'Une expérience en ferme ou en entrepôt est un plus'],
    },
    postedAt: '2026-10-25',
  },
  {
    id: 'sample-5',
    title: { en: 'Farm Manager — Layers', fr: 'Chef d’exploitation — pondeuses' },
    farm: { en: 'Highland Poultry (sample)', fr: 'Highland Poultry (exemple)' },
    location: RURAL,
    type: 'Full-time',
    experience: 'Experienced',
    trainingProvided: false,
    animals: ['Poultry'],
    description: {
      en: 'Own production, staff and budget for a 20,000-hen layer operation.',
      fr: 'Pilotez la production, le personnel et le budget d’un élevage de 20 000 pondeuses.',
    },
    requirements: {
      en: ['5+ years in layer production', 'Budgeting & reporting', 'Diploma in animal science preferred'],
      fr: ['5 ans ou plus en production d’œufs', 'Budget et reporting', 'Diplôme en productions animales souhaité'],
    },
    postedAt: '2026-10-20',
  },
  {
    id: 'sample-6',
    title: { en: 'Biosecurity Officer', fr: 'Responsable biosécurité' },
    farm: { en: 'Contract — multiple farms', fr: 'Contrat — plusieurs fermes' },
    location: { en: 'Regional', fr: 'Régional' },
    type: 'Contract',
    experience: 'Entry level',
    trainingProvided: true,
    animals: ['Poultry', 'Pigs', 'Cattle'],
    description: {
      en: 'Run visitor control, disinfection and audit checklists across partner farms.',
      fr: 'Assurez le contrôle des visiteurs, la désinfection et les audits dans les fermes partenaires.',
    },
    requirements: {
      en: ['1 year in livestock or food safety', 'Own transport preferred'],
      fr: ['1 an en élevage ou en sécurité alimentaire', 'Moyen de transport personnel souhaité'],
    },
    postedAt: '2026-10-15',
  },
];

/** Sample jobs in the given language, ready to show alongside approved posts. */
export const sampleJobs = (lang: Lang): Job[] =>
  SAMPLE_JOBS.map((j) => ({
    ...j,
    title: j.title[lang],
    farm: j.farm[lang],
    location: j.location[lang],
    description: j.description[lang],
    requirements: j.requirements[lang],
  }));
