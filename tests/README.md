# Comprehensive Testing Framework

This directory contains a comprehensive testing framework for the Professor Interativa platform, implementing all the testing strategies outlined in the technical roadmap.

## 🧪 Test Structure

```
tests/
├── unit/                    # Unit tests for individual components
├── integration/             # Integration tests for API routes
├── e2e/                    # End-to-end tests for complete user flows
├── performance/            # Performance and load testing
├── accessibility/          # Accessibility and WCAG compliance tests
├── prompts/               # Specialized prompt testing
├── api/                   # API-specific integration tests
├── utils/                 # Test utilities and helpers
└── setup/                 # Test configuration and setup
```

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm run test:all
```

### Run Specific Test Suites
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Performance tests
npm run test:performance

# Accessibility tests
npm run test:accessibility

# Prompt tests
npm run test:prompts

# API tests
npm run test:api
```

## 📋 Test Categories

### 1. Unit Tests (`tests/unit/`)
- Component functionality
- Utility functions
- Business logic
- Error handling

### 2. Integration Tests (`tests/integration/`)
- API route functionality
- Database interactions
- External service integration
- Error scenarios and fallbacks

### 3. End-to-End Tests (`tests/e2e/`)
- Complete user workflows
- Cross-browser compatibility
- Mobile responsiveness
- Performance benchmarks

### 4. Performance Tests (`tests/performance/`)
- Load testing with K6
- Stress testing
- Latency benchmarks
- Resource utilization

### 5. Accessibility Tests (`tests/accessibility/`)
- WCAG 2.1 compliance
- Keyboard navigation
- Screen reader compatibility
- Color contrast validation

### 6. Prompt Tests (`tests/prompts/`)
- Consistency validation
- Anti-repetition system
- Quality scoring
- Edge case handling

## 🔧 Configuration

### Jest Configuration
- **File**: `jest.config.js`
- **Coverage**: 80% threshold for all metrics
- **Timeout**: 30 seconds
- **Environment**: jsdom for React components

### Playwright Configuration
- **File**: `playwright.config.ts`
- **Browsers**: Chrome, Firefox, Safari, Mobile
- **Parallel**: Enabled for faster execution
- **Retries**: 2 retries on CI

### K6 Performance Tests
- **File**: `tests/performance/load-test.js`
- **Stages**: Gradual load increase
- **Thresholds**: P95 < 2s, Error rate < 10%

## 📊 Test Metrics

### Performance Benchmarks
- **Classification**: < 3 seconds P95
- **Generation**: < 8 seconds P95
- **First Slide**: < 15 seconds P95
- **Navigation**: < 500ms P95
- **Image Load**: < 2 seconds P95

### Quality Thresholds
- **Classification Accuracy**: > 90%
- **Content Quality Score**: > 0.8
- **User Satisfaction**: > 70 NPS
- **Completion Rate**: > 85%

## 🛠️ Test Utilities

### Test Helpers (`tests/utils/test-helpers.ts`)
- Mock data generators
- Performance measurement utilities
- Error simulation
- Accessibility testing helpers

### Circuit Breaker Testing
- OpenAI failure simulation
- Unsplash failure simulation
- Database failure simulation
- Rate limiting tests

### Mock Services
- OpenAI API mocking
- Unsplash API mocking
- Database mocking
- Authentication mocking

## 🔍 Monitoring and Telemetry

### Telemetry System (`lib/telemetry.ts`)
- Performance tracking
- Quality metrics
- User interaction tracking
- Error monitoring

### Health Checks (`app/api/health/route.ts`)
- Service availability
- Circuit breaker status
- System metrics
- Response time monitoring

## 📈 Continuous Integration

### GitHub Actions
- Automated test execution
- Coverage reporting
- Performance regression detection
- Accessibility compliance checks

### Test Reports
- HTML coverage reports
- Performance metrics
- Accessibility audit results
- E2E test screenshots

## 🎯 Test Scenarios

### Happy Path Scenarios
1. Complete lesson generation flow
2. Image loading and display
3. Navigation between slides
4. Question interaction
5. Lesson completion

### Error Scenarios
1. OpenAI rate limiting
2. Unsplash service failure
3. Network timeouts
4. Invalid inputs
5. Service unavailability

### Edge Cases
1. Very long inputs
2. Special characters
3. Empty inputs
4. Concurrent requests
5. Memory pressure

## 🔒 Security Testing

### Input Validation
- SQL injection prevention
- XSS protection
- CSRF validation
- Rate limiting

### Authentication
- JWT token validation
- Session management
- Permission checks
- API key security

## 📱 Cross-Platform Testing

### Desktop Browsers
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### Mobile Devices
- iOS Safari
- Chrome Mobile
- Firefox Mobile
- Responsive design validation

## 🚨 Troubleshooting

### Common Issues
1. **Test timeouts**: Increase timeout values in config
2. **Mock failures**: Check mock setup and cleanup
3. **Performance failures**: Verify system resources
4. **Accessibility failures**: Update component ARIA attributes

### Debug Mode
```bash
# Run tests with debug output
npm run test:unit -- --verbose

# Run E2E tests with UI
npm run test:e2e:ui

# Run performance tests with detailed output
npm run test:performance -- --verbose
```

## 📚 Best Practices

### Writing Tests
1. Use descriptive test names
2. Follow AAA pattern (Arrange, Act, Assert)
3. Test both happy path and error scenarios
4. Keep tests independent and isolated
5. Use proper mocking and cleanup

### Performance Testing
1. Test under realistic load conditions
2. Monitor resource utilization
3. Set appropriate thresholds
4. Test with different data sizes
5. Validate fallback mechanisms

### Accessibility Testing
1. Test with keyboard navigation
2. Validate ARIA attributes
3. Check color contrast ratios
4. Test with screen readers
5. Validate heading hierarchy

## 🔄 Maintenance

### Regular Updates
- Update test dependencies monthly
- Review and update test data quarterly
- Performance benchmark reviews
- Accessibility compliance audits

### Test Data Management
- Use realistic test data
- Keep test data up to date
- Sanitize sensitive information
- Version control test data

## 📞 Support

For questions or issues with the testing framework:
1. Check the troubleshooting section
2. Review test documentation
3. Check CI/CD logs
4. Contact the development team

---

This testing framework ensures the Professor Interativa platform meets the highest standards of quality, performance, and accessibility while providing comprehensive coverage of all functionality and edge cases.
