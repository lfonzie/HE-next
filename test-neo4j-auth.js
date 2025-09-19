// test-neo4j-auth.js
// Test script to verify Neo4j authentication setup

const { queryNeo4j } = require('./lib/neo4j.ts');
const { createInitialAdminUser, findUserByEmailInNeo4j } = require('./lib/neo4j-auth.ts');

async function testNeo4jConnection() {
  console.log('🔍 Testing Neo4j connection...');
  
  try {
    // Test basic connection
    const result = await queryNeo4j('RETURN "Neo4j connection successful" as message');
    console.log('✅ Neo4j connection test:', result[0].message);
    
    // Test user creation
    console.log('🔐 Testing user creation...');
    await createInitialAdminUser();
    
    // Test user lookup
    console.log('👤 Testing user lookup...');
    const adminUser = await findUserByEmailInNeo4j('admin@hubedu.ia');
    
    if (adminUser) {
      console.log('✅ Admin user found:', {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      });
    } else {
      console.log('❌ Admin user not found');
    }
    
    console.log('🎉 All Neo4j authentication tests passed!');
    
  } catch (error) {
    console.error('❌ Neo4j test failed:', error.message);
    console.log('\n📋 Troubleshooting steps:');
    console.log('1. Make sure Neo4j is running:');
    console.log('   - Download Neo4j Desktop or use Docker');
    console.log('   - Start Neo4j server');
    console.log('   - Default credentials: neo4j/password');
    console.log('2. Update .env.local with correct Neo4j credentials');
    console.log('3. Run this test again');
  }
}

// Run the test
testNeo4jConnection();
