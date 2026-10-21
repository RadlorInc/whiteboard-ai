// Dutch translation of src/content/legal.ts (same keys, same facts). The English version applies if they differ;
// change both together.
import { PRODUCT_NAME } from "@/product";
import type { Doc } from "./legal";

const P = PRODUCT_NAME;

export const LEGAL_NL: Record<string, Doc> = {
  terms: { title: "Gebruiksvoorwaarden", sections: [
    ["Wie we zijn", [`${P} is een dienst van Radlor Inc. ("wij"). Door een account te maken ga je akkoord met deze voorwaarden.`]],
    ["Wie het mag gebruiken", [
      "Je moet 13 jaar of ouder zijn. Ben je jonger dan 18, dan moet een ouder of voogd akkoord gaan met deze voorwaarden en is die ook degene die betaalt.",
      "Eén persoon per account. Houd het e-mailadres waarmee je inlogt veilig; jij bent verantwoordelijk voor wat er in je account gebeurt."]],
    ["Wat je krijgt", [
      `${P} maakt van je vraag een korte geanimeerde uitleg met gesproken tekst, geschreven door AI. AI kan fouten maken: controleer alles wat belangrijk is, vooral vragen over gezondheid, recht of geld. Het is geen medisch, juridisch of financieel advies.`,
      "Elke nieuwe vraag maakt een nieuwe video en kost een van je video's voor die maand. Een video die je al hebt gemaakt opnieuw bekijken is gratis.",
      "De stem wordt op je eigen apparaat gemaakt. De eerste keer downloadt je browser een stemmodel (ongeveer 166 MB voor Engels, ongeveer 82 MB voor Nederlands, grotendeels van Hugging Face) en bewaart het; apparaten die het niet kunnen draaien gebruiken de eigen stem van de browser."]],
    ["Gratis video's, abonnementen en betalingen", [
      "Elk account krijgt elke kalendermaand (UTC) 10 gratis video's. Ongebruikte gratis video's gaan niet mee naar de volgende maand. Daarna kost elke video één video uit een betaald abonnement. Mislukte of geweigerde video's tellen nooit mee.",
      "Abonnementen zijn er op drie niveaus (middelbare school, bachelor, master). Video's uit een abonnement worden uitgelegd op het niveau van dat abonnement, op welk niveau een chat ook staat; gratis video's kunnen op elk niveau worden gemaakt.",
      "Maandabonnementen worden automatisch verlengd tot je opzegt. Abonnementsvideo's vervallen 3 dagen na elke factuurperiode. Video's die in bundels zijn gekocht voordat bundels uit de verkoop gingen, vervallen niet.",
      "Betalingen lopen via Stripe. Prijzen zijn in Amerikaanse dollars, plus belasting waar van toepassing. Zie Terugbetalingen voor wanneer je geld terugkrijgt."]],
    ["Aanvaardbaar gebruik", ["Volg de regels voor aanvaardbaar gebruik. We kunnen een vraag weigeren en accounts die de regels overtreden opschorten."]],
    ["Delen en Ontdekken", [
      "Als je een video deelt, kan iedereen met de link hem bekijken. Ze zien niet wie hem heeft gemaakt. Je kunt op elk moment stoppen met delen.",
      "Ontdekken is een openbare pagina waar iedereen, ingelogd of niet, video's kan bekijken die mensen daar hebben laten zien. Elke nieuwe video komt op Ontdekken zodra hij klaar is, voor elk account, ook dat van gebruikers van 13–17 jaar. Ontdekken toont de vraag en de video, nooit je naam of e-mailadres. Je kunt een video op elk moment via de pagina van die video van Ontdekken halen.",
      "Vragen met links, e-mailadressen, gebruikersnamen of telefoonnummers worden nooit op Ontdekken getoond. Iedereen kan een openbare video melden, en we kunnen elke video van Ontdekken halen of het delen ervan stoppen."]],
    ["Je account beëindigen", ["Je kunt je account op elk moment verwijderen via Account. We kunnen accounts sluiten die deze voorwaarden overtreden."]],
    ["Wijzigingen", ["We sturen je een e-mail voordat nieuwe voorwaarden ingaan, en vragen je die te accepteren."]],
    ["Contact", ["Vragen: gebruik de Contactpagina."]],
  ] },
  privacy: { title: "Privacybeleid", sections: [
    ["Wat we verzamelen", [
      "Je e-mailadres, je leeftijdsgroep (13–17 of 18+; nooit je geboortedatum), je vragen en de video's die ervan zijn gemaakt, je videotegoed en betaalgeschiedenis (kaartgegevens blijven bij Stripe), en eenvoudige technische logs.",
      "Je keuze voor een stem wordt alleen in je browser bewaard.",
      "We gebruiken geen advertentietrackers en verkopen of delen je persoonsgegevens niet voor advertenties."]],
    ["Waarom", ["Om je video's te maken, je account en betalingen te regelen, de dienst veilig en werkend te houden, en aan wettelijke plichten te voldoen."]],
    ["Wie ons helpt (dienstverleners)", [
      "Supabase (database en inloggen), Vercel (hosting), Anthropic (schrijft het videoscript op basis van je vraag), Stripe (betalingen) en een e-mailprovider voor inlogcodes. Elk van hen mag je gegevens alleen gebruiken om hun dienst aan ons te leveren.",
      "Je browser downloadt het stemmodel van Hugging Face, waardoor Hugging Face je IP-adres kan zien. Er wordt geen vraag of video naartoe gestuurd: de stem wordt op je apparaat gemaakt."]],
    ["Je vragen", ["Je vraag wordt naar Anthropic gestuurd om de video te schrijven. Zet geen privégegevens (zoals volledige namen, adressen of telefoonnummers) in een vraag, en zeker niet in een vraag die je op Ontdekken laat zien. Vragen komen nooit in webadressen of analytics terecht."]],
    ["Ontdekken en gedeelde video's", [
      "Een video die je op Ontdekken laat zien of via een link deelt, is openbaar: iedereen kan de vraag zien en de video bekijken. We laten nooit zien wie hem heeft gemaakt.",
      "Haal hem op elk moment van Ontdekken of stop met delen via de pagina van de video; je video of je account verwijderen haalt hem ook weg.",
      "Als iemand een openbare video meldt, bewaren we de reden, de toelichting en een onherkenbaar gemaakte vorm van het IP-adres van de melder (om meldingen te beperken), nooit het adres zelf."]],
    ["Bewaren en verwijderen", [
      "Je kunt elke video verwijderen, al je gegevens downloaden of je account verwijderen via Account.",
      "Als je je account verwijdert, verwijderen we je vragen, video's en gedeelde links. Een minimaal betalingsoverzicht wordt bewaard zoals de belastingwet vereist."]],
    ["Tieners", ["De dienst is voor 13 jaar en ouder. Als we merken dat een gebruiker jonger dan 13 is, verwijderen we het account en betalen we ongebruikte video's uit een betaald abonnement terug."]],
    ["Je rechten", ["Afhankelijk van waar je woont (bijvoorbeeld Californië) kun je vragen om je gegevens in te zien, te corrigeren of te verwijderen. Gebruik Account of de Contactpagina."]],
  ] },
  refunds: { title: "Terugbetalingen en opzeggen", sections: [
    ["Nooit in rekening gebracht", ["Mislukte, geweigerde of verlopen video's tellen nooit mee."]],
    ["Een foute of kapotte video", ["Meld een abonnementsvideo binnen 7 dagen en je krijgt hem na controle terug."]],
    ["Bundels", ["Bundels worden niet meer verkocht. Een eerder gekochte bundel die helemaal niet is gebruikt, kan binnen 14 dagen na aankoop worden terugbetaald."]],
    ["Abonnementen", [
      "Je eerste abonnementsbetaling kan binnen 7 dagen worden terugbetaald als je 10% of minder van de video's hebt gebruikt.",
      "Zeg op elk moment op via Account → Abonnement beheren. Je houdt je abonnementsvideo's tot het einde van de periode. Verder zijn er geen gedeeltelijke terugbetalingen, tenzij de wet dat vereist."]],
    ["Je account verwijderen", ["Ongebruikte abonnementsvideo's worden niet terugbetaald als je je account verwijdert."]],
  ] },
  "acceptable-use": { title: "Aanvaardbaar gebruik", sections: [
    ["Vraag niet om", [
      "Seksuele inhoud, inhoud die minderjarigen seksualiseert, hulp om jezelf of anderen pijn te doen, wapens of gevaarlijke instructies, haat of intimidatie, of iets wat illegaal is.",
      "Denk je erover om jezelf iets aan te doen, bel of sms dan nu 988 (VS)."]],
    ["Niet doen", ["Privégegevens over andere mensen delen, proberen de dienst te breken of te overbelasten, toegang doorverkopen, of geautomatiseerde tools gebruiken om video's te maken."]],
    ["Openbare video's", ["Video's op Ontdekken of gedeeld via een link moeten zich ook aan deze regels houden. Gebruik “Deze video melden” onder een openbare video om ons te laten weten dat een video dat niet doet."]],
  ] },
  accessibility: { title: "Toegankelijkheid", sections: [
    ["Ons doel", ["We streven naar WCAG 2.2 AA. Elke video heeft ondertitels en een uitgeschreven tekst, werkt met minder beweging, en de pagina's werken met een toetsenbord en schermlezers."]],
    ["Problemen", ["Als iets niet werkt voor jou, laat het ons weten via de Contactpagina."]],
  ] },
  copyright: { title: "Auteursrecht", sections: [
    ["Je video's", ["Je mag de video's die je maakt gebruiken voor persoonlijke en educatieve doeleinden."]],
    ["Melden", ["Denk je dat een gedeelde video of een video op Ontdekken inbreuk maakt op je auteursrecht, gebruik dan de Contactpagina met de link en je gegevens."]],
    ["Stem", [
      "De stem wordt gemaakt met Pocket TTS van Kyutai, gelicentieerd onder Creative Commons Naamsvermelding 4.0 (CC BY 4.0), met de browserversie van KevinAHM (Apache License 2.0).",
      "De stemmen komen van opnames van Alba MacKenna (CC BY 4.0), het VCTK-corpus van het Centre for Speech Technology Research, University of Edinburgh (CC BY 4.0), en het Unmute-stemdonatieproject van Kyutai (CC0).",
      "Nederlandse vertelling wordt gemaakt met Piper (MIT-licentie) en de Nederlandse stemmen Pim en Ronnie van rhasspy/piper-voices (CC0). Tekst wordt omgezet in klanken door eSpeak NG (GNU General Public License v3; broncode op github.com/espeak-ng/espeak-ng), in de WebAssembly-versie van piper-wasm door Diffusion Studio (MIT-licentie)."]],
    ["Illustraties", [
      "Sommige anatomietekeningen (zoals het opengesneden hart) zijn bewerkt van Servier Medical Art van Servier (smart.servier.com), gelicentieerd onder Creative Commons Naamsvermelding 4.0 (CC BY 4.0). We hebben ze omgezet naar ons whiteboardformaat, niets opnieuw ingekleurd, en onze eigen labels en animatie toegevoegd.",
      "Tekeningen van planten, dieren, microben en virussen komen van Bioicons (bioicons.com), omgezet naar ons whiteboardformaat. Gelicentieerd onder Creative Commons Naamsvermelding 4.0 (CC BY 4.0): Alejandro Matía, Alexis Maizel, Andi Wilson, Ciera Martinez, Connor Tansley, DBCLS (TogoTV), Daniel Carvalho, Durvesh Burhade & Niliksha Patel, Erin Sparks, Frédéric Bouché, Guillaume Lobet, Lucien Hinderling en Roman Schwob, Matthew Dzievit en Plant Illustrations. Onder CC BY 3.0: Servier. Publiek domein (CC0): Ben Murrell, Ewa Oz, Geomicrobio, Gina Vong, James Lloyd, Mariana Ruiz Villareal, Pauline Franz, Samuel Nestor Meckoni en Simon Dürr. De volledige lijst, per tekening, staat bij onze broncode.",
      "Silhouetten van dieren en planten komen van PhyloPic (phylopic.org). Gelicentieerd onder Creative Commons Naamsvermelding 4.0 (CC BY 4.0): Caleb M. Gordon, Edwin Price, Ivan Iofrida, Luca Leicht, Margot Michaud, Melissa Broussard, Natalie Kestel, painting Guo en de Tree of Life App. Onder CC BY 3.0: Deepak Veerappan, Kai Caspar en Manabu Sakamoto. De overige zijn publiek domein (CC0 of public domain mark), met dank aan de makers.",
      "Molecuulstructuren tekenen we zelf met RDKit, opensource-scheikundesoftware (BSD-licentie).",
      "Tekeningen van cellen, organellen, weefsels, receptoren, transporters en eiwitten komen uit de Reactome Icon Library (reactome.org/icon-lib), gelicentieerd onder Creative Commons Naamsvermelding 4.0 (CC BY 4.0) door Reactome (OICR, EMBL-EBI, CSHL, NYU Langone), omgezet naar ons whiteboardformaat. De ontwerper van elke tekening staat bij onze broncode.",
      "Tekeningen van cellen, microben, het afweersysteem, eiwitten, laboratoria en dieren komen van NIH BioArt Source (bioart.niaid.nih.gov), National Institute of Allergy and Infectious Diseases, in het publiek domein, omgezet naar ons whiteboardformaat.",
      "Kleurentekeningen van dieren, planten, fruit, alledaagse voorwerpen en de natuurkundige voorwerpen (batterijen, magneten, lenzen, instrumenten, voertuigen, planeten) komen van Fluent Emoji van Microsoft (github.com/microsoft/fluentui-emoji), gebruikt onder de MIT License: Copyright (c) Microsoft Corporation. De volledige licentietekst staat op /licenses/fluent-emoji-MIT.txt."]],
  ] },
};
