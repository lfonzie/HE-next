/**
 * Test file for Weather API functionality
 * Run with: node test-weather-api.js
 */

// Import the weather API functions (using CommonJS for Node.js compatibility)
const { 
  getCoordinates, 
  fetchWeatherData, 
  getWeatherForCity,
  getWeatherIcon,
  getWeatherDescription,
  formatTemperature,
  formatWindSpeed,
  isWeatherQuery,
  extractCityFromQuery
} = require('./utils/weatherApi.ts');

async function testWeatherAPI() {
  console.log('🌤️  Testing Weather API Integration\n');

  try {
    // Test 1: Geocoding API
    console.log('📍 Test 1: Testing Geocoding API...');
    const coordinates = await getCoordinates('New York');
    console.log('✅ Coordinates for New York:', coordinates);
    console.log('');

    // Test 2: Weather Data Fetching
    console.log('🌡️  Test 2: Testing Weather Data Fetching...');
    const weatherData = await fetchWeatherData(coordinates.latitude, coordinates.longitude);
    console.log('✅ Weather data structure:');
    console.log('   - Current temperature:', weatherData.current.temperature_2m, weatherData.current_units.temperature_2m);
    console.log('   - Weather code:', weatherData.current.weather_code);
    console.log('   - Humidity:', weatherData.current.relative_humidity_2m, weatherData.current_units.relative_humidity_2m);
    console.log('   - Wind speed:', weatherData.current.wind_speed_10m, weatherData.current_units.wind_speed_10m);
    console.log('   - Forecast days:', weatherData.daily.time.length);
    console.log('');

    // Test 3: Complete Weather Card Data
    console.log('🎯 Test 3: Testing Complete Weather Card Data...');
    const weatherCardData = await getWeatherForCity('London');
    console.log('✅ Weather card data for London:');
    console.log('   - Location:', weatherCardData.location);
    console.log('   - Current temp:', weatherCardData.current.temperature_2m, weatherCardData.units.temperature);
    console.log('   - Forecast days:', weatherCardData.forecast.length);
    console.log('');

    // Test 4: Weather Icon Mapping
    console.log('🎨 Test 4: Testing Weather Icon Mapping...');
    const testCodes = [0, 1, 2, 3, 45, 61, 63, 80, 95];
    testCodes.forEach(code => {
      const icon = getWeatherIcon(code, true);
      const description = getWeatherDescription(code);
      console.log(`   - Code ${code}: ${description} -> ${icon}`);
    });
    console.log('');

    // Test 5: Utility Functions
    console.log('🔧 Test 5: Testing Utility Functions...');
    console.log('   - Temperature formatting:', formatTemperature(22.5, 'celsius'));
    console.log('   - Wind speed formatting:', formatWindSpeed(15.2, 'kmh'));
    console.log('');

    // Test 6: Weather Query Detection
    console.log('🔍 Test 6: Testing Weather Query Detection...');
    const testQueries = [
      'What is the weather in Paris?',
      'How is the weather today?',
      'Tell me about the climate',
      'What is the temperature?',
      'I need help with math',
      'Weather in Tokyo',
      'Clima em São Paulo'
    ];
    
    testQueries.forEach(query => {
      const isWeather = isWeatherQuery(query);
      const city = extractCityFromQuery(query);
      console.log(`   - "${query}" -> Weather: ${isWeather}, City: ${city || 'None'}`);
    });
    console.log('');

    // Test 7: Multiple Cities
    console.log('🌍 Test 7: Testing Multiple Cities...');
    const cities = ['Tokyo', 'São Paulo', 'Berlin', 'Sydney'];
    
    for (const city of cities) {
      try {
        const data = await getWeatherForCity(city);
        console.log(`   ✅ ${city}: ${data.current.temperature_2m}°C, ${getWeatherDescription(data.current.weather_code)}`);
      } catch (error) {
        console.log(`   ❌ ${city}: Error - ${error.message}`);
      }
    }
    console.log('');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Test error handling
async function testErrorHandling() {
  console.log('\n🚨 Testing Error Handling...\n');

  try {
    // Test invalid city
    console.log('Testing invalid city...');
    await getCoordinates('InvalidCityName12345');
  } catch (error) {
    console.log('✅ Invalid city handled correctly:', error.message);
  }

  try {
    // Test invalid coordinates
    console.log('Testing invalid coordinates...');
    await fetchWeatherData(999, 999);
  } catch (error) {
    console.log('✅ Invalid coordinates handled correctly:', error.message);
  }

  console.log('\n✅ Error handling tests completed!');
}

// Performance test
async function testPerformance() {
  console.log('\n⚡ Testing Performance...\n');

  const startTime = Date.now();
  const promises = [];
  
  // Test concurrent requests
  for (let i = 0; i < 5; i++) {
    promises.push(getWeatherForCity('New York'));
  }

  try {
    await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ 5 concurrent requests completed in ${duration}ms`);
    console.log(`   Average time per request: ${duration / 5}ms`);
  } catch (error) {
    console.log('❌ Performance test failed:', error.message);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Weather API Tests\n');
  console.log('=====================================\n');

  await testWeatherAPI();
  await testErrorHandling();
  await testPerformance();

  console.log('\n=====================================');
  console.log('🏁 All tests completed!');
  console.log('\nTo use in your application:');
  console.log('1. Ask "What is the weather in [city]?" in the chat');
  console.log('2. The system will automatically detect weather queries');
  console.log('3. Weather cards will be displayed with current conditions and 5-day forecast');
  console.log('4. Supports multiple languages and cities worldwide');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testWeatherAPI,
  testErrorHandling,
  testPerformance,
  runAllTests
};
