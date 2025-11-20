/**
 * SEED SCRIPT FOR PHANGAN SERENITY
 * 
 * Usage: node seed.js
 * 
 * This script creates test data (services, therapists, customers) in Supabase
 */

const https = require('https');
const dotenv = require('dotenv');

// Load .env file
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

// Helper to make HTTP requests to Supabase
async function supabaseRequest(method, table, data) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`, SUPABASE_URL);
  
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`${res.statusCode}: ${body}`));
        } else {
          resolve(JSON.parse(body || '[]'));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function seedData() {
  console.log('🌱 Starting seed process...\n');

  try {
    // 1. Seed Services
    console.log('📋 Seeding services...');
    const services = [
      { id: 'svc-001', title: 'Thai Massage', description: 'Traditional Thai massage', price_60: 1500, price_90: 2000, type: 'Thai Massage', category: 'Massage', staff_required: 1 },
      { id: 'svc-002', title: 'Oil Massage', description: 'Relaxing oil massage', price_60: 1800, price_90: 2200, type: 'Oil Massage', category: 'Massage', staff_required: 1 },
      { id: 'svc-003', title: 'Deep Tissue', description: 'Therapeutic massage', price_60: 2000, price_90: 2500, type: 'Deep Tissue', category: 'Massage', staff_required: 1 },
      { id: 'svc-004', title: 'Manicure', description: 'Professional manicure', price_60: 500, price_90: null, type: 'Manicure', category: 'Nails', staff_required: 1 },
      { id: 'svc-005', title: 'Pedicure', description: 'Professional pedicure', price_60: 600, price_90: null, type: 'Pedicure', category: 'Nails', staff_required: 1 },
    ];

    for (const service of services) {
      await supabaseRequest('POST', 'services', service);
      console.log(`  ✓ Created service: ${service.title}`);
    }

    // 2. Seed Profiles (Therapists & Customers)
    console.log('\n👥 Seeding therapist profiles...');
    const therapists = [
      { id: 'therapist-001', email: 'ms.ang@phanganserenity.com', role: 'therapist', full_name: 'Ms. Ang', phone: '+66-123-456789', is_verified: true, available: true, skills: ['Thai Massage', 'Oil Massage'] },
      { id: 'therapist-002', email: 'somchai@phanganserenity.com', role: 'therapist', full_name: 'Somchai', phone: '+66-234-567890', is_verified: true, available: true, skills: ['Deep Tissue', 'Oil Massage'] },
      { id: 'therapist-003', email: 'noi@phanganserenity.com', role: 'therapist', full_name: 'Noi', phone: '+66-345-678901', is_verified: true, available: true, skills: ['Manicure', 'Pedicure'] },
    ];

    for (const therapist of therapists) {
      await supabaseRequest('POST', 'profiles', therapist);
      console.log(`  ✓ Created therapist: ${therapist.full_name}`);
    }

    console.log('\n👥 Seeding customer profiles...');
    const customers = [
      { id: 'customer-001', email: 'john@example.com', role: 'customer', full_name: 'John Doe', phone: '+66-666-111111' },
      { id: 'customer-002', email: 'sarah@example.com', role: 'customer', full_name: 'Sarah Smith', phone: '+66-666-222222' },
      { id: 'customer-003', email: 'maria@example.com', role: 'customer', full_name: 'Maria Garcia', phone: '+66-666-333333' },
    ];

    for (const customer of customers) {
      await supabaseRequest('POST', 'profiles', customer);
      console.log(`  ✓ Created customer: ${customer.full_name}`);
    }

    console.log('\n✅ Seeding completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Go to Supabase Auth tab');
    console.log('2. Create users with these test emails and set their metadata');
    console.log('3. Then you can login in the app');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedData();
