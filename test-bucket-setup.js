// Test Supabase Storage Bucket Setup
// Run this in your browser console or as a Node.js script

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://xnmnklgmmeqpajxwrkir.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhubW5rbGdtbWVxcGFqeHdya2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MzQ0MzgsImV4cCI6MjA4ODMxMDQzOH0.kQAaa27pr99vO8Ez1ffQJMrdFmiYD2uc00odwOmA9eM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testBucket() {
  try {
    // Test 1: List buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    console.log('Available buckets:', buckets)
    
    if (bucketsError) {
      console.error('Buckets error:', bucketsError)
      return
    }

    // Test 2: Check if our bucket exists
    const newArrivalsBucket = buckets.find(bucket => bucket.id === 'new-arrivals-images')
    if (newArrivalsBucket) {
      console.log('✅ new-arrivals-images bucket exists:', newArrivalsBucket)
    } else {
      console.log('❌ new-arrivals-images bucket NOT found')
      return
    }

    // Test 3: Test public URL generation
    const { data: publicUrlData } = supabase.storage
      .from('new-arrivals-images')
      .getPublicUrl('test-file.jpg')
    
    console.log('✅ Public URL test:', publicUrlData.publicUrl)

    // Test 4: List files in bucket (should be empty initially)
    const { data: files, error: filesError } = await supabase.storage
      .from('new-arrivals-images')
      .list()
    
    if (filesError) {
      console.error('Files list error:', filesError)
    } else {
      console.log('✅ Files in bucket:', files)
    }

  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Run the test
testBucket()