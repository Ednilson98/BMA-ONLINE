/**
 * Sample Book: "Inglês 7ª & 8ª Classe"
 * Format: "bma-book-v1"
 * Contains exactly 17 exercises for testing all acceptance criteria.
 */

export const SAMPLE_BOOK_ID = 'ingles-7-8';

export const SAMPLE_BOOK_META = {
  format: 'bma-book-v1' as const,
  book_id: 'ingles-7-8',
  title: 'Inglês 7ª & 8ª Classe',
  subtitle: 'Ensino Secundário Geral • República de Angola',
  footer: 'Bantu Mentor Academy - BMA • Luanda, Angola',
  author: 'Departamento de Línguas e Pedagogia BMA',
  edition: '1ª Edição Oficial 2026'
};

export const SAMPLE_EXERCISES = [
  {
    id: 'u71-l1',
    class: '7ª Classe',
    unit: 'Unit 7.1',
    title: 'Greetings & Introductions',
    kind: 'dialogue-choice',
    instr: 'Listen to the greeting and choose the best response to introduce yourself in English.',
    audio: 'audio/u71-l1.mp3',
    audioText: 'Hello! Welcome to our school. What is your name?',
    content: {
      dialogue: [
        { speaker: 'Kambamba', text: 'Hello! Good morning, my friend. Welcome to our school!' },
        { speaker: 'Nzinga', text: 'Good morning! My name is Nzinga. Nice to meet you.' },
        { speaker: 'Kambamba', text: 'Nice to meet you too, Nzinga. Where are you from?' }
      ],
      question: 'How should Nzinga reply to "Where are you from?"',
      options: [
        'I am fine, thank you very much.',
        'I am from Luanda, Angola.',
        'Yes, I like reading books.',
        'My father is a teacher.'
      ],
      correctIndex: 1,
      explanation: '"I am from Luanda, Angola" answers the question "Where are you from?".'
    }
  },
  {
    id: 'u71-l2',
    class: '7ª Classe',
    unit: 'Unit 7.1',
    title: 'Classroom Objects & Spelling',
    kind: 'fill-blank',
    instr: 'Fill in the correct missing letters to name the classroom object.',
    audioText: 'Open your notebook and write with your pen.',
    content: {
      prompt: 'We write our homework in a note____ and highlight with a yel____ pencil.',
      blanks: [
        { label: 'Object 1', answer: 'book', hint: 'note...' },
        { label: 'Colour', answer: 'low', hint: 'yel...' }
      ],
      explanation: 'Notebook (caderno) and yellow (amarelo) are common classroom vocabulary.'
    }
  },
  {
    id: 'u71-l3',
    class: '7ª Classe',
    unit: 'Unit 7.1',
    title: 'Present Simple: Verb To Be',
    kind: 'multiple-choice',
    instr: 'Select the correct form of the verb "to be" (am, is, are).',
    audioText: 'Tchissola and Bento are excellent students.',
    content: {
      question: 'Tchissola and Bento _____ studying in the school library.',
      options: ['am', 'is', 'are', 'be'],
      correctIndex: 2,
      explanation: 'Since "Tchissola and Bento" is plural (They), we use "are".'
    }
  },
  {
    id: 'u71-l4',
    class: '7ª Classe',
    unit: 'Unit 7.1',
    title: 'Numbers & Telling the Time',
    kind: 'multiple-choice',
    instr: 'What time is it when the clock shows 07:30 in the morning?',
    audioText: 'School starts at half past seven in the morning.',
    content: {
      question: 'It is 07:30. In English, we say:',
      options: [
        'It is seven quarter.',
        'It is half past seven.',
        'It is thirty after eight.',
        'It is seven to half.'
      ],
      correctIndex: 1,
      explanation: '07:30 is read as "half past seven".'
    }
  },
  {
    id: 'u72-l1',
    class: '7ª Classe',
    unit: 'Unit 7.2',
    title: 'Family Members & Possessives',
    kind: 'matching',
    instr: 'Identify the family relationship in English.',
    audioText: 'My grandmother lives in Benguela.',
    content: {
      question: 'Your mother\'s brother is your _____ and his children are your _____.',
      options: [
        'uncle / cousins',
        'aunt / nephews',
        'brother / grandparents',
        'son / sisters'
      ],
      correctIndex: 0,
      explanation: 'Mother\'s brother is an uncle (tio) and his children are cousins (primos).'
    }
  },
  {
    id: 'u72-l2',
    class: '7ª Classe',
    unit: 'Unit 7.2',
    title: 'Daily Routines & Adverbs of Frequency',
    kind: 'ordering',
    instr: 'Choose the sentence with correct adverb placement.',
    audioText: 'I always wake up early to catch the bus.',
    content: {
      question: 'Which sentence has the correct word order?',
      options: [
        'I wake always up at 6 AM.',
        'I always wake up at 6 AM.',
        'Always I wake up 6 AM at.',
        'Wake up I always at 6 AM.'
      ],
      correctIndex: 1,
      explanation: 'Adverbs of frequency usually go before the main verb: "I always wake up".'
    }
  },
  {
    id: 'u72-l3',
    class: '7ª Classe',
    unit: 'Unit 7.2',
    title: 'School Subjects & Preferences',
    kind: 'multiple-choice',
    instr: 'Listen and identify the subject described.',
    audioText: 'In this class, we learn about numbers, equations, and geometry.',
    content: {
      question: 'Which school subject is described?',
      options: ['Geography', 'History', 'Mathematics', 'Biology'],
      correctIndex: 2,
      explanation: 'Numbers, equations, and geometry are studied in Mathematics.'
    }
  },
  {
    id: 'u72-l4',
    class: '7ª Classe',
    unit: 'Unit 7.2',
    title: 'Prepositions of Place',
    kind: 'multiple-choice',
    instr: 'Complete the sentence with the appropriate preposition (in, on, under, between).',
    audioText: 'The dictionary is on the teacher desk.',
    content: {
      question: 'The dictionary is placed _____ the desk, next to the blackboard.',
      options: ['under', 'on', 'inside of', 'behind from'],
      correctIndex: 1,
      explanation: 'Objects lying on a surface use the preposition "on".'
    }
  },
  {
    id: 'u73-l1',
    class: '7ª Classe',
    unit: 'Unit 7.3',
    title: 'Food, Drinks & Angolan Cuisine',
    kind: 'multiple-choice',
    instr: 'Learn culinary vocabulary and cultural terms in English.',
    audioText: 'Muamba de galinha is a famous traditional dish in Angola.',
    content: {
      question: 'In English, "peixe grelhado com mandioca" is translated as:',
      options: [
        'Boiled meat with potatoes',
        'Grilled fish with cassava',
        'Fried chicken with rice',
        'Vegetable soup with plantain'
      ],
      correctIndex: 1,
      explanation: 'Peixe grelhado = grilled fish; mandioca = cassava.'
    }
  },
  {
    id: 'u73-l2',
    class: '7ª Classe',
    unit: 'Unit 7.3',
    title: 'Countable & Uncountable Nouns',
    kind: 'multiple-choice',
    instr: 'Select "many" or "much" according to the noun.',
    audioText: 'How much water do you drink every day?',
    content: {
      question: 'There isn\'t _____ milk left, but there are _____ oranges on the table.',
      options: [
        'much / many',
        'many / much',
        'some / much',
        'few / much'
      ],
      correctIndex: 0,
      explanation: '"Milk" is uncountable (much); "oranges" are countable plural (many).'
    }
  },
  {
    id: 'u81-l1',
    class: '8ª Classe',
    unit: 'Unit 8.1',
    title: 'Past Simple: Regular Verbs',
    kind: 'multiple-choice',
    instr: 'Choose the correct regular past tense form ending in -ed.',
    audioText: 'Yesterday, the students visited the National Museum of Anthropology.',
    content: {
      question: 'Yesterday, our class _____ (visit) the Kalandula Falls in Malanje.',
      options: ['visiting', 'visited', 'visits', 'has visit'],
      correctIndex: 1,
      explanation: 'Regular verbs form the simple past with -ed: "visited".'
    }
  },
  {
    id: 'u81-l2',
    class: '8ª Classe',
    unit: 'Unit 8.1',
    title: 'Past Simple: Irregular Verbs',
    kind: 'multiple-choice',
    instr: 'Find the irregular past form for "go" and "see".',
    audioText: 'We went to Huambo and saw the beautiful mountain peaks.',
    content: {
      question: 'Last weekend we _____ (go) to Benguela and _____ (see) the Atlantic ocean.',
      options: [
        'goed / seed',
        'went / saw',
        'gone / seen',
        'was going / seeing'
      ],
      correctIndex: 1,
      explanation: 'The past tense of "go" is "went", and the past of "see" is "saw".'
    }
  },
  {
    id: 'u81-l3',
    class: '8ª Classe',
    unit: 'Unit 8.1',
    title: 'Famous Angolan Figures',
    kind: 'reading-comprehension',
    instr: 'Read the short biography and answer the question.',
    audioText: 'Queen Nzinga Mbandi was a courageous leader in Angolan history.',
    content: {
      passage: 'Queen Nzinga Mbandi was a courageous ruler of the Ndongo and Matamba kingdoms in the 17th century. She was famous for her diplomatic skills, strategic brilliance, and defence of her people.',
      question: 'According to the text, Queen Nzinga was particularly celebrated for her:',
      options: [
        'Writing of modern novels',
        'Diplomatic skills and tactical brilliance',
        'Painting of landscapes',
        'Construction of railways'
      ],
      correctIndex: 1,
      explanation: 'The passage highlights her diplomatic skills and defence of her kingdoms.'
    }
  },
  {
    id: 'u82-l1',
    class: '8ª Classe',
    unit: 'Unit 8.2',
    title: 'Describing People & Clothes',
    kind: 'multiple-choice',
    instr: 'Select the adjectives that best describe height and personality.',
    audioText: 'He is tall, kind, and wears a blue school uniform.',
    content: {
      question: 'My best friend has _____ dark hair, is very _____, and always smiles.',
      options: [
        'curly / cheerful',
        'circle / loudly',
        'round / angrier',
        'tall / badly'
      ],
      correctIndex: 0,
      explanation: '"Curly" describes hair texture; "cheerful" (alegre) describes positive temperament.'
    }
  },
  {
    id: 'u82-l2',
    class: '8ª Classe',
    unit: 'Unit 8.2',
    title: 'Future Plans: Going to & Will',
    kind: 'multiple-choice',
    instr: 'Express planned intentions versus instant predictions.',
    audioText: 'Next year, I am going to study computer science at the academy.',
    content: {
      question: 'We have already bought our bus tickets. We _____ travel to Lubango on Friday.',
      options: [
        'are going to',
        'will perhaps',
        'did',
        'are not'
      ],
      correctIndex: 0,
      explanation: 'We use "be going to" for intentions that have already been decided and arranged.'
    }
  },
  {
    id: 'u83-l1',
    class: '8ª Classe',
    unit: 'Unit 8.3',
    title: 'Angolan Wildlife & Nature',
    kind: 'multiple-choice',
    instr: 'Learn about the giant sable antelope (Palanca Negra Gigante).',
    audioText: 'The Giant Sable Antelope is the national symbol of Angola.',
    content: {
      question: 'The Giant Sable Antelope (Palanca Negra) is critically protected in which park?',
      options: [
        'Cangandala National Park in Malanje',
        'Central Park in New York',
        'Hyde Park in London',
        'Table Mountain Park'
      ],
      correctIndex: 0,
      explanation: 'The Giant Sable Antelope is protected in Cangandala National Park, Malanje province.'
    }
  },
  {
    id: 'u83-l2',
    class: '8ª Classe',
    unit: 'Unit 8.3',
    title: 'Review Challenge & Quiz',
    kind: 'multiple-choice',
    instr: 'Final comprehensive question for English Grade 8.',
    audioText: 'Congratulations on completing all units! Practice makes progress.',
    content: {
      question: 'Which question correctly asks for permission in a polite, formal way?',
      options: [
        'Give me the book now!',
        'May I please borrow your grammar book?',
        'I take your book ok?',
        'Do you give book to me?'
      ],
      correctIndex: 1,
      explanation: '"May I please..." is the standard formal polite expression for requesting permission.'
    }
  }
];

/**
 * Builds the complete standalone HTML for the sample book "ingles-7-8".
 * Follows the strict "bma-book-v1" specification.
 */
export function buildSampleBookHtml(): string {
  const jsonPayload = {
    meta: SAMPLE_BOOK_META,
    exercises: SAMPLE_EXERCISES
  };

  const jsonString = JSON.stringify(jsonPayload, null, 2).replace(/<\//g, '<\\/');

  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>Inglês 7ª &amp; 8ª Classe - BMA Books</title>
  <meta name="description" content="Exercícios escolares interactivos de Língua Inglesa - Bantu Mentor Academy">
  <style>
    :root {
      --bg-main: #052431;
      --bg-card: #083C51;
      --bg-inset: #041A24;
      --teal-main: #3F7D8C;
      --teal-light: #5298A8;
      --gold-main: #A28F6A;
      --gold-glow: #B8A682;
      --text-main: #E5E2DD;
      --text-muted: #8FA5AF;
      --border-subtle: rgba(229, 226, 221, 0.14);
      --success: #10B981;
      --error: #EF4444;
      --shadow-out: 8px 8px 18px rgba(0, 0, 0, 0.55), -6px -6px 14px rgba(229, 226, 221, 0.04);
      --shadow-inset: inset 3px 3px 6px rgba(0, 0, 0, 0.6), inset -2px -2px 5px rgba(229, 226, 221, 0.04);
      --shadow-btn: 4px 4px 10px rgba(0, 0, 0, 0.45), -3px -3px 8px rgba(229, 226, 221, 0.03);
      --radius: 20px;
    }

    @media (prefers-color-scheme: light) {
      :root {
        --bg-main: #E5E2DD;
        --bg-card: #EDEAE5;
        --bg-inset: #DCD8D1;
        --teal-main: #3F7D8C;
        --teal-light: #2E6471;
        --gold-main: #A28F6A;
        --gold-glow: #8B7853;
        --text-main: #083C51;
        --text-muted: #385E6E;
        --border-subtle: rgba(8, 60, 81, 0.16);
        --shadow-out: 8px 8px 20px rgba(8, 60, 81, 0.08), -6px -6px 16px rgba(255, 255, 255, 0.85);
        --shadow-inset: inset 2px 2px 5px rgba(8, 60, 81, 0.12), inset -2px -2px 5px rgba(255, 255, 255, 0.7);
        --shadow-btn: 4px 4px 10px rgba(8, 60, 81, 0.09), -3px -3px 8px rgba(255, 255, 255, 0.8);
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg-main);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
      line-height: 1.5;
    }

    .container {
      width: 100%;
      max-width: 680px;
      margin: 0 auto;
    }

    /* Neuomorphic Card */
    .neu-card {
      background: var(--bg-card);
      border-radius: var(--radius);
      box-shadow: var(--shadow-out);
      border: 1px solid rgba(255, 255, 255, 0.06);
      padding: 24px 20px;
      margin-bottom: 20px;
    }

    /* Badges */
    .badge-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge-class {
      background: rgba(13, 148, 136, 0.2);
      color: var(--teal-light);
      border: 1px solid rgba(20, 184, 166, 0.3);
    }

    .badge-unit {
      background: rgba(245, 158, 11, 0.15);
      color: var(--gold-glow);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .badge-id {
      background: var(--bg-inset);
      color: var(--text-muted);
      font-family: monospace;
      font-size: 12px;
      padding: 4px 10px;
      box-shadow: var(--shadow-inset);
      border-radius: 8px;
    }

    /* Headings */
    h1 {
      font-size: 22px;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 8px;
      letter-spacing: -0.3px;
    }

    .instruction {
      font-size: 15px;
      color: var(--text-muted);
      margin-bottom: 20px;
    }

    /* Audio Speaker Box */
    .audio-box {
      background: var(--bg-inset);
      border-radius: 14px;
      padding: 14px 16px;
      box-shadow: var(--shadow-inset);
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 22px;
      border: 1px solid var(--border-subtle);
    }

    .audio-btn {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--teal-main), #336774);
      color: #FFFFFF;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(63, 125, 140, 0.4);
      transition: all 0.2s ease;
    }

    .audio-btn:active {
      transform: scale(0.94);
    }

    .audio-info {
      flex: 1;
    }

    .audio-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--gold-glow);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .audio-text {
      font-size: 14px;
      color: var(--text-main);
      font-style: italic;
    }

    /* Dialogue box */
    .dialogue-card {
      background: var(--bg-inset);
      border-radius: 12px;
      padding: 16px;
      box-shadow: var(--shadow-inset);
      margin-bottom: 20px;
    }

    .dialogue-line {
      margin-bottom: 10px;
      font-size: 14px;
    }
    .dialogue-speaker {
      font-weight: 700;
      color: var(--teal-light);
    }

    /* Options / Buttons */
    .options-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }

    .option-btn {
      min-height: 54px;
      padding: 14px 18px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 14px;
      color: var(--text-main);
      font-size: 15px;
      font-weight: 600;
      text-align: left;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 14px;
      box-shadow: var(--shadow-btn);
      transition: all 0.15s ease;
      touch-action: manipulation;
    }

    .option-btn:hover {
      border-color: rgba(20, 184, 166, 0.4);
    }

    .option-btn:active {
      transform: translateY(2px);
      box-shadow: var(--shadow-inset);
    }

    .option-btn.selected {
      border-color: var(--teal-light);
      background: rgba(13, 148, 136, 0.15);
    }

    .option-btn.correct {
      border-color: var(--success);
      background: rgba(16, 185, 129, 0.2);
      color: #A7F3D0;
    }

    .option-btn.incorrect {
      border-color: var(--error);
      background: rgba(239, 68, 68, 0.18);
      color: #FECACA;
    }

    .opt-letter {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: var(--bg-inset);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 800;
      color: var(--gold-glow);
      box-shadow: var(--shadow-inset);
      flex-shrink: 0;
    }

    /* Feedback Box */
    .feedback-box {
      border-radius: 14px;
      padding: 16px 18px;
      margin-bottom: 20px;
      display: none;
      animation: fadeIn 0.25s ease forwards;
    }

    .feedback-box.show {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .feedback-box.correct-fb {
      background: rgba(16, 185, 129, 0.18);
      border: 1px solid var(--success);
      color: #D1FAE5;
    }

    .feedback-box.incorrect-fb {
      background: rgba(239, 68, 68, 0.16);
      border: 1px solid var(--error);
      color: #FEE2E2;
    }

    /* Action bar */
    .action-bar {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .btn-primary {
      flex: 1;
      height: 52px;
      background: linear-gradient(135deg, #B5A37F, #A28F6A);
      border: 1px solid rgba(255, 255, 255, 0.35);
      border-radius: 14px;
      color: #052431;
      font-size: 16px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(162, 143, 106, 0.4);
      transition: all 0.2s ease;
      touch-action: manipulation;
    }

    .btn-primary:active {
      transform: scale(0.98);
    }

    .btn-secondary {
      height: 52px;
      padding: 0 20px;
      background: var(--bg-inset);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      color: var(--text-muted);
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: var(--shadow-btn);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-secondary:active {
      box-shadow: var(--shadow-inset);
    }

    /* Index View (when multiple exercises are present) */
    .index-hero {
      text-align: center;
      padding: 20px 0 10px;
    }

    .index-logo {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--gold-glow);
      margin-bottom: 6px;
    }

    .exercise-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .exercise-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      background: var(--bg-card);
      border-radius: 14px;
      padding: 16px;
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-btn);
      text-decoration: none;
      color: inherit;
      transition: all 0.15s ease;
    }

    .exercise-row:active {
      transform: translateY(2px);
      box-shadow: var(--shadow-inset);
    }

    .exercise-row-info {
      flex: 1;
    }

    .exercise-row-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 4px;
    }

    .exercise-row-meta {
      font-size: 12px;
      color: var(--text-muted);
      display: flex;
      gap: 10px;
    }

    .exercise-row-btn {
      background: var(--teal-main);
      color: #FFFFFF;
      border-radius: 10px;
      padding: 8px 14px;
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Footer */
    footer {
      margin-top: auto;
      padding: 24px 0 12px;
      text-align: center;
      font-size: 12px;
      color: var(--text-muted);
      letter-spacing: 0.5px;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>

  <div class="container" id="app-root">
    <!-- Rendered dynamically by player script below -->
  </div>

  <footer id="app-footer">Bantu Mentor Academy - BMA • Edição Escolar</footer>

  <!-- REQUIRED BMA BOOK DATA BLOCK -->
  <script type="application/json" id="bma-book">
${jsonString}
  </script>

  <script>
    (function() {
      // Audio Chime synthesizer using Web Audio API (works offline, no external files needed)
      function playChime(success) {
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (!AudioContext) return;
          const ctx = new AudioContext();
          if (ctx.state === 'suspended') ctx.resume();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          if (success) {
            osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
            osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
            osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
          } else {
            osc.frequency.setValueAtTime(330, ctx.currentTime);
            osc.frequency.setValueAtTime(260, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.4);
          }
        } catch (e) {
          // ignore audio failure
        }
      }

      // Voice reader with Web Speech API
      function speakText(text) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.88;
        window.speechSynthesis.speak(utterance);
      }

      // Parse Book JSON
      const rawData = document.getElementById('bma-book');
      if (!rawData) {
        document.getElementById('app-root').innerHTML = '<div class="neu-card">Erro: Dados do livro bma-book não encontrados.</div>';
        return;
      }

      let bookData;
      try {
        bookData = JSON.parse(rawData.textContent || '{}');
      } catch (err) {
        document.getElementById('app-root').innerHTML = '<div class="neu-card">Erro ao carregar dados do livro: ' + err.message + '</div>';
        return;
      }

      const meta = bookData.meta || {};
      const exercises = bookData.exercises || [];
      const root = document.getElementById('app-root');
      const footer = document.getElementById('app-footer');

      if (meta.footer) {
        footer.textContent = meta.footer;
      }

      // ==========================================
      // CASE 1: Standalone Exercise Page (1 exercise)
      // Opens directly on exercise with NO index and NO back link
      // ==========================================
      if (exercises.length === 1) {
        const ex = exercises[0];
        let selectedOption = null;
        let answered = false;

        function renderExercise() {
          const content = ex.content || {};
          const options = content.options || [];

          let audioHtml = '';
          if (ex.audioText || ex.audio) {
            audioHtml = \`
              <div class="audio-box">
                <button class="audio-btn" id="btn-audio" aria-label="Ouvir pronúncia em inglês">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                  </svg>
                </button>
                <div class="audio-info">
                  <div class="audio-title">Áudio de Apoio (Inglês)</div>
                  <div class="audio-text">"\${ex.audioText || 'Clique para ouvir o exercício'}"</div>
                </div>
              </div>
            \`;
          }

          let dialogueHtml = '';
          if (content.dialogue && Array.isArray(content.dialogue)) {
            dialogueHtml = \`
              <div class="dialogue-card">
                \${content.dialogue.map(d => \`
                  <div class="dialogue-line">
                    <span class="dialogue-speaker">\${d.speaker}:</span> \${d.text}
                  </div>
                \`).join('')}
              </div>
            \`;
          }

          let passageHtml = '';
          if (content.passage) {
            passageHtml = \`
              <div class="dialogue-card" style="font-style: italic; line-height: 1.6;">
                "\${content.passage}"
              </div>
            \`;
          }

          const letters = ['A', 'B', 'C', 'D', 'E'];
          let optionsHtml = '';
          if (options.length > 0) {
            optionsHtml = \`
              <div class="options-grid">
                \${options.map((opt, i) => \`
                  <button class="option-btn" data-index="\${i}" type="button">
                    <span class="opt-letter">\${letters[i] || (i+1)}</span>
                    <span class="opt-text">\${opt}</span>
                  </button>
                \`).join('')}
              </div>
            \`;
          }

          root.innerHTML = \`
            <div class="neu-card">
              <div class="badge-bar">
                <span class="badge badge-class">\${ex.class || meta.title}</span>
                <span class="badge badge-unit">\${ex.unit || 'Lição'}</span>
                <span class="badge badge-id">\${ex.id}</span>
              </div>

              <h1>\${ex.title}</h1>
              <p class="instruction">\${ex.instr || 'Responda com atenção.'}</p>

              \${audioHtml}
              \${dialogueHtml}
              \${passageHtml}

              \${content.question ? \`<div style="font-size: 17px; font-weight: 700; margin-bottom: 16px; color: var(--text-main); line-height: 1.4;">\${content.question}</div>\` : ''}

              \${optionsHtml}

              <div class="feedback-box" id="feedback">
                <div id="fb-icon"></div>
                <div id="fb-text" style="font-size: 14px; line-height: 1.4;"></div>
              </div>

              <div class="action-bar">
                <button class="btn-primary" id="btn-submit" type="button">
                  Verificar Resposta
                </button>
                <button class="btn-secondary" id="btn-reset" type="button" style="display: none;">
                  Tentar Novamente
                </button>
              </div>
            </div>
          \`;

          // Attach Audio Click
          const audioBtn = document.getElementById('btn-audio');
          if (audioBtn) {
            audioBtn.addEventListener('click', function() {
              if (ex.audio) {
                // Try playing audio file relative to exercise page
                const audioEl = new Audio(ex.audio);
                audioEl.play().catch(() => {
                  speakText(ex.audioText || ex.title);
                });
              } else {
                speakText(ex.audioText || ex.title);
              }
            });
          }

          // Attach Options Click
          const optionButtons = document.querySelectorAll('.option-btn');
          optionButtons.forEach(btn => {
            btn.addEventListener('click', function() {
              if (answered) return;
              optionButtons.forEach(b => b.classList.remove('selected'));
              this.classList.add('selected');
              selectedOption = parseInt(this.getAttribute('data-index'), 10);
            });
          });

          // Attach Submit
          const submitBtn = document.getElementById('btn-submit');
          const resetBtn = document.getElementById('btn-reset');
          const fb = document.getElementById('feedback');
          const fbText = document.getElementById('fb-text');

          submitBtn.addEventListener('click', function() {
            if (options.length > 0 && selectedOption === null) {
              alert('Por favor, selecciona uma opção antes de verificar.');
              return;
            }

            answered = true;
            submitBtn.style.display = 'none';
            resetBtn.style.display = 'flex';

            const correctIdx = content.correctIndex !== undefined ? content.correctIndex : 0;
            const isCorrect = (selectedOption === correctIdx);

            optionButtons.forEach(btn => {
              const idx = parseInt(btn.getAttribute('data-index'), 10);
              if (idx === correctIdx) {
                btn.classList.add('correct');
              } else if (idx === selectedOption) {
                btn.classList.add('incorrect');
              }
            });

            playChime(isCorrect);

            fb.className = 'feedback-box show ' + (isCorrect ? 'correct-fb' : 'incorrect-fb');
            if (isCorrect) {
              fbText.innerHTML = '<strong>Excelente! Resposta correcta.</strong> ' + (content.explanation ? '<br>' + content.explanation : '');
            } else {
              fbText.innerHTML = '<strong>Ainda não está correcto.</strong> ' + (content.explanation ? '<br>' + content.explanation : 'Revê a pergunta e tenta novamente.');
            }
          });

          resetBtn.addEventListener('click', function() {
            selectedOption = null;
            answered = false;
            submitBtn.style.display = 'flex';
            resetBtn.style.display = 'none';
            fb.className = 'feedback-box';
            optionButtons.forEach(b => {
              b.classList.remove('selected', 'correct', 'incorrect');
            });
          });
        }

        renderExercise();
      }

      // ==========================================
      // CASE 2: Book Index Page (All exercises)
      // ==========================================
      else {
        root.innerHTML = \`
          <div class="neu-card index-hero">
            <div class="index-logo">Bantu Mentor Academy • Ensino Escolar</div>
            <h1>\${meta.title || 'Livro de Exercícios'}</h1>
            <p class="instruction" style="margin-bottom: 6px;">\${meta.subtitle || 'Índice de Exercícios Didácticos'}</p>
            <div style="font-size: 13px; color: var(--gold-glow); font-weight: 700; margin-top: 8px;">
              \${exercises.length} Exercícios Interactivos Disponíveis
            </div>
          </div>

          <div class="exercise-list">
            \${exercises.map(ex => \`
              <a href="/\${meta.book_id}/\${ex.id}" class="exercise-row">
                <div class="exercise-row-info">
                  <div class="exercise-row-title">\${ex.title}</div>
                  <div class="exercise-row-meta">
                    <span style="color: var(--teal-light); font-weight: 700;">\${ex.class || 'Classe'}</span>
                    <span>•</span>
                    <span style="color: var(--gold-glow); font-weight: 700;">\${ex.unit || 'Unidade'}</span>
                    <span>•</span>
                    <span style="font-family: monospace;">\${ex.id}</span>
                  </div>
                </div>
                <div class="exercise-row-btn">
                  Abrir
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </a>
            \`).join('')}
          </div>
        \`;
      }
    })();
  </script>
</body>
</html>`;
}
