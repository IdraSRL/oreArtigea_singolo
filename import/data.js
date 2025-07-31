// Static data for employees and activities
// data.js
export const firebaseConfig = {
  apiKey: "AIzaSyCcq4vF4yGXOx3XVd30Mhqh4bfF2z8O7XU",
  authDomain: "oredipendenti-81442.firebaseapp.com",
  projectId: "oredipendenti-81442",
  storageBucket: "oredipendenti-81442.firebasestorage.app",
  messagingSenderId: "605987945448",
  appId: "1:605987945448:web:17d89a5f410c07b464025d"
};


export const employees = [
  { name: "**Dipendente Test**", password: "Test", urlParam: "DipendenteTest" },
  { name: "Alessandro Resti", password: "AR5671", urlParam: "AlessandroResti" },
  { name: "Anna Wleklak", password: "AW5896", urlParam: "AnnaWleklak" },
  { name: "Antonella Guarnieri", password: "AG8024", urlParam: "AntonellaGuarnieri" },
  { name: "Letizia Vannini", password: "LV4587", urlParam: "LetiziaVannini" },
  { name: "Manola Santarnecchi", password: "MS1936", urlParam: "ManolaSanternecchi" },
  { name: "Roberta Salemmo", password: "RS6239", urlParam: "RobertaSalemmo" },
  { name: "Silvia Marrucci", password: "SM5872", urlParam: "SilviaMarrucci" },
  { name: "Anna Macrì", password: "AM9814", urlParam: "AnnaMacrì" }
  /* Dipendenti eliminati
{ name: "Antonio Bene", password: "AB3098", urlParam: "AntonioBene" },
{ name: "Elizabeta Abaz", password: "EA5872", urlParam: "ElizabetaAbaz" },



  */

];

// Master password for admin access
export const masterPassword = "Artigea";

// Activity categories and their tasks with default minutes
export const appartamenti = [
  "LE_MURA|60",
  "ORTENSIE|150",
  "INBETWEEN|60",
  "SUNNY|90",
  "CASA_DI_ROSA|90",
  "TORRE|90",
  "ORSINI|60",
  "RIPASSO|30",
  "CASA_LIA|90",
  "TUSCANY|120",
  "GIRASOLE|30",
  "GELSOMINO|30",
  "MIMOSA|30",
  "3in1|100",
  "NEW_HOUSE_-VIA_PARDI|90",
  "NEW_APT-VIA_TADDEI|60",
  "DESIGNER_FLAT-VIA_BARGAGNA|90",
  "ELEGANT-VIA_VESALIO|120",
  "APT_OSPEDALE-VIA_LUIGI_PERA|60",
  "SAVANA|60",
  "RINOCERONTE|60",
  "GIRAFFA|60",
  "CHARM&RELAX|60",
  "NUOVO&GRAZIOSO|60",
  "CAMPANIA2|60",
  "RANIERI|60",
  "LAURA|60",
  "KINZIKA|60",
  "PAMPURIO|60",
  "PINUCCIO|60",
  "SWEET HOME|60",
  "FLAT MODERNO|60"
];

export const uffici = [
  "ACI|200",
  "PROFESSIONECASA|60",
  "UFFICIO START|120",
  "MAGAZZINO START|30",
  "SUORE NAVACCHIO|50",
  "SUORE PISA|50",
  "COLLEGIO PROFESSIONALE INFERMIERI|60",
  "COLLEGIO PROFESSIONALE INFERMIERI - VETRI|40",
  "CESVOT|30",
  "MATCH NEW GENERATION|40",
  "Q DESIGNE|90",
  "STUDI MEDICI DEL LAVORO|120",
  "COND.BONAINI 75/79|50",
  "COND.SILVESTRO 20|40",
  "COND.SILVESTRO 16|90",
  "COND.SANTE TANI 5/7|50",
  "COND.PIAVE 86|60",
  "COND.PIAGGE 13|50",
  "COND.OBERDAN 5/17|60",
  "COND.NAPOLI 35|20",
  "COND.MAZZINI 35|60",
  "COND.GUIDICCIONI 4|30",
  "COND.SANCASCIANI 43|20",
  "COND.B. PADULE 12|40",
  "COND.ALDO MORO 1|30",
  "COND.SANT'EFISIO E POTITO 8|30",
  "COND.PIAZZA D'ANCONA 8|80",
  "COND.PIAZZA D'ANCONA 3|40",
  "COND.CURTATONE E MONTANARA 28|80",
  "COND.PAVESE 30|50",
  "COND.24 MAGGIO 36|25",
  "COND.BAGNI CAPPUCCINI 6|30",
  "POSTA ELISA|40",
  "LAVAZZA|120",
  "TESECO BONIFICHE SRL|90",
  "FACILE ENERGIA|60",
  "UFFICIO HR|120",
  "GIADIL|160",
  "GIADIL PONTEDERA|60",
  "SPAZIO BENESSERE MEDICAL SPORT|60",
  "CENTRO MEDICO SPAZIO BENESSERE|80",
  "CENTRO MEDICO SPAZIO BENESSERE - RIPASSO|30",
  "STUDI MEDICI SPAZIO BENESSERE|50",
  "METALLICA SRL|60",
  "ACLI NAVACCHIO|40",
  "ACLI CASCINA|60",
  "ACLI GHEZZANO|60",
  "ACLI CISANELLO|60",
  "ACLI PISA|100",
  "ACLI PISA MESNILE|50",
  "ACLI CISANELLO 2|30",
  "AGENZIA VIAGGI|50",
  "PALESTRA|300",
  "PALESTRA SETTIMANALE|90",
  "STUDIO COMMERCIALE CURINI|150",
  "COMMERCIALISTI ASSOCIATI|60",
  "ETICHETTERIA|75",
  "ZIMBRAVIDEO|90",
  "MARALE|90",
  "IL FIENILE|180",
  "ALTERNATIVA IMPIANTI|90",
  "LIPPERT|180",
  "FEDELI|75",
  "CIMED|90",
  "ESSENZE D'ARREDO|60",
  "GINNASIA|100"
];

export const bnb = [
  "Check-Out|30",
  "Check-Out_CameraGrande|60",
  "Refresh|10",
  "Refresh Approfondito|15",
  "Area Comune|10"
];

export const lorenza = [
  {
    nome: "Ranieri",
    indirizzo: "Piazza Vittorio Locchi 5, Pisa",
    ospiti: 2,
    composizione: ["1 Letto Matrimoniale", "1 Bagni", "1 Cucina"],
    ore: 1,
    mappa: "https://maps.app.goo.gl/FAHcRrY2do67F2Ud9",
    note: [
      "se trovate soldi o chiavi, metteteli nei cassetti",
      "Piano Terra",
      "Come arrivare<a href='DescrizioneAppartamenti/ranieri.html' class='btn btn-custom-2 btn-lg text-white btn-custom ripple'>INFO</a>",
    ],
  },
  {
    nome: "Laura",
    indirizzo: "via Risorgimento 10",
    ospiti: 2,
    composizione: ["1 Letto Matrimoniale", "1 Bagni", "1 Cucina"],
    ore: 1,
    mappa: "https://maps.app.goo.gl/CacThjjgy8VPJCjc7",
    note: [
      "se trovate soldi o chiavi, metteteli nei cassetti",
      "Come arrivare<a href='DescrizioneAppartamenti/laura.html' class='btn btn-custom-2 btn-lg text-white btn-custom ripple'>INFO</a>",
    ],
  },
  {
    nome: "Kinzica",
    indirizzo: "Via Bovio 9, Pisa",
    ospiti: 2,
    composizione: ["1 Letto Matrimoniale", "1 Bagni", "1 Cucina"],
    ore: 1,
    mappa: "https://maps.app.goo.gl/zTRNQmcaFB361diX6",
    note: [
      "se trovate soldi o chiavi, metteteli nei cassetti",
      "KeyBox: 1995",
      "Come arrivare<a href='DescrizioneAppartamenti/kinzica.html' class='btn btn-custom-2 btn-lg text-white btn-custom ripple'>INFO</a>",
    ],
  },
  {
    nome: "Pampurio",
    indirizzo: "Piazza del Pozzetto 7,Pisa",
    ospiti: 3,
    composizione: [
      "1 Letto Matrimoniale",
      "1 Letto Singolo",
      "1 Bagni",
      "1 Cucina",
    ],
    ore: 1,
    mappa: "https://maps.app.goo.gl/C9AvkD98hGdh7Kxc7",
    note: [
      "se trovate soldi o chiavi, metteteli nei cassetti",
      "Come arrivare<a href='DescrizioneAppartamenti/pampurio.html' class='btn btn-custom-2 btn-lg text-white btn-custom ripple'>INFO</a>",
    ],
  },
  {
    nome: "Pinuccio",
    indirizzo: "via dell’omodarme 43,Pisa",
    ospiti: 4,
    composizione: [
      "1 Letto Matrimoniale",
      "1 Divano Letto",
      "1 Bagni",
      "1 Cucina",
    ],
    ore: 1,
    mappa: "https://maps.app.goo.gl/Y7qaRWkZNbFEghNm9",
    note: [
      "se trovate soldi o chiavi, metteteli nei cassetti",
      "Come arrivare<a href='DescrizioneAppartamenti/pinuccio.html' class='btn btn-custom-2 btn-lg text-white btn-custom ripple'>INFO</a>",
      "KeyBox: 1995",

    ],
  },

    {
    nome: "Ella",
    indirizzo: "Via Omodeo 3,Pisa",
    ospiti: 4,
    composizione: [
      "1 Letto Matrimoniale",
      "1 Divano Letto",
      "1 Bagni",
      "1 Cucina",
    ],
    ore: 1,
    mappa: "https://maps.app.goo.gl/1gLpnamEp5PU5eER8",
    note: [
      "se trovate soldi o chiavi, metteteli nei cassetti",
      "Come arrivare<a href='DescrizioneAppartamenti/ella.html' class='btn btn-custom-2 btn-lg text-white btn-custom ripple'>INFO</a>",
      "KeyBox: 1971",

    ],
  },
];

export const irene = [
  {
    nome: "Le Mura",
    indirizzo: "Via Cardinale Maffi 36, Pisa",
    ospiti: 4,
    composizione: ["2 Letti Matrimoniali", "1 Bagno", "1 Cucina"],
    ore: 1,
    mappa: "https://www.google.com/maps?q=Via+Cardinale+Maffi+36,+Pisa",
    note: [
      "KeyBox 9953",
      "KeyBox Posta: 000",
      "<a href='https://lemura.pythonanywhere.com' class='btn btn-custom-2 btn-lg text-white btn-custom ripple'>Apertura cancello</a>",
      "Nome: guest",
      "Password: Maffi36",
    ],
  },
  {
    nome: "Torre",
    indirizzo: "Via Risorgimento 10, Pisa",
    ospiti: 5,
    composizione: [
      "2 Letti Matrimoniali",
      "1 Letto Singolo",
      "2 Bagni",
      "1 Cucina",
    ],
    ore: 1.5,
    mappa:
      "https://www.google.com/maps/place/Via+Risorgimento,+10,+56126+Pisa+PI/@43.7180123,10.3916741,17z/data=!3m1!4b1!4m6!3m5!1s0x12d5910aa5c87a69:0x5e9870a1bd95ec48!8m2!3d43.7180123!4d10.394249!16s%2Fg%2F11c5q84cys?entry=ttu",
    note: ["KeyBox cassetta postale: 000"],
  },

  {
    nome: "La Casa di Rosa",
    indirizzo: "Via Mazzini 35, Migliarino, Pisa",
    ospiti: 4,
    composizione: [
      "1 Letto Matrimoniale",
      "2 Letti Singoli (da poter unire e far diventare un matrimoniale)",
      "1 Bagno",
      "1 Cucina",
      "Spazio esterno",
    ],
    ore: 1.5,
    mappa:
      "https://www.google.com/maps/place/Via+Mazzini,+35,+56019+Migliarino+PI/@43.7662855,10.3390043,17z/data=!3m1!4b1!4m9!1m2!2m1!1sVia+Mazzini+35,+Migliarino,+Pisa!3m5!1s0x12d5974e83300571:0xfebac7ef21a55649!8m2!3d43.7662856!4d10.3438752!15sCiBWaWEgTWF6emluaSAzNSwgTWlnbGlhcmlubywgUGlzYZIBEGdlb2NvZGVkX2FkZHJlc3PgAQA?entry=ttu",
    note: ["KeyBox cancello 19511", "KeyBox porta 1951"],
  },

  {
    nome: "Casa Lia",
    indirizzo: "Via Santa Caterina n.6, Pisa",
    ospiti: 4,
    composizione: [
      "1 Letto Matrimoniale",
      "1 Divano letto matrimoniale",
      "1 Bagno",
      "1 Cucina",
    ],
    ore: 1.5,
    mappa: "https://maps.app.goo.gl/KHWLnAwiLNiRubgWA",
    note: [
      "Codice apertura portone: 111067#",
      "KeyBox sul cancello di ferro:1110",
      "Ultimo Piano",
      "Come arrivare<a href='DescrizioneAppartamenti/casaLia.html' class='btn btn-custom-2 btn-lg text-white btn-custom ripple'>INFO</a>",
    ],
  },

  /*      {
      nome: "Orsini",
      indirizzo: "Lungarno Galilei 7, Pisa",
      ospiti: 2,
      composizione: ["1 Letto Matrimoniale", "1 Bagno", "1 Cucina"],
      ore: 1,
      mappa: "https://goo.gl/maps/PhTiUcbJ2udK37FU9",
      note: ["KeyBox: 4891", "Come arrivare e video KeyBox <a href='DescrizioneAppartamenti/lungarno.html' class='btn btn-custom-2 btn-lg text-white btn-custom ripple'>INFO</a>"]
    },
 
          {
      nome: "Ortensie",
      indirizzo: "Via Buozzi 4, Pontasserchio, Pisa",
      ospiti: 6,
      composizione: ["1 Letto Matrimoniale", "4 Letti Singoli", "2 Bagni", "1 Cucina"],
      ore: 2.5,
      mappa: "https://www.google.com/maps/place/56017,+Via+B.+Buozzi+Sant'Andrea+Pescaiola,+4,+56011+San+Giuliano+Terme+PI/@43.77644,10.3976001,17z/data=!3m1!4b1!4m6!3m5!1s0x12d59a817d03ffff:0xfde2ec02dbd4273a!8m2!3d43.77644!4d10.400175!16s%2Fg%2F11snpbvmpz?entry=ttu",
      note: ["KeyBox 2468"]
    },
    
          {
      nome: "Sunny",
      indirizzo: "Via Leonardo Da Vinci 5, Pisa",
      ospiti: 4,
      composizione: ["2 Letti Matrimoniali", "2 Letti Singoli", "1 Bagno", "1 Cucina"],
      ore: 1.5,
      mappa: "https://www.google.com/maps?q=Via+Leonardo+Da+Vinci+5,+Pisa",
      note: ["KeyBox 4492", "La chiave dello sgabuzzino si trova sopra il contatore della luce"]
    },
 
          {
      nome: "Inbetween",
      indirizzo: "Via don Gaetano Boschi 20, Pisa",
      ospiti: 3,
      composizione: ["2 Letti Matrimoniali", "1 Bagno", "1 Cucina"],
      ore: 1,
      mappa: "https://www.google.com/maps/place/Via+Don+Gaetano+Boschi,+20,+56126+Pisa+PI/@43.7208646,10.3952614,17z/data=!3m1!4b1!4m6!3m5!1s0x12d591a126a57dbd:0xdc9cab66029a825d!8m2!3d43.7208646!4d10.3978363!16s%2Fg%2F11c5l585sj?entry=ttu",
      note: ["KeyBox 7514"]
    },
    */
];

export const cerrano = [
  {
    nome: "Tuscany House",
    indirizzo: "Via del Tondo 3, Pisa, Pisa",
    ospiti: 5,
    composizione: [
      "1 Letto Matrimoniale",
      "1 Letto Singolo",
      "1 Divano Letto Matrimoniale",
      "2 Bagni (uno senza doccia)",
      "1 Cucina",
    ],
    ore: 2,
    mappa:
      "https://www.google.com/maps/dir//Via+del+Tondo,+3,+56124+Pisa+PI/@43.701052,10.4301216,17z/data=!4m9!4m8!1m0!1m5!1m1!1s0x12d591fb907f2cb9:0xab9ae8f91d8a4c55!2m2!1d10.4326965!2d43.701052!3e0?entry=ttu",
    note: [
      "METTERE BIDET",
      "KeyBox: 5-5-6-6",
      "Se trovate soldi o contratti, lasciare tutti nello stanzone dove ci sono i cambi biancheria",
    ],
  },
  {
    nome: "new house",
    indirizzo: "Via Francesco Pardi 16, Pisa, Pisa",
    ospiti: 4,
    composizione: ["2 Letti Matrimoniali", "1 Bagno", "1 Cucina"],
    ore: 1.5,
    mappa: "https://goo.gl/maps/ZPmfF4LNYk3zRMUR7",
    note: [
      "METTERE BIDET, L'APPARTAMENTO È AL SECONDO PIANO",
      "Keybox: 1-9-7-3",
    ],
  },
  {
    nome: "3 in uno",
    indirizzo: "Via Di Mezzana 11, Pisa, Pisa",
    ospiti: "2-1-3",
    composizione: [
      "Mimosa: 1 Letto Matrimoniale, 1 Bagno, Ospiti: 2, KeyBox: 1-1-1-2",
      "Gelsomino: 1 Letto Singolo che diventa matrimoniale, 1 Bagno, Ospiti: 1, KeyBox: 3-3-3-4",
      "Girasole: 1 Letto Matrimoniale, 1 Letto Singolo (da fare solo con 3 ospiti), 1 Bagno, Ospiti: 3, KeyBox: 0-0-1-1",
      "Cucina comune",
      "Appartamento Completo: 3 Letti Matrimoniali, 1 Letto Singolo, 3 Bagni, 1 Cucina, Ospiti: 7",
    ],
    ore: "0,5 a camera/1,5 per appartamento completo",
    mappa: "https://goo.gl/maps/TW6R1tfcMebjL81DA",
    note: [
      "METTERE BIDET",
      "Sono 3 camere con bagno privato in un unico appartamento, va fatta la pulizia della camera, del bagno e della cucina",
      "Edificio 11, suonare a CATANIA (il portone si apre), salire al secondo piano, ultima porta sulla destra (ci sono le 3 KeyBox)",
      "Se trovate soldi o contratti, lasciare tutto in garage (è l'unico con la cassetta postale)",
    ],
  },
  {
    nome: "Designer Flat",
    indirizzo: "Via Italo bargagna 38, Pisa, Pisa",
    ospiti: 4,
    composizione: [
      "1 Letto Matrimoniale",
      "1 Divano Letto Matrimoniale",
      "1 Bagno",
      "1 Cucina",
    ],
    ore: 1.5,
    mappa: "https://maps.app.goo.gl/oRMVWxB117Un5WsK6",
    note: [
      "METTERE BIDET, L'APPARTAMENTO È AL SECONDO PIANO INTERNO 10, Mettere Bidet",
      "Keybox: 8-8-8-7",
    ],
  },
  {
    nome: "homiday elegant",
    indirizzo: "Via Andrea Vesalio, 8",
    ospiti: 7,
    composizione: ["3 Letti Matrimoniali", "2 Bagni", "1 Cucina"],
    ore: 2,
    mappa: "https://maps.app.goo.gl/MbZimuDkcq1vobBJ6",
    note: [
      "Terzo piano interno 8 Campanello 'Lista'",
      "Mettere Bidet",
      "Keybox: 2-1-2-1",
    ],
  },
  {
    nome: "Apt Ospedale",
    indirizzo: "Via Luigi Pera, 14",
    ospiti: 4,
    composizione: [
      "1 Letto Matrimoniale",
      "1 Divano Letto Matrimoniale",
      "1 Bagno",
      "1 Cucina",
    ],
    ore: 1,
    mappa:
      "https://www.google.it/maps/place/Via+Luigi+Pera,+14,+56124+Pisa+PI/@43.7079896,10.4362853,17z/data=!3m1!4b1!4m6!3m5!1s0x12d591e21adbf6d5:0x3ce5c8155fb7b30f!8m2!3d43.7079858!4d10.4388602!16s%2Fg%2F11c281k30j?entry=ttu",
    note: ["Mettere Bidet", "Keybox: 8 - 0 - 8 - 0"],
  },
  {
    nome: "New apt",
    indirizzo: "Via taddei, 15",
    ospiti: 4,
    composizione: [
      "1 Letto Matrimoniale",
      "1 Divano Letto Matrimoniale",
      "1 Bagno",
      "1 Cucina",
    ],
    ore: 1,
    mappa: "https://maps.app.goo.gl/DQ69W7NAT3r5Dq439",
    note: [
      "Mettere Bidet",
      "Piano Secondo Interno 9",
      "Keybox: 2-0-0-4",
      "Quando fate il divano letto, mettete il <a href='images/newApt/topper.jpg' class='btn btn-custom-2 btn-lg text-white btn-custom ripple'>TOPPER</a> che poi quando lo sfate andrà riposto dove lo avete preso e richiuso con le cinghie",
    ],
  },
  {
    nome: "Pontasserchio",
    indirizzo: "Via F.Cilea, 18, Pontasserchio",
    ospiti: 12,
    composizione: [
      "Savana: 1 Letto Matrimoniale, 1 Divano Letto Matrimoniale, 1 Bagno, 1 Cucina, Ospiti: 4, Keybox: 1-1-2-2",
      "Rinoceronte: 1 Letto Matrimoniale, 1 Divano Letto Matrimoniale, 1 Bagno, 1 Cucina, Ospiti: 4, Keybox: 2-2-3-3",
      "Giraffa: 1 Letto Matrimoniale, 1 Divano Letto Matrimoniale, 1 Bagno, 1 Cucina, Ospiti: 4, Keybox: 3-3-4-4",
    ],
    ore: 1,
    mappa: "https://maps.app.goo.gl/F2ZG1inS1oJ4gmyN9",
    note: [
      "Mettere Bidet",
      "Interno 1, 2, 3",
      "Le scale se molto sporche chiedere prima a noi e fare scale (30min extra)",
    ],
  },
  {
    nome: "Charme And Relax",
    indirizzo: "vicolo del Poschi 15, Pisa",
    ospiti: 4,
    composizione: [
      "1 Letto Matrimoniale",
      "1 Divano Letto Matrimoniale",
      "1 Bagno",
      "1 Cucina",
    ],
    ore: 1,
    mappa: "https://maps.app.goo.gl/xU2jgT9ZtodDCaSM6",
    note: [
      "Mettere Bidet",
      "Keybox:2020 ",
      "Codice Portone:1 5 1 5 #",
      "Parcheggiate al cinema odeno o in borgo stretto",
      "è un vicolo accanto al Bar 'Salza'",
      "Come arrivare e video KeyBox <a href='DescrizioneAppartamenti/charm.html' class='btn btn-custom-2 btn-lg text-white btn-custom ripple'>INFO</a>",
    ],
  },
  {
    nome: "Nuovo&Grazioso",
    indirizzo: "Via Paolo VI 12,Cisanello",
    ospiti: 4,
    composizione: [
      "1 Letto Matrimoniale",
      "1 Divano Letto Matrimoniale",
      "1 Bagno",
      "1 Cucina",
    ],
    ore: 1,
    mappa: "https://maps.app.goo.gl/HfxGhaus8yGyTuDFA",
    note: ["Mettere Bidet", "Keybox:Cassetta postale con KeyBox 595"],
  },
  {
    nome: "VIA CAMPANIA 2 ",
    indirizzo: "Via Campaniaa 2, Cisanello ",
    ospiti: 4,
    composizione: [
      "1 Letto Matrimoniale",
      "1 Divano Letto Matrimoniale",
      "1 Bagno",
      "1 Cucina",
    ],
    ore: 1,
    mappa: "https://maps.app.goo.gl/W1GkNcb46WKJkdys8",
    note: [
      "Mettere Bidet",
      "Piano Primo",
      "Keybox:9-8-7-6 (Cassettapostale con etichetta rossa)",
    ],
  },

  {
    nome: "Cozy House ",
    indirizzo: "Via Taddei 1, Cisanello ",
    ospiti: 3,
    composizione: [
      "1 Letto Matrimoniale",
      "1 Divano Letto Singolo",
      "1 Bagno",
      "1 Cucina",
    ],
    ore: 1,
    mappa: "https://maps.app.goo.gl/iYX7rNfKd9PRQ7xG6",
    note: [
      "Mettere Bidet",
      "Keybox: Cassetta postale :'Salinari' 7-8-7-8 ",
      " 2 piano , INT. 8",
    ],
  },

  {
    nome: "Sweet Home",
    indirizzo: "vicolo del poschi 15, Pisa ",
    ospiti: 4,
    composizione: [
      "1 Letto Matrimoniale",
      "1 Divano Letto Matrimoniale",
      "1 Bagno",
      "1 Cucina",
    ],
    ore: 1,
    mappa: "https://maps.app.goo.gl/xU2jgT9ZtodDCaSM6",
    note: [
      "Mettere Bidet",
      "Keybox:2 - 5 - 0 - 5",
      "  piano 1, INT.4 "
    ],
  },
  {
    nome: "Flat Moderno",
    indirizzo: "Via Italo bargagna 38, Pisa, Pisa",
    ospiti: 4,
    composizione: [
      "1 Letto Matrimoniale",
      "1 Divano Letto Matrimoniale",
      "1 Bagno",
      "1 Cucina",
    ],
    ore: 1,
    mappa: "https://maps.app.goo.gl/oRMVWxB117Un5WsK6",
    note: [
      "METTERE BIDET ", "L'APPARTAMENTO È AL QUARTO PIANO INTERNO 23",
      "Keybox: 1711 ",
    ],
  },
];

export const alarmData = {
  general: [
    { name: "Codice KeyBox HR", code: "0224" },
    { name: "Aforisma", code: "OFF:3623* ON:*1" },
    { name: "Dima", code: "2807*" },
    { name: "Q-Designe (ESA)", code: "Off: 98753 🔓- On: 98753 🔒" },
    { name: "SPAZIO BENESSERE NOVELLA", code: "OFF: F1 1991 ok - ON: F1 1991 ok" },
    { name: "SPAZIO BENESSERE SANIFICAZIONE CASCINA", code: "OFF: F1 172627 OK - ON:F2 172627 OK" },
    { name: "TESECO", code: "2580" },
    { name: "UFFICIO START", code: "250109 ON/OFF" },
    { name: "DISCOTECA", code: "02082 no" },
    { name: "AGENZIA VIAGGI", code: "776211" },
    { name: "B&B 1", code: "0225E" },
    { name: "B&B 2", code: "0325E" },
    { name: "B&B 3", code: "0824E" }
  ],
  acli: [
    { location: "Pisa", code: "Inserire:67546 / Disinserire:675461" },
    { location: "Cascina", code: "Inserire: 2 volte ON / Disinserire: 113355" },
    { location: "Navacchio", code: "No allarme" },
    { location: "Cisanello", code: "Inserire: 12302 🔓 / Disinserire: 12302 🔒" },
    { location: "Ghezzano", code: "No allarme" }
  ]
};

export const bnbNomi = [
  "Dalmazia",
  "Martiri",
  "C_Grande",
  "C_Piccola"
];

export const molino = [
  {
    nome: "Paola",
    indirizzo: "località dogana del tiglio, 56032 Buti PI",
    ospiti: 2,
    composizione: ["1 Letto Matrimoniale", "1 Bagni", "1 Cucina"],
    ore: 1.5,
    mappa: "https://maps.app.goo.gl/bawvCXP6JoSvp9fGA",
    note: [
      "La biancheria la trovata alla struttura",
      "Codice cancello 2410e",
    ],
  },

    {
    nome: "Sabina",
    indirizzo: "località dogana del tiglio, 56032 Buti PI",
    ospiti: 2,
    composizione: ["1 Letto Matrimoniale", "1 Bagni", "1 Cucina"],
    ore: 1.5,
    mappa: "https://maps.app.goo.gl/bawvCXP6JoSvp9fGA",
    note: [
      "La biancheria la trovata alla struttura",
      "Codice cancello 2410e",
    ],
  },
  
];
