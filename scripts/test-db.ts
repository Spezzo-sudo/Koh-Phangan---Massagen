#!/usr/bin/env node

/**
 * Database Connection Test
 * Run with: npx tsx scripts/test-db.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔗 Testing Supabase Connection...');
  console.log(`📍 URL: ${supabaseUrl.substring(0, 30)}...`);

  try {
    // Test 1: Fetch services table
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id, title, price_60')
      .limit(1);

    if (servicesError) {
      console.error('❌ Services table error:', servicesError.message);
      return false;
    }

    console.log('✅ Services table accessible');
    console.log(`   Found ${services?.length || 0} service(s)`);

    // Test 2: Fetch bookings table
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, status')
      .limit(1);

    if (bookingsError) {
      console.error('❌ Bookings table error:', bookingsError.message);
      return false;
    }

    console.log('✅ Bookings table accessible');
    console.log(`   Found ${bookings?.length || 0} booking(s)`);

    // Test 3: Fetch profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, role')
      .limit(1);

    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError.message);
      return false;
    }

    console.log('✅ Profiles table accessible');
    console.log(`   Found ${profiles?.length || 0} profile(s)`);

    console.log('\n✅ All tests passed! Database is ready.');
    return true;
  } catch (err: any) {
    console.error('❌ Connection failed:', err.message);
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
