const https = require('https')
const http = require('http')

// Performance test configuration
const CONFIG = {
  BASE_URL: 'http://localhost:3000',
  CONCURRENT_USERS: 10,
  TEST_DURATION: 60000, // 1 minute
  THRESHOLDS: {
    classification: 3000, // 3 seconds
    generation: 8000, // 8 seconds
    imageLoad: 2000, // 2 seconds
    navigation: 500, // 500ms
  }
}

// Metrics collection
class MetricsCollector {
  constructor() {
    this.results = {
      classification: [],
      generation: [],
      imageLoad: [],
      navigation: [],
      errors: []
    }
  }

  addResult(type, duration, success, error = null) {
    this.results[type].push({
      duration,
      success,
      error,
      timestamp: Date.now()
    })
  }

  getStats(type) {
    const results = this.results[type]
    if (results.length === 0) return null

    const durations = results.map(r => r.duration)
    const successes = results.filter(r => r.success).length
    const failures = results.length - successes

    return {
      count: results.length,
      successRate: (successes / results.length) * 100,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      p95Duration: this.percentile(durations, 95),
      failures
    }
  }

  percentile(arr, p) {
    const sorted = arr.sort((a, b) => a - b)
    const index = Math.ceil((p / 100) * sorted.length) - 1
    return sorted[index]
  }

  getAllStats() {
    return {
      classification: this.getStats('classification'),
      generation: this.getStats('generation'),
      imageLoad: this.getStats('imageLoad'),
      navigation: this.getStats('navigation'),
      totalErrors: this.results.errors.length
    }
  }
}

// HTTP request helper
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    
    const req = http.request(options, (res) => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => {
        const duration = Date.now() - startTime
        resolve({
          status: res.statusCode,
          body,
          duration,
          headers: res.headers
        })
      })
    })

    req.on('error', (error) => {
      const duration = Date.now() - startTime
      reject({ error, duration })
    })

    req.setTimeout(30000, () => {
      req.destroy()
      reject({ error: 'Request timeout', duration: Date.now() - startTime })
    })

    if (data) {
      req.write(JSON.stringify(data))
    }
    
    req.end()
  })
}

// Test functions
async function testClassification(metrics) {
  try {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/router/classify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }

    const response = await makeRequest(options, { message: 'fotossíntese' })
    
    const success = response.status === 200 && response.duration < CONFIG.THRESHOLDS.classification
    metrics.addResult('classification', response.duration, success)
    
    return { success, duration: response.duration }
  } catch (error) {
    metrics.addResult('classification', error.duration || 0, false, error.error)
    return { success: false, error: error.error }
  }
}

async function testGeneration(metrics) {
  try {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/professor/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }

    const response = await makeRequest(options, {
      topic: 'fotossíntese',
      level: 'medio',
      gamified: false
    })
    
    const success = response.status === 200 && response.duration < CONFIG.THRESHOLDS.generation
    metrics.addResult('generation', response.duration, success)
    
    return { success, duration: response.duration }
  } catch (error) {
    metrics.addResult('generation', error.duration || 0, false, error.error)
    return { success: false, error: error.error }
  }
}

async function testImageLoad(metrics) {
  try {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/image?prompt=fotossíntese',
      method: 'GET'
    }

    const response = await makeRequest(options)
    
    const success = (response.status === 200 || response.status === 302) && 
                   response.duration < CONFIG.THRESHOLDS.imageLoad
    metrics.addResult('imageLoad', response.duration, success)
    
    return { success, duration: response.duration }
  } catch (error) {
    metrics.addResult('imageLoad', error.duration || 0, false, error.error)
    return { success: false, error: error.error }
  }
}

async function testENEM(metrics) {
  try {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/enem',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }

    const response = await makeRequest(options, {
      startIndex: 0,
      count: 5,
      area: 'matematica'
    })
    
    const success = response.status === 200 && response.duration < 15000
    metrics.addResult('navigation', response.duration, success)
    
    return { success, duration: response.duration }
  } catch (error) {
    metrics.addResult('navigation', error.duration || 0, false, error.error)
    return { success: false, error: error.error }
  }
}

// Main test runner
async function runLoadTest() {
  console.log('🚀 Starting performance load test...')
  console.log(`📊 Configuration: ${CONFIG.CONCURRENT_USERS} users, ${CONFIG.TEST_DURATION}ms duration`)
  console.log('📈 Thresholds:', CONFIG.THRESHOLDS)
  console.log('')

  const metrics = new MetricsCollector()
  const startTime = Date.now()
  const endTime = startTime + CONFIG.TEST_DURATION

  // Run concurrent users
  const userPromises = []
  for (let i = 0; i < CONFIG.CONCURRENT_USERS; i++) {
    userPromises.push(runUserSession(metrics, endTime))
  }

  // Wait for all users to complete
  await Promise.all(userPromises)

  // Generate report
  generateReport(metrics, Date.now() - startTime)
}

async function runUserSession(metrics, endTime) {
  while (Date.now() < endTime) {
    // Run test sequence
    await testClassification(metrics)
    await sleep(1000)
    
    await testGeneration(metrics)
    await sleep(2000)
    
    await testImageLoad(metrics)
    await sleep(1000)
    
    await testENEM(metrics)
    await sleep(1000)
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function generateReport(metrics, totalDuration) {
  const stats = metrics.getAllStats()
  
  console.log('📊 Performance Test Results')
  console.log('=' .repeat(50))
  console.log(`⏱️  Total Duration: ${totalDuration}ms`)
  console.log(`👥 Concurrent Users: ${CONFIG.CONCURRENT_USERS}`)
  console.log(`❌ Total Errors: ${stats.totalErrors}`)
  console.log('')

  // Classification stats
  if (stats.classification) {
    console.log('🎯 Classification API:')
    console.log(`   Requests: ${stats.classification.count}`)
    console.log(`   Success Rate: ${stats.classification.successRate.toFixed(1)}%`)
    console.log(`   Avg Duration: ${stats.classification.avgDuration.toFixed(0)}ms`)
    console.log(`   P95 Duration: ${stats.classification.p95Duration.toFixed(0)}ms`)
    console.log(`   Threshold: ${CONFIG.THRESHOLDS.classification}ms`)
    console.log(`   ✅ Pass: ${stats.classification.p95Duration < CONFIG.THRESHOLDS.classification ? 'YES' : 'NO'}`)
    console.log('')
  }

  // Generation stats
  if (stats.generation) {
    console.log('📝 Generation API:')
    console.log(`   Requests: ${stats.generation.count}`)
    console.log(`   Success Rate: ${stats.generation.successRate.toFixed(1)}%`)
    console.log(`   Avg Duration: ${stats.generation.avgDuration.toFixed(0)}ms`)
    console.log(`   P95 Duration: ${stats.generation.p95Duration.toFixed(0)}ms`)
    console.log(`   Threshold: ${CONFIG.THRESHOLDS.generation}ms`)
    console.log(`   ✅ Pass: ${stats.generation.p95Duration < CONFIG.THRESHOLDS.generation ? 'YES' : 'NO'}`)
    console.log('')
  }

  // Image load stats
  if (stats.imageLoad) {
    console.log('🖼️  Image Load API:')
    console.log(`   Requests: ${stats.imageLoad.count}`)
    console.log(`   Success Rate: ${stats.imageLoad.successRate.toFixed(1)}%`)
    console.log(`   Avg Duration: ${stats.imageLoad.avgDuration.toFixed(0)}ms`)
    console.log(`   P95 Duration: ${stats.imageLoad.p95Duration.toFixed(0)}ms`)
    console.log(`   Threshold: ${CONFIG.THRESHOLDS.imageLoad}ms`)
    console.log(`   ✅ Pass: ${stats.imageLoad.p95Duration < CONFIG.THRESHOLDS.imageLoad ? 'YES' : 'NO'}`)
    console.log('')
  }

  // Overall assessment
  const allPassed = [
    stats.classification?.p95Duration < CONFIG.THRESHOLDS.classification,
    stats.generation?.p95Duration < CONFIG.THRESHOLDS.generation,
    stats.imageLoad?.p95Duration < CONFIG.THRESHOLDS.imageLoad
  ].every(Boolean)

  console.log('🎯 Overall Assessment:')
  console.log(`   ${allPassed ? '✅ PASS' : '❌ FAIL'} - Performance requirements ${allPassed ? 'met' : 'not met'}`)
  console.log('')

  // Save detailed results
  const detailedResults = {
    timestamp: new Date().toISOString(),
    config: CONFIG,
    duration: totalDuration,
    stats,
    passed: allPassed
  }

  require('fs').writeFileSync(
    'test-results/performance-results.json',
    JSON.stringify(detailedResults, null, 2)
  )

  console.log('📁 Detailed results saved to: test-results/performance-results.json')
  
  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1)
}

// Run the test
if (require.main === module) {
  runLoadTest().catch(error => {
    console.error('❌ Load test failed:', error)
    process.exit(1)
  })
}

module.exports = { runLoadTest, MetricsCollector }
