/**
 * KaamSetu v2 — Gurgaon (Gurugram) demo seed
 * ───────────────────────────────────────────
 *   cd Backend
 *   npm run seed            # then use the web app / admin panel
 *
 * Demo accounts (pass the real bcrypt + isTemporary login flow):
 *   Client  →  demo.client@kaamsetu.demo  / Client@123
 *   Worker  →  demo.worker@kaamsetu.demo  / Worker@123
 *   Admin   →  your ADMIN_PASSWORD env (admin panel — no seed needed)
 *
 * Idempotent: re-running wipes ONLY the demo data (anything tied to the
 * @kaamsetu.demo accounts) and reseeds it. Real user data is untouched.
 *
 * NOTE: seeded users are created with isTemporary:false — v2 auto-deletes
 *       temporary users after 10 minutes via TTL index.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Client from '../src/models/Client.js';
import Worker from '../src/models/Worker.js';
import Job from '../src/models/Job.js';
import Review from '../src/models/Review.js';

const DEMO_DOMAIN = 'kaamsetu.demo';
const PASSWORDS = { client: 'Client@123', worker: 'Worker@123' };
const AVATAR = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

// ── Gurugram localities (approximate coordinates) ────────────────────────────
const G = {
  sector56:   { city: 'Sector 56, Gurugram',       location: { lat: 28.4143, lon: 77.1036 } },
  dlf2:       { city: 'DLF Phase 2, Gurugram',     location: { lat: 28.4906, lon: 77.0913 } },
  dlf3:       { city: 'DLF Phase 3, Gurugram',     location: { lat: 28.4965, lon: 77.0915 } },
  sushantLok: { city: 'Sushant Lok 1, Gurugram',   location: { lat: 28.4730, lon: 77.0818 } },
  sector14:   { city: 'Sector 14, Gurugram',       location: { lat: 28.4717, lon: 77.0459 } },
  oldGurgaon: { city: 'Old Gurgaon',               location: { lat: 28.4595, lon: 77.0266 } },
  palamVihar: { city: 'Palam Vihar, Gurugram',     location: { lat: 28.5024, lon: 77.0364 } },
  udyogVihar: { city: 'Udyog Vihar, Gurugram',     location: { lat: 28.4956, lon: 77.0840 } },
  sector57:   { city: 'Sector 57, Gurugram',       location: { lat: 28.4092, lon: 77.0810 } },
  sector50:   { city: 'Sector 50, Gurugram',       location: { lat: 28.4243, lon: 77.0586 } },
  sector46:   { city: 'Sector 46, Gurugram',       location: { lat: 28.4399, lon: 77.0566 } },
  sector44:   { city: 'Sector 44, Gurugram',       location: { lat: 28.4542, lon: 77.0709 } },
  nirvana:    { city: 'Nirvana Country, Gurugram', location: { lat: 28.4172, lon: 77.0607 } },
};

// name, slug, skills, experience yrs, area key, aadhaar state, bio
const workers = [
  ['Ramesh Yadav',  'ramesh.yadav',  ['mason', 'tiler', 'helper'],            9, 'sector56',   'verified', 'Time pe kaam, saaf finish. Masonry, plaster aur tiling ka 9 saal ka experience.'],
  ['Suresh Kumar',  'suresh.kumar',  ['electrician'],                          7, 'dlf2',       'verified', 'Licensed electrician — wiring, MCB, inverter aur smart home points.'],
  ['Mohan Lal',     'mohan.lal',     ['plumber'],                             11, 'oldGurgaon', 'pending',  'Bathroom/kitchen plumbing, Jaquar fittings specialist.'],
  ['Anil Sharma',   'anil.sharma',   ['painter'],                              8, 'sector14',   'pending',  'Royale/texture painting, waterproofing ka bhi kaam.'],
  ['Vijay Singh',   'vijay.singh',   ['carpenter', 'furniture-assembler'],     6, 'oldGurgaon', 'verified', 'Modular furniture, wardrobe repair, IKEA assembly.'],
  ['Rajesh Kumar',  'rajesh.kumar',  ['tiler'],                               10, 'palamVihar', 'verified', 'Kajaria/Johnson tiles, granite countertop fitting.'],
  ['Manoj Gupta',   'manoj.gupta',   ['ac-repair', 'appliance-repair'],        8, 'sector44',   'verified', 'Split/window AC install, gas refill, fridge repair.'],
  ['Sunita Devi',   'sunita.devi',   ['cleaner', 'sofa-cleaning'],             4, 'sector46',   undefined,  'Full home deep cleaning, sofa & carpet shampooing.'],
  ['Kavita Joshi',  'kavita.joshi',  ['cook'],                                 6, 'sushantLok', 'verified', 'North Indian + tandoor specialist, party cooking available.'],
  ['Arun Tomar',    'arun.tomar',    ['driver'],                              12, 'udyogVihar', undefined,  'Local + outstation driving, night duty bhi kar sakta hoon.'],
  ['Rakesh Pal',    'rakesh.pal',    ['gardener'],                             5, 'sector50',   'rejected', 'Lawn care, terrace garden setup, seasonal plantation.'],
  ['Pooja Rani',    'pooja.rani',    ['tutor'],                                3, 'nirvana',    'verified', 'Class 1–8 all subjects + Spoken English, home tuitions.'],
  ['Omkar Nath',    'omkar.nath',    ['pest-control'],                         7, 'sector57',   'verified', 'Termite, cockroach, bed-bug treatment — herbal options too.'],
  ['Babu Lal',      'babu.lal',      ['helper', 'moving-packing'],             2, 'sector56',   undefined,  'Shifting/packing, loading-unloading ka pura setup.'],
];

const clients = [
  ['Rohan Malhotra',   'rohan.malhotra',  'dlf3',      'verified'],
  ['Priya Kapoor',     'priya.kapoor',    'sushantLok','pending'],
  ['Amit Bhatia',      'amit.bhatia',     'sector50',  undefined],
  ['Neha Aggarwal',    'neha.aggarwal',   'sector46',  undefined],
  ['Vikram Choudhary', 'vikram.choudhary','nirvana',   'verified'],
];

let phoneSeq = 9811000000;
const ph = () => String(phoneSeq++);
let aadhaarSeq = 999900001111;
const fakeAadhaar = () => String(aadhaarSeq += 37);

const days = (n) => new Date(Date.now() + n * 86400000);
const hash = (pw) => bcrypt.hash(pw, 12); // 12 rounds — matches the app

const aadhaarFor = (state, docUrl) => {
  if (state === undefined) return {};
  const base = { number: fakeAadhaar(), verificationStatus: state, submittedAt: days(-6) };
  if (docUrl) base.documentUrl = docUrl;
  return base;
};

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set — put it in Backend/.env (see .env.example).');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // 1) Wipe previous demo data only
  const demoClients = await Client.find({ 'email.email': new RegExp(`@${DEMO_DOMAIN}$`) }).select('_id');
  const demoWorkers = await Worker.find({ 'email.email': new RegExp(`@${DEMO_DOMAIN}$`) }).select('_id');
  const clientIds = demoClients.map((u) => u._id);
  const workerIds = demoWorkers.map((u) => u._id);
  await Promise.all([
    Client.deleteMany({ _id: { $in: clientIds } }),
    Worker.deleteMany({ _id: { $in: workerIds } }),
    Job.deleteMany({ $or: [{ clientId: { $in: clientIds } }, { workerId: { $in: workerIds } }] }),
    Review.deleteMany({ $or: [{ clientId: { $in: clientIds } }, { workerId: { $in: workerIds } }] }),
  ]);
  console.log(`🧹 Cleared ${clientIds.length + workerIds.length} old demo user(s) and their data`);

  // 2) Workers (~13 across the main skills) + one blocked account for admin UX
  const workerDocs = await Worker.create(await Promise.all(workers.map(
    async ([name, slug, skills, experience, area, aadhaarState, bio]) => new Worker({
      name,
      email: { email: `${slug}@${DEMO_DOMAIN}`, verified: true },
      phone: { phone: ph(), verified: true },
      aadhaar: aadhaarFor(aadhaarState, aadhaarState === 'pending'
        ? 'https://res.cloudinary.com/demo/image/upload/sample.jpg' : undefined),
      profilePicture: AVATAR,
      address: G[area],
      skills,
      experience,
      bio,
      password: await hash(PASSWORDS.worker),
      isTemporary: false,
    })
  )));
  const [ramesh, suresh, mohan, anil, vijay, rajesh, manoj, sunita, kavita, arun, rakesh, pooja, omkar, babu] = workerDocs;

  const demoWorker = await Worker.create({
    name: 'Ramesh Yadav (Demo)',
    email: { email: `demo.worker@${DEMO_DOMAIN}`, verified: true },
    phone: { phone: ph(), verified: true },
    aadhaar: aadhaarFor('verified'),
    profilePicture: AVATAR,
    address: G.sector56,
    skills: ['mason', 'tiler', 'helper', 'painter'],
    experience: 9,
    bio: 'Demo worker account — masonry, plaster, tiling. Gurgaon local, 9 saal experience.',
    password: await hash(PASSWORDS.worker),
    isTemporary: false,
  });

  await Worker.create({
    name: 'Blocked Test Worker',
    email: { email: `blocked.worker@${DEMO_DOMAIN}`, verified: true },
    phone: { phone: ph(), verified: true },
    address: G.oldGurgaon,
    skills: ['helper'],
    experience: 1,
    bio: 'Used to demo the blocked-account state in the admin panel.',
    password: await hash(PASSWORDS.worker),
    isTemporary: false,
    blocked: true,
  });
  console.log(`👷 Created ${workerDocs.length + 2} workers (2 aadhaar pending → admin verification queue)`);

  // 3) Clients
  // Client #0 (Rohan) doubles as the memorable demo login — same convention as v1.
  const clientDocs = await Client.create(await Promise.all(clients.map(
    async ([name, slug, area, aadhaarState], i) => new Client({
      name,
      email: { email: `${i === 0 ? 'demo.client' : slug}@${DEMO_DOMAIN}`, verified: true },
      phone: { phone: ph(), verified: true },
      aadhaar: aadhaarFor(aadhaarState, aadhaarState === 'pending'
        ? 'https://res.cloudinary.com/demo/image/upload/sample.jpg' : undefined),
      profilePicture: AVATAR,
      address: G[area],
      password: await hash(PASSWORDS.client),
      isTemporary: false,
    })
  )));
  const [rohan, priya, amit, neha, vikram] = clientDocs;
  console.log(`🏠 Created ${clientDocs.length} clients`);

  // 4) Jobs — posted ones fill every worker's "Find Work" feed
  const posted = [
    ['Bathroom tile renovation — 120 sq ft', 'Purani tiles hata ke anti-skid Kajaria tiles lagwani hain. Material client ka, labour worker ka.', 'tiler', G.sector56, rohan, true],
    ['Split AC installation — 1.5 ton ×2', 'Two Daikin split ACs install karwane hain, society permission ready hai.', 'ac-repair', G.sushantLok, priya, false],
    ['POP false ceiling — 12×14 bedroom', 'Gypsum ceiling with cove lighting channels. Design photo share kar dunga.', 'carpenter', G.sector57, amit, false],
    ['2BHK interior painting (Royale)', '~950 sq ft wall area, 2 putty + 2 paint coats. Ladder/roller painter layega.', 'painter', G.sector14, neha, false],
    ['Kitchen sink leakage fix + new mixer', 'Under-sink joint se leakage, Jaquar mixer bhi fit karna hai. Urgent — paani zyada ho raha.', 'plumber', G.dlf2, rohan, true],
    ['Wardrobe laminate repair (2 almirahs)', 'Laminate edges ud gaye hain, re-pasting + edge banding chahiye.', 'carpenter', G.oldGurgaon, priya, false],
    ['8 new electrical points + MCB change', 'Concealed wiring, casing-patti allowed on 2 walls. Inverter point bhi shift karna hai.', 'electrician', G.nirvana, vikram, true],
    ['Full home deep cleaning + sofa shampoo', '3BHK deep clean (kitchen included) + 5-seater sofa shampooing.', 'cleaner', G.sector50, amit, false],
    ['Birthday party cook — 25 guests', 'North Indian menu (2 sabzi, dal, tandoori roti, dessert). Saturday evening 5–10 pm.', 'cook', G.sushantLok, priya, false],
    ['Termite treatment — 2BHK ground floor', 'Pre-monsoon anti-termite drill treatment full flat ke liye chahiye.', 'pest-control', G.sector46, neha, true],
    ['Terrace garden setup — 15 planters', 'New planters, soil mix, drip line setup for a sunny terrace.', 'gardener', G.sector50, amit, false],
    ['Class 4 Maths + English home tutor', 'Weekdays 5–6 pm, CBSE board, sector 50 location. Female tutor preferred.', 'tutor', G.nirvana, vikram, false],
  ];

  const postedJobs = await Job.create(posted.map(([title, description, skill, area, client, urgency]) => ({
    title, description, skill, urgency,
    address: area,
    clientId: client._id,
    status: 'posted',
  })));

  const [graniteJob, rewireJob] = await Job.create([
    {
      title: 'Modular kitchen countertop granite fit + polish',
      description: '16 ft black galaxy granite, sink cutout included. Society basement mein material pada hai.',
      skill: 'tiler',
      address: G.palamVihar,
      clientId: rohan._id,
      workerId: demoWorker._id,
      status: 'completed',
      completionDate: days(-3),
      paymentStatus: 'completed',
    },
    {
      title: 'Drawing room electrical rewiring (partial)',
      description: '8 naye points + 2 MCB change, casing-patti on 2 walls.',
      skill: 'electrician',
      address: G.nirvana,
      clientId: vikram._id,
      workerId: suresh._id,
      status: 'completed',
      completionDate: days(-6),
      paymentStatus: 'completed',
    },
  ]);

  const activeJob = await Job.create({
    title: 'Boundary wall plastering — 60 ft',
    description: 'Compound wall plaster 1:4 cement-sand, 3 din curing. Kaam already chal raha hai.',
    skill: 'mason',
    address: G.sector56,
    clientId: rohan._id,
    workerId: demoWorker._id,
    status: 'active',
    paymentStatus: 'pending',
  });

  await Job.create({
    title: 'Kitchen countertop granite polish (repeat work)',
    description: 'Same society, same client — polish + sealing repeat job, 2 din ka kaam.',
    skill: 'tiler',
    address: G.palamVihar,
    clientId: rohan._id,
    workerId: rajesh._id,
    status: 'assigned',
    paymentStatus: 'pending',
  });
  console.log(`💼 Created ${postedJobs.length + 4} jobs (12 posted, 1 assigned, 1 active, 2 completed)`);

  // 5) Bidirectional reviews on completed jobs
  await Review.create([
    { clientId: rohan._id,  workerId: demoWorker._id, jobId: graniteJob._id, reviewType: 'client-to-worker', rating: 5, review: 'Granite fitting ekdum clean, time pe finish. Highly recommended!' },
    { clientId: rohan._id,  workerId: demoWorker._id, jobId: graniteJob._id, reviewType: 'worker-to-client', rating: 5, review: 'Great client — material ready tha, payment on time.' },
    { clientId: vikram._id, workerId: suresh._id,     jobId: rewireJob._id,  reviewType: 'client-to-worker', rating: 4, review: 'Wiring ka kaam accha hua. Ek din thoda late aaye, warna perfect.' },
    { clientId: vikram._id, workerId: suresh._id,     jobId: rewireJob._id,  reviewType: 'worker-to-client', rating: 5, review: 'Clear requirements, no payment hassle.' },
    { clientId: priya._id,  workerId: demoWorker._id, jobId: graniteJob._id, reviewType: 'client-to-worker', rating: 5, review: 'Very polite and professional, cleaned the site before leaving.' },
  ]);
  console.log(`⭐ Created 5 reviews · active job for the demo worker: "${activeJob.title}"`);

  // 6) Report
  console.log(`
────────────────────────────────────────────────────────
✅ v2 demo seed complete

  App      Login                          Password
  ──────── ──────────────────────────── ──────────
  Web app  demo.client@${DEMO_DOMAIN}     ${PASSWORDS.client}
  Web app  demo.worker@${DEMO_DOMAIN}     ${PASSWORDS.worker}
  Admin    (your ADMIN_PASSWORD env value)

  • Worker login → "Find Work" shows 12 open Gurugram jobs,
    "My Works" shows 1 active + 1 completed job with 5★ reviews
  • Client login → posted/active/completed jobs across the board
  • Admin panel → 3 pending Aadhaar verifications, stats, reviews,
    user management (1 blocked worker demo account)
  • Every @${DEMO_DOMAIN} worker/client uses their role password.
────────────────────────────────────────────────────────`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
