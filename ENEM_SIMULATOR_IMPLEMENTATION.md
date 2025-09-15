# ENEM Simulator Implementation - Complete Guide

## 🎯 Overview

This document provides a comprehensive guide to the ENEM Simulator implementation within the HE-next platform. The simulator is designed as an offline-first, privacy-compliant, and accessible educational tool that provides realistic ENEM exam experiences with advanced analytics and personalized feedback.

## 🏗️ Architecture

### Core Components

1. **Data Layer**: Offline-first data organization with manifest and integrity checking
2. **Database Schema**: Prisma-based models for sessions, responses, scores, and items
3. **Exam Generation**: Four distinct modes (Quick, Custom, Official, Adaptive)
4. **Scoring Engine**: TRI estimation with confidence intervals
5. **Export System**: PDF, CSV, and JSON export capabilities
6. **Observability**: Comprehensive logging, metrics, and admin panel
7. **Privacy & Compliance**: LGPD-compliant data handling
8. **Accessibility**: WCAG-compliant UI with keyboard navigation

## 📁 File Structure

```
HE-next/
├── data/enem/                          # Offline data storage
│   ├── manifest.json                   # Dataset metadata and checksums
│   ├── 2009-2024/                     # Year-based directories
│   │   ├── items.jsonl                # Question items (JSONL format)
│   │   └── gabarito.json              # Answer keys
│   └── assets/                        # Images and media files
├── types/enem.ts                       # TypeScript interfaces
├── lib/
│   ├── enem-data-importer.ts          # Data import and validation
│   ├── enem-exam-generator.ts         # Exam generation logic
│   ├── enem-scoring.ts                # Scoring and TRI estimation
│   ├── enem-export.ts                 # Export functionality
│   ├── enem-observability.ts          # Metrics and logging
│   └── enem-privacy.ts                # Privacy and LGPD compliance
├── components/enem/
│   ├── EnemModeSelector.tsx           # Mode selection interface
│   ├── EnemCustomizer.tsx            # Custom exam configuration
│   ├── EnemSimulatorV2.tsx           # Main simulator component
│   ├── EnemResults.tsx               # Results and feedback
│   ├── EnemAccessibility.tsx         # Accessibility controls
│   └── EnemPrivacySettings.tsx       # Privacy settings
├── app/
│   ├── (dashboard)/enem-v2/          # Main simulator page
│   ├── (dashboard)/admin/enem/       # Admin dashboard
│   └── api/enem/                     # API endpoints
│       ├── sessions/                 # Session management
│       ├── responses/                # Response handling
│       ├── scores/                   # Score calculation
│       ├── export/                   # Data export
│       ├── privacy/                  # Privacy controls
│       └── admin/                    # Admin functions
└── prisma/schema.prisma              # Database schema
```

## 🚀 Getting Started

### 1. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with sample data (optional)
npm run db:seed
```

### 2. Data Import

```bash
# Import ENEM data from JSONL files
npm run enem:import

# Validate data integrity
npm run enem:validate
```

### 3. Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/hubedu_db"

# Data encryption for privacy
DATA_ENCRYPTION_KEY="your-encryption-key-here"

# Optional: External ENEM API
ENEM_API_URL="https://api.enem.dev"
ENEM_API_KEY="your-api-key"
```

## 📊 Data Models

### Core Entities

#### EnemItem
```typescript
interface EnemItem {
  item_id: string;           // Format: {year}-{booklet}-{question_number}
  year: number;             // Exam year
  area: 'CN' | 'CH' | 'LC' | 'MT';
  text: string;             // Question text
  alternatives: {           // Answer options A-E
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  correct_answer: 'A' | 'B' | 'C' | 'D' | 'E';
  topic: string;            // Pedagogical topic
  estimated_difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  asset_refs: string[];     // References to images/videos
  content_hash: string;     // For deduplication
  dataset_version: string;
  metadata: object;         // BNCC codes, competencies, etc.
}
```

#### EnemSession
```typescript
interface EnemSession {
  session_id: string;
  user_id: string;
  mode: 'QUICK' | 'CUSTOM' | 'OFFICIAL' | 'ADAPTIVE';
  area: string[];           // Selected areas
  config: {                // Session configuration
    num_questions: number;
    time_limit?: number;
    difficulty_distribution?: object;
  };
  start_time: Date;
  end_time?: Date;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
}
```

#### EnemScore
```typescript
interface EnemScore {
  score_id: string;
  session_id: string;
  area_scores: Record<string, {
    raw_score: number;
    percentage: number;
    correct: number;
    total: number;
  }>;
  total_score: number;
  tri_estimated: {
    score: number;
    confidence_interval: { lower: number; upper: number };
    disclaimer: string;
  };
  stats: {
    total_time_spent: number;
    average_time_per_question: number;
    accuracy_by_topic: Record<string, number>;
    difficulty_breakdown: object;
  };
}
```

## 🎮 Exam Modes

### 1. Quick Mode
- **Purpose**: Onboarding and quick practice
- **Configuration**: 15 mixed-area questions, 30 minutes
- **Difficulty**: Balanced (5 Easy, 7 Medium, 3 Hard)
- **Use Case**: First-time users, quick assessment

### 2. Custom Mode
- **Purpose**: Personalized practice
- **Configuration**: User-defined (area, count, time, difficulty)
- **Features**: Full customization options
- **Use Case**: Targeted practice, specific needs

### 3. Official Mode
- **Purpose**: Full ENEM simulation
- **Configuration**: Complete exam by year (180 questions, 330 minutes)
- **Features**: Original question order, official timing
- **Use Case**: Full exam preparation, realistic practice

### 4. Adaptive Mode
- **Purpose**: Personalized difficulty progression
- **Configuration**: Three sequential blocks (Easy → Medium → Hard)
- **Features**: Dynamic difficulty adjustment
- **Use Case**: Progressive learning, skill building

## 🧮 Scoring System

### TRI Estimation
The simulator implements a simplified TRI (Teoria de Resposta ao Item) proxy:

1. **Raw Score Calculation**: Percentage correct per area
2. **Historical Curve Mapping**: Uses ENEM historical data
3. **Confidence Intervals**: Provides uncertainty bounds
4. **Disclaimer**: Clear indication of estimation nature

### Scoring Components
- **Area Scores**: Individual performance per knowledge area
- **Total Score**: Weighted average across areas
- **Topic Analysis**: Detailed breakdown by pedagogical topics
- **Time Analysis**: Performance vs. time spent
- **Difficulty Analysis**: Performance across difficulty levels

## 📤 Export Features

### Supported Formats

#### PDF Export
- Cover page with session details
- Detailed results with charts
- Topic-based analysis
- Answer key and explanations

#### CSV Export
- Raw data for analysis
- Session metadata
- Response details
- Score breakdown

#### JSON Export
- Complete session data
- Machine-readable format
- Includes all metadata
- Suitable for data analysis

### Refocus Feature
- Identifies weak topics
- Generates targeted practice sessions
- Creates focused study recommendations

## 🔒 Privacy & Compliance

### LGPD Compliance
- **Data Minimization**: Only necessary data collected
- **User Control**: Full control over data settings
- **Retention Policy**: Configurable data retention (default: 18 months)
- **Right to Deletion**: Complete data deletion on request
- **Data Portability**: Export functionality
- **Transparency**: Clear privacy policies

### Privacy Features
- **Anonymization**: Automatic data anonymization
- **Encryption**: Sensitive data encrypted at rest
- **Consent Management**: Granular consent controls
- **Audit Trail**: Complete data access logging

## ♿ Accessibility

### WCAG 2.1 AA Compliance
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and descriptions
- **High Contrast**: High contrast mode
- **Text Scaling**: Adjustable font sizes
- **Reduced Motion**: Respects motion preferences
- **Focus Indicators**: Clear focus indicators

### Accessibility Features
- **Keyboard Shortcuts**: 1-5 for answers, arrow keys for navigation
- **Audio Descriptions**: Optional audio feedback
- **Customizable UI**: Adjustable interface elements
- **Alternative Text**: Comprehensive alt text for images

## 📊 Observability

### Metrics Tracked
- **Session Metrics**: Completion rates, abandonment rates
- **Performance Metrics**: Average scores, time spent
- **Usage Metrics**: Mode preferences, area distribution
- **Quality Metrics**: Data integrity, error rates

### Admin Dashboard
- **Real-time Metrics**: Live performance data
- **Data Quality Reports**: Integrity and coverage analysis
- **Performance Alerts**: Automated issue detection
- **User Analytics**: Usage patterns and trends

### Logging
- **Structured Logging**: JSON-formatted logs
- **Event Tracking**: User actions and system events
- **Error Monitoring**: Comprehensive error tracking
- **Performance Monitoring**: Response times and bottlenecks

## 🛠️ Development

### Running the Simulator

```bash
# Development server
npm run dev

# Access simulator
http://localhost:3000/enem-v2

# Access admin panel
http://localhost:3000/admin/enem
```

### Testing

```bash
# Run tests
npm test

# Test ENEM-specific functionality
npm run test:enem

# Test accessibility
npm run test:a11y
```

### Data Management

```bash
# Import new data
npm run enem:import

# Validate data integrity
npm run enem:validate

# Clean up expired data
npm run enem:cleanup
```

## 🔧 Configuration

### Environment Variables
```env
# Required
DATABASE_URL="postgresql://..."
DATA_ENCRYPTION_KEY="your-key"

# Optional
ENEM_API_URL="https://api.enem.dev"
ENEM_API_KEY="your-key"
ENEM_DATA_PATH="./data/enem"
ENEM_RETENTION_DAYS=547
```

### Feature Flags
```typescript
// Enable/disable features
const features = {
  adaptiveMode: true,
  triEstimation: true,
  exportFeatures: true,
  analytics: true,
  accessibility: true
};
```

## 📈 Performance

### Optimization Strategies
- **Offline-First**: Local data storage for fast access
- **Progressive Loading**: Load questions as needed
- **Caching**: Intelligent caching of frequent queries
- **Database Indexing**: Optimized queries with proper indices
- **Asset Optimization**: Compressed images and media

### Performance Targets
- **Session Creation**: ≤ 100ms
- **Exam Start**: ≤ 1.5s
- **Question Loading**: ≤ 200ms
- **Score Calculation**: ≤ 500ms
- **Export Generation**: ≤ 2s

## 🚨 Troubleshooting

### Common Issues

#### Data Import Failures
```bash
# Check data integrity
npm run enem:validate

# Re-import data
npm run enem:import --force
```

#### Database Connection Issues
```bash
# Check database status
npm run db:status

# Reset database
npm run db:reset
```

#### Performance Issues
```bash
# Check metrics
npm run metrics:check

# Analyze slow queries
npm run db:analyze
```

## 🔮 Future Enhancements

### Planned Features
- **AI-Powered Question Generation**: Dynamic question creation
- **Spaced Repetition**: Intelligent review scheduling
- **Gamification**: Achievement system and leaderboards
- **Mobile App**: Native mobile application
- **Offline Mode**: Complete offline functionality
- **Multi-language Support**: Internationalization

### Technical Improvements
- **Real-time Collaboration**: Multi-user sessions
- **Advanced Analytics**: Machine learning insights
- **API Versioning**: Backward compatibility
- **Microservices**: Service decomposition
- **CDN Integration**: Global content delivery

## 📚 Resources

### Documentation
- [ENEM Official Website](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem)
- [LGPD Compliance Guide](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Support
- **Technical Issues**: Create GitHub issue
- **Feature Requests**: Use GitHub discussions
- **Documentation**: Check this README and inline comments
- **Community**: Join our Discord server

---

## 🎉 Conclusion

The ENEM Simulator represents a comprehensive, privacy-compliant, and accessible educational platform that provides students with realistic exam experiences while maintaining the highest standards of data protection and user experience. The offline-first architecture ensures reliability, while the advanced analytics provide valuable insights for both students and educators.

For questions or contributions, please refer to the project documentation or contact the development team.
