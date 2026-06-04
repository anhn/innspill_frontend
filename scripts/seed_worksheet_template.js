/*
  Seed script for MongoDB:
  - Database: ai4edu_database
  - Collection: worksheet_example
  - Inserts example worksheets from JSON data

  Usage:
    1) Ensure MongoDB is running locally or set MONGO_URI env var
    2) Add your worksheet data to the WORKSHEET_EXAMPLES array below
    3) From project root, run: node scripts/seed_worksheet_example.js

  Env:
    MONGO_URI (optional) e.g. mongodb://127.0.0.1:27017/ai4edu_database
*/

const mongoose = require("mongoose");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ai4edu_database";

const worksheetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    education_level: {
      type: String,
      required: true,
      enum: ["elementary", "high-school", "higher-education"],
    },
    year: { type: String, required: true },
    subject: { type: String, required: true },
    learning_objectives: { type: String, required: true },
    format_description: { type: String, default: "" },
    examples: { type: String, default: "" },
    userName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: "worksheet_template",
    timestamps: true,
  },
);

const Worksheet = mongoose.model("WorksheetExample", worksheetSchema);

// PLACEHOLDER: Add your worksheet examples JSON data here
const WORKSHEET_EXAMPLES = [
  {
    education_level: "elementary",
    year: "Grade 1",
    subject: "Norwegian (Bokmål)",
    learning_objectives: [
      "Students can recognize and read simple words and short sentences.",
      "Students can write basic sentences with support.",
      "Students can talk about familiar topics using simple vocabulary.",
    ],
    format_description:
      "Picture-word matching, short reading tasks, copying words, completing simple sentences.",
    examples: [
      "Se på bildet og skriv ordet som passer: ____ (katt).",
      "Les setningen: 'Ola har en hund.' Hva har Ola?",
      "Fullfør setningen: Jeg liker ___.",
    ],
  },
  {
    education_level: "elementary",
    year: "Grade 1",
    subject: "Norwegian (Nynorsk)",
    learning_objectives: [
      "Students can recognize common Nynorsk words.",
      "Students can read simple phrases supported by images.",
      "Students can write basic words with guidance.",
    ],
    format_description:
      "Word recognition, image-supported reading, fill-in-the-blank.",
    examples: [
      "Kva ord passar til bildet? (sol, bok, katt)",
      "Les og teikn: 'Ei jente hoppar.'",
      "Skriv ordet: ___ (hus).",
    ],
  },
  {
    education_level: "elementary",
    year: "Grade 1",
    subject: "Mathematics",
    learning_objectives: [
      "Students can count numbers up to 20.",
      "Students can add and subtract simple quantities with support.",
      "Students can recognize basic shapes.",
    ],
    format_description:
      "Counting tasks, simple addition/subtraction, shape identification.",
    examples: [
      "Tell og skriv tallet: ○○○○○ = __",
      "3 + 2 = ?",
      "Sett ring rundt trekanten.",
    ],
  },
  {
    education_level: "elementary",
    year: "Grade 1",
    subject: "English",
    learning_objectives: [
      "Students can understand and say common everyday words.",
      "Students can follow simple classroom instructions.",
      "Students can describe basic objects using single words.",
    ],
    format_description:
      "Picture naming, repeat-after-me tasks, matching basic vocabulary.",
    examples: [
      "Name the picture: (dog, sun, apple).",
      "Point to the 'blue' object.",
      "Say one thing you like: 'I like ___.",
    ],
  },
  {
    education_level: "elementary",
    year: "Grade 1",
    subject: "Natural Sciences",
    learning_objectives: [
      "Students can name basic animals and plants.",
      "Students can describe simple weather conditions.",
      "Students can observe and talk about basic natural phenomena.",
    ],
    format_description:
      "Picture-based classification, simple observations, matching tasks.",
    examples: [
      "Sett dyr i riktig gruppe: fugl / fisk / dyr på land.",
      "Hva slags vær er dette? (sol, regn, snø).",
      "Hvilken del av planten er dette? Rot / stilk / blad.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 1",
    subject: "Social Studies",
    learning_objectives: [
      "Students can describe their family and home.",
      "Students can follow basic rules in groups.",
      "Students can identify familiar places in the community.",
    ],
    format_description:
      "Picture discussions, very short responses, matching roles and places.",
    examples: [
      "Hvem bor sammen med deg?",
      "Nevn én regel i klassen.",
      "Kryss av: Dette er en butikk / skole / park.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 1",
    subject: "History",
    learning_objectives: [
      "Students can describe simple differences between now and the past.",
      "Students can talk about old objects and traditions.",
      "Students can listen to and retell short historical stories.",
    ],
    format_description:
      "Image comparison, timeline with 2–3 steps, simple questions.",
    examples: [
      "Hvilket bilde viser skole før?",
      "Hva brukte folk før for å få lys?",
      "Fortell kort om en gammel ting du har sett.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 1",
    subject: "Physical Education",
    learning_objectives: [
      "Students can follow simple rules during play.",
      "Students can participate in basic movement activities.",
      "Students can cooperate with others in simple games.",
    ],
    format_description:
      "Reflection on activities, rule identification, sorting tasks.",
    examples: [
      "Nevn én regel i 'Haien kommer'.",
      "Hva liker du best å bevege deg med? (løpe, hoppe, kaste)",
      "Hvordan kan du hjelpe laget ditt?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 1",
    subject: "Music",
    learning_objectives: [
      "Students can identify simple sounds and instruments.",
      "Students can clap or follow simple rhythms.",
      "Students can express how music makes them feel.",
    ],
    format_description:
      "Listening tasks, rhythm imitation, simple emotional response.",
    examples: [
      "Hvilket instrument hører du? Tromme / fløyte / piano?",
      "Kjapp rytme eller langsom rytme?",
      "Hvordan får musikken deg til å føle deg?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 1",
    subject: "Arts and Crafts",
    learning_objectives: [
      "Students can use simple shapes to create pictures.",
      "Students can choose colors for basic artworks.",
      "Students can describe what they have made.",
    ],
    format_description: "Drawing prompts, color choices, describe-your-art.",
    examples: [
      "Tegn et hus med tre former.",
      "Velg to farger du liker og bruk dem i tegningen.",
      "Fortell: Hva har du laget?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 1",
    subject: "Food and Health",
    learning_objectives: [
      "Students can identify basic healthy foods.",
      "Students can follow simple hygiene routines.",
      "Students can describe what they eat during the day.",
    ],
    format_description: "Sorting foods, picture tasks, sequencing steps.",
    examples: [
      "Sett kryss: sunn / mindre sunn (eple, sjokolade, gulrot).",
      "Hva gjør du før du lager mat?",
      "Hva spiser du til frokost?",
    ],
  },

  /* ---------------- GRADE 2 ------------------*/

  {
    education_level: "elementary",
    year: "Grade 2",
    subject: "Norwegian (Bokmål)",
    learning_objectives: [
      "Students can read and understand short texts.",
      "Students can write simple sentences independently.",
      "Students can talk about events and characters in stories.",
    ],
    format_description:
      "Short texts with questions, sentence construction, vocabulary tasks.",
    examples: [
      "Hvor dro Maria i helgen?",
      "Skriv to setninger om et sted du liker.",
      "Finn tre ord i teksten som beskriver følelsene.",
    ],
  },
  {
    education_level: "elementary",
    year: "Grade 2",
    subject: "Norwegian (Nynorsk)",
    learning_objectives: [
      "Students can read simple Nynorsk texts with support.",
      "Students can use basic Nynorsk verbs and nouns.",
      "Students can write short Nynorsk sentences.",
    ],
    format_description:
      "Reading tasks with images, fill-in-the-blank, vocabulary matching.",
    examples: [
      "Kva gjer guten i teksten?",
      "Fullfør: Eg ___ (likar) eple.",
      "Skriv ei enkel setning i Nynorsk.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 2",
    subject: "Mathematics",
    learning_objectives: [
      "Students can add and subtract numbers up to 100.",
      "Students can describe patterns and simple diagrams.",
      "Students can solve simple real-life math problems.",
    ],
    format_description:
      "Two-step problems, number sequences, simple bar illustrations.",
    examples: [
      "42 − 18 = ?",
      "Fullfør mønsteret: 2, 4, 6, __, __.",
      "Lise har 20 kroner. Hun kjøper en is for 12. Hvor mye er igjen?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 2",
    subject: "English",
    learning_objectives: [
      "Students can understand simple spoken and written English.",
      "Students can describe familiar objects and activities.",
      "Students can write short sentences.",
    ],
    format_description:
      "Short reading tasks, picture descriptions, simple grammar tasks.",
    examples: [
      "Describe the picture: What is the girl doing?",
      "Write a short sentence: 'I can ___.",
      "Fill in the word: This is a ___ (cat/dog).",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 2",
    subject: "Natural Sciences",
    learning_objectives: [
      "Students can classify animals, plants, and materials.",
      "Students can describe simple weather and seasonal changes.",
      "Students can talk about what living things need to survive.",
    ],
    format_description:
      "Sorting tasks, simple explanations, observation-based questions.",
    examples: [
      "Hvilke dyr lever i vann?",
      "Hvorfor trenger planter sol?",
      "Hvilken årstid viser bildet?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 2",
    subject: "Social Studies",
    learning_objectives: [
      "Students can describe local community roles (teacher, doctor, fireman).",
      "Students can understand basic maps and symbols.",
      "Students can explain simple social rules.",
    ],
    format_description: "Map tasks, matching roles, short explanations.",
    examples: [
      "Hva gjør en brannmann?",
      "Finn skolen på kartet.",
      "Hvorfor har vi trafikkregler?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 2",
    subject: "History",
    learning_objectives: [
      "Students can place simple events in chronological order.",
      "Students can identify differences between past and present.",
      "Students can use simple historical sources (pictures, artifacts).",
    ],
    format_description:
      "Timeline with 3–4 steps, image interpretation, short questions.",
    examples: [
      "Sett hendelsene i riktig rekkefølge.",
      "Nevn én ting som var annerledes i gamle dager.",
      "Hva viser dette gamle bildet?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 2",
    subject: "Physical Education",
    learning_objectives: [
      "Students can move in different ways in varied environments.",
      "Students can follow rules and cooperate in small team games.",
      "Students can reflect on physical activity they enjoy.",
    ],
    format_description: "Reflection prompts, rule questions, activity sorting.",
    examples: [
      "Nevn en regel i stafett.",
      "Hva liker du best: løpe, hoppe eller kaste?",
      "Hvorfor er det viktig å varme opp?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 2",
    subject: "Music",
    learning_objectives: [
      "Students can recognize tempo, rhythm, and simple melodies.",
      "Students can follow and repeat simple rhythmic patterns.",
      "Students can express moods created by music.",
    ],
    format_description: "Listening tasks, rhythm copying, mood expression.",
    examples: [
      "Er musikken rask eller langsom?",
      "Klapp rytmen du hører.",
      "Hvordan føler du deg når du hører denne melodien?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 2",
    subject: "Arts and Crafts",
    learning_objectives: [
      "Students can use basic tools and materials safely.",
      "Students can combine shapes and colors in creative work.",
      "Students can explain simple choices in their artwork.",
    ],
    format_description: "Collage tasks, color-matching, reflection.",
    examples: [
      "Lag en collage med minst tre farger.",
      "Hvilke former brukte du?",
      "Hvorfor valgte du disse fargene?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 2",
    subject: "Food and Health",
    learning_objectives: [
      "Students can identify basic food groups.",
      "Students can follow simple food-preparation routines.",
      "Students can reflect on healthy eating habits.",
    ],
    format_description: "Sorting foods, hygiene steps, simple reflections.",
    examples: [
      "Sorter mat: frukt / grønnsaker / snacks.",
      "Hva må du gjøre før du lager mat?",
      "Nevn én sunn matvare.",
    ],
  },

  /* ================================
     ==========  GRADE 3  ===========
     ================================ */

  {
    education_level: "elementary",
    year: "Grade 3",
    subject: "Norwegian (Bokmål)",
    learning_objectives: [
      "Students can read and understand short narrative and factual texts.",
      "Students can write coherent sentences with correct punctuation.",
      "Students can describe characters and events using simple details.",
    ],
    format_description:
      "Short reading texts, comprehension questions, 3–5 sentence writing tasks.",
    examples: [
      "Hvorfor ble Emma overrasket i historien?",
      "Finn to adjektiver som beskriver hovedpersonen.",
      "Skriv tre setninger om et sted du liker.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 3",
    subject: "Norwegian (Nynorsk)",
    learning_objectives: [
      "Students can read simple Nynorsk texts with increasing independence.",
      "Students can use basic Nynorsk verb and noun forms correctly.",
      "Students can write short Nynorsk paragraphs.",
    ],
    format_description:
      "Short texts, vocabulary tasks, fill-the-gaps, simple writing.",
    examples: [
      "Kva handlar teksten om?",
      "Fullfør setninga: Eg ___ på skulen i dag.",
      "Skriv tre setningar om familien din.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 3",
    subject: "Mathematics",
    learning_objectives: [
      "Students can add and subtract multi-digit numbers.",
      "Students can understand simple multiplication and division concepts.",
      "Students can solve word problems using basic strategies.",
    ],
    format_description:
      "Word problems, number patterns, multi-digit operations.",
    examples: [
      "345 − 128 = ?",
      "Hva er 4 × 6?",
      "Lise har 24 kaker og deler dem på 6 venner. Hvor mange får hver?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 3",
    subject: "English",
    learning_objectives: [
      "Students can read short texts and answer simple questions.",
      "Students can write 3–5 sentence descriptions.",
      "Students can use basic present tense correctly.",
    ],
    format_description:
      "Short texts, picture descriptions, fill-in grammar tasks.",
    examples: [
      "Read and answer: What is Tom doing in the morning?",
      "Describe your favourite food in three sentences.",
      "Fill in: She ___ (play) with her dog.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 3",
    subject: "Natural Sciences",
    learning_objectives: [
      "Students can explain basic properties of materials and living organisms.",
      "Students can describe simple life cycles.",
      "Students can carry out basic observations and share findings.",
    ],
    format_description:
      "Classification tasks, simple explanations, experiment observations.",
    examples: [
      "Hva er forskjellen på et rovdyr og et planteeter?",
      "Beskriv livssyklusen til en sommerfugl.",
      "Hvilke materialer flyter og synker?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 3",
    subject: "Social Studies",
    learning_objectives: [
      "Students can describe the local community and important roles.",
      "Students can read simple maps and symbols.",
      "Students can explain basic rights and responsibilities.",
    ],
    format_description: "Map exercises, role descriptions, scenario questions.",
    examples: [
      "Hva gjør en lege i lokalsamfunnet?",
      "Finn nord på kartet.",
      "Hvorfor er regler viktige?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 3",
    subject: "History",
    learning_objectives: [
      "Students can describe everyday life in earlier times.",
      "Students can use timelines with 4–5 events.",
      "Students can compare past and present.",
    ],
    format_description:
      "Timelines, picture comparisons, simple source analysis.",
    examples: [
      "Hva var annerledes i gamle skoler?",
      "Sett hendelsene i riktig rekkefølge.",
      "Hva kan bildet fortelle om livet for 100 år siden?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 3",
    subject: "Physical Education",
    learning_objectives: [
      "Students can perform basic coordination exercises.",
      "Students can follow rules in simple team games.",
      "Students can discuss how activity affects the body.",
    ],
    format_description:
      "Reflection prompts, rule explanations, body awareness tasks.",
    examples: [
      "Hva betyr samarbeid i en lagaktivitet?",
      "Nevn to øvelser som trener balanse.",
      "Hvordan føles kroppen etter aktivitet?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 3",
    subject: "Music",
    learning_objectives: [
      "Students can identify basic musical elements such as tempo and pitch.",
      "Students can follow rhythmic patterns.",
      "Students can describe music using simple terms.",
    ],
    format_description:
      "Listening tasks, rhythm imitation, descriptive questions.",
    examples: [
      "Er melodien lys eller mørk?",
      "Gjenta rytmen du hører.",
      "Beskriv musikken med tre ord.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 3",
    subject: "Arts and Crafts",
    learning_objectives: [
      "Students can use tools and materials safely.",
      "Students can combine forms, colors, and textures.",
      "Students can tell about their own artwork.",
    ],
    format_description: "Drawing, collage tasks, reflection prompts.",
    examples: [
      "Lag et bilde som bruker minst tre former.",
      "Velg to teksturer og bruk dem i arbeidet ditt.",
      "Beskriv ett valg du tok i kunstverket ditt.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 3",
    subject: "Food and Health",
    learning_objectives: [
      "Students can classify foods into basic groups.",
      "Students can follow simple recipes.",
      "Students can explain why hygiene is important.",
    ],
    format_description: "Sorting tasks, recipe steps, short explanations.",
    examples: [
      "Sorter matvarene: frukt / grønnsaker / korn.",
      "Sett stegene i riktig rekkefølge.",
      "Hvorfor vasker vi hendene før matlaging?",
    ],
  },

  /* ================================
     ==========  GRADE 4  ===========
     ================================ */

  {
    education_level: "elementary",
    year: "Grade 4",
    subject: "Norwegian (Bokmål)",
    learning_objectives: [
      "Students can read longer texts and find key information.",
      "Students can write short paragraphs with transitions.",
      "Students can discuss messages and themes in simple texts.",
    ],
    format_description:
      "Paragraph writing, comprehension questions, vocabulary tasks.",
    examples: [
      "Hva er hovedtemaet i teksten?",
      "Skriv et kort sammendrag av avsnittet.",
      "Finn tre ord som beskriver stemningen.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 4",
    subject: "Norwegian (Nynorsk)",
    learning_objectives: [
      "Students can read short Nynorsk texts with understanding.",
      "Students can use common Nynorsk verb conjugations.",
      "Students can write coherent Nynorsk sentences.",
    ],
    format_description:
      "Text-based questions, grammar tasks, sentence writing.",
    examples: [
      "Kva skjer i første avsnitt?",
      "Bøy verbet i presens: å lese.",
      "Skriv ei kort setning om hobbyen din.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 4",
    subject: "Mathematics",
    learning_objectives: [
      "Students can multiply and divide numbers up to 100.",
      "Students can interpret simple bar graphs and tables.",
      "Students can solve multi-step calculations.",
    ],
    format_description:
      "Multi-step problems, graph reading, multiplication/division.",
    examples: [
      "Hva er 8 × 7?",
      "Se på diagrammet: Hvor mange barn liker epler?",
      "Løs problemet: 128 + 75 − 36.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 4",
    subject: "English",
    learning_objectives: [
      "Students can read short stories and answer comprehension questions.",
      "Students can write descriptive paragraphs.",
      "Students can use simple past tense correctly.",
    ],
    format_description: "Reading tasks, picture descriptions, grammar writing.",
    examples: [
      "What happened first in the story?",
      "Write 4–5 sentences about your weekend.",
      "Fill in past tense: She ___ (walk) home.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 4",
    subject: "Natural Sciences",
    learning_objectives: [
      "Students can explain basic physical and chemical changes.",
      "Students can describe ecosystems and food chains.",
      "Students can perform simple investigations.",
    ],
    format_description:
      "Food chain diagrams, observation logs, explanation tasks.",
    examples: [
      "Lag en enkel næringskjede.",
      "Hva skjer når is smelter?",
      "Forklar forskjellen på et rovdyr og et byttedyr.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 4",
    subject: "Social Studies",
    learning_objectives: [
      "Students can explain basic societal structures.",
      "Students can read maps with scale and symbols.",
      "Students can describe Norwegian traditions and cultures.",
    ],
    format_description: "Map tasks, culture comparison, role discussions.",
    examples: [
      "Hva betyr symbolet på kartet?",
      "Nevn en norsk tradisjon og beskriv den.",
      "Hva er kommunens oppgaver?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 4",
    subject: "History",
    learning_objectives: [
      "Students can describe important events in Norwegian history.",
      "Students can use simple written and visual sources.",
      "Students can compare periods such as Viking Age and Middle Ages.",
    ],
    format_description:
      "Timeline building, source interpretation, comparison tasks.",
    examples: [
      "Nevn to kjennetegn ved vikingtiden.",
      "Hva viser denne kilden?",
      "Sammenlign hverdagsliv før og nå.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 4",
    subject: "Physical Education",
    learning_objectives: [
      "Students can perform a variety of movements in different activities.",
      "Students can reflect on fair play and inclusion.",
      "Students can discuss simple training concepts.",
    ],
    format_description:
      "Short reflections, rule tasks, training concept questions.",
    examples: [
      "Hva betyr det å inkludere alle?",
      "Nevn to måter å trene styrke på.",
      "Hva er en viktig regel i ballspill?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 4",
    subject: "Music",
    learning_objectives: [
      "Students can identify characteristics of different music styles.",
      "Students can follow and create simple rhythms.",
      "Students can describe musical expressions.",
    ],
    format_description:
      "Listening analysis, rhythm creation, style comparison.",
    examples: [
      "Hvilken musikkstil passer best til klippet?",
      "Skriv en enkel rytme.",
      "Hva gjør musikken spennende?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 4",
    subject: "Arts and Crafts",
    learning_objectives: [
      "Students can plan and complete artworks using multiple materials.",
      "Students can explain visual elements such as lines and contrast.",
      "Students can evaluate their own work.",
    ],
    format_description: "Project planning, material choice tasks, reflection.",
    examples: [
      "Lag en enkel skisse av ideen din.",
      "Hvilke materialer vil du bruke og hvorfor?",
      "Hva ble du mest fornøyd med?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 4",
    subject: "Food and Health",
    learning_objectives: [
      "Students can explain basic nutrition concepts.",
      "Students can prepare simple healthy meals.",
      "Students can compare healthy and unhealthy choices.",
    ],
    format_description:
      "Food classification, recipe tasks, health reflections.",
    examples: [
      "Hvilke matvarer gir energi?",
      "Lag en enkel frokostmeny.",
      "Hva gjør et måltid sunt?",
    ],
  },

  /* ================================
     ==========  GRADE 5  ===========
     ================================ */

  {
    education_level: "elementary",
    year: "Grade 5",
    subject: "Norwegian (Bokmål)",
    learning_objectives: [
      "Students can analyze characters and plot in longer texts.",
      "Students can write structured paragraphs using transitions.",
      "Students can summarize information in their own words.",
    ],
    format_description: "Text analysis, structured writing, vocabulary work.",
    examples: [
      "Hva er budskapet i teksten?",
      "Beskriv en konflikt i historien.",
      "Skriv et kort sammendrag av teksten.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 5",
    subject: "Norwegian (Nynorsk)",
    learning_objectives: [
      "Students can read and understand grade-level Nynorsk texts.",
      "Students can use correct Nynorsk forms of common words.",
      "Students can write short informative texts in Nynorsk.",
    ],
    format_description: "Grammar tasks, reading comprehension, short writing.",
    examples: [
      "Kva handlar teksten om?",
      "Bøy substantivet: jente.",
      "Skriv eit lite avsnitt om hobbyen din.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 5",
    subject: "Mathematics",
    learning_objectives: [
      "Students can work with fractions and decimals.",
      "Students can analyze graphs and tables.",
      "Students can use efficient strategies for calculations.",
    ],
    format_description:
      "Word problems, fractions tasks, diagram interpretation.",
    examples: [
      "Hva er 1/2 av 24?",
      "Skriv 0.6 som brøk.",
      "Hva viser søylediagrammet?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 5",
    subject: "English",
    learning_objectives: [
      "Students can read grade-level texts and infer meaning.",
      "Students can write short narratives and descriptions.",
      "Students can use past and present tense accurately.",
    ],
    format_description: "Reading tasks, grammar exercises, short writing.",
    examples: [
      "Why did the main character change his mind?",
      "Write a paragraph about a memorable day.",
      "Fill in: They ___ (go) to school yesterday.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 5",
    subject: "Natural Sciences",
    learning_objectives: [
      "Students can explain states of matter and simple energy forms.",
      "Students can describe human body systems.",
      "Students can conduct simple investigations with variables.",
    ],
    format_description:
      "Labeling diagrams, explanation tasks, experiment logs.",
    examples: [
      "Forklar forskjellen på fordamping og kondensering.",
      "Merk delene av sirkulasjonssystemet.",
      "Hva er hypotesen din i dette forsøket?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 5",
    subject: "Social Studies",
    learning_objectives: [
      "Students can describe Norwegian geography and natural features.",
      "Students can explain democratic principles.",
      "Students can discuss cultural differences.",
    ],
    format_description: "Map tasks, democracy questions, comparison tasks.",
    examples: [
      "Hva er et fylke?",
      "Hva betyr demokrati?",
      "Nevn én likhet og én forskjell mellom to kulturer.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 5",
    subject: "History",
    learning_objectives: [
      "Students can describe key events in Viking and Medieval history.",
      "Students can use multiple sources to answer questions.",
      "Students can compare changes across periods.",
    ],
    format_description: "Source analysis, comparison, timelines.",
    examples: [
      "Nevn to grunner til at vikingene dro på reiser.",
      "Hva kan denne kilden fortelle oss?",
      "Sammenlign vikingtiden og middelalderen.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 5",
    subject: "Physical Education",
    learning_objectives: [
      "Students can perform complex movement patterns.",
      "Students can reflect on training goals.",
      "Students can explain how physical activity benefits health.",
    ],
    format_description:
      "Reflection writing, skill explanation, training planning.",
    examples: [
      "Hva er ditt treningsmål?",
      "Beskriv en aktivitet som trener utholdenhet.",
      "Hvordan påvirker trening kroppen?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 5",
    subject: "Music",
    learning_objectives: [
      "Students can describe rhythm, melody, and harmony.",
      "Students can compare different musical genres.",
      "Students can create simple compositions.",
    ],
    format_description: "Music analysis, rhythm tasks, composition prompts.",
    examples: [
      "Hva kjennetegner melodien i dette stykket?",
      "Sammenlign to musikkstiler.",
      "Lag en enkel rytme og skriv den ned.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 5",
    subject: "Arts and Crafts",
    learning_objectives: [
      "Students can plan and produce artworks using varied techniques.",
      "Students can explain concepts like proportion and symmetry.",
      "Students can evaluate their own and others’ work.",
    ],
    format_description: "Project descriptions, technique tasks, reflection.",
    examples: [
      "Lag en skisse med symmetri.",
      "Hvilken teknikk brukte du i arbeidet?",
      "Hva kunne du forbedret?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 5",
    subject: "Food and Health",
    learning_objectives: [
      "Students can explain nutrients and their functions.",
      "Students can follow simple recipes independently.",
      "Students can evaluate meal composition.",
    ],
    format_description: "Nutrition tasks, recipe creation, health reflection.",
    examples: [
      "Hva gjør proteiner i kroppen?",
      "Lag en oppskrift for en sunn lunsj.",
      "Hva mangler i denne middagen?",
    ],
  },

  /* ================================
     ==========  GRADE 6  ===========
     ================================ */

  {
    education_level: "elementary",
    year: "Grade 6",
    subject: "Norwegian (Bokmål)",
    learning_objectives: [
      "Students can analyze themes, messages, and perspectives in texts.",
      "Students can write coherent multi-paragraph texts.",
      "Students can use descriptive and narrative techniques.",
    ],
    format_description:
      "Longer text analysis, multi-paragraph writing, argumentation.",
    examples: [
      "Hva er budskapet i denne teksten?",
      "Skriv et avsnitt som beskriver miljøet i historien.",
      "Hvilken synsvinkel brukes i teksten?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 6",
    subject: "Norwegian (Nynorsk)",
    learning_objectives: [
      "Students can read and analyze grade-level Nynorsk texts.",
      "Students can use Nynorsk grammar with increasing accuracy.",
      "Students can write structured Nynorsk paragraphs.",
    ],
    format_description: "Reading tasks, grammar, writing assignments.",
    examples: [
      "Kva er temaet i teksten?",
      "Skriv om setninga i Nynorsk.",
      "Bøy verbet: å vere.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 6",
    subject: "Mathematics",
    learning_objectives: [
      "Students can work with fractions, decimals, and percentages.",
      "Students can analyze diagrams, coordinates, and basic statistics.",
      "Students can solve multi-step real-world problems.",
    ],
    format_description:
      "Fractions/per cent tasks, coordinate grids, applied problems.",
    examples: [
      "Hva er 25% av 160?",
      "Plasser punktet (4,3) i koordinatsystemet.",
      "Løs problemet: En genser koster 400 kr og får 20% rabatt.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 6",
    subject: "English",
    learning_objectives: [
      "Students can analyze characters and events in texts.",
      "Students can write coherent essays and reflections.",
      "Students can use correct verb forms across tenses.",
    ],
    format_description:
      "Longer reading tasks, structured writing, grammar practice.",
    examples: [
      "Explain why the character made this decision.",
      "Write an essay about a challenge you faced.",
      "Fill in: They ___ (have) lunch when it started raining.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 6",
    subject: "Natural Sciences",
    learning_objectives: [
      "Students can explain forces, energy, and motion.",
      "Students can describe the structure of Earth and weather systems.",
      "Students can conduct experiments with variables and measurements.",
    ],
    format_description: "Experiment logs, explanation tasks, diagrams.",
    examples: [
      "Forklar forskjellen på potensial- og bevegelsesenergi.",
      "Hva består jorda av?",
      "Lag ein hypotese for forsøket.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 6",
    subject: "Social Studies",
    learning_objectives: [
      "Students can explain global challenges and sustainability.",
      "Students can analyze how society is organized.",
      "Students can use maps and geographic tools accurately.",
    ],
    format_description:
      "Map tasks, global issue questions, cause–effect charts.",
    examples: [
      "Hva betyr bærekraft?",
      "Forklar hva Stortinget gjør.",
      "Hva viser dette kartet om Norge?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 6",
    subject: "History",
    learning_objectives: [
      "Students can describe key historical eras and transitions.",
      "Students can analyze causes and consequences.",
      "Students can use historical sources critically.",
    ],
    format_description: "Source analysis, timeline building, comparison tasks.",
    examples: [
      "Hva var en viktig årsak til svartedauden?",
      "Plasser hendelsene i riktig årstall.",
      "Hva kan vi lære av denne kilden?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 6",
    subject: "Physical Education",
    learning_objectives: [
      "Students can apply techniques in various sports.",
      "Students can discuss training principles such as intensity and endurance.",
      "Students can reflect on their own performance.",
    ],
    format_description:
      "Training reflections, technique descriptions, activity logs.",
    examples: [
      "Hva betyr intensitet?",
      "Beskriv teknikken i en valgfri øvelse.",
      "Hvordan kan du forbedre utholdenheten din?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 6",
    subject: "Music",
    learning_objectives: [
      "Students can analyze musical structures.",
      "Students can perform rhythmic and melodic patterns.",
      "Students can express opinions about musical pieces using subject terms.",
    ],
    format_description: "Music analysis, rhythm practice, reflection tasks.",
    examples: [
      "Beskriv oppbygningen av musikkstykket.",
      "Gjenta denne rytmen.",
      "Hva likte du best i musikken?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 6",
    subject: "Arts and Crafts",
    learning_objectives: [
      "Students can use artistic techniques with accuracy.",
      "Students can describe design elements such as symmetry and balance.",
      "Students can evaluate visual expressions.",
    ],
    format_description:
      "Technique tasks, design analysis, project reflections.",
    examples: [
      "Lag en tegning med symmetri.",
      "Hva gjør et bilde balansert?",
      "Hva synes du om uttrykket ditt?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 6",
    subject: "Food and Health",
    learning_objectives: [
      "Students can explain how nutrition affects health.",
      "Students can prepare balanced meals.",
      "Students can evaluate food labels and ingredients.",
    ],
    format_description: "Meal planning, food label analysis, nutrition tasks.",
    examples: [
      "Hva er en næringsrik middag?",
      "Lag en ukemeny.",
      "Hva betyr ingredienslisten?",
    ],
  },
  /* ================================
     ==========  GRADE 7  ===========
     ================================ */

  {
    education_level: "elementary",
    year: "Grade 7",
    subject: "Norwegian (Bokmål)",
    learning_objectives: [
      "Students can analyze themes and perspectives in complex texts.",
      "Students can write argumentative and narrative texts.",
      "Students can use advanced vocabulary and cohesive devices.",
    ],
    format_description:
      "Deep text analysis, structured writing, argumentation tasks.",
    examples: [
      "Hva er forfatterens budskap?",
      "Skriv en argumenterende tekst om et aktuelt tema.",
      "Analyser en konflikt i teksten.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 7",
    subject: "Norwegian (Nynorsk)",
    learning_objectives: [
      "Students can understand longer Nynorsk texts.",
      "Students can apply Nynorsk grammar in own writing.",
      "Students can write structured Nynorsk essays.",
    ],
    format_description:
      "Reading comprehension, grammar tasks, structured writing.",
    examples: [
      "Kva synspunkt kjem fram i teksten?",
      "Skriv ei Nynorsk forteljing.",
      "Bøy verbet i alle tider: å skrive.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 7",
    subject: "Mathematics",
    learning_objectives: [
      "Students can apply fractions, percentages, and ratios.",
      "Students can analyze coordinate systems and statistical data.",
      "Students can solve advanced multi-step problems.",
    ],
    format_description:
      "Applied maths problems, graphs, multi-step calculation.",
    examples: [
      "Hva er forholdet 3:12?",
      "Plott punktene (–2,4) og (3,–1).",
      "En vare koster 900 kr etter 25% rabatt. Hva var førprisen?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 7",
    subject: "English",
    learning_objectives: [
      "Students can interpret and analyze themes in texts.",
      "Students can write essays with structure and clarity.",
      "Students can use grammar correctly across multiple tenses.",
    ],
    format_description: "Text analysis, essay writing, grammatical tasks.",
    examples: [
      "What is the theme of the text?",
      "Write a short essay about technology and daily life.",
      "Fill in: If I ___ (know), I would have helped.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 7",
    subject: "Natural Sciences",
    learning_objectives: [
      "Students can explain renewable and non-renewable energy sources.",
      "Students can describe cell structure and basic biology.",
      "Students can conduct controlled experiments with variables.",
    ],
    format_description:
      "Scientific method tasks, diagrams, explanation activities.",
    examples: [
      "Hva er forskjellen på fornybar og ikke-fornybar energi?",
      "Tegn og navn cellens deler.",
      "Formuler ein hypotese for forsøket.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 7",
    subject: "Social Studies",
    learning_objectives: [
      "Students can discuss global issues such as environment and equality.",
      "Students can explain how political systems function.",
      "Students can interpret complex maps and diagrams.",
    ],
    format_description: "Longer reflections, map analysis, cause–effect tasks.",
    examples: [
      "Hva er en utfordring knyttet til global oppvarming?",
      "Forklar rolla til regjeringa.",
      "Hva viser kartet om verdens befolkning?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 7",
    subject: "History",
    learning_objectives: [
      "Students can analyze causes and consequences of major historical events.",
      "Students can compare historical periods.",
      "Students can critically evaluate historical sources.",
    ],
    format_description:
      "Source evaluation, timeline tasks, comparative writing.",
    examples: [
      "Hva var hovedårsaken til den industrielle revolusjonen?",
      "Sammenlign to historiske perioder.",
      "Hva kan denne kilden fortelle oss – og hva kan den ikke fortelle?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 7",
    subject: "Physical Education",
    learning_objectives: [
      "Students can perform advanced movement patterns.",
      "Students can plan personal training goals.",
      "Students can reflect on health, lifestyle, and physical activity.",
    ],
    format_description:
      "Training logs, performance reflections, planning tasks.",
    examples: [
      "Lag en treningsplan for to uker.",
      "Hva er dine styrker i idrett?",
      "Hvordan påvirker inaktivitet helsa?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 7",
    subject: "Music",
    learning_objectives: [
      "Students can analyze musical structures and moods.",
      "Students can perform more complex rhythms and melodies.",
      "Students can express critical opinions about music.",
    ],
    format_description: "Analysis tasks, performance-based tasks, reflection.",
    examples: [
      "Beskriv instrumentbruken i stykket.",
      "Gjengi denne meir avanserte rytmen.",
      "Hva synes du om musikken – og hvorfor?",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 7",
    subject: "Arts and Crafts",
    learning_objectives: [
      "Students can use advanced art techniques and planning.",
      "Students can apply design principles professionally.",
      "Students can analyze visual communication.",
    ],
    format_description: "Project planning, design analysis, critique writing.",
    examples: [
      "Lag en detaljert skisse før du starter.",
      "Analyser komposisjonen i et valgt kunstverk.",
      "Beskriv budskapet i et bilde.",
    ],
  },

  {
    education_level: "elementary",
    year: "Grade 7",
    subject: "Food and Health",
    learning_objectives: [
      "Students can explain how diet impacts long-term health.",
      "Students can prepare balanced meals independently.",
      "Students can analyze food labels and sustainability choices.",
    ],
    format_description:
      "Meal planning, nutrition evaluations, sustainability tasks.",
    examples: [
      "Hva er en god balanse mellom næringsstoffer?",
      "Lag en ukemeny med fokus på helse.",
      "Vurder matens miljøpåvirkning.",
    ],
  },
  /* ==========================
     ========   VG1   =========
     ========================== */

  {
    education_level: "high-school",
    year: "Year 1 (VG1)",
    subject: "English",
    learning_objectives: [
      "Students can understand and interpret short literary and factual texts.",
      "Students can write coherent paragraphs using appropriate vocabulary.",
      "Students can discuss cultural topics from English-speaking countries.",
    ],
    format_description:
      "Short reading texts, comprehension tasks, vocabulary activities, paragraph writing.",
    examples: [
      "Explain why the main character feels uncertain in the text.",
      "Write a paragraph describing a tradition from an English-speaking country.",
      "Find two expressions in the text related to emotions.",
    ],
  },

  {
    education_level: "high-school",
    year: "Year 1 (VG1)",
    subject: "Mathematics",
    learning_objectives: [
      "Students can solve algebraic equations and inequalities.",
      "Students can interpret functions and simple graphs.",
      "Students can apply mathematical reasoning in structured tasks.",
    ],
    format_description:
      "Algebra tasks, function interpretation, multi-step reasoning problems.",
    examples: [
      "Solve the equation: 2x − 5 = 3x + 7.",
      "Interpret the graph: What is the slope and what does it represent?",
      "A car travels 60 km/h. How far does it go in 2.5 hours?",
    ],
  },

  {
    education_level: "high-school",
    year: "Year 1 (VG1)",
    subject: "History",
    learning_objectives: [
      "Students can describe major historical developments up to 1800.",
      "Students can explain causes and consequences of early historical events.",
      "Students can use primary sources to answer simple questions.",
    ],
    format_description:
      "Source tasks, timeline building, cause–effect questions.",
    examples: [
      "What was a major cause of the Black Death?",
      "Place these events on a timeline: Renaissance, Viking Age, Enlightenment.",
      "What does this primary source reveal about medieval society?",
    ],
  },

  {
    education_level: "high-school",
    year: "Year 1 (VG1)",
    subject:
      "General Study Programmes (Sports, Art, Media, Music, Dance, Drama)",
    learning_objectives: [
      "Students can describe central concepts in their specialization.",
      "Students can reflect on skills and techniques used in practical work.",
      "Students can participate in basic creative or performance tasks.",
    ],
    format_description:
      "Reflection notes, technique descriptions, simple project tasks.",
    examples: [
      "Sports: Explain how warming up reduces injury risk.",
      "Music: Describe how rhythm creates structure in a song.",
      "Media: Create a simple storyboard for a 10-second clip.",
    ],
  },

  {
    education_level: "high-school",
    year: "Year 1 (VG1)",
    subject: "General Study Programmes",
    learning_objectives: [
      "Students can identify and discuss basic interdisciplinary concepts.",
      "Students can organize information from multiple sources.",
      "Students can reflect on their own learning strategies.",
    ],
    format_description:
      "Short reflection tasks, basic analysis, structured note-taking.",
    examples: [
      "Define the concept of ‘innovation’ in your own words.",
      "Compare two ways of learning effectively.",
      "Summarize a short article using 3 key points.",
    ],
  },

  /* ==========================
     ========   VG2   =========
     ========================== */

  {
    education_level: "high-school",
    year: "Year 2 (VG2)",
    subject: "English",
    learning_objectives: [
      "Students can analyze themes and perspectives in literary and media texts.",
      "Students can write structured analytical and argumentative texts.",
      "Students can use advanced vocabulary and coherent paragraph structures.",
    ],
    format_description:
      "Literary analysis, argument writing, structured discussion questions.",
    examples: [
      "Analyze how the author builds tension in the short story.",
      "Write an argumentative text: Should social media use be limited for teenagers?",
      "Explain how the setting influences the characters’ decisions.",
    ],
  },

  {
    education_level: "high-school",
    year: "Year 2 (VG2)",
    subject: "Mathematics",
    learning_objectives: [
      "Students can analyze functions including linear, quadratic, and exponential forms.",
      "Students can apply algebraic reasoning in multi-step problems.",
      "Students can work with statistics and probability.",
    ],
    format_description:
      "Function analysis, equation solving, applied statistics tasks.",
    examples: [
      "Find the vertex of f(x) = x² − 6x + 5.",
      "A bag has 3 blue and 7 red balls. What is the probability of drawing blue?",
      "Explain how exponential growth differs from linear growth.",
    ],
  },

  {
    education_level: "high-school",
    year: "Year 2 (VG2)",
    subject: "History",
    learning_objectives: [
      "Students can analyze historical developments from 1800 to modern times.",
      "Students can evaluate multiple causes behind major events.",
      "Students can compare historical sources critically.",
    ],
    format_description:
      "Analytical essays, source comparison, cause–effect chains.",
    examples: [
      "Explain two causes of the Industrial Revolution.",
      "Compare two sources about World War I.",
      "How did industrialization change everyday life?",
    ],
  },

  {
    education_level: "high-school",
    year: "Year 2 (VG2)",
    subject:
      "General Study Programmes (Sports, Art, Media, Music, Dance, Drama)",
    learning_objectives: [
      "Students can apply techniques and methods relevant to practical fields.",
      "Students can analyze performance, production, or creative work.",
      "Students can reflect on personal competence development.",
    ],
    format_description:
      "Technique analysis, performance review, reflection logs.",
    examples: [
      "Sports: Describe how intervals improve endurance.",
      "Music: Analyze the dynamic changes in a chosen piece.",
      "Media: Evaluate how camera angles influence storytelling.",
    ],
  },

  {
    education_level: "high-school",
    year: "Year 2 (VG2)",
    subject: "General Study Programmes",
    learning_objectives: [
      "Students can integrate knowledge across subjects to solve complex tasks.",
      "Students can evaluate information critically.",
      "Students can present structured arguments orally and in writing.",
    ],
    format_description:
      "Short essays, comparison tasks, structured discussions.",
    examples: [
      "Compare two approaches to solving a social challenge.",
      "Evaluate whether a source is reliable and explain why.",
      "Discuss how technology influences learning in schools.",
    ],
  },

  /* ==========================
     ========   VG3   =========
     ========================== */

  {
    education_level: "high-school",
    year: "Year 3 (VG3)",
    subject: "English",
    learning_objectives: [
      "Students can interpret complex texts and evaluate arguments.",
      "Students can write extended analytical and persuasive essays.",
      "Students can express nuanced viewpoints on social and global issues.",
    ],
    format_description:
      "Advanced text analysis, essay writing, discourse interpretation.",
    examples: [
      "Evaluate how the text portrays power and inequality.",
      "Write an essay discussing the impact of AI on society.",
      "Analyze the rhetorical strategies used in a speech.",
    ],
  },

  {
    education_level: "high-school",
    year: "Year 3 (VG3)",
    subject: "Mathematics",
    learning_objectives: [
      "Students can analyze advanced functions and mathematical models.",
      "Students can solve complex algebraic and trigonometric problems.",
      "Students can evaluate real-world data using statistical reasoning.",
    ],
    format_description:
      "Modeling tasks, trigonometry problems, applied statistics.",
    examples: [
      "Solve for x: sin(x) = 0.5 in the interval 0°–360°.",
      "Model population growth using an exponential function.",
      "Interpret a regression line from a dataset.",
    ],
  },

  {
    education_level: "high-school",
    year: "Year 3 (VG3)",
    subject: "History",
    learning_objectives: [
      "Students can analyze major global developments in the 20th and 21st centuries.",
      "Students can evaluate historical arguments and historiography.",
      "Students can use sources to construct well-supported historical interpretations.",
    ],
    format_description:
      "Advanced source analysis, argumentative essays, timeline synthesis.",
    examples: [
      "Discuss the long-term consequences of World War II.",
      "Evaluate two historians’ interpretations of the Cold War.",
      "Use the sources to explain how globalization has developed.",
    ],
  },

  {
    education_level: "high-school",
    year: "Year 3 (VG3)",
    subject:
      "General Study Programmes (Sports, Art, Media, Music, Dance, Drama)",
    learning_objectives: [
      "Students can apply advanced techniques and methods in their field.",
      "Students can create, perform, or analyze complex practical work.",
      "Students can reflect critically on their development across the program.",
    ],
    format_description:
      "Advanced project tasks, performance analysis, portfolio reflections.",
    examples: [
      "Sports: Create a training plan with both short- and long-term goals.",
      "Art: Analyze how composition and color influence meaning.",
      "Media: Produce a 1-minute film and justify your stylistic choices.",
    ],
  },

  {
    education_level: "high-school",
    year: "Year 3 (VG3)",
    subject: "General Study Programmes",
    learning_objectives: [
      "Students can synthesize knowledge from multiple disciplines.",
      "Students can evaluate complex societal issues using structured reasoning.",
      "Students can communicate insights professionally both orally and in writing.",
    ],
    format_description:
      "Extended reflective writing, interdisciplinary analysis, presentation tasks.",
    examples: [
      "Discuss a real-world problem and propose an interdisciplinary solution.",
      "Reflect on how your learning strategies have evolved across VGS.",
      "Compare two societal models and argue which is more sustainable.",
    ],
  },
  /* ==========================
     ========   Higher Eduacation Year 1   =========
     ========================== */

  {
    education_level: "higher-education",
    year: "Year 1",
    subject:
      "Arts, Humanities, and Social Sciences - Arts (Art, Design, Architecture, Music, Dance, Drama)",
    learning_objectives: [
      "Students can identify foundational concepts in artistic form, composition, and expression.",
      "Students can analyze simple artworks or performances using basic terminology.",
      "Students can reflect on personal creative choices in introductory projects.",
    ],
    format_description:
      "Introductory analysis tasks, visual/performative reflection prompts, terminology exercises.",
    examples: [
      "Describe how color and contrast are used in the chosen artwork.",
      "Reflect: What artistic decisions did you make in your first project and why?",
      "Identify three basic design elements in the given image.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 1",
    subject:
      "Arts, Humanities, and Social Sciences - Humanities (Languages and Literature, History, Philosophy)",
    learning_objectives: [
      "Students can summarize central ideas in introductory humanities texts.",
      "Students can compare basic perspectives in literature or philosophy.",
      "Students can use academic reading and writing skills at an introductory level.",
    ],
    format_description:
      "Short text analyses, source interpretation, academic writing basics.",
    examples: [
      "Summarize the main argument of the text in 4–5 sentences.",
      "Compare two characters’ motivations in the short story.",
      "Identify one philosophical question raised in the reading.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 1",
    subject:
      "Arts, Humanities, and Social Sciences - Social Sciences (Economics, Psychology, Sociology, Political Science, Social Anthropology)",
    learning_objectives: [
      "Students can explain key introductory concepts in social science disciplines.",
      "Students can interpret simple empirical findings.",
      "Students can describe how social structures influence individual behavior.",
    ],
    format_description:
      "Concept-definition tasks, introductory case analysis, simple data interpretation.",
    examples: [
      "Define: social norm, incentive, or cultural value.",
      "Interpret the chart: What trend does it show?",
      "Explain one factor that influences voting behavior.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 1",
    subject: "Arts, Humanities, and Social Sciences - Media and Communication",
    learning_objectives: [
      "Students can identify basic theories of communication and media effects.",
      "Students can analyze simple media texts using introductory frameworks.",
      "Students can reflect on their own media consumption habits.",
    ],
    format_description:
      "Media analysis tasks, short reflection, communication-model exercises.",
    examples: [
      "Apply the sender–message–receiver model to a social media post.",
      "Identify the target audience of the advertisement.",
      "Reflect on how media influences your daily choices.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 1",
    subject: "STEM and Technology - Engineering (Civil, Mechanical, etc.)",
    learning_objectives: [
      "Students can apply fundamental mathematical and physical principles to engineering problems.",
      "Students can interpret technical drawings and specifications.",
      "Students can perform basic calculations related to forces, materials, or structures.",
    ],
    format_description:
      "Introductory calculation tasks, diagram interpretation, simple design reasoning.",
    examples: [
      "Calculate the force applied on a beam given mass and acceleration.",
      "Interpret the technical drawing: identify two key dimensions.",
      "Explain why material A is more suitable than material B in this scenario.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 1",
    subject:
      "STEM and Technology - ICT (Computer Science, IT, Information Systems)",
    learning_objectives: [
      "Students can explain foundational concepts in programming and algorithms.",
      "Students can design simple programs using basic control structures.",
      "Students can describe the role of information systems in organizations.",
    ],
    format_description:
      "Pseudocode tasks, simple coding exercises, conceptual IS questions.",
    examples: [
      "Write pseudocode to find the largest number in a list.",
      "Explain the difference between hardware, software, and data.",
      "Create a simple program using loops and conditionals.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 1",
    subject:
      "STEM and Technology - Natural Sciences (Biology, Chemistry, Physics, Mathematics)",
    learning_objectives: [
      "Students can describe central principles in scientific inquiry and experimentation.",
      "Students can explain basic biological, chemical, or physical processes.",
      "Students can use mathematical reasoning for introductory scientific calculations.",
    ],
    format_description:
      "Intro-level calculations, concept explanations, diagram labeling.",
    examples: [
      "Explain the difference between mitosis and meiosis.",
      "Balance the simple chemical equation provided.",
      "Describe Newton’s first law in your own words.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 1",
    subject: "Health and Welfare - Healthcare, Nursing, Medical-related fields",
    learning_objectives: [
      "Students can identify foundational concepts in human anatomy and health care systems.",
      "Students can demonstrate introductory skills in patient communication.",
      "Students can explain basic principles of hygiene and safety.",
    ],
    format_description:
      "Terminology tasks, basic scenario analysis, safety-procedure questions.",
    examples: [
      "Label the major organs in the diagram.",
      "Describe one principle of patient-centered communication.",
      "Explain why infection control is essential in clinical settings.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 1",
    subject: "Health and Welfare - Psychology (General and Specialized)",
    learning_objectives: [
      "Students can describe basic psychological theories and concepts.",
      "Students can compare simple explanations of human behavior.",
      "Students can interpret introductory experimental findings.",
    ],
    format_description:
      "Concept-definition tasks, simple case analysis, experiment interpretation.",
    examples: [
      "Define: classical conditioning, memory, motivation.",
      "Which psychological principle explains the behavior described in the scenario?",
      "Interpret the bar chart: what does it show about reaction times?",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 1",
    subject: "Business and Management - Business Administration, Economics",
    learning_objectives: [
      "Students can explain basic economic and organizational concepts.",
      "Students can interpret simple financial or market data.",
      "Students can apply introductory decision-making frameworks.",
    ],
    format_description:
      "Short case studies, graph interpretation, basic calculations.",
    examples: [
      "Explain the concept of supply and demand in one paragraph.",
      "Interpret the cost–revenue graph shown.",
      "Identify one business risk in the short scenario provided.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 1",
    subject: "Agriculture, Forestry, Fisheries and Veterinary",
    learning_objectives: [
      "Students can describe fundamental concepts in sustainable agriculture and resource use.",
      "Students can identify essential biological and ecological relationships.",
      "Students can analyze simple production or environment-related cases.",
    ],
    format_description:
      "Introductory case evaluation, species–environment diagrams, sustainability questions.",
    examples: [
      "Explain one factor that affects soil quality.",
      "Identify where this species fits in the food chain diagram.",
      "Describe one sustainability challenge in modern farming.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 1",
    subject: "Education - Teaching and Educational Studies",
    learning_objectives: [
      "Students can describe introductory theories of learning and development.",
      "Students can reflect on teacher roles and classroom communication.",
      "Students can analyze basic educational scenarios.",
    ],
    format_description:
      "Short reflections, scenario questions, introductory theory tasks.",
    examples: [
      "Explain the difference between intrinsic and extrinsic motivation.",
      "How should a teacher respond in this classroom situation?",
      "Identify one learning theory relevant to the example.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 1",
    subject: "Services - Tourism, Sales, Service-related courses",
    learning_objectives: [
      "Students can identify core principles of customer service and communication.",
      "Students can explain how tourism impacts local communities.",
      "Students can evaluate simple service-quality scenarios.",
    ],
    format_description:
      "Customer-scenario analysis, short reflections, service-model tasks.",
    examples: [
      "Describe one factor that influences customer satisfaction.",
      "Explain a positive and negative effect of tourism.",
      "Evaluate the service interaction in the scenario provided.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 1",
    subject: "Maritime Studies",
    learning_objectives: [
      "Students can identify key components of maritime safety and navigation.",
      "Students can explain basic vessel operations.",
      "Students can interpret simple maritime charts and symbols.",
    ],
    format_description:
      "Chart-interpretation tasks, safety-procedure questions, terminology exercises.",
    examples: [
      "Interpret the symbol shown on the maritime chart.",
      "Explain one principle of safe vessel operation.",
      "Identify two key parts of a standard navigation system.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 1",
    subject: "General Studies",
    learning_objectives: [
      "Students can apply foundational academic skills across disciplines.",
      "Students can summarize and evaluate introductory academic texts.",
      "Students can develop basic critical-thinking skills.",
    ],
    format_description:
      "Cross-disciplinary writing, academic reading tasks, reflection.",
    examples: [
      "Summarize the text using three key points.",
      "Identify one assumption the author makes.",
      "Reflect: What was new to you in this reading?",
    ],
  },
  /* ==========================
     ========   HIgher Education Year 2   =========
     ========================== */
  {
    education_level: "higher-education",
    year: "Year 2",
    subject:
      "Arts, Humanities, and Social Sciences - Arts (Art, Design, Architecture, Music, Dance, Drama)",
    learning_objectives: [
      "Students can analyze artistic works using established analytical frameworks.",
      "Students can develop creative concepts and justify artistic decisions.",
      "Students can evaluate aesthetic qualities in their own and others’ work.",
    ],
    format_description:
      "Critical analysis tasks, concept development exercises, structured reflection.",
    examples: [
      "Analyze how composition and spatial balance are used in the artwork.",
      "Develop a concept sketch and explain your artistic choices.",
      "Evaluate the expressive qualities of a selected performance.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 2",
    subject:
      "Arts, Humanities, and Social Sciences - Humanities (Languages and Literature, History, Philosophy)",
    learning_objectives: [
      "Students can interpret complex texts and compare multiple perspectives.",
      "Students can apply basic theoretical frameworks to literary or philosophical analysis.",
      "Students can produce clear academic essays with citations.",
    ],
    format_description:
      "Text interpretation, comparative essays, theory-application tasks.",
    examples: [
      "Compare how two authors portray moral dilemmas.",
      "Apply a literary theory of your choice to the short story.",
      "Write a short essay explaining the main argument in the philosophical text.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 2",
    subject:
      "Arts, Humanities, and Social Sciences - Social Sciences (Economics, Psychology, Sociology, Political Science, Social Anthropology)",
    learning_objectives: [
      "Students can apply introductory theories to analyze social phenomena.",
      "Students can interpret datasets and identify basic correlations.",
      "Students can explain how social structures shape group behavior.",
    ],
    format_description:
      "Case analysis, data interpretation tasks, theory-application questions.",
    examples: [
      "Use a sociological concept to explain the behavior described.",
      "Interpret the dataset: What correlation is visible?",
      "Explain how incentives influence economic decision-making.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 2",
    subject: "Arts, Humanities, and Social Sciences - Media and Communication",
    learning_objectives: [
      "Students can analyze media texts using communication models and theories.",
      "Students can evaluate the effects of media representations on audiences.",
      "Students can produce structured analyses of communication strategies.",
    ],
    format_description:
      "Media-text analysis, communication-model application, case-based questions.",
    examples: [
      "Analyze the media framing used in the selected news article.",
      "Explain how the advertisement targets specific audience segments.",
      "Apply a communication theory to explain message reception.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 2",
    subject: "STEM and Technology - Engineering",
    learning_objectives: [
      "Students can solve intermediate-level engineering problems using analytical methods.",
      "Students can interpret technical documentation and apply engineering standards.",
      "Students can evaluate material and structural choices for simple design projects.",
    ],
    format_description:
      "Technical calculations, applied problem solving, design evaluation tasks.",
    examples: [
      "Calculate the load-bearing capacity of the beam using the given data.",
      "Evaluate which material is most suitable for the structure and justify your answer.",
      "Interpret the technical specification and identify two critical parameters.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 2",
    subject:
      "STEM and Technology - ICT (Computer Science, IT, Information Systems)",
    learning_objectives: [
      "Students can design moderately complex algorithms and data structures.",
      "Students can explain core concepts in networks, databases, and system architecture.",
      "Students can implement small-scale software using structured programming.",
    ],
    format_description:
      "Coding tasks, database queries, system architecture diagrams.",
    examples: [
      "Implement a function that sorts objects using a chosen algorithm.",
      "Draw a simple system architecture for a web application.",
      "Write a SQL query to retrieve students with grades above 80.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 2",
    subject: "STEM and Technology - Natural Sciences",
    learning_objectives: [
      "Students can apply core scientific models to explain natural phenomena.",
      "Students can conduct structured experiments and analyze data.",
      "Students can use mathematical tools for scientific problem solving.",
    ],
    format_description:
      "Problem-solving tasks, lab report components, data analysis.",
    examples: [
      "Explain how energy transformation occurs in the given system.",
      "Analyze the experiment data and identify one pattern.",
      "Solve the chemical equation and describe the reaction type.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 2",
    subject: "Health and Welfare - Healthcare, Nursing, Medical-related fields",
    learning_objectives: [
      "Students can apply basic medical knowledge in patient scenarios.",
      "Students can conduct simple assessments and document observations.",
      "Students can explain the rationale behind selected clinical procedures.",
    ],
    format_description:
      "Scenario-based analysis, clinical reasoning questions, terminology application.",
    examples: [
      "Describe the steps of a basic patient assessment for the scenario.",
      "Explain why aseptic technique is required in this procedure.",
      "Document three clinical observations based on the case.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 2",
    subject: "Health and Welfare - Psychology",
    learning_objectives: [
      "Students can compare psychological theories and use them to explain behaviors.",
      "Students can interpret research findings with basic statistical concepts.",
      "Students can analyze simple psychological case studies.",
    ],
    format_description:
      "Case analysis, theory comparison, research interpretation.",
    examples: [
      "Which psychological theory best explains the client’s behavior?",
      "Interpret the correlation shown in the dataset.",
      "Compare two motivations theories in the given scenario.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 2",
    subject: "Business and Management",
    learning_objectives: [
      "Students can apply micro- and macroeconomic concepts to business cases.",
      "Students can interpret financial statements and performance indicators.",
      "Students can evaluate basic strategic decisions.",
    ],
    format_description:
      "Case studies, financial interpretation, short strategic analysis.",
    examples: [
      "Interpret the company’s income statement: What is the key takeaway?",
      "Explain how supply shifts affect market equilibrium.",
      "Suggest one strategic action based on the scenario.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 2",
    subject: "Agriculture, Forestry, Fisheries and Veterinary",
    learning_objectives: [
      "Students can analyze production systems in agricultural or marine contexts.",
      "Students can describe ecological impacts of resource use.",
      "Students can evaluate introductory sustainability measures.",
    ],
    format_description:
      "System analysis, sustainability evaluation, ecological interpretation.",
    examples: [
      "Analyze two factors limiting crop yield in the scenario.",
      "Describe how overfishing affects marine ecosystems.",
      "Evaluate whether the suggested farming practice is sustainable.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 2",
    subject: "Education - Teaching and Educational Studies",
    learning_objectives: [
      "Students can apply major learning theories to classroom scenarios.",
      "Students can analyze communication patterns in educational settings.",
      "Students can evaluate simple pedagogical strategies.",
    ],
    format_description:
      "Scenario discussion, theory application, strategy evaluation.",
    examples: [
      "Identify which learning theory best fits the classroom example.",
      "Evaluate the effectiveness of the teacher’s feedback.",
      "Describe one improvement to the lesson plan.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 2",
    subject: "Services - Tourism, Sales, Service-related courses",
    learning_objectives: [
      "Students can analyze service encounters using customer-service frameworks.",
      "Students can explain how tourism markets function.",
      "Students can evaluate quality improvements in service delivery.",
    ],
    format_description:
      "Case-based service analysis, tourism-economy questions, improvement proposals.",
    examples: [
      "Analyze the service encounter using a service-quality model.",
      "Describe one push and one pull factor for tourism demand.",
      "Suggest a quality improvement for the service scenario.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 2",
    subject: "Maritime Studies",
    learning_objectives: [
      "Students can apply basic navigation and seamanship principles.",
      "Students can analyze maritime safety procedures.",
      "Students can interpret operational data for vessel performance.",
    ],
    format_description:
      "Navigation tasks, safety-case analysis, performance-data interpretation.",
    examples: [
      "Interpret the vessel’s route based on the navigation chart.",
      "Identify one deviation in safety procedure and explain the risk.",
      "Analyze the operational data: Is fuel efficiency stable?",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 2",
    subject: "General Studies",
    learning_objectives: [
      "Students can apply academic skills across disciplines with increasing independence.",
      "Students can analyze arguments and identify assumptions in texts.",
      "Students can write structured academic reflections.",
    ],
    format_description:
      "Cross-disciplinary analysis, academic writing tasks, argument evaluation.",
    examples: [
      "Identify two assumptions in the author’s argument.",
      "Write a structured reflection about the text.",
      "Compare two perspectives on the issue presented.",
    ],
  },
  /* ==========================
     ========   HIgher Education Year 3   =========
     ========================== */
  {
    education_level: "higher-education",
    year: "Year 3",
    subject:
      "Arts, Humanities, and Social Sciences - Arts (Art, Design, Architecture, Music, Dance, Drama)",
    learning_objectives: [
      "Students can conduct structured analysis of artistic works using advanced terminology.",
      "Students can plan and execute medium-scale artistic or design projects.",
      "Students can critique artistic expressions using relevant theoretical perspectives.",
    ],
    format_description:
      "Advanced analysis, creative project planning, critique writing.",
    examples: [
      "Analyze how contrast and perspective shape meaning in the artwork.",
      "Develop a concept outline for a small exhibition and justify your choices.",
      "Critique a performance using one chosen art-theory framework.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 3",
    subject:
      "Arts, Humanities, and Social Sciences - Humanities (Languages and Literature, History, Philosophy)",
    learning_objectives: [
      "Students can interpret complex texts using multiple theoretical frameworks.",
      "Students can compare historical or philosophical arguments across periods.",
      "Students can produce well-structured analytical essays with proper academic referencing.",
    ],
    format_description:
      "Comparative analysis, argument evaluation, multi-source writing.",
    examples: [
      "Compare how two authors explore the concept of justice.",
      "Evaluate the philosophical reasoning used in the selected text.",
      "Write an analysis that integrates at least three scholarly sources.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 3",
    subject: "Arts, Humanities, and Social Sciences - Social Sciences",
    learning_objectives: [
      "Students can apply mid-level social science theories to real-world cases.",
      "Students can interpret empirical data sets and explain patterns.",
      "Students can evaluate how social, political, or economic structures influence behavior.",
    ],
    format_description:
      "Case-based analysis, empirical interpretation, theory–practice application.",
    examples: [
      "Apply a sociological theory to explain the behavior described in the case.",
      "Interpret the dataset: identify two factors that may influence the trend.",
      "Explain how political institutions shape policy outcomes in the example.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 3",
    subject: "Arts, Humanities, and Social Sciences - Media and Communication",
    learning_objectives: [
      "Students can analyze media messages using established communication theories.",
      "Students can evaluate ethical issues in media production and distribution.",
      "Students can compare media strategies across platforms and contexts.",
    ],
    format_description:
      "Theory application, media comparison, ethics evaluation.",
    examples: [
      "Use a communication theory to analyze this news segment.",
      "Identify an ethical dilemma in the advertisement and explain why it matters.",
      "Compare message strategies used on two different media platforms.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 3",
    subject: "STEM and Technology - Engineering",
    learning_objectives: [
      "Students can apply engineering principles to analyze moderately complex systems.",
      "Students can evaluate design alternatives using technical and economic criteria.",
      "Students can interpret engineering data to diagnose system performance.",
    ],
    format_description:
      "System calculations, engineering-economy evaluation, diagnostic tasks.",
    examples: [
      "Analyze the load distribution in the given structure.",
      "Which design alternative is optimal based on the provided criteria?",
      "Interpret the sensor data to identify a possible malfunction.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 3",
    subject: "STEM and Technology - ICT",
    learning_objectives: [
      "Students can design software solutions using object-oriented principles.",
      "Students can evaluate system performance using profiling and testing strategies.",
      "Students can explain architecture trade-offs in small-to-medium systems.",
    ],
    format_description:
      "Software design tasks, performance evaluation, architecture reasoning.",
    examples: [
      "Design a class diagram for the system described.",
      "Profile the given code and identify two performance bottlenecks.",
      "Explain the trade-offs between a monolithic and microservices architecture.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 3",
    subject: "STEM and Technology - Natural Sciences",
    learning_objectives: [
      "Students can solve quantitative scientific problems using established methods.",
      "Students can evaluate experimental results and interpret sources of error.",
      "Students can apply scientific models to mid-level real-world scenarios.",
    ],
    format_description:
      "Quantitative problem-solving, experiment evaluation, model application.",
    examples: [
      "Calculate the expected reaction rate given the temperature data.",
      "Evaluate two possible sources of error in the experiment.",
      "Apply a physical model to predict system behavior.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 3",
    subject: "Health and Welfare - Healthcare, Nursing, Medical-related fields",
    learning_objectives: [
      "Students can assess patient conditions using structured clinical methods.",
      "Students can justify selected interventions using evidence-based reasoning.",
      "Students can analyze patient cases with multiple interacting symptoms.",
    ],
    format_description:
      "Clinical scenario interpretation, intervention justification, case reasoning.",
    examples: [
      "Assess the patient's symptoms and propose an initial intervention.",
      "Explain why your chosen intervention aligns with evidence-based guidelines.",
      "Identify two possible complications based on the case information.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 3",
    subject: "Health and Welfare - Psychology",
    learning_objectives: [
      "Students can compare psychological theories using empirical evidence.",
      "Students can analyze case studies with multiple psychological variables.",
      "Students can interpret data from psychological experiments using basic statistics.",
    ],
    format_description:
      "Advanced case analysis, theory comparison, data interpretation.",
    examples: [
      "Which psychological model best explains the client’s symptoms?",
      "Interpret the experiment data: what conclusion is supported?",
      "Compare two theoretical explanations for the behavior observed.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 3",
    subject: "Business and Management",
    learning_objectives: [
      "Students can analyze business or economic problems using formal models.",
      "Students can interpret complex financial indicators.",
      "Students can evaluate strategic options for organizational decision-making.",
    ],
    format_description:
      "Financial interpretation, strategic reasoning, model-based analysis.",
    examples: [
      "Analyze the firm’s profitability using the given indicators.",
      "Evaluate two strategic alternatives and justify which is preferable.",
      "Interpret the economic model: what does it predict about market behavior?",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 3",
    subject: "Agriculture, Forestry, Fisheries and Veterinary",
    learning_objectives: [
      "Students can evaluate ecological and production-related trade-offs.",
      "Students can interpret agricultural or marine datasets.",
      "Students can analyze environmental impacts of production systems.",
    ],
    format_description:
      "Data interpretation, ecological impact analysis, trade-off evaluation.",
    examples: [
      "Interpret the crop yield dataset and identify possible limiting factors.",
      "Explain one environmental consequence of the described fishing method.",
      "Evaluate the trade-offs between two production systems.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 3",
    subject: "Education - Teaching and Educational Studies",
    learning_objectives: [
      "Students can evaluate instructional practices using educational theory.",
      "Students can analyze learning processes in classroom scenarios.",
      "Students can design small-scale teaching activities with clear outcomes.",
    ],
    format_description:
      "Classroom analysis, mini-lesson design, theory evaluation.",
    examples: [
      "Evaluate the teacher’s strategy using a learning-theory framework.",
      "Identify two learning barriers in the scenario.",
      "Design a short learning activity with a measurable outcome.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 3",
    subject: "Services - Tourism, Sales, Service-related courses",
    learning_objectives: [
      "Students can analyze tourism and service environments using models.",
      "Students can evaluate service quality and its economic impacts.",
      "Students can propose improvements based on customer insights.",
    ],
    format_description:
      "Service-quality analysis, tourism-model application, improvement proposals.",
    examples: [
      "Analyze the service interaction using a recognized service model.",
      "Explain how seasonal variation influences tourism demand.",
      "Propose one improvement and justify its expected impact.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 3",
    subject: "Maritime Studies",
    learning_objectives: [
      "Students can analyze vessel operations using engineering and safety concepts.",
      "Students can evaluate navigation and risk scenarios.",
      "Students can interpret operational data to support maritime decisions.",
    ],
    format_description:
      "Risk assessment, navigation tasks, performance analysis.",
    examples: [
      "Evaluate the risk scenario and identify two operational hazards.",
      "Interpret the navigation chart to propose a safe route.",
      "Analyze the fuel efficiency data and explain the deviation.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 3",
    subject: "General Studies",
    learning_objectives: [
      "Students can synthesize ideas from multiple disciplines to evaluate complex issues.",
      "Students can identify assumptions and limitations in academic arguments.",
      "Students can produce well-structured academic analyses.",
    ],
    format_description:
      "Cross-disciplinary synthesis, argument critique, analytical writing.",
    examples: [
      "Identify limitations in the author’s reasoning.",
      "Compare two disciplinary perspectives on the issue.",
      "Write a structured analysis integrating three academic sources.",
    ],
  },

  /* ==========================
     ========   HIgher Education Year 4   =========
     ========================== */
  {
    education_level: "higher-education",
    year: "Year 4",
    subject: "Arts, Humanities, and Social Sciences - Arts",
    learning_objectives: [
      "Students can apply advanced theoretical frameworks to analyze complex artistic works.",
      "Students can plan, execute, and document larger creative or design projects.",
      "Students can critically evaluate artistic processes and justify methodological choices.",
    ],
    format_description:
      "Advanced theoretical analysis, project planning, reflective critique.",
    examples: [
      "Apply an art-theory lens to analyze the composition and symbolism of the chosen work.",
      "Draft a project plan specifying materials, timeline, and artistic intention.",
      "Evaluate how the artistic process influenced the final outcome.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 4",
    subject: "Arts, Humanities, and Social Sciences - Humanities",
    learning_objectives: [
      "Students can analyze complex texts by integrating multiple theoretical perspectives.",
      "Students can compare philosophical or historical arguments with scholarly depth.",
      "Students can produce academic essays with strong critical and interpretive skills.",
    ],
    format_description:
      "Multi-theory text analysis, comparative argumentation, source-based writing.",
    examples: [
      "Analyze how the text explores ethical tension using two theoretical approaches.",
      "Compare arguments from two philosophical traditions on the same issue.",
      "Write a structured essay synthesizing at least four academic sources.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 4",
    subject: "Arts, Humanities, and Social Sciences - Social Sciences",
    learning_objectives: [
      "Students can apply mid-to-advanced theories to analyze real-world social problems.",
      "Students can evaluate empirical data and methodological approaches.",
      "Students can link theoretical models with complex societal outcomes.",
    ],
    format_description:
      "Theory application, critical data evaluation, cause–effect analysis.",
    examples: [
      "Use a recognized social theory to explain the phenomenon described.",
      "Evaluate the strengths and limitations of the dataset.",
      "Explain how two structural factors interact to shape the outcome.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 4",
    subject: "Arts, Humanities, and Social Sciences - Media and Communication",
    learning_objectives: [
      "Students can evaluate media messages using advanced communication theory.",
      "Students can assess ethical and societal consequences of media choices.",
      "Students can design communication strategies for specific audiences.",
    ],
    format_description:
      "In-depth media analysis, ethics evaluation, strategy design.",
    examples: [
      "Analyze the communication strategy used in the political campaign.",
      "Identify an ethical issue in a media production and evaluate its implications.",
      "Design a targeted message for a specific audience using communication theory.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 4",
    subject: "STEM and Technology - Engineering",
    learning_objectives: [
      "Students can model and analyze engineering systems using advanced methods.",
      "Students can evaluate design alternatives with respect to safety, efficiency, and cost.",
      "Students can interpret complex engineering data to support decisions.",
    ],
    format_description:
      "System modeling, engineering-economics evaluation, technical analysis.",
    examples: [
      "Model the system using an appropriate mathematical formulation.",
      "Compare two design options and justify which is optimal.",
      "Interpret the structural analysis data and assess potential risks.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 4",
    subject: "STEM and Technology - ICT",
    learning_objectives: [
      "Students can design modular systems using advanced software architecture patterns.",
      "Students can evaluate system performance using profiling and optimization techniques.",
      "Students can justify technological choices based on scalability and maintainability.",
    ],
    format_description:
      "Architecture design, performance evaluation, system trade-off analysis.",
    examples: [
      "Design a modular architecture for a scalable application.",
      "Evaluate the performance of the system and identify two optimization steps.",
      "Compare two technologies and justify your choice for long-term scalability.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 4",
    subject: "STEM and Technology - Natural Sciences",
    learning_objectives: [
      "Students can apply advanced scientific models to explain complex natural systems.",
      "Students can evaluate experimental design including variables and error sources.",
      "Students can analyze scientific datasets using quantitative reasoning.",
    ],
    format_description:
      "Dataset analysis, model-based reasoning, experiment evaluation.",
    examples: [
      "Use a scientific model to predict the system’s behavior under new conditions.",
      "Evaluate the validity of the experiment design.",
      "Analyze the dataset and explain one significant trend.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 4",
    subject: "Health and Welfare - Healthcare, Nursing, Medical-related fields",
    learning_objectives: [
      "Students can conduct advanced clinical assessments using established protocols.",
      "Students can evaluate treatment options using evidence-based reasoning.",
      "Students can analyze complex patient situations involving comorbidities.",
    ],
    format_description:
      "Clinical reasoning, intervention evaluation, case-based assessment.",
    examples: [
      "Assess the patient's condition using a structured assessment tool.",
      "Evaluate which intervention is most appropriate based on evidence.",
      "Analyze how two interacting symptoms affect the treatment plan.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 4",
    subject: "Health and Welfare - Psychology",
    learning_objectives: [
      "Students can evaluate psychological theories using empirical evidence.",
      "Students can analyze multi-layered clinical or behavioral cases.",
      "Students can interpret statistical findings from scientific studies.",
    ],
    format_description:
      "Theory evaluation, layered case analysis, data interpretation tasks.",
    examples: [
      "Evaluate competing theoretical explanations for the behavior described.",
      "Analyze the case and identify at least three interacting psychological factors.",
      "Interpret the statistical results: What conclusion is supported?",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 4",
    subject: "Business and Management",
    learning_objectives: [
      "Students can evaluate organizational problems using advanced analytical tools.",
      "Students can analyze financial data to support strategic decisions.",
      "Students can apply strategic frameworks to real-world business scenarios.",
    ],
    format_description:
      "Strategic analysis, financial evaluation, model application.",
    examples: [
      "Use a strategic framework to analyze the company’s position.",
      "Interpret the financial indicators and propose one strategic action.",
      "Evaluate two competing business strategies in the scenario.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 4",
    subject: "Agriculture, Forestry, Fisheries and Veterinary",
    learning_objectives: [
      "Students can evaluate environmental and production trade-offs using ecological models.",
      "Students can interpret complex datasets relating to resource use.",
      "Students can assess sustainability strategies for agricultural or marine systems.",
    ],
    format_description:
      "Ecological impact analysis, model-based evaluation, sustainability assessment.",
    examples: [
      "Interpret the environmental data and identify a risk factor.",
      "Compare two sustainability approaches and evaluate which is more feasible.",
      "Use an ecological model to explain a system-level interaction.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 4",
    subject: "Education - Teaching and Educational Studies",
    learning_objectives: [
      "Students can analyze teaching methods using multiple pedagogical theories.",
      "Students can design learning activities with measurable learning outcomes.",
      "Students can evaluate instructional quality using observation criteria.",
    ],
    format_description:
      "Lesson design, instructional analysis, pedagogical evaluation.",
    examples: [
      "Analyze the teaching method using two pedagogical frameworks.",
      "Design a learning activity with clear, measurable learning goals.",
      "Evaluate instructional quality in the scenario using set criteria.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 4",
    subject: "Services - Tourism, Sales, Service-related courses",
    learning_objectives: [
      "Students can apply economic and behavioral models to evaluate tourism and service systems.",
      "Students can analyze customer behavior using service-design insights.",
      "Students can propose improvements based on data and market analysis.",
    ],
    format_description:
      "Service-design analysis, market evaluation, model application.",
    examples: [
      "Analyze customer behavior in the scenario using a service-design framework.",
      "Interpret the tourism demand data and identify a seasonal pattern.",
      "Propose an improvement to the service system and justify it.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 4",
    subject: "Maritime Studies",
    learning_objectives: [
      "Students can evaluate vessel operations using advanced navigation and engineering concepts.",
      "Students can conduct structured risk assessments for maritime scenarios.",
      "Students can interpret multi-variable operational datasets.",
    ],
    format_description:
      "Risk analysis, navigation evaluation, data interpretation.",
    examples: [
      "Conduct a risk analysis based on the operational scenario.",
      "Evaluate the vessel’s navigation plan and propose a safer alternative.",
      "Interpret the dataset and explain one operational concern.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 4",
    subject: "General Studies",
    learning_objectives: [
      "Students can synthesize multidisciplinary perspectives to evaluate complex issues.",
      "Students can critique arguments and identify methodological limitations.",
      "Students can produce advanced academic analyses supported by evidence.",
    ],
    format_description:
      "Cross-disciplinary synthesis, argument critique, advanced analytical writing.",
    examples: [
      "Identify methodological limitations in the author’s study.",
      "Compare how two disciplines interpret the same issue.",
      "Write an analysis integrating at least four sources.",
    ],
  },

  /* ==========================
     ========   HIgher Education Year 5   =========
     ========================== */
  {
    education_level: "higher-education",
    year: "Year 5",
    subject: "Arts, Humanities, and Social Sciences - Arts",
    learning_objectives: [
      "Students can apply complex theoretical constructs to analyze sophisticated artistic expressions.",
      "Students can plan and execute advanced creative or design projects with clear artistic rationale.",
      "Students can critically evaluate artistic works using scholarly and practice-based criteria.",
    ],
    format_description:
      "Advanced theoretical analysis, creative project documentation, scholarly critique.",
    examples: [
      "Analyze the artwork using two advanced theoretical lenses (e.g., post-structuralism, semiotics).",
      "Develop a comprehensive plan for an advanced creative project including method, medium, and artistic goals.",
      "Write a critical review evaluating how technique and concept interact in a chosen work.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 5",
    subject: "Arts, Humanities, and Social Sciences - Humanities",
    learning_objectives: [
      "Students can conduct deep comparative analysis of complex texts across historical or philosophical traditions.",
      "Students can synthesize concepts from multiple theoretical frameworks.",
      "Students can produce extended analytical essays at a pre-thesis level.",
    ],
    format_description:
      "Advanced comparative writing, multi-theory synthesis, long-form academic analysis.",
    examples: [
      "Compare how two philosophical traditions address human agency.",
      "Synthesize three theoretical perspectives to analyze the text.",
      "Write a 1500-word analytical essay with at least five scholarly sources.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 5",
    subject: "Arts, Humanities, and Social Sciences - Social Sciences",
    learning_objectives: [
      "Students can apply advanced theoretical models to analyze complex societal systems.",
      "Students can evaluate empirical findings using methodological rigor.",
      "Students can critique policy proposals using disciplinary perspectives.",
    ],
    format_description:
      "Policy analysis, empirical evaluation, theory-driven case analysis.",
    examples: [
      "Apply an advanced social science model to explain the phenomenon.",
      "Critically evaluate the dataset’s methodological strengths and weaknesses.",
      "Assess the policy proposal using theoretical and empirical arguments.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 5",
    subject: "Arts, Humanities, and Social Sciences - Media and Communication",
    learning_objectives: [
      "Students can apply advanced communication theories to complex media environments.",
      "Students can evaluate media systems considering ethics, power, and societal effects.",
      "Students can design advanced communication strategies for specific target groups.",
    ],
    format_description:
      "Strategic communication design, media ethics evaluation, complex analysis tasks.",
    examples: [
      "Analyze a political communication strategy using an advanced theory such as framing or agenda-setting.",
      "Evaluate an ethical dilemma in media production involving conflicting stakeholder interests.",
      "Design a communication strategy for a specific demographic group and justify its structure.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 5",
    subject: "STEM and Technology - Engineering",
    learning_objectives: [
      "Students can model and evaluate engineering systems using advanced computational or analytical methods.",
      "Students can justify engineering decisions based on safety, efficiency, environmental, and economic criteria.",
      "Students can conduct pre-project assessments for complex engineering solutions.",
    ],
    format_description:
      "System modeling, engineering justification, technical feasibility analysis.",
    examples: [
      "Model the engineering system using an advanced analytical or simulation method.",
      "Evaluate design alternatives using a multi-criteria decision matrix.",
      "Conduct a pre-project assessment identifying key technical and environmental risks.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 5",
    subject: "STEM and Technology - ICT",
    learning_objectives: [
      "Students can evaluate and design complex software architectures for scalability and security.",
      "Students can optimize system performance using advanced profiling techniques.",
      "Students can apply theoretical foundations to justify architecture and technology choices.",
    ],
    format_description:
      "Architecture evaluation, system optimization, justification of technological decisions.",
    examples: [
      "Evaluate the microservices architecture using reliability and scaling criteria.",
      "Profile the subsystem and propose two advanced optimization techniques.",
      "Justify the technology stack choice using theoretical and practical arguments.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 5",
    subject: "STEM and Technology - Natural Sciences",
    learning_objectives: [
      "Students can apply advanced scientific models to analyze multi-variable systems.",
      "Students can design and evaluate experiments with controlled variables and error modeling.",
      "Students can interpret scientific datasets using advanced statistical reasoning.",
    ],
    format_description:
      "Complex data interpretation, experiment design, model-based reasoning.",
    examples: [
      "Use an advanced model to predict the behavior of the system under new conditions.",
      "Design an experiment that controls for confounding variables.",
      "Interpret the dataset and identify at least one statistically significant relationship.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 5",
    subject: "Health and Welfare - Healthcare, Nursing, Medical-related fields",
    learning_objectives: [
      "Students can conduct advanced assessments requiring integration of physiological and psychological factors.",
      "Students can evaluate interventions using evidence-based frameworks and clinical guidelines.",
      "Students can analyze complex patient cases involving multiple overlapping conditions.",
    ],
    format_description:
      "Advanced case analysis, intervention evaluation, clinical synthesis.",
    examples: [
      "Analyze the patient case and identify three interacting factors affecting care decisions.",
      "Evaluate two possible interventions using clinical evidence.",
      "Explain how comorbidities influence the recommended treatment plan.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 5",
    subject: "Health and Welfare - Psychology",
    learning_objectives: [
      "Students can integrate multiple psychological theories to analyze complex behavior.",
      "Students can evaluate empirical studies using advanced statistical concepts.",
      "Students can critique psychological interventions using evidence-based reasoning.",
    ],
    format_description:
      "Multi-theory analysis, statistical interpretation, intervention evaluation.",
    examples: [
      "Analyze the behavior described using two theoretical frameworks.",
      "Interpret the study’s statistics: what does the p-value indicate?",
      "Evaluate the intervention’s effectiveness based on the evidence provided.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 5",
    subject: "Business and Management",
    learning_objectives: [
      "Students can evaluate complex business environments using strategic analysis tools.",
      "Students can interpret broad financial datasets for long-term planning.",
      "Students can propose strategic recommendations grounded in theoretical and empirical evidence.",
    ],
    format_description:
      "Strategic evaluation, financial interpretation, long-term decision-making.",
    examples: [
      "Conduct a strategic analysis using two frameworks (e.g., SWOT, PESTEL).",
      "Interpret the long-term financial trend and identify risks.",
      "Recommend a strategy and justify it based on theory and evidence.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 5",
    subject: "Agriculture, Forestry, Fisheries and Veterinary",
    learning_objectives: [
      "Students can evaluate sustainability strategies using ecological and economic models.",
      "Students can assess environmental and production risks for complex systems.",
      "Students can analyze multi-factor datasets in agricultural or marine contexts.",
    ],
    format_description:
      "Advanced sustainability analysis, risk assessment, dataset interpretation.",
    examples: [
      "Interpret the environmental dataset and identify key sustainability risks.",
      "Evaluate two farming or fishery strategies using an ecological-economy model.",
      "Assess how multiple variables interact to affect system performance.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 5",
    subject: "Education - Teaching and Educational Studies",
    learning_objectives: [
      "Students can evaluate instructional designs using advanced pedagogical theories.",
      "Students can design comprehensive teaching modules with assessment plans.",
      "Students can critique classroom interactions using structured observation frameworks.",
    ],
    format_description:
      "Module design, advanced theory application, classroom interaction analysis.",
    examples: [
      "Analyze the instructional method using two advanced pedagogical models.",
      "Design a teaching module including objectives, activities, and assessments.",
      "Evaluate the classroom interaction and identify two improvement areas.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 5",
    subject: "Services - Tourism, Sales, Service-related courses",
    learning_objectives: [
      "Students can evaluate service systems using economic and behavioral models.",
      "Students can analyze tourism trends using multi-year datasets.",
      "Students can design service improvements supported by evidence.",
    ],
    format_description:
      "Trend analysis, system evaluation, evidence-based improvement design.",
    examples: [
      "Interpret the tourism dataset and identify long-term trends.",
      "Evaluate the service system using a recognized evaluation framework.",
      "Propose an improvement and justify it using data.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 5",
    subject: "Maritime Studies",
    learning_objectives: [
      "Students can evaluate vessel operations using advanced risk and performance models.",
      "Students can analyze complex maritime navigation and safety scenarios.",
      "Students can interpret multi-factor operational data for decision-making.",
    ],
    format_description:
      "Risk modeling, navigation analysis, operational dataset interpretation.",
    examples: [
      "Conduct an advanced risk assessment using the given scenario.",
      "Evaluate the navigation route and propose adjustments.",
      "Interpret the multi-factor dataset and identify operational inefficiencies.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Year 5",
    subject: "General Studies",
    learning_objectives: [
      "Students can synthesize interdisciplinary knowledge to evaluate complex, real-world problems.",
      "Students can critique scholarly arguments with attention to assumptions and limitations.",
      "Students can write extended analytical texts using advanced academic conventions.",
    ],
    format_description:
      "Cross-disciplinary analysis, argument critique, extended essay writing.",
    examples: [
      "Identify underlying assumptions in the scholarly argument.",
      "Synthesize two disciplinary perspectives to analyze the issue.",
      "Write a structured analysis integrating multiple academic sources.",
    ],
  },

  /* ==========================
     ========   HIgher Education Year 6   =========
     ========================== */
  {
    education_level: "higher-education",
    year: "Master's",
    subject: "Arts, Humanities, and Social Sciences - Arts",
    learning_objectives: [
      "Students can apply advanced critical and theoretical models to analyze artistic expressions with scholarly depth.",
      "Students can design and execute a complex creative project integrating concept, method, and context.",
      "Students can produce rigorous critiques supported by academic research and artistic methodology.",
    ],
    format_description:
      "Theoretical analysis, advanced project planning, scholarly critique writing.",
    examples: [
      "Apply two advanced theoretical frameworks (e.g., postmodernism, phenomenology) to analyze the chosen artwork.",
      "Develop a full project proposal including concept, theory, method, and expected outcomes.",
      "Write a scholarly critique comparing the artistic strategies of two creators.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Master's",
    subject: "Arts, Humanities, and Social Sciences - Humanities",
    learning_objectives: [
      "Students can synthesize multiple theoretical perspectives to interpret complex texts.",
      "Students can construct sophisticated comparative arguments across historical or philosophical traditions.",
      "Students can produce academic writing that adheres to graduate-level standards of rigor and referencing.",
    ],
    format_description:
      "Advanced textual exegesis, comparative theoretical writing, structured academic essays.",
    examples: [
      "Analyze how two philosophical traditions conceptualize moral agency.",
      "Compare the treatment of identity in two complex literary works.",
      "Write a literature-based analysis integrating at least six peer-reviewed sources.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Master's",
    subject: "Arts, Humanities, and Social Sciences - Social Sciences",
    learning_objectives: [
      "Students can apply advanced social science theories to analyze multi-dimensional societal issues.",
      "Students can evaluate empirical studies with attention to methodology, validity, and bias.",
      "Students can design small-scale research studies using appropriate methods.",
    ],
    format_description:
      "Theory-driven analysis, methodological evaluation, research design tasks.",
    examples: [
      "Apply a complex theory (e.g., structuration, rational choice) to analyze the case.",
      "Critically evaluate the methodology of the provided empirical article.",
      "Design a small research study including research question, method, and sampling.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Master's",
    subject: "Arts, Humanities, and Social Sciences - Media and Communication",
    learning_objectives: [
      "Students can evaluate media systems using advanced communication theories.",
      "Students can analyze ethical tensions in digital media environments.",
      "Students can design research-informed media strategies for targeted communication.",
    ],
    format_description:
      "Advanced media analysis, ethical reasoning tasks, research-based strategy design.",
    examples: [
      "Use an advanced theory (e.g., agenda-setting, critical media theory) to evaluate the media system.",
      "Analyze an ethical dilemma related to digital surveillance or content moderation.",
      "Design a communication strategy supported by research evidence.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Master's",
    subject: "STEM and Technology - Engineering",
    learning_objectives: [
      "Students can model, evaluate, and optimize complex engineering systems.",
      "Students can apply advanced engineering methods supported by empirical or computational analysis.",
      "Students can justify engineering decisions using interdisciplinary reasoning.",
    ],
    format_description:
      "Complex system modeling, technical analysis, evidence-based justification.",
    examples: [
      "Model the engineering system using advanced computational tools and interpret the results.",
      "Evaluate two design alternatives using engineering, economic, and environmental criteria.",
      "Explain and justify the chosen engineering method based on theory and evidence.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Master's",
    subject: "STEM and Technology - ICT",
    learning_objectives: [
      "Students can design scalable system architectures using advanced patterns.",
      "Students can evaluate performance, security, and reliability using empirical methods.",
      "Students can justify technological decisions using theoretical principles and applied evidence.",
    ],
    format_description:
      "Architecture design, empirical evaluation, design rationale tasks.",
    examples: [
      "Design a scalable architecture for a distributed system and justify your choices.",
      "Evaluate the system’s performance using profiling data and propose two optimizations.",
      "Compare two security models and argue which is more appropriate for the application.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Master's",
    subject: "STEM and Technology - Natural Sciences",
    learning_objectives: [
      "Students can apply advanced theoretical and mathematical models to explain natural phenomena.",
      "Students can evaluate complex experiments with attention to reliability and validity.",
      "Students can interpret multi-variable datasets and draw scientifically sound conclusions.",
    ],
    format_description:
      "Theoretical modeling, experiment evaluation, advanced data interpretation.",
    examples: [
      "Use an advanced mathematical model to predict behavior under altered conditions.",
      "Evaluate the experimental design and identify limitations and confounding variables.",
      "Interpret the dataset using appropriate statistical methods.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Master's",
    subject: "Health and Welfare - Healthcare, Nursing, Medical-related fields",
    learning_objectives: [
      "Students can perform comprehensive assessments integrating physiological, psychological, and social dimensions.",
      "Students can evaluate complex clinical interventions using evidence from multiple sources.",
      "Students can apply advanced clinical reasoning to multi-diagnosis scenarios.",
    ],
    format_description:
      "Complex clinical case evaluation, intervention justification, integrated assessment.",
    examples: [
      "Analyze the patient case integrating physical, psychological, and social factors.",
      "Evaluate two possible interventions using evidence-based guidelines.",
      "Develop a care plan addressing multiple interacting conditions.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Master's",
    subject: "Health and Welfare - Psychology",
    learning_objectives: [
      "Students can analyze clinical or behavioral cases using multiple theoretical frameworks.",
      "Students can evaluate psychological research with methodological sophistication.",
      "Students can design intervention proposals supported by evidence.",
    ],
    format_description:
      "Advanced case analysis, research critique, intervention design.",
    examples: [
      "Interpret the client’s symptoms using two psychological models.",
      "Critically evaluate the research article’s methodology and statistical analysis.",
      "Design an evidence-based intervention for the behavioral issue described.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Master's",
    subject: "Business and Management",
    learning_objectives: [
      "Students can evaluate complex organizational strategies using advanced analytical tools.",
      "Students can analyze financial data to support strategic decisions in uncertain environments.",
      "Students can propose research-informed strategic recommendations.",
    ],
    format_description:
      "Strategic evaluation, financial analysis, research-based decision-making.",
    examples: [
      "Conduct a strategic evaluation using two advanced frameworks (e.g., RBV, Porter).",
      "Interpret the financial dataset to identify long-term risks.",
      "Develop a research-grounded strategic recommendation for the company.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Master's",
    subject: "Agriculture, Forestry, Fisheries and Veterinary",
    learning_objectives: [
      "Students can evaluate ecological, economic, and sustainability trade-offs at a systems level.",
      "Students can interpret complex agricultural or marine datasets using scientific reasoning.",
      "Students can design sustainable resource-use strategies grounded in research.",
    ],
    format_description:
      "Sustainability analysis, dataset interpretation, system-level strategy design.",
    examples: [
      "Evaluate two farming or fishery strategies using system-level sustainability criteria.",
      "Interpret the multi-year dataset and identify significant ecological trends.",
      "Propose a sustainable management plan supported by scientific evidence.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Master's",
    subject: "Education - Teaching and Educational Studies",
    learning_objectives: [
      "Students can evaluate teaching practices using advanced pedagogical models.",
      "Students can design full teaching units including assessment strategies and learning analytics.",
      "Students can critique educational interventions using research literature.",
    ],
    format_description:
      "Pedagogical evaluation, instructional design, research critique.",
    examples: [
      "Analyze the teaching method using two advanced pedagogical theories.",
      "Design a teaching unit with clear outcomes, activities, and assessment methods.",
      "Evaluate an educational intervention using three research sources.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Master's",
    subject: "Services - Tourism, Sales, Service-related courses",
    learning_objectives: [
      "Students can analyze tourism and service systems using economic, behavioral, and sustainability frameworks.",
      "Students can interpret large datasets to understand market trends.",
      "Students can propose advanced service innovations supported by empirical evidence.",
    ],
    format_description:
      "Market analysis, service innovation design, data-driven evaluation.",
    examples: [
      "Analyze how economic and cultural factors influence tourism demand.",
      "Interpret the multi-year tourism dataset and identify emerging patterns.",
      "Design a service innovation based on customer and market data.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Master's",
    subject: "Maritime Studies",
    learning_objectives: [
      "Students can analyze complex maritime operations using engineering, safety, and economic criteria.",
      "Students can evaluate risk in multi-factor navigation or operational scenarios.",
      "Students can propose improvements to vessel performance based on empirical data.",
    ],
    format_description:
      "Multi-factor risk analysis, operational evaluation, improvement proposals.",
    examples: [
      "Analyze the maritime scenario using advanced safety models.",
      "Interpret the vessel’s performance data and identify key operational risks.",
      "Propose improvements to the operation using empirical evidence.",
    ],
  },

  {
    education_level: "higher-education",
    year: "Master's",
    subject: "General Studies",
    learning_objectives: [
      "Students can synthesize multiple disciplinary perspectives to analyze complex societal issues.",
      "Students can critique research with attention to methodology, assumptions, and limitations.",
      "Students can produce graduate-level analytical texts supported by scholarly evidence.",
    ],
    format_description:
      "Interdisciplinary synthesis, advanced critique, research-based writing.",
    examples: [
      "Compare how two academic disciplines interpret the same societal problem.",
      "Identify methodological limitations in three provided research studies.",
      "Write an analysis integrating at least six scholarly sources.",
    ],
  },
  /* ==========================
     ========   HIgher Education Year 7   =========
     ========================== */
  {
    education_level: "higher-education",
    year: "PhD",
    subject: "Arts, Humanities, and Social Sciences - Arts",
    learning_objectives: [
      "Candidates can apply advanced and original theoretical perspectives to analyze artistic works.",
      "Candidates can design and execute independent artistic research projects contributing new insights.",
      "Candidates can critically evaluate artistic practices using research-level argumentation.",
    ],
    format_description:
      "Research-level critique, theoretical synthesis, original artistic research design.",
    examples: [
      "Apply two advanced theoretical models to produce an original interpretation of the artwork.",
      "Design a research-based artistic project addressing a gap in existing practice.",
      "Critically evaluate how methodological choices influence artistic outcomes.",
    ],
  },

  {
    education_level: "higher-education",
    year: "PhD",
    subject: "Arts, Humanities, and Social Sciences - Humanities",
    learning_objectives: [
      "Candidates can synthesize complex theoretical traditions to develop original interpretations.",
      "Candidates can critique scholarly arguments with methodological and philosophical precision.",
      "Candidates can produce publication-ready academic writing.",
    ],
    format_description:
      "Advanced theoretical synthesis, critique writing, publication-level analysis.",
    examples: [
      "Integrate concepts from three philosophical traditions to interpret the text.",
      "Critically evaluate a scholarly argument, identifying hidden assumptions and methodological flaws.",
      "Write a research-level analysis suitable for submission to a peer-reviewed journal.",
    ],
  },

  {
    education_level: "higher-education",
    year: "PhD",
    subject: "Arts, Humanities, and Social Sciences - Social Sciences",
    learning_objectives: [
      "Candidates can apply complex social science theories to generate new research questions.",
      "Candidates can evaluate empirical studies with advanced methodological scrutiny.",
      "Candidates can design independent research using rigorous qualitative or quantitative methods.",
    ],
    format_description:
      "Theory-driven critique, methodological analysis, research design.",
    examples: [
      "Develop an original research question using an advanced theoretical lens.",
      "Evaluate the methodological rigor of the empirical article at the level of validity, bias, and reliability.",
      "Design a full research study including sampling, instruments, and analysis plan.",
    ],
  },

  {
    education_level: "higher-education",
    year: "PhD",
    subject: "Arts, Humanities, and Social Sciences - Media and Communication",
    learning_objectives: [
      "Candidates can analyze media systems using complex and multi-layered theoretical models.",
      "Candidates can evaluate ethical, political, and societal implications of media practices.",
      "Candidates can develop original research contributions in communication studies.",
    ],
    format_description:
      "Research-level analysis, ethics and power critique, original research design.",
    examples: [
      "Apply a multi-theoretical framework to evaluate digital media infrastructures.",
      "Analyze an ethical dilemma in a media system considering power relations.",
      "Design a research study addressing an unresolved issue in communication theory.",
    ],
  },

  {
    education_level: "higher-education",
    year: "PhD",
    subject: "STEM and Technology - Engineering",
    learning_objectives: [
      "Candidates can model and analyze engineering systems using cutting-edge methods.",
      "Candidates can critique existing engineering solutions and propose research-based improvements.",
      "Candidates can design novel methodologies or system components based on research gaps.",
    ],
    format_description:
      "Advanced modeling, critical technical evaluation, original system design.",
    examples: [
      "Model a complex system using advanced simulation or analytical techniques and interpret outcomes.",
      "Identify limitations in an existing engineering solution and propose improvements.",
      "Design a novel component or method addressing a research gap.",
    ],
  },

  {
    education_level: "higher-education",
    year: "PhD",
    subject: "STEM and Technology - ICT",
    learning_objectives: [
      "Candidates can design and evaluate complex digital systems using state-of-the-art theoretical and empirical methods.",
      "Candidates can analyze performance, security, and reliability at research-level depth.",
      "Candidates can contribute original research to ICT or computer science domains.",
    ],
    format_description:
      "Research-level architecture analysis, empirical performance evaluation, original research tasks.",
    examples: [
      "Evaluate a distributed system architecture using advanced theoretical and empirical techniques.",
      "Analyze a security model and identify research gaps.",
      "Design an experiment to evaluate system scalability under variable load.",
    ],
  },

  {
    education_level: "higher-education",
    year: "PhD",
    subject: "STEM and Technology - Natural Sciences",
    learning_objectives: [
      "Candidates can develop and apply advanced scientific models to explain complex natural phenomena.",
      "Candidates can evaluate experimental research with high scientific precision.",
      "Candidates can produce original research grounded in rigorous methods.",
    ],
    format_description:
      "Theoretical modeling, research critique, advanced data analysis.",
    examples: [
      "Develop an advanced mathematical model to test a scientific hypothesis.",
      "Critique the methodological validity of an experimental study.",
      "Analyze a multi-variable dataset and produce a publication-ready interpretation.",
    ],
  },

  {
    education_level: "higher-education",
    year: "PhD",
    subject: "Health and Welfare - Healthcare, Nursing, Medical-related fields",
    learning_objectives: [
      "Candidates can evaluate complex patient systems using advanced interdisciplinary frameworks.",
      "Candidates can critique clinical research and propose improvements to practice.",
      "Candidates can design clinical or healthcare research with methodological rigor.",
    ],
    format_description:
      "Advanced case evaluation, research critique, clinical research design.",
    examples: [
      "Analyze a complex case integrating physiological, psychological, and social factors.",
      "Critically evaluate a clinical study’s methodology and findings.",
      "Design a clinical research protocol including methodology and ethical considerations.",
    ],
  },

  {
    education_level: "higher-education",
    year: "PhD",
    subject: "Health and Welfare - Psychology",
    learning_objectives: [
      "Candidates can integrate multiple psychological theories to develop new interpretations or models.",
      "Candidates can critique experimental designs and statistical analyses at research level.",
      "Candidates can design original psychological research with theoretical and empirical grounding.",
    ],
    format_description:
      "High-level theory integration, research critique, experimental design.",
    examples: [
      "Develop a theoretical contribution integrating two psychological frameworks.",
      "Evaluate the statistical methods used in an experiment and identify limitations.",
      "Design an original psychological study including hypotheses, method, and analysis.",
    ],
  },

  {
    education_level: "higher-education",
    year: "PhD",
    subject: "Business and Management",
    learning_objectives: [
      "Candidates can evaluate organizational, financial, and strategic phenomena using advanced research models.",
      "Candidates can critique foundational theories in management and propose new directions.",
      "Candidates can design research contributing new insights to business or economic disciplines.",
    ],
    format_description:
      "Advanced model critique, theoretical evaluation, original research design.",
    examples: [
      "Critically evaluate a foundational management theory and propose theoretical extensions.",
      "Analyze a multi-year financial dataset to identify strategic implications.",
      "Design a research study addressing a gap in organizational or economic literature.",
    ],
  },

  {
    education_level: "higher-education",
    year: "PhD",
    subject: "Agriculture, Forestry, Fisheries and Veterinary",
    learning_objectives: [
      "Candidates can evaluate ecological and production systems using advanced interdisciplinary models.",
      "Candidates can critique sustainability strategies based on empirical evidence.",
      "Candidates can design original research addressing environmental or production challenges.",
    ],
    format_description:
      "Advanced ecological modeling, sustainability critique, research design.",
    examples: [
      "Use an advanced ecological model to analyze an environmental system.",
      "Critique a sustainability strategy using empirical evidence and theoretical reasoning.",
      "Design a research project addressing a gap in agriculture or marine resource management.",
    ],
  },

  {
    education_level: "higher-education",
    year: "PhD",
    subject: "Education - Teaching and Educational Studies",
    learning_objectives: [
      "Candidates can evaluate educational systems and interventions using advanced pedagogical theories.",
      "Candidates can critique educational research with methodological precision.",
      "Candidates can design original educational studies or interventions.",
    ],
    format_description:
      "Intervention analysis, research critique, educational research design.",
    examples: [
      "Analyze an educational intervention using multiple theoretical models.",
      "Critique a research study’s methodology, sampling, and analysis.",
      "Design a research-based educational intervention targeting a specific learning outcome.",
    ],
  },

  {
    education_level: "higher-education",
    year: "PhD",
    subject: "Services - Tourism, Sales, Service-related courses",
    learning_objectives: [
      "Candidates can analyze tourism and service systems using advanced theoretical and empirical frameworks.",
      "Candidates can interpret large-scale datasets to produce new insights.",
      "Candidates can design original research contributing to tourism or service science.",
    ],
    format_description:
      "Large-scale data analysis, theoretical evaluation, research design.",
    examples: [
      "Analyze long-term tourism dynamics using advanced statistical or modeling approaches.",
      "Critically evaluate a tourism model and identify empirical limitations.",
      "Design a research study addressing a gap in service science.",
    ],
  },

  {
    education_level: "higher-education",
    year: "PhD",
    subject: "Maritime Studies",
    learning_objectives: [
      "Candidates can analyze maritime systems using advanced engineering and policy frameworks.",
      "Candidates can critique maritime safety and operational models.",
      "Candidates can design original maritime research addressing industry or policy challenges.",
    ],
    format_description:
      "System-level maritime analysis, model critique, research planning.",
    examples: [
      "Analyze a maritime operational system using multi-factor modeling.",
      "Critically evaluate a maritime safety model and identify theoretical limitations.",
      "Design a research project addressing a gap in maritime operations or policy.",
    ],
  },

  {
    education_level: "higher-education",
    year: "PhD",
    subject: "General Studies",
    learning_objectives: [
      "Candidates can integrate multiple disciplinary perspectives to produce new theoretical or empirical insights.",
      "Candidates can critique scholarly literature with research-level precision.",
      "Candidates can design and conduct independent research suitable for publication.",
    ],
    format_description:
      "Interdisciplinary synthesis, advanced theoretical critique, original research design.",
    examples: [
      "Develop a theoretical model integrating perspectives from at least two disciplines.",
      "Critique three academic articles identifying methodological and theoretical limitations.",
      "Design an independent research project with publication potential.",
    ],
  },
];

async function seed() {
  if (WORKSHEET_EXAMPLES.length === 0) {
    console.log(
      "⚠️  No worksheet examples found. Please add your JSON data to the WORKSHEET_EXAMPLES array.",
    );
    process.exit(0);
  }

  console.log(`Connecting to: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI, { dbName: "ai4edu_database" });

  console.log(`Seeding ${WORKSHEET_EXAMPLES.length} worksheet example(s)...`);

  for (const worksheet of WORKSHEET_EXAMPLES) {
    // Use title + userName as unique identifier for upsert
    const uniqueKey = { title: worksheet.title, userName: worksheet.userName };

    const update = {
      title: worksheet.title,
      content: worksheet.content,
      education_level: worksheet.educationLevel,
      year: worksheet.year,
      subject: worksheet.subjectArea,
      learning_objectives: worksheet.learningObjective,
      format_description: worksheet.formatDescription || "",
      examples: worksheet.examples || "",
      userName: worksheet.userName,
      createdAt: worksheet.createdAt || new Date(),
      updatedAt: worksheet.updatedAt || new Date(),
    };

    const res = await Worksheet.findOneAndUpdate(
      uniqueKey,
      { $set: update },
      { upsert: true, new: true },
    );
    console.log(
      `✓ Upserted worksheet: "${res.title}" (${res.educationLevel} - ${res.subjectArea})`,
    );
  }

  await mongoose.disconnect();
  console.log("✅ Seeding completed successfully.");
}

seed().catch(async (err) => {
  console.error("❌ Seeding failed:", err);
  try {
    await mongoose.disconnect();
  } catch (e) {
    console.error("Error disconnecting:", e);
  }
  process.exit(1);
});
