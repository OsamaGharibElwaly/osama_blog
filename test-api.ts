// test-api.ts في جذر المشروع
const API_BASE = 'http://localhost:3001/api'

async function testAPI(endpoint: string) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`)
    const data = await response.json()
    console.log(`✅ ${endpoint}:`, data.success ? 'SUCCESS' : 'FAILED')
    if (!data.success) console.log('Error:', data.error)
  } catch (error) {
    console.log(`❌ ${endpoint}: ERROR -`, error)
  }
}

async function runTests() {
  console.log('🧪 Testing Public APIs...\n')
  
  await testAPI('/posts')
  await testAPI('/authors')
  await testAPI('/categories')
  await testAPI('/tags')
  
  console.log('\n🎯 Testing completed!')
}

runTests()