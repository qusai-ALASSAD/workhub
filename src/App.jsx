import { useState, useRef, useEffect } from "react";

// ══════════════════════════════════════════════════════════════════
// ██████  APP CONFIG — Edit this section to rebrand for any domain
// ══════════════════════════════════════════════════════════════════
const APP_CONFIG = {
  // --- Branding ---
  appName:    "EMS WorkHub",            // App name shown everywhere
  appSubtitle:"Bau & Gebäudereinigung", // Subtitle under app name
  logoIcon:   "🏠",                     // Emoji logo

  // --- Company Info (shown in PDFs & sidebar) ---
  companyName:   "EMS Bau & Gebäudereinigung UG",
  companyAddress:"Wandesbeker Chaussee 19, 22089 Hamburg",
  companyPhone:  "0157/33096090",
  companyEmail:  "service@ems-handwerk.de",
  companyHours:  "Mo–Fr 10–18 Uhr",
  companyCity:   "Hamburg",

  // --- Support & Platform ---
  supportCompany:"Ovivo",
  supportUrl:    "https://ovivo.io",
  supportEmail:  "hallo@ovivo.io",
  supportPhone:  "+49 176 56565322",
  supportHours:  "Mo–Fr, 9–18 Uhr",
  supportNote:   "Antwort in < 24h",

  // --- Theme colors (hex) ---
  primaryColor: "#0D3B6E",  // Navy blue
  accentColor:  "#F5831F",  // Orange

  // --- Feature flags (true = enabled) ---
  features: {
    repairs:   true,
    tasks:     true,
    messages:  true,
    feed:      true,
    gallery:   true,
    projects:  true,
    schedule:  true,
    warehouse: true,
    reports:   true,
  },
};
// ══════════════════════════════════════════════════════════════════

const C={navy:"#0D3B6E",navyDark:"#092D55",navyLight:"#E8F0F9",orange:"#F5831F",orangeLight:"#FEF0E3",bg:"#F2F5F9",border:"#DDE4EE",text:"#0D1F35",sub:"#5A7090",green:"#059669",greenL:"#F0FDF4",red:"#DC2626",redL:"#FEF2F2",yellow:"#D97706",yellowL:"#FFFBEB",purple:"#7C3AED",purpleL:"#F5F3FF"};

const ALL_PERMS=[
  {key:"repairs",  label:"Aufträge & Wartung",  icon:"🔧"},
  {key:"tasks",    label:"Aufgaben",             icon:"✓"},
  {key:"messages", label:"Nachrichten",          icon:"✉"},
  {key:"feed",     label:"Team-Feed",            icon:"◉"},
  {key:"gallery",  label:"Fotogalerie",          icon:"📷"},
  {key:"projects", label:"Projekte",             icon:"🏗"},
  {key:"schedule", label:"Arbeitsplan",          icon:"📅"},
  {key:"warehouse",label:"Lager & Material",     icon:"📦"},
  {key:"reports",  label:"Berichte & PDF",       icon:"📋"},
];

const FULL={repairs:true,tasks:true,messages:true,feed:true,gallery:true,projects:true,schedule:true,warehouse:true,reports:true};
const DEF ={repairs:true,tasks:true,messages:true,feed:true,gallery:true,projects:true,schedule:false,warehouse:false,reports:false};
// Partner: sees ONLY their own projects — no internal data
const PARTNER_PERMS={repairs:false,tasks:false,messages:true,feed:false,gallery:true,projects:true,schedule:false,warehouse:false,reports:false};

const ROLE_CFG={
  admin:  {label:"Manager",    icon:"👑",color:C.orange,  bg:C.orangeLight},
  it:     {label:"IT Support", icon:"🖥",color:C.purple,  bg:C.purpleL},
  va:     {label:"Vorarbeiter",icon:"👥",color:"#2563EB", bg:"#EFF6FF"},
  ma:     {label:"Mitarbeiter",icon:"👤",color:C.sub,     bg:"#F9FAFB"},
  hotel:  {label:"Hotel Staff",icon:"🏨",color:"#0891B2", bg:"#F0F9FF"},
  partner:{label:"Partner",    icon:"🤝",color:"#059669", bg:"#F0FDF4"},
};

const DEPTS=["Bauhandwerk","Trockenbau","Reinigung","Kabelverlegen","Rezeption","Leitung","IT","Hotel","Extern"];
const ENTITIES=["EMS Hamburg","EMS Zentrale Hamburg","Hotel Hamburg","EMS System","Kunde GmbH"];
const DAYS=["Mo","Di","Mi","Do","Fr","Sa","So"];
const WDAYS=["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"];
const SHIFTS_C={
  work:    {bg:"#E8F0F9",color:C.navy,  label:"Arbeit"},
  off:     {bg:"#F9FAFB",color:C.sub,   label:"Frei"},
  vacation:{bg:"#FEF3C7",color:"#92400E",label:"Urlaub"},
  sick:    {bg:C.redL,   color:C.red,   label:"Krank"},
};
const MAT_UNITS=["Stk","Kg","L","m²","m","Pkg","Rolle","Eimer","Box","Palette"];
const MAT_CATS=["Bau","Boden","Wand","Werkzeug","Reinigung","Elektro","Sanitär","Sonstige"];

const INIT_USERS=[
  {id:1,name:"Elsaid Mahmoud",   role:"admin",  dept:"Leitung",    entity:"EMS Zentrale Hamburg",avatar:"EM",color:C.orange,  active:true,pin:"1234",perms:FULL},
  {id:2,name:"Support Admin",    role:"it",     dept:"IT",         entity:"EMS System",          avatar:"IT",color:C.purple,  active:true,pin:"9999",perms:FULL},
  {id:3,name:"Leon Weber",       role:"va",     dept:"Bauhandwerk",entity:"EMS Hamburg",         avatar:"LW",color:"#2563EB", active:true,pin:"1111",perms:{...DEF,reports:true}},
  {id:4,name:"Sara Demir",       role:"va",     dept:"Reinigung",  entity:"EMS Hamburg",         avatar:"SD",color:"#0891B2", active:true,pin:"2222",perms:DEF},
  {id:5,name:"Mehmet Yilmaz",    role:"ma",     dept:"Bauhandwerk",entity:"EMS Hamburg",         avatar:"MY",color:C.navy,    active:true,pin:"3333",perms:{repairs:true,tasks:true,messages:true,feed:true,gallery:true,projects:true,schedule:false,warehouse:false,reports:false}},
  {id:6,name:"Klaus Bauer",      role:"ma",     dept:"Trockenbau", entity:"EMS Hamburg",         avatar:"KB",color:"#1A5C9A", active:true,pin:"4444",perms:{repairs:true,tasks:true,messages:true,feed:true,gallery:false,projects:true,schedule:false,warehouse:false,reports:false}},
  {id:7,name:"Anna Schmidt",     role:"ma",     dept:"Reinigung",  entity:"EMS Hamburg",         avatar:"AS",color:C.green,   active:true,pin:"5555",perms:{repairs:true,tasks:true,messages:true,feed:true,gallery:true,projects:true,schedule:false,warehouse:false,reports:false}},
  {id:8,name:"Panter",           role:"partner",dept:"Extern",     entity:"Hotel Hamburg",       avatar:"PA",color:"#0891B2", active:true,pin:"7777",perms:PARTNER_PERMS},
  {id:9,name:"Kunde Demo",       role:"partner",dept:"Extern",     entity:"Kunde GmbH",          avatar:"KD",color:"#059669", active:true,pin:"8888",perms:PARTNER_PERMS},
];

const INIT_PROJECTS=[
  {id:1,name:"Trockenbau Wandesbeker Str.",location:"Wandesbeker Chaussee 19",entity:"EMS Hamburg",responsibleId:3,
   editableBy:[1,2,3],visibleTo:[1,2,3,5,6],
   status:"active",startDate:"01.05.2026",endDate:"15.05.2026",
   area:120,rooms:3,floors:1,expectedHours:80,notes:"3 neue Trennwände, Bürobereich",
   materials:[
     {id:1,name:"Trockenbauplatten",qty:40,unit:"Stk",pricePerUnit:8.50,total:340,supplier:"Bauhaus GmbH",deliveryDate:"02.05.2026",status:"geliefert",note:"Standard 12,5mm"},
     {id:2,name:"Spachtelmasse",    qty:10,unit:"Kg", pricePerUnit:5.80,total:58, supplier:"OBI Hamburg",  deliveryDate:"02.05.2026",status:"geliefert",note:""},
   ],
   requests:[
     {id:1,material:"Schrauben 4x40mm",qty:100,unit:"Pkg",urgency:"normal",  by:5,date:"03.05.2026",status:"ausstehend",note:"Für zweite Wand"},
     {id:2,material:"Schutzfolie",      qty:5,  unit:"Rolle",urgency:"dringend",by:6,date:"03.05.2026",status:"genehmigt",note:"Bodenschutz"},
   ],
   worklog:[
     {userId:5,date:"03.05.2026",start:"07:30",end:"15:00",hours:7.5,note:"Wand 1 fertig"},
     {userId:6,date:"03.05.2026",start:"08:00",end:"16:00",hours:8,note:"Dämmung eingebaut"},
   ],
   stopReason:"",totalCost:398},

  {id:2,name:"Grundreinigung Bürokomplex Hamm",location:"Hamm-Süd, Hamburg",entity:"Hotel Hamburg",responsibleId:4,
   editableBy:[1,2,4],visibleTo:[1,2,4,7,8],
   status:"stopped",startDate:"02.05.2026",endDate:"10.05.2026",
   area:800,rooms:12,floors:4,expectedHours:60,notes:"Wöchentliche Grundreinigung",
   materials:[
     {id:1,name:"Reinigungsmittel",qty:15,unit:"L",pricePerUnit:4.50,total:67.50,supplier:"Profex GmbH",deliveryDate:"01.05.2026",status:"geliefert",note:"pH-neutral"},
   ],
   requests:[
     {id:1,material:"Reinigungsmittel Typ B",qty:20,unit:"L",urgency:"dringend",by:7,date:"03.05.2026",status:"ausstehend",note:"Typ A reicht nicht für Böden"},
   ],
   worklog:[
     {userId:7,date:"03.05.2026",start:"09:00",end:"14:00",hours:5,note:"Etage 1 & 2 fertig"},
   ],
   stopReason:"Material fehlt: Reinigungsmittel Typ B nicht vorhanden",totalCost:67.50},

  {id:3,name:"Laminat verlegen Eilbek",location:"Eilbek, Hamburg",entity:"EMS Hamburg",responsibleId:3,
   editableBy:[1,2,3],visibleTo:[1,2,3,5],
   status:"done",startDate:"28.04.2026",endDate:"30.04.2026",
   area:65,rooms:3,floors:1,expectedHours:16,notes:"65 m² Laminat, 3 Zimmer",
   materials:[
     {id:1,name:"Laminat 8mm",qty:70,unit:"m²",pricePerUnit:12.00,total:840,supplier:"Flooring GmbH",deliveryDate:"28.04.2026",status:"geliefert",note:"10% Verschnitt"},
     {id:2,name:"Trittschalldämmung",qty:70,unit:"m²",pricePerUnit:3.50,total:245,supplier:"Flooring GmbH",deliveryDate:"28.04.2026",status:"geliefert",note:""},
   ],
   requests:[],
   worklog:[
     {userId:5,date:"30.04.2026",start:"08:00",end:"14:30",hours:6.5,note:"65 m² verlegt, fertig"},
   ],
   stopReason:"",totalCost:1085},
];

const INIT_TASKS=[
  {id:1,title:"Morgenschichtübergabe",    dept:"Leitung",    status:"done",       due:"03.05.2026",assignedTo:1,recurring:"Täglich",   checklist:[{text:"Aufträge geprüft",done:true},{text:"Team eingeteilt",done:true}]},
  {id:2,title:"Werkzeugkontrolle",        dept:"Bauhandwerk",status:"open",        due:"05.05.2026",assignedTo:5,recurring:"Wöchentlich",checklist:[{text:"Elektrowerkzeug",done:false},{text:"Handwerkzeug",done:false}]},
  {id:3,title:"Reinigungsplan – Woche",   dept:"Reinigung",  status:"in-progress",due:"03.05.2026",assignedTo:7,recurring:"Wöchentlich",checklist:[{text:"Etage 1 & 2",done:true},{text:"Etage 3 & 4",done:false}]},
];
const INIT_MSGS=[
  {id:1,from:1,to:5,text:"Mehmet, bitte Wasserleck Zi. 204 heute erledigen!",time:"08:10",date:"03.05.2026",read:true},
  {id:2,from:8,to:1,text:"Hallo, die Reinigung in Etage 2 ist noch nicht fertig.",time:"09:30",date:"03.05.2026",read:false},
  {id:3,from:7,to:4,text:"Sara, Etage 1&2 fertig!",time:"11:30",date:"03.05.2026",read:true},
];
const INIT_FEED=[
  {id:1,author:1,type:"announcement",text:"🎉 5-Sterne-Bewertung von Familie Müller! Danke an das gesamte Team!",time:"08:00",date:"03.05.2026",likes:8,comments:[]},
  {id:2,author:8,type:"update",      text:"🏨 Hotel Hamburg: Zimmer 301-310 bereit für Reinigung nach Check-out.",time:"09:00",date:"03.05.2026",likes:2,comments:[]},
  {id:3,author:5,type:"repair",      text:"✅ Laminat Eilbek fertig – 65 m². Fotos hochgeladen.",time:"14:30",date:"30.04.2026",likes:5,comments:[{user:1,text:"Saubere Arbeit! 👍",time:"15:00"}]},
];
const REPAIR_TYPES=["Hausreparatur","Sanitär","Elektro","Klimaanlage","Reinigung","Trockenbau","Malerarbeiten","Sicherheit","Sonstiges"];
const INIT_REPAIRS=[
  {id:1,title:"Wasserleck – Zimmer 204",    room:"Zi. 204",  dept:"Bauhandwerk",type:"Sanitär",       status:"open",        priority:"urgent",assignedTo:5,reporter:8,createdAt:"01.05.2026",startTime:null,endTime:null,
   photos:{before:null,after:null},notes:"Tropfende Decke, Gast beschwert sich.",stopReason:"",
   materials:[],
   comments:[{user:1,text:"Bitte sofort erledigen!",time:"08:15"}]},
  {id:2,title:"Klimaanlage defekt – Lobby", room:"Lobby",    dept:"Bauhandwerk",type:"Klimaanlage",   status:"in-progress", priority:"medium",assignedTo:5,reporter:1,createdAt:"02.05.2026",startTime:"09:00",endTime:null,
   photos:{before:"uploaded",after:null},notes:"AC macht Geräusche seit gestern Abend.",stopReason:"",
   materials:[{name:"Kältemittel R32",qty:1,unit:"Flasche"},{name:"Dichtungsring",qty:2,unit:"Stk"}],
   comments:[{user:1,text:"Bitte Fotos nach Reparatur hochladen.",time:"09:05"},{user:5,text:"Bin dabei, brauche noch Kältemittel.",time:"09:30"}]},
  {id:3,title:"Leuchtmittel – 3. Etage",    room:"Etage 3",  dept:"Bauhandwerk",type:"Elektro",       status:"done",        priority:"low",   assignedTo:6,reporter:3,createdAt:"30.04.2026",startTime:"10:00",endTime:"11:30",
   photos:{before:"uploaded",after:"uploaded"},notes:"12 Leuchten erfolgreich ersetzt.",stopReason:"",
   materials:[{name:"LED E27 10W",qty:12,unit:"Stk"}],
   comments:[{user:3,text:"Gut gemacht Klaus!",time:"11:45"}]},
  {id:4,title:"Sanitär – Verstopfung WC",   room:"Zi. 312",  dept:"Reinigung",  type:"Sanitär",       status:"stopped",     priority:"high",  assignedTo:7,reporter:8,createdAt:"03.05.2026",startTime:"08:00",endTime:null,
   photos:{before:null,after:null},notes:"WC komplett verstopft.",stopReason:"Spezialwerkzeug fehlt – Rohrreinigungsspirale nicht vorhanden",
   materials:[],
   comments:[{user:7,text:"Kann ohne Spezialwerkzeug nicht weiter.",time:"08:45"}]},
  {id:5,title:"Türschloss defekt – Zi. 205",room:"Zi. 205",  dept:"Bauhandwerk",type:"Hausreparatur", status:"open",        priority:"urgent",assignedTo:5,reporter:8,createdAt:"03.05.2026",startTime:null,endTime:null,
   photos:{before:null,after:null},notes:"Gast kann Zimmer nicht abschließen.",stopReason:"",
   materials:[{name:"Schlosszylinder",qty:1,unit:"Stk"}],
   comments:[]},
];
const INIT_MATS=[
  {id:1,name:"Trockenbauplatten",unit:"Stk", qty:120,minQty:20,price:8.50, category:"Bau"},
  {id:2,name:"Schrauben 4x40mm", unit:"Pkg", qty:45, minQty:10,price:3.20, category:"Werkzeug"},
  {id:3,name:"Spachtelmasse",     unit:"Kg",  qty:80, minQty:15,price:5.80, category:"Bau"},
  {id:4,name:"Laminat 8mm",       unit:"m²",  qty:200,minQty:30,price:12.00,category:"Boden"},
  {id:5,name:"Reinigungsmittel",  unit:"L",   qty:8,  minQty:10,price:4.50, category:"Reinigung"},
];
const INIT_ORDERS=[
  {id:1,type:"eingang",material:"Trockenbauplatten",qty:50,unit:"Stk",supplier:"Bauhaus GmbH",date:"28.04.2026",status:"geliefert",  note:"",priceTotal:425},
  {id:2,type:"ausgang",material:"Laminat 8mm",      qty:65,unit:"m²", supplier:"Kunde Eilbek", date:"30.04.2026",status:"abgeschlossen",note:"",priceTotal:780},
  {id:3,type:"eingang",material:"Reinigungsmittel", qty:40,unit:"L",  supplier:"OBI Hamburg",  date:"02.05.2026",status:"ausstehend", note:"Lieferung erwartet",priceTotal:180},
];
// Schedule: week-based, each entry has userId, week (YYYY-WW), day (0-6), shift, type, hours
const INIT_SCHED=[
  // Week 19 (KW19) - userId 3 Leon Weber
  {id:1, userId:3,week:"2026-19",day:0,shift:"07:00–15:00",type:"work",hours:8},
  {id:2, userId:3,week:"2026-19",day:1,shift:"07:00–15:00",type:"work",hours:8},
  {id:3, userId:3,week:"2026-19",day:2,shift:"–",           type:"off", hours:0},
  {id:4, userId:3,week:"2026-19",day:3,shift:"07:00–15:00",type:"work",hours:8},
  {id:5, userId:3,week:"2026-19",day:4,shift:"07:00–15:00",type:"work",hours:8},
  // Week 19 - userId 5 Mehmet
  {id:6, userId:5,week:"2026-19",day:0,shift:"07:00–15:00",type:"work",hours:8},
  {id:7, userId:5,week:"2026-19",day:1,shift:"07:00–15:00",type:"work",hours:8},
  {id:8, userId:5,week:"2026-19",day:2,shift:"–",           type:"off", hours:0},
  {id:9, userId:5,week:"2026-19",day:3,shift:"07:00–15:30",type:"work",hours:8.5},
  {id:10,userId:5,week:"2026-19",day:4,shift:"07:00–15:00",type:"work",hours:8},
  // Week 19 - userId 7 Anna
  {id:11,userId:7,week:"2026-19",day:0,shift:"09:00–17:00",type:"work",hours:8},
  {id:12,userId:7,week:"2026-19",day:1,shift:"09:00–17:00",type:"work",hours:8},
  {id:13,userId:7,week:"2026-19",day:2,shift:"–",           type:"vacation",hours:0},
  {id:14,userId:7,week:"2026-19",day:3,shift:"09:00–17:00",type:"work",hours:8},
  {id:15,userId:7,week:"2026-19",day:4,shift:"–",           type:"sick",hours:0},
  // Week 19 - userId 6 Klaus
  {id:16,userId:6,week:"2026-19",day:0,shift:"08:00–16:00",type:"work",hours:8},
  {id:17,userId:6,week:"2026-19",day:1,shift:"08:00–16:00",type:"work",hours:8},
  {id:18,userId:6,week:"2026-19",day:2,shift:"08:00–16:00",type:"work",hours:8},
  {id:19,userId:6,week:"2026-19",day:3,shift:"–",           type:"off", hours:0},
  {id:20,userId:6,week:"2026-19",day:4,shift:"08:00–16:00",type:"work",hours:8},
  // Week 18 (previous week) for monthly stats
  {id:21,userId:3,week:"2026-18",day:0,shift:"07:00–15:00",type:"work",hours:8},
  {id:22,userId:3,week:"2026-18",day:1,shift:"07:00–15:00",type:"work",hours:8},
  {id:23,userId:3,week:"2026-18",day:2,shift:"07:00–15:00",type:"work",hours:8},
  {id:24,userId:3,week:"2026-18",day:3,shift:"07:00–15:00",type:"work",hours:8},
  {id:25,userId:3,week:"2026-18",day:4,shift:"07:00–15:00",type:"work",hours:8},
  {id:26,userId:5,week:"2026-18",day:0,shift:"07:00–15:00",type:"work",hours:8},
  {id:27,userId:5,week:"2026-18",day:1,shift:"07:00–15:00",type:"work",hours:8},
  {id:28,userId:5,week:"2026-18",day:2,shift:"07:00–15:00",type:"work",hours:8},
  {id:29,userId:5,week:"2026-18",day:3,shift:"–",           type:"vacation",hours:0},
  {id:30,userId:5,week:"2026-18",day:4,shift:"07:00–15:00",type:"work",hours:8},
  {id:31,userId:7,week:"2026-18",day:0,shift:"09:00–17:00",type:"work",hours:8},
  {id:32,userId:7,week:"2026-18",day:1,shift:"09:00–17:00",type:"work",hours:8},
  {id:33,userId:7,week:"2026-18",day:2,shift:"09:00–17:00",type:"work",hours:8},
  {id:34,userId:7,week:"2026-18",day:3,shift:"09:00–17:00",type:"work",hours:8},
  {id:35,userId:7,week:"2026-18",day:4,shift:"09:00–17:00",type:"work",hours:8},
];

const S={open:{label:"Offen",color:"#D97706",bg:"#FFFBEB",border:"#FDE68A"},"in-progress":{label:"In Bearbeitung",color:"#2563EB",bg:"#EFF6FF",border:"#BFDBFE"},done:{label:"Erledigt",color:"#059669",bg:"#F0FDF4",border:"#6EE7B7"},active:{label:"Aktiv",color:"#2563EB",bg:"#EFF6FF",border:"#BFDBFE"},stopped:{label:"Gestoppt",color:"#DC2626",bg:"#FEF2F2",border:"#FECACA"}};
const P={urgent:{label:"Dringend",color:"#DC2626",bg:"#FEF2F2"},high:{label:"Hoch",color:C.orange,bg:C.orangeLight},medium:{label:"Mittel",color:"#D97706",bg:"#FFFBEB"},low:{label:"Niedrig",color:C.sub,bg:"#F9FAFB"}};

// ── TINY COMPONENTS ───────────────────────────────────────────────
const Av=({u,size=34})=>{
  if(u?.photo) return <img src={u.photo} alt="" style={{width:size,height:size,minWidth:size,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:`2px solid ${u.color||"#ddd"}`}}/>;
  return <div style={{width:size,height:size,minWidth:size,borderRadius:"50%",background:u?.color||C.navy,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:size*.32,fontWeight:700,flexShrink:0}}>{u?.avatar}</div>;
};
const RB=({role})=>(<span style={{background:ROLE_CFG[role]?.bg,color:ROLE_CFG[role]?.color,borderRadius:5,padding:"1px 7px",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>{ROLE_CFG[role]?.icon} {ROLE_CFG[role]?.label}</span>);
const SB=({status})=>(<span style={{background:S[status]?.bg,color:S[status]?.color,border:`1px solid ${S[status]?.border}`,borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{S[status]?.label}</span>);
const PD=({priority})=>(<span style={{display:"inline-flex",alignItems:"center",gap:4,background:P[priority]?.bg,color:P[priority]?.color,borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}><span style={{width:6,height:6,borderRadius:"50%",background:P[priority]?.color,display:"inline-block"}}/>{P[priority]?.label}</span>);
const Tag=({children,color=C.navy,bg=C.navyLight})=>(<span style={{background:bg,color,borderRadius:5,padding:"2px 8px",fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{children}</span>);
const Lbl=({children})=>(<label style={{fontSize:11,fontWeight:700,color:C.sub,display:"block",marginBottom:4,letterSpacing:".4px"}}>{children}</label>);
const Inp=({...p})=>(<input {...p} style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:8,padding:"9px 11px",fontSize:13,background:C.bg,color:C.text,...p.style}}/>);
const Sel=({children,...p})=>(<select {...p} style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:8,padding:"9px 11px",fontSize:13,background:C.bg,color:C.text,...p.style}}>{children}</select>);
const Txt=({...p})=>(<textarea {...p} style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:8,padding:"9px 11px",fontSize:13,background:C.bg,color:C.text,resize:"none",...p.style}}/>);

const calcDur=(s,e)=>{try{const[sh,sm]=s.split(":").map(Number),[eh,em]=e.split(":").map(Number);const m=(eh*60+em)-(sh*60+sm);return m<0?"–":`${Math.floor(m/60)}h ${m%60}m`;}catch{return"–";}};
const totalHrs=wl=>wl.reduce((a,l)=>a+(l.hours||0),0);

function useW(){const[w,setW]=useState(typeof window!=="undefined"?window.innerWidth:1200);useEffect(()=>{const h=()=>setW(window.innerWidth);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);return w;}

// ── MODAL ─────────────────────────────────────────────────────────
function Modal({title,onClose,children,w=480}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(13,59,110,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:600,padding:14}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"#fff",borderRadius:16,padding:"18px 16px",width:"100%",maxWidth:w,maxHeight:"94vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(13,59,110,.3)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <h3 style={{fontSize:15,fontWeight:800,color:C.text}}>{title}</h3>
          <button onClick={onClose} style={{background:C.bg,color:C.sub,border:"none",borderRadius:6,width:26,height:26,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── SECTION ─────────────────────────────────────────────────────
function Sec({title,icon,children,collapsible=false}){
  const[open,setOpen]=useState(true);
  return(
    <div style={{background:C.bg,borderRadius:9,padding:"10px 12px",marginBottom:10,border:`1px solid ${C.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:open?8:0,cursor:collapsible?"pointer":"default"}} onClick={()=>collapsible&&setOpen(v=>!v)}>
        <div style={{fontSize:11,fontWeight:700,color:C.navy,letterSpacing:".4px"}}>{icon} {title}</div>
        {collapsible&&<span style={{color:C.sub,fontSize:12}}>{open?"▲":"▼"}</span>}
      </div>
      {open&&children}
    </div>
  );
}

// ── PDF ───────────────────────────────────────────────────────────
const pdfCSS=`
  body{font-family:Arial,sans-serif;font-size:12px;color:#0D1F35;margin:0;padding:0}
  .page{max-width:900px;margin:0 auto;padding:32px 36px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;border-bottom:4px solid #F5831F;margin-bottom:20px}
  .logo-box{display:flex;align-items:center;gap:12px}
  .logo-icon{width:44px;height:44px;background:#0D3B6E;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px}
  .app-name{font-size:20px;font-weight:800;color:#0D3B6E;line-height:1}
  .app-sub{font-size:10px;color:#5A7090;margin-top:3px}
  .meta-box{text-align:right;font-size:10px;color:#5A7090;line-height:1.8}
  .section{margin-bottom:22px}
  .section-title{font-size:11px;font-weight:700;color:#0D3B6E;letter-spacing:.6px;text-transform:uppercase;margin-bottom:10px;padding-bottom:5px;border-bottom:2px solid #E8F0F9}
  .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px}
  .kpi{background:#F2F5F9;border-radius:8px;padding:10px 12px;border-left:4px solid #0D3B6E}
  .kpi-val{font-size:20px;font-weight:800;color:#0D3B6E}
  .kpi-lbl{font-size:10px;color:#5A7090;margin-top:2px}
  .kpi.warn{border-left-color:#F5831F}.kpi.warn .kpi-val{color:#F5831F}
  .kpi.ok{border-left-color:#059669}.kpi.ok .kpi-val{color:#059669}
  .kpi.danger{border-left-color:#DC2626}.kpi.danger .kpi-val{color:#DC2626}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}
  .info-row{background:#F9FAFB;border-radius:6px;padding:7px 10px;display:flex;gap:8px}
  .info-lbl{font-size:10px;color:#5A7090;font-weight:700;min-width:90px}
  .info-val{font-size:12px;color:#0D1F35;font-weight:600}
  .stop-box{background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:10px 14px;margin-bottom:16px;display:flex;gap:10px}
  .stop-icon{font-size:20px}
  .stop-title{font-weight:700;color:#DC2626;font-size:12px}
  .stop-text{color:#DC2626;font-size:12px;margin-top:2px}
  .progress-bar-wrap{background:#E8F0F9;border-radius:4px;height:10px;margin:6px 0}
  .progress-bar-fill{height:100%;border-radius:4px;background:#F5831F}
  table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:6px}
  th{background:#0D3B6E;color:#fff;padding:7px 10px;text-align:left;font-size:10px;font-weight:700}
  td{padding:6px 10px;border-bottom:1px solid #E8F0F9}
  tr:nth-child(even) td{background:#F9FAFB}
  .total-row td{background:#E8F0F9;font-weight:700;color:#0D3B6E}
  .badge{display:inline-block;border-radius:4px;padding:2px 7px;font-size:10px;font-weight:700}
  .badge-ok{background:#F0FDF4;color:#059669}
  .badge-warn{background:#FFFBEB;color:#D97706}
  .badge-danger{background:#FEF2F2;color:#DC2626}
  .badge-blue{background:#EFF6FF;color:#2563EB}
  .badge-orange{background:#FEF0E3;color:#F5831F}
  .comment-box{background:#F9FAFB;border-radius:6px;padding:8px 11px;margin-bottom:6px;border-left:3px solid #0D3B6E}
  .comment-author{font-weight:700;color:#0D3B6E;font-size:11px}
  .comment-time{font-size:10px;color:#aaa;margin-left:6px}
  .comment-text{font-size:12px;color:#0D1F35;margin-top:3px}
  .footer{margin-top:28px;padding-top:12px;border-top:2px solid #E8F0F9;display:flex;justify-content:space-between;font-size:10px;color:#aaa}
  .checklist-item{display:flex;align-items:center;gap:8px;padding:4px 0}
  .check-box{width:14px;height:14px;border-radius:3px;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;flex-shrink:0}
  .check-done{background:#059669;color:#fff}
  .check-open{background:#fff;border:2px solid #DDE4EE;color:transparent}
`;

const pdfHeader=(meta,subtitle)=>`
  <div class="header">
    <div class="logo-box">
      <div class="logo-icon">${APP_CONFIG.logoIcon}</div>
      <div>
        <div class="app-name">${APP_CONFIG.appName}</div>
        <div class="app-sub">${APP_CONFIG.companyName} · ${APP_CONFIG.companyCity}</div>
      </div>
    </div>
    <div class="meta-box">
      <div style="font-size:13px;font-weight:700;color:#0D1F35">${subtitle}</div>
      <div>Erstellt am: <b>${new Date().toLocaleDateString("de-DE")}</b></div>
      <div>Uhrzeit: <b>${new Date().toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}</b></div>
      <div>Erstellt von: <b>${meta?.by||"–"}</b></div>
    </div>
  </div>`;

const pdfFooter=()=>`
  <div class="footer">
    <div>${APP_CONFIG.companyName} · ${APP_CONFIG.companyAddress}</div>
    <div>${APP_CONFIG.companyPhone} · ${APP_CONFIG.companyEmail}</div>
  </div>`;

const buildPdfHtml=(type,data,meta,extraData={})=>{
  let body="";

  // ── PROJECT ──────────────────────────────────────────────────────
  if(type==="project"){
    const p=data;
    const hrs=totalHrs(p.worklog);
    const matTotal=p.materials.reduce((a,m)=>a+m.total,0);
    const pct=p.expectedHours?Math.min(100,Math.round((hrs/p.expectedHours)*100)):0;
    const overBudget=hrs>p.expectedHours;
    const statusColors={active:"badge-blue",done:"badge-ok",stopped:"badge-danger"};

    body=`
      ${pdfHeader(meta,"Projektbericht")}

      ${p.stopReason?`<div class="stop-box"><div class="stop-icon">⛔</div><div><div class="stop-title">Projekt gestoppt</div><div class="stop-text">${p.stopReason}</div></div></div>`:""}

      <div class="section">
        <div class="section-title">📊 Kennzahlen</div>
        <div class="kpi-grid">
          <div class="kpi ${overBudget?"danger":"ok"}"><div class="kpi-val">${hrs}h</div><div class="kpi-lbl">Geleistete Stunden</div></div>
          <div class="kpi"><div class="kpi-val">${p.expectedHours}h</div><div class="kpi-lbl">Geplante Stunden</div></div>
          <div class="kpi ${overBudget?"danger":"ok"}"><div class="kpi-val">${overBudget?"+":""}${hrs-p.expectedHours}h</div><div class="kpi-lbl">Differenz</div></div>
          <div class="kpi warn"><div class="kpi-val">${matTotal.toFixed(2)} €</div><div class="kpi-lbl">Materialkosten</div></div>
        </div>
        <div style="margin-bottom:6px;font-size:11px;font-weight:600">Fortschritt: ${pct}%</div>
        <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%;background:${overBudget?"#DC2626":"#F5831F"}"></div></div>
      </div>

      <div class="section">
        <div class="section-title">🏗 Projektdetails</div>
        <div class="info-grid">
          <div class="info-row"><span class="info-lbl">Projektname</span><span class="info-val">${p.name}</span></div>
          <div class="info-row"><span class="info-lbl">Standort</span><span class="info-val">📍 ${p.location}</span></div>
          <div class="info-row"><span class="info-lbl">Einheit</span><span class="info-val">${p.entity}</span></div>
          <div class="info-row"><span class="info-lbl">Status</span><span class="info-val"><span class="badge ${statusColors[p.status]||"badge-blue"}">${p.status==="active"?"Aktiv":p.status==="done"?"Erledigt":"Gestoppt"}</span></span></div>
          <div class="info-row"><span class="info-lbl">Zeitraum</span><span class="info-val">${p.startDate} – ${p.endDate||"laufend"}</span></div>
          <div class="info-row"><span class="info-lbl">Fläche / Räume</span><span class="info-val">${p.area} m² · ${p.rooms} Räume · ${p.floors} Etagen</span></div>
        </div>
        ${p.notes?`<div style="background:#FFFBEB;border-radius:6px;padding:8px 11px;border-left:3px solid #D97706;font-size:12px">📝 ${p.notes}</div>`:""}
      </div>

      <div class="section">
        <div class="section-title">📦 Materialien & Lieferungen (${p.materials.length} Positionen)</div>
        ${p.materials.length?`
        <table>
          <tr><th>#</th><th>Material</th><th>Menge</th><th>Einheit</th><th>Preis/Einh.</th><th>Gesamt</th><th>Lieferant</th><th>Lieferdatum</th><th>Status</th></tr>
          ${p.materials.map((m,i)=>`<tr>
            <td>${i+1}</td><td style="font-weight:600">${m.name}</td><td>${m.qty}</td><td>${m.unit}</td>
            <td>${m.pricePerUnit.toFixed(2)} €</td><td style="font-weight:700">${m.total.toFixed(2)} €</td>
            <td>${m.supplier||"–"}</td><td>${m.deliveryDate||"–"}</td>
            <td><span class="badge ${m.status==="geliefert"?"badge-ok":"badge-warn"}">${m.status}</span></td>
          </tr>`).join("")}
          <tr class="total-row"><td colspan="5">GESAMT MATERIAL</td><td>${matTotal.toFixed(2)} €</td><td colspan="3"></td></tr>
        </table>`:"<p style='color:#aaa;font-size:11px'>Keine Materialien eingetragen.</p>"}
      </div>

      <div class="section">
        <div class="section-title">📋 Materialanfragen (${p.requests.length})</div>
        ${p.requests.length?`
        <table>
          <tr><th>Material</th><th>Menge</th><th>Einheit</th><th>Dringlichkeit</th><th>Von</th><th>Datum</th><th>Status</th><th>Notiz</th></tr>
          ${p.requests.map(r=>`<tr>
            <td style="font-weight:600">${r.material}</td><td>${r.qty}</td><td>${r.unit}</td>
            <td><span class="badge ${r.urgency==="dringend"?"badge-danger":"badge-blue"}">${r.urgency==="dringend"?"⚠ Dringend":"Normal"}</span></td>
            <td>MA #${r.by}</td><td>${r.date}</td>
            <td><span class="badge ${r.status==="genehmigt"?"badge-ok":"badge-warn"}">${r.status}</span></td>
            <td style="color:#888">${r.note||"–"}</td>
          </tr>`).join("")}
        </table>`:"<p style='color:#aaa;font-size:11px'>Keine Anfragen.</p>"}
      </div>

      <div class="section">
        <div class="section-title">⏱ Arbeitsprotokoll (${p.worklog.length} Einträge · ${hrs}h gesamt)</div>
        ${p.worklog.length?`
        <table>
          <tr><th>Mitarbeiter</th><th>Datum</th><th>Von</th><th>Bis</th><th>Stunden</th><th>Notiz</th></tr>
          ${p.worklog.map(l=>`<tr>
            <td>MA #${l.userId}</td><td>${l.date}</td><td>${l.start}</td><td>${l.end}</td>
            <td style="font-weight:700">${l.hours}h</td><td style="color:#888">${l.note||"–"}</td>
          </tr>`).join("")}
          <tr class="total-row"><td colspan="4">GESAMT</td><td>${hrs}h / ${p.expectedHours}h geplant</td><td></td></tr>
        </table>`:"<p style='color:#aaa;font-size:11px'>Keine Einträge.</p>"}
      </div>
      ${pdfFooter()}`;
  }

  // ── REPAIR ───────────────────────────────────────────────────────
  if(type==="repair"){
    const r=data;
    const dur=r.startTime&&r.endTime?calcDur(r.startTime,r.endTime):"–";
    const prioColors={urgent:"badge-danger",high:"badge-orange",medium:"badge-warn",low:"badge-blue"};
    const statColors={open:"badge-warn","in-progress":"badge-blue",done:"badge-ok",stopped:"badge-danger"};

    body=`
      ${pdfHeader(meta,"Auftragsbericht")}

      ${r.stopReason?`<div class="stop-box"><div class="stop-icon">⛔</div><div><div class="stop-title">Auftrag gestoppt</div><div class="stop-text">${r.stopReason}</div></div></div>`:""}

      <div class="section">
        <div class="section-title">📊 Kurzübersicht</div>
        <div class="kpi-grid">
          <div class="kpi"><div class="kpi-val">${r.status==="done"?"✓":r.status==="stopped"?"⛔":"⏳"}</div><div class="kpi-lbl">Status: ${r.status==="open"?"Offen":r.status==="in-progress"?"Aktiv":r.status==="done"?"Erledigt":"Gestoppt"}</div></div>
          <div class="kpi"><div class="kpi-val">${r.priority==="urgent"?"🚨":r.priority==="high"?"⚠":r.priority==="medium"?"◦":"✓"}</div><div class="kpi-lbl">Priorität: ${r.priority==="urgent"?"Dringend":r.priority==="high"?"Hoch":r.priority==="medium"?"Mittel":"Niedrig"}</div></div>
          <div class="kpi ok"><div class="kpi-val">${r.startTime||"–"}</div><div class="kpi-lbl">Beginn</div></div>
          <div class="kpi ${r.endTime?"ok":"warn"}"><div class="kpi-val">${r.endTime||"–"}</div><div class="kpi-lbl">Ende · Dauer: ${dur}</div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">🔧 Auftragsdetails</div>
        <div class="info-grid">
          <div class="info-row"><span class="info-lbl">Titel</span><span class="info-val">${r.title}</span></div>
          <div class="info-row"><span class="info-lbl">Zimmer / Objekt</span><span class="info-val">📍 ${r.room}</span></div>
          <div class="info-row"><span class="info-lbl">Typ</span><span class="info-val">${r.type||"–"}</span></div>
          <div class="info-row"><span class="info-lbl">Abteilung</span><span class="info-val">${r.dept}</span></div>
          <div class="info-row"><span class="info-lbl">Priorität</span><span class="info-val"><span class="badge ${prioColors[r.priority]||"badge-blue"}">${r.priority==="urgent"?"🚨 Dringend":r.priority==="high"?"⚠ Hoch":r.priority==="medium"?"Mittel":"Niedrig"}</span></span></div>
          <div class="info-row"><span class="info-lbl">Status</span><span class="info-val"><span class="badge ${statColors[r.status]||"badge-blue"}">${r.status==="open"?"Offen":r.status==="in-progress"?"In Bearbeitung":r.status==="done"?"Erledigt":"Gestoppt"}</span></span></div>
          <div class="info-row"><span class="info-lbl">Erstellt am</span><span class="info-val">${r.createdAt}</span></div>
          <div class="info-row"><span class="info-lbl">Zeiterfassung</span><span class="info-val">${r.startTime||"–"} → ${r.endTime||"–"} (${dur})</span></div>
          <div class="info-row"><span class="info-lbl">Fotos</span><span class="info-val">Vorher: ${r.photos?.before?'<span class="badge badge-ok">✓ Hochgeladen</span>':'<span class="badge badge-danger">✗ Fehlt</span>'} &nbsp; Nachher: ${r.photos?.after?'<span class="badge badge-ok">✓ Hochgeladen</span>':'<span class="badge badge-danger">✗ Fehlt</span>'}</span></div>
        </div>
        ${r.notes?`<div style="background:#FFFBEB;border-radius:6px;padding:8px 11px;border-left:3px solid #D97706;font-size:12px;margin-top:8px">📝 Hinweise: ${r.notes}</div>`:""}
      </div>

      <div class="section">
        <div class="section-title">🔩 Verwendetes Material (${r.materials?.length||0} Positionen)</div>
        ${r.materials?.length?`
        <table>
          <tr><th>#</th><th>Material</th><th>Menge</th><th>Einheit</th></tr>
          ${r.materials.map((m,i)=>`<tr><td>${i+1}</td><td style="font-weight:600">${m.name}</td><td>${m.qty}</td><td>${m.unit}</td></tr>`).join("")}
        </table>`:"<p style='color:#aaa;font-size:11px'>Kein Material verwendet.</p>"}
      </div>

      <div class="section">
        <div class="section-title">💬 Kommentare (${r.comments?.length||0})</div>
        ${r.comments?.length?r.comments.map(c=>`
          <div class="comment-box">
            <div><span class="comment-author">Mitarbeiter #${c.user}</span><span class="comment-time">${c.time}</span></div>
            <div class="comment-text">${c.text}</div>
          </div>`).join(""):"<p style='color:#aaa;font-size:11px'>Keine Kommentare.</p>"}
      </div>
      ${pdfFooter()}`;
  }

  // ── MATERIAL REQUEST ─────────────────────────────────────────────
  if(type==="material_request"){
    const d=data;
    body=`
      ${pdfHeader(meta,"Materialanfrage")}
      <div class="section">
        <div class="section-title">📋 Anfragedetails</div>
        <div class="info-grid">
          <div class="info-row"><span class="info-lbl">Projekt</span><span class="info-val">${d.projName}</span></div>
          <div class="info-row"><span class="info-lbl">Angefragt von</span><span class="info-val">${d.byName}</span></div>
          <div class="info-row"><span class="info-lbl">Material</span><span class="info-val" style="font-weight:700">${d.material}</span></div>
          <div class="info-row"><span class="info-lbl">Menge</span><span class="info-val">${d.qty} ${d.unit}</span></div>
          <div class="info-row"><span class="info-lbl">Dringlichkeit</span><span class="info-val"><span class="badge ${d.urgency==="dringend"?"badge-danger":"badge-blue"}">${d.urgency==="dringend"?"⚠ DRINGEND":"Normal"}</span></span></div>
          <div class="info-row"><span class="info-lbl">Datum</span><span class="info-val">${d.date||new Date().toLocaleDateString("de-DE")}</span></div>
        </div>
        ${d.note?`<div style="background:#FFFBEB;border-radius:6px;padding:8px 11px;border-left:3px solid #D97706;font-size:12px;margin-top:8px">📝 Notiz: ${d.note}</div>`:""}
      </div>
      <div style="background:#EFF6FF;border-radius:8px;padding:12px 16px;border:1px solid #BFDBFE">
        <div style="font-size:11px;font-weight:700;color:#1D4ED8;margin-bottom:4px">⏳ Wartet auf Genehmigung</div>
        <div style="font-size:11px;color:#3B82F6">Bitte von zuständigem Manager bestätigen.</div>
      </div>
      ${pdfFooter()}`;
  }

  // ── WAREHOUSE ────────────────────────────────────────────────────
  if(type==="warehouse"){
    const {mats,orders}=data;
    const totalVal=mats.reduce((a,m)=>a+(m.qty*m.price),0);
    const lowItems=mats.filter(m=>m.qty<=m.minQty);
    const totalOrders=orders.reduce((a,o)=>a+(o.priceTotal||0),0);

    body=`
      ${pdfHeader(meta,"Lager- & Bestellbericht")}

      <div class="section">
        <div class="section-title">📊 Lagerübersicht</div>
        <div class="kpi-grid">
          <div class="kpi"><div class="kpi-val">${mats.length}</div><div class="kpi-lbl">Materialarten</div></div>
          <div class="kpi ok"><div class="kpi-val">${mats.filter(m=>m.qty>m.minQty).length}</div><div class="kpi-lbl">Bestand OK</div></div>
          <div class="kpi danger"><div class="kpi-val">${lowItems.length}</div><div class="kpi-lbl">Bestand niedrig</div></div>
          <div class="kpi warn"><div class="kpi-val">${totalVal.toFixed(0)} €</div><div class="kpi-lbl">Lagerwert gesamt</div></div>
        </div>
        ${lowItems.length?`<div class="stop-box" style="background:#FFFBEB;border-color:#FDE68A"><div class="stop-icon">⚠</div><div><div class="stop-title" style="color:#D97706">Nachbestellung erforderlich</div><div class="stop-text" style="color:#D97706">${lowItems.map(m=>`${m.name} (${m.qty}/${m.minQty} ${m.unit})`).join(" · ")}</div></div></div>`:""}
      </div>

      <div class="section">
        <div class="section-title">📦 Materialbestand (${mats.length} Positionen)</div>
        <table>
          <tr><th>#</th><th>Material</th><th>Kategorie</th><th>Bestand</th><th>Einheit</th><th>Mindest</th><th>Preis/Einh.</th><th>Gesamtwert</th><th>Status</th></tr>
          ${mats.map((m,i)=>`<tr>
            <td>${i+1}</td><td style="font-weight:600">${m.name}</td><td>${m.category}</td>
            <td style="font-weight:700;color:${m.qty<=m.minQty?"#DC2626":"#059669"}">${m.qty}</td>
            <td>${m.unit}</td><td style="color:#888">${m.minQty}</td>
            <td>${m.price.toFixed(2)} €</td><td style="font-weight:700">${(m.qty*m.price).toFixed(2)} €</td>
            <td><span class="badge ${m.qty<=m.minQty?"badge-danger":"badge-ok"}">${m.qty<=m.minQty?"⚠ Niedrig":"✓ OK"}</span></td>
          </tr>`).join("")}
          <tr class="total-row"><td colspan="7">GESAMT LAGERWERT</td><td>${totalVal.toFixed(2)} €</td><td></td></tr>
        </table>
      </div>

      <div class="section">
        <div class="section-title">🔄 Bestellungen (${orders.length} Einträge)</div>
        <table>
          <tr><th>Typ</th><th>Material</th><th>Menge</th><th>Einheit</th><th>Lieferant</th><th>Datum</th><th>Betrag</th><th>Status</th></tr>
          ${orders.map(o=>`<tr>
            <td><span class="badge ${o.type==="eingang"?"badge-ok":"badge-orange"}">${o.type==="eingang"?"📥 Eingang":"📤 Ausgang"}</span></td>
            <td style="font-weight:600">${o.material}</td><td>${o.qty}</td><td>${o.unit}</td>
            <td>${o.supplier}</td><td>${o.date}</td>
            <td style="font-weight:700">${o.priceTotal?.toFixed(2)||"–"} €</td>
            <td><span class="badge ${o.status==="geliefert"||o.status==="abgeschlossen"?"badge-ok":"badge-warn"}">${o.status}</span></td>
          </tr>`).join("")}
          <tr class="total-row"><td colspan="6">GESAMT BESTELLUNGEN</td><td>${totalOrders.toFixed(2)} €</td><td></td></tr>
        </table>
      </div>
      ${pdfFooter()}`;
  }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${pdfCSS}</style></head><body><div class="page">${body}</div></body></html>`;
};



// ══════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════
export default function App(){
  // ── Session persistence — survive page refresh ──────────────────
  const[cu,setCu]=useState(()=>{
    try{const s=sessionStorage.getItem("wh_user");return s?JSON.parse(s):null;}catch{return null;}
  });
  const setCuPersist=(u)=>{
    try{if(u)sessionStorage.setItem("wh_user",JSON.stringify(u));else sessionStorage.removeItem("wh_user");}catch{}
    setCu(u);
  };
  // Sync cu when users change (e.g. after perm edit)
  useEffect(()=>{
    if(cu){const fresh=users.find(u=>u.id===cu.id);if(fresh&&JSON.stringify(fresh)!==JSON.stringify(cu)){setCuPersist(fresh);}}
  },[users]);

  const[li,setLi]      =useState({user:"",pass:""});
  const[err,setErr]    =useState("");
  const[tab,setTab]    =useState("dashboard");
  const[pdfContent,setPdfContent]=useState(null);
  const[notifs,setNotifs]=useState([
    {id:1,to:3,type:"project_assigned",title:"📋 Neues Projekt zugewiesen",body:"Elsaid Mahmoud hat Sie als Verantwortlichen für „Trockenbau Wandesbeker Str." eingesetzt.",projId:1,time:"08:00",date:"01.05.2026",read:false},
    {id:2,to:5,type:"repair_assigned", title:"🔧 Auftrag zugewiesen: Wasserleck – Zimmer 204",body:"Elsaid Mahmoud hat Ihnen einen 🚨 DRINGEND Auftrag zugewiesen: „Wasserleck – Zimmer 204" (Zi. 204).",projId:null,time:"08:10",date:"01.05.2026",read:false},
    {id:3,to:1,type:"mat_request",     title:"📦 Materialanfrage ⚠: Reinigungsmittel Typ B",body:"Anna Schmidt hat eine Anfrage für „Reinigungsmittel Typ B" (20 L) im Projekt „Grundreinigung Bürokomplex Hamm" gestellt.",projId:2,time:"09:30",date:"03.05.2026",read:false},
    {id:4,to:1,type:"repair_new",      title:"🔧 Neuer Auftrag: Türschloss defekt – Zi. 205",body:"Panter hat einen neuen Auftrag gemeldet: 🚨 DRINGEND: „Türschloss defekt – Zi. 205" in Zi. 205.",projId:null,time:"09:45",date:"03.05.2026",read:false},
  ]);
  const[showNotifs,setShowNotifs]=useState(false);

  // Quick-perm modal from dashboard
  const[mQuickPerm,setMQuickPerm]=useState(null); // user to edit perms

  const[users,setUsers]    =useState(INIT_USERS);
  const[projs,setProjs]    =useState(INIT_PROJECTS);
  const[repairs,setRepairs]=useState(INIT_REPAIRS);
  const[tasks,setTasks]    =useState(INIT_TASKS);
  const[msgs,setMsgs]      =useState(INIT_MSGS);
  const[feed,setFeed]      =useState(INIT_FEED);
  const[mats,setMats]      =useState(INIT_MATS);
  const[orders,setOrders]  =useState(INIT_ORDERS);
  const[sched,setSched]    =useState(INIT_SCHED);

  // UI
  const[selP,setSelP]         =useState(null);  // selected project
  const[pPanel,setPPanel]     =useState(false);
  const[selR,setSelR]         =useState(null);
  const[rPanel,setRPanel]     =useState(false);
  const[selChat,setSelChat]   =useState(null);
  const[chatPanel,setChatPanel]=useState(false);
  const[chatMsg,setChatMsg]   =useState("");
  const[newPost,setNewPost]   =useState("");
  const[photoType,setPhotoType]=useState("before");

  // Modals
  const[mUser,setMUser]      =useState(null);
  const[mProj,setMProj]      =useState(false);
  const[mEditProj,setMEditProj]=useState(null); // project to edit
  const[mReq,setMReq]        =useState(null);   // project id
  const[mLog,setMLog]        =useState(null);
  const[mMatProj,setMMatProj]=useState(null);
  const[mAddR,setMAddR]      =useState(false);
  const BLANK_R={title:"",room:"",dept:"Bauhandwerk",type:"Hausreparatur",priority:"medium",assignedTo:5,notes:""};
  const[fR,setFR]            =useState(BLANK_R);
  const[rMatRows,setRMatRows]=useState([]);
  const[newRMat,setNRM]      =useState({name:"",qty:1,unit:"Stk"});
  const[newComment,setNC]    =useState("");
  const[stopInput,setStopInput]=useState("");
  const[mShift,setMShift]    =useState(false);
  const[mWMat,setMWMat]      =useState(false);
  const[mOrder,setMOrder]    =useState(false);

  // Inline lists (stay open while adding rows)
  const[reqList,setReqList]  =useState([]);      // draft requests in modal
  const[matList,setMatList]  =useState([]);      // draft materials in modal
  const[newReqRow,setNRR]    =useState({material:"",qty:1,unit:"Stk",urgency:"normal",note:""});
  const[newMatRow,setNMR]    =useState({name:"",qty:1,unit:"Stk",pricePerUnit:0,supplier:"",deliveryDate:"",note:""});
  const[newLogRow,setNLR]    =useState({start:"07:00",end:"15:00",note:""});
  const[newOrderRow,setNOR]  =useState({type:"eingang",material:"",qty:1,unit:"Stk",supplier:"",date:"",status:"ausstehend",priceTotal:0,note:""});
  const[newWMatRow,setNWMR]  =useState({name:"",unit:"Stk",qty:0,minQty:5,price:0,category:"Bau"});

  // User form
  const BLANK_USER={name:"",role:"ma",dept:"Bauhandwerk",entity:"EMS Hamburg",pin:"",active:true,perms:{...DEF}};
  const[fUser,setFUser]=useState(BLANK_USER);
  // Project form
  const BLANK_PROJ={name:"",location:"",entity:"EMS Hamburg",responsibleId:3,editableBy:[1,2,3],visibleTo:[1,2],startDate:"",endDate:"",area:"",rooms:"",floors:"",expectedHours:"",notes:""};
  const[fProj,setFProj]=useState(BLANK_PROJ);

  const fileRef=useRef();
  const profilePhotoRef=useRef();
  const chatEnd=useRef();
  const ww=useW();const mob=ww<=820;

  // Profile edit modal
  const[mProfile,setMProfile]=useState(false);
  const[fProfile,setFProfile]=useState({name:"",customTitle:""});

  const[mAddTask,setMAddTask]=useState(false);
  const[mEditTask,setMEditTask]=useState(null);
  const BLANK_TASK={title:"",dept:"Bauhandwerk",status:"open",due:"",assignedTo:3,recurring:"",checklist:[]};
  const[fTask,setFTask]=useState(BLANK_TASK);
  const[newCheckItem,setNCI]=useState("");

  // Partner requests system
  const[partnerRequests,setPartnerRequests]=useState([]);
  const[mApprove,setMApprove]=useState(null); // request to approve
  const[fApprove,setFApprove]=useState({responsibleId:3,editableBy:[],visibleTo:[],rejectReason:""});
  const[mPartnerRepair,setMPartnerRepair]=useState(false); // partner repair request modal
  const BLANK_PARTNER_REPAIR={title:"",location:"",description:"",urgency:"normal",contactName:"",contactPhone:""};
  const[fPartnerRepair,setFPartnerRepair]=useState(BLANK_PARTNER_REPAIR);

  const[chatSearch,setChatSearch]=useState("");

  useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:"smooth"});},[msgs,selChat]);
  useEffect(()=>{if(showNotifs){const h=e=>{if(!e.target.closest?.('[data-notif]'))setShowNotifs(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);}},[showNotifs]);

  const isRoot=u=>u&&(u.role==="admin"||u.role==="it");
  const isPartner=u=>u&&u.role==="partner";
  const hasPerm=(u,k)=>u&&(isRoot(u)||!!u.perms?.[k]);
  const canEditProj=(u,p)=>u&&(isRoot(u)||p.editableBy?.includes(u.id));
  const canSeeProj=(u,p)=>{
    if(!u) return false;
    if(isRoot(u)) return true;
    if(isPartner(u)) return p.createdBy===u.id||p.visibleTo?.includes(u.id)||p.editableBy?.includes(u.id);
    return p.visibleTo?.includes(u.id)||p.responsibleId===u.id||p.editableBy?.includes(u.id);
  };

  const login=()=>{
    const f=users.find(u=>u.name.toLowerCase().includes(li.user.toLowerCase())||li.user===String(u.id));
    if(f&&f.active&&(li.pass===f.pin||li.pass==="1234")){setErr("");setCuPersist(f);}
    else if(li.user.toLowerCase()==="admin"&&li.pass==="1234"){setErr("");setCuPersist(users[0]);}
    else setErr("Falscher Benutzername oder PIN.");
  };

  const myProjs  =projs.filter(p=>cu&&canSeeProj(cu,p));
  const myRepairs=repairs.filter(r=>isRoot(cu)||r.assignedTo===cu?.id||(cu?.role==="va"&&r.dept===cu?.dept));
  const myTasks  =tasks.filter(t=>isRoot(cu)||t.assignedTo===cu?.id||(cu?.role==="va"&&t.dept===cu?.dept));
  const lowStock =mats.filter(m=>m.qty<=m.minQty);
  const unread   =msgs.filter(m=>m.to===cu?.id&&!m.read).length;
  const convWith =id=>msgs.filter(m=>(m.from===cu.id&&m.to===id)||(m.from===id&&m.to===cu.id));
  const myCons   =users.filter(u=>cu&&u.id!==cu.id&&u.active);
  const mySched  =cu?sched.filter(s=>s.userId===cu.id):[];

  const sendMsg=()=>{if(!chatMsg.trim()||!selChat)return;setMsgs(p=>[...p,{id:p.length+1,from:cu.id,to:selChat.id,text:chatMsg,time:new Date().toLocaleTimeString("de",{hour:"2-digit",minute:"2-digit"}),date:"03.05.2026",read:false}]);setChatMsg("");};
  const updRS=(id,s)=>{setRepairs(p=>p.map(r=>r.id===id?{...r,status:s}:r));setSelR(p=>p?{...p,status:s}:p);};
  const handleFile=e=>{const file=e.target.files[0];if(!file||!selR)return;const url=URL.createObjectURL(file);setRepairs(p=>p.map(r=>r.id===selR.id?{...r,photos:{...r.photos,[photoType]:url}}:r));setSelR(p=>({...p,photos:{...p.photos,[photoType]:url}}));e.target.value="";};
  const handleProfilePhoto=e=>{
    const file=e.target.files[0];if(!file)return;
    const url=URL.createObjectURL(file);
    setUsers(p=>p.map(u=>u.id===cu.id?{...u,photo:url}:u));
    setCu(v=>({...v,photo:url}));
    e.target.value="";
  };
  const saveProfile=()=>{
    if(!fProfile.name.trim())return;
    const av=fProfile.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
    setUsers(p=>p.map(u=>u.id===cu.id?{...u,name:fProfile.name,customTitle:fProfile.customTitle,avatar:av}:u));
    setCu(v=>({...v,name:fProfile.name,customTitle:fProfile.customTitle,avatar:av}));
    setMProfile(false);
  };

  const saveUser=()=>{
    if(!fUser.name.trim())return;
    if(mUser==="new"){
      const av=fUser.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
      const cols=[C.navy,"#1A5C9A","#059669","#7C3AED","#0891B2","#D97706","#0891B2"];
      setUsers(p=>[...p,{id:p.length+1,...fUser,avatar:av,color:cols[p.length%cols.length]}]);
    } else setUsers(p=>p.map(u=>u.id===mUser.id?{...u,...fUser}:u));
    setMUser(null);
  };

  const saveProj=()=>{
    if(!fProj.name.trim())return;
    // Partner: submit as pending request — admin must approve & assign
    if(isPartner(cu)){
      const req={
        id:Date.now(), type:"project_request", createdBy:cu.id, createdByName:cu.name, entity:cu.entity,
        name:fProj.name, location:fProj.location, notes:fProj.notes,
        startDate:fProj.startDate, endDate:fProj.endDate,
        area:+fProj.area||0, rooms:+fProj.rooms||0, floors:+fProj.floors||0,
        expectedHours:+fProj.expectedHours||0,
        status:"pending",
        date:new Date().toLocaleDateString("de-DE"),
        time:new Date().toLocaleTimeString("de",{hour:"2-digit",minute:"2-digit"}),
      };
      setPartnerRequests(p=>[req,...p]);
      notifyAdmins("partner_request","🤝 Neue Projektanfrage von Partner",
        `${cu.name} (${cu.entity}) hat eine neue Projektanfrage gestellt: „${fProj.name}" · ${fProj.location}`);
      setMProj(false);setFProj(BLANK_PROJ);
      return;
    }
    // Admin/internal: create directly
    const newProj={id:projs.length+1,...fProj,
      area:+fProj.area||0,rooms:+fProj.rooms||0,floors:+fProj.floors||0,expectedHours:+fProj.expectedHours||0,
      responsibleId:+fProj.responsibleId,
      editableBy:fProj.editableBy.map(Number),visibleTo:fProj.visibleTo.map(Number),
      createdBy:cu.id,
      status:"active",materials:matList,requests:reqList,worklog:[],stopReason:"",totalCost:0};
    setProjs(p=>[...p,newProj]);
    const respId=+fProj.responsibleId;
    if(respId!==cu.id){
      addNotif(respId,"project_assigned","📋 Neues Projekt zugewiesen",
        `${cu.name} hat Sie als Verantwortlichen für „${fProj.name}" eingesetzt.`,newProj.id);
    }
    fProj.visibleTo.map(Number).filter(id=>id!==cu.id&&id!==respId).forEach(id=>{
      addNotif(id,"project_visible","🏗 Neues Projekt: "+fProj.name,
        `Sie wurden zum Projekt „${fProj.name}" (${fProj.location}) hinzugefügt.`,newProj.id);
    });
    setMatList([]);setReqList([]);setMProj(false);setFProj(BLANK_PROJ);
  };

  // Accept partner request — admin assigns responsible + team
  const approvePartnerReq=(req,responsibleId,editableBy,visibleTo)=>{
    const newProj={
      id:projs.length+1, name:req.name, location:req.location, entity:req.entity||"EMS Hamburg",
      area:req.area, rooms:req.rooms, floors:req.floors, expectedHours:req.expectedHours,
      notes:req.notes, startDate:req.startDate, endDate:req.endDate,
      responsibleId:+responsibleId,
      editableBy:[+responsibleId,...editableBy.map(Number)],
      visibleTo:[req.createdBy,+responsibleId,...visibleTo.map(Number)],
      createdBy:req.createdBy,
      status:"active",materials:[],requests:[],worklog:[],stopReason:"",totalCost:0,
    };
    setProjs(p=>[...p,newProj]);
    setPartnerRequests(p=>p.map(r=>r.id===req.id?{...r,status:"approved",projId:newProj.id}:r));
    // Notify partner
    addNotif(req.createdBy,"partner_approved","✅ Projektanfrage genehmigt",
      `Ihre Anfrage „${req.name}" wurde genehmigt und das Projekt wurde gestartet.`,newProj.id);
    // Notify assigned team
    addNotif(+responsibleId,"project_assigned","📋 Projekt zugewiesen: "+req.name,
      `Ihnen wurde ein neues Projekt zugewiesen: „${req.name}" (${req.location})`,newProj.id);
    editableBy.map(Number).forEach(id=>{
      if(id!==+responsibleId) addNotif(id,"project_visible","🏗 Neues Projekt: "+req.name,
        `Sie wurden zum Projekt „${req.name}" hinzugefügt.`,newProj.id);
    });
    setMApprove(null);
  };

  const rejectPartnerReq=(req,reason)=>{
    setPartnerRequests(p=>p.map(r=>r.id===req.id?{...r,status:"rejected",rejectReason:reason}:r));
    addNotif(req.createdBy,"partner_rejected","❌ Projektanfrage abgelehnt",
      `Ihre Anfrage „${req.name}" wurde leider abgelehnt.${reason?` Grund: ${reason}`:""}`);
    setMApprove(null);
  };

  const updateProj=(id,updates)=>setProjs(p=>p.map(proj=>proj.id===id?{...proj,...updates}:proj));

  // ── notifications helper ──────────────────────────────────────
  const addNotif=(toUserId,type,title,body,projId=null)=>{
    setNotifs(p=>[{id:Date.now(),to:toUserId,type,title,body,projId,
      time:new Date().toLocaleTimeString("de",{hour:"2-digit",minute:"2-digit"}),
      date:new Date().toLocaleDateString("de-DE"),read:false},...p]);
  };
  // send to ALL admins/IT + specific user
  const notifyAdmins=(type,title,body,projId=null)=>{
    users.filter(u=>u.role==="admin"||u.role==="it").forEach(u=>addNotif(u.id,type,title,body,projId));
  };

  const addProjReq=(projId)=>{
    if(!newReqRow.material.trim())return;
    const row={id:Date.now(),...newReqRow,qty:+newReqRow.qty,by:cu.id,date:new Date().toLocaleDateString("de-DE"),status:"ausstehend"};
    setProjs(p=>p.map(proj=>proj.id===projId?{...proj,requests:[...proj.requests,row]}:proj));
    if(selP?.id===projId)setSelP(prev=>({...prev,requests:[...prev.requests,row]}));
    setNRR({material:"",qty:1,unit:"Stk",urgency:"normal",note:""});
    const proj=projs.find(p=>p.id===projId);
    if(proj){
      // notify admins + responsible
      const urgTag=row.urgency==="dringend"?"⚠ DRINGEND: ":"";
      notifyAdmins("mat_request",`📦 Materialanfrage${row.urgency==="dringend"?" ⚠":""}: ${row.material}`,
        `${cu.name} hat eine Anfrage für „${urgTag}${row.material}" (${row.qty} ${row.unit}) im Projekt „${proj.name}" gestellt.`,projId);
      // also notify responsible if not admin
      if(proj.responsibleId!==cu.id&&!users.find(u=>u.id===proj.responsibleId&&(u.role==="admin"||u.role==="it"))){
        addNotif(proj.responsibleId,"mat_request",`📦 Materialanfrage: ${row.material}`,
          `${cu.name}: ${urgTag}${row.material} (${row.qty} ${row.unit}) für „${proj.name}".`,projId);
      }
      setPdfContent(buildPdfHtml("material_request",{...row,projName:proj.name,byName:cu.name},{by:cu.name}));
    }
  };

  const addProjLog=(projId)=>{
    const hrs=parseFloat(((()=>{try{const[sh,sm]=newLogRow.start.split(":").map(Number),[eh,em]=newLogRow.end.split(":").map(Number);return((eh*60+em)-(sh*60+sm))/60;}catch{return 0;}})()).toFixed(2));
    const row={userId:cu.id,date:new Date().toLocaleDateString("de-DE"),...newLogRow,hours:hrs};
    setProjs(p=>p.map(proj=>proj.id===projId?{...proj,worklog:[...proj.worklog,row]}:proj));
    if(selP?.id===projId)setSelP(prev=>({...prev,worklog:[...prev.worklog,row]}));
    setNLR({start:"07:00",end:"15:00",note:""});setMLog(null);
  };

  const addProjMat=(projId)=>{
    if(!newMatRow.name.trim())return;
    const total=(+newMatRow.qty)*(+newMatRow.pricePerUnit);
    const row={id:Date.now(),...newMatRow,qty:+newMatRow.qty,pricePerUnit:+newMatRow.pricePerUnit,total};
    setProjs(p=>p.map(proj=>proj.id===projId?{...proj,materials:[...proj.materials,row]}:proj));
    if(selP?.id===projId)setSelP(prev=>({...prev,materials:[...prev.materials,row]}));
    setNMR({name:"",qty:1,unit:"Stk",pricePerUnit:0,supplier:"",deliveryDate:"",note:""});
    setMMatProj(null);
  };

  const addRepair=()=>{
    if(!fR.title.trim())return;
    const newR={id:repairs.length+1,...fR,status:"open",reporter:cu.id,
      createdAt:new Date().toLocaleDateString("de-DE"),startTime:null,endTime:null,
      photos:{before:null,after:null},stopReason:"",materials:rMatRows,comments:[]};
    setRepairs(p=>[...p,newR]);
    // notify admins + assigned person
    const prioTag=fR.priority==="urgent"?"🚨 DRINGEND: ":fR.priority==="high"?"⚠ ":"";
    notifyAdmins("repair_new",`🔧 Neuer Auftrag: ${fR.title}`,
      `${cu.name} hat einen neuen Auftrag gemeldet: ${prioTag}„${fR.title}" in ${fR.room}.`);
    if(+fR.assignedTo!==cu.id){
      addNotif(+fR.assignedTo,"repair_assigned","🔧 Auftrag zugewiesen: "+fR.title,
        `${cu.name} hat Ihnen einen ${prioTag}Auftrag zugewiesen: „${fR.title}" (${fR.room}).`);
    }
    setMAddR(false);setFR(BLANK_R);setRMatRows([]);setNRM({name:"",qty:1,unit:"Stk"});
  };


  const addOrder=()=>{
    if(!newOrderRow.material)return;
    setOrders(p=>[...p,{id:p.length+1,...newOrderRow,qty:+newOrderRow.qty,priceTotal:+newOrderRow.priceTotal}]);
    if(newOrderRow.type==="eingang"&&newOrderRow.status==="geliefert")setMats(p=>p.map(m=>m.name===newOrderRow.material?{...m,qty:m.qty+(+newOrderRow.qty)}:m));
    setMOrder(false);setNOR({type:"eingang",material:"",qty:1,unit:"Stk",supplier:"",date:"",status:"ausstehend",priceTotal:0,note:""});
  };

  const submitPartnerRepair=()=>{
    if(!fPartnerRepair.title.trim())return;
    const req={
      id:Date.now(), type:"repair_request", createdBy:cu.id, createdByName:cu.name, entity:cu.entity,
      ...fPartnerRepair,
      status:"pending",
      date:new Date().toLocaleDateString("de-DE"),
      time:new Date().toLocaleTimeString("de",{hour:"2-digit",minute:"2-digit"}),
    };
    setPartnerRequests(p=>[req,...p]);
    notifyAdmins("partner_repair","🔧 Reparaturanfrage von Partner",
      `${cu.name} (${cu.entity}): „${fPartnerRepair.title}" · ${fPartnerRepair.location} · ${fPartnerRepair.urgency==="dringend"?"⚠ DRINGEND":""}`);
    setMPartnerRepair(false);
    setFPartnerRepair(BLANK_PARTNER_REPAIR);
  };

  const saveTask=()=>{
    if(!fTask.title.trim())return;
    if(mEditTask==="new"){
      setTasks(p=>[...p,{id:p.length+1,...fTask,assignedTo:+fTask.assignedTo}]);
    } else {
      setTasks(p=>p.map(t=>t.id===mEditTask.id?{...t,...fTask,assignedTo:+fTask.assignedTo}:t));
    }
    setMAddTask(false);setMEditTask(null);setFTask(BLANK_TASK);setNCI("");
  };
  const deleteTask=(id)=>setTasks(p=>p.filter(t=>t.id!==id));

  const addWMat=()=>{
    if(!newWMatRow.name.trim())return;
    setMats(p=>[...p,{id:p.length+1,...newWMatRow,qty:+newWMatRow.qty,minQty:+newWMatRow.minQty,price:+newWMatRow.price}]);
    setMWMat(false);setNWMR({name:"",unit:"Stk",qty:0,minQty:5,price:0,category:"Bau"});
  };

  // Schedule week navigation
  const getWeekKey=(date)=>{
    const d=new Date(date);
    d.setHours(0,0,0,0);
    d.setDate(d.getDate()+4-(d.getDay()||7));
    const yearStart=new Date(d.getFullYear(),0,1);
    const kw=Math.ceil((((d-yearStart)/86400000)+1)/7);
    return `${d.getFullYear()}-${String(kw).padStart(2,'0')}`;
  };
  const[selWeek,setSelWeek]=useState(()=>getWeekKey(new Date()));
  const[schedTab,setSchedTab]=useState("week"); // "week" | "month" | "stats"

  const getWeekDates=(weekKey)=>{
    const[year,kw]=weekKey.split("-").map(Number);
    const jan1=new Date(year,0,1);
    const days=(kw-1)*7;
    const monday=new Date(jan1.getTime()+days*86400000);
    monday.setDate(monday.getDate()+(1-monday.getDay()+7)%7 - (monday.getDay()===0?6:0));
    return Array.from({length:7},(_,i)=>{const d=new Date(monday);d.setDate(monday.getDate()+i);return d;});
  };

  const prevWeek=()=>{
    const[y,w]=selWeek.split("-").map(Number);
    const d=new Date(y,0,1);d.setDate(d.getDate()+(w-2)*7);
    setSelWeek(getWeekKey(d));
  };
  const nextWeek=()=>{
    const[y,w]=selWeek.split("-").map(Number);
    const d=new Date(y,0,1);d.setDate(d.getDate()+w*7);
    setSelWeek(getWeekKey(d));
  };

  const addShift=()=>{
    const uid=+newLogRow.userId||cu.id;
    const day=+newLogRow.day||0;
    const week=newLogRow.week||selWeek;
    const hrs=newLogRow.hours||(()=>{try{const[sh,sm]=(newLogRow.shift||"").split("–")[0].split(":").map(Number),[eh,em]=(newLogRow.shift||"").split("–")[1]?.split(":")||[0,0];return Math.max(0,((+eh*60+(+em))-(sh*60+sm))/60);}catch{return 0;}})();
    const idx=sched.findIndex(s=>s.userId===uid&&s.day===day&&s.week===week);
    const row={userId:uid,day,week,shift:newLogRow.shift||"07:00–15:00",type:newLogRow.type||"work",hours:+newLogRow.hours||hrs};
    if(idx>=0) setSched(p=>p.map((s,i)=>i===idx?{...s,...row}:s));
    else setSched(p=>[...p,{id:p.length+1,...row}]);
    // Notify employee
    if(uid!==cu.id){
      addNotif(uid,"schedule_update","📅 Arbeitsplan aktualisiert",
        `${cu.name} hat Ihren Schichtplan für ${WDAYS[day]} (KW ${week.split("-")[1]}) ${idx>=0?"geändert":"eingetragen"}: ${row.shift} (${SHIFTS_C[row.type]?.label})`);
    }
    setMShift(false);setNLR({start:"07:00",end:"15:00",note:""});
  };

  const NAV=[];
  NAV.push({id:"dashboard",icon:"▦",label:"Übersicht"});
  if(!isPartner(cu)&&hasPerm(cu,"repairs"))   NAV.push({id:"repairs",  icon:"🔧",label:"Aufträge",  badge:myRepairs.filter(r=>r.status==="open").length});
  if(!isPartner(cu)&&hasPerm(cu,"tasks"))     NAV.push({id:"tasks",    icon:"✓", label:"Aufgaben"});
  if(hasPerm(cu,"messages"))                  NAV.push({id:"messages", icon:"✉", label:"Nachrichten",badge:unread});
  if(!isPartner(cu)&&hasPerm(cu,"feed"))      NAV.push({id:"feed",     icon:"◉", label:"Team-Feed"});
  if(hasPerm(cu,"gallery"))                   NAV.push({id:"gallery",  icon:"📷",label:"Fotogalerie"});
  if(hasPerm(cu,"projects"))                  NAV.push({id:"projects", icon:"🏗", label:"Projekte",  badge:projs.filter(p=>p.stopReason&&canSeeProj(cu,p)).length});
  if(!isPartner(cu)&&hasPerm(cu,"schedule"))  NAV.push({id:"schedule", icon:"📅",label:"Arbeitsplan"});
  if(!isPartner(cu)&&hasPerm(cu,"warehouse")) NAV.push({id:"warehouse",icon:"📦",label:"Lager",     badge:lowStock.length});
  if(!isPartner(cu)&&isRoot(cu))              NAV.push({id:"users",    icon:"👥",label:"Mitarbeiter", badge:partnerRequests.filter(r=>r.status==="pending").length||undefined});
  if(!isPartner(cu)&&hasPerm(cu,"reports"))   NAV.push({id:"reports",  icon:"📋",label:"Berichte"});
  NAV.push({id:"support",icon:"🆘",label:"Support"});

  const CSS=`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}body{font-family:'Plus Jakarta Sans','Segoe UI',sans-serif}
    input:focus,textarea:focus,select:focus{outline:2px solid ${C.navy};outline-offset:-1px}button{cursor:pointer;border:none;font-family:inherit}
    ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#BCC8D8;border-radius:4px}
    .ni{transition:all .15s}.ni:hover{background:${C.navyLight}!important}.ni.act{background:${C.navy}!important;color:#fff!important}
    .ch{transition:transform .15s,box-shadow .15s}.ch:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(13,59,110,.1)!important}
    .bp{background:${C.navy};color:#fff;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:600}.bp:hover{background:${C.navyDark}}
    .bo{background:${C.orange};color:#fff;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:600}.bo:hover{background:#e07019}
    .bg{background:transparent;color:${C.sub};border-radius:8px;padding:6px 12px;font-size:12px;font-weight:500;border:1.5px solid ${C.border}}.bg:hover{background:${C.navyLight}}
    .bgr{background:${C.green};color:#fff;border-radius:7px;padding:5px 11px;font-size:12px;font-weight:600}
    .bdr{background:${C.red};color:#fff;border-radius:7px;padding:5px 11px;font-size:12px;font-weight:600}
    .row-in{background:#fff;border:1px solid ${C.border};border-radius:8px;padding:9px 11px;margin-bottom:7px}
    table.list{width:100%;border-collapse:collapse}
    table.list th{background:${C.navy};color:#fff;padding:6px 9px;font-size:11px;text-align:left}
    table.list td{padding:5px 9px;border-bottom:1px solid ${C.border};font-size:12px}
    table.list tr:nth-child(even) td{background:${C.bg}}
  `;

  // ── LOGIN ──────────────────────────────────────────────
  if(!cu) return(
    <div style={{minHeight:"100vh",background:`linear-gradient(135deg,${C.navy},#1A5C9A,${C.navyDark})`,display:"flex",alignItems:"center",justifyContent:"center",padding:16,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{CSS}</style>
      <div style={{width:"100%",maxWidth:440}}>
        <div style={{textAlign:"center",marginBottom:18}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:11,background:"rgba(255,255,255,.1)",borderRadius:14,padding:"12px 22px",border:"1px solid rgba(255,255,255,.15)"}}>
            <div style={{width:40,height:40,background:APP_CONFIG.accentColor,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{APP_CONFIG.logoIcon}</div>
            <div style={{textAlign:"left"}}>
              <div style={{fontSize:18,fontWeight:800,color:"#fff"}}>{APP_CONFIG.appName}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.55)"}}>{APP_CONFIG.companyName}</div>
            </div>
          </div>
        </div>
        <div style={{background:"#fff",borderRadius:16,padding:"22px 20px",boxShadow:"0 24px 60px rgba(0,0,0,.25)"}}>
          <h2 style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:14,textAlign:"center"}}>Anmeldung</h2>
          {[["user","BENUTZERNAME","Name oder ID","text"],["pass","PIN","1234","password"]].map(([k,l,p,t])=>(
            <div key={k} style={{marginBottom:10}}><Lbl>{l}</Lbl><Inp type={t} value={li[k]} placeholder={p} onChange={e=>setLi(v=>({...v,[k]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&login()}/></div>
          ))}
          {err&&<div style={{background:C.redL,border:"1px solid #FECACA",borderRadius:7,padding:"7px 10px",fontSize:12,color:C.red,marginBottom:9,textAlign:"center"}}>⚠ {err}</div>}
          <button onClick={login} className="bp" style={{width:"100%",padding:"11px",fontSize:14,fontWeight:700,marginTop:2,borderRadius:9}}>Anmelden →</button>
          <div style={{marginTop:13,background:C.bg,borderRadius:9,padding:"10px 11px"}}>
            <div style={{fontSize:9,fontWeight:700,color:"#bbb",letterSpacing:".6px",marginBottom:7}}>DEMO-KONTEN</div>
            {["admin","it","va","ma","hotel"].flatMap(role=>users.filter(u=>u.role===role)).map(u=>(
              <div key={u.id} onClick={()=>setLi({user:String(u.id),pass:u.pin})} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 6px",cursor:"pointer",borderRadius:6,marginBottom:2,border:`1px solid ${C.border}`,background:"#fff"}}>
                <Av u={u} size={20}/><span style={{fontSize:11,color:C.text,fontWeight:600,flex:1}}>{u.name}</span>
                <RB role={u.role}/><Tag bg="#F9FAFB" color={C.sub}>{u.entity}</Tag>
                <span style={{fontSize:10,color:"#bbb"}}>PIN:{u.pin}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:11,color:"rgba(255,255,255,.4)",fontSize:10}}>{APP_CONFIG.companyAddress} · {APP_CONFIG.companyPhone}</div>
        <div style={{textAlign:"center",marginTop:5,fontSize:10}}>
          <a href={APP_CONFIG.supportUrl} target="_blank" rel="noreferrer" style={{color:"rgba(255,255,255,.35)",textDecoration:"none",fontWeight:600}}>
            Powered by {APP_CONFIG.supportCompany}
          </a>
        </div>
      </div>
    </div>
  );

  // ── PROJECT DETAIL ─────────────────────────────────────
  const ProjDetail=({proj})=>{
    if(!proj) return <div style={{padding:40,textAlign:"center",color:"#bbb"}}><div style={{fontSize:40,opacity:.1,marginBottom:8}}>🏗</div><div style={{fontSize:13,fontWeight:600}}>Projekt auswählen</div></div>;
    const hrs=totalHrs(proj.worklog);
    const matTotal=proj.materials.reduce((a,m)=>a+m.total,0);
    const canEdit=canEditProj(cu,proj);
    const[editMode,setEditMode]=useState(false);
    const[editData,setEditData]=useState({});

    const startEdit=()=>{setEditData({name:proj.name,location:proj.location,area:proj.area,rooms:proj.rooms,floors:proj.floors,expectedHours:proj.expectedHours,notes:proj.notes,startDate:proj.startDate,endDate:proj.endDate,entity:proj.entity});setEditMode(true);};
    const saveEdit=()=>{updateProj(proj.id,editData);setSelP(p=>({...p,...editData}));setEditMode(false);};

    return(
      <div style={{padding:mob?"12px 11px 80px":"18px 16px",overflowY:"auto",height:"100%"}}>
        {mob&&<button className="bg" onClick={()=>setPPanel(false)} style={{marginBottom:10,fontSize:11,padding:"4px 9px"}}>← Zurück</button>}

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:11,gap:8,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:0}}>
            {editMode?<Inp value={editData.name} onChange={e=>setEditData(v=>({...v,name:e.target.value}))} style={{fontSize:16,fontWeight:800,marginBottom:6}}/>
            :<h2 style={{fontSize:16,fontWeight:800,marginBottom:6,lineHeight:1.3}}>{proj.name}</h2>}
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}><SB status={proj.status}/><Tag>{proj.entity}</Tag><Tag bg="#F9FAFB" color={C.sub}>📍 {proj.location}</Tag></div>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {canEdit&&!editMode&&<button className="bg" onClick={startEdit} style={{fontSize:11,padding:"4px 9px"}}>✏ Bearbeiten</button>}
            {editMode&&<><button className="bgr" onClick={saveEdit} style={{fontSize:11,padding:"4px 9px"}}>✓ Speichern</button><button className="bg" onClick={()=>setEditMode(false)} style={{fontSize:11,padding:"4px 9px"}}>Abbrechen</button></>}
            <button onClick={()=>setPdfContent(buildPdfHtml("project",proj,{by:cu.name}))} style={{background:C.navyLight,color:C.navy,border:`1px solid ${C.border}`,borderRadius:7,padding:"4px 9px",fontSize:11,fontWeight:600}}>📄 PDF</button>
          </div>
        </div>

        {proj.stopReason&&<div style={{background:C.redL,border:"1px solid #FECACA",borderRadius:7,padding:"7px 10px",fontSize:12,color:C.red,marginBottom:10}}>⛔ {proj.stopReason}</div>}

        {/* Key figures */}
        <Sec title="PROJEKTDATEN" icon="📊">
          {editMode?(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[["location","Standort"],["area","Fläche (m²)"],["rooms","Räume"],["floors","Etagen"],["expectedHours","Geplante Stunden"],["startDate","Startdatum"],["endDate","Enddatum"]].map(([k,l])=>(
                <div key={k}><Lbl>{l.toUpperCase()}</Lbl><Inp value={editData[k]||""} onChange={e=>setEditData(v=>({...v,[k]:e.target.value}))}/></div>
              ))}
              <div style={{gridColumn:"1/-1"}}><Lbl>NOTIZEN</Lbl><Txt value={editData.notes||""} onChange={e=>setEditData(v=>({...v,notes:e.target.value}))} rows={2}/></div>
            </div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:7}}>
              {[
                ["📅 Zeitraum",`${proj.startDate} – ${proj.endDate||"laufend"}`],
                ["📐 Fläche",`${proj.area} m²`],
                ["🚪 Räume",`${proj.rooms} Räume`],
                ["🏢 Etagen",`${proj.floors} Etagen`],
                ["⏱ Geplant",`${proj.expectedHours}h`],
                ["⚙ Geleistet",`${hrs}h`],
                ["📊 Differenz",`${hrs-proj.expectedHours>0?"+":""}${hrs-proj.expectedHours}h`],
                ["💶 Material",`${matTotal.toFixed(2)} €`],
              ].map(([k,v])=>(
                <div key={k} style={{background:"#fff",borderRadius:7,padding:"7px 9px",border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:10,color:C.sub,marginBottom:2}}>{k}</div>
                  <div style={{fontSize:13,fontWeight:700,color:C.text}}>{v}</div>
                </div>
              ))}
            </div>
          )}
          {!editMode&&proj.notes&&<div style={{background:C.yellowL,borderRadius:6,padding:"6px 9px",marginTop:7,fontSize:12,border:"1px solid #FDE68A"}}>{proj.notes}</div>}
        </Sec>

        {/* Progress bar */}
        <div style={{background:C.bg,borderRadius:8,padding:"8px 11px",marginBottom:10,border:`1px solid ${C.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:11,fontWeight:700,color:C.sub}}>FORTSCHRITT (Stunden)</span>
            <span style={{fontSize:11,color:C.sub}}>{hrs}h / {proj.expectedHours}h</span>
          </div>
          <div style={{background:C.border,borderRadius:4,height:8}}>
            <div style={{width:`${Math.min(100,proj.expectedHours?Math.round((hrs/proj.expectedHours)*100):0)}%`,height:"100%",background:hrs>proj.expectedHours?C.red:C.orange,borderRadius:4,transition:"width .3s"}}/>
          </div>
          <div style={{fontSize:10,color:C.sub,marginTop:3}}>{proj.expectedHours?Math.round((hrs/proj.expectedHours)*100):0}% abgeschlossen</div>
        </div>

        {/* Team */}
        <Sec title="PROJEKTTEAM & BERECHTIGUNGEN" icon="👥" collapsible>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {proj.visibleTo.map(id=>{const mu=users.find(u=>u.id===id);return mu?(
              <div key={id} style={{display:"flex",alignItems:"center",gap:5,background:"#fff",borderRadius:6,padding:"3px 8px",border:`1px solid ${C.border}`}}>
                <Av u={mu} size={18}/>
                <span style={{fontSize:11,fontWeight:600}}>{mu.name.split(" ")[0]}</span>
                {proj.editableBy.includes(id)&&<span style={{fontSize:9,background:C.orangeLight,color:C.orange,borderRadius:3,padding:"0 4px",fontWeight:700}}>Bearbeiten</span>}
                {proj.responsibleId===id&&<span style={{fontSize:9,background:C.navyLight,color:C.navy,borderRadius:3,padding:"0 4px",fontWeight:700}}>Lead</span>}
              </div>
            ):null;})}
          </div>
        </Sec>

        {/* Materials */}
        <Sec title="MATERIALIEN & LIEFERUNGEN" icon="📦" collapsible>
          {proj.materials.length>0&&(
            <div style={{overflowX:"auto",marginBottom:8}}>
              <table className="list">
                <thead><tr><th>Material</th><th>Menge</th><th>Einheit</th><th>Preis/Einh.</th><th>Gesamt</th><th>Lieferant</th><th>Lieferdatum</th><th>Status</th><th>Notiz</th></tr></thead>
                <tbody>
                  {proj.materials.map((m,i)=>(
                    <tr key={i}>
                      <td style={{fontWeight:600}}>{m.name}</td><td>{m.qty}</td><td>{m.unit}</td>
                      <td>{m.pricePerUnit.toFixed(2)} €</td><td style={{fontWeight:700}}>{m.total.toFixed(2)} €</td>
                      <td>{m.supplier}</td><td>{m.deliveryDate}</td>
                      <td><span style={{background:m.status==="geliefert"?C.greenL:C.yellowL,color:m.status==="geliefert"?C.green:C.yellow,borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>{m.status}</span></td>
                      <td style={{color:C.sub}}>{m.note||"–"}</td>
                    </tr>
                  ))}
                  <tr style={{background:C.navyLight}}>
                    <td colSpan={4} style={{fontWeight:700}}>GESAMT MATERIAL</td>
                    <td style={{fontWeight:700,color:C.navy}}>{matTotal.toFixed(2)} €</td>
                    <td colSpan={4}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {canEdit&&<button className="bgr" onClick={()=>setMMatProj(proj.id)} style={{fontSize:11,padding:"4px 9px"}}>+ Material hinzufügen</button>}
        </Sec>

        {/* Requests */}
        <Sec title="MATERIALANFRAGEN" icon="📋" collapsible>
          {proj.requests.length>0&&(
            <div style={{overflowX:"auto",marginBottom:8}}>
              <table className="list">
                <thead><tr><th>Material</th><th>Menge</th><th>Einheit</th><th>Dringlichkeit</th><th>Datum</th><th>Status</th><th>Notiz</th>{isRoot(cu)&&<th>Aktion</th>}</tr></thead>
                <tbody>
                  {proj.requests.map((r,i)=>(
                    <tr key={i}>
                      <td style={{fontWeight:600}}>{r.material}</td><td>{r.qty}</td><td>{r.unit}</td>
                      <td>{r.urgency==="dringend"?<span style={{color:C.red,fontWeight:700}}>⚠ Dringend</span>:"Normal"}</td>
                      <td>{r.date}</td>
                      <td><span style={{background:r.status==="genehmigt"?C.greenL:r.status==="ausstehend"?C.yellowL:C.redL,color:r.status==="genehmigt"?C.green:r.status==="ausstehend"?C.yellow:C.red,borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>{r.status}</span></td>
                      <td style={{color:C.sub}}>{r.note||"–"}</td>
                      {isRoot(cu)&&<td><button onClick={()=>{updateProj(proj.id,{requests:proj.requests.map((rr,ri)=>ri===i?{...rr,status:"genehmigt"}:rr)});if(selP?.id===proj.id)setSelP(p=>({...p,requests:p.requests.map((rr,ri)=>ri===i?{...rr,status:"genehmigt"}:rr)}));}} style={{background:C.greenL,color:C.green,border:"none",borderRadius:4,padding:"2px 7px",fontSize:10,fontWeight:600,cursor:"pointer"}}>✓ Genehmigen</button></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button className="bgr" onClick={()=>setMReq(proj.id)} style={{fontSize:11,padding:"4px 9px"}}>+ Neue Anfrage</button>
        </Sec>

        {/* Worklog */}
        <Sec title="ARBEITSPROTOKOLL" icon="⏱" collapsible>
          {proj.worklog.length>0&&(
            <div style={{overflowX:"auto",marginBottom:8}}>
              <table className="list">
                <thead><tr><th>Mitarbeiter</th><th>Datum</th><th>Von</th><th>Bis</th><th>Stunden</th><th>Notiz</th></tr></thead>
                <tbody>
                  {proj.worklog.map((l,i)=>{const wu=users.find(u=>u.id===l.userId);return(
                    <tr key={i}><td><div style={{display:"flex",alignItems:"center",gap:5}}><Av u={wu} size={18}/><span>{wu?.name.split(" ")[0]}</span></div></td><td>{l.date}</td><td>{l.start}</td><td>{l.end}</td><td style={{fontWeight:700}}>{l.hours}h</td><td style={{color:C.sub}}>{l.note||"–"}</td></tr>
                  );})}
                  <tr style={{background:C.navyLight}}>
                    <td colSpan={4} style={{fontWeight:700}}>GESAMT</td>
                    <td style={{fontWeight:700,color:C.navy}}>{hrs}h</td><td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          <button className="bgr" onClick={()=>setMLog(proj.id)} style={{fontSize:11,padding:"4px 9px"}}>+ Stunden eintragen</button>
        </Sec>
      </div>
    );
  };

  // ── CHAT WINDOW ────────────────────────────────────────
  const ChatWin=()=>selChat?(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{padding:"10px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8,background:C.bg,flexShrink:0}}>
        {mob&&<button className="bg" onClick={()=>{setSelChat(null);setChatPanel(false);}} style={{padding:"3px 7px",fontSize:11}}>←</button>}
        <div style={{position:"relative"}}><Av u={selChat} size={30}/><div style={{position:"absolute",bottom:0,right:0,width:8,height:8,background:"#10B981",border:"1.5px solid #fff",borderRadius:"50%"}}/></div>
        <div><div style={{fontWeight:700,fontSize:13}}>{selChat.name}</div><div style={{display:"flex",gap:5}}><RB role={selChat.role}/><Tag bg="#F9FAFB" color={C.sub}>{selChat.entity}</Tag></div></div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"10px 12px",display:"flex",flexDirection:"column",gap:6,background:C.bg}}>
        {convWith(selChat.id).length===0&&<div style={{textAlign:"center",color:"#ccc",fontSize:12,marginTop:16}}>Gespräch beginnen!</div>}
        {convWith(selChat.id).map(m=>{const me=m.from===cu.id;return(
          <div key={m.id} style={{display:"flex",justifyContent:me?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"78%",background:me?C.navy:"#fff",color:me?"#fff":C.text,borderRadius:me?"12px 12px 3px 12px":"12px 12px 12px 3px",padding:"8px 11px",boxShadow:"0 2px 5px rgba(13,59,110,.07)",border:me?"none":`1px solid ${C.border}`,wordBreak:"break-word"}}>
              <div style={{fontSize:13,lineHeight:1.5}}>{m.text}</div>
              <div style={{fontSize:9,marginTop:3,opacity:.5,textAlign:me?"right":"left"}}>{m.time}</div>
            </div>
          </div>
        );})}
        <div ref={chatEnd}/>
      </div>
      <div style={{padding:"8px 10px",borderTop:`1px solid ${C.border}`,display:"flex",gap:6,background:"#fff",flexShrink:0}}>
        <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder={`Nachricht an ${selChat.name.split(" ")[0]}…`}
          style={{flex:1,border:`1.5px solid ${C.border}`,borderRadius:8,padding:"8px 11px",fontSize:13,background:C.bg,minWidth:0,color:C.text}}/>
        <button className="bp" onClick={sendMsg} style={{padding:"8px 13px",flexShrink:0}}>Senden</button>
      </div>
    </div>
  ):<div style={{padding:40,textAlign:"center",color:"#bbb"}}><div style={{fontSize:36,opacity:.1,marginBottom:8}}>✉</div><div style={{fontSize:13,fontWeight:600}}>Kontakt auswählen</div></div>;

  // ── REPAIR DETAIL (defined before return so JSX can use it) ──────
  const RepairDetail=({r})=>{
    if(!r) return <div style={{padding:40,textAlign:"center",color:"#bbb"}}><div style={{fontSize:36,opacity:.1,marginBottom:8}}>🔧</div><div style={{fontSize:13,fontWeight:600}}>Auftrag auswählen</div></div>;
    const asgn=users.find(u=>u.id===r.assignedTo);
    const rprt=users.find(u=>u.id===r.reporter);
    const canEdit=isRoot(cu)||r.assignedTo===cu.id||(cu.role==="va"&&r.dept===cu.dept);
    const dur=r.startTime&&r.endTime?calcDur(r.startTime,r.endTime):"laufend";
    return(
      <div style={{padding:"16px 15px",overflowY:"auto",height:"100%"}}>
        {mob&&<button className="bg" onClick={()=>setRPanel(false)} style={{marginBottom:10,fontSize:11,padding:"4px 9px"}}>← Zurück</button>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,gap:8,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:0}}>
            <h2 style={{fontSize:15,fontWeight:800,marginBottom:7,lineHeight:1.3}}>{r.title}</h2>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}><SB status={r.status}/><PD priority={r.priority}/>{r.type&&<Tag bg={C.orangeLight} color={C.orange}>{r.type}</Tag>}<Tag bg="#F9FAFB" color={C.sub}>📍 {r.room}</Tag><Tag bg={C.bg} color={C.sub}>📅 {r.createdAt}</Tag></div>
          </div>
          <button onClick={()=>setPdfContent(buildPdfHtml("repair",r,{by:cu.name}))} style={{background:C.navyLight,color:C.navy,border:`1px solid ${C.border}`,borderRadius:7,padding:"4px 9px",fontSize:11,fontWeight:600,flexShrink:0}}>📄 PDF</button>
        </div>
        {/* Info row */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:7,marginBottom:12}}>
          {[["👤 Zuständig",asgn?.name||"–"],["📢 Gemeldet",rprt?.name||"–"],["▶ Beginn",r.startTime||"–"],["⏹ Ende",r.endTime||"–"],["⏱ Dauer",dur]].map(([k,v])=>(
            <div key={k} style={{background:C.bg,borderRadius:7,padding:"6px 8px",border:`1px solid ${C.border}`}}><div style={{fontSize:9,color:C.sub,marginBottom:2}}>{k}</div><div style={{fontSize:12,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v}</div></div>
          ))}
        </div>
        {r.stopReason&&<div style={{background:C.redL,border:"1px solid #FECACA",borderRadius:8,padding:"8px 11px",marginBottom:12,display:"flex",gap:8,alignItems:"flex-start"}}>
          <span style={{fontSize:16}}>⛔</span>
          <div><div style={{fontSize:12,fontWeight:700,color:C.red}}>Auftrag gestoppt</div><div style={{fontSize:12,color:C.red}}>{r.stopReason}</div>
            {canEdit&&<button onClick={()=>{setRepairs(p=>p.map(x=>x.id===r.id?{...x,stopReason:""}:x));setSelR(v=>({...v,stopReason:""}));}} style={{marginTop:5,background:C.greenL,color:C.green,border:"none",borderRadius:5,padding:"2px 8px",fontSize:11,fontWeight:600,cursor:"pointer"}}>✓ Stopp aufheben</button>}
          </div>
        </div>}
        {canEdit&&(
          <div style={{background:C.bg,borderRadius:8,padding:11,marginBottom:12,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:10,fontWeight:700,color:C.sub,marginBottom:8}}>STATUS & ZEITERFASSUNG</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
              {[["open","⏳ Offen"],["in-progress","🔧 Starten"],["done","✅ Erledigt"],["stopped","⛔ Stoppen"]].map(([k,label])=>{const v=S[k]||{color:"#888",border:"#888"};return(
                <button key={k} onClick={()=>{
                  const now=new Date().toLocaleTimeString("de",{hour:"2-digit",minute:"2-digit"});
                  let upd={status:k};
                  if(k==="in-progress"&&!r.startTime) upd.startTime=now;
                  if(k==="done"&&!r.endTime) upd.endTime=now;
                  if(k==="stopped"){
                    if(!stopInput.trim()) return;
                    upd.stopReason=stopInput;
                    setStopInput("");
                  }
                  setRepairs(p=>p.map(x=>x.id===r.id?{...x,...upd}:x));
                  setSelR(v=>({...v,...upd}));
                }} style={{flex:"1 1 70px",background:r.status===k?v.color:"#fff",color:r.status===k?"#fff":v.color,border:`1.5px solid ${v.color}`,borderRadius:7,padding:"6px 8px",fontSize:11,fontWeight:600}}>{label}</button>
              );})}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
              <div><Lbl>BEGINN</Lbl><Inp value={r.startTime||""} onChange={e=>{const v=e.target.value;setRepairs(p=>p.map(x=>x.id===r.id?{...x,startTime:v}:x));setSelR(s=>({...s,startTime:v}));}} placeholder="07:00" style={{fontSize:12,padding:"6px 9px"}}/></div>
              <div><Lbl>ENDE</Lbl><Inp value={r.endTime||""} onChange={e=>{const v=e.target.value;setRepairs(p=>p.map(x=>x.id===r.id?{...x,endTime:v}:x));setSelR(s=>({...s,endTime:v}));}} placeholder="15:00" style={{fontSize:12,padding:"6px 9px"}}/></div>
            </div>
            {/* Stop reason input — only shown when "Stoppen" would be clicked */}
            <div style={{marginTop:7}}>
              <Lbl>STOPP-GRUND (für ⛔ Stoppen)</Lbl>
              <div style={{display:"flex",gap:6}}>
                <Inp value={stopInput} onChange={e=>setStopInput(e.target.value)} placeholder="z.B. Material fehlt: Spachtelmasse nicht vorhanden…" style={{fontSize:12,padding:"6px 9px",flex:1}}/>
              </div>
              {stopInput.trim()&&<div style={{fontSize:10,color:C.sub,marginTop:3}}>Drücken Sie "⛔ Stoppen" um zu bestätigen</div>}
            </div>
          </div>
        )}
        {/* Photos */}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,color:C.sub,marginBottom:8}}>📷 FOTOS</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            {["before","after"].map(t=>{const ph=r.photos[t];return(
              <div key={t}>
                <div style={{fontSize:11,fontWeight:600,color:C.sub,marginBottom:4}}>{t==="before"?"Vor der Arbeit":"Nach der Arbeit"}</div>
                <div style={{border:`2px dashed ${ph?C.border:"#DDE4EE"}`,borderRadius:8,height:110,overflow:"hidden",position:"relative",background:ph?"transparent":C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {ph&&ph!=="uploaded"?<img src={ph} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    :ph==="uploaded"?<div style={{textAlign:"center"}}><div style={{fontSize:26}}>{t==="before"?"🔨":"✨"}</div><div style={{fontSize:9,color:"#aaa",marginTop:2}}>Foto hochgeladen</div></div>
                    :<div style={{textAlign:"center"}}><div style={{fontSize:20,opacity:.18}}>📷</div><div style={{fontSize:9,color:"#bbb",marginTop:2}}>Kein Foto</div></div>}
                  <button onClick={()=>{setPhotoType(t);setSelR(r);fileRef.current.click();}} style={{position:"absolute",bottom:5,right:5,background:`${C.navy}CC`,color:"#fff",borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:600}}>Upload</button>
                </div>
              </div>
            );})}
          </div>
        </div>
        {/* Materials */}
        <div style={{background:C.bg,borderRadius:8,padding:"9px 11px",marginBottom:12,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,fontWeight:700,color:C.sub,marginBottom:7}}>🔩 VERWENDETES MATERIAL</div>
          {r.materials?.length>0?(
            <table className="list" style={{marginBottom:7}}>
              <thead><tr><th>Material</th><th>Menge</th><th>Einheit</th></tr></thead>
              <tbody>{r.materials.map((m,i)=><tr key={i}><td style={{fontWeight:600}}>{m.name}</td><td>{m.qty}</td><td>{m.unit}</td></tr>)}</tbody>
            </table>
          ):<div style={{fontSize:11,color:"#ccc",textAlign:"center",marginBottom:7}}>Noch kein Material</div>}
          {canEdit&&(
            <div style={{display:"flex",gap:6,alignItems:"flex-end",flexWrap:"wrap"}}>
              <div style={{flex:2,minWidth:100}}><Lbl>MATERIAL</Lbl><Inp value={newRMat.name} onChange={e=>setNRM(v=>({...v,name:e.target.value}))} placeholder="z.B. Dichtungsring" style={{fontSize:12,padding:"5px 8px"}}/></div>
              <div style={{flex:1,minWidth:50}}><Lbl>MENGE</Lbl><Inp type="number" value={newRMat.qty} onChange={e=>setNRM(v=>({...v,qty:+e.target.value}))} min={1} style={{fontSize:12,padding:"5px 8px"}}/></div>
              <div style={{flex:1,minWidth:60}}><Lbl>EINHEIT</Lbl><Sel value={newRMat.unit} onChange={e=>setNRM(v=>({...v,unit:e.target.value}))} style={{fontSize:12,padding:"5px 8px"}}>{MAT_UNITS.map(u=><option key={u}>{u}</option>)}</Sel></div>
              <div><Lbl> </Lbl><button className="bgr" onClick={()=>{if(!newRMat.name.trim())return;const upd=[...(r.materials||[]),{...newRMat,qty:+newRMat.qty}];setRepairs(p=>p.map(x=>x.id===r.id?{...x,materials:upd}:x));setSelR(s=>({...s,materials:upd}));setNRM({name:"",qty:1,unit:"Stk"});}} style={{padding:"6px 10px",fontSize:11}}>+ Hinzu</button></div>
            </div>
          )}
        </div>
        {r.notes&&<div style={{background:C.yellowL,border:"1px solid #FDE68A",borderRadius:8,padding:"8px 11px",fontSize:12,color:C.text,marginBottom:12}}>{r.notes}</div>}
        {/* Comments */}
        <div style={{background:C.bg,borderRadius:8,padding:"9px 11px",border:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,fontWeight:700,color:C.sub,marginBottom:8}}>💬 KOMMENTARE ({r.comments?.length||0})</div>
          {r.comments?.map((c,i)=>{const cu2=users.find(u=>u.id===c.user);return(
            <div key={i} style={{display:"flex",gap:7,marginBottom:8}}>
              <Av u={cu2} size={24}/>
              <div style={{background:"#fff",borderRadius:8,padding:"6px 10px",flex:1,border:`1px solid ${C.border}`}}>
                <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2}}><span style={{fontSize:12,fontWeight:700,color:C.navy}}>{cu2?.name.split(" ")[0]}</span><span style={{fontSize:10,color:C.sub}}>{c.time}</span></div>
                <div style={{fontSize:12,color:C.text}}>{c.text}</div>
              </div>
            </div>
          );})}
          <div style={{display:"flex",gap:6,marginTop:4}}>
            <Inp value={newComment} onChange={e=>setNC(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&newComment.trim()){const cmt={user:cu.id,text:newComment,time:new Date().toLocaleTimeString("de",{hour:"2-digit",minute:"2-digit"})};const upd=[...(r.comments||[]),cmt];setRepairs(p=>p.map(x=>x.id===r.id?{...x,comments:upd}:x));setSelR(s=>({...s,comments:upd}));setNC("");}}}
              placeholder="Kommentar… (Enter zum Senden)" style={{flex:1,fontSize:12,padding:"6px 9px"}}/>
            <button className="bp" onClick={()=>{if(!newComment.trim())return;const cmt={user:cu.id,text:newComment,time:new Date().toLocaleTimeString("de",{hour:"2-digit",minute:"2-digit"})};const upd=[...(r.comments||[]),cmt];setRepairs(p=>p.map(x=>x.id===r.id?{...x,comments:upd}:x));setSelR(s=>({...s,comments:upd}));setNC("");}} style={{padding:"6px 11px",fontSize:12,flexShrink:0}}>Senden</button>
          </div>
        </div>
      </div>
    );
  };

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Plus Jakarta Sans','Segoe UI',sans-serif",color:C.text}}>
      <style>{CSS}</style>
      {/* Hidden file inputs */}
      <input type="file" accept="image/*" ref={fileRef} style={{display:"none"}} onChange={handleFile}/>
      <input type="file" accept="image/*" ref={profilePhotoRef} style={{display:"none"}} onChange={handleProfilePhoto}/>

      {/* TOP BAR */}
      <div style={{background:C.navy,height:52,display:"flex",alignItems:"center",paddingInline:13,position:"sticky",top:0,zIndex:300,boxShadow:"0 2px 10px rgba(13,59,110,.3)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
          <div style={{width:28,height:28,background:APP_CONFIG.accentColor,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:16}}>{APP_CONFIG.logoIcon}</div>
          <span style={{fontSize:14,fontWeight:800,color:"#fff"}}>{APP_CONFIG.appName}</span>
          {!mob&&<Tag bg="rgba(255,255,255,.15)" color="#fff">{cu.entity}</Tag>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          {!mob&&<div style={{textAlign:"right"}}><div style={{fontSize:12,fontWeight:700,color:"#fff"}}>{cu.name}</div><div style={{fontSize:10,color:"rgba(255,255,255,.6)"}}>{cu.customTitle||ROLE_CFG[cu.role]?.label}</div></div>}
          {/* Notification bell */}
          {(()=>{
            const myNotifs=notifs.filter(n=>n.to===cu.id);
            const unreadN=myNotifs.filter(n=>!n.read).length;
            return(
              <div style={{position:"relative"}} data-notif="1">
                <button onClick={()=>setShowNotifs(v=>!v)}
                  style={{background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.2)",borderRadius:8,width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative"}}>
                  <span style={{fontSize:16}}>🔔</span>
                  {unreadN>0&&<span style={{position:"absolute",top:-4,right:-4,background:C.red,color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{unreadN>9?"9+":unreadN}</span>}
                </button>
                {showNotifs&&(
                  <div style={{position:"absolute",right:0,top:42,width:320,background:"#fff",borderRadius:12,boxShadow:"0 8px 32px rgba(13,59,110,.18)",zIndex:400,border:`1px solid ${C.border}`,overflow:"hidden"}}>
                    <div style={{padding:"11px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontWeight:800,fontSize:13,color:C.text}}>🔔 Benachrichtigungen</span>
                      {unreadN>0&&<button onClick={()=>{setNotifs(p=>p.map(n=>n.to===cu.id?{...n,read:true}:n));}} style={{background:C.navyLight,color:C.navy,border:"none",borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:600,cursor:"pointer"}}>Alle gelesen</button>}
                    </div>
                    <div style={{maxHeight:320,overflowY:"auto"}}>
                      {myNotifs.length===0?(
                        <div style={{padding:"24px 14px",textAlign:"center",color:"#bbb",fontSize:12}}>Keine Benachrichtigungen</div>
                      ):myNotifs.slice(0,15).map(n=>{
                        const iconMap={project_assigned:"📋",project_visible:"🏗",mat_request:"📦",repair_new:"🔧",repair_assigned:"🔧",schedule_update:"📅",partner_request:"🤝",partner_repair:"🔧",partner_approved:"✅",partner_rejected:"❌",perm_update:"🔐"};
                        return(
                          <div key={n.id} onClick={()=>{setNotifs(p=>p.map(x=>x.id===n.id?{...x,read:true}:x));setShowNotifs(false);if(n.projId){setSelP(projs.find(p=>p.id===n.projId)||null);setTab("projects");}else if(n.type==="repair_new"||n.type==="repair_assigned")setTab("repairs");}}
                            style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:n.read?"#fff":C.navyLight,display:"flex",gap:10,alignItems:"flex-start"}}>
                            <span style={{fontSize:18,flexShrink:0,marginTop:1}}>{iconMap[n.type]||"🔔"}</span>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:12,fontWeight:700,color:C.text,lineHeight:1.3,marginBottom:2}}>{n.title}</div>
                              <div style={{fontSize:11,color:C.sub,lineHeight:1.4,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{n.body}</div>
                              <div style={{fontSize:10,color:"#bbb",marginTop:3}}>{n.date} · {n.time}</div>
                            </div>
                            {!n.read&&<div style={{width:8,height:8,background:C.orange,borderRadius:"50%",flexShrink:0,marginTop:4}}/>}
                          </div>
                        );
                      })}
                    </div>
                    {myNotifs.length>0&&<div style={{padding:"8px 14px",borderTop:`1px solid ${C.border}`,textAlign:"center"}}>
                      <button onClick={()=>{setNotifs(p=>p.filter(n=>n.to!==cu.id));setShowNotifs(false);}} style={{background:"transparent",color:C.sub,border:"none",fontSize:11,cursor:"pointer"}}>Alle löschen</button>
                    </div>}
                  </div>
                )}
              </div>
            );
          })()}
          {/* Profile button */}
          <button onClick={()=>{setFProfile({name:cu.name,customTitle:cu.customTitle||""});setMProfile(true);}} style={{background:"none",border:"none",cursor:"pointer",padding:0}}>
            <div style={{position:"relative"}}>
              <Av u={cu} size={30}/>
              <div style={{position:"absolute",bottom:-1,right:-1,width:11,height:11,background:APP_CONFIG.accentColor,borderRadius:"50%",border:"1.5px solid rgba(255,255,255,.8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7}}>✏</div>
            </div>
          </button>
          <button onClick={()=>setCuPersist(null)} style={{background:"rgba(255,255,255,.12)",color:"#fff",borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:600,border:"1px solid rgba(255,255,255,.2)"}}>Abmelden</button>
        </div>
      </div>

      <div style={{display:"flex",maxWidth:1500,margin:"0 auto"}}>
        {/* SIDEBAR */}
        {!mob&&(
          <div style={{width:186,flexShrink:0,padding:"11px 8px",position:"sticky",top:52,height:"calc(100vh - 52px)",overflowY:"auto",background:"#fff",borderRight:`1px solid ${C.border}`}}>
            <div style={{background:ROLE_CFG[cu.role]?.bg,borderRadius:8,padding:"7px 9px",marginBottom:9,border:`1px solid ${C.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}><Av u={cu} size={24}/><div><div style={{fontSize:11,fontWeight:700,color:C.text}}>{cu.name.split(" ")[0]}</div><div style={{fontSize:9,color:C.sub}}>{cu.customTitle||ROLE_CFG[cu.role]?.label}</div></div></div>
            </div>
            {NAV.map(n=>(
              <button key={n.id} className={`ni${tab===n.id?" act":""}`} onClick={()=>setTab(n.id)}
                style={{width:"100%",display:"flex",alignItems:"center",gap:7,padding:"6px 9px",borderRadius:7,background:"transparent",color:tab===n.id?"#fff":C.sub,fontSize:12,fontWeight:600,marginBottom:1}}>
                <span style={{width:16,textAlign:"center",fontSize:12}}>{n.icon}</span>
                <span style={{flex:1,textAlign:"left"}}>{n.label}</span>
                {(n.badge??0)>0&&<span style={{background:tab===n.id?"rgba(255,255,255,.25)":APP_CONFIG.accentColor,color:"#fff",borderRadius:8,padding:"0 5px",fontSize:9,fontWeight:700}}>{n.badge}</span>}
              </button>
            ))}
            <div style={{marginTop:10,background:C.navyLight,borderRadius:8,padding:"8px 9px",border:`1px solid ${C.border}`}}>
              <div style={{fontSize:9,fontWeight:700,color:C.navy,letterSpacing:".5px",marginBottom:5}}>{APP_CONFIG.appName.toUpperCase()}</div>
              <div style={{fontSize:10,color:C.sub,lineHeight:1.8}}>
                <div>📍 {APP_CONFIG.companyAddress.split(",")[0]}</div>
                <div>📞 {APP_CONFIG.companyPhone}</div>
                <div>🕐 {APP_CONFIG.companyHours}</div>
              </div>
              <div style={{marginTop:7,paddingTop:6,borderTop:`1px solid ${C.border}`,fontSize:9,color:"#bbb"}}>
                Powered by <a href={APP_CONFIG.supportUrl} target="_blank" rel="noreferrer" style={{color:C.orange,fontWeight:700,textDecoration:"none"}}>{APP_CONFIG.supportCompany}</a>
              </div>
            </div>
          </div>
        )}

        {/* MAIN */}
        <div style={{flex:1,minWidth:0,padding:mob?"10px 10px 70px":"16px 14px 24px",overflowX:"hidden"}}>

          {/* ══ DASHBOARD ══ */}
          {tab==="dashboard"&&(
            <div>
              <h1 style={{fontSize:mob?19:22,fontWeight:800,marginBottom:3}}>Guten Tag, {cu.name.split(" ")[0]} 👋</h1>
              <p style={{color:C.sub,fontSize:12,marginBottom:13}}>{new Date().toLocaleDateString("de-DE",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
              <div style={{background:ROLE_CFG[cu.role]?.bg,border:`1px solid ${C.border}`,borderRadius:9,padding:"8px 12px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:15}}>{ROLE_CFG[cu.role]?.icon}</span>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:ROLE_CFG[cu.role]?.color}}>{ROLE_CFG[cu.role]?.label} – {cu.entity}</div>
                  <div style={{fontSize:11,color:C.sub}}>
                    {isRoot(cu)?"Vollzugriff":isPartner(cu)?"Projektzugang – nur eigene Projekte sichtbar":`Zugriff: ${ALL_PERMS.filter(p=>hasPerm(cu,p.key)).map(p=>p.icon).join(" ")}`}
                  </div>
                </div>
              </div>

              {/* ── PARTNER DASHBOARD ── */}
              {isPartner(cu)&&(
                <div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:12}}>
                    {[
                      {l:"Meine Projekte",   v:myProjs.length,                                     i:"🏗",c:C.navy,  b:C.navyLight},
                      {l:"Aktiv",            v:myProjs.filter(p=>p.status==="active").length,       i:"✅",c:C.green, b:C.greenL},
                      {l:"Gestoppt",         v:myProjs.filter(p=>p.status==="stopped").length,      i:"⛔",c:C.red,   b:C.redL},
                      {l:"Abgeschlossen",    v:myProjs.filter(p=>p.status==="done").length,         i:"🏁",c:C.sub,   b:"#F9FAFB"},
                    ].map(s=>(
                      <div key={s.l} className="ch" style={{background:"#fff",borderRadius:10,padding:"11px 10px",border:`1px solid ${C.border}`}}>
                        <div style={{width:30,height:30,background:s.b,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,marginBottom:7}}>{s.i}</div>
                        <div style={{fontSize:20,fontWeight:800,color:s.c}}>{s.v}</div>
                        <div style={{fontSize:10,color:C.sub,marginTop:2}}>{s.l}</div>
                      </div>
                    ))}
                  </div>

                  {/* Stopped projects warning */}
                  {myProjs.filter(p=>p.stopReason).length>0&&(
                    <div style={{background:C.redL,border:"1px solid #FECACA",borderRadius:9,padding:"8px 11px",marginBottom:10}}>
                      <div style={{fontSize:12,fontWeight:700,color:C.red,marginBottom:5}}>⛔ Gestoppte Projekte</div>
                      {myProjs.filter(p=>p.stopReason).map(p=>(
                        <div key={p.id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                          <span style={{fontSize:12,fontWeight:600}}>{p.name}</span>
                          <span style={{fontSize:11,color:C.red,flex:1}}>· {p.stopReason}</span>
                          <button className="bp" onClick={()=>{setSelP(p);setTab("projects");}} style={{padding:"2px 8px",fontSize:11}}>Details</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Partner projects list */}
                  <div style={{background:"#fff",borderRadius:10,padding:12,border:`1px solid ${C.border}`,marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
                      <div style={{fontWeight:800,fontSize:13}}>Meine Projekte</div>
                      <button className="bo" onClick={()=>{setFProj(BLANK_PROJ);setMatList([]);setReqList([]);setMProj(true);}} style={{fontSize:11,padding:"4px 10px"}}>+ Neues Projekt</button>
                    </div>
                    {myProjs.length===0?(
                      <div style={{textAlign:"center",color:"#bbb",padding:"24px 0",fontSize:12}}>
                        <div style={{fontSize:32,marginBottom:8}}>🏗</div>
                        Noch keine Projekte — erstellen Sie Ihr erstes Projekt!
                      </div>
                    ):myProjs.map(p=>{
                      const hrs=totalHrs(p.worklog);
                      const pct=p.expectedHours?Math.min(100,Math.round((hrs/p.expectedHours)*100)):0;
                      return(
                        <div key={p.id} className="ch" onClick={()=>{setSelP(p);setTab("projects");}}
                          style={{padding:"10px 11px",borderRadius:8,border:`1.5px solid ${p.stopReason?"#FECACA":C.border}`,marginBottom:5,cursor:"pointer",background:C.bg}}>
                          <div style={{display:"flex",justifyContent:"space-between",gap:5,marginBottom:4}}>
                            <div style={{fontSize:13,fontWeight:700,flex:1,lineHeight:1.3}}>{p.name}</div>
                            <SB status={p.status}/>
                          </div>
                          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>
                            <Tag bg="#F9FAFB" color={C.sub}>📍 {p.location}</Tag>
                            <Tag bg="#F9FAFB" color={C.sub}>📅 {p.startDate}</Tag>
                          </div>
                          {/* Progress */}
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.sub,marginBottom:3}}>
                            <span>Fortschritt</span><span>{pct}% · {hrs}h / {p.expectedHours}h</span>
                          </div>
                          <div style={{background:C.border,borderRadius:3,height:5}}>
                            <div style={{width:`${pct}%`,height:"100%",background:hrs>p.expectedHours?C.red:C.orange,borderRadius:3,transition:"width .3s"}}/>
                          </div>
                          {p.stopReason&&<div style={{fontSize:10,color:C.red,marginTop:4}}>⛔ {p.stopReason}</div>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Partner action buttons */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                    <button className="bo" onClick={()=>{setFProj(BLANK_PROJ);setMProj(true);}}
                      style={{padding:"12px",borderRadius:10,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                      <span style={{fontSize:22}}>🏗</span>
                      <span style={{fontSize:12,fontWeight:700}}>Neues Projekt anfragen</span>
                    </button>
                    <button onClick={()=>{setFPartnerRepair(BLANK_PARTNER_REPAIR);setMPartnerRepair(true);}}
                      style={{background:C.navy,color:"#fff",border:"none",borderRadius:10,padding:"12px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                      <span style={{fontSize:22}}>🔧</span>
                      <span style={{fontSize:12,fontWeight:700}}>Reparatur/Störung melden</span>
                    </button>
                  </div>
                  <div style={{background:C.greenL,border:"1px solid #6EE7B7",borderRadius:10,padding:"11px 14px",display:"flex",gap:10,alignItems:"flex-start",marginBottom:12}}>
                    <span style={{fontSize:20}}>🤝</span>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:C.green}}>Partner-Zugang</div>
                      <div style={{fontSize:11,color:C.sub,marginTop:2,lineHeight:1.6}}>
                        Sie sehen ausschließlich Ihre eigenen Projekte. Bei Fragen: <b>{APP_CONFIG.supportEmail}</b>
                      </div>
                    </div>
                  </div>

                  {/* My requests history */}
                  {partnerRequests.filter(r=>r.createdBy===cu.id).length>0&&(
                    <div style={{background:"#fff",borderRadius:10,padding:12,border:`1px solid ${C.border}`}}>
                      <div style={{fontWeight:800,fontSize:13,marginBottom:9}}>📬 Meine Anfragen</div>
                      {partnerRequests.filter(r=>r.createdBy===cu.id).map(r=>(
                        <div key={r.id} style={{padding:"9px 10px",borderRadius:8,border:`1.5px solid ${r.status==="approved"?C.green:r.status==="rejected"?C.red:C.border}`,marginBottom:5,background:r.status==="approved"?C.greenL:r.status==="rejected"?C.redL:C.bg}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:12,fontWeight:700}}>{r.type==="repair_request"?"🔧":"🏗"} {r.name||r.title}</div>
                              <div style={{fontSize:10,color:C.sub,marginTop:2}}>{r.date} · {r.time}{r.location?` · 📍 ${r.location}`:""}</div>
                              {r.rejectReason&&<div style={{fontSize:11,color:C.red,marginTop:3}}>Grund: {r.rejectReason}</div>}
                            </div>
                            <span style={{background:r.status==="approved"?C.greenL:r.status==="rejected"?C.redL:C.yellowL,color:r.status==="approved"?C.green:r.status==="rejected"?C.red:C.yellow,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>
                              {r.status==="approved"?"✅ Genehmigt":r.status==="rejected"?"❌ Abgelehnt":"⏳ Ausstehend"}
                            </span>
                          </div>
                          {r.status==="approved"&&r.projId&&(
                            <button onClick={()=>{setSelP(projs.find(p=>p.id===r.projId)||null);setTab("projects");}}
                              style={{marginTop:6,background:C.navy,color:"#fff",border:"none",borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                              🏗 Projekt öffnen
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── INTERNAL DASHBOARD (non-partner) ── */}
              {!isPartner(cu)&&(<div>

                {/* ── ADMIN / IT DASHBOARD ── */}
                {isRoot(cu)&&(<div>
                  {partnerRequests.filter(r=>r.status==="pending").length>0&&(
                    <div style={{background:C.orangeLight,border:`1px solid ${C.orange}`,borderRadius:10,padding:"10px 13px",marginBottom:10}}>
                      <div style={{fontSize:13,fontWeight:800,color:C.orange,marginBottom:8}}>🤝 Partner-Anfragen ({partnerRequests.filter(r=>r.status==="pending").length})</div>
                      {partnerRequests.filter(r=>r.status==="pending").map(r=>(
                        <div key={r.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 9px",background:"#fff",borderRadius:7,marginBottom:4,border:`1px solid ${C.border}`,flexWrap:"wrap"}}>
                          <span style={{fontSize:16}}>{r.type==="repair_request"?"🔧":"🏗"}</span>
                          <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:700}}>{r.name||r.title}</div><div style={{fontSize:10,color:C.sub}}>{r.createdByName} · {r.entity} · {r.date}</div></div>
                          <button onClick={()=>{setMApprove(r);setFApprove({responsibleId:3,editableBy:[1,3],visibleTo:[1,2,3],rejectReason:"",action:"approve"});}} style={{background:C.green,color:"#fff",border:"none",borderRadius:6,padding:"5px 11px",fontSize:11,fontWeight:600,cursor:"pointer"}}>Bearbeiten →</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:10}}>
                    {[
                      {l:"Projekte gesamt",   v:projs.length,                                         i:"🏗",c:C.navy,  b:C.navyLight,  t:"projects"},
                      {l:"Aufträge offen",    v:repairs.filter(r=>r.status==="open").length,          i:"🔧",c:C.yellow,b:C.yellowL,    t:"repairs"},
                      {l:"Projekte gestoppt", v:projs.filter(p=>p.stopReason).length,                 i:"⛔",c:C.red,   b:C.redL,       t:"projects"},
                      {l:"Lager-Warnung",     v:lowStock.length,                                      i:"📦",c:C.orange,b:C.orangeLight, t:"warehouse"},
                    ].map(s=>(
                      <div key={s.l} className="ch" onClick={()=>setTab(s.t)} style={{background:"#fff",borderRadius:10,padding:"11px 10px",border:`1px solid ${C.border}`,cursor:"pointer"}}>
                        <div style={{width:30,height:30,background:s.b,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,marginBottom:7}}>{s.i}</div>
                        <div style={{fontSize:20,fontWeight:800,color:s.c}}>{s.v}</div>
                        <div style={{fontSize:10,color:C.sub,marginTop:2}}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  {projs.filter(p=>p.stopReason).length>0&&(
                    <div style={{background:C.redL,border:"1px solid #FECACA",borderRadius:9,padding:"8px 11px",marginBottom:10}}>
                      <div style={{fontSize:12,fontWeight:700,color:C.red,marginBottom:5}}>⛔ Gestoppte Projekte</div>
                      {projs.filter(p=>p.stopReason).map(p=>(
                        <div key={p.id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                          <span style={{fontSize:12,fontWeight:600}}>{p.name}</span><span style={{fontSize:11,color:C.red,flex:1}}>· {p.stopReason}</span>
                          <button className="bp" onClick={()=>{setSelP(p);setTab("projects");}} style={{padding:"2px 8px",fontSize:11}}>Details</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{background:"#fff",borderRadius:10,padding:12,border:`1px solid ${C.border}`,marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:9,alignItems:"center"}}>
                      <div style={{fontWeight:800,fontSize:13}}>Alle Projekte</div>
                      <button className="bg" onClick={()=>setTab("projects")} style={{fontSize:11,padding:"3px 8px"}}>Alle →</button>
                    </div>
                    {projs.slice(0,4).map(p=>{const hrs=totalHrs(p.worklog);const pct=p.expectedHours?Math.min(100,Math.round(hrs/p.expectedHours*100)):0;return(
                      <div key={p.id} className="ch" onClick={()=>{setSelP(p);setTab("projects");}} style={{padding:"8px",borderRadius:8,border:`1px solid ${C.border}`,marginBottom:4,cursor:"pointer",background:C.bg}}>
                        <div style={{display:"flex",justifyContent:"space-between",gap:5,marginBottom:4}}><div style={{fontSize:12,fontWeight:600,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div><SB status={p.status}/></div>
                        <div style={{fontSize:10,color:C.sub,marginBottom:3}}>📍 {p.location} · {hrs}h / {p.expectedHours}h</div>
                        <div style={{background:C.border,borderRadius:3,height:4}}><div style={{width:`${pct}%`,height:"100%",background:hrs>p.expectedHours?C.red:C.orange,borderRadius:3}}/></div>
                      </div>
                    );})}
                  </div>
                  <div style={{background:"#fff",borderRadius:10,padding:12,border:`1px solid ${C.border}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <div style={{fontWeight:800,fontSize:13}}>🔐 Schnell-Berechtigungen</div>
                      <button className="bg" onClick={()=>setTab("users")} style={{fontSize:11,padding:"3px 8px"}}>Alle →</button>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:7}}>
                      {users.filter(u=>u.active&&!isRoot(u)&&u.role!=="partner").map(u=>(
                        <div key={u.id} style={{background:C.bg,borderRadius:8,padding:"8px 10px",border:`1px solid ${C.border}`}}>
                          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
                            <Av u={u} size={24}/><div style={{flex:1,minWidth:0}}><div style={{fontSize:11,fontWeight:700}}>{u.name.split(" ")[0]}</div><div style={{fontSize:9,color:C.sub}}>{u.dept}</div></div>
                            <button onClick={()=>setMQuickPerm({...u,perms:{...u.perms}})} style={{background:C.navyLight,color:C.navy,border:"none",borderRadius:5,padding:"2px 6px",fontSize:10,fontWeight:700,cursor:"pointer"}}>✏</button>
                          </div>
                          <div style={{display:"flex",flexWrap:"wrap",gap:2}}>
                            {ALL_PERMS.map(p=>(
                              <div key={p.key} title={p.label} onClick={()=>{const updated={...u.perms,[p.key]:!u.perms?.[p.key]};setUsers(prev=>prev.map(x=>x.id===u.id?{...x,perms:updated}:x));}}
                                style={{background:u.perms?.[p.key]?C.greenL:C.redL,color:u.perms?.[p.key]?C.green:C.red,borderRadius:3,padding:"1px 4px",fontSize:9,fontWeight:600,cursor:"pointer"}}>{p.icon}{u.perms?.[p.key]?"✓":"✗"}</div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>)}

                {/* ── VA DASHBOARD ── */}
                {cu.role==="va"&&(<div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:10}}>
                    {[
                      {l:"Meine Projekte", v:myProjs.length,                                i:"🏗",c:C.navy,  b:C.navyLight,t:"projects"},
                      {l:"Aufträge offen", v:myRepairs.filter(r=>r.status==="open").length, i:"🔧",c:C.yellow,b:C.yellowL,  t:"repairs"},
                      {l:"Aufgaben offen", v:myTasks.filter(t=>t.status!=="done").length,   i:"✓", c:C.purple,b:C.purpleL,  t:"tasks"},
                      {l:"Team",           v:users.filter(u=>u.active&&u.dept===cu.dept).length,i:"👥",c:"#2563EB",b:"#EFF6FF",t:"schedule"},
                    ].map(s=>(
                      <div key={s.l} className="ch" onClick={()=>setTab(s.t)} style={{background:"#fff",borderRadius:10,padding:"11px 10px",border:`1px solid ${C.border}`,cursor:"pointer"}}>
                        <div style={{width:30,height:30,background:s.b,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,marginBottom:7}}>{s.i}</div>
                        <div style={{fontSize:20,fontWeight:800,color:s.c}}>{s.v}</div>
                        <div style={{fontSize:10,color:C.sub,marginTop:2}}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  {myProjs.filter(p=>p.stopReason).length>0&&(<div style={{background:C.redL,border:"1px solid #FECACA",borderRadius:9,padding:"8px 11px",marginBottom:10}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.red,marginBottom:5}}>⛔ Gestoppte Projekte</div>
                    {myProjs.filter(p=>p.stopReason).map(p=>(<div key={p.id} style={{display:"flex",gap:6,marginBottom:3,alignItems:"center",flexWrap:"wrap"}}>
                      <span style={{fontSize:12,fontWeight:600}}>{p.name}</span><span style={{fontSize:11,color:C.red,flex:1}}>· {p.stopReason}</span>
                      <button className="bp" onClick={()=>{setSelP(p);setTab("projects");}} style={{padding:"2px 8px",fontSize:11}}>Details</button>
                    </div>))}
                  </div>)}
                  <div style={{background:"#fff",borderRadius:10,padding:12,border:`1px solid ${C.border}`,marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:9,alignItems:"center"}}>
                      <div style={{fontWeight:800,fontSize:13}}>Meine Projekte</div>
                      <div style={{display:"flex",gap:5}}>
                        <button className="bo" onClick={()=>{setFProj(BLANK_PROJ);setMatList([]);setReqList([]);setMProj(true);}} style={{fontSize:11,padding:"3px 8px"}}>+ Neu</button>
                        <button className="bg" onClick={()=>setTab("projects")} style={{fontSize:11,padding:"3px 8px"}}>Alle →</button>
                      </div>
                    </div>
                    {myProjs.slice(0,4).map(p=>{const hrs=totalHrs(p.worklog);const pct=p.expectedHours?Math.min(100,Math.round(hrs/p.expectedHours*100)):0;return(
                      <div key={p.id} className="ch" onClick={()=>{setSelP(p);setTab("projects");}} style={{padding:"9px",borderRadius:8,border:`1.5px solid ${p.stopReason?"#FECACA":C.border}`,marginBottom:4,cursor:"pointer",background:C.bg}}>
                        <div style={{display:"flex",justifyContent:"space-between",gap:5,marginBottom:4}}><div style={{fontSize:12,fontWeight:700,flex:1}}>{p.name}</div><SB status={p.status}/></div>
                        <div style={{fontSize:10,color:C.sub,marginBottom:3}}>📍 {p.location} · {hrs}h / {p.expectedHours}h</div>
                        <div style={{background:C.border,borderRadius:3,height:4}}><div style={{width:`${pct}%`,height:"100%",background:C.orange,borderRadius:3}}/></div>
                      </div>
                    );})}
                  </div>
                  {hasPerm(cu,"schedule")&&(<div style={{background:"#fff",borderRadius:10,padding:11,border:`1px solid ${C.border}`}}>
                    <div style={{fontWeight:800,fontSize:13,marginBottom:7}}>📅 Mein Wochenplan</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{DAYS.map((d,i)=>{const s=mySched.find(s=>s.day===i);const sc=s?SHIFTS_C[s.type]:null;return(<div key={i} style={{flex:"1 1 40px",background:sc?sc.bg:C.bg,borderRadius:6,padding:"5px 3px",textAlign:"center",border:`1px solid ${C.border}`}}><div style={{fontSize:9,fontWeight:700,color:C.sub}}>{d}</div><div style={{fontSize:8,fontWeight:600,color:sc?.color||"#ccc",marginTop:1}}>{s?s.shift:"–"}</div></div>);})}</div>
                  </div>)}
                </div>)}

                {/* ── MA DASHBOARD ── */}
                {cu.role==="ma"&&(<div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:10}}>
                    {[
                      {l:"Meine Projekte", v:myProjs.length,                                i:"🏗",c:C.navy,  b:C.navyLight,t:"projects"},
                      {l:"Aufträge offen", v:myRepairs.filter(r=>r.status==="open").length, i:"🔧",c:C.yellow,b:C.yellowL,  t:"repairs"},
                      {l:"Aufgaben",       v:myTasks.filter(t=>t.status!=="done").length,   i:"✓", c:C.purple,b:C.purpleL,  t:"tasks"},
                      {l:"Nachrichten",    v:msgs.filter(m=>m.to===cu.id&&!m.read).length,  i:"✉", c:C.green, b:C.greenL,   t:"messages"},
                    ].map(s=>(
                      <div key={s.l} className="ch" onClick={()=>setTab(s.t)} style={{background:"#fff",borderRadius:10,padding:"11px 10px",border:`1px solid ${C.border}`,cursor:"pointer"}}>
                        <div style={{width:30,height:30,background:s.b,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,marginBottom:7}}>{s.i}</div>
                        <div style={{fontSize:20,fontWeight:800,color:s.c}}>{s.v}</div>
                        <div style={{fontSize:10,color:C.sub,marginTop:2}}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  {hasPerm(cu,"projects")&&myProjs.length>0&&(<div style={{background:"#fff",borderRadius:10,padding:12,border:`1px solid ${C.border}`,marginBottom:10}}>
                    <div style={{fontWeight:800,fontSize:13,marginBottom:9}}>🏗 Meine Projekte</div>
                    {myProjs.map(p=>{const hrs=totalHrs(p.worklog);const pct=p.expectedHours?Math.min(100,Math.round(hrs/p.expectedHours*100)):0;return(
                      <div key={p.id} style={{padding:"9px",borderRadius:8,border:`1.5px solid ${p.stopReason?"#FECACA":C.border}`,marginBottom:6,background:C.bg}}>
                        <div style={{display:"flex",justifyContent:"space-between",gap:5,marginBottom:5}}><div style={{fontSize:12,fontWeight:700,flex:1}}>{p.name}</div><SB status={p.status}/></div>
                        <div style={{fontSize:10,color:C.sub,marginBottom:4}}>📍 {p.location} · {hrs}h / {p.expectedHours}h</div>
                        <div style={{background:C.border,borderRadius:3,height:4,marginBottom:7}}><div style={{width:`${pct}%`,height:"100%",background:C.orange,borderRadius:3}}/></div>
                        {p.stopReason&&<div style={{fontSize:10,color:C.red,marginBottom:6}}>⛔ {p.stopReason}</div>}
                        <div style={{display:"flex",gap:5}}>
                          <button onClick={()=>{setSelP(p);setTab("projects");}} style={{background:C.navyLight,color:C.navy,border:"none",borderRadius:6,padding:"4px 9px",fontSize:11,fontWeight:600,cursor:"pointer"}}>Details →</button>
                          <button onClick={()=>{setMReq(p.id);}} style={{background:C.orangeLight,color:C.orange,border:`1px solid ${C.orange}33`,borderRadius:6,padding:"4px 9px",fontSize:11,fontWeight:600,cursor:"pointer"}}>📦 Material anfragen</button>
                        </div>
                      </div>
                    );})}
                  </div>)}
                  {hasPerm(cu,"tasks")&&myTasks.filter(t=>t.status!=="done").length>0&&(<div style={{background:"#fff",borderRadius:10,padding:12,border:`1px solid ${C.border}`,marginBottom:10}}>
                    <div style={{fontWeight:800,fontSize:13,marginBottom:9}}>✓ Meine Aufgaben</div>
                    {myTasks.filter(t=>t.status!=="done").slice(0,3).map(t=>{const done=t.checklist.filter(c=>c.done).length;return(
                      <div key={t.id} style={{padding:"7px 9px",borderRadius:7,border:`1px solid ${C.border}`,marginBottom:4,background:C.bg}}>
                        <div style={{display:"flex",justifyContent:"space-between",gap:5,marginBottom:4}}><div style={{fontSize:12,fontWeight:600}}>{t.title}</div><SB status={t.status}/></div>
                        <div style={{display:"flex",gap:4,marginBottom:4}}><Tag bg={C.yellowL} color={C.yellow}>📅 {t.due}</Tag></div>
                        <div style={{background:C.border,borderRadius:3,height:3}}><div style={{width:`${t.checklist.length?Math.round(done/t.checklist.length*100):0}%`,height:"100%",background:C.orange,borderRadius:3}}/></div>
                        <div style={{fontSize:9,color:C.sub,marginTop:2}}>{done}/{t.checklist.length} erledigt</div>
                      </div>
                    );})}
                  </div>)}
                  {hasPerm(cu,"schedule")&&(<div style={{background:"#fff",borderRadius:10,padding:11,border:`1px solid ${C.border}`}}>
                    <div style={{fontWeight:800,fontSize:13,marginBottom:7}}>📅 Mein Wochenplan</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{DAYS.map((d,i)=>{const s=mySched.find(s=>s.day===i);const sc=s?SHIFTS_C[s.type]:null;return(<div key={i} style={{flex:"1 1 40px",background:sc?sc.bg:C.bg,borderRadius:6,padding:"5px 3px",textAlign:"center",border:`1px solid ${C.border}`}}><div style={{fontSize:9,fontWeight:700,color:C.sub}}>{d}</div><div style={{fontSize:8,fontWeight:600,color:sc?.color||"#ccc",marginTop:1}}>{s?s.shift:"–"}</div></div>);})}</div>
                  </div>)}
                </div>)}
              </div>)} {/* end internal dashboard */}
            </div>
          )}

          {/* ══ AUFGABEN ══ */}
          {tab==="tasks"&&hasPerm(cu,"tasks")&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11,flexWrap:"wrap",gap:7}}>
                <div>
                  <h1 style={{fontSize:mob?18:20,fontWeight:800}}>Aufgaben</h1>
                  <p style={{color:C.sub,fontSize:12,marginTop:2}}>{myTasks.filter(t=>t.status==="open").length} offen · {myTasks.filter(t=>t.status==="in-progress").length} aktiv · {myTasks.filter(t=>t.status==="done").length} erledigt</p>
                </div>
                {isRoot(cu)&&<button className="bo" onClick={()=>{setFTask(BLANK_TASK);setNCI("");setMEditTask("new");setMAddTask(true);}}>+ Neue Aufgabe</button>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:9}}>
                {myTasks.map(t=>{const done=t.checklist.filter(c=>c.done).length;const asgn=users.find(u=>u.id===t.assignedTo);return(
                  <div key={t.id} className="ch" style={{background:"#fff",borderRadius:10,padding:13,border:`1px solid ${C.border}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,gap:6}}>
                      <div style={{fontWeight:700,fontSize:13,flex:1,lineHeight:1.3}}>{t.title}</div>
                      <div style={{display:"flex",gap:4,alignItems:"flex-start",flexShrink:0}}>
                        <SB status={t.status}/>
                        {isRoot(cu)&&<>
                          <button onClick={()=>{setFTask({...t,assignedTo:t.assignedTo});setMEditTask(t);setMAddTask(true);setNCI("");}} style={{background:C.navyLight,color:C.navy,border:"none",borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:600,cursor:"pointer"}}>✏</button>
                          <button onClick={()=>deleteTask(t.id)} style={{background:C.redL,color:C.red,border:"none",borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:600,cursor:"pointer"}}>✕</button>
                        </>}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:4,marginBottom:9,flexWrap:"wrap"}}>
                      <Tag>{t.dept}</Tag>
                      <Tag bg={C.yellowL} color={C.yellow}>📅 {t.due}</Tag>
                      {t.recurring&&<Tag bg={C.purpleL} color={C.purple}>🔄 {t.recurring}</Tag>}
                      {asgn&&<div style={{display:"flex",alignItems:"center",gap:4}}><Av u={asgn} size={14}/><span style={{fontSize:10,color:C.sub}}>{asgn.name.split(" ")[0]}</span></div>}
                    </div>
                    {/* Status toggle for admin/VA */}
                    {(isRoot(cu)||t.assignedTo===cu.id||(cu.role==="va"&&t.dept===cu.dept))&&(
                      <div style={{display:"flex",gap:4,marginBottom:8}}>
                        {["open","in-progress","done"].map(s=>(
                          <button key={s} onClick={()=>setTasks(p=>p.map(x=>x.id===t.id?{...x,status:s}:x))}
                            style={{flex:1,background:t.status===s?S[s]?.color:"#fff",color:t.status===s?"#fff":S[s]?.color,border:`1.5px solid ${S[s]?.color}`,borderRadius:6,padding:"3px 0",fontSize:9,fontWeight:700,cursor:"pointer"}}>
                            {s==="open"?"Offen":s==="in-progress"?"Aktiv":"Erledigt"}
                          </button>
                        ))}
                      </div>
                    )}
                    <div style={{background:C.bg,borderRadius:7,padding:8,border:`1px solid ${C.border}`}}>
                      <div style={{fontSize:9,fontWeight:700,color:C.sub,marginBottom:5}}>CHECKLISTE {done}/{t.checklist.length}</div>
                      {t.checklist.map((c,i)=>(
                        <div key={i} onClick={()=>setTasks(p=>p.map(task=>task.id===t.id?{...task,checklist:task.checklist.map((ch,ci)=>ci===i?{...ch,done:!ch.done}:ch)}:task))}
                          style={{display:"flex",alignItems:"center",gap:6,padding:"3px 0",cursor:"pointer"}}>
                          <div style={{width:13,height:13,border:`2px solid ${c.done?C.orange:C.border}`,borderRadius:3,background:c.done?C.orange:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            {c.done&&<span style={{color:"#fff",fontSize:8}}>✓</span>}
                          </div>
                          <span style={{fontSize:11,color:c.done?"#aaa":C.text,textDecoration:c.done?"line-through":"none"}}>{c.text}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{marginTop:7,background:C.border,borderRadius:3,height:3}}><div style={{width:`${t.checklist.length?Math.round((done/t.checklist.length)*100):0}%`,height:"100%",background:C.orange,borderRadius:3,transition:"width .3s"}}/></div>
                  </div>
                );})}
              </div>
            </div>
          )}

          {/* ══ NACHRICHTEN ══ */}
          {tab==="messages"&&hasPerm(cu,"messages")&&(()=>{
            const filtered=myCons.filter(c=>
              c.name.toLowerCase().includes(chatSearch.toLowerCase())||
              c.dept?.toLowerCase().includes(chatSearch.toLowerCase())||
              c.entity?.toLowerCase().includes(chatSearch.toLowerCase())||
              ROLE_CFG[c.role]?.label.toLowerCase().includes(chatSearch.toLowerCase())
            );
            const totalUnread=myCons.reduce((a,c)=>a+msgs.filter(m=>m.from===c.id&&m.to===cu.id&&!m.read).length,0);

            // Contact list item
            const ContactItem=({c,compact=false})=>{
              const cvs=convWith(c.id);
              const last=cvs[cvs.length-1];
              const unr=cvs.filter(m=>m.to===cu.id&&!m.read).length;
              const active=selChat?.id===c.id;
              return(
                <div onClick={()=>{setSelChat(c);setChatPanel(true);setMsgs(p=>p.map(m=>m.from===c.id&&m.to===cu.id?{...m,read:true}:m));}}
                  style={{display:"flex",alignItems:"center",gap:compact?7:8,padding:compact?"7px 8px":"9px 10px",borderRadius:9,marginBottom:3,cursor:"pointer",
                    background:active?C.navyLight:"transparent",
                    border:`1.5px solid ${active?C.navy:unr>0?C.orange+"44":"transparent"}`,transition:"all .15s"}}>
                  <div style={{position:"relative",flexShrink:0}}>
                    <Av u={c} size={compact?30:34}/>
                    <div style={{position:"absolute",bottom:0,right:0,width:9,height:9,background:"#10B981",border:"2px solid #fff",borderRadius:"50%"}}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:4}}>
                      <div style={{fontSize:12,fontWeight:700,color:active?C.navy:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                      <div style={{display:"flex",gap:3,alignItems:"center",flexShrink:0}}>
                        {last&&<span style={{fontSize:9,color:"#bbb",whiteSpace:"nowrap"}}>{last.time}</span>}
                        {unr>0&&<span style={{background:C.orange,color:"#fff",borderRadius:8,padding:"1px 6px",fontSize:9,fontWeight:700,minWidth:18,textAlign:"center"}}>{unr}</span>}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:4,alignItems:"center",marginTop:2}}>
                      <RB role={c.role}/>
                      {!compact&&<span style={{fontSize:9,color:C.sub}}>{c.entity}</span>}
                    </div>
                    <div style={{fontSize:10,color:last&&!msgs.find(m=>m.id===last?.id)?.read&&last?.to===cu.id?C.text:C.sub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginTop:1,fontWeight:unr>0?600:400}}>
                      {last?(last.from===cu.id?"Du: ":"")+last.text:"Neues Gespräch starten…"}
                    </div>
                  </div>
                </div>
              );
            };

            return(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11,flexWrap:"wrap",gap:7}}>
                <div>
                  <h1 style={{fontSize:mob?18:20,fontWeight:800}}>Nachrichten</h1>
                  {totalUnread>0&&<p style={{color:C.orange,fontSize:12,marginTop:2,fontWeight:600}}>{totalUnread} ungelesene Nachricht{totalUnread>1?"en":""}</p>}
                </div>
              </div>

              {mob?(
                chatPanel&&selChat
                  ?<div style={{background:"#fff",borderRadius:10,border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",height:"calc(100vh - 168px)",overflow:"hidden"}}><ChatWin/></div>
                  :(
                    <div style={{background:"#fff",borderRadius:10,border:`1px solid ${C.border}`,overflow:"hidden"}}>
                      {/* Search */}
                      <div style={{padding:"10px 10px 6px"}}>
                        <div style={{position:"relative"}}>
                          <input value={chatSearch} onChange={e=>setChatSearch(e.target.value)}
                            placeholder="🔍 Suchen nach Name, Abteilung, Rolle…"
                            style={{width:"100%",border:`1.5px solid ${chatSearch?C.navy:C.border}`,borderRadius:9,padding:"8px 12px 8px 36px",fontSize:12,background:C.bg,color:C.text,boxSizing:"border-box"}}/>
                          <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:14,opacity:.5}}>🔍</span>
                          {chatSearch&&<button onClick={()=>setChatSearch("")} style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:14,color:C.sub}}>×</button>}
                        </div>
                        {chatSearch&&<div style={{fontSize:10,color:C.sub,marginTop:4}}>{filtered.length} Ergebnis{filtered.length!==1?"se":""}</div>}
                      </div>
                      {/* Contact list */}
                      <div style={{padding:"4px 8px 10px",maxHeight:"65vh",overflowY:"auto"}}>
                        {filtered.length===0?(
                          <div style={{textAlign:"center",padding:"24px 0",color:"#bbb"}}>
                            <div style={{fontSize:28,marginBottom:6}}>🔍</div>
                            <div style={{fontSize:12}}>Kein Kontakt gefunden für „{chatSearch}"</div>
                          </div>
                        ):filtered.map(c=><ContactItem key={c.id} c={c}/>)}
                      </div>
                    </div>
                  )
              ):(
                <div style={{display:"flex",gap:12,height:"calc(100vh - 142px)"}}>
                  {/* Contact sidebar */}
                  <div style={{width:270,flexShrink:0,background:"#fff",borderRadius:10,border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",overflow:"hidden"}}>
                    {/* Search bar */}
                    <div style={{padding:"10px 10px 6px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
                      <div style={{position:"relative"}}>
                        <input value={chatSearch} onChange={e=>setChatSearch(e.target.value)}
                          placeholder="Suchen…"
                          style={{width:"100%",border:`1.5px solid ${chatSearch?C.navy:C.border}`,borderRadius:8,padding:"7px 10px 7px 32px",fontSize:12,background:C.bg,color:C.text,boxSizing:"border-box"}}/>
                        <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:13,opacity:.5}}>🔍</span>
                        {chatSearch&&<button onClick={()=>setChatSearch("")} style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:13,color:C.sub}}>×</button>}
                      </div>
                      {chatSearch?
                        <div style={{fontSize:10,color:C.sub,marginTop:3}}>{filtered.length} Ergebnisse</div>:
                        <div style={{fontSize:10,color:C.sub,marginTop:3}}>{myCons.length} Kontakte{totalUnread>0?` · ${totalUnread} ungelesen`:""}</div>
                      }
                    </div>
                    {/* Contacts */}
                    <div style={{flex:1,overflowY:"auto",padding:"6px 8px"}}>
                      {filtered.length===0?(
                        <div style={{textAlign:"center",padding:"24px 12px",color:"#bbb"}}>
                          <div style={{fontSize:24,marginBottom:6}}>🔍</div>
                          <div style={{fontSize:11}}>Niemand gefunden für<br/>„{chatSearch}"</div>
                          <button onClick={()=>setChatSearch("")} style={{marginTop:8,background:C.navyLight,color:C.navy,border:"none",borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer",fontWeight:600}}>Suche löschen</button>
                        </div>
                      ):filtered.map(c=><ContactItem key={c.id} c={c} compact/>)}
                    </div>
                  </div>
                  {/* Chat window */}
                  <div style={{flex:1,background:"#fff",borderRadius:10,border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
                    <ChatWin/>
                  </div>
                </div>
              )}
            </div>
            );
          })()}

          {/* ══ TEAM-FEED ══ */}
          {tab==="feed"&&hasPerm(cu,"feed")&&(
            <div style={{maxWidth:590}}>
              <h1 style={{fontSize:mob?18:20,fontWeight:800,marginBottom:11}}>Team-Feed</h1>
              <div style={{background:"#fff",borderRadius:10,padding:12,border:`1px solid ${C.border}`,marginBottom:10}}>
                <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                  <Av u={cu} size={28}/>
                  <textarea value={newPost} onChange={e=>setNewPost(e.target.value)} placeholder="Update teilen…" rows={2} style={{flex:1,border:`1.5px solid ${C.border}`,borderRadius:7,padding:"7px 10px",fontSize:13,background:C.bg,resize:"none",color:C.text}}/>
                </div>
                <div style={{display:"flex",justifyContent:"flex-end",marginTop:7}}><button className="bo" onClick={()=>{if(!newPost.trim())return;setFeed(p=>[{id:p.length+1,author:cu.id,type:"update",text:newPost,time:new Date().toLocaleTimeString("de",{hour:"2-digit",minute:"2-digit"}),date:"03.05.2026",likes:0,comments:[]},...p]);setNewPost("");}} style={{opacity:newPost.trim()?1:.5}}>Posten</button></div>
              </div>
              {feed.map(f=>{const a=users.find(u=>u.id===f.author);return(
                <div key={f.id} style={{background:"#fff",borderRadius:10,padding:13,border:`1px solid ${C.border}`,marginBottom:8}}>
                  <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}>
                    <Av u={a} size={30}/>
                    <div style={{flex:1}}><div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}><div style={{fontWeight:700,fontSize:13}}>{a?.name}</div><RB role={a?.role}/></div><div style={{fontSize:10,color:C.sub}}>{f.date} · {f.time}</div></div>
                    <span style={{background:f.type==="announcement"?C.navyLight:f.type==="repair"?C.greenL:C.orangeLight,color:f.type==="announcement"?C.navy:f.type==="repair"?C.green:C.orange,borderRadius:5,padding:"2px 7px",fontSize:9,fontWeight:700}}>
                      {f.type==="announcement"?"📢 Ankündigung":f.type==="repair"?"🔧 Auftrag":"📌 Update"}
                    </span>
                  </div>
                  <p style={{fontSize:13,color:C.text,lineHeight:1.6}}>{f.text}</p>
                  <div style={{display:"flex",gap:10,marginTop:8,paddingTop:8,borderTop:`1px solid ${C.border}`}}>
                    <button onClick={()=>setFeed(p=>p.map(x=>x.id===f.id?{...x,likes:x.likes+1}:x))} style={{background:"transparent",color:C.sub,fontSize:12}}>👍 {f.likes}</button>
                    <button style={{background:"transparent",color:C.sub,fontSize:12}}>💬 {f.comments.length}</button>
                  </div>
                </div>
              );})}
            </div>
          )}

          {/* ══ FOTOGALERIE ══ */}
          {tab==="gallery"&&hasPerm(cu,"gallery")&&(
            <div>
              <h1 style={{fontSize:mob?18:20,fontWeight:800,marginBottom:11}}>Fotogalerie</h1>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:9}}>
                {myRepairs.map(r=>(
                  <div key={r.id} className="ch" style={{background:"#fff",borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",height:95}}>
                      {["before","after"].map(t=>(
                        <div key={t} style={{background:t==="before"?C.yellowL:C.greenL,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRight:t==="before"?`1px solid ${C.border}`:"none",position:"relative",overflow:"hidden"}}>
                          {r.photos[t]&&r.photos[t]!=="uploaded"?<img src={r.photos[t]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                            :r.photos[t]==="uploaded"?<><span style={{fontSize:20}}>{t==="before"?"🔨":"✨"}</span></>
                            :<span style={{fontSize:16,opacity:.15}}>📷</span>}
                          <span style={{position:"absolute",bottom:2,right:2,fontSize:7,fontWeight:700,background:t==="before"?C.orange:C.green,color:"#fff",borderRadius:3,padding:"1px 3px"}}>{t==="before"?"VOR":"NACH"}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{padding:"7px 9px"}}><div style={{fontSize:11,fontWeight:700,marginBottom:3}}>{r.title}</div><SB status={r.status}/></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ PROJEKTE ══ */}
          {tab==="projects"&&hasPerm(cu,"projects")&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11,flexWrap:"wrap",gap:7}}>
                <div><h1 style={{fontSize:mob?18:20,fontWeight:800}}>Projekte</h1>
                  <p style={{color:C.sub,fontSize:12,marginTop:2}}>{myProjs.filter(p=>p.status==="active").length} aktiv</p></div>
                {isRoot(cu)&&<button className="bo" onClick={()=>{setFProj(BLANK_PROJ);setMatList([]);setReqList([]);setMProj(true);}}>+ Neues Projekt</button>}
              </div>
              {mob?(
                pPanel&&selP?<div style={{background:"#fff",borderRadius:10,border:`1px solid ${C.border}`,height:"calc(100vh - 170px)",overflow:"hidden"}}><ProjDetail proj={selP}/></div>:(
                  <div style={{background:"#fff",borderRadius:10,border:`1px solid ${C.border}`,padding:"10px 9px"}}>
                    {myProjs.map(p=>(
                      <div key={p.id} className="ch" onClick={()=>{setSelP(p);setPPanel(true);}} style={{padding:"10px",borderRadius:8,border:`1.5px solid ${p.stopReason?"#FECACA":C.border}`,marginBottom:4,cursor:"pointer",background:C.bg}}>
                        <div style={{display:"flex",justifyContent:"space-between",gap:5,marginBottom:5}}><div style={{fontSize:12,fontWeight:700,flex:1,lineHeight:1.3}}>{p.name}</div><SB status={p.status}/></div>
                        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}><Tag bg="#F9FAFB" color={C.sub}>📍 {p.location}</Tag><Tag>{p.entity}</Tag></div>
                        <div style={{fontSize:10,color:C.sub,marginTop:4}}>{totalHrs(p.worklog)}h / {p.expectedHours}h · {p.area}m²</div>
                        {p.stopReason&&<div style={{fontSize:10,color:C.red,marginTop:3}}>⛔ {p.stopReason.slice(0,45)}</div>}
                      </div>
                    ))}
                  </div>
                )
              ):(
                <div style={{display:"flex",gap:12}}>
                  <div style={{width:290,flexShrink:0,background:"#fff",borderRadius:10,border:`1px solid ${C.border}`,overflowY:"auto",maxHeight:"calc(100vh - 150px)"}}>
                    <div style={{padding:"10px 9px 0"}}>
                      {myProjs.map(p=>(
                        <div key={p.id} className="ch" onClick={()=>setSelP(p)} style={{padding:"10px",borderRadius:8,border:`1.5px solid ${selP?.id===p.id?C.navy:p.stopReason?"#FECACA":C.border}`,marginBottom:4,cursor:"pointer",background:selP?.id===p.id?C.navyLight:C.bg,transition:"all .15s"}}>
                          <div style={{display:"flex",justifyContent:"space-between",gap:5,marginBottom:5}}><div style={{fontSize:12,fontWeight:700,flex:1,lineHeight:1.3}}>{p.name}</div><SB status={p.status}/></div>
                          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:3}}><Tag bg="#F9FAFB" color={C.sub}>{p.location}</Tag></div>
                          <div style={{fontSize:10,color:C.sub}}>{totalHrs(p.worklog)}h / {p.expectedHours}h · {p.area}m²</div>
                          {p.stopReason&&<div style={{fontSize:10,color:C.red,marginTop:2}}>⛔ {p.stopReason.slice(0,38)}</div>}
                        </div>
                      ))}
                      <div style={{height:10}}/>
                    </div>
                  </div>
                  <div style={{flex:1,background:"#fff",borderRadius:10,border:`1px solid ${C.border}`,minWidth:0,maxHeight:"calc(100vh - 150px)",overflow:"hidden"}}><ProjDetail proj={selP}/></div>
                </div>
              )}
            </div>
          )}

          {/* ══ AUFTRÄGE ══ */}
          {tab==="repairs"&&hasPerm(cu,"repairs")&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11,flexWrap:"wrap",gap:7}}>
                <div>
                  <h1 style={{fontSize:mob?18:20,fontWeight:800}}>Aufträge & Reparaturen</h1>
                  <p style={{color:C.sub,fontSize:12,marginTop:2}}>
                    {myRepairs.filter(r=>r.status==="open").length} offen ·{" "}
                    {myRepairs.filter(r=>r.status==="in-progress").length} aktiv ·{" "}
                    {myRepairs.filter(r=>r.status==="stopped").length} gestoppt ·{" "}
                    {myRepairs.filter(r=>r.status==="done").length} erledigt
                  </p>
                </div>
                {(isRoot(cu)||cu.role==="va")&&<button className="bo" onClick={()=>{setFR(BLANK_R);setRMatRows([]);setMAddR(true);}}>+ Neuer Auftrag</button>}
              </div>
              {mob?(
                rPanel&&selR?
                <div style={{background:"#fff",borderRadius:10,border:`1px solid ${C.border}`,height:"calc(100vh - 168px)",overflow:"hidden"}}>
                  <RepairDetail r={selR}/>
                </div>:(
                  <div style={{background:"#fff",borderRadius:10,border:`1px solid ${C.border}`,padding:"10px 9px"}}>
                    {myRepairs.map(r=>{
                      const asgn=users.find(u=>u.id===r.assignedTo);
                      return(
                        <div key={r.id} className="ch" onClick={()=>{setSelR(r);setRPanel(true);setNC("");setNRM({name:"",qty:1,unit:"Stk"});}}
                          style={{padding:"10px",borderRadius:8,border:`1.5px solid ${r.status==="stopped"?"#FECACA":C.border}`,marginBottom:4,cursor:"pointer",background:C.bg}}>
                          <div style={{display:"flex",justifyContent:"space-between",gap:5,marginBottom:5}}><div style={{fontSize:12,fontWeight:700,flex:1,lineHeight:1.3}}>{r.title}</div><PD priority={r.priority}/></div>
                          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:3}}><SB status={r.status}/><Tag bg="#F9FAFB" color={C.sub}>📍 {r.room}</Tag></div>
                          <div style={{display:"flex",alignItems:"center",gap:5}}><Av u={asgn} size={16}/><span style={{fontSize:10,color:C.sub}}>{asgn?.name}</span></div>
                          {r.stopReason&&<div style={{fontSize:10,color:C.red,marginTop:3}}>⛔ {r.stopReason.slice(0,40)}</div>}
                        </div>
                      );
                    })}
                  </div>
                )
              ):(
                <div style={{display:"flex",gap:12,height:"calc(100vh - 150px)"}}>
                  <div style={{width:290,flexShrink:0,background:"#fff",borderRadius:10,border:`1px solid ${C.border}`,overflowY:"auto"}}>
                    <div style={{padding:"10px 9px 0"}}>
                      {myRepairs.map(r=>{
                        const asgn=users.find(u=>u.id===r.assignedTo);
                        return(
                          <div key={r.id} className="ch" onClick={()=>{setSelR(r);setNC("");setNRM({name:"",qty:1,unit:"Stk"});}}
                            style={{padding:"10px",borderRadius:8,border:`1.5px solid ${selR?.id===r.id?C.navy:r.status==="stopped"?"#FECACA":C.border}`,marginBottom:4,cursor:"pointer",background:selR?.id===r.id?C.navyLight:C.bg,transition:"all .15s"}}>
                            <div style={{display:"flex",justifyContent:"space-between",gap:5,marginBottom:5}}><div style={{fontSize:12,fontWeight:700,flex:1,lineHeight:1.3}}>{r.title}</div><PD priority={r.priority}/></div>
                            <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}><SB status={r.status}/>{r.type&&<Tag bg={C.orangeLight} color={C.orange}>{r.type}</Tag>}</div>
                            <div style={{display:"flex",alignItems:"center",gap:5}}>
                              <Av u={asgn} size={16}/><span style={{fontSize:10,color:C.sub}}>{asgn?.name}</span>
                              {(r.photos.before||r.photos.after)&&<span style={{fontSize:10,background:C.greenL,color:C.green,borderRadius:4,padding:"0 5px",marginLeft:"auto"}}>📷</span>}
                              {r.comments?.length>0&&<span style={{fontSize:10,background:C.navyLight,color:C.navy,borderRadius:4,padding:"0 5px"}}>💬{r.comments.length}</span>}
                            </div>
                            {r.stopReason&&<div style={{fontSize:10,color:C.red,marginTop:2}}>⛔ {r.stopReason.slice(0,34)}</div>}
                          </div>
                        );
                      })}
                      <div style={{height:10}}/>
                    </div>
                  </div>
                  <div style={{flex:1,background:"#fff",borderRadius:10,border:`1px solid ${C.border}`,minWidth:0,overflow:"hidden"}}>
                    <RepairDetail r={selR}/>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* ══ ARBEITSPLAN ══ */}
          {tab==="schedule"&&hasPerm(cu,"schedule")&&(()=>{
            const weekDates=getWeekDates(selWeek);
            const kw=selWeek.split("-")[1];
            const month=weekDates[0].getMonth();
            const year=weekDates[0].getFullYear();
            const MONTHS=["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];
            const MONTHS_FULL=["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];

            // visible users based on role
            const visibleUsers = cu.role==="ma"
              ? [cu]
              : cu.role==="va"
                ? users.filter(u=>u.active&&(u.id===cu.id||u.dept===cu.dept)&&u.role!=="partner")
                : users.filter(u=>u.active&&u.role!=="partner"&&u.role!=="it");

            // compute monthly hours for a user
            const monthlyStats=(userId,m,y)=>{
              const entries=sched.filter(s=>{
                if(s.userId!==userId) return false;
                const[sy,sw]=s.week.split("-").map(Number);
                const wd=getWeekDates(`${sy}-${String(sw).padStart(2,"0")}`);
                return wd[s.day]?.getMonth()===m && wd[s.day]?.getFullYear()===y;
              });
              return {
                work:    entries.filter(s=>s.type==="work"),
                sick:    entries.filter(s=>s.type==="sick"),
                vacation:entries.filter(s=>s.type==="vacation"),
                off:     entries.filter(s=>s.type==="off"),
                hours:   entries.filter(s=>s.type==="work").reduce((a,s)=>a+(s.hours||0),0),
              };
            };

            return(
            <div>
              {/* Header */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11,flexWrap:"wrap",gap:7}}>
                <div>
                  <h1 style={{fontSize:mob?18:20,fontWeight:800}}>Arbeitsplan</h1>
                  <p style={{color:C.sub,fontSize:12,marginTop:2}}>KW {kw} · {MONTHS_FULL[weekDates[0].getMonth()]} {year}</p>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {(isRoot(cu)||cu.role==="va")&&(
                    <button className="bo" onClick={()=>{setNLR({userId:isRoot(cu)?visibleUsers[0]?.id||cu.id:cu.id,day:0,week:selWeek,shift:"07:00–15:00",type:"work",hours:8});setMShift(true);}}>+ Schicht</button>
                  )}                </div>
              </div>

              {/* Sub-tabs */}
              <div style={{display:"flex",gap:4,marginBottom:13,background:C.bg,borderRadius:8,padding:4,border:`1px solid ${C.border}`,width:"fit-content"}}>
                {[["week","📅 Woche"],["month","📊 Monatsübersicht"],["stats","📈 Statistik"]].map(([id,label])=>(
                  <button key={id} onClick={()=>setSchedTab(id)}
                    style={{padding:"5px 12px",borderRadius:6,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",
                      background:schedTab===id?C.navy:"transparent",color:schedTab===id?"#fff":C.sub}}>
                    {label}
                  </button>
                ))}
              </div>

              {/* ── WEEK VIEW ── */}
              {schedTab==="week"&&(<div>
                {/* Week navigation */}
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <button onClick={prevWeek} style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:7,padding:"5px 12px",fontSize:13,cursor:"pointer",fontWeight:700}}>‹</button>
                  <div style={{flex:1,textAlign:"center",fontWeight:700,fontSize:13}}>
                    KW {kw} · {weekDates[0].toLocaleDateString("de-DE",{day:"2-digit",month:"short"})} – {weekDates[6].toLocaleDateString("de-DE",{day:"2-digit",month:"short",year:"numeric"})}
                  </div>
                  <button onClick={nextWeek} style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:7,padding:"5px 12px",fontSize:13,cursor:"pointer",fontWeight:700}}>›</button>
                  <button onClick={()=>setSelWeek(getWeekKey(new Date()))} style={{background:C.navyLight,color:C.navy,border:`1px solid ${C.border}`,borderRadius:7,padding:"5px 10px",fontSize:11,cursor:"pointer",fontWeight:700}}>Heute</button>
                </div>

                {/* Legend */}
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:9}}>
                  {Object.entries(SHIFTS_C).map(([k,v])=>(
                    <div key={k} style={{display:"flex",alignItems:"center",gap:4,background:v.bg,borderRadius:5,padding:"2px 8px",border:`1px solid ${v.color}33`}}>
                      <div style={{width:7,height:7,borderRadius:"50%",background:v.color}}/>
                      <span style={{fontSize:10,fontWeight:600,color:v.color}}>{v.label}</span>
                    </div>
                  ))}
                </div>

                {/* Table */}
                <div style={{background:"#fff",borderRadius:10,border:`1px solid ${C.border}`,overflow:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",minWidth:mob?520:650}}>
                    <thead>
                      <tr style={{background:C.navy}}>
                        <th style={{padding:"9px 12px",textAlign:"left",fontSize:11,color:"#fff",fontWeight:700,minWidth:130,position:"sticky",left:0,background:C.navy,zIndex:2}}>Mitarbeiter</th>
                        {DAYS.map((d,i)=>(
                          <th key={i} style={{padding:"7px 5px",textAlign:"center",fontSize:10,color:"#fff",fontWeight:700,minWidth:90}}>
                            <div>{d}</div>
                            <div style={{fontSize:9,opacity:.7,fontWeight:400}}>{weekDates[i]?.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"})}</div>
                          </th>
                        ))}
                        <th style={{padding:"7px 8px",textAlign:"center",fontSize:10,color:"#fff",fontWeight:700,minWidth:60}}>Σ Std.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleUsers.map(usr=>{
                        const weekEntries=DAYS.map((_,di)=>sched.find(s=>s.userId===usr.id&&s.day===di&&s.week===selWeek));
                        const weekHrs=weekEntries.reduce((a,s)=>a+(s?.hours||0),0);
                        const canEdit=isRoot(cu)||(cu.role==="va"&&usr.dept===cu.dept);
                        return(
                          <tr key={usr.id} style={{borderBottom:`1px solid ${C.border}`}}>
                            <td style={{padding:"8px 12px",position:"sticky",left:0,background:"#fff",zIndex:1}}>
                              <div style={{display:"flex",alignItems:"center",gap:7}}>
                                <Av u={usr} size={24}/>
                                <div>
                                  <div style={{fontSize:11,fontWeight:700,color:C.text}}>{usr.name.split(" ")[0]}</div>
                                  <div style={{fontSize:9,color:C.sub}}>{usr.dept}</div>
                                </div>
                              </div>
                            </td>
                            {DAYS.map((_,di)=>{
                              const s=weekEntries[di];
                              const sc=s?SHIFTS_C[s.type]:null;
                              return(
                                <td key={di} style={{padding:"3px",textAlign:"center",verticalAlign:"middle"}}>
                                  {sc?(
                                    <div style={{background:sc.bg,borderRadius:6,padding:"5px 3px",border:`1px solid ${sc.color}44`}}>
                                      <div style={{fontSize:9,fontWeight:700,color:sc.color,lineHeight:1.3}}>{s.shift}</div>
                                      <div style={{fontSize:8,color:sc.color,marginTop:1}}>{sc.label}</div>
                                      {s.hours>0&&<div style={{fontSize:8,color:sc.color,opacity:.7}}>{s.hours}h</div>}
                                      {canEdit&&(
                                        <div style={{display:"flex",gap:2,justifyContent:"center",marginTop:3}}>
                                          <button onClick={()=>{setNLR({userId:usr.id,day:di,week:selWeek,shift:s.shift,type:s.type,hours:s.hours});setMShift(true);}}
                                            style={{background:"rgba(255,255,255,.7)",border:"none",borderRadius:3,padding:"1px 5px",fontSize:8,cursor:"pointer",color:C.navy,fontWeight:700}}>✏</button>
                                          <button onClick={()=>{
                                            setSched(p=>p.filter(x=>!(x.userId===usr.id&&x.day===di&&x.week===selWeek)));
                                            addNotif(usr.id,"schedule_update","📅 Schicht gelöscht",
                                              `${cu.name} hat Ihre Schicht am ${WDAYS[di]} (KW ${kw}) gelöscht.`);
                                          }} style={{background:"rgba(220,38,38,.15)",border:"none",borderRadius:3,padding:"1px 5px",fontSize:8,cursor:"pointer",color:C.red,fontWeight:700}}>✕</button>
                                        </div>
                                      )}
                                    </div>
                                  ):(
                                    canEdit?(
                                      <button onClick={()=>{setNLR({userId:usr.id,day:di,week:selWeek,shift:"07:00–15:00",type:"work",hours:8});setMShift(true);}}
                                        style={{background:"transparent",border:`1px dashed ${C.border}`,borderRadius:5,padding:"4px 3px",fontSize:9,color:C.sub,cursor:"pointer",width:"100%"}}>+</button>
                                    ):<span style={{color:"#ddd",fontSize:11}}>–</span>
                                  )}
                                </td>
                              );
                            })}
                            <td style={{padding:"4px 8px",textAlign:"center",fontWeight:800,fontSize:13,color:C.navy}}>{weekHrs}h</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>)}

              {/* ── MONTH VIEW ── */}
              {schedTab==="month"&&(<div>
                <div style={{fontWeight:700,fontSize:14,marginBottom:11,color:C.navy}}>📊 {MONTHS_FULL[month]} {year} — Monatsübersicht</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
                  {visibleUsers.map(usr=>{
                    const st=monthlyStats(usr.id,month,year);
                    return(
                      <div key={usr.id} style={{background:"#fff",borderRadius:12,padding:14,border:`1px solid ${C.border}`}}>
                        <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:11}}>
                          <Av u={usr} size={36}/>
                          <div>
                            <div style={{fontWeight:700,fontSize:13}}>{usr.name}</div>
                            <div style={{fontSize:11,color:C.sub}}>{usr.dept}</div>
                          </div>
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
                          {[
                            {l:"Arbeitsstunden",v:`${st.hours}h`,c:C.navy,bg:C.navyLight,i:"⏱"},
                            {l:"Arbeitstage",v:`${st.work.length}`,c:"#059669",bg:"#F0FDF4",i:"✅"},
                            {l:"Urlaubstage",v:`${st.vacation.length}`,c:"#D97706",bg:"#FFFBEB",i:"🏖"},
                            {l:"Krankheitstage",v:`${st.sick.length}`,c:C.red,bg:C.redL,i:"🤒"},
                          ].map(x=>(
                            <div key={x.l} style={{background:x.bg,borderRadius:7,padding:"7px 9px",borderLeft:`3px solid ${x.c}`}}>
                              <div style={{fontSize:9,color:x.c,fontWeight:700,marginBottom:2}}>{x.i} {x.l}</div>
                              <div style={{fontSize:18,fontWeight:800,color:x.c}}>{x.v}</div>
                            </div>
                          ))}
                        </div>
                        {/* Progress bar */}
                        <div>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.sub,marginBottom:3}}>
                            <span>Auslastung</span>
                            <span>{Math.round(st.hours/(22*8)*100)}%</span>
                          </div>
                          <div style={{background:C.border,borderRadius:4,height:6}}>
                            <div style={{width:`${Math.min(100,Math.round(st.hours/(22*8)*100))}%`,height:"100%",background:C.orange,borderRadius:4}}/>
                          </div>
                          <div style={{fontSize:9,color:C.sub,marginTop:2}}>{st.hours}h von ~176h (22 Arbeitstage)</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>)}

              {/* ── STATS VIEW ── */}
              {schedTab==="stats"&&(<div>
                <div style={{fontWeight:700,fontSize:14,marginBottom:11,color:C.navy}}>📈 Jahresstatistik {year}</div>
                <div style={{background:"#fff",borderRadius:10,border:`1px solid ${C.border}`,overflow:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>
                    <thead>
                      <tr style={{background:C.navy}}>
                        <th style={{padding:"9px 12px",textAlign:"left",fontSize:11,color:"#fff",fontWeight:700,position:"sticky",left:0,background:C.navy,minWidth:140}}>Mitarbeiter</th>
                        {MONTHS.map(m=><th key={m} style={{padding:"7px 6px",textAlign:"center",fontSize:10,color:"#fff",fontWeight:700,minWidth:55}}>{m}</th>)}
                        <th style={{padding:"7px 8px",textAlign:"center",fontSize:10,color:"#fff",fontWeight:700}}>Gesamt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleUsers.map(usr=>{
                        const monthHrs=MONTHS.map((_,mi)=>monthlyStats(usr.id,mi,year).hours);
                        const total=monthHrs.reduce((a,h)=>a+h,0);
                        return(
                          <tr key={usr.id} style={{borderBottom:`1px solid ${C.border}`}}>
                            <td style={{padding:"8px 12px",position:"sticky",left:0,background:"#fff"}}>
                              <div style={{display:"flex",alignItems:"center",gap:6}}>
                                <Av u={usr} size={20}/>
                                <div style={{fontSize:11,fontWeight:700}}>{usr.name.split(" ")[0]}</div>
                              </div>
                            </td>
                            {monthHrs.map((h,mi)=>(
                              <td key={mi} style={{padding:"5px 6px",textAlign:"center",background:h===0?"transparent":h<80?C.yellowL:C.greenL}}>
                                <span style={{fontSize:11,fontWeight:h>0?700:400,color:h===0?"#ccc":h<80?C.yellow:C.green}}>{h>0?`${h}h`:"–"}</span>
                              </td>
                            ))}
                            <td style={{padding:"5px 8px",textAlign:"center",fontWeight:800,color:C.navy,fontSize:13}}>{total}h</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Team summary */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:8,marginTop:12}}>
                  {[
                    {l:"Arbeitsstunden gesamt",v:sched.filter(s=>s.type==="work").reduce((a,s)=>a+(s.hours||0),0)+"h",i:"⏱",c:C.navy,bg:C.navyLight},
                    {l:"Krankheitstage gesamt",v:sched.filter(s=>s.type==="sick").length,i:"🤒",c:C.red,bg:C.redL},
                    {l:"Urlaubstage gesamt",v:sched.filter(s=>s.type==="vacation").length,i:"🏖",c:"#D97706",bg:"#FFFBEB"},
                    {l:"Freie Tage gesamt",v:sched.filter(s=>s.type==="off").length,i:"📆",c:C.sub,bg:"#F9FAFB"},
                  ].map(s=>(
                    <div key={s.l} style={{background:"#fff",borderRadius:8,padding:"10px 12px",border:`1px solid ${C.border}`,borderLeft:`4px solid ${s.c}`}}>
                      <div style={{fontSize:22,marginBottom:4}}>{s.i}</div>
                      <div style={{fontSize:18,fontWeight:800,color:s.c}}>{s.v}</div>
                      <div style={{fontSize:10,color:C.sub,marginTop:2,lineHeight:1.4}}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>)}
            </div>
            );
          })()}



          {/* ══ LAGER ══ */}
          {tab==="warehouse"&&hasPerm(cu,"warehouse")&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11,flexWrap:"wrap",gap:7}}>
                <h1 style={{fontSize:mob?18:20,fontWeight:800}}>Lagerverwaltung</h1>
                <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                  <button className="bo" onClick={()=>setMWMat(true)}>+ Material</button>
                  <button className="bp" onClick={()=>setMOrder(true)}>+ Bestellung</button>
                  <button onClick={()=>setPdfContent(buildPdfHtml("warehouse",{mats,orders},{by:cu.name}))} style={{background:C.navyLight,color:C.navy,border:`1px solid ${C.border}`,borderRadius:7,padding:"7px 11px",fontSize:12,fontWeight:600}}>📄 PDF</button>
                </div>
              </div>
              {lowStock.length>0&&<div style={{background:C.yellowL,border:"1px solid #FDE68A",borderRadius:9,padding:"8px 11px",marginBottom:10,display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:16}}>⚠</span><div><div style={{fontSize:12,fontWeight:700,color:C.yellow}}>Lagerbestand niedrig</div><div style={{fontSize:11,color:C.sub}}>{lowStock.map(m=>`${m.name} (${m.qty} ${m.unit})`).join(" · ")}</div></div></div>}
              <div style={{background:"#fff",borderRadius:10,border:`1px solid ${C.border}`,marginBottom:11,overflow:"auto"}}>
                <div style={{padding:"10px 12px",borderBottom:`1px solid ${C.border}`,fontWeight:700,fontSize:13}}>📦 Materialbestand</div>
                <table className="list">
                  <thead><tr><th>Material</th><th>Kategorie</th><th>Bestand</th><th>Einheit</th><th>Mindest</th><th>Preis</th><th>Status</th></tr></thead>
                  <tbody>{mats.map(m=>(
                    <tr key={m.id}>
                      <td style={{fontWeight:600}}>{m.name}</td><td><Tag>{m.category}</Tag></td>
                      <td style={{fontWeight:700,color:m.qty<=m.minQty?C.red:C.text}}>{m.qty}</td>
                      <td>{m.unit}</td><td style={{color:C.sub}}>{m.minQty}</td><td style={{color:C.sub}}>{m.price.toFixed(2)} €</td>
                      <td>{m.qty<=m.minQty?<span style={{background:C.redL,color:C.red,borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>⚠ Niedrig</span>:<span style={{background:C.greenL,color:C.green,borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>✓ OK</span>}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <div style={{background:"#fff",borderRadius:10,border:`1px solid ${C.border}`,overflow:"auto"}}>
                <div style={{padding:"10px 12px",borderBottom:`1px solid ${C.border}`,fontWeight:700,fontSize:13}}>🔄 Bestellungen</div>
                <table className="list">
                  <thead><tr><th>Typ</th><th>Material</th><th>Menge</th><th>Einheit</th><th>Lieferant</th><th>Datum</th><th>Betrag</th><th>Status</th></tr></thead>
                  <tbody>{orders.map(o=>(
                    <tr key={o.id}>
                      <td><span style={{background:o.type==="eingang"?C.greenL:C.orangeLight,color:o.type==="eingang"?C.green:C.orange,borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>{o.type==="eingang"?"📥 Eingang":"📤 Ausgang"}</span></td>
                      <td style={{fontWeight:600}}>{o.material}</td><td>{o.qty}</td><td>{o.unit}</td><td style={{color:C.sub}}>{o.supplier}</td><td style={{color:C.sub}}>{o.date}</td>
                      <td style={{fontWeight:700}}>{o.priceTotal?.toFixed(2)||"–"} €</td>
                      <td><span style={{background:o.status==="ausstehend"?C.yellowL:C.greenL,color:o.status==="ausstehend"?C.yellow:C.green,borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>{o.status}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ MITARBEITER ══ */}
          {tab==="users"&&isRoot(cu)&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11,flexWrap:"wrap",gap:7}}>
                <h1 style={{fontSize:mob?18:20,fontWeight:800}}>Mitarbeiterverwaltung</h1>
                <button className="bo" onClick={()=>{setFUser(BLANK_USER);setMUser("new");}}>+ Mitarbeiter hinzufügen</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:9}}>
                {users.map(u=>(
                  <div key={u.id} className="ch" style={{background:"#fff",borderRadius:10,padding:13,border:`1px solid ${C.border}`,opacity:u.active?1:.6}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <Av u={u} size={36}/><div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{u.name}</div><RB role={u.role}/></div>
                      <div style={{width:8,height:8,borderRadius:"50%",background:u.active?"#10B981":"#D1D5DB"}}/>
                    </div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}><Tag>{u.dept}</Tag><Tag bg="#F9FAFB" color={C.sub}>{u.entity}</Tag></div>
                    <div style={{background:C.bg,borderRadius:7,padding:"6px 8px",marginBottom:8,border:`1px solid ${C.border}`}}>
                      <div style={{fontSize:9,fontWeight:700,color:C.sub,marginBottom:4}}>BERECHTIGUNGEN</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                        {isRoot(u)?<span style={{background:C.orangeLight,color:C.orange,borderRadius:4,padding:"1px 5px",fontSize:10,fontWeight:700}}>👑 Vollzugriff</span>
                        :ALL_PERMS.map(p=>(
                          <span key={p.key} title={p.label} style={{background:u.perms?.[p.key]?C.greenL:C.redL,color:u.perms?.[p.key]?C.green:C.red,borderRadius:4,padding:"1px 5px",fontSize:9,fontWeight:600}}>
                            {u.perms?.[p.key]?"✓":"✗"} {p.icon}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:5}}>
                      <button onClick={()=>{setFUser({...u});setMUser(u);}} style={{flex:1,background:C.navyLight,color:C.navy,border:`1px solid ${C.border}`,borderRadius:7,padding:"5px",fontSize:11,fontWeight:600}}>✏ Bearbeiten</button>
                      <button onClick={()=>setUsers(p=>p.map(x=>x.id===u.id?{...x,active:!x.active}:x))} style={{flex:1,background:u.active?C.redL:C.greenL,color:u.active?C.red:C.green,border:`1px solid ${u.active?"#FECACA":"#6EE7B7"}`,borderRadius:7,padding:"5px",fontSize:11,fontWeight:600}}>
                        {u.active?"Deaktivieren":"Aktivieren"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ BERICHTE ══ */}
          {tab==="reports"&&hasPerm(cu,"reports")&&(
            <div>
              <h1 style={{fontSize:mob?18:20,fontWeight:800,marginBottom:11}}>Berichte & PDF-Export</h1>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:9}}>
                {[
                  {t:"Lager & Bestellungen",d:"Materialien & Bestellübersicht",i:"📦",f:()=>setPdfContent(buildPdfHtml("warehouse",{mats,orders},{by:cu.name}))},
                  ...myProjs.map(p=>({t:`Projekt: ${p.name.slice(0,22)}`,d:`${p.startDate} · ${totalHrs(p.worklog)}h / ${p.expectedHours}h geplant`,i:"🏗",f:()=>setPdfContent(buildPdfHtml("project",p,{by:cu.name}))})),
                ].map((r,i)=>(
                  <div key={i} className="ch" style={{background:"#fff",borderRadius:10,padding:13,border:`1px solid ${C.border}`}}>
                    <div style={{fontSize:22,marginBottom:7}}>{r.i}</div>
                    <div style={{fontWeight:700,fontSize:13,marginBottom:3}}>{r.t}</div>
                    <div style={{fontSize:11,color:C.sub,marginBottom:10,lineHeight:1.4}}>{r.d}</div>
                    <button onClick={r.f} className="bp" style={{width:"100%",padding:"7px",fontSize:12}}>📄 PDF erstellen</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ SUPPORT ══ */}
          {tab==="support"&&(
            <div style={{maxWidth:600}}>
              <h1 style={{fontSize:mob?18:20,fontWeight:800,marginBottom:4}}>Support & Hilfe</h1>
              <p style={{color:C.sub,fontSize:12,marginBottom:18}}>Bei technischen Problemen oder Fragen zur Anwendung</p>

              {/* Main support card */}
              <div style={{background:"#fff",borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden",marginBottom:12,boxShadow:"0 2px 12px rgba(13,59,110,.06)"}}>
                <div style={{background:`linear-gradient(135deg,${C.navy},#1A5C9A)`,padding:"20px 22px",display:"flex",alignItems:"center",gap:14}}>
                  <div style={{width:50,height:50,background:"rgba(255,255,255,.15)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🔵</div>
                  <div>
                    <div style={{fontSize:18,fontWeight:800,color:"#fff"}}>{APP_CONFIG.supportCompany}</div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,.65)",marginTop:2}}>Offizieller Support-Partner für {APP_CONFIG.appName}</div>
                  </div>
                </div>

                <div style={{padding:"18px 20px"}}>
                  {/* Contact options */}
                  {[
                    {icon:"✉️", label:"E-Mail", value:APP_CONFIG.supportEmail, sub:"Für detaillierte Anfragen und Dokumente", href:`mailto:${APP_CONFIG.supportEmail}`, btnLabel:"E-Mail senden", btnStyle:"bo"},
                    {icon:"📞", label:"Telefon", value:APP_CONFIG.supportPhone, sub:APP_CONFIG.supportHours, href:`tel:${APP_CONFIG.supportPhone.replace(/\s/g,"")}`, btnLabel:"Anrufen", btnStyle:"bgr"},
                    {icon:"🌐", label:"Website", value:APP_CONFIG.supportUrl.replace("https://",""), sub:APP_CONFIG.supportNote, href:APP_CONFIG.supportUrl, btnLabel:"Website öffnen", btnStyle:"bp"},
                  ].map((c,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 0",borderBottom:i<2?`1px solid ${C.border}`:"none"}}>
                      <div style={{width:42,height:42,background:C.bg,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{c.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:11,fontWeight:700,color:C.sub,letterSpacing:".4px",marginBottom:2}}>{c.label.toUpperCase()}</div>
                        <div style={{fontSize:14,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.value}</div>
                        <div style={{fontSize:11,color:C.sub,marginTop:1}}>{c.sub}</div>
                      </div>
                      <a href={c.href} target={c.btnStyle==="bp"?"_blank":"_self"} rel="noreferrer"
                        style={{background:c.btnStyle==="bo"?C.orange:c.btnStyle==="bgr"?C.green:C.navy,color:"#fff",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:600,textDecoration:"none",whiteSpace:"nowrap",flexShrink:0}}>
                        {c.btnLabel}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Response time badge */}
              <div style={{background:C.greenL,border:`1px solid #6EE7B7`,borderRadius:10,padding:"11px 16px",display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <span style={{fontSize:20}}>⚡</span>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:C.green}}>Schnelle Antwortzeit</div>
                  <div style={{fontSize:12,color:C.sub}}>{APP_CONFIG.supportNote} — {APP_CONFIG.supportHours}</div>
                </div>
              </div>

              {/* App info */}
              <div style={{background:"#fff",borderRadius:10,border:`1px solid ${C.border}`,padding:"13px 16px"}}>
                <div style={{fontSize:11,fontWeight:700,color:C.sub,letterSpacing:".4px",marginBottom:10}}>APP-INFORMATIONEN</div>
                {[
                  ["Anwendung",  APP_CONFIG.appName],
                  ["Version",    "1.0.0"],
                  ["Betreiber",  APP_CONFIG.companyName],
                  ["Support",    APP_CONFIG.supportCompany],
                  ["Plattform",  APP_CONFIG.supportUrl],
                ].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
                    <span style={{color:C.sub}}>{k}</span>
                    <span style={{fontWeight:600,color:C.text}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {mob&&(
        <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#fff",borderTop:`2px solid ${C.border}`,padding:"4px 0",zIndex:300,display:"flex",justifyContent:"space-around",alignItems:"center",boxShadow:"0 -2px 8px rgba(13,59,110,.1)"}}>
          {[...NAV.slice(0,5), NAV.find(n=>n.id==="support")].filter(Boolean).map(n=>(
            <button key={n.id} onClick={()=>{setTab(n.id);if(n.id!=="repairs")setRPanel(false);if(n.id!=="projects")setPPanel(false);if(n.id!=="messages"){setSelChat(null);setChatPanel(false);}}}
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,background:"transparent",padding:"3px 3px",position:"relative",minWidth:34}}>
              <span style={{fontSize:14,opacity:tab===n.id?1:.35}}>{n.icon}</span>
              <span style={{fontSize:8,fontWeight:700,color:tab===n.id?C.navy:"#aaa"}}>{n.label}</span>
              {(n.badge??0)>0&&<span style={{position:"absolute",top:0,right:1,background:C.orange,color:"#fff",borderRadius:6,padding:"0 3px",fontSize:8,fontWeight:700}}>{n.badge}</span>}
            </button>
          ))}
        </div>
      )}

      {/* ══ MODALS ══ */}

      {/* ADD/EDIT USER */}
      {mUser&&<Modal title={mUser==="new"?"👤 Mitarbeiter hinzufügen":"✏ Mitarbeiter bearbeiten"} onClose={()=>setMUser(null)} w={500}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:11}}>
          <div style={{gridColumn:"1/-1"}}><Lbl>NAME</Lbl><Inp value={fUser.name} onChange={e=>setFUser(v=>({...v,name:e.target.value}))} placeholder="Vor- und Nachname"/></div>
          <div><Lbl>ROLLE</Lbl><Sel value={fUser.role} onChange={e=>setFUser(v=>({...v,role:e.target.value}))}>{Object.entries(ROLE_CFG).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}</Sel></div>
          <div><Lbl>ABTEILUNG</Lbl><Sel value={fUser.dept} onChange={e=>setFUser(v=>({...v,dept:e.target.value}))}>{DEPTS.map(d=><option key={d}>{d}</option>)}</Sel></div>
          <div><Lbl>EINHEIT / FIRMA</Lbl><Sel value={fUser.entity} onChange={e=>setFUser(v=>({...v,entity:e.target.value}))}>{ENTITIES.map(e=><option key={e}>{e}</option>)}</Sel></div>
          <div><Lbl>PIN (4–6 stellig)</Lbl><Inp type="password" value={fUser.pin} onChange={e=>setFUser(v=>({...v,pin:e.target.value}))} placeholder="z.B. 7890" maxLength={6}/></div>
        </div>
        {(fUser.role!=="admin"&&fUser.role!=="it")&&(
          <div style={{background:C.bg,borderRadius:9,padding:"10px 12px",marginBottom:12,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:11,fontWeight:700,color:C.navy,marginBottom:9}}>🔐 BERECHTIGUNGEN</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {ALL_PERMS.map(p=>(
                <label key={p.key} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",borderRadius:7,background:"#fff",border:`1.5px solid ${fUser.perms?.[p.key]?C.navy:C.border}`,cursor:"pointer"}} onClick={()=>setFUser(v=>({...v,perms:{...v.perms,[p.key]:!v.perms?.[p.key]}}))}>
                  <div style={{width:17,height:17,borderRadius:4,background:fUser.perms?.[p.key]?C.navy:"#fff",border:`2px solid ${fUser.perms?.[p.key]?C.navy:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
                    {fUser.perms?.[p.key]&&<span style={{color:"#fff",fontSize:10,lineHeight:1}}>✓</span>}
                  </div>
                  <span style={{fontSize:12,fontWeight:500}}>{p.icon} {p.label}</span>
                </label>
              ))}
            </div>
            <div style={{marginTop:8,fontSize:10,color:C.sub,background:C.yellowL,borderRadius:5,padding:"4px 8px",border:"1px solid #FDE68A"}}>
              ⚠ Lager & Berichte: Nur Manager & IT haben standardmäßig vollen Zugriff.
            </div>
          </div>
        )}
        {(fUser.role==="admin"||fUser.role==="it")&&<div style={{background:C.orangeLight,borderRadius:8,padding:"7px 10px",marginBottom:12,border:`1px solid ${C.orange}`}}><span style={{fontSize:12,fontWeight:700,color:C.orange}}>👑 Vollzugriff auf alle Bereiche</span></div>}
        <div style={{display:"flex",gap:7}}><button className="bo" onClick={saveUser} style={{flex:1,padding:"9px",fontSize:13}}>{mUser==="new"?"Hinzufügen":"Speichern"}</button><button className="bg" onClick={()=>setMUser(null)}>Abbrechen</button></div>
      </Modal>}

      {/* NEW PROJECT - partner sees simplified form, admin sees full form */}
      {mProj&&<Modal title={isPartner(cu)?"🤝 Projektanfrage stellen":"🏗 Neues Projekt anlegen"} onClose={()=>setMProj(false)} w={620}>
        {isPartner(cu)&&(
          <div style={{background:C.greenL,border:"1px solid #6EE7B7",borderRadius:8,padding:"8px 11px",marginBottom:12,fontSize:12,color:C.green,fontWeight:600}}>
            🤝 Ihre Anfrage wird an die Verwaltung gesendet und nach Prüfung freigegeben.
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:11}}>
          <div style={{gridColumn:"1/-1"}}><Lbl>PROJEKTNAME</Lbl><Inp value={fProj.name} onChange={e=>setFProj(v=>({...v,name:e.target.value}))} placeholder="z.B. Trockenbau Wandesbeker Str."/></div>
          <div><Lbl>STANDORT / OBJEKT</Lbl><Inp value={fProj.location} onChange={e=>setFProj(v=>({...v,location:e.target.value}))} placeholder="z.B. Wandesbeker Ch. 19"/></div>
          {!isPartner(cu)&&<div><Lbl>EINHEIT / FIRMA</Lbl><Sel value={fProj.entity} onChange={e=>setFProj(v=>({...v,entity:e.target.value}))}>{ENTITIES.map(e=><option key={e}>{e}</option>)}</Sel></div>}
          <div><Lbl>STARTDATUM</Lbl><Inp value={fProj.startDate} onChange={e=>setFProj(v=>({...v,startDate:e.target.value}))} placeholder="DD.MM.YYYY"/></div>
          <div><Lbl>ENDDATUM</Lbl><Inp value={fProj.endDate} onChange={e=>setFProj(v=>({...v,endDate:e.target.value}))} placeholder="DD.MM.YYYY"/></div>
          <div><Lbl>FLÄCHE (m²)</Lbl><Inp type="number" value={fProj.area} onChange={e=>setFProj(v=>({...v,area:e.target.value}))} placeholder="0"/></div>
          <div><Lbl>ANZAHL RÄUME</Lbl><Inp type="number" value={fProj.rooms} onChange={e=>setFProj(v=>({...v,rooms:e.target.value}))} placeholder="0"/></div>
          <div><Lbl>ETAGEN</Lbl><Inp type="number" value={fProj.floors} onChange={e=>setFProj(v=>({...v,floors:e.target.value}))} placeholder="1"/></div>
          <div><Lbl>GEPLANTE STUNDEN</Lbl><Inp type="number" value={fProj.expectedHours} onChange={e=>setFProj(v=>({...v,expectedHours:e.target.value}))} placeholder="40"/></div>
          {!isPartner(cu)&&<div><Lbl>VERANTWORTLICH</Lbl><Sel value={fProj.responsibleId} onChange={e=>setFProj(v=>({...v,responsibleId:+e.target.value}))}>{users.filter(u=>u.active&&(u.role==="va"||u.role==="admin")).map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</Sel></div>}
        </div>
        {/* Wer kann bearbeiten — nur für interne Nutzer */}
        {!isPartner(cu)&&<div style={{marginBottom:11}}>
          <Lbl>WER DARF BEARBEITEN?</Lbl>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,background:C.bg,borderRadius:8,padding:"8px 10px",border:`1px solid ${C.border}`}}>
            {users.filter(u=>u.active&&u.role!=="partner").map(u=>{const sel=fProj.editableBy.includes(u.id);return(
              <div key={u.id} onClick={()=>setFProj(v=>({...v,editableBy:sel?v.editableBy.filter(i=>i!==u.id):[...v.editableBy,u.id]}))}
                style={{display:"flex",alignItems:"center",gap:5,padding:"4px 8px",borderRadius:6,background:sel?C.navyLight:"#fff",border:`1.5px solid ${sel?C.navy:C.border}`,cursor:"pointer"}}>
                <Av u={u} size={16}/><span style={{fontSize:11,fontWeight:600}}>{u.name.split(" ")[0]}</span>
                {sel&&<span style={{fontSize:9,color:C.navy,fontWeight:700}}>✓</span>}
              </div>
            );})}
          </div>
        </div>}
        {/* Wer kann sehen — nur für interne Nutzer */}
        {!isPartner(cu)&&<div style={{marginBottom:11}}>
          <Lbl>WER DARF SEHEN?</Lbl>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,background:C.bg,borderRadius:8,padding:"8px 10px",border:`1px solid ${C.border}`}}>
            {users.filter(u=>u.active&&u.role!=="partner").map(u=>{const sel=fProj.visibleTo.includes(u.id)||fProj.editableBy.includes(u.id);return(
              <div key={u.id} onClick={()=>setFProj(v=>({...v,visibleTo:v.visibleTo.includes(u.id)?v.visibleTo.filter(i=>i!==u.id):[...v.visibleTo,u.id]}))}
                style={{display:"flex",alignItems:"center",gap:5,padding:"4px 8px",borderRadius:6,background:sel?C.greenL:"#fff",border:`1.5px solid ${sel?C.green:C.border}`,cursor:"pointer"}}>
                <Av u={u} size={16}/><span style={{fontSize:11,fontWeight:600}}>{u.name.split(" ")[0]}</span>
                {sel&&<span style={{fontSize:9,color:C.green,fontWeight:700}}>✓</span>}
              </div>
            );})}
          </div>
        </div>}
        <div style={{marginBottom:11}}><Lbl>NOTIZEN / BESCHREIBUNG</Lbl><Txt value={fProj.notes} onChange={e=>setFProj(v=>({...v,notes:e.target.value}))} rows={2} placeholder="Beschreibung, besondere Anforderungen…"/></div>

        {/* Inline: Material hinzufügen — bleibt offen */}
        <div style={{background:C.bg,borderRadius:9,padding:"10px 12px",marginBottom:11,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:11,fontWeight:700,color:C.navy,marginBottom:8}}>📦 MATERIALIEN HINZUFÜGEN</div>
          {matList.map((m,i)=>(
            <div key={i} className="row-in" style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
              <span style={{fontSize:12,fontWeight:600,flex:2,minWidth:100}}>{m.name}</span>
              <span style={{fontSize:11,color:C.sub}}>{m.qty} {m.unit} · {m.pricePerUnit.toFixed(2)}€/Einh. · {m.total.toFixed(2)}€</span>
              <button onClick={()=>setMatList(p=>p.filter((_,ri)=>ri!==i))} style={{background:C.redL,color:C.red,border:"none",borderRadius:5,padding:"2px 7px",fontSize:11,cursor:"pointer"}}>✕</button>
            </div>
          ))}
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr auto",gap:6,alignItems:"end"}}>
            <div><Lbl>MATERIAL</Lbl><Inp value={newMatRow.name} onChange={e=>setNMR(v=>({...v,name:e.target.value}))} placeholder="Materialname"/></div>
            <div><Lbl>MENGE</Lbl><Inp type="number" value={newMatRow.qty} onChange={e=>setNMR(v=>({...v,qty:e.target.value}))} min={1}/></div>
            <div><Lbl>EINHEIT</Lbl><Sel value={newMatRow.unit} onChange={e=>setNMR(v=>({...v,unit:e.target.value}))}>{MAT_UNITS.map(u=><option key={u}>{u}</option>)}</Sel></div>
            <div><Lbl>€/Einheit</Lbl><Inp type="number" value={newMatRow.pricePerUnit} onChange={e=>setNMR(v=>({...v,pricePerUnit:+e.target.value}))} step="0.01" min={0}/></div>
            <div><Lbl>LIEFERANT</Lbl><Inp value={newMatRow.supplier} onChange={e=>setNMR(v=>({...v,supplier:e.target.value}))} placeholder="Lieferant"/></div>
            <div><Lbl>LIEFERDATUM</Lbl><Inp value={newMatRow.deliveryDate} onChange={e=>setNMR(v=>({...v,deliveryDate:e.target.value}))} placeholder="DD.MM.YYYY"/></div>
            <div style={{paddingTop:16}}><button className="bgr" onClick={()=>{if(!newMatRow.name.trim())return;const total=+newMatRow.qty*(+newMatRow.pricePerUnit);setMatList(p=>[...p,{...newMatRow,qty:+newMatRow.qty,pricePerUnit:+newMatRow.pricePerUnit,total,status:"ausstehend",note:""}]);setNMR({name:"",qty:1,unit:"Stk",pricePerUnit:0,supplier:"",deliveryDate:"",note:""});}} style={{padding:"9px 11px",whiteSpace:"nowrap"}}>+ Zeile</button></div>
          </div>
        </div>

        {/* Inline: Materialanfragen — bleibt offen */}
        <div style={{background:C.bg,borderRadius:9,padding:"10px 12px",marginBottom:14,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:11,fontWeight:700,color:C.navy,marginBottom:8}}>📋 MATERIALANFRAGEN (optional)</div>
          {reqList.map((r,i)=>(
            <div key={i} className="row-in" style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
              <span style={{fontSize:12,fontWeight:600,flex:2}}>{r.material}</span>
              <span style={{fontSize:11,color:C.sub}}>{r.qty} {r.unit} · {r.urgency==="dringend"?"⚠ Dringend":"Normal"}</span>
              <button onClick={()=>setReqList(p=>p.filter((_,ri)=>ri!==i))} style={{background:C.redL,color:C.red,border:"none",borderRadius:5,padding:"2px 7px",fontSize:11,cursor:"pointer"}}>✕</button>
            </div>
          ))}
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 2fr auto",gap:6,alignItems:"end"}}>
            <div><Lbl>MATERIAL</Lbl><Inp value={newReqRow.material} onChange={e=>setNRR(v=>({...v,material:e.target.value}))} placeholder="Materialname"/></div>
            <div><Lbl>MENGE</Lbl><Inp type="number" value={newReqRow.qty} onChange={e=>setNRR(v=>({...v,qty:e.target.value}))} min={1}/></div>
            <div><Lbl>EINHEIT</Lbl><Sel value={newReqRow.unit} onChange={e=>setNRR(v=>({...v,unit:e.target.value}))}>{MAT_UNITS.map(u=><option key={u}>{u}</option>)}</Sel></div>
            <div><Lbl>DRINGLICHKEIT</Lbl><Sel value={newReqRow.urgency} onChange={e=>setNRR(v=>({...v,urgency:e.target.value}))}><option value="normal">Normal</option><option value="dringend">⚠ Dringend</option></Sel></div>
            <div><Lbl>NOTIZ</Lbl><Inp value={newReqRow.note} onChange={e=>setNRR(v=>({...v,note:e.target.value}))} placeholder="Optional…"/></div>
            <div style={{paddingTop:16}}><button className="bgr" onClick={()=>{if(!newReqRow.material.trim())return;setReqList(p=>[...p,{...newReqRow,qty:+newReqRow.qty,id:Date.now(),by:cu.id,date:"",status:"ausstehend"}]);setNRR({material:"",qty:1,unit:"Stk",urgency:"normal",note:""});}} style={{padding:"9px 11px",whiteSpace:"nowrap"}}>+ Zeile</button></div>
          </div>
        </div>

        <div style={{display:"flex",gap:7}}><button className="bo" onClick={saveProj} style={{flex:1,padding:"9px",fontSize:13}}>{isPartner(cu)?"📤 Anfrage absenden":"🏗 Projekt erstellen"}</button><button className="bg" onClick={()=>setMProj(false)}>Abbrechen</button></div>
      </Modal>}

      {/* MATERIALANFRAGE (in existing project) */}
      {mReq&&<Modal title="📋 Materialanfrage senden" onClose={()=>setMReq(null)} w={520}>
        <div style={{background:C.navyLight,borderRadius:8,padding:"7px 10px",marginBottom:11,fontSize:12,color:C.navy,fontWeight:600}}>
          Projekt: {projs.find(p=>p.id===mReq)?.name}
        </div>
        <div style={{fontSize:11,fontWeight:700,color:C.navy,marginBottom:8}}>Anfragen hinzufügen — Formular bleibt offen bis Sie fertig sind</div>
        {/* Existing rows */}
        {projs.find(p=>p.id===mReq)?.requests.map((r,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 8px",background:C.bg,borderRadius:7,marginBottom:4,border:`1px solid ${C.border}`}}>
            <span style={{fontSize:12,fontWeight:600,flex:2}}>{r.material}</span>
            <span style={{fontSize:11,color:C.sub}}>{r.qty} {r.unit}</span>
            <span style={{background:r.urgency==="dringend"?C.redL:C.bg,color:r.urgency==="dringend"?C.red:C.sub,borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>{r.urgency==="dringend"?"⚠ Dringend":"Normal"}</span>
            <span style={{background:r.status==="genehmigt"?C.greenL:C.yellowL,color:r.status==="genehmigt"?C.green:C.yellow,borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>{r.status}</span>
          </div>
        ))}
        {/* Input row */}
        <div style={{background:C.bg,borderRadius:9,padding:"10px 12px",border:`1px solid ${C.border}`,marginBottom:11}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:8,marginBottom:8}}>
            <div><Lbl>MATERIAL</Lbl><Inp value={newReqRow.material} onChange={e=>setNRR(v=>({...v,material:e.target.value}))} placeholder="z.B. Spachtelmasse"/></div>
            <div><Lbl>MENGE</Lbl><Inp type="number" value={newReqRow.qty} onChange={e=>setNRR(v=>({...v,qty:e.target.value}))} min={1}/></div>
            <div><Lbl>EINHEIT</Lbl><Sel value={newReqRow.unit} onChange={e=>setNRR(v=>({...v,unit:e.target.value}))}>{MAT_UNITS.map(u=><option key={u}>{u}</option>)}</Sel></div>
            <div><Lbl>DRINGLICHKEIT</Lbl><Sel value={newReqRow.urgency} onChange={e=>setNRR(v=>({...v,urgency:e.target.value}))}><option value="normal">Normal</option><option value="dringend">⚠ Dringend</option></Sel></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"3fr 1fr",gap:8}}>
            <div><Lbl>NOTIZ (optional)</Lbl><Inp value={newReqRow.note} onChange={e=>setNRR(v=>({...v,note:e.target.value}))} placeholder="z.B. Für zweite Wand benötigt"/></div>
            <div style={{paddingTop:15}}><button className="bgr" onClick={()=>addProjReq(mReq)} style={{width:"100%",padding:"9px",fontSize:13}}>+ Anfrage<br/><span style={{fontSize:10,opacity:.8}}>& PDF erstellen</span></button></div>
          </div>
        </div>
        <div style={{display:"flex",gap:7,marginTop:4}}><button className="bo" onClick={()=>setMReq(null)} style={{flex:1,padding:"8px",fontSize:13}}>Fertig & Schließen</button></div>
      </Modal>}

      {/* ARBEITSZEIT EINTRAGEN */}
      {mLog&&<Modal title="⏱ Arbeitszeit eintragen" onClose={()=>setMLog(null)} w={420}>
        <div style={{background:C.navyLight,borderRadius:8,padding:"7px 10px",marginBottom:11,fontSize:12,color:C.navy,fontWeight:600}}>
          Projekt: {projs.find(p=>p.id===mLog)?.name}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:9}}>
          <div><Lbl>VON</Lbl><Inp value={newLogRow.start} onChange={e=>setNLR(v=>({...v,start:e.target.value}))} placeholder="07:00"/></div>
          <div><Lbl>BIS</Lbl><Inp value={newLogRow.end} onChange={e=>setNLR(v=>({...v,end:e.target.value}))} placeholder="15:00"/></div>
        </div>
        {newLogRow.start&&newLogRow.end&&(
          <div style={{background:C.greenL,borderRadius:7,padding:"6px 9px",marginBottom:9,fontSize:12,color:C.green,fontWeight:700}}>
            ⏱ Berechnet: {calcDur(newLogRow.start,newLogRow.end)}
          </div>
        )}
        <div style={{marginBottom:13}}><Lbl>NOTIZ</Lbl><Inp value={newLogRow.note} onChange={e=>setNLR(v=>({...v,note:e.target.value}))} placeholder="z.B. Wand 1 fertig, Material verbraucht"/></div>
        <div style={{display:"flex",gap:7}}><button className="bgr" onClick={()=>addProjLog(mLog)} style={{flex:1,padding:"9px",fontSize:13}}>Stunden speichern</button><button className="bg" onClick={()=>setMLog(null)}>Abbrechen</button></div>
      </Modal>}

      {/* MATERIAL ZU PROJEKT HINZUFÜGEN */}
      {mMatProj&&<Modal title="📦 Material zum Projekt hinzufügen" onClose={()=>setMMatProj(null)} w={560}>
        <div style={{background:C.navyLight,borderRadius:8,padding:"7px 10px",marginBottom:11,fontSize:12,color:C.navy,fontWeight:600}}>
          Projekt: {projs.find(p=>p.id===mMatProj)?.name}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:8,marginBottom:8}}>
          <div><Lbl>MATERIAL</Lbl><Inp value={newMatRow.name} onChange={e=>setNMR(v=>({...v,name:e.target.value}))} placeholder="Materialname"/></div>
          <div><Lbl>MENGE</Lbl><Inp type="number" value={newMatRow.qty} onChange={e=>setNMR(v=>({...v,qty:e.target.value}))} min={1}/></div>
          <div><Lbl>EINHEIT</Lbl><Sel value={newMatRow.unit} onChange={e=>setNMR(v=>({...v,unit:e.target.value}))}>{MAT_UNITS.map(u=><option key={u}>{u}</option>)}</Sel></div>
          <div><Lbl>€/EINHEIT</Lbl><Inp type="number" value={newMatRow.pricePerUnit} onChange={e=>setNMR(v=>({...v,pricePerUnit:+e.target.value}))} step="0.01" min={0}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 2fr",gap:8,marginBottom:13}}>
          <div><Lbl>LIEFERANT</Lbl><Inp value={newMatRow.supplier} onChange={e=>setNMR(v=>({...v,supplier:e.target.value}))} placeholder="Lieferant"/></div>
          <div><Lbl>LIEFERDATUM</Lbl><Inp value={newMatRow.deliveryDate} onChange={e=>setNMR(v=>({...v,deliveryDate:e.target.value}))} placeholder="DD.MM.YYYY"/></div>
          <div><Lbl>NOTIZ</Lbl><Inp value={newMatRow.note} onChange={e=>setNMR(v=>({...v,note:e.target.value}))} placeholder="Optional…"/></div>
        </div>
        {newMatRow.qty&&newMatRow.pricePerUnit?(
          <div style={{background:C.greenL,borderRadius:7,padding:"6px 9px",marginBottom:11,fontSize:12,color:C.green,fontWeight:700}}>
            💶 Gesamt: {(+newMatRow.qty*(+newMatRow.pricePerUnit)).toFixed(2)} €
          </div>
        ):null}
        <div style={{display:"flex",gap:7}}><button className="bgr" onClick={()=>addProjMat(mMatProj)} style={{flex:1,padding:"9px",fontSize:13}}>Material hinzufügen</button><button className="bg" onClick={()=>setMMatProj(null)}>Abbrechen</button></div>
      </Modal>}

      {/* NEW REPAIR */}
      {mAddR&&<Modal title="🔧 Neuer Auftrag" onClose={()=>setMAddR(false)} w={500}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:9}}>
          <div style={{gridColumn:"1/-1"}}><Lbl>TITEL</Lbl><Inp value={fR.title} onChange={e=>setFR(v=>({...v,title:e.target.value}))} placeholder="z.B. Wasserleck Zimmer 204"/></div>
          <div><Lbl>ZIMMER / OBJEKT</Lbl><Inp value={fR.room} onChange={e=>setFR(v=>({...v,room:e.target.value}))} placeholder="z.B. Zi. 204"/></div>
          <div><Lbl>TYP</Lbl><Sel value={fR.type} onChange={e=>setFR(v=>({...v,type:e.target.value}))}>{REPAIR_TYPES.map(t=><option key={t}>{t}</option>)}</Sel></div>
          <div><Lbl>ABTEILUNG</Lbl><Sel value={fR.dept} onChange={e=>setFR(v=>({...v,dept:e.target.value}))}>{DEPTS.map(d=><option key={d}>{d}</option>)}</Sel></div>
          <div><Lbl>ZUWEISEN AN</Lbl><Sel value={fR.assignedTo} onChange={e=>setFR(v=>({...v,assignedTo:+e.target.value}))}>{users.filter(u=>u.active&&u.role==="ma").map(u=><option key={u.id} value={u.id}>{u.name} ({u.entity})</option>)}</Sel></div>
        </div>
        <div style={{marginBottom:9}}><Lbl>PRIORITÄT</Lbl>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {Object.entries(P).map(([k,v])=><button key={k} onClick={()=>setFR(p=>({...p,priority:k}))} style={{flex:"1 1 70px",background:fR.priority===k?v.bg:C.bg,color:v.color,border:`1.5px solid ${fR.priority===k?v.color:C.border}`,borderRadius:7,padding:"6px 4px",fontSize:12,fontWeight:700}}>{v.label}</button>)}
          </div>
        </div>
        <div style={{marginBottom:11}}><Lbl>HINWEISE / BESCHREIBUNG</Lbl><Txt value={fR.notes} onChange={e=>setFR(v=>({...v,notes:e.target.value}))} rows={2} placeholder="z.B. Gast meldet tropfende Decke…"/></div>
        {/* Material rows — stay open */}
        <div style={{background:C.bg,borderRadius:8,padding:"9px 11px",marginBottom:13,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,fontWeight:700,color:C.navy,marginBottom:7}}>🔩 MATERIAL (optional — Formular bleibt offen)</div>
          {rMatRows.map((m,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 7px",background:"#fff",borderRadius:6,marginBottom:4,border:`1px solid ${C.border}`}}>
              <span style={{flex:2,fontSize:12,fontWeight:600}}>{m.name}</span>
              <span style={{fontSize:11,color:C.sub}}>{m.qty} {m.unit}</span>
              <button onClick={()=>setRMatRows(p=>p.filter((_,ri)=>ri!==i))} style={{background:C.redL,color:C.red,border:"none",borderRadius:4,padding:"1px 6px",fontSize:11,cursor:"pointer"}}>✕</button>
            </div>
          ))}
          <div style={{display:"flex",gap:6,alignItems:"flex-end",flexWrap:"wrap"}}>
            <div style={{flex:2,minWidth:100}}><Lbl>MATERIAL</Lbl><Inp value={newRMat.name} onChange={e=>setNRM(v=>({...v,name:e.target.value}))} placeholder="z.B. Dichtungsring" style={{fontSize:12,padding:"5px 8px"}}/></div>
            <div style={{flex:1,minWidth:50}}><Lbl>MENGE</Lbl><Inp type="number" value={newRMat.qty} onChange={e=>setNRM(v=>({...v,qty:+e.target.value}))} min={1} style={{fontSize:12,padding:"5px 8px"}}/></div>
            <div style={{flex:1,minWidth:60}}><Lbl>EINHEIT</Lbl><Sel value={newRMat.unit} onChange={e=>setNRM(v=>({...v,unit:e.target.value}))} style={{fontSize:12,padding:"5px 8px"}}>{MAT_UNITS.map(u=><option key={u}>{u}</option>)}</Sel></div>
            <div><button className="bgr" onClick={()=>{if(!newRMat.name.trim())return;setRMatRows(p=>[...p,{...newRMat,qty:+newRMat.qty}]);setNRM({name:"",qty:1,unit:"Stk"});}} style={{padding:"6px 10px",fontSize:11,marginTop:15}}>+ Zeile</button></div>
          </div>
        </div>
        <div style={{display:"flex",gap:7}}><button className="bo" onClick={addRepair} style={{flex:1,padding:"9px",fontSize:13}}>Auftrag erstellen</button><button className="bg" onClick={()=>setMAddR(false)}>Abbrechen</button></div>
      </Modal>}

      {/* SCHICHT */}
      {mShift&&<Modal title="📅 Schicht eintragen / bearbeiten" onClose={()=>setMShift(false)} w={460}>
        {(isRoot(cu)||cu.role==="va")&&<div style={{marginBottom:9}}><Lbl>MITARBEITER</Lbl>
          <Sel value={newLogRow.userId||cu.id} onChange={e=>setNLR(v=>({...v,userId:+e.target.value}))}>
            {users.filter(u=>u.active&&u.role!=="partner"&&(isRoot(cu)||u.dept===cu.dept)).map(u=><option key={u.id} value={u.id}>{u.name} — {u.dept}</option>)}
          </Sel>
        </div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:9}}>
          <div><Lbl>WOCHE (KW)</Lbl>
            <Inp value={newLogRow.week||selWeek} onChange={e=>setNLR(v=>({...v,week:e.target.value}))} placeholder="2026-19"/>
          </div>
          <div><Lbl>TAG</Lbl>
            <Sel value={newLogRow.day??0} onChange={e=>setNLR(v=>({...v,day:+e.target.value}))}>
              {WDAYS.map((d,i)=><option key={i} value={i}>{d}</option>)}
            </Sel>
          </div>
          <div><Lbl>TYP</Lbl>
            <Sel value={newLogRow.type||"work"} onChange={e=>setNLR(v=>({...v,type:e.target.value}))}>
              {Object.entries(SHIFTS_C).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
            </Sel>
          </div>
          <div><Lbl>STUNDEN</Lbl>
            <Inp type="number" value={newLogRow.hours??8} onChange={e=>setNLR(v=>({...v,hours:+e.target.value}))} step="0.5" min={0} max={24}/>
          </div>
        </div>
        <div style={{marginBottom:12}}><Lbl>SCHICHTZEIT (z.B. 07:00–15:00)</Lbl>
          <Inp value={newLogRow.shift||"07:00–15:00"} onChange={e=>setNLR(v=>({...v,shift:e.target.value}))} placeholder="07:00–15:00"/>
        </div>
        {/* Preview */}
        {(()=>{const sc=SHIFTS_C[newLogRow.type||"work"];return(
          <div style={{background:sc.bg,border:`1px solid ${sc.color}44`,borderRadius:8,padding:"8px 12px",marginBottom:13,display:"flex",gap:10,alignItems:"center"}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:sc.color,flexShrink:0}}/>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:sc.color}}>{WDAYS[newLogRow.day??0]} · KW {(newLogRow.week||selWeek).split("-")[1]}</div>
              <div style={{fontSize:11,color:sc.color}}>{newLogRow.shift||"07:00–15:00"} · {newLogRow.hours??8}h · {sc.label}</div>
            </div>
            <div style={{marginLeft:"auto",fontSize:10,color:sc.color,opacity:.7}}>Vorschau</div>
          </div>
        );})()}
        <div style={{display:"flex",gap:7}}>
          <button className="bo" onClick={addShift} style={{flex:1,padding:"9px",fontSize:13}}>💾 Speichern & Benachrichtigen</button>
          <button className="bg" onClick={()=>setMShift(false)}>Abbrechen</button>
        </div>
      </Modal>}

      {/* WAREHOUSE MATERIAL */}
      {mWMat&&<Modal title="📦 Material zum Lager hinzufügen" onClose={()=>setMWMat(false)}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:9}}>
          <div style={{gridColumn:"1/-1"}}><Lbl>NAME</Lbl><Inp value={newWMatRow.name} onChange={e=>setNWMR(v=>({...v,name:e.target.value}))} placeholder="z.B. Trockenbauplatten"/></div>
          <div><Lbl>EINHEIT</Lbl><Sel value={newWMatRow.unit} onChange={e=>setNWMR(v=>({...v,unit:e.target.value}))}>{MAT_UNITS.map(u=><option key={u}>{u}</option>)}</Sel></div>
          <div><Lbl>KATEGORIE</Lbl><Sel value={newWMatRow.category} onChange={e=>setNWMR(v=>({...v,category:e.target.value}))}>{MAT_CATS.map(c=><option key={c}>{c}</option>)}</Sel></div>
          <div><Lbl>ANFANGSBESTAND</Lbl><Inp type="number" value={newWMatRow.qty} onChange={e=>setNWMR(v=>({...v,qty:e.target.value}))} min={0}/></div>
          <div><Lbl>MINDESTBESTAND</Lbl><Inp type="number" value={newWMatRow.minQty} onChange={e=>setNWMR(v=>({...v,minQty:e.target.value}))} min={0}/></div>
          <div style={{gridColumn:"1/-1"}}><Lbl>PREIS PRO EINHEIT (€)</Lbl><Inp type="number" value={newWMatRow.price} onChange={e=>setNWMR(v=>({...v,price:e.target.value}))} step="0.01" min={0}/></div>
        </div>
        <div style={{display:"flex",gap:7,marginTop:4}}><button className="bo" onClick={addWMat} style={{flex:1,padding:"9px",fontSize:13}}>Hinzufügen</button><button className="bg" onClick={()=>setMWMat(false)}>Abbrechen</button></div>
      </Modal>}

      {/* ORDER */}
      {mOrder&&<Modal title="🔄 Bestellung erfassen" onClose={()=>setMOrder(false)} w={500}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:9}}>
          <div><Lbl>TYP</Lbl><Sel value={newOrderRow.type} onChange={e=>setNOR(v=>({...v,type:e.target.value}))}><option value="eingang">📥 Eingang</option><option value="ausgang">📤 Ausgang</option></Sel></div>
          <div><Lbl>STATUS</Lbl><Sel value={newOrderRow.status} onChange={e=>setNOR(v=>({...v,status:e.target.value}))}>{["ausstehend","geliefert","abgeschlossen"].map(s=><option key={s}>{s}</option>)}</Sel></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:9,marginBottom:9}}>
          <div><Lbl>MATERIAL</Lbl><Sel value={newOrderRow.material} onChange={e=>setNOR(v=>({...v,material:e.target.value}))}><option value="">– Auswählen –</option>{mats.map(m=><option key={m.id}>{m.name}</option>)}</Sel></div>
          <div><Lbl>MENGE</Lbl><Inp type="number" value={newOrderRow.qty} onChange={e=>setNOR(v=>({...v,qty:e.target.value}))} min={1}/></div>
          <div><Lbl>EINHEIT</Lbl><Sel value={newOrderRow.unit} onChange={e=>setNOR(v=>({...v,unit:e.target.value}))}>{MAT_UNITS.map(u=><option key={u}>{u}</option>)}</Sel></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:9,marginBottom:9}}>
          <div><Lbl>LIEFERANT / KUNDE</Lbl><Inp value={newOrderRow.supplier} onChange={e=>setNOR(v=>({...v,supplier:e.target.value}))} placeholder="z.B. Bauhaus GmbH"/></div>
          <div><Lbl>DATUM</Lbl><Inp value={newOrderRow.date} onChange={e=>setNOR(v=>({...v,date:e.target.value}))} placeholder="DD.MM.YYYY"/></div>
          <div><Lbl>BETRAG (€)</Lbl><Inp type="number" value={newOrderRow.priceTotal} onChange={e=>setNOR(v=>({...v,priceTotal:+e.target.value}))} step="0.01" min={0}/></div>
        </div>
        <div style={{marginBottom:13}}><Lbl>NOTIZ</Lbl><Inp value={newOrderRow.note} onChange={e=>setNOR(v=>({...v,note:e.target.value}))} placeholder="Optional…"/></div>
        <div style={{display:"flex",gap:7}}><button className="bo" onClick={addOrder} style={{flex:1,padding:"9px",fontSize:13}}>Bestellung speichern</button><button className="bg" onClick={()=>setMOrder(false)}>Abbrechen</button></div>
      </Modal>}

      {/* PROFILE EDIT MODAL */}
      {mProfile&&cu&&<Modal title="👤 Mein Profil bearbeiten" onClose={()=>setMProfile(false)} w={420}>
        {/* Avatar + photo upload */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,marginBottom:18,padding:"16px 0",background:C.bg,borderRadius:10,border:`1px solid ${C.border}`}}>
          <div style={{position:"relative"}}>
            <Av u={cu} size={72}/>
            <button onClick={()=>profilePhotoRef.current.click()} style={{position:"absolute",bottom:2,right:2,background:APP_CONFIG.accentColor,color:"#fff",border:"2px solid #fff",borderRadius:"50%",width:24,height:24,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>📷</button>
          </div>
          <div style={{fontSize:12,color:C.sub}}>Profilbild hochladen</div>
          <button onClick={()=>profilePhotoRef.current.click()} className="bg" style={{fontSize:11,padding:"5px 12px"}}>📷 Foto auswählen</button>
        </div>
        <div style={{marginBottom:11}}>
          <Lbl>NAME ANZEIGEN</Lbl>
          <Inp value={fProfile.name} onChange={e=>setFProfile(v=>({...v,name:e.target.value}))} placeholder="Ihr vollständiger Name"/>
        </div>
        <div style={{marginBottom:16}}>
          <Lbl>TITEL / POSITION (optional)</Lbl>
          <Inp value={fProfile.customTitle} onChange={e=>setFProfile(v=>({...v,customTitle:e.target.value}))} placeholder={`z.B. ${ROLE_CFG[cu.role]?.label}, Teamleiter, Senior…`}/>
          <div style={{fontSize:10,color:C.sub,marginTop:4}}>Leer lassen um Standard-Rolle zu verwenden</div>
        </div>
        <div style={{background:C.bg,borderRadius:8,padding:"8px 11px",marginBottom:14,border:`1px solid ${C.border}`,display:"flex",gap:8,alignItems:"center"}}>
          <Av u={{...cu,name:fProfile.name||cu.name,avatar:(fProfile.name||cu.name).split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}} size={36}/>
          <div>
            <div style={{fontWeight:700,fontSize:13}}>{fProfile.name||cu.name}</div>
            <div style={{fontSize:11,color:C.sub}}>{fProfile.customTitle||ROLE_CFG[cu.role]?.label}</div>
          </div>
          <div style={{marginLeft:"auto",fontSize:10,color:C.sub}}>Vorschau</div>
        </div>
        <div style={{display:"flex",gap:7}}>
          <button className="bo" onClick={saveProfile} style={{flex:1,padding:"9px",fontSize:13}}>💾 Speichern</button>
          <button className="bg" onClick={()=>setMProfile(false)}>Abbrechen</button>
        </div>
      </Modal>}

      {/* ADD/EDIT TASK */}
      {mAddTask&&isRoot(cu)&&<Modal title={mEditTask==="new"?"✓ Neue Aufgabe":"✏ Aufgabe bearbeiten"} onClose={()=>{setMAddTask(false);setMEditTask(null);setFTask(BLANK_TASK);setNCI("");}} w={500}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:9}}>
          <div style={{gridColumn:"1/-1"}}><Lbl>TITEL</Lbl><Inp value={fTask.title} onChange={e=>setFTask(v=>({...v,title:e.target.value}))} placeholder="z.B. Werkzeugkontrolle"/></div>
          <div><Lbl>ABTEILUNG</Lbl><Sel value={fTask.dept} onChange={e=>setFTask(v=>({...v,dept:e.target.value}))}>{DEPTS.map(d=><option key={d}>{d}</option>)}</Sel></div>
          <div><Lbl>ZUWEISEN AN</Lbl><Sel value={fTask.assignedTo} onChange={e=>setFTask(v=>({...v,assignedTo:+e.target.value}))}>{users.filter(u=>u.active).map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</Sel></div>
          <div><Lbl>FÄLLIG AM</Lbl><Inp value={fTask.due} onChange={e=>setFTask(v=>({...v,due:e.target.value}))} placeholder="DD.MM.YYYY"/></div>
          <div><Lbl>WIEDERKEHREND</Lbl><Sel value={fTask.recurring} onChange={e=>setFTask(v=>({...v,recurring:e.target.value}))}><option value="">Einmalig</option><option>Täglich</option><option>Wöchentlich</option><option>Monatlich</option></Sel></div>
          <div><Lbl>STATUS</Lbl><Sel value={fTask.status} onChange={e=>setFTask(v=>({...v,status:e.target.value}))}><option value="open">Offen</option><option value="in-progress">In Bearbeitung</option><option value="done">Erledigt</option></Sel></div>
        </div>
        {/* Checklist builder */}
        <div style={{background:C.bg,borderRadius:9,padding:"10px 12px",marginBottom:13,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:11,fontWeight:700,color:C.navy,marginBottom:8}}>✓ CHECKLISTE</div>
          {fTask.checklist.map((c,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 7px",background:"#fff",borderRadius:6,marginBottom:4,border:`1px solid ${C.border}`}}>
              <span style={{flex:1,fontSize:12}}>{c.text}</span>
              <button onClick={()=>setFTask(v=>({...v,checklist:v.checklist.filter((_,ri)=>ri!==i)}))} style={{background:C.redL,color:C.red,border:"none",borderRadius:4,padding:"1px 6px",fontSize:11,cursor:"pointer"}}>✕</button>
            </div>
          ))}
          <div style={{display:"flex",gap:6,marginTop:6}}>
            <Inp value={newCheckItem} onChange={e=>setNCI(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newCheckItem.trim()){setFTask(v=>({...v,checklist:[...v.checklist,{text:newCheckItem,done:false}]}));setNCI("");}}} placeholder="Punkt hinzufügen… (Enter)" style={{fontSize:12,padding:"6px 9px"}}/>
            <button className="bgr" onClick={()=>{if(!newCheckItem.trim())return;setFTask(v=>({...v,checklist:[...v.checklist,{text:newCheckItem,done:false}]}));setNCI("");}} style={{padding:"6px 11px",fontSize:12,flexShrink:0}}>+ Hinzu</button>
          </div>
        </div>
        <div style={{display:"flex",gap:7}}><button className="bo" onClick={saveTask} style={{flex:1,padding:"9px",fontSize:13}}>{mEditTask==="new"?"Aufgabe erstellen":"Änderungen speichern"}</button><button className="bg" onClick={()=>{setMAddTask(false);setMEditTask(null);setFTask(BLANK_TASK);setNCI("");}}>Abbrechen</button></div>
      </Modal>}

      {/* PARTNER REPAIR REQUEST */}
      {mPartnerRepair&&isPartner(cu)&&<Modal title="🔧 Reparatur / Störung melden" onClose={()=>setMPartnerRepair(false)} w={480}>
        <div style={{background:C.navyLight,borderRadius:8,padding:"8px 11px",marginBottom:12,fontSize:12,color:C.navy}}>
          Ihre Meldung wird direkt an die Verwaltung weitergeleitet.
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:9}}>
          <div style={{gridColumn:"1/-1"}}><Lbl>TITEL / PROBLEM</Lbl><Inp value={fPartnerRepair.title} onChange={e=>setFPartnerRepair(v=>({...v,title:e.target.value}))} placeholder="z.B. Wasserleck im Keller"/></div>
          <div style={{gridColumn:"1/-1"}}><Lbl>ORT / STANDORT</Lbl><Inp value={fPartnerRepair.location} onChange={e=>setFPartnerRepair(v=>({...v,location:e.target.value}))} placeholder="z.B. Gebäude A, Raum 204"/></div>
          <div><Lbl>DRINGLICHKEIT</Lbl>
            <div style={{display:"flex",gap:5}}>
              {["normal","dringend"].map(u=>(
                <button key={u} onClick={()=>setFPartnerRepair(v=>({...v,urgency:u}))}
                  style={{flex:1,padding:"8px",borderRadius:7,border:`1.5px solid ${fPartnerRepair.urgency===u?u==="dringend"?C.red:C.navy:C.border}`,background:fPartnerRepair.urgency===u?u==="dringend"?C.redL:C.navyLight:"#fff",color:fPartnerRepair.urgency===u?u==="dringend"?C.red:C.navy:C.sub,fontWeight:700,fontSize:12}}>
                  {u==="dringend"?"⚠ Dringend":"Normal"}
                </button>
              ))}
            </div>
          </div>
          <div><Lbl>IHR NAME / KONTAKT</Lbl><Inp value={fPartnerRepair.contactName} onChange={e=>setFPartnerRepair(v=>({...v,contactName:e.target.value}))} placeholder="Ihr Name"/></div>
          <div style={{gridColumn:"1/-1"}}><Lbl>TELEFON (optional)</Lbl><Inp value={fPartnerRepair.contactPhone} onChange={e=>setFPartnerRepair(v=>({...v,contactPhone:e.target.value}))} placeholder="+49 ..."/></div>
          <div style={{gridColumn:"1/-1"}}><Lbl>BESCHREIBUNG</Lbl><Txt value={fPartnerRepair.description} onChange={e=>setFPartnerRepair(v=>({...v,description:e.target.value}))} rows={3} placeholder="Detaillierte Beschreibung des Problems…"/></div>
        </div>
        <div style={{display:"flex",gap:7}}><button className="bo" onClick={submitPartnerRepair} style={{flex:1,padding:"9px",fontSize:13}}>📤 Meldung absenden</button><button className="bg" onClick={()=>setMPartnerRepair(false)}>Abbrechen</button></div>
      </Modal>}

      {/* APPROVE / REJECT PARTNER REQUEST */}
      {mApprove&&isRoot(cu)&&<Modal title={`🤝 Anfrage bearbeiten: ${mApprove.name||mApprove.title}`} onClose={()=>setMApprove(null)} w={560}>
        {/* Request details */}
        <div style={{background:C.bg,borderRadius:9,padding:"10px 12px",marginBottom:12,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:11,fontWeight:700,color:C.sub,marginBottom:6}}>ANFRAGE-DETAILS</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {[
              ["Typ", mApprove.type==="repair_request"?"🔧 Reparatur":"🏗 Projekt"],
              ["Von", `${mApprove.createdByName} (${mApprove.entity})`],
              ["Datum", mApprove.date+" · "+mApprove.time],
              ["Standort", mApprove.location||"–"],
              ...(mApprove.type!=="repair_request"?[
                ["Fläche", mApprove.area?`${mApprove.area} m²`:"–"],
                ["Zeitraum", `${mApprove.startDate||"–"} – ${mApprove.endDate||"–"}`],
              ]:[
                ["Dringlichkeit", mApprove.urgency==="dringend"?"⚠ DRINGEND":"Normal"],
                ["Kontakt", mApprove.contactName||"–"],
              ]),
            ].map(([k,v])=>(
              <div key={k} style={{background:"#fff",borderRadius:6,padding:"5px 8px",border:`1px solid ${C.border}`}}>
                <div style={{fontSize:9,color:C.sub,fontWeight:700}}>{k}</div>
                <div style={{fontSize:12,fontWeight:600,color:C.text}}>{v}</div>
              </div>
            ))}
          </div>
          {(mApprove.notes||mApprove.description)&&<div style={{background:C.yellowL,borderRadius:6,padding:"7px 9px",marginTop:7,fontSize:12,border:"1px solid #FDE68A"}}>📝 {mApprove.notes||mApprove.description}</div>}
        </div>

        {/* Action toggle */}
        <div style={{display:"flex",gap:6,marginBottom:12}}>
          <button onClick={()=>setFApprove(v=>({...v,action:"approve"}))}
            style={{flex:1,padding:"9px",borderRadius:8,border:`1.5px solid ${fApprove.action==="approve"?C.green:C.border}`,background:fApprove.action==="approve"?C.greenL:"#fff",color:fApprove.action==="approve"?C.green:C.sub,fontWeight:700,fontSize:13}}>
            ✅ Genehmigen & Zuweisen
          </button>
          <button onClick={()=>setFApprove(v=>({...v,action:"reject"}))}
            style={{flex:1,padding:"9px",borderRadius:8,border:`1.5px solid ${fApprove.action==="reject"?C.red:C.border}`,background:fApprove.action==="reject"?C.redL:"#fff",color:fApprove.action==="reject"?C.red:C.sub,fontWeight:700,fontSize:13}}>
            ❌ Ablehnen
          </button>
        </div>

        {fApprove.action==="approve"&&mApprove.type!=="repair_request"&&(
          <div>
            <div style={{marginBottom:10}}><Lbl>VERANTWORTLICHER MITARBEITER</Lbl>
              <Sel value={fApprove.responsibleId} onChange={e=>setFApprove(v=>({...v,responsibleId:+e.target.value}))}>
                {users.filter(u=>u.active&&(u.role==="va"||u.role==="admin")).map(u=><option key={u.id} value={u.id}>{u.name} ({ROLE_CFG[u.role]?.label})</option>)}
              </Sel>
            </div>
            <div style={{marginBottom:10}}>
              <Lbl>WER DARF BEARBEITEN?</Lbl>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,background:C.bg,borderRadius:8,padding:"8px",border:`1px solid ${C.border}`}}>
                {users.filter(u=>u.active&&u.role!=="partner").map(u=>{const sel=fApprove.editableBy.includes(u.id);return(
                  <div key={u.id} onClick={()=>setFApprove(v=>({...v,editableBy:sel?v.editableBy.filter(i=>i!==u.id):[...v.editableBy,u.id]}))}
                    style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:6,background:sel?C.navyLight:"#fff",border:`1.5px solid ${sel?C.navy:C.border}`,cursor:"pointer"}}>
                    <Av u={u} size={14}/><span style={{fontSize:11,fontWeight:600}}>{u.name.split(" ")[0]}</span>
                    {sel&&<span style={{fontSize:9,color:C.navy}}>✓</span>}
                  </div>
                );})}
              </div>
            </div>
            <div style={{marginBottom:13}}>
              <Lbl>WER DARF SEHEN?</Lbl>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,background:C.bg,borderRadius:8,padding:"8px",border:`1px solid ${C.border}`}}>
                {users.filter(u=>u.active&&u.role!=="partner").map(u=>{const sel=fApprove.visibleTo.includes(u.id);return(
                  <div key={u.id} onClick={()=>setFApprove(v=>({...v,visibleTo:sel?v.visibleTo.filter(i=>i!==u.id):[...v.visibleTo,u.id]}))}
                    style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:6,background:sel?C.greenL:"#fff",border:`1.5px solid ${sel?C.green:C.border}`,cursor:"pointer"}}>
                    <Av u={u} size={14}/><span style={{fontSize:11,fontWeight:600}}>{u.name.split(" ")[0]}</span>
                    {sel&&<span style={{fontSize:9,color:C.green}}>✓</span>}
                  </div>
                );})}
              </div>
            </div>
          </div>
        )}

        {fApprove.action==="approve"&&mApprove.type==="repair_request"&&(
          <div style={{marginBottom:13}}>
            <Lbl>ZUWEISEN AN MITARBEITER</Lbl>
            <Sel value={fApprove.responsibleId} onChange={e=>setFApprove(v=>({...v,responsibleId:+e.target.value}))}>
              {users.filter(u=>u.active&&(u.role==="va"||u.role==="ma"||u.role==="admin")).map(u=><option key={u.id} value={u.id}>{u.name} ({ROLE_CFG[u.role]?.label})</option>)}
            </Sel>
            <div style={{marginTop:8,fontSize:11,color:C.sub}}>Ein neuer Auftrag wird erstellt und automatisch zugewiesen.</div>
          </div>
        )}

        {fApprove.action==="reject"&&(
          <div style={{marginBottom:13}}>
            <Lbl>ABLEHNUNGSGRUND (optional)</Lbl>
            <Txt value={fApprove.rejectReason} onChange={e=>setFApprove(v=>({...v,rejectReason:e.target.value}))} rows={2} placeholder="z.B. Budget nicht verfügbar, falsche Abteilung…"/>
          </div>
        )}

        <div style={{display:"flex",gap:7}}>
          {fApprove.action==="approve"?(
            <button className="bgr" onClick={()=>{
              if(mApprove.type==="repair_request"){
                // Create repair automatically
                const newR={id:repairs.length+1,title:mApprove.title,room:mApprove.location,dept:"Bauhandwerk",type:"Hausreparatur",
                  priority:mApprove.urgency==="dringend"?"urgent":"medium",
                  assignedTo:+fApprove.responsibleId,reporter:mApprove.createdBy,
                  createdAt:new Date().toLocaleDateString("de-DE"),startTime:null,endTime:null,
                  photos:{before:null,after:null},stopReason:"",
                  materials:[],comments:[{user:1,text:`Partneranfrage von ${mApprove.createdByName}: ${mApprove.description||"–"}`,time:new Date().toLocaleTimeString("de",{hour:"2-digit",minute:"2-digit"})}],
                  notes:mApprove.description||""};
                setRepairs(p=>[...p,newR]);
                setPartnerRequests(p=>p.map(r=>r.id===mApprove.id?{...r,status:"approved"}:r));
                addNotif(mApprove.createdBy,"partner_approved","✅ Reparaturanfrage genehmigt",
                  `Ihre Meldung „${mApprove.title}" wurde genehmigt und ein Auftrag wurde erstellt.`);
                addNotif(+fApprove.responsibleId,"repair_assigned","🔧 Auftrag zugewiesen: "+mApprove.title,
                  `Partneranfrage von ${mApprove.createdByName}: „${mApprove.title}" (${mApprove.location}).`);
                setMApprove(null);
              } else {
                approvePartnerReq(mApprove,fApprove.responsibleId,fApprove.editableBy,fApprove.visibleTo);
              }
            }} style={{flex:1,padding:"9px",fontSize:13}}>✅ Genehmigen & Erstellen</button>
          ):(
            <button className="bdr" onClick={()=>rejectPartnerReq(mApprove,fApprove.rejectReason)} style={{flex:1,padding:"9px",fontSize:13}}>❌ Ablehnen & Benachrichtigen</button>
          )}
          <button className="bg" onClick={()=>setMApprove(null)}>Abbrechen</button>
        </div>
      </Modal>}

      {/* QUICK PERMISSIONS MODAL */}
      {mQuickPerm&&isRoot(cu)&&<Modal title={`🔐 Berechtigungen: ${mQuickPerm.name}`} onClose={()=>setMQuickPerm(null)} w={460}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,padding:"9px 12px",background:ROLE_CFG[mQuickPerm.role]?.bg,borderRadius:9,border:`1px solid ${C.border}`}}>
          <Av u={mQuickPerm} size={38}/>
          <div>
            <div style={{fontWeight:700,fontSize:14}}>{mQuickPerm.name}</div>
            <div style={{display:"flex",gap:5,marginTop:3}}><RB role={mQuickPerm.role}/><Tag bg="#F9FAFB" color={C.sub}>{mQuickPerm.dept}</Tag></div>
          </div>
        </div>
        <div style={{fontSize:11,fontWeight:700,color:C.sub,marginBottom:8}}>ZUGRIFF AUF BEREICHE — Antippen zum Umschalten:</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:14}}>
          {ALL_PERMS.map(p=>{
            const on=mQuickPerm.perms?.[p.key];
            return(
              <div key={p.key} onClick={()=>setMQuickPerm(v=>({...v,perms:{...v.perms,[p.key]:!on}}))}
                style={{display:"flex",alignItems:"center",gap:8,padding:"9px 11px",borderRadius:8,
                  background:on?C.greenL:C.redL,border:`1.5px solid ${on?"#6EE7B7":"#FECACA"}`,cursor:"pointer",transition:"all .15s"}}>
                <span style={{fontSize:16}}>{p.icon}</span>
                <span style={{fontSize:12,fontWeight:600,color:on?C.green:C.red,flex:1}}>{p.label}</span>
                <span style={{fontSize:14,fontWeight:800,color:on?C.green:C.red}}>{on?"✓":"✗"}</span>
              </div>
            );
          })}
        </div>
        {/* Preset buttons */}
        <div style={{background:C.bg,borderRadius:8,padding:"9px 11px",marginBottom:13,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,fontWeight:700,color:C.sub,marginBottom:6}}>SCHNELL-VORLAGEN</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {[
              {l:"Vollzugriff",p:FULL,c:C.orange},
              {l:"Standard MA",p:DEF,c:C.navy},
              {l:"Nur Aufträge",p:{...ALL_PERMS.reduce((a,x)=>({...a,[x.key]:false}),{}),repairs:true,messages:true},c:C.sub},
              {l:"Nur Lesen",p:{...ALL_PERMS.reduce((a,x)=>({...a,[x.key]:false}),{}),messages:true},c:"#888"},
            ].map(t=>(
              <button key={t.l} onClick={()=>setMQuickPerm(v=>({...v,perms:t.p}))}
                style={{background:"#fff",color:t.c,border:`1.5px solid ${t.c}33`,borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                {t.l}
              </button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:7}}>
          <button className="bgr" onClick={()=>{
            setUsers(p=>p.map(u=>u.id===mQuickPerm.id?{...u,perms:mQuickPerm.perms}:u));
            addNotif(mQuickPerm.id,"perm_update","🔐 Ihre Berechtigungen wurden aktualisiert",
              `${cu.name} hat Ihre Zugriffsrechte angepasst.`);
            setMQuickPerm(null);
          }} style={{flex:1,padding:"10px",fontSize:13}}>💾 Speichern & Benachrichtigen</button>
          <button className="bg" onClick={()=>setMQuickPerm(null)}>Abbrechen</button>
        </div>
      </Modal>}

      {/* PDF PREVIEW MODAL */}
      {pdfContent&&(
        <div style={{position:"fixed",inset:0,background:"rgba(13,59,110,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:700,padding:14}}
          onClick={e=>e.target===e.currentTarget&&setPdfContent(null)}>
          <div style={{background:"#fff",borderRadius:14,width:"100%",maxWidth:720,maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 60px rgba(0,0,0,.3)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:`1px solid ${C.border}`,flexShrink:0,gap:8,flexWrap:"wrap"}}>
              <div style={{fontWeight:800,fontSize:14,color:C.text}}>📄 Berichtsvorschau</div>
              <div style={{display:"flex",gap:7,alignItems:"center"}}>
                {/* Download as HTML file */}
                <button onClick={()=>{
                  const blob=new Blob([pdfContent],{type:"text/html;charset=utf-8"});
                  const url=URL.createObjectURL(blob);
                  const a=document.createElement("a");
                  a.href=url;
                  a.download=`Bericht_${new Date().toLocaleDateString("de-DE").replace(/\./g,"-")}.html`;
                  a.click();
                  URL.revokeObjectURL(url);
                }} style={{background:C.navy,color:"#fff",border:"none",borderRadius:7,padding:"6px 13px",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                  ⬇ Herunterladen
                </button>
                {/* Print / Save as PDF */}
                <button onClick={()=>{
                  const win=document.createElement("iframe");
                  win.style.cssText="position:fixed;width:0;height:0;border:none;";
                  document.body.appendChild(win);
                  win.contentDocument.write(pdfContent);
                  win.contentDocument.close();
                  win.contentWindow.focus();
                  win.contentWindow.print();
                  setTimeout(()=>document.body.removeChild(win),1000);
                }} style={{background:C.orange,color:"#fff",border:"none",borderRadius:7,padding:"6px 13px",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                  🖨 Drucken / PDF
                </button>
                <button onClick={()=>setPdfContent(null)} style={{background:C.bg,color:C.sub,border:"none",borderRadius:6,width:28,height:28,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>×</button>
              </div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}} dangerouslySetInnerHTML={{__html:pdfContent}}/>
          </div>
        </div>
      )}
    </div>
  );
}
