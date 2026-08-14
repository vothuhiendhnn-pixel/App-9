import { ListeningUnit, ListeningLesson } from '../types';

export const LISTENING_UNITS_DATA: ListeningUnit[] = [
  {
    unit: 1,
    title: 'LOCAL COMMUNITY',
    lessons: [
      {
        id: 'U1L01',
        title: 'A Traditional Craft Village',
        audio: {
          mode: 'tts',
          audioUrl: '',
          audioScript:
            'Last weekend, our class visited a traditional craft village near our town. We met an experienced artisan who showed us how to make pottery. The villagers have made these products for many generations. They are trying to preserve their traditional skills and pass them down to young people. Today, the village is also a popular tourist attraction. Visitors can look around the workshops and buy original handmade products.',
        },
        displayText:
          'Last weekend, our class visited a traditional craft village near our town. We met an experienced (1) ______ who showed us how to make pottery. The villagers have made these products for many (2) ______. They are trying to (3) ______ their traditional skills and pass them down to young people. Today, the village is also a popular (4) ______. Visitors can buy (5) ______ handmade products.',
        blanks: [
          {
            blank: 1,
            answer: 'artisan',
            acceptedAnswers: ['artisan'],
          },
          {
            blank: 2,
            answer: 'generations',
            acceptedAnswers: ['generations'],
          },
          {
            blank: 3,
            answer: 'preserve',
            acceptedAnswers: ['preserve'],
          },
          {
            blank: 4,
            answer: 'tourist attraction',
            acceptedAnswers: ['tourist attraction'],
          },
          {
            blank: 5,
            answer: 'original',
            acceptedAnswers: ['original'],
          },
        ],
      },
      {
        id: 'U1L02',
        title: 'People in Our Community',
        audio: {
          mode: 'tts',
          audioUrl: '',
          audioScript:
            'Many people work hard to make our community a better place. A firefighter helps people when there is a fire or another dangerous situation. An electrician repairs electrical problems in houses and buildings. Delivery people bring packages to local homes. These community helpers provide important services. Thanks to their work and better public facilities, people in the neighbourhood can enjoy a safer and more convenient life.',
        },
        displayText:
          'Many people work hard to make our (1) ______ a better place. A (2) ______ helps people in dangerous situations. An (3) ______ repairs electrical problems. These community (4) ______ provide important services. Better public (5) ______ make life more convenient.',
        blanks: [
          {
            blank: 1,
            answer: 'community',
            acceptedAnswers: ['community'],
          },
          {
            blank: 2,
            answer: 'firefighter',
            acceptedAnswers: ['firefighter'],
          },
          {
            blank: 3,
            answer: 'electrician',
            acceptedAnswers: ['electrician'],
          },
          {
            blank: 4,
            answer: 'helpers',
            acceptedAnswers: ['helpers'],
          },
          {
            blank: 5,
            answer: 'facilities',
            acceptedAnswers: ['facilities'],
          },
        ],
      },
    ],
  },
  {
    unit: 2,
    title: 'CITY LIFE',
    lessons: [
      {
        id: 'U2L01',
        title: 'Life in the City Centre',
        audio: {
          mode: 'tts',
          audioUrl: '',
          audioScript:
            'I have lived in the city for five years. The city centre is always bustling, especially in the evening and at weekends. There are plenty of shops, restaurants and entertainment facilities. However, the streets are often congested during rush hour. Another problem is the high cost of living. Despite these disadvantages, I think the city is quite liveable because public transport and other services are convenient.',
        },
        displayText:
          'The city centre is always (1) ______. The streets are often (2) ______ during (3) ______. Another problem is the high (4) ______. Despite these disadvantages, I think the city is quite (5) ______.',
        blanks: [
          {
            blank: 1,
            answer: 'bustling',
            acceptedAnswers: ['bustling'],
          },
          {
            blank: 2,
            answer: 'congested',
            acceptedAnswers: ['congested'],
          },
          {
            blank: 3,
            answer: 'rush hour',
            acceptedAnswers: ['rush hour'],
          },
          {
            blank: 4,
            answer: 'cost of living',
            acceptedAnswers: ['cost of living'],
          },
          {
            blank: 5,
            answer: 'liveable',
            acceptedAnswers: ['liveable', 'livable'],
          },
        ],
      },
      {
        id: 'U2L02',
        title: 'Getting Around',
        audio: {
          mode: 'tts',
          audioUrl: '',
          audioScript:
            'When I need to travel downtown, I rarely go by car. I normally take the metro because it is quick and convenient. In some parts of the city, people can also use the underground, trams or the sky train. Public transport helps residents get around more easily. It can also reduce the number of private vehicles on the roads and make the city centre less crowded.',
        },
        displayText:
          'When I travel (1) ______, I normally take the (2) ______. People can also use the (3) ______, (4) ______ or the sky train. Public transport helps residents (5) ______ more easily.',
        blanks: [
          {
            blank: 1,
            answer: 'downtown',
            acceptedAnswers: ['downtown'],
          },
          {
            blank: 2,
            answer: 'metro',
            acceptedAnswers: ['metro'],
          },
          {
            blank: 3,
            answer: 'underground',
            acceptedAnswers: ['underground'],
          },
          {
            blank: 4,
            answer: 'trams',
            acceptedAnswers: ['trams', 'tram'],
          },
          {
            blank: 5,
            answer: 'get around',
            acceptedAnswers: ['get around'],
          },
        ],
      },
    ],
  },
  {
    unit: 3,
    title: 'HEALTHY LIVING FOR TEENS',
    lessons: [
      {
        id: 'U3L01',
        title: 'Managing Schoolwork',
        audio: {
          mode: 'tts',
          audioUrl: '',
          audioScript:
            'Teenagers often have several assignments to complete every week. Good time management can make school life less stressful. First, make a list of your tasks and give priority to the most important ones. Remember every deadline, so you do not have to finish everything at the last minute. While studying, turn off unnecessary notifications to reduce distractions. These simple habits can help you accomplish your goals.',
        },
        displayText:
          'Teenagers often have several (1) ______. Give (2) ______ to the most important tasks. Remember every (3) ______. Turn off unnecessary notifications to reduce (4) ______. These habits can help you (5) ______ your goals.',
        blanks: [
          {
            blank: 1,
            answer: 'assignments',
            acceptedAnswers: ['assignments', 'assignment'],
          },
          {
            blank: 2,
            answer: 'priority',
            acceptedAnswers: ['priority'],
          },
          {
            blank: 3,
            answer: 'deadline',
            acceptedAnswers: ['deadline'],
          },
          {
            blank: 4,
            answer: 'distractions',
            acceptedAnswers: ['distractions', 'distraction'],
          },
          {
            blank: 5,
            answer: 'accomplish',
            acceptedAnswers: ['accomplish'],
          },
        ],
      },
      {
        id: 'U3L02',
        title: 'Taking Care of Yourself',
        audio: {
          mode: 'tts',
          audioUrl: '',
          audioScript:
            'Good physical and mental health are both important for teenagers. Sometimes students experience anxiety because of schoolwork, examinations or problems with friends. If you feel stressed out, you should talk to someone you trust, such as a parent, teacher or counsellor. Try to stay optimistic and keep a well-balanced routine. Getting enough sleep, exercising and taking regular breaks can help you feel better.',
        },
        displayText:
          'Good (1) ______ and mental health are important. Students sometimes experience (2) ______. They can talk to a school (3) ______. Teenagers should try to stay (4) ______ and keep a (5) ______ routine.',
        blanks: [
          {
            blank: 1,
            answer: 'physical',
            acceptedAnswers: ['physical'],
          },
          {
            blank: 2,
            answer: 'anxiety',
            acceptedAnswers: ['anxiety'],
          },
          {
            blank: 3,
            answer: 'counsellor',
            acceptedAnswers: ['counsellor', 'counselor'],
          },
          {
            blank: 4,
            answer: 'optimistic',
            acceptedAnswers: ['optimistic'],
          },
          {
            blank: 5,
            answer: 'well-balanced',
            acceptedAnswers: ['well-balanced', 'well balanced'],
          },
        ],
      },
    ],
  },
  {
    unit: 4,
    title: 'REMEMBERING THE PAST',
    lessons: [
      {
        id: 'U4L01',
        title: "My Grandmother's Childhood",
        audio: {
          mode: 'tts',
          audioUrl: '',
          audioScript:
            'My grandmother often tells me about life when she was young. Several generations sometimes lived together in one house, and many customs were deep-rooted in the community. Children often went barefoot and spent most of their free time outdoors. People usually communicated face to face because there were no smartphones. Families also took part in communal activities and traditional festivals. My grandmother says life was simple but very meaningful.',
        },
        displayText:
          'Several (1) ______ sometimes lived together. Many customs were (2) ______ in the community. Children often went (3) ______. People usually communicated (4) ______. Families took part in (5) ______ activities.',
        blanks: [
          {
            blank: 1,
            answer: 'generations',
            acceptedAnswers: ['generations'],
          },
          {
            blank: 2,
            answer: 'deep-rooted',
            acceptedAnswers: ['deep-rooted', 'deep rooted'],
          },
          {
            blank: 3,
            answer: 'barefoot',
            acceptedAnswers: ['barefoot'],
          },
          {
            blank: 4,
            answer: 'face to face',
            acceptedAnswers: ['face to face', 'face-to-face'],
          },
          {
            blank: 5,
            answer: 'communal',
            acceptedAnswers: ['communal'],
          },
        ],
      },
      {
        id: 'U4L02',
        title: 'A Visit to an Old Site',
        audio: {
          mode: 'tts',
          audioUrl: '',
          audioScript:
            'Last month, our class visited an ancient complex in the countryside. The most impressive building was an old castle. We also saw several monuments which had been built to remember important people and events. Our guide explained when the site was founded and how local people had protected it. He also told us that villagers still observe some traditional customs there today.',
        },
        displayText:
          'Our class visited an (1) ______ complex. We saw an old (2) ______ and several (3) ______. The guide explained when the site was (4) ______. Villagers still (5) ______ some traditional customs.',
        blanks: [
          {
            blank: 1,
            answer: 'ancient',
            acceptedAnswers: ['ancient'],
          },
          {
            blank: 2,
            answer: 'castle',
            acceptedAnswers: ['castle'],
          },
          {
            blank: 3,
            answer: 'monuments',
            acceptedAnswers: ['monuments', 'monument'],
          },
          {
            blank: 4,
            answer: 'founded',
            acceptedAnswers: ['founded'],
          },
          {
            blank: 5,
            answer: 'observe',
            acceptedAnswers: ['observe'],
          },
        ],
      },
    ],
  },
  {
    unit: 5,
    title: 'OUR EXPERIENCES',
    lessons: [
      {
        id: 'U5L01',
        title: 'My Summer Camp',
        audio: {
          mode: 'tts',
          audioUrl: '',
          audioScript:
            'Last summer, I had an amazing experience at a summer camp. We stayed on a university campus for one week. On the first day, I felt nervous because I did not know anyone. However, group activities helped me gain confidence and become more independent. We learnt useful skills, played sports and made new friends. At the end of the week, everyone agreed that it had been a brilliant experience.',
        },
        displayText:
          'I had an (1) ______ experience at a summer camp. We stayed on a university (2) ______. The activities helped me gain (3) ______ and become more (4) ______. It was a (5) ______ experience.',
        blanks: [
          {
            blank: 1,
            answer: 'amazing',
            acceptedAnswers: ['amazing'],
          },
          {
            blank: 2,
            answer: 'campus',
            acceptedAnswers: ['campus'],
          },
          {
            blank: 3,
            answer: 'confidence',
            acceptedAnswers: ['confidence'],
          },
          {
            blank: 4,
            answer: 'independent',
            acceptedAnswers: ['independent'],
          },
          {
            blank: 5,
            answer: 'brilliant',
            acceptedAnswers: ['brilliant'],
          },
        ],
      },
      {
        id: 'U5L02',
        title: 'An Eco-tour',
        audio: {
          mode: 'tts',
          audioUrl: '',
          audioScript:
            'One of my most memorable experiences was an eco-tour with my family. We travelled to a beautiful coastal area and explored a coral reef. Our guide explained how important the reef was as a habitat for many marine animals. He also told us how tourists could protect it. The trip gave me more confidence and made me want to learn more about the natural world.',
        },
        displayText:
          'One of my most (1) ______ experiences was an (2) ______. We explored a (3) ______. It provides a natural (4) ______ for marine animals. The trip also gave me more (5) ______.',
        blanks: [
          {
            blank: 1,
            answer: 'memorable',
            acceptedAnswers: ['memorable'],
          },
          {
            blank: 2,
            answer: 'eco-tour',
            acceptedAnswers: ['eco-tour', 'eco tour'],
          },
          {
            blank: 3,
            answer: 'coral reef',
            acceptedAnswers: ['coral reef'],
          },
          {
            blank: 4,
            answer: 'habitat',
            acceptedAnswers: ['habitat', 'habitats'],
          },
          {
            blank: 5,
            answer: 'confidence',
            acceptedAnswers: ['confidence'],
          },
        ],
      },
    ],
  },
  {
    unit: 6,
    title: 'VIETNAMESE LIFESTYLE: THEN AND NOW',
    lessons: [
      {
        id: 'U6L01',
        title: 'Vietnamese Families',
        audio: {
          mode: 'tts',
          audioUrl: '',
          audioScript:
            'Vietnamese family life has changed over time. In the past, many people lived in extended families, with grandparents, parents and children sharing the same home. Young people were often more dependent on older family members. Today, teenagers have more opportunities to become independent. However, Vietnamese society is still strongly family-oriented, and traditional family values continue to play an important role in daily life.',
        },
        displayText:
          'Many people once lived in (1) ______ families. Young people were more (2) ______ on older family members. Today, teenagers are becoming more (3) ______. Vietnamese society is still (4) ______, and family (5) ______ remain important.',
        blanks: [
          {
            blank: 1,
            answer: 'extended',
            acceptedAnswers: ['extended'],
          },
          {
            blank: 2,
            answer: 'dependent',
            acceptedAnswers: ['dependent'],
          },
          {
            blank: 3,
            answer: 'independent',
            acceptedAnswers: ['independent'],
          },
          {
            blank: 4,
            answer: 'family-oriented',
            acceptedAnswers: ['family-oriented', 'family oriented'],
          },
          {
            blank: 5,
            answer: 'values',
            acceptedAnswers: ['values', 'value'],
          },
        ],
      },
      {
        id: 'U6L02',
        title: 'Traditional Skills',
        audio: {
          mode: 'tts',
          audioUrl: '',
          audioScript:
            'In the past, many Vietnamese families earned their living from agriculture. Some villagers learnt to weave cloth by hand and dye it with natural colours. These skills were normally passed from older people to younger generations. Modern lifestyles have changed the way people work, but many communities still want to preserve traditional skills because they are an important part of Vietnamese culture.',
        },
        displayText:
          'Many families earned their living from (1) ______. Villagers learnt to (2) ______ cloth and (3) ______ it with natural colours. These (4) ______ were passed to younger generations. Communities still want to (5) ______ them.',
        blanks: [
          {
            blank: 1,
            answer: 'agriculture',
            acceptedAnswers: ['agriculture'],
          },
          {
            blank: 2,
            answer: 'weave',
            acceptedAnswers: ['weave'],
          },
          {
            blank: 3,
            answer: 'dye',
            acceptedAnswers: ['dye'],
          },
          {
            blank: 4,
            answer: 'skills',
            acceptedAnswers: ['skills', 'skill'],
          },
          {
            blank: 5,
            answer: 'preserve',
            acceptedAnswers: ['preserve'],
          },
        ],
      },
    ],
  },
  {
    unit: 7,
    title: 'NATURAL WONDERS OF THE WORLD',
    lessons: [
      {
        id: 'U7L01',
        title: 'An Amazing Natural Wonder',
        audio: {
          mode: 'tts',
          audioUrl: '',
          audioScript:
            'Last year, my family visited a spectacular natural wonder. The area had an extremely rich ecosystem and was home to many kinds of wildlife. Some parts of the site were difficult to access, so visitors had to follow a local guide. He asked us not to disturb animals, pick plants or leave rubbish. Everyone who visits such places should help preserve their natural beauty.',
        },
        displayText:
          'We visited a spectacular (1) ______. The area had a rich (2) ______ and many kinds of (3) ______. Some areas were difficult to (4) ______. Visitors should help (5) ______ their natural beauty.',
        blanks: [
          {
            blank: 1,
            answer: 'natural wonder',
            acceptedAnswers: ['natural wonder'],
          },
          {
            blank: 2,
            answer: 'ecosystem',
            acceptedAnswers: ['ecosystem'],
          },
          {
            blank: 3,
            answer: 'wildlife',
            acceptedAnswers: ['wildlife'],
          },
          {
            blank: 4,
            answer: 'access',
            acceptedAnswers: ['access'],
          },
          {
            blank: 5,
            answer: 'preserve',
            acceptedAnswers: ['preserve'],
          },
        ],
      },
      {
        id: 'U7L02',
        title: 'Protecting Nature',
        audio: {
          mode: 'tts',
          audioUrl: '',
          audioScript:
            'Many natural wonders are facing serious threats. Pollution can endanger plants and animals, and too many visitors can damage sensitive areas. Tourists should never leave litter behind. They should also follow local rules and stay on marked paths. Governments, communities and visitors all have a responsibility to protect these special places so that future generations can enjoy them too.',
        },
        displayText:
          'Natural wonders face serious (1) ______. Pollution can (2) ______ plants and animals. Tourists should not leave (3) ______. They should follow local (4) ______. Everyone should help (5) ______ these places.',
        blanks: [
          {
            blank: 1,
            answer: 'threats',
            acceptedAnswers: ['threats', 'threat'],
          },
          {
            blank: 2,
            answer: 'endanger',
            acceptedAnswers: ['endanger'],
          },
          {
            blank: 3,
            answer: 'litter',
            acceptedAnswers: ['litter'],
          },
          {
            blank: 4,
            answer: 'rules',
            acceptedAnswers: ['rules', 'rule'],
          },
          {
            blank: 5,
            answer: 'protect',
            acceptedAnswers: ['protect'],
          },
        ],
      },
    ],
  },
  {
    unit: 8,
    title: 'TOURISM',
    lessons: [
      {
        id: 'U8L01',
        title: 'Planning a Family Holiday',
        audio: {
          mode: 'tts',
          audioUrl: '',
          audioScript:
            'Before going on holiday, my parents often visit a travel agency. We explain what kind of destination we would like to visit. The travel agent usually gives us a brochure containing information about different places. She also helps us work out the total cost. Last summer, we chose a package tour because transport and accommodation were included, so the whole trip was easy to organise.',
        },
        displayText:
          'My parents often visit a travel (1) ______. We choose a suitable (2) ______. The agent gives us a (3) ______ and helps us (4) ______ the total cost. Last year, we chose a (5) ______.',
        blanks: [
          {
            blank: 1,
            answer: 'agency',
            acceptedAnswers: ['agency'],
          },
          {
            blank: 2,
            answer: 'destination',
            acceptedAnswers: ['destination'],
          },
          {
            blank: 3,
            answer: 'brochure',
            acceptedAnswers: ['brochure'],
          },
          {
            blank: 4,
            answer: 'work out',
            acceptedAnswers: ['work out'],
          },
          {
            blank: 5,
            answer: 'package tour',
            acceptedAnswers: ['package tour'],
          },
        ],
      },
      {
        id: 'U8L02',
        title: 'Ways to Travel',
        audio: {
          mode: 'tts',
          audioUrl: '',
          audioScript:
            'People travel for many different reasons. Some tourists enjoy food tourism because they want to taste local dishes. Others prefer shopping tourism and enjoy buying local products. Independent travellers sometimes choose a self-guided tour so they can wander around at their own pace. Sustainable tourism is also becoming more popular because it encourages people to protect the environment and support local communities.',
        },
        displayText:
          'Some tourists enjoy (1) ______ tourism. Others prefer (2) ______ tourism. Independent travellers may choose a (3) ______ tour and (4) ______ around at their own pace. Another popular form is (5) ______ tourism.',
        blanks: [
          {
            blank: 1,
            answer: 'food',
            acceptedAnswers: ['food'],
          },
          {
            blank: 2,
            answer: 'shopping',
            acceptedAnswers: ['shopping'],
          },
          {
            blank: 3,
            answer: 'self-guided',
            acceptedAnswers: ['self-guided', 'self guided'],
          },
          {
            blank: 4,
            answer: 'wander',
            acceptedAnswers: ['wander'],
          },
          {
            blank: 5,
            answer: 'sustainable',
            acceptedAnswers: ['sustainable'],
          },
        ],
      },
    ],
  },
  {
    unit: 9,
    title: 'WORLD ENGLISHES',
    lessons: [
      {
        id: 'U9L01',
        title: 'English Around the World',
        audio: {
          mode: 'tts',
          audioUrl: '',
          audioScript:
            'English is spoken in many countries, but it does not sound exactly the same everywhere. Different varieties of English have developed around the world. In some places, English is an official language. Many bilingual speakers use English together with another language. English has also accepted many borrowed words from other languages. Today, it plays an important role in international communication.',
        },
        displayText:
          'There are different (1) ______ of English. In some countries, it is an (2) ______ language. Many (3) ______ speakers use two languages. English contains many (4) ______ words and is important for international (5) ______.',
        blanks: [
          {
            blank: 1,
            answer: 'varieties',
            acceptedAnswers: ['varieties', 'variety'],
          },
          {
            blank: 2,
            answer: 'official',
            acceptedAnswers: ['official'],
          },
          {
            blank: 3,
            answer: 'bilingual',
            acceptedAnswers: ['bilingual'],
          },
          {
            blank: 4,
            answer: 'borrowed',
            acceptedAnswers: ['borrowed'],
          },
          {
            blank: 5,
            answer: 'communication',
            acceptedAnswers: ['communication'],
          },
        ],
      },
      {
        id: 'U9L02',
        title: 'Improving Your English',
        audio: {
          mode: 'tts',
          audioUrl: '',
          audioScript:
            'If you want to become fluent in English, regular practice is important. Reading books and articles can help you increase your vocabulary. Listening to different speakers can improve your understanding, while speaking practice can improve pronunciation. When you meet an unfamiliar expression, you can look it up in a dictionary. Talking to an exchange student is also a useful way to practise real communication.',
        },
        displayText:
          'Regular practice can help learners become (1) ______. Reading increases (2) ______. Speaking can improve (3) ______. Students can (4) ______ unfamiliar words in a dictionary. Talking to an (5) ______ student is also useful.',
        blanks: [
          {
            blank: 1,
            answer: 'fluent',
            acceptedAnswers: ['fluent'],
          },
          {
            blank: 2,
            answer: 'vocabulary',
            acceptedAnswers: ['vocabulary'],
          },
          {
            blank: 3,
            answer: 'pronunciation',
            acceptedAnswers: ['pronunciation'],
          },
          {
            blank: 4,
            answer: 'look up',
            acceptedAnswers: ['look up'],
          },
          {
            blank: 5,
            answer: 'exchange',
            acceptedAnswers: ['exchange'],
          },
        ],
      },
    ],
  },
  {
    unit: 10,
    title: 'PLANET EARTH',
    lessons: [
      {
        id: 'U10L01',
        title: 'Our Planet Needs Help',
        audio: {
          mode: 'tts',
          audioUrl: '',
          audioScript:
            'Climate change is one of the greatest environmental problems facing Planet Earth. It is a serious threat to ecological balance and affects many natural habitats. Human activities also release harmful chemicals into the environment. For example, pesticides used in farming can damage ecosystems. Protecting nature is therefore vital. We all need to change our behaviour if we want to preserve the planet for future generations.',
        },
        displayText:
          '(1) ______ change is a serious (2) ______ to ecological (3) ______. Chemicals such as (4) ______ can damage ecosystems. Protecting nature is (5) ______.',
        blanks: [
          {
            blank: 1,
            answer: 'climate',
            acceptedAnswers: ['climate'],
          },
          {
            blank: 2,
            answer: 'threat',
            acceptedAnswers: ['threat'],
          },
          {
            blank: 3,
            answer: 'balance',
            acceptedAnswers: ['balance'],
          },
          {
            blank: 4,
            answer: 'pesticides',
            acceptedAnswers: ['pesticides', 'pesticide'],
          },
          {
            blank: 5,
            answer: 'vital',
            acceptedAnswers: ['vital'],
          },
        ],
      },
      {
        id: 'U10L02',
        title: 'Effects of Climate Change',
        audio: {
          mode: 'tts',
          audioUrl: '',
          audioScript:
            'Climate change affects many areas of our planet. As temperatures rise, ice near the north and south poles is melting. Some animals are losing the habitats they need to survive. People can help by reducing waste, saving energy and using natural resources more carefully. Governments also need to preserve important ecosystems. These actions can help maintain ecological balance.',
        },
        displayText:
          'Climate change (1) ______ many areas. Ice near the north and south (2) ______ is melting. Animals are losing their natural (3) ______. Governments should (4) ______ important ecosystems and maintain ecological (5) ______.',
        blanks: [
          {
            blank: 1,
            answer: 'affects',
            acceptedAnswers: ['affects'],
          },
          {
            blank: 2,
            answer: 'poles',
            acceptedAnswers: ['poles', 'pole'],
          },
          {
            blank: 3,
            answer: 'habitats',
            acceptedAnswers: ['habitats', 'habitat'],
          },
          {
            blank: 4,
            answer: 'preserve',
            acceptedAnswers: ['preserve'],
          },
          {
            blank: 5,
            answer: 'balance',
            acceptedAnswers: ['balance'],
          },
        ],
      },
    ],
  },
  {
    unit: 11,
    title: 'ELECTRONIC DEVICES',
    lessons: [
      {
        id: 'U11L01',
        title: 'My E-reader',
        audio: {
          mode: 'tts',
          audioUrl: '',
          audioScript:
            'My favourite electronic device is my e-reader. I use it almost every day because it is much lighter than carrying several books. It connects to the internet wirelessly, so I can download new books easily. I keep the device in a protective plastic cover. When I first bought it, I carefully read the leaflet to learn how to use all of its functions.',
        },
        displayText:
          'My favourite device is my (1) ______. It connects to the internet (2) ______. I keep it in a (3) ______ cover. I read the (4) ______ before using the new (5) ______.',
        blanks: [
          {
            blank: 1,
            answer: 'e-reader',
            acceptedAnswers: ['e-reader', 'e reader'],
          },
          {
            blank: 2,
            answer: 'wirelessly',
            acceptedAnswers: ['wirelessly'],
          },
          {
            blank: 3,
            answer: 'plastic',
            acceptedAnswers: ['plastic'],
          },
          {
            blank: 4,
            answer: 'leaflet',
            acceptedAnswers: ['leaflet'],
          },
          {
            blank: 5,
            answer: 'device',
            acceptedAnswers: ['device'],
          },
        ],
      },
      {
        id: 'U11L02',
        title: 'The School 3D Printer',
        audio: {
          mode: 'tts',
          audioUrl: '',
          audioScript:
            'Our school has recently bought a 3D printer for the technology room. The printer can turn digital designs into real objects. It can use several materials, including plastic and some metals. For example, aluminium and copper can be used for certain projects. Before operating the machine, students must read the instructions carefully and follow all safety rules.',
        },
        displayText:
          'Our school has a (1) ______ printer. It can use materials such as (2) ______, (3) ______ and (4) ______. Students must read the (5) ______ before operating it.',
        blanks: [
          {
            blank: 1,
            answer: '3D',
            acceptedAnswers: ['3D', '3d'],
          },
          {
            blank: 2,
            answer: 'plastic',
            acceptedAnswers: ['plastic'],
          },
          {
            blank: 3,
            answer: 'aluminium',
            acceptedAnswers: ['aluminium', 'aluminum'],
          },
          {
            blank: 4,
            answer: 'copper',
            acceptedAnswers: ['copper'],
          },
          {
            blank: 5,
            answer: 'instructions',
            acceptedAnswers: ['instructions', 'instruction'],
          },
        ],
      },
    ],
  },
  {
    unit: 12,
    title: 'CAREER CHOICES',
    lessons: [
      {
        id: 'U12L01',
        title: 'Choosing the Right Career',
        audio: {
          mode: 'tts',
          audioUrl: '',
          audioScript:
            'Choosing a career is an important decision for every student. Before making a choice, young people should consider their interests, personality and abilities. Some careers are demanding and require people to work under pressure. Other jobs need workers who are confident and decisive. Technical jobs may also require excellent hand-eye coordination. Learning about different careers can help students make better decisions about their future.',
        },
        displayText:
          'Choosing a (1) ______ is important. Some jobs are (2) ______. Other jobs need people who are (3) ______. Technical work may require good (4) ______ coordination. Students should explore different (5) ______.',
        blanks: [
          {
            blank: 1,
            answer: 'career',
            acceptedAnswers: ['career'],
          },
          {
            blank: 2,
            answer: 'demanding',
            acceptedAnswers: ['demanding'],
          },
          {
            blank: 3,
            answer: 'decisive',
            acceptedAnswers: ['decisive'],
          },
          {
            blank: 4,
            answer: 'hand-eye',
            acceptedAnswers: ['hand-eye', 'hand eye'],
          },
          {
            blank: 5,
            answer: 'careers',
            acceptedAnswers: ['careers', 'career'],
          },
        ],
      },
      {
        id: 'U12L02',
        title: 'Different Jobs',
        audio: {
          mode: 'tts',
          audioUrl: '',
          audioScript:
            'There are many different jobs to consider. An assembly worker usually works with machines and needs to follow instructions carefully. A cashier deals directly with customers and handles payments. A garment worker works with clothing and different kinds of fabric. Students who are interested in both technology and farming might consider agriculture engineering. Each career requires different skills, so students should think carefully before choosing.',
        },
        displayText:
          'An (1) ______ worker works with machines. A (2) ______ deals with customers. A (3) ______ worker works with clothing and (4) ______. Students interested in farming and technology might consider (5) ______ engineering.',
        blanks: [
          {
            blank: 1,
            answer: 'assembly',
            acceptedAnswers: ['assembly'],
          },
          {
            blank: 2,
            answer: 'cashier',
            acceptedAnswers: ['cashier'],
          },
          {
            blank: 3,
            answer: 'garment',
            acceptedAnswers: ['garment'],
          },
          {
            blank: 4,
            answer: 'fabric',
            acceptedAnswers: ['fabric'],
          },
          {
            blank: 5,
            answer: 'agriculture',
            acceptedAnswers: ['agriculture'],
          },
        ],
      },
    ],
  },
];

export const getListeningByUnit = (unitNumber: number): ListeningLesson[] => {
  const unit = LISTENING_UNITS_DATA.find((u) => u.unit === unitNumber);
  return unit ? unit.lessons : LISTENING_UNITS_DATA[0].lessons;
};

export const getListeningLesson = (lessonId: string): ListeningLesson | undefined => {
  for (const unit of LISTENING_UNITS_DATA) {
    const found = unit.lessons.find((l) => l.id === lessonId);
    if (found) return found;
  }
  return undefined;
};
