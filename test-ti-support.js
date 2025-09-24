#!/usr/bin/env node

/**
 * Test script for TI Support Module
 * Tests the complete flow from playbook loading to ticket creation
 */

// Note: This is a simplified test that doesn't require TypeScript compilation
// For full testing, use the Next.js development server

async function testTiSupportModule() {
  console.log('🧪 Testing TI Support Module...\n')

  try {
    // Test 1: File structure verification
    console.log('1️⃣ Testing file structure...')
    const fs = require('fs')
    const path = require('path')
    
    const requiredFiles = [
      'app/ti/lib/playbook.ts',
      'app/ti/lib/session-manager.ts',
      'app/api/ti/tools.ts',
      'app/api/ti/assist/route.ts',
      'app/api/ti/ticket/route.ts',
      'app/ti/components/GuidedChat.tsx',
      'app/ti/page.tsx',
      'app/ti/playbooks/printer.yaml',
      'app/ti/playbooks/wifi.yaml',
      'app/ti/playbooks/software.yaml'
    ]

    let allFilesExist = true
    requiredFiles.forEach(file => {
      const exists = fs.existsSync(path.join(process.cwd(), file))
      console.log(`${exists ? '✅' : '❌'} ${file}`)
      if (!exists) allFilesExist = false
    })

    if (!allFilesExist) {
      throw new Error('Some required files are missing')
    }

    // Test 2: YAML playbook parsing
    console.log('\n2️⃣ Testing YAML playbook parsing...')
    const yaml = require('js-yaml')
    
    const playbookFiles = ['printer.yaml', 'wifi.yaml', 'software.yaml']
    playbookFiles.forEach(file => {
      try {
        const content = fs.readFileSync(path.join(process.cwd(), 'app/ti/playbooks', file), 'utf8')
        const parsed = yaml.load(content)
        console.log(`✅ ${file}: ${parsed.metadata?.title || parsed.issue}`)
      } catch (error) {
        console.log(`❌ ${file}: Parse error`)
        throw error
      }
    })

    // Test 3: Database schema verification
    console.log('\n3️⃣ Testing database schema...')
    const schemaContent = fs.readFileSync(path.join(process.cwd(), 'prisma/schema.prisma'), 'utf8')
    
    const requiredModels = ['TiSession', 'TiStep', 'TiTicket']
    requiredModels.forEach(model => {
      const exists = schemaContent.includes(`model ${model}`)
      console.log(`${exists ? '✅' : '❌'} Model ${model}`)
      if (!exists) throw new Error(`Model ${model} not found in schema`)
    })

    console.log('\n🎉 All basic tests passed! TI Support Module structure is correct.')
    console.log('\n📋 Next steps:')
    console.log('   • Run "npm run dev" to start the development server')
    console.log('   • Visit http://localhost:3000/ti to test the UI')
    console.log('   • Try different issue types (printer, wifi, software)')
    console.log('   • Test the guided chat flow')
    console.log('   • Verify ticket creation for escalations')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testTiSupportModule()
}

module.exports = { testTiSupportModule }
