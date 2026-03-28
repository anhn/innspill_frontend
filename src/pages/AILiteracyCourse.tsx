import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Star, 
  Award, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  BookOpen,
  Zap,
  Target,
  FileText,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { getStoredRole, ROLE_ROUTES } from "@/constants/roles";
import API_ENDPOINTS from "@/config/api";

interface BadgeData {
  id: string;
  name: string;
  description: string;
  level: number;
  earned: boolean;
  earnedDate?: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Submodule {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  examples: Array<{
    type: "good" | "bad" | "tip" | "warning";
    title: string;
    content: string;
  }>;
}

interface TheoryModule {
  id: string;
  title: string;
  submodules: Submodule[];
}

type ExampleType = "good" | "bad" | "tip" | "warning";

interface Level {
  id: number;
  title: string;
  description: string;
  content: string[];
  theory: TheoryModule[];
  quiz: QuizQuestion[];
  badge: BadgeData;
}

const levels: Level[] = [
  {
    id: 1,
    title: "Grunnleggende KI-kompetanse",
    description: "Lær det grunnleggende om KI, hva teknologien kan gjøre, og de sentrale konseptene",
    content: [
      "Hva KI er, smal KI som støtteverktøy – ikke erstatning for faglig vurdering",
      "Grunnmekanismer: maskinlæring og generative modeller, styrker og begrensninger",
      "Hva KI kan/ikke kan i akademia, datakvalitet og skjevheter",
      "Hallusinasjoner, black-box-begrensninger, versjonsendringer og reproduksjon",
      "Regelverk: EU KI-forordningen, GDPR, opphavsrett og USNs Sikt KI-chat",
      "Prompt engineering: struktur, beste praksis og høyrisiko-prompt som må unngås"
    ],
    quiz: [
      {
        id: 1,
        question: "Hva er en KI-hallusinasjon?",
        options: [
          "Når KI nekter å svare",
          "Når KI gjetter plausibelt innhold som er feil eller oppdiktet",
          "Når KI bruker for lite data",
          "Når KI svarer for sakte"
        ],
        correctAnswer: 1,
        explanation: "Hallusinasjoner oppstår når KI produserer plausible, men feil eller oppdiktede påstander fordi den gjetter på sannsynlige formuleringer."
      },
      {
        id: 2,
        question: "Hvorfor må du dokumentere verktøy, versjon og prompt når du bruker KI?",
        options: [
          "For å øke token-kostnaden",
          "Fordi KI-svar kan variere mellom versjoner, og reproduksjon krever sporbarhet",
          "For å redusere modellens nøyaktighet",
          "For å skjule kildene"
        ],
        correctAnswer: 1,
        explanation: "Generative KI oppdateres fortløpende og kan gi ulike svar; dokumentasjon sikrer etterprøvbarhet."
      },
      {
        id: 3,
        question: "Hva bør aldri limes inn i eksterne KI-verktøy?",
        options: [
          "Egne notater",
          "Personopplysninger, kundedata eller konfidensiell informasjon",
          "Offentlige begrepsforklaringer",
          "Generelle faglige spørsmål"
        ],
        correctAnswer: 1,
        explanation: "GDPR og institusjonelle regler forbyr å dele identifiserbare eller konfidensielle data med eksterne KI-tjenester."
      },
      {
        id: 4,
        question: "Når er Sikt KI-chat anbefalt fremfor åpne KI-plattformer?",
        options: [
          "Når du vil ha mest mulig kreative svar",
          "Når tekst kan inneholde personopplysninger eller sensitive fag- og bedriftsdata",
          "Når du trenger raskest mulig svar",
          "Når du vil bruke engelske kilder"
        ],
        correctAnswer: 1,
        explanation: "Sikt KI-chat følger strengere sikkerhetskrav og er anbefalt der personopplysninger eller konfidensiell informasjon kan forekomme."
      },
      {
        id: 5,
        question: "Hva kjennetegner en god prompt for akademisk bruk?",
        options: [
          "Be KI lage kilder og tall om nødvendig",
          "Kort, uten kontekst, og ber om hele oppgaven",
          "Inneholder rolle, oppgave, kontekst, format/begrensninger og forbyr oppdiktede kilder",
          "Kun ja/nei-spørsmål"
        ],
        correctAnswer: 2,
        explanation: "En god prompt er spesifikk, gir rolle/kontekst, ber om ønsket format, setter begrensninger og forbyr oppdiktede kilder."
      },
      {
        id: 6,
        question: "Hvorfor er datakvalitet viktig for KI-svar?",
        options: [
          "KI korrigerer automatisk for skjevheter",
          "Skjeve eller utdaterte data gir skjeve og lite relevante svar",
          "Datakvalitet påvirker ikke generative modeller",
          "KI bruker alltid sanntidsdata"
        ],
        correctAnswer: 1,
        explanation: "KI arver mønstre fra treningsdata; ubalanserte eller utdaterte data gir skjeve eller irrelevante svar."
      },
      {
        id: 7,
        question: "Hva er en trygg måte å bruke KI i oppgaveskriving på?",
        options: [
          "La KI skrive hele svaret uten kilder",
          "Bruke KI til idéutvikling og struktur, deretter skrive og kvalitetssikre selv",
          "Be KI oppdikte referanser for å spare tid",
          "Kopiere KI-tekst direkte uten merking"
        ],
        correctAnswer: 1,
        explanation: "Bruk KI som støtte for idé og struktur, men skriv og kvalitetssikre selv, og dokumenter bruken."
      }
    ],
    theory: [
      {
        id: "module-1",
        title: "Grunnleggende KI-forståelse",
        submodules: [
          {
            id: "sub-1-1",
            title: "Hva KI er og hvordan den fungerer (ikke-teknisk)",
            content: "Kunstig intelligens (KI) er datasystemer som utfører oppgaver som krever menneskelig kognisjon, men de \"tenker\" ikke – de beregner statistiske mønstre og produserer sannsynlige svar. I universiteter brukes smal KI: svært god på én oppgave, uten bred forståelse. KI er et støtteverktøy, ikke en erstatning for faglig vurdering.",
            keywords: ["KI", "sannsynlige svar", "støtteverktøy", "smal KI"],
            examples: [
              {
                type: "good",
                title: "Exemple",
                content: "En student ber KI forklare SWOT. KI leverer tekst basert på mønstre, men forstår ikke strategi – foreleser må kvalitetssikre."
              },
              {
                type: "tip",
                title: "Exemple",
                content: "Bruk KI til støtte og idéutvikling, men behold faglig vurdering og kontroll."
              }
            ]
          },
          {
            id: "sub-1-2",
            title: "Grunnmekanismer: maskinlæring og generative modeller",
            content: "Maskinlæring lærer mønstre fra data for å predikere eller klassifisere. Generative modeller (som ChatGPT) lager tekst ved å beregne hva som sannsynligvis kommer neste. De har ikke sanntidsdata eller faktakontroll – studenter må validere mot faglige kilder.",
            keywords: ["maskinlæring", "generative modeller", "prediksjon", "validering"],
            examples: [
              {
                type: "good",
                title: "Example",
                content: "En modell kan forutsi hvilke kunder som churner, men tolker ikke norsk kultur uten at dataene dekker dette."
              }
            ]
          },
          {
            id: "sub-1-3",
            title: "Hva KI kan og ikke kan i akademiske sammenhenger",
            content: "KI er nyttig for idéutvikling, disposisjon og oppsummering, men sikrer ikke faglig korrekthet, kontekst eller metodikk. Den vurderer ikke oppgavekrav eller teori. Studenter må skille mellom tekst som høres riktig ut og reell fagforståelse.",
            keywords: ["begrensninger", "akademisk", "validering", "faglig forståelse"],
            examples: [
              {
                type: "bad",
                title: "Fallgruve",
                content: "KI foreslår målgrupper for et norsk markedscase, men vurderer ikke realismen eller regulatorisk kontekst."
              },
              {
                type: "tip",
                title: "Exemple",
                content: "Valider KI-forslag mot faglige kilder og norsk praksis før bruk."
              }
            ]
          },
          {
            id: "sub-1-4",
            title: "Datakvalitet, representativitet og skjevheter",
            content: "KI arver kvalitet og skjevheter fra treningsdata. Ubalanserte eller utdaterte data gir skjeve eller irrelevante svar. Dette påvirker alt fra markeds- til økonomivurderinger. KI er ikke nøytral eller universell sannhet.",
            keywords: ["datakvalitet", "skjevhet", "representativitet", "bias"],
            examples: [
              {
                type: "warning",
                title: "Exemple",
                content: "En modell trent mest på amerikanske data kan gi dårlige råd til norske SMB-er."
              }
            ]
          },
          {
            id: "sub-1-5",
            title: "Treningsdata vs. virkelighetsnære forhold",
            content: "KI-modeller oppdaterer ikke seg selv automatisk når lover eller marked endres. De er basert på statiske datasett og kan overse nye krav eller lokal kontekst. Kontroller alltid mot oppdaterte kilder.",
            keywords: ["statiske datasett", "oppdatering", "kontekst", "validering"],
            examples: [
              {
                type: "warning",
                title: "Exemple",
                content: "En modell kan beskrive bærekraftsrapportering uten å få med EUs CSRD-krav."
              }
            ]
          },
          {
            id: "sub-1-6",
            title: "Hallusinasjoner og feilkilder",
            content: "Hallusinasjoner er plausible, men feil eller oppdiktede svar. De oppstår fordi modellen gjetter tekst, ikke verifiserer fakta. Farlig i akademiske arbeider, særlig med kilder og tall.",
            keywords: ["hallusinasjon", "feilkilder", "fakta"],
            examples: [
              {
                type: "warning",
                title: "Exemple",
                content: "KI kan lage ikke-eksisterende referanser til «norske ESG-studier 2020–2024»."
              }
            ]
          },
          {
            id: "sub-1-7",
            title: "Forklarbarhet vs. black-box",
            content: "Nevrale nettverk gir ofte svar uten innsikt i hvorfor. Uegnet for vurderinger med store konsekvenser (f.eks. karaktersetting). Bruk KI som støtte, ikke erstatning for fagkompetanse.",
            keywords: ["forklarbarhet", "black-box", "vurdering"],
            examples: [
              {
                type: "tip",
                title: "Exemple",
                content: "Et KI-verktøy kan markere en student som «i risiko» uten forklaring; kan ikke brukes alene til beslutning."
              }
            ]
          },
          {
            id: "sub-1-8",
            title: "Versjonsendringer og manglende stabilitet",
            content: "Generative KI oppdateres fortløpende; samme prompt kan gi ulike svar. Dette utfordrer reproduksjon. Dokumenter verktøy, versjon og prompt-innstillinger.",
            keywords: ["versjonsendring", "reproduserbarhet", "dokumentasjon"],
            examples: [
              {
                type: "tip",
                title: "Exemple",
                content: "To studenter får ulike forslag til «sirkulære forretningsmodeller i Norge» fordi modellen er oppdatert mellom forespørslene."
              }
            ]
          }
        ]
      },
      {
        id: "module-2",
        title: "Regelverk og institusjonelle krav",
        submodules: [
          {
            id: "sub-2-1",
            title: "EUs KI-forordning: roller og risikokategorier",
            content: "Undervisere er deployere/distributører av KI når de åpner for KI-bruk i undervisning og vurdering. Ansvar: gjennomsiktighet, sikker datahåndtering og lovlig bruk. Gjelder særlig fag med persondata eller regulatorisk risiko.",
            keywords: ["EU KI-forordning", "distributør", "ansvar", "risiko"],
            examples: [
              {
                type: "tip",
                title: "Exemple",
                content: "En foreleser som tillater KI i obligatoriske oppgaver må sikre at studenter vet hvordan de dokumenterer bruken."
              }
            ]
          },
          {
            id: "sub-2-2",
            title: "GDPR-prinsipper for KI-bruk",
            content: "Unngå å legge inn personopplysninger, kundedata eller konfidensiell informasjon i eksterne KI-systemer. Oppgaver må planlegges slik at studenter ikke fristes til regelbrudd.",
            keywords: ["GDPR", "personopplysninger", "konfidensiell", "datahåndtering"],
            examples: [
              {
                type: "warning",
                title: "Exemple",
                content: "Et konsulentcase med interne tall kan ikke limes inn i ChatGPT for analyse."
              }
            ]
          },
          {
            id: "sub-2-3",
            title: "Opphavsrett, akademisk integritet og KI-generert tekst",
            content: "KI-tekst har uklar opphavsrett og kan ikke erstatte studentens faglige innsats. USN krever tydelig merking og egen seksjon for bruk av KI. KI kan brukes til språkvask, men studenten må bearbeide selv.",
            keywords: ["opphavsrett", "akademisk integritet", "merking", "KI-tekst"],
            examples: [
              {
                type: "good",
                title: "Exemple",
                content: "Studenten bruker KI til språkvask og beskriver bruken i «Bruk av kunstig intelligens»-avsnittet."
              }
            ]
          },
          {
            id: "sub-2-4",
            title: "USNs personvernregler og Sikt KI-chat",
            content: "USN forbyr innlegging av personopplysninger og sensitiv data i eksterne KI-verktøy. Sikt KI-chat anbefales for sektoren og følger strengere sikkerhetskrav. Bruk Sikt når tekst kan inneholde person- eller bedriftsopplysninger.",
            keywords: ["Sikt KI-chat", "personvern", "sensitiv data", "USN regler"],
            examples: [
              {
                type: "tip",
                title: "Exemple",
                content: "Refleksjonsnotater i HR/markedsføring bør skrives med støtte fra Sikt KI-chat, ikke åpne plattformer."
              }
            ]
          }
        ]
      },
      {
        id: "module-3",
        title: "Prompt engineering (grunnleggende)",
        submodules: [
          {
            id: "sub-3-1",
            title: "13. Struktur, strategier og beste praksis (prompt engineering)",
            content: "En god prompt inkluderer: rolle, oppgave, kontekst (faglig og norsk), format/begrensninger og kvalitetskrav (ikke finne opp kilder). Beste praksis: be om antakelser, avgrens svaret, og forby oppdiktede kilder. Høyrisiko-prompt må unngås (be om kilder/data, personopplysninger, hele oppgaven eller statistikk uten ekte datasett).",
            keywords: ["prompt engineering", "rolle", "kontekst", "begrensninger", "høyrisiko"],
            examples: [
              {
                type: "good",
                title: "God prompt",
                content: "“Opptrer som strategiforeleser ved USN. Oppsummer utfordringer for norske SMB-er i digital transformasjon. Bruk underoverskrifter, maks 250 ord, og marker påstander du er usikker på. Ikke finn opp kilder.”"
              },
              {
                type: "bad",
                title: "Høyrisiko-prompt",
                content: "“Lag 10 akademiske kilder om KI i markedsføring og legg ved DOI-er.” – ber KI finne opp kilder."
              }
            ]
          }
        ]
      }
    ],
    badge: {
      id: "foundational-ai",
      name: "Foundational AI Expert",
      description: "Mastered the basics of AI literacy",
      level: 1,
      earned: false
    }
  },
  {
    id: 2,
    title: "KI i undervisning, læring og vurdering",
    description: "Ansvarlig og effektiv bruk av KI i undervisning, læring og vurdering",
    content: [
      "Kritisk vurdering av KI-utdata: kvalitet, kontekst og hallusinasjoner",
      "Pedagogisk bruk av KI til undervisning, tilbakemelding og læringsstøtte – med faglig skjønn",
      "Etisk bevissthet: bias, personvern, desinformasjon og miljøbelastning",
      "Vurderingsdesign i KI-tid: KI-tillatt, KI-støttet, KI-restriktiv og dokumentasjon",
      "USN-spesifikke plikter: tillatt/forbudt bruk, åpenhet og fuskeregler",
      "Egenregulert læring, gruppearbeid og å unngå KI-avhengighet",
      "Konsekvenser ved misbruk og pedagogisk innovasjon med ansvar"
    ],
    quiz: [
      {
        id: 1,
        question: "Hva kjennetegner kritisk vurdering av KI-utdata?",
        options: [
          "Å stole på at god språkflyt betyr korrekt innhold",
          "Å undersøke fakta, kontekst og hallusinasjoner mot pålitelige kilder",
          "Å bruke KI-svar uten kildekontroll",
          "Å anta at KI har sanntidsdata"
        ],
        correctAnswer: 1,
        explanation: "Språklig kvalitet garanterer ikke riktighet; fakta og kontekst må verifiseres mot pålitelige kilder."
      },
      {
        id: 2,
        question: "Hva er en god praksis for pedagogisk KI-bruk?",
        options: [
          "La KI erstatte lærerens skjønn",
          "Bruke KI transparent som støtte, og tilpasse til faglig kontekst",
          "Skjule KI-bruk for studentene",
          "La KI produsere oppgaver uten menneskelig gjennomgang"
        ],
        correctAnswer: 1,
        explanation: "KI kan foreslå materiell, men må brukes åpent og kvalitetssikres med faglig skjønn."
      },
      {
        id: 3,
        question: "Hvilket etisk fokus er sentralt ved KI-bruk i HR/rekruttering?",
        options: [
          "Å ignorere bias så lenge prosessen er rask",
          "Å vurdere risiko for diskriminering og sikre rettferdighet",
          "Å bruke KI uten dokumentasjon",
          "Å dele personopplysninger for bedre treff"
        ],
        correctAnswer: 1,
        explanation: "Etisk bevissthet krever vurdering av bias og rettferdighet i beslutningsstøtte."
      },
      {
        id: 4,
        question: "Hvordan bør vurderingsoppgaver utformes i en KI-tid?",
        options: [
          "Be KI lager hele svaret",
          "Fokusere på høyere ordens ferdigheter og tydeliggjøre KI-rammer",
          "Kun multiple choice uten refleksjon",
          "Unngå dokumentasjon av KI-bruk"
        ],
        correctAnswer: 1,
        explanation: "Oppgaver bør fremme anvendelse, kritikk og syntese, med klare regler for KI-bruk."
      },
      {
        id: 5,
        question: "Hva er et kjernekrav i USNs KI-regler for studenter?",
        options: [
          "Levere KI-tekst som egen uten merking",
          "Dokumentere KI-verktøy, formål og bearbeiding i «Use of AI»",
          "Bruke KI til å konstruere data",
          "Lime inn personopplysninger i KI"
        ],
        correctAnswer: 1,
        explanation: "USN krever åpenhet om verktøy, bruk og kvalitetssikring for KI-assistanse."
      },
      {
        id: 6,
        question: "Hvilken KI-bruk er forbudt etter USN-reglene?",
        options: [
          "Språkvask med etterfølgende egen bearbeiding",
          "Å generere falske kilder eller data til en oppgave",
          "Idémyldring til struktur",
          "Å dokumentere prompt og svar som vedlegg"
        ],
        correctAnswer: 1,
        explanation: "Fabrikkerte kilder/data er fusk; KI må ikke brukes til å villede."
      },
      {
        id: 7,
        question: "Hva er et mål for ansvarlig KI-bruk i gruppearbeid?",
        options: [
          "At KI tar over gruppens analyse",
          "At alle medlemmer forstår og kan redegjøre for innhold, også KI-støttet",
          "At bare én i gruppen vet hva KI foreslo",
          "At KI genererer hele leveransen"
        ],
        correctAnswer: 1,
        explanation: "Gruppen må eie analysen selv; KI kan støtte idéer, men alle må forstå og stå for resultatet."
      }
    ],
    theory: [
      {
        id: "module-1",
        title: "Ansvarlig KI i undervisning og vurdering",
        submodules: [
          {
            id: "sub-2-1",
            title: "Kritisk vurdering av KI-utdata",
            content: "Språklig kvalitet betyr ikke korrekt innhold. Forelesere og studenter må verifisere fakta, kontekst og resonnement mot fagfellevurderte eller anerkjente kilder, og avdekke hallusinasjoner og manglende kontekst.",
            keywords: ["kritisk vurdering", "kvalitet", "hallusinasjon", "verifisering"],
            examples: [
              {
                type: "warning",
                title: "Exemple",
                content: "USN-student får utdatert KI-svar om norsk konkurranselovgivning og lærer å kontrollere mot offisielle kilder."
              }
            ]
          },
          {
            id: "sub-2-2",
            title: "Pedagogisk bruk av KI",
            content: "KI kan foreslå materiell, oppgaver og tilbakemeldinger, men skal ikke erstatte lærerens faglige skjønn. Bruk KI transparent, tilpass til norsk kontekst og læringsutbytter, og kvalitetssikre alt innhold.",
            keywords: ["pedagogisk bruk", "tilbakemelding", "læringsstøtte", "faglig skjønn"],
            examples: [
              {
                type: "good",
                title: "Exemple",
                content: "Foreleser lar KI lage tre case-spørsmål, men tilpasser dem til norsk marked og emnets læringsmål."
              }
            ]
          },
          {
            id: "sub-2-3",
            title: "Etisk bevissthet og resonnering",
            content: "Etisk bruk krever vurdering av bias, diskriminering, personvern, desinformasjon og miljøbelastning. Forelesere må modellere etisk refleksjon og hjelpe studenter å vurdere konsekvenser i akademia og arbeidsliv.",
            keywords: ["etikk", "bias", "personvern", "desinformasjon", "miljø"],
            examples: [
              {
                type: "good",
                title: "Exemple",
                content: "I HR-fag drøftes hvordan KI-rekruttering kan forsterke diskriminering, og tiltak for ansvarlighet."
              }
            ]
          },
          {
            id: "sub-2-4",
            title: "Utforming av vurderingsformer i en KI-tid",
            content: "Definer om en oppgave er KI-tillatt, KI-støttet eller KI-restriktiv. Frem høyere ordens ferdigheter (anvendelse, refleksjon, kritikk, syntese). Krav om dokumentasjon av KI-bruk må være tydelige.",
            keywords: ["vurderingsdesign", "KI-tillatt", "høyere ordens ferdigheter", "dokumentasjon"],
            examples: [
              {
                type: "tip",
                title: "Exemple",
                content: "Studentene evaluerer hvor godt KI oppsummerer en artikkel og hva modellen ikke fanger."
              }
            ]
          },
          {
            id: "sub-2-5",
            title: "USN-spesifikke pedagogiske plikter",
            content: "Studentene må levere eget faglig arbeid; KI-tekst må merkes og dokumenteres. KI skal støtte læring, ikke erstatte lesing og forståelse. Forelesere må kommunisere hva som er lov og hva som regnes som fusk.",
            keywords: ["USN regler", "plikt", "merking", "fusk"],
            examples: [
              {
                type: "warning",
                title: "Exemple",
                content: "Foreleser krever «Use of AI»-seksjon med verktøy, formål og kvalitetssikring for alle innleveringer."
              }
            ]
          }
        ]
      },
      {
        id: "module-2",
        title: "Regler, dokumentasjon og læringsstøtte",
        submodules: [
          {
            id: "sub-2-6",
            title: "Tillatt bruk av KI (USN)",
            content: "Tillatt: idémyldring, disposisjon, utforsking, struktur/språkforbedring og støtte til å identifisere litteratur, med egen bearbeiding og dokumentasjon. KI kan ikke erstatte reell litteratursøkprosess.",
            keywords: ["tillatt bruk", "idémyldring", "språkvask", "dokumentasjon"],
            examples: [
              {
                type: "good",
                title: "Exemple",
                content: "Student restrukturerer innledning med KI, skriver om selv og dokumenterer bruken."
              }
            ]
          },
          {
            id: "sub-2-7",
            title: "Forbudt bruk av KI (USN)",
            content: "Forbudt: levere KI-tekst som egen uten merking, konstruere data, lage falske referanser, eller dele personopplysninger/hemmeligheter. Slike brudd er fusk.",
            keywords: ["forbudt bruk", "falske kilder", "personopplysninger", "fusk"],
            examples: [
              {
                type: "warning",
                title: "Exemple",
                content: "Student ber KI lage økonomiske tall til et case og bruker dem – dette er fusk."
              }
            ]
          },
          {
            id: "sub-2-8",
            title: "Dokumentasjon og åpenhet",
            content: "Beskriv verktøy, formål, bearbeiding og effekt på prosess/resultat. Legg i «Use of AI», fotnote eller vedlegg. Foreleser må følge opp at dokumentasjon leveres når KI er tillatt.",
            keywords: ["dokumentasjon", "åpenhet", "Use of AI", "sporbarhet"],
            examples: [
              {
                type: "tip",
                title: "Exemple",
                content: "Student legger ved prompt og svar som vedlegg og beskriver hvordan KI kun støttet idéutvikling."
              }
            ]
          },
          {
            id: "sub-2-9",
            title: "KI for formativ tilbakemelding og egenregulert læring",
            content: "KI kan gi rask feedback utenfor undervisningstid. Studenter må vurdere relevans og faglig korrekthet før de endrer tekst. Målet er selvstendighet, ikke KI-avhengighet.",
            keywords: ["formativ tilbakemelding", "egenregulert læring", "selvstendighet"],
            examples: [
              {
                type: "tip",
                title: "Exemple",
                content: "Student får forslag til forbedring av problemstilling, men justerer selv etter læringsmålene."
              }
            ]
          }
        ]
      },
      {
        id: "module-3",
        title: "Samarbeid, konsekvenser og innovasjon",
        submodules: [
          {
            id: "sub-3-10",
            title: "KI i gruppearbeid",
            content: "KI kan støtte idéer, men må ikke erstatte samarbeid eller felles forståelse. Alle i gruppen må kunne redegjøre for innholdet – også KI-støttet.",
            keywords: ["gruppearbeid", "samarbeid", "felles forståelse"],
            examples: [
              {
                type: "good",
                title: "Exemple",
                content: "Gruppen bruker KI til alternative strategier, men diskuterer og velger realistiske forslag selv."
              }
            ]
          },
          {
            id: "sub-3-11",
            title: "Unngå KI-avhengighet",
            content: "Overdreven KI-bruk kan svekke problemløsning, kritisk tenkning og selvstendig skriving. Forelesere bør hjelpe studenter å vite når KI hjelper, og når den hindrer læring.",
            keywords: ["KI-avhengighet", "kritisk tenkning", "selvstendig skriving"],
            examples: [
              {
                type: "warning",
                title: "Exemple",
                content: "Foreleser minner om at KI ikke kan erstatte egen forståelse av finansielle analyser."
              }
            ]
          },
          {
            id: "sub-3-12",
            title: "Konsekvenser ved misbruk",
            content: "Umerket KI-tekst, fabrikkering av kilder eller personvernsbrudd kan gi annullert eksamen, ikke bestått eller suspensjon i inntil to år. Forelesere må informere tydelig.",
            keywords: ["konsekvenser", "fusk", "sanksjoner"],
            examples: [
              {
                type: "warning",
                title: "Exemple",
                content: "Foreleser viser scenarier der feil bruk førte til annullert eksamen."
              }
            ]
          },
          {
            id: "sub-3-13",
            title: "KI som drivkraft for pedagogisk innovasjon",
            content: "Ansvarlig KI-bruk kan gi nye læringsformer, scenarier, simuleringer og støtte flipped classroom. Frigjør tid til dialog og veiledning når bruken er pedagogisk forankret.",
            keywords: ["pedagogisk innovasjon", "scenarier", "flipped classroom"],
            examples: [
              {
                type: "tip",
                title: "Exemple",
                content: "Foreleser genererer variasjoner av et etisk dilemma slik at hver gruppe får ulikt scenario å analysere."
              }
            ]
          }
        ]
      }
    ],
    badge: {
      id: "advanced-ai",
      name: "Pedagogisk KI-praktiker",
      description: "Behersker ansvarlig KI-bruk i undervisning, læring og vurdering",
      level: 2,
      earned: false
    }
  },
  {
    id: 3,
    title: "KI i samfunn og fagområder",
    description: "KI i samfunn, arbeidsliv, fagområder og institusjonell strategi",
    content: [
      "Samfunnspåvirkning av KI: rettferdighet, makt, ansvar og styring",
      "KI og arbeidsmarkedet: nye kompetansekrav og fremtidsrettede ferdigheter",
      "Fagspesifikke konsekvenser på tvers av økonomi, samfunn, helse og humaniora",
      "Integrere KI-kompetanse i studieprogrammer og KI-forsterkede yrkesroller",
      "KI i offentlig sektor, demokrati, styring og globale ulikheter",
      "Institusjonell strategi og ansvarlig KI i forskning og utdanning",
      "Kommunikasjon om KI: balansere hype og frykt; fagspesifikke KI-regler"
    ],
    quiz: [
      {
        id: 1,
        question: "Hva er kjernen i kritisk samfunnsforståelse av KI?",
        options: [
          "Å se KI kun som et teknisk verktøy",
          "Å analysere hvordan KI påvirker makt, rettferdighet, ansvar og styring",
          "Å anta at KI alltid forbedrer demokratiet",
          "Å ignorere desinformasjon fra KI-systemer"
        ],
        correctAnswer: 1,
        explanation: "KI er en samfunnsaktør; vi må vurdere makt, rettferdighet, ansvar og styring."
      },
      {
        id: 2,
        question: "Hvilke ferdigheter blir viktigere i et KI-forsterket arbeidsmarked?",
        options: [
          "Kun rutinepregede prosesser",
          "Data- og analyseforståelse, kommunikasjon, etisk dømmekraft",
          "Bare manuelle ferdigheter",
          "Kun programmering"
        ],
        correctAnswer: 1,
        explanation: "KI automatiserer rutiner; menneskelig arbeid vektlegger tolkning, dialog og etikk."
      },
      {
        id: 3,
        question: "Hvorfor er fagspesifikk kontekst viktig for KI?",
        options: [
          "KI påvirker fag likt uansett domene",
          "Ulike fag har ulike metoder, risikoer og etiske hensyn",
          "KI trenger ingen faglig vurdering",
          "Fagkontekst hemmer innovasjon"
        ],
        correctAnswer: 1,
        explanation: "Økonomi, helse, samfunnsfag og humaniora har ulike muligheter og risiko."
      },
      {
        id: 4,
        question: "Hva betyr å integrere KI-kompetanse i studieprogrammer?",
        options: [
          "Bare tilby et generelt KI-kurs",
          "Bygge kritisk, etisk og fagspesifikk KI-bruk inn i faglige aktiviteter og vurderinger",
          "Hindre all KI-bruk",
          "La KI gjøre alt kildearbeid"
        ],
        correctAnswer: 1,
        explanation: "KI-kompetanse bør knyttes til fagets praksis, vurdering og etiske krav."
      },
      {
        id: 5,
        question: "Hva er en hovedutfordring med KI i offentlig sektor?",
        options: [
          "Ingen, KI er alltid nøytral",
          "Rettssikkerhet, transparens og risiko for diskriminering i automatiserte vedtak",
          "KI gjør all forvaltning feilfri",
          "Offentlig sektor bruker ikke KI"
        ],
        correctAnswer: 1,
        explanation: "Automatiserte prosesser kan utfordre rettferdighet, klagerett og tillit."
      },
      {
        id: 6,
        question: "Hvordan kan KI forsterke sosiale og kulturelle ulikheter?",
        options: [
          "Ved å alltid behandle alle likt",
          "Skjeve treningsdata kan gi diskriminerende beslutninger og ulik treffsikkerhet",
          "Ved å eliminere alle former for bias",
          "Ved å ignorere språk og kultur"
        ],
        correctAnswer: 1,
        explanation: "Ubalanserte data kan gi skjevheter i rekruttering, kreditt, helse og utdanning."
      },
      {
        id: 7,
        question: "Hva bør institusjonelle KI-strategier ivareta?",
        options: [
          "Kun rask utrulling av alle KI-verktøy",
          "Balanse mellom innovasjon, personvern, etikk, kvalitet og klare KI-regler i emner",
          "Å overlate alt til enkeltforelesere uten rammer",
          "Å fjerne all dokumentasjon av KI-bruk"
        ],
        correctAnswer: 1,
        explanation: "Strategier må kombinere sikkerhet og etikk med pedagogisk nytte, verktøyvalg og klare retningslinjer."
      }
    ],
    theory: [
      {
        id: "module-1",
        title: "Samfunn, arbeidsliv og fagområder",
        submodules: [
          {
            id: "sub-3-1",
            title: "Forstå samfunnspåvirkningen av KI",
            content: "KI påvirker økonomi, politikk, forvaltning, arbeidsliv og kommunikasjon. Den kan øke effektivitet, men også forsterke ulikhet, desinformasjon, overvåkning og polarisering. Studenter må se KI som samfunnsaktør og vurdere rettferdighet, makt, ansvar og styring.",
            keywords: ["samfunn", "rettferdighet", "makt", "desinformasjon", "styring"],
            examples: [
              {
                type: "warning",
                title: "Exemple",
                content: "Forretningsetikk-klasse analyserer KI-genererte desinformasjonskampanjer og deres effekt på offentlig debatt."
              }
            ]
          },
          {
            id: "sub-3-2",
            title: "KI og det nye arbeidsmarkedet",
            content: "KI endrer kompetansekrav: dataforståelse, analyse, kommunikasjon og etisk dømmekraft øker i verdi. Rutiner automatiseres; menneskelig arbeid flyttes mot tolkning, dialog, problemløsning og strategi.",
            keywords: ["arbeidsmarked", "kompetanse", "analyse", "etikk"],
            examples: [
              {
                type: "good",
                title: "Exemple",
                content: "Ledelsesfag viser hvordan KI automatiserer rapportering, mens ledere fokuserer på tolkning og strategi."
              }
            ]
          },
          {
            id: "sub-3-3",
            title: "Fagspesifikke konsekvenser av KI",
            content: "KI påvirker fag ulikt: økonomi/ledelse (analyse, HR, finans), samfunnsfag (data, politikk, ulikhet), helse (diagnostikk, personvern/bias), humaniora (kreativitet, opphavsrett). Kontekst er avgjørende.",
            keywords: ["fagspesifikk", "økonomi", "helse", "humaniora", "ulikhet"],
            examples: [
              {
                type: "warning",
                title: "Exemple",
                content: "I markedsføring ser studenter hvordan algoritmisk annonsering kan forsterke stereotyper."
              }
            ]
          }
        ]
      },
      {
        id: "module-2",
        title: "Kompetanse, profesjon og offentlig sektor",
        submodules: [
          {
            id: "sub-3-4",
            title: "KI-kompetanse for studenter: integrasjon i studieprogrammer",
            content: "Alle studenter trenger KI-kompetanse tilpasset fag og yrkesroller: vite hva KI kan/ikke kan, kritisk vurdering, etikk og ansvarlig bruk. Integrer i faglige aktiviteter og vurderinger, ikke kun i generelle kurs.",
            keywords: ["KI-kompetanse", "studieprogram", "kritisk vurdering", "etikk"],
            examples: [
              {
                type: "tip",
                title: "Exemple",
                content: "Organisasjonspsykologi: studenter evaluerer KI-effekt på intern kommunikasjon og ansatteopplevelser."
              }
            ]
          },
          {
            id: "sub-3-5",
            title: "Forberede studenter på KI-forsterkede yrkesroller",
            content: "Studenter må lære å samarbeide med KI: kvalitetssikre forslag, kombinere faglig skjønn med KI-støtte, dokumentere beslutninger og forstå regulering/personvern i eget fag.",
            keywords: ["yrkesroller", "kvalitetssikring", "personvern", "regulering"],
            examples: [
              {
                type: "good",
                title: "Exemple",
                content: "Regnskapsfag: studenter vurderer KI-genererte risikovurderinger og dokumenterer egne faglige beslutninger."
              }
            ]
          },
          {
            id: "sub-3-6",
            title: "KI i offentlig sektor, demokrati og styring",
            content: "KI brukes i tjenester som skatt, velferd og transport. Øker effektivitet, men utfordrer gjennomsiktighet, rettssikkerhet, diskriminering og tillit. Viktig for samfunnsfag, jus, helse, offentlig adm.",
            keywords: ["offentlig sektor", "demokrati", "transparens", "rettssikkerhet"],
            examples: [
              {
                type: "warning",
                title: "Exemple",
                content: "Forvaltningsfag: automatiserte NAV-vedtak diskuteres mhp. bias, klagerett og transparens."
              }
            ]
          },
          {
            id: "sub-3-7",
            title: "KI og sosiale, kulturelle og globale ulikheter",
            content: "Skjeve data kan gi ulike treffsikkerheter og diskriminering i rekruttering, kreditt, helse, utdanning og media. Studenter må se hvordan KI kan marginalisere og hvordan bygge inkluderende løsninger.",
            keywords: ["ulikhet", "diskriminering", "inkludering", "bias"],
            examples: [
              {
                type: "warning",
                title: "Exemple",
                content: "HR-fag: KI-baserte CV-filtre kan nedprioritere søkere med ikke-vestlige navn."
              }
            ]
          }
        ]
      },
      {
        id: "module-3",
        title: "Strategi, forskning og kommunikasjon",
        submodules: [
          {
            id: "sub-3-8",
            title: "Institusjonell strategi for KI",
            content: "Universiteter må balansere innovasjon med etikk, sikkerhet og lovverk: retningslinjer, sikre verktøy (Sikt KI-chat), opplæring og tydelige rammer for personvern, databehandling og vurdering.",
            keywords: ["strategi", "personvern", "retningslinjer", "Sikt KI-chat"],
            examples: [
              {
                type: "tip",
                title: "Exemple",
                content: "Fakultet vurderer KI i gruppeoppgaver uten å bryte GDPR eller svekke vurderingsgrunnlaget."
              }
            ]
          },
          {
            id: "sub-3-9",
            title: "KI i forskning: muligheter og etiske ansvar",
            content: "KI kan akselerere litteratursøk, data og simulering, men gir risiko for plagiat, falske kilder, bias og manglende etterprøvbarhet. Krever dokumentasjon av prosesser og kritisk vurdering.",
            keywords: ["forskning", "etterprøvbarhet", "plagiat", "bias"],
            examples: [
              {
                type: "warning",
                title: "Exemple",
                content: "Masterveileder ber om prompt-logg ved KI-bruk i litteraturkartlegging for etterprøvbarhet."
              }
            ]
          },
          {
            id: "sub-3-10",
            title: "KI og høyere utdannings fremtid",
            content: "KI endrer forventninger til undervisning, vurdering og studentstøtte. Automatisert veiledning og adaptiv læring må balanseres mot kjerneferdigheter som kritisk tenkning og kreativitet.",
            keywords: ["høyere utdanning", "adaptiv læring", "kjerneferdigheter"],
            examples: [
              {
                type: "good",
                title: "Exemple",
                content: "Studenter sammenligner KI- og menneskeskrevet case-analyse og drøfter forskjeller i faglig dybde."
              }
            ]
          },
          {
            id: "sub-3-11",
            title: "Kommunikasjon om KI: hype og frykt",
            content: "Offentlig debatt er ofte polarisert. Forelesere må hjelpe studenter å skille hype fra realitet, se økonomiske interesser, og forstå risiko for desinformasjon og automatiserte beslutninger.",
            keywords: ["hype", "frykt", "desinformasjon", "kritisk tenkning"],
            examples: [
              {
                type: "tip",
                title: "Exemple",
                content: "Seminar starter med avisoppslag om «KI tar jobbene» vs. SSB-data; studentene diskuterer gapet."
              }
            ]
          },
          {
            id: "sub-3-12",
            title: "Utforming av fagspesifikke KI-regler i emner",
            content: "Hvert program trenger klare regler for KI-bruk i oppgaver, prosjekter, feltarbeid og eksamen, tilpasset ferdigheter og profesjonsstandarder. Klare rammer gir trygghet og rettferdighet.",
            keywords: ["KI-regler", "emner", "profesjon", "vurdering"],
            examples: [
              {
                type: "tip",
                title: "Exemple",
                content: "Innovasjon og ledelse-programmet presiserer per emne når KI er lov og når egen analyse kreves."
              }
            ]
          }
        ]
      }
    ],
    badge: {
      id: "society-ai",
      name: "Samfunns- og faglig KI-praktiker",
      description: "Behersker KI i samfunn, fagområder og institusjonell strategi",
      level: 3,
      earned: false
    }
  }
];

const getExampleStyles = (type: ExampleType) => {
  switch (type) {
    case "good":
      return "border-green-200 bg-green-50";
    case "bad":
      return "border-red-200 bg-red-50";
    case "tip":
      return "border-blue-200 bg-blue-50";
    case "warning":
      return "border-amber-200 bg-amber-50";
    default:
      return "border-muted bg-muted/10";
  }
};

const getExampleIcon = (type: ExampleType) => {
  switch (type) {
    case "good":
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case "bad":
      return <XCircle className="h-5 w-5 text-red-600" />;
    case "tip":
      return <Info className="h-5 w-5 text-blue-600" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-amber-600" />;
    default:
      return <Info className="h-5 w-5 text-muted-foreground" />;
  }
};

export default function AILiteracyCourse({ onBack }: { onBack?: () => void }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Navigate to the appropriate dashboard based on user role
      const currentRole = getStoredRole();
      const dashboardRoute = ROLE_ROUTES[currentRole] || ROLE_ROUTES.teacher;
      navigate(dashboardRoute);
    }
  };
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentView, setCurrentView] = useState<"overview" | "content" | "modules" | "flashcards" | "quiz">("overview");
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set());
  const [expandedSubmodules, setExpandedSubmodules] = useState<Set<string>>(new Set());
  const [readKeywords, setReadKeywords] = useState<Set<string>>(new Set());
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [activeSubmoduleId, setActiveSubmoduleId] = useState<string>("");
  
  // AI Literacy status state
  const [aiLiteracyStatus, setAiLiteracyStatus] = useState<{
    status: 'not_started' | 'in_progress' | 'completed';
    progress: number;
    lastAccessed?: string;
    completionDate?: string;
    metadata?: any;
  } | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  // Load AI Literacy status from backend
  const loadAiLiteracyStatus = async () => {
    try {
      setIsLoadingStatus(true);
      
      // IMPORTANT: Reset all badge states before loading new user's data
      setEarnedBadges(new Set());
      levels.forEach(level => {
        level.badge.earned = false;
        level.badge.earnedDate = undefined;
      });
      
      const userName = localStorage.getItem('ai4edu_user') || '';
      
      const response = await fetch(API_ENDPOINTS.aiLiteracy.getStatus(), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setAiLiteracyStatus(result.data);
          
          // Restore earned badges from metadata if available
          if (result.data.metadata?.earnedBadges) {
            const badges = result.data.metadata.earnedBadges;
            setEarnedBadges(new Set(badges));
            // Update levels with earned badges
            levels.forEach(level => {
              if (badges.includes(level.badge.id)) {
                level.badge.earned = true;
                if (result.data.metadata?.badgeDates?.[level.badge.id]) {
                  level.badge.earnedDate = result.data.metadata.badgeDates[level.badge.id];
                }
              }
            });
          }
        } else {
          // Initialize with default values
          setAiLiteracyStatus({
            status: 'not_started',
            progress: 0,
          });
        }
      } else {
        // Initialize with default values on error
        setAiLiteracyStatus({
          status: 'not_started',
          progress: 0,
        });
      }
    } catch (error) {
      console.error('Error loading AI Literacy status:', error);
      // Initialize with default values on error
      setAiLiteracyStatus({
        status: 'not_started',
        progress: 0,
      });
    } finally {
      setIsLoadingStatus(false);
    }
  };

  // Save AI Literacy status to backend
  const saveAiLiteracyStatus = async (updates: {
    status?: 'not_started' | 'in_progress' | 'completed';
    progress?: number;
    metadata?: any;
  }) => {
    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      
      // Calculate current progress
      const completedLevels = levels.filter(l => l.badge.earned).length;
      const calculatedProgress = (completedLevels / levels.length) * 100;
      
      // Determine status based on progress
      let status: 'not_started' | 'in_progress' | 'completed' = 'not_started';
      if (calculatedProgress === 0) {
        status = 'not_started';
      } else if (calculatedProgress === 100) {
        status = 'completed';
      } else {
        status = 'in_progress';
      }

      // Prepare metadata with earned badges (get from levels array, not closure)
      const earnedBadgeIds: string[] = [];
      const badgeDates: Record<string, string> = {};
      levels.forEach(level => {
        if (level.badge.earned) {
          earnedBadgeIds.push(level.badge.id);
          if (level.badge.earnedDate) {
            badgeDates[level.badge.id] = level.badge.earnedDate;
          }
        }
      });

    const requestBody: any = {
      status: updates.status || status,
      progress: updates.progress !== undefined ? updates.progress : calculatedProgress,
      metadata: updates.metadata || {
        earnedBadges: earnedBadgeIds,
        badgeDates: badgeDates,
        currentLevel: currentLevel,
        lastView: currentView,
      },
    };

    // Don't include userId - let backend get it from session (userId is optional when logged in)
    // The backend expects MongoDB ObjectId format, not email, so we rely on session instead

    const endpoint = API_ENDPOINTS.aiLiteracy.status;
    // Add userName as query parameter for consistency with other endpoints
    const url = userName 
      ? `${endpoint}?userName=${encodeURIComponent(userName)}`
      : endpoint;

    console.log('[AI Literacy] Saving status to:', url);
    console.log('[AI Literacy] Request body:', requestBody);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        setAiLiteracyStatus(result.data);
        console.log('[AI Literacy] Status saved successfully');
      } else {
        console.warn('[AI Literacy] Response OK but unexpected format:', result);
      }
    } else {
      const errorText = await response.text().catch(() => 'No error details');
      console.error('Failed to save AI Literacy status:', {
        status: response.status,
        statusText: response.statusText,
        endpoint: url,
        error: errorText
      });
      
      // If 404, the endpoint might not be implemented yet
      if (response.status === 404) {
        console.warn('[AI Literacy] Endpoint not found (404). Check if backend route is registered.');
      }
    }
    } catch (error) {
      console.error('Error saving AI Literacy status:', error);
    }
  };

  const toggleSubmodule = (submoduleId: string) => {
    setExpandedSubmodules((prev) => {
      const next = new Set(prev);
      if (next.has(submoduleId)) {
        next.delete(submoduleId);
      } else {
        next.add(submoduleId);
      }
      return next;
    });

    // Mark all keywords in this submodule as "read" when expanding it
    const allSubmodules = currentLevelData.theory
      .flatMap((module) => module.submodules);
    const targetSubmodule = allSubmodules.find((s) => s.id === submoduleId);

    if (targetSubmodule) {
      setReadKeywords((prev) => {
        const next = new Set(prev);
        targetSubmodule.keywords.forEach((keyword) => next.add(keyword));
        return next;
      });
    }
  };

  // Load AI Literacy status and badges on mount AND when user changes
  useEffect(() => {
    // Store initial user for comparison
    const initialUser = localStorage.getItem('ai4edu_user') || '';
    sessionStorage.setItem('last_ai_literacy_user', initialUser);
    
    loadAiLiteracyStatus();
    
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ai4edu_user') {
        loadAiLiteracyStatus();
        sessionStorage.setItem('last_ai_literacy_user', e.newValue || '');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically if user changed (for same-tab login/logout)
    const checkUserInterval = setInterval(() => {
      const currentUser = localStorage.getItem('ai4edu_user') || '';
      const lastUser = sessionStorage.getItem('last_ai_literacy_user') || '';
      if (currentUser !== lastUser) {
        sessionStorage.setItem('last_ai_literacy_user', currentUser);
        loadAiLiteracyStatus();
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkUserInterval);
    };
  }, []);

  // Also reload when component becomes visible (in case user switched in same tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const currentUser = localStorage.getItem('ai4edu_user') || '';
        const lastUser = sessionStorage.getItem('last_ai_literacy_user') || '';
        if (currentUser !== lastUser) {
          sessionStorage.setItem('last_ai_literacy_user', currentUser);
          loadAiLiteracyStatus();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Save status when badges or progress change (debounced to avoid too many saves)
  useEffect(() => {
    if (isLoadingStatus) return; // Don't save while loading
    
    const timeoutId = setTimeout(() => {
      const completedLevels = levels.filter(l => l.badge.earned).length;
      const progress = (completedLevels / levels.length) * 100;
      
      // Determine status
      let status: 'not_started' | 'in_progress' | 'completed' = 'not_started';
      if (progress === 0) {
        status = 'not_started';
      } else if (progress === 100) {
        status = 'completed';
      } else {
        status = 'in_progress';
      }

      saveAiLiteracyStatus({ status, progress });
    }, 1000); // Debounce by 1 second

    return () => clearTimeout(timeoutId);
  }, [earnedBadges, isLoadingStatus]);

  // Save status when level or view changes (track last accessed) - debounced
  useEffect(() => {
    if (isLoadingStatus) return; // Don't save while loading
    
    const timeoutId = setTimeout(() => {
      saveAiLiteracyStatus({});
    }, 500); // Debounce by 500ms

    return () => clearTimeout(timeoutId);
  }, [currentLevel, currentView, isLoadingStatus]);

  const currentLevelData = levels.find(l => l.id === currentLevel)!;
  const isLevelLocked = currentLevel > 1 && !levels[currentLevel - 2].badge.earned;
  const completedLevels = levels.filter(l => l.badge.earned).length;
  // Use backend progress if available, otherwise calculate from badges
  const progress = aiLiteracyStatus?.progress !== undefined 
    ? aiLiteracyStatus.progress 
    : (completedLevels / levels.length) * 100;

  // Get all keywords from current level's theory modules
  const getAllKeywords = () => {
    const keywords: string[] = [];
    if (currentLevelData.theory && currentLevelData.theory.length > 0) {
      currentLevelData.theory.forEach(module => {
        module.submodules.forEach(submodule => {
          keywords.push(...submodule.keywords);
        });
      });
    }
    return Array.from(new Set(keywords));
  };

  const handleStartLevel = () => {
    if (isLevelLocked) {
      toast({
        title: t("aiLiteracy.levelLocked"),
        description: t("aiLiteracy.completePrevious"),
        variant: "destructive",
      });
      return;
    }
    setCurrentView("content");
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const handleStartQuiz = () => {
    setCurrentView("quiz");
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers({ ...quizAnswers, [questionId]: answerIndex });
  };

  const handleSubmitQuiz = () => {
    if (Object.keys(quizAnswers).length < currentLevelData.quiz.length) {
      toast({
        title: t("aiLiteracy.incompleteQuiz"),
        description: t("aiLiteracy.answerAllQuestions"),
        variant: "destructive",
      });
      return;
    }

    setQuizSubmitted(true);
    const score = currentLevelData.quiz.filter(
      (q) => quizAnswers[q.id] === q.correctAnswer
    ).length;
    const passed = score >= 4; // Need 4 out of 5 to pass

    if (passed) {
      // Award badge
      const newBadges = new Set(earnedBadges);
      newBadges.add(currentLevelData.badge.id);
      setEarnedBadges(newBadges);
      currentLevelData.badge.earned = true;
      currentLevelData.badge.earnedDate = new Date().toISOString();
      
      // Save to localStorage (for backward compatibility)
      localStorage.setItem('ai_literacy_badges', JSON.stringify(Array.from(newBadges)));
      
      // Calculate new progress and status
      const newCompletedLevels = levels.filter(l => l.badge.earned || l.id === currentLevel).length;
      const newProgress = (newCompletedLevels / levels.length) * 100;
      const newStatus: 'not_started' | 'in_progress' | 'completed' = 
        newProgress === 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'not_started';
      
      // Save status to backend
      saveAiLiteracyStatus({
        status: newStatus,
        progress: newProgress,
      });
      
      toast({
        title: t("aiLiteracy.congratulations"),
        description: t("aiLiteracy.badgeEarned").replace("{badge}", currentLevelData.badge.name),
      });
    } else {
      toast({
        title: t("aiLiteracy.quizNotPassed"),
        description: `${t("aiLiteracy.score")}: ${score}/5. ${t("aiLiteracy.needToPass")}`,
        variant: "destructive",
      });
    }
  };

  const handleNextLevel = () => {
    if (currentLevel < levels.length) {
      setCurrentLevel(currentLevel + 1);
      setCurrentView("overview");
    }
  };

  const handleRetakeQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const getScore = () => {
    if (!quizSubmitted) return null;
    return currentLevelData.quiz.filter(
      (q) => quizAnswers[q.id] === q.correctAnswer
    ).length;
  };

  // Get all submodules for table of contents
  const getAllSubmodules = useMemo(() => {
    const submodules: Array<{ id: string; title: string; moduleTitle: string; moduleId: string }> = [];
    if (currentLevelData.theory && currentLevelData.theory.length > 0) {
      currentLevelData.theory.forEach(module => {
        module.submodules.forEach(submodule => {
          submodules.push({
            id: submodule.id,
            title: submodule.title,
            moduleTitle: module.title,
            moduleId: module.id
          });
        });
      });
    }
    return submodules;
  }, [currentLevelData]);

  // Scroll tracking for table of contents using Intersection Observer
  useEffect(() => {
    if (currentView !== "modules") return;

    const observers: IntersectionObserver[] = [];

    getAllSubmodules.forEach((submodule) => {
      const element = document.getElementById(`submodule-${submodule.id}`);
      if (element) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                setActiveSubmoduleId(submodule.id);
              }
            });
          },
          {
            rootMargin: '-20% 0px -60% 0px',
            threshold: [0, 0.3, 0.6, 1]
          }
        );
        observer.observe(element);
        observers.push(observer);
      }
    });

    // Set first submodule as active initially
    if (getAllSubmodules.length > 0) {
      setActiveSubmoduleId(getAllSubmodules[0].id);
    }

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [currentView, getAllSubmodules]);

  if (currentView === "content") {
    return (
      <div className="min-h-screen bg-gradient-subtle p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{t("aiLiteracy.level")} {currentLevel}: {currentLevelData.title}</CardTitle>
                  <CardDescription className="mt-2">{currentLevelData.description}</CardDescription>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {t("aiLiteracy.level")} {currentLevel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {t("aiLiteracy.overview")}
                </h3>
                <ul className="space-y-2">
                  {currentLevelData.content.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("teacher.editor.back")}
                </Button>
                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" onClick={() => setCurrentView("modules")}>
                    <FileText className="h-4 w-4 mr-2" />
                    {t("aiLiteracy.modules")}
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentView("flashcards")}>
                    <Zap className="h-4 w-4 mr-2" />
                    {t("aiLiteracy.flashCards")}
                  </Button>
                  <Button onClick={handleStartQuiz}>
                    {t("aiLiteracy.startQuiz")}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentView === "modules") {
    const allKeywords = getAllKeywords();
    const allSubmodules = getAllSubmodules;
    
    return (
      <div className="min-h-screen bg-gradient-subtle p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-6">
            {/* Table of Contents - Left Side */}
            <div className="col-span-12 lg:col-span-3">
              <Card className="sticky top-8">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Table of contents</CardTitle>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="relative">
                    {/* Progress Indicator */}
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-purple-200">
                      <div 
                        className="absolute left-0 top-0 w-0.5 bg-purple-600 transition-all duration-300"
                        style={{
                          height: activeSubmoduleId 
                            ? `${Math.min(((allSubmodules.findIndex(s => s.id === activeSubmoduleId) + 1) / allSubmodules.length) * 100, 100)}%`
                            : allSubmodules.length > 0 ? `${(1 / allSubmodules.length) * 100}%` : '0%'
                        }}
                      />
                    </div>
                    
                    {/* Submodules List */}
                    <div className="space-y-1 pl-4">
                      {allSubmodules.map((submodule, idx) => {
                        const isActive = activeSubmoduleId === submodule.id;
                        const activeIndex = allSubmodules.findIndex(s => s.id === activeSubmoduleId);
                        const isBeforeActive = activeIndex > idx;
                        const isAfterActive = activeIndex < idx;
                        
                        return (
                          <div
                            key={submodule.id}
                            className={`relative pl-6 py-2 cursor-pointer transition-colors ${
                              isActive 
                                ? 'text-foreground font-bold underline' 
                                : isBeforeActive
                                ? 'text-purple-600'
                                : 'text-muted-foreground'
                            }`}
                            onClick={() => {
                              const element = document.getElementById(`submodule-${submodule.id}`);
                              if (element) {
                                // Expand if collapsed
                                if (!expandedSubmodules.has(submodule.id)) {
                                  toggleSubmodule(submodule.id);
                                  // Wait for expansion animation
                                  setTimeout(() => {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }, 100);
                                } else {
                                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                              }
                            }}
                          >
                            {/* Active indicator bar */}
                            {isActive && (
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-purple-600" />
                            )}
                            <div className={`text-sm ${isActive ? 'font-bold' : ''}`}>
                              {idx + 1}. {submodule.title}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="col-span-12 lg:col-span-9 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">Level {currentLevel}: {currentLevelData.title}</CardTitle>
                      <CardDescription className="mt-2">Theory Modules</CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      Level {currentLevel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentLevelData.theory && currentLevelData.theory.length > 0 ? (
                    currentLevelData.theory.map((module) => (
                    <div key={module.id} className="space-y-4">
                      <h3 className="text-xl font-semibold text-primary">{module.title}</h3>
                      {module.submodules.map((submodule) => {
                        const isExpanded = expandedSubmodules.has(submodule.id);
                        return (
                          <Card key={submodule.id} id={`submodule-${submodule.id}`} className="overflow-hidden scroll-mt-24">
                            <CardHeader
                              className="cursor-pointer hover:bg-secondary/50 transition-colors"
                              onClick={() => toggleSubmodule(submodule.id)}
                            >
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{submodule.title}</CardTitle>
                                {isExpanded ? (
                                  <ChevronUp className="h-5 w-5" />
                                ) : (
                                  <ChevronDown className="h-5 w-5" />
                                )}
                              </div>
                            </CardHeader>
                            {isExpanded && (
                              <CardContent className="space-y-4">
                                <div className="prose max-w-none">
                                  {(() => {
                                    let content = submodule.content;
                                    const keywordSpans: Array<{ keyword: string; index: number }> = [];
                                    
                                    // Find all keyword positions
                                    submodule.keywords.forEach(keyword => {
                                      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
                                      let match;
                                      while ((match = regex.exec(content)) !== null) {
                                        keywordSpans.push({ keyword, index: match.index });
                                      }
                                    });
                                    
                                    // Sort by index
                                    keywordSpans.sort((a, b) => a.index - b.index);
                                    
                                    // Build content with highlighted keywords
                                    const parts: Array<{ text: string; isKeyword: boolean; keyword?: string }> = [];
                                    let lastIndex = 0;
                                    
                                    keywordSpans.forEach(({ keyword, index }) => {
                                      if (index > lastIndex) {
                                        parts.push({ text: content.substring(lastIndex, index), isKeyword: false });
                                      }
                                      const keywordLength = keyword.length;
                                      parts.push({ 
                                        text: content.substring(index, index + keywordLength), 
                                        isKeyword: true, 
                                        keyword 
                                      });
                                      lastIndex = index + keywordLength;
                                    });
                                    
                                    if (lastIndex < content.length) {
                                      parts.push({ text: content.substring(lastIndex), isKeyword: false });
                                    }
                                    
                                    return parts.length > 0 ? (
                                      <>
                                        {parts.map((part, idx) => {
                                          if (part.isKeyword && part.keyword) {
                                            const isRead = readKeywords.has(part.keyword);
                                            return (
                                              <span
                                                key={idx}
                                                data-keyword={part.keyword}
                                                className={`font-semibold ${
                                                  isRead ? 'text-green-600' : 'text-primary'
                                                }`}
                                              >
                                                {part.text}
                                              </span>
                                            );
                                          }
                                          return <span key={idx}>{part.text}</span>;
                                        })}
                                      </>
                                    ) : (
                                      <span>{content}</span>
                                    );
                                  })()}
                                </div>
                                
                                {submodule.examples.length > 0 && (
                                  <div className="space-y-3 mt-4">
                                    {submodule.examples.map((example, exIdx) => (
                                      <div
                                        key={exIdx}
                                        className={`p-4 rounded-lg border-2 ${getExampleStyles(example.type)}`}
                                      >
                                        <div className="flex items-start gap-3">
                                          {getExampleIcon(example.type)}
                                          <div className="flex-1">
                                            <h4 className="font-semibold mb-2">{example.title}</h4>
                                            <p className="text-sm">{example.content}</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Theory modules coming soon for this level.
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("teacher.editor.back")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "flashcards") {
    const allKeywords = getAllKeywords();
    const currentKeyword = allKeywords[currentFlashcardIndex] || "";
    
    // Find definition/context for keyword
    const getKeywordContext = (keyword: string) => {
      for (const module of currentLevelData.theory) {
        for (const submodule of module.submodules) {
          if (submodule.keywords.includes(keyword)) {
            // Extract sentence containing keyword
            const sentences = submodule.content.split('.');
            const relevantSentence = sentences.find(s => 
              s.toLowerCase().includes(keyword.toLowerCase())
            );
            return relevantSentence || submodule.content.substring(0, 150) + "...";
          }
        }
      }
      return `Definition and context for ${keyword}`;
    };

    return (
      <div className="min-h-screen bg-gradient-subtle p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t("aiLiteracy.flashCards")} - {t("aiLiteracy.level")} {currentLevel}</CardTitle>
              <CardDescription>
                {t("aiLiteracy.overview")} ({currentFlashcardIndex + 1} / {allKeywords.length})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {allKeywords.length > 0 ? (
                <>
                  <div
                    className="relative h-64 cursor-pointer perspective-1000"
                    onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                    style={{ perspective: '1000px' }}
                  >
                    <div
                      className="relative w-full h-full transition-transform duration-500"
                      style={{
                        transformStyle: 'preserve-3d',
                        transform: flashcardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                      }}
                    >
                      {/* Front */}
                      <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          transform: 'rotateY(0deg)'
                        }}
                      >
                        <Card className="h-full flex items-center justify-center bg-primary text-primary-foreground">
                          <CardContent className="text-center p-8">
                            <h3 className="text-3xl font-bold">{currentKeyword}</h3>
                            <p className="mt-4 text-sm opacity-80">{t("aiLiteracy.flip")}</p>
                          </CardContent>
                        </Card>
                      </div>
                      {/* Back */}
                      <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)'
                        }}
                      >
                        <Card className="h-full flex items-center justify-center bg-secondary">
                          <CardContent className="text-center p-8">
                            <p className="text-lg">{getKeywordContext(currentKeyword)}</p>
                            <p className="mt-4 text-sm text-muted-foreground">{t("aiLiteracy.flip")}</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentFlashcardIndex(Math.max(0, currentFlashcardIndex - 1));
                        setFlashcardFlipped(false);
                      }}
                      disabled={currentFlashcardIndex === 0}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {t("aiLiteracy.previous")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentFlashcardIndex(Math.min(allKeywords.length - 1, currentFlashcardIndex + 1));
                        setFlashcardFlipped(false);
                      }}
                      disabled={currentFlashcardIndex === allKeywords.length - 1}
                    >
                      {t("aiLiteracy.next")}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground">{t("aiLiteracy.overview")}</p>
              )}

              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("teacher.editor.back")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentView === "quiz") {
    const score = getScore();
    return (
      <div className="min-h-screen bg-gradient-subtle p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t("aiLiteracy.level")} {currentLevel} {t("aiLiteracy.quiz")}</CardTitle>
              <CardDescription>
                {t("aiLiteracy.answerAllQuestions")} {t("aiLiteracy.needToPass")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentLevelData.quiz.map((question, qIndex) => {
                const userAnswer = quizAnswers[question.id];
                const isCorrect = userAnswer === question.correctAnswer;
                const showResult = quizSubmitted;

                return (
                  <div
                    key={question.id}
                    className={`border rounded-lg p-4 ${
                      showResult
                        ? isCorrect
                          ? "bg-green-50 border-green-300"
                          : "bg-red-50 border-red-300"
                        : "bg-card"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                        showResult
                          ? isCorrect
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                          : "bg-primary text-primary-foreground"
                      }`}>
                        {showResult && isCorrect ? "✓" : showResult ? "✗" : qIndex + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-3">{question.question}</h4>
                        <div className="space-y-2">
                          {question.options.map((option, oIndex) => {
                            const isSelected = userAnswer === oIndex;
                            const isCorrectOption = oIndex === question.correctAnswer;
                            
                            return (
                              <label
                                key={oIndex}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                  showResult
                                    ? isCorrectOption
                                      ? "bg-green-100 border-2 border-green-500"
                                      : isSelected
                                      ? "bg-red-100 border-2 border-red-500"
                                      : "bg-gray-50"
                                    : isSelected
                                    ? "bg-primary/10 border-2 border-primary"
                                    : "bg-secondary hover:bg-secondary/80 border-2 border-transparent"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${question.id}`}
                                  checked={isSelected}
                                  onChange={() => handleAnswerSelect(question.id, oIndex)}
                                  disabled={quizSubmitted}
                                  className="h-4 w-4"
                                />
                                <span className="flex-1">{option}</span>
                                {showResult && isCorrectOption && (
                                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                                )}
                              </label>
                            );
                          })}
                        </div>
                        {showResult && (
                          <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                            <p className="text-sm text-blue-900">
                              <strong>Explanation:</strong> {question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {quizSubmitted && score !== null && (
                <div className={`p-6 rounded-lg text-center ${
                  score >= 4 ? "bg-green-100 border-2 border-green-500" : "bg-red-100 border-2 border-red-500"
                }`}>
                  <div className="text-4xl mb-2">{score >= 4 ? "🎉" : "😔"}</div>
                  <h3 className="text-2xl font-bold mb-2">
                    {score >= 4 ? "Congratulations!" : "Not Quite There"}
                  </h3>
                  <p className="text-lg mb-4">
                    You scored {score}/7. {score >= 4 ? "You passed!" : "You need 4/5 to pass."}
                  </p>
                  {score >= 4 && currentLevelData.badge.earned && (
                    <div className="flex items-center justify-center gap-2 text-2xl font-bold text-green-700">
                      <Trophy className="h-8 w-8" />
                      <span>Badge Earned: {currentLevelData.badge.name}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("teacher.editor.back")}
                </Button>
                {!quizSubmitted ? (
                  <Button onClick={handleSubmitQuiz} className="ml-auto" disabled={Object.keys(quizAnswers).length < currentLevelData.quiz.length}>
                    {t("aiLiteracy.submitQuiz")}
                  </Button>
                ) : score !== null && score < 4 ? (
                  <Button onClick={handleRetakeQuiz} className="ml-auto">
                    {t("aiLiteracy.retakeQuiz")}
                  </Button>
                ) : currentLevel < levels.length ? (
                  <Button onClick={handleNextLevel} className="ml-auto">
                    {t("aiLiteracy.nextLevel")}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleBack} className="ml-auto">
                    {t("aiLiteracy.completed")}
                    <Trophy className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Overview view
  return (
    <div className="min-h-screen bg-gradient-subtle p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl flex items-center gap-3">
                  <Sparkles className="h-8 w-8 text-primary" />
                  AI Literacy Mini Course
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  {t("aiLiteracy.description")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{t("aiLiteracy.overallProgress")}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Levels Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {levels.map((level) => {
            const isLocked = level.id > 1 && !levels[level.id - 2].badge.earned;
            const isCurrent = level.id === currentLevel;
            const isCompleted = level.badge.earned;

            return (
              <Card
                key={level.id}
                className={`relative overflow-hidden transition-all ${
                  isLocked
                    ? "opacity-60 cursor-not-allowed"
                    : isCurrent
                    ? "ring-2 ring-primary shadow-lg scale-105"
                    : isCompleted
                    ? "border-green-500 border-2"
                    : "hover:shadow-lg cursor-pointer"
                }`}
                onClick={() => !isLocked && setCurrentLevel(level.id)}
              >
                {isLocked && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                    <div className="text-center">
                      <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm font-semibold">Locked</p>
                      <p className="text-xs text-muted-foreground">Complete previous level</p>
                    </div>
                  </div>
                )}
                {isCompleted && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-500">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Completed
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={isCompleted ? "default" : "secondary"} className="text-lg px-3 py-1">
                      Level {level.id}
                    </Badge>
                    {isCompleted && (
                      <Trophy className="h-6 w-6 text-yellow-500" />
                    )}
                  </div>
                  <CardTitle className="text-xl">{level.title}</CardTitle>
                  <CardDescription className="mt-2">{level.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold mb-2">Badge:</p>
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <Award className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <Award className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className={isCompleted ? "font-semibold" : "text-muted-foreground"}>
                          {level.badge.name}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1">Quiz:</p>
                      <p className="text-sm text-muted-foreground">7 spørsmål • 6/7 riktige for å bestå</p>
                    </div>
                    {!isLocked && (
                      <Button
                        className="w-full mt-4"
                        variant={isCurrent ? "default" : "outline"}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentLevel(level.id);
                          handleStartLevel();
                        }}
                      >
                        {isCompleted ? "Review" : isCurrent ? "Continue" : "Start Level"}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Badges Earned Summary */}
        {earnedBadges.size > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                Your Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                {levels
                  .filter(l => earnedBadges.has(l.badge.id))
                  .map(level => (
                    <div
                      key={level.badge.id}
                      className="flex items-center gap-3 p-4 border-2 border-yellow-500 rounded-lg bg-yellow-50"
                    >
                      <Award className="h-8 w-8 text-yellow-600" />
                      <div>
                        <p className="font-semibold">{level.badge.name}</p>
                        <p className="text-sm text-muted-foreground">{level.badge.description}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}

