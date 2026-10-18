/**
 * KaamSetu v1 — Gurgaon (Gurugram) demo seed
 * ───────────────────────────────────────────
 *   cd legacy/website-v1
 *   npm run seed            # then log in at /loginPage
 *
 * Demo accounts (all roles pass the real bcrypt login flow):
 *   Admin   →  admin@kaamsetu.demo        / Admin@123
 *   Client  →  demo.client@kaamsetu.demo  / Client@123
 *   Labor   →  demo.labor@kaamsetu.demo   / Labor@123
 *
 * Idempotent: re-running wipes ONLY the demo data (anything tied to the
 * @kaamsetu.demo accounts) and reseeds it. Your real data is untouched.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User.js';
import { Job } from '../src/models/Job.js';
import { Payment } from '../src/models/Payment.js';
import { Rating } from '../src/models/Rating.js';
import { Dispute } from '../src/models/Dispute.js';

const DEMO_DOMAIN = 'kaamsetu.demo';

// ── Users ─────────────────────────────────────────────────────────────────────
const PASSWORDS = { admin: 'Admin@123', client: 'Client@123', labor: 'Labor@123' };

const laborers = [
  // name, skills, locality, pin, upi
  ['Ramesh Yadav',   ['Masonry', 'Plastering', 'Tiling'],        'H.No. 214, Sector 56, Gurugram',        122011, 'ramesh.yadav@upi'],
  ['Suresh Kumar',   ['Electrician', 'Wiring', 'Inverter Setup'],'C-88, DLF Phase 2, Gurugram',           122002, 'suresh.kumar@okaxis'],
  ['Mohan Lal',      ['Plumbing', 'Bathroom Fitting'],           'Shop 4, Sikanderpur Mkt, Gurugram',     122004, 'mohanlal@paytm'],
  ['Anil Sharma',    ['Painting', 'Texture Work', 'Waterproofing'], 'B-152, Sector 14, Gurugram',         122001, 'anil.sharma@ybl'],
  ['Vijay Singh',    ['Carpentry', 'Furniture Repair'],          'Gali No. 7, Old Gurgaon',               122001, 'vijay.singh@okicici'],
  ['Rajesh Kumar',   ['Tiling', 'Granite Fitting'],              'Pocket B, Palam Vihar, Gurugram',       122017, 'rajesh.k@upi'],
  ['Santosh Das',    ['Welding', 'Gate Fabrication'],            'Plot 31, Udyog Vihar Ph IV, Gurugram',  122015, 'santosh.das@upi'],
  ['Deepak Verma',   ['POP False Ceiling', 'Gypsum Work'],       'H.No. 77, Sector 57, Gurugram',         122003, 'deepak.verma@okhdfc'],
  ['Manoj Gupta',    ['AC Repair', 'Refrigeration'],             'D-210, Sector 44, Gurugram',            122003, 'manoj.gupta@ybl'],
  ['Pradeep Singh',  ['Helper', 'Loading-Unloading'],            'E-45, Maruti Kunj, Gurugram',           122015, 'pradeep.s@upi'],
];

const clients = [
  ['Rohan Malhotra',   'Malhotra Constructions', '804, Tower B, DLF Phase 3, Gurugram',      122010],
  ['Priya Kapoor',     '',                        'C-1206, Sushant Lok 1, Gurugram',          122002],
  ['Amit Bhatia',      'Bhatia Interiors',        'H.No. 431, Sector 50, Gurugram',           122018],
  ['Neha Aggarwal',    '',                        'Villa 23, Sector 46, Gurugram',            122003],
  ['Vikram Choudhary', 'Choudhary Estates',       'Block F, Nirvana Country, Gurugram',       122018],
];

let phoneSeq = 9810000000;
const ph = () => String(phoneSeq++);

// ── Seed body ─────────────────────────────────────────────────────────────────
async function seed() {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not set. Put your Atlas URI in legacy/website-v1/.env first.');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // 1) Wipe previous demo data only
  const demoUsers = await User.find({ email: new RegExp(`@${DEMO_DOMAIN}$`) }).select('_id');
  const ids = demoUsers.map((u) => u._id);
  const demoJobs = await Job.find({ client: { $in: ids } }).select('_id');
  const jobIds = demoJobs.map((j) => j._id);
  await Promise.all([
    User.deleteMany({ _id: { $in: ids } }),
    Job.deleteMany({ $or: [{ client: { $in: ids } }, { laborers: { $in: ids } }] }),
    Payment.deleteMany({ $or: [{ client: { $in: ids } }, { laborer: { $in: ids } }] }),
    Rating.deleteMany({ $or: [{ client: { $in: ids } }, { laborer: { $in: ids } }] }),
    Dispute.deleteMany({ $or: [{ client: { $in: ids } }, { labor: { $in: ids } }] }),
  ]);
  console.log(`🧹 Cleared ${ids.length} old demo user(s) and their data`);

  // 2) Users
  const hash = (pw) => bcrypt.hash(pw, 10);
  const [demoAdmin, rohan, priya, amit, neha, vikram] = await User.create([
    { name: 'KaamSetu Admin', email: `admin@${DEMO_DOMAIN}`, password: await hash(PASSWORDS.admin), phone: ph(), role: 'admin', address: 'KaamSetu HQ, Sector 44, Gurugram', pin: 122003 },
    { name: clients[0][0], company: clients[0][1], email: `demo.client@${DEMO_DOMAIN}`, password: await hash(PASSWORDS.client), phone: ph(), role: 'client', address: clients[0][2], pin: clients[0][3] },
    { name: clients[1][0], company: clients[1][1], email: `priya.kapoor@${DEMO_DOMAIN}`, password: await hash(PASSWORDS.client), phone: ph(), role: 'client', address: clients[1][2], pin: clients[1][3] },
    { name: clients[2][0], company: clients[2][1], email: `amit.bhatia@${DEMO_DOMAIN}`, password: await hash(PASSWORDS.client), phone: ph(), role: 'client', address: clients[2][2], pin: clients[2][3] },
    { name: clients[3][0], company: clients[3][1], email: `neha.aggarwal@${DEMO_DOMAIN}`, password: await hash(PASSWORDS.client), phone: ph(), role: 'client', address: clients[3][2], pin: clients[3][3] },
    { name: clients[4][0], company: clients[4][1], email: `vikram.choudhary@${DEMO_DOMAIN}`, password: await hash(PASSWORDS.client), phone: ph(), role: 'client', address: clients[4][2], pin: clients[4][3] },
  ]);

  const laborUsers = await User.create(await Promise.all(laborers.map(async ([name, skills, address, pin, upiId], i) => ({
    name,
    email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@${DEMO_DOMAIN}`,
    password: await hash(PASSWORDS.labor),
    phone: ph(),
    role: 'labor',
    skills,
    address,
    pin,
    upiId,
  }))));
  const [ramesh, suresh, mohan, anil, vijay, rajesh] = laborUsers;
  console.log(`👷 Created ${laborUsers.length} laborers, 5 clients, 1 admin (all @${DEMO_DOMAIN})`);

  // The headliner demo labor account (Ramesh) also answers to demo.labor@…
  // — easiest login to remember. Make a dedicated one instead of reusing Ramesh:
  const demoLabor = await User.create({
    name: 'Ramesh Yadav (Demo)',
    email: `demo.labor@${DEMO_DOMAIN}`,
    password: await hash(PASSWORDS.labor),
    phone: ph(),
    role: 'labor',
    skills: ['Masonry', 'Plastering', 'Tiling'],
    address: laborers[0][2],
    pin: laborers[0][3],
    upiId: 'demo.labor@upi',
  });

  const now = Date.now();
  const days = (n) => new Date(now + n * 86400000);

  // 3) Jobs — 'posted' ones appear on the labor "Available Jobs" page
  const jobs = await Job.create([
    // ← posted (open to applications)
    { title: 'Bathroom tile renovation — 120 sq ft', description: 'Purani tiles hata ke Kajaria anti-skid tiles lagwani hain. Material client ka, labour worker ka. Kaam 4 din mein karna hai.', location: 'Sector 56, Gurugram', category: 'Tiling', subCategory: 'Bathroom', budget: 8500, startDate: days(3), client: rohan._id, status: 'posted', applied: [rajesh._id] },
    { title: 'Split AC installation + gas refill ×2', description: 'Two 1.5-ton Daikin split ACs install karwane hain, ek ki gas top-up bhi. Society permission le rakhi hai.', location: 'Sushant Lok 1, Gurugram', category: 'AC Repair', subCategory: 'Installation', budget: 2400, startDate: days(2), client: priya._id, status: 'posted' },
    { title: 'POP false ceiling — 12×14 bedroom', description: 'Gypsum board ceiling with L-box cove lighting channels. Design photo mil jayegi on site.', location: 'Sector 57, Gurugram', category: 'False Ceiling', subCategory: 'POP', budget: 15000, startDate: days(5), client: amit._id, status: 'posted' },
    { title: '2BHK interior painting (Asian Paints Royale)', description: 'Full 2BHK, ~950 sq ft wall area, 2 coats putty + 2 coats paint. Painter apna ladder/roller layega.', location: 'Sector 14, Gurugram', category: 'Painting', subCategory: 'Interior', budget: 18500, startDate: days(7), client: neha._id, status: 'posted', applied: [anil._id] },
    { title: 'Kitchen sink leakage + tap replacement', description: 'Under-sink pipe joint se paani tapak raha hai. Jaquar ka naya mixer bhi fit karna hai.', location: 'DLF Phase 2, Gurugram', category: 'Plumbing', subCategory: 'Repair', budget: 900, startDate: days(1), client: rohan._id, status: 'posted' },
    { title: 'Wardrobe laminate repair (2 almirahs)', description: 'Laminate edges ud gaye hain, re-pasting + edge banding. Century plywood finish match karna ho toh best.', location: 'Old Gurgaon', category: 'Carpentry', subCategory: 'Repair', budget: 3500, startDate: days(4), client: priya._id, status: 'posted' },
    { title: 'Iron main gate welding + enamel paint', description: 'Gate ke hinges crack ho gaye hain, re-weld + primer + black enamel. Gate size approx 8×6 ft.', location: 'Udyog Vihar Phase IV, Gurugram', category: 'Welding', subCategory: 'Gate Repair', budget: 4800, startDate: days(6), client: vikram._id, status: 'posted' },
    // ← active (demo labor currently working — shows in dashboards/past jobs)
    { title: 'Boundary wall plastering — 60 ft', description: 'Compound wall plaster with cement-sand 1:4, curing 3 days. Society site, guard ko inform karna.', location: 'Sector 56, Gurugram', category: 'Plastering', subCategory: 'Boundary Wall', budget: 22000, cost: 19500, startDate: days(-4), endDate: days(3), client: rohan._id, laborers: [demoLabor._id], status: 'active',
      updates: [
        { title: 'Work started', text: 'Site visit ho gayi, scaffolding set kar di. Kal se plaster shuru.', timeStamp: days(-3) },
        { title: '50% done', text: 'North side 30 ft complete. Quality check ke baad remaining karenge.', timeStamp: days(-1) },
      ] },
    { title: 'Modular kitchen countertop granite fitting', description: '16 ft black galaxy granite fit + polish, sink cutout included. Granite samaan society basement mein pada hai.', location: 'Palam Vihar, Gurugram', category: 'Tiling', subCategory: 'Granite', budget: 12000, cost: 11500, startDate: days(-9), endDate: days(-2), client: rohan._id, laborers: [demoLabor._id], status: 'completed' },
    { title: 'Drawing room electrical rewiring (partial)', description: '8 naye points + 2 MCB change. Concealed wiring, casing-patti allowed on 2 walls.', location: 'Nirvana Country, Gurugram', category: 'Electrician', subCategory: 'Rewiring', budget: 28000, cost: 26500, startDate: days(-14), endDate: days(-5), client: vikram._id, laborers: [suresh._id], status: 'completed' },
    { title: 'Garden shed demolition', description: 'Old tin shed (10×8) demolish + malba removal.', location: 'Sector 46, Gurugram', category: 'Demolition', subCategory: 'Small Structure', budget: 6000, startDate: days(-2), client: neha._id, status: 'cancelled', cancelationReason: 'Monsoon aa gaya — project postponed till October.' },
  ]);
  const [j1, , , , , , , j8, j9, j10] = jobs;
  console.log(`💼 Created ${jobs.length} jobs (posted / active / completed / cancelled)`);

  // 4) Payments
  await Payment.create([
    { job: j9._id,  client: rohan._id,  laborer: demoLabor._id, amount: 11500, transactionId: 'TXN-DEMO-2401', status: 'completed', dueDate: days(-2), doneDate: days(-2) },
    { job: j10._id, client: vikram._id, laborer: suresh._id,    amount: 26500, transactionId: 'TXN-DEMO-2402', status: 'completed', dueDate: days(-5), doneDate: days(-4) },
    { job: j8._id,  client: rohan._id,  laborer: demoLabor._id, amount: 9750,  transactionId: 'TXN-DEMO-2403', status: 'pending',   dueDate: days(4) },
    { job: j1._id,  client: rohan._id,                           amount: 8500,  transactionId: 'TXN-DEMO-2404', status: 'pending',   dueDate: days(6) },
  ]);

  // 5) Ratings for the completed jobs
  await Rating.create([
    { laborer: demoLabor._id, client: rohan._id,  job: j9._id,  score: 5, review: 'Ramesh ji ne granite fitting ekdum saaf ki, time pe finish. Highly recommended!' },
    { laborer: suresh._id,    client: vikram._id, job: j10._id, score: 4, review: 'Wiring ka kaam accha hua. Thoda late aaye ek din, warna perfect.' },
    { laborer: demoLabor._id, client: priya._id,  job: j9._id,  score: 5, review: 'Very polite and professional. Cleaned the site before leaving.' },
  ]);

  // 6) One open dispute so the admin dispute page has content
  await Dispute.create([
    { job: j10._id, client: vikram._id, labor: suresh._id, description: 'Client claims 2 new points are not working after final payment request. Worker says MCB tripping is due to client\'s old inverter, pending inspection.', status: 'open' },
  ]);
  console.log('💳 Payments, ⭐ ratings and ⚖️ dispute seeded');

  // 7) Report
  console.log(`
────────────────────────────────────────────────────────
✅ Demo seed complete — log in at http://localhost:3000/loginPage

  Role     Email                        Password
  ──────── ──────────────────────────── ──────────
  Admin    admin@${DEMO_DOMAIN}           ${PASSWORDS.admin}
  Client   demo.client@${DEMO_DOMAIN}     ${PASSWORDS.client}
  Labor    demo.labor@${DEMO_DOMAIN}      ${PASSWORDS.labor}

(Every @${DEMO_DOMAIN} account shares its role's password.)
────────────────────────────────────────────────────────`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
