import { UnitContextQuestion, UnitContextQuestionBank, VocabPracticeType } from '../types';

export interface PracticeCardConfig {
  id: VocabPracticeType;
  icon: string;
  name: string;
  shortTitle: string;
  instruction: string;
  passingScore: number;
  numberOfQuestions: number;
  scorePerQuestion: number;
  badge: string;
}

export const VOCAB_PRACTICE_CONFIGS: Record<VocabPracticeType, PracticeCardConfig> = {
  match: {
    id: 'match',
    icon: '🧩',
    name: 'Nối từ với nghĩa',
    shortTitle: 'Nối từ',
    instruction: 'Nối từ tiếng Anh với nghĩa tiếng Việt phù hợp.',
    passingScore: 80,
    numberOfQuestions: 5,
    scorePerQuestion: 20,
    badge: '5 cặp từ',
  },
  choose_meaning: {
    id: 'choose_meaning',
    icon: '✅',
    name: 'Chọn nghĩa đúng',
    shortTitle: 'Chọn nghĩa',
    instruction: 'Chọn nghĩa tiếng Việt đúng của từ tiếng Anh.',
    passingScore: 80,
    numberOfQuestions: 10,
    scorePerQuestion: 10,
    badge: '10 câu',
  },
  listen_and_choose: {
    id: 'listen_and_choose',
    icon: '🎧',
    name: 'Nghe và chọn từ',
    shortTitle: 'Nghe & chọn',
    instruction: 'Nghe từ chuẩn giọng British English và chọn từ em nghe được.',
    passingScore: 80,
    numberOfQuestions: 10,
    scorePerQuestion: 10,
    badge: 'Giọng en-GB',
  },
  type_word: {
    id: 'type_word',
    icon: '✍️',
    name: 'Viết từ',
    shortTitle: 'Viết từ',
    instruction: 'Nhìn nghĩa tiếng Việt và viết từ/cụm từ tiếng Anh phù hợp.',
    passingScore: 80,
    numberOfQuestions: 10,
    scorePerQuestion: 10,
    badge: 'Gõ từ vựng',
  },
  complete_sentence: {
    id: 'complete_sentence',
    icon: '📝',
    name: 'Điền từ vào câu',
    shortTitle: 'Điền câu',
    instruction: 'Điền từ hoặc cụm từ thích hợp vào chỗ trống trong ngữ cảnh.',
    passingScore: 80,
    numberOfQuestions: 10,
    scorePerQuestion: 10,
    badge: '10 câu ngữ cảnh',
  },
  challenge: {
    id: 'challenge',
    icon: '🏆',
    name: 'Vocabulary Challenge',
    shortTitle: 'Challenge',
    instruction: 'Hoàn thành 10 câu tổng hợp. Em cần đạt ít nhất 80% để hoàn thành Vocabulary của Unit.',
    passingScore: 80,
    numberOfQuestions: 10,
    scorePerQuestion: 10,
    badge: 'Thử thách Unit',
  },
};

export const UNIT_CONTEXT_QUESTION_BANKS: UnitContextQuestionBank[] = [
  {
    unit: 1,
    title: 'LOCAL COMMUNITY',
    questions: [
      {
        id: 'U1VQ01',
        sentence: 'The ______ showed us how to make traditional pottery.',
        answer: 'artisan',
      },
      {
        id: 'U1VQ02',
        sentence: 'Bat Trang is a famous ______ near Ha Noi.',
        answer: 'craft village',
      },
      {
        id: 'U1VQ03',
        sentence: 'Local people want to ______ their traditional crafts.',
        answer: 'preserve',
      },
      {
        id: 'U1VQ04',
        sentence: 'The village is now a popular ______ for visitors.',
        answer: 'tourist attraction',
      },
      {
        id: 'U1VQ05',
        sentence: 'My mother bought some beautiful ______ at the village.',
        answer: 'pottery',
      },
      {
        id: 'U1VQ06',
        sentence: 'An ______ can repair electrical problems in your home.',
        answer: 'electrician',
      },
      {
        id: 'U1VQ07',
        sentence: 'A ______ helps put out fires and rescue people.',
        answer: 'firefighter',
      },
      {
        id: 'U1VQ08',
        sentence: 'Traditional skills are often ______ from one generation to another.',
        answer: 'passed down',
      },
      {
        id: 'U1VQ09',
        sentence: 'We should ______ the amount of plastic we use.',
        answer: 'cut down on',
      },
      {
        id: 'U1VQ10',
        sentence: 'The school has good sports and learning ______.',
        answer: 'facilities',
      },
    ],
  },
  {
    unit: 2,
    title: 'CITY LIFE',
    questions: [
      {
        id: 'U2VQ01',
        sentence: 'The city centre is always ______ at weekends.',
        answer: 'bustling',
      },
      {
        id: 'U2VQ02',
        sentence: 'The roads are badly ______ during rush hour.',
        answer: 'congested',
      },
      {
        id: 'U2VQ03',
        sentence: 'We took the ______ to travel quickly across the city.',
        answer: 'metro',
      },
      {
        id: 'U2VQ04',
        sentence: 'Traffic is usually heavy during ______.',
        answer: 'rush hour',
      },
      {
        id: 'U2VQ05',
        sentence: 'This neighbourhood is quiet, green and very ______.',
        answer: 'liveable',
      },
      {
        id: 'U2VQ06',
        sentence: 'We went ______ to do some shopping in the city centre.',
        answer: 'downtown',
      },
      {
        id: 'U2VQ07',
        sentence: 'Public transport makes it easier to ______ the city.',
        answer: 'get around',
      },
      {
        id: 'U2VQ08',
        sentence: 'Parks, libraries and sports centres are useful ______.',
        answer: 'public amenities',
      },
      {
        id: 'U2VQ09',
        sentence: 'The restaurant is nice, but the food is quite ______.',
        answer: 'pricey',
      },
      {
        id: 'U2VQ10',
        sentence: 'A ______ runs on rails along city streets.',
        answer: 'tram',
      },
    ],
  },
  {
    unit: 3,
    title: 'HEALTHY LIVING FOR TEENS',
    questions: [
      {
        id: 'U3VQ01',
        sentence: 'I have to finish this ______ before Friday.',
        answer: 'assignment',
      },
      {
        id: 'U3VQ02',
        sentence: 'The ______ for our science project is next Monday.',
        answer: 'deadline',
      },
      {
        id: 'U3VQ03',
        sentence: 'Students should give ______ to the most important tasks.',
        answer: 'priority',
      },
      {
        id: 'U3VQ04',
        sentence: 'Social media can be a major ______ when you are studying.',
        answer: 'distraction',
      },
      {
        id: 'U3VQ05',
        sentence: 'Good planning helps students ______ their goals.',
        answer: 'accomplish',
      },
      {
        id: 'U3VQ06',
        sentence: 'Talk to a school ______ if you are worried about your problems.',
        answer: 'counsellor',
      },
      {
        id: 'U3VQ07',
        sentence: 'Too much stress can negatively affect your ______ health.',
        answer: 'mental',
      },
      {
        id: 'U3VQ08',
        sentence: 'Mai stays ______ even when she has a difficult problem.',
        answer: 'optimistic',
      },
      {
        id: 'U3VQ09',
        sentence: 'A ______ lifestyle includes study, exercise and relaxation.',
        answer: 'well-balanced',
      },
      {
        id: 'U3VQ10',
        sentence: 'I feel ______ because I have too much homework.',
        answer: 'stressed out',
      },
    ],
  },
  {
    unit: 4,
    title: 'REMEMBERING THE PAST',
    questions: [
      {
        id: 'U4VQ01',
        sentence: 'The tourists visited an ______ temple built hundreds of years ago.',
        answer: 'ancient',
      },
      {
        id: 'U4VQ02',
        sentence: 'The children often walked ______ in the countryside.',
        answer: 'barefoot',
      },
      {
        id: 'U4VQ03',
        sentence: 'The king lived in a large ______.',
        answer: 'castle',
      },
      {
        id: 'U4VQ04',
        sentence: 'The village has a large ______ house where people meet.',
        answer: 'communal',
      },
      {
        id: 'U4VQ05',
        sentence: 'Respect for older people is a ______ tradition in many families.',
        answer: 'deep-rooted',
      },
      {
        id: 'U4VQ06',
        sentence: 'People communicated ______ more often in the past.',
        answer: 'face to face',
      },
      {
        id: 'U4VQ07',
        sentence: 'Each ______ has different memories of the past.',
        answer: 'generation',
      },
      {
        id: 'U4VQ08',
        sentence: 'The city built a ______ to remember the national heroes.',
        answer: 'monument',
      },
      {
        id: 'U4VQ09',
        sentence: 'Many families still ______ traditional customs.',
        answer: 'observe',
      },
      {
        id: 'U4VQ10',
        sentence: 'The ancient building has a strong stone ______.',
        answer: 'structure',
      },
    ],
  },
  {
    unit: 5,
    title: 'OUR EXPERIENCES',
    questions: [
      {
        id: 'U5VQ01',
        sentence: 'Our trip to Ha Long Bay was an ______ experience.',
        answer: 'amazing',
      },
      {
        id: 'U5VQ02',
        sentence: 'The university has a beautiful green ______.',
        answer: 'campus',
      },
      {
        id: 'U5VQ03',
        sentence: 'Speaking in front of the class helped me gain ______.',
        answer: 'confidence',
      },
      {
        id: 'U5VQ04',
        sentence: 'We saw colourful fish while exploring the ______.',
        answer: 'coral reef',
      },
      {
        id: 'U5VQ05',
        sentence: 'Our family joined an ______ to learn about nature.',
        answer: 'eco-tour',
      },
      {
        id: 'U5VQ06',
        sentence: 'The roller-coaster ride was exciting and ______.',
        answer: 'thrilling',
      },
      {
        id: 'U5VQ07',
        sentence: 'It was a very ______ trip that I will never forget.',
        answer: 'memorable',
      },
      {
        id: 'U5VQ08',
        sentence: 'We went ______ to see fish under the water.',
        answer: 'snorkelling',
      },
      {
        id: 'U5VQ09',
        sentence: 'Students should ______ new places and learn from experience.',
        answer: 'explore',
      },
      {
        id: 'U5VQ10',
        sentence: 'The ______ of the forest includes many kinds of wild animals.',
        answer: 'fauna',
      },
    ],
  },
  {
    unit: 6,
    title: 'VIETNAMESE LIFESTYLE: THEN AND NOW',
    questions: [
      {
        id: 'U6VQ01',
        sentence: 'In the past, many people lived in ______ families.',
        answer: 'extended',
      },
      {
        id: 'U6VQ02',
        sentence: 'Young children are usually ______ on their parents.',
        answer: 'dependent',
      },
      {
        id: 'U6VQ03',
        sentence: 'Vietnamese society is strongly ______.',
        answer: 'family-oriented',
      },
      {
        id: 'U6VQ04',
        sentence: 'Modern technology has changed our ______.',
        answer: 'lifestyle',
      },
      {
        id: 'U6VQ05',
        sentence: 'A family with parents and children only is a ______ family.',
        answer: 'nuclear',
      },
      {
        id: 'U6VQ06',
        sentence: 'There can be a generation ______ between parents and teenagers.',
        answer: 'gap',
      },
      {
        id: 'U6VQ07',
        sentence: 'Students should ______ important information before a test.',
        answer: 'memorise',
      },
      {
        id: 'U6VQ08',
        sentence: 'Everyone needs some ______ in their personal life.',
        answer: 'privacy',
      },
      {
        id: 'U6VQ09',
        sentence: 'Many young people ______ higher education after school.',
        answer: 'pursue',
      },
      {
        id: 'U6VQ10',
        sentence: 'Digital devices may ______ some traditional tools.',
        answer: 'replace',
      },
    ],
  },
  {
    unit: 7,
    title: 'NATURAL WONDERS OF THE WORLD',
    questions: [
      {
        id: 'U7VQ01',
        sentence: 'Visitors can ______ the cave only by boat.',
        answer: 'access',
      },
      {
        id: 'U7VQ02',
        sentence: 'The national park has rich ______ with many plants and animals.',
        answer: 'biodiversity',
      },
      {
        id: 'U7VQ03',
        sentence: 'The Great Barrier Reef is famous for its colourful ______.',
        answer: 'coral',
      },
      {
        id: 'U7VQ04',
        sentence: 'Ha Long Bay is a popular tourist ______.',
        answer: 'destination',
      },
      {
        id: 'U7VQ05',
        sentence: 'Every plant and animal plays a role in the ______.',
        answer: 'ecosystem',
      },
      {
        id: 'U7VQ06',
        sentence: 'One special ______ of the cave is its huge entrance.',
        answer: 'feature',
      },
      {
        id: 'U7VQ07',
        sentence: 'The waterfall is ______ in a remote area.',
        answer: 'located',
      },
      {
        id: 'U7VQ08',
        sentence: 'Visitors should respect the natural environment of the ______.',
        answer: 'site',
      },
      {
        id: 'U7VQ09',
        sentence: 'The park attracts thousands of visitors every year because of its natural ______.',
        answer: 'beauty',
      },
      {
        id: 'U7VQ10',
        sentence: 'Protecting natural wonders helps future ______ enjoy them.',
        answer: 'generations',
      },
    ],
  },
  {
    unit: 8,
    title: 'TOURISM',
    questions: [
      {
        id: 'U8VQ01',
        sentence: 'We booked our holiday through a travel ______.',
        answer: 'agency',
      },
      {
        id: 'U8VQ02',
        sentence: 'The travel agent gave us a colourful ______.',
        answer: 'brochure',
      },
      {
        id: 'U8VQ03',
        sentence: 'Paris is a world-famous tourist ______.',
        answer: 'destination',
      },
      {
        id: 'U8VQ04',
        sentence: 'We chose a ______ because accommodation and transport were included.',
        answer: 'package tour',
      },
      {
        id: 'U8VQ05',
        sentence: 'Some tourists prefer a ______ tour so they can travel independently.',
        answer: 'self-guided',
      },
      {
        id: 'U8VQ06',
        sentence: 'We like to ______ around old streets when we travel.',
        answer: 'wander',
      },
      {
        id: 'U8VQ07',
        sentence: 'We need to ______ the total cost before booking.',
        answer: 'work out',
      },
      {
        id: 'U8VQ08',
        sentence: 'Trying local dishes is an important part of ______ tourism.',
        answer: 'food',
      },
      {
        id: 'U8VQ09',
        sentence: 'Buying local products is popular with people interested in ______ tourism.',
        answer: 'shopping',
      },
      {
        id: 'U8VQ10',
        sentence: 'Responsible visitors should support ______ tourism.',
        answer: 'sustainable',
      },
    ],
  },
  {
    unit: 9,
    title: 'WORLD ENGLISHES',
    questions: [
      {
        id: 'U9VQ01',
        sentence: 'A person who can use two languages is ______.',
        answer: 'bilingual',
      },
      {
        id: 'U9VQ02',
        sentence: 'English has many ______ from other languages.',
        answer: 'borrowed words',
      },
      {
        id: 'U9VQ03',
        sentence: 'An ______ lives in a country different from the country where they were born.',
        answer: 'immigrant',
      },
      {
        id: 'U9VQ04',
        sentence: 'A student who speaks English naturally and easily is ______.',
        answer: 'fluent',
      },
      {
        id: 'U9VQ05',
        sentence: 'You should ______ new vocabulary before the test.',
        answer: 'go over',
      },
      {
        id: 'U9VQ06',
        sentence: 'English is used as a ______ in many countries.',
        answer: 'second language',
      },
      {
        id: 'U9VQ07',
        sentence: 'Can you ______ this sentence into English?',
        answer: 'translate',
      },
      {
        id: 'U9VQ08',
        sentence: 'British English is one ______ of English.',
        answer: 'variety',
      },
      {
        id: 'U9VQ09',
        sentence: 'Reading regularly helps learners increase their ______.',
        answer: 'vocabulary',
      },
      {
        id: 'U9VQ10',
        sentence: 'Our school welcomed an ______ from Australia.',
        answer: 'exchange student',
      },
    ],
  },
  {
    unit: 10,
    title: 'PLANET EARTH',
    questions: [
      {
        id: 'U10VQ01',
        sentence: 'Climate change can ______ ecosystems around the world.',
        answer: 'affect',
      },
      {
        id: 'U10VQ02',
        sentence: 'We should ______ the beauty and importance of nature.',
        answer: 'appreciate',
      },
      {
        id: 'U10VQ03',
        sentence: '______ is causing temperatures to rise.',
        answer: 'climate change',
      },
      {
        id: 'U10VQ04',
        sentence: 'Clean water is ______ for all living things.',
        answer: 'essential',
      },
      {
        id: 'U10VQ05',
        sentence: 'Human activities can disturb the ______ of an ecosystem.',
        answer: 'ecological balance',
      },
      {
        id: 'U10VQ06',
        sentence: 'Farmers should use ______ carefully because they can harm wildlife.',
        answer: 'pesticides',
      },
      {
        id: 'U10VQ07',
        sentence: "The polar regions are found near the Earth's north and south ______.",
        answer: 'poles',
      },
      {
        id: 'U10VQ08',
        sentence: 'We must ______ natural habitats for future generations.',
        answer: 'preserve',
      },
      {
        id: 'U10VQ09',
        sentence: 'Pollution is a serious ______ to wildlife.',
        answer: 'threat',
      },
      {
        id: 'U10VQ10',
        sentence: 'Healthy ecosystems are ______ to life on Earth.',
        answer: 'vital',
      },
    ],
  },
  {
    unit: 11,
    title: 'ELECTRONIC DEVICES',
    questions: [
      {
        id: 'U11VQ01',
        sentence: 'I use an ______ to read digital books.',
        answer: 'e-reader',
      },
      {
        id: 'U11VQ02',
        sentence: 'Our school bought a new ______ to make models.',
        answer: '3D printer',
      },
      {
        id: 'U11VQ03',
        sentence: 'Read the ______ before using the device.',
        answer: 'leaflet',
      },
      {
        id: 'U11VQ04',
        sentence: 'Many electronic devices contain parts made of ______.',
        answer: 'plastic',
      },
      {
        id: 'U11VQ05',
        sentence: 'My headphones connect to my phone ______.',
        answer: 'wirelessly',
      },
      {
        id: 'U11VQ06',
        sentence: 'A tablet is a useful electronic ______ for learning.',
        answer: 'device',
      },
      {
        id: 'U11VQ07',
        sentence: 'The printer can create a three-dimensional ______.',
        answer: 'object',
      },
      {
        id: 'U11VQ08',
        sentence: 'Students should protect their online ______.',
        answer: 'privacy',
      },
      {
        id: 'U11VQ09',
        sentence: 'The device needs a good ______ to work for a long time.',
        answer: 'battery',
      },
      {
        id: 'U11VQ10',
        sentence: 'Follow the ______ carefully before operating the machine.',
        answer: 'instructions',
      },
    ],
  },
  {
    unit: 12,
    title: 'CAREER CHOICES',
    questions: [
      {
        id: 'U12VQ01',
        sentence: 'Choosing a ______ is an important decision for teenagers.',
        answer: 'career',
      },
      {
        id: 'U12VQ02',
        sentence: 'A ______ works with machines on a production line.',
        answer: 'assembly worker',
      },
      {
        id: 'U12VQ03',
        sentence: 'A ______ receives money from customers in a shop.',
        answer: 'cashier',
      },
      {
        id: 'U12VQ04',
        sentence: 'Some careers are physically and mentally ______.',
        answer: 'demanding',
      },
      {
        id: 'U12VQ05',
        sentence: 'A good manager often needs to be ______.',
        answer: 'decisive',
      },
      {
        id: 'U12VQ06',
        sentence: 'A garment worker works with different types of ______.',
        answer: 'fabric',
      },
      {
        id: 'U12VQ07',
        sentence: 'A ______ makes or repairs clothes.',
        answer: 'garment worker',
      },
      {
        id: 'U12VQ08',
        sentence: 'Surgeons need excellent ______.',
        answer: 'hand-eye coordination',
      },
      {
        id: 'U12VQ09',
        sentence: 'A ______ develops computer programs and systems.',
        answer: 'software engineer',
      },
      {
        id: 'U12VQ10',
        sentence: 'Many students want a rewarding and ______ job.',
        answer: 'well-paid',
      },
    ],
  },
];

export const getUnitContextQuestions = (unit: number): UnitContextQuestion[] => {
  const bank = UNIT_CONTEXT_QUESTION_BANKS.find((b) => b.unit === unit);
  return bank ? bank.questions : UNIT_CONTEXT_QUESTION_BANKS[0].questions;
};

// Normalize string for answer checking
export const normalizeWordAnswer = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/-/g, ' '); // Hyphen tolerance: "well-paid" -> "well paid"
};

// Check if student's answer matches target
export const checkWordAnswerMatch = (studentAns: string, targetAns: string): boolean => {
  const normStudent = normalizeWordAnswer(studentAns);
  const normTarget = normalizeWordAnswer(targetAns);
  
  if (normStudent === normTarget) return true;
  // Also check without removing hyphen for exact hyphen matching
  if (studentAns.trim().toLowerCase() === targetAns.trim().toLowerCase()) return true;
  
  return false;
};

// Generate masked hint (e.g., preserve -> p _ _ _ _ _ e)
export const generateWordMaskedHint = (word: string): string => {
  const clean = word.trim();
  if (clean.length <= 2) return clean;
  
  const words = clean.split(' ');
  return words
    .map((w) => {
      if (w.length <= 2) return w;
      const first = w.charAt(0);
      const last = w.charAt(w.length - 1);
      const blanks = Array(w.length - 2).fill('_').join(' ');
      return `${first} ${blanks} ${last}`;
    })
    .join('   ');
};
