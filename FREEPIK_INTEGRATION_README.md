# Freepik Stock Content API Integration for Next.js Application

This document provides a complete guide for integrating the Freepik Stock Content API and Classifier API into your Next.js application, enabling access to high-quality images, templates, videos, icons, and content classification.

## 🚀 Quick Start

### 1. Environment Setup

Add your Freepik API key to your `.env.local` file:

```bash
# Freepik API Configuration
FREEPIK_API_KEY=FPSXadeac0afae95aa5f843f43e6682fd15f
FREEPIK_API_PRIORITY=api
FREEPIK_ENABLE_IMAGE_SEARCH=true
FREEPIK_ENABLE_AUTO_IMAGES=true
FREEPIK_EDUCATIONAL_FOCUS=true
```

### 2. Test the Integration

Run the test script to verify your API key works:

```bash
node test-freepik-integration.js
```

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000/freepik-search` to test the search interface.

## 📁 File Structure

```
app/
├── api/freepik/
│   ├── search/route.ts          # Search and AI generation endpoints
│   ├── download/route.ts        # Resource download endpoint
│   └── categories/route.ts      # Categories endpoint
├── freepik-search/
│   └── page.tsx                 # Standalone search page
components/
├── FreepikImageSelector.tsx     # Modal component for image selection
└── AulasFreepikIntegration.tsx  # Integration component for aulas
hooks/
└── useFreepik.ts               # Custom hook for API interactions
```

## 🔧 API Endpoints

### Search Stock Content
```
GET /api/freepik/search?query=education&limit=12&type=images
```

**Parameters:**
- `query` (required): Search term
- `limit` (optional): Number of results (default: 10)
- `type` (optional): Resource type - `images`, `templates`, `videos`, `icons` (default: images)

### Classify Content
```
POST /api/freepik/classify
Content-Type: application/json

{
  "image_url": "https://example.com/image.jpg",
  "text_content": "A classroom with students learning mathematics"
}
```

### Download Resource
```
GET /api/freepik/download?id=RESOURCE_ID&type=images
```

**Parameters:**
- `id` (required): Resource ID
- `type` (optional): Resource type - `images`, `templates`, `videos`, `icons` (default: images)

### Get Categories
```
GET /api/freepik/categories?type=images
```

## 🎨 Components Usage

### 1. Standalone Search Page

The `/freepik-search` page provides a complete search interface with:
- Search functionality for all resource types
- AI image generation
- Image preview and selection
- Download capabilities

### 2. FreepikImageSelector Component

A modal component for integrating Freepik search into existing pages:

```tsx
import FreepikImageSelector from '@/components/FreepikImageSelector';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  const handleImageSelect = (imageUrl, imageData) => {
    console.log('Selected image:', imageUrl);
    // Use the image in your application
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Select Image
      </button>
      
      <FreepikImageSelector
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onImageSelect={handleImageSelect}
        searchQuery="education"
        resourceType="vector"
        limit={12}
      />
    </>
  );
}
```

### 3. AulasFreepikIntegration Component

A specialized component for educational content:

```tsx
import AulasFreepikIntegration from '@/components/AulasFreepikIntegration';

function AulasPage() {
  const handleImageAdd = (imageUrl, imageData) => {
    // Add image to lesson content
    console.log('Adding image to lesson:', imageUrl);
  };

  return (
    <div>
      <h1>Create Lesson</h1>
      <AulasFreepikIntegration onImageAdd={handleImageAdd} />
    </div>
  );
}
```

### 4. useFreepik Hook

For custom implementations:

```tsx
import { useFreepik } from '@/hooks/useFreepik';

function CustomComponent() {
  const { search, classify, downloadResource, loading, error } = useFreepik();

  const handleSearch = async () => {
    const results = await search({
      query: 'mathematics',
      type: 'images',
      limit: 10
    });
    console.log('Search results:', results);
  };

  const handleClassification = async () => {
    try {
      const result = await classify({
        text_content: 'A math equation on a blackboard'
      });
      console.log('Classification result:', result);
    } catch (error) {
      console.error('Classification failed:', error);
    }
  };

  const handleDownload = async (resourceId: string) => {
    try {
      const result = await downloadResource(resourceId, 'images');
      console.log('Download result:', result);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
      <button onClick={handleClassification} disabled={loading}>
        Classify Content
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

## 🔒 Security Best Practices

1. **Never expose API keys client-side** - All API calls are made through server-side routes
2. **Environment variables** - Store sensitive data in `.env.local`
3. **Error handling** - Proper error responses without exposing sensitive information
4. **Rate limiting** - Respect Freepik's API rate limits

## 🎯 Educational Use Cases

### 1. Lesson Content Creation
- Search for educational illustrations
- Generate custom images for specific topics
- Download high-quality resources for presentations

### 2. Interactive Learning Materials
- Visual aids for complex concepts
- Custom graphics for quizzes and exercises
- Professional-looking educational content

### 3. Student Projects
- Access to premium design resources
- AI-generated images for creative projects
- Professional-quality visual materials

## 🚨 Error Handling

The integration includes comprehensive error handling for:

- **401 Unauthorized**: Invalid API key
- **429 Too Many Requests**: Rate limit exceeded
- **400 Bad Request**: Invalid parameters
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side issues

## 📊 API Response Format

### Search Response
```json
{
  "data": [
    {
      "id": "resource_id",
      "title": "Resource Title",
      "preview_url": "https://...",
      "download_url": "https://...",
      "type": "vector",
      "premium": false,
      "author": {
        "name": "Author Name",
        "avatar_url": "https://..."
      },
      "tags": ["tag1", "tag2"],
      "dimensions": {
        "width": 800,
        "height": 600
      }
    }
  ],
  "total": 100,
  "page": 1,
  "per_page": 10
}
```

## 🔧 Configuration Options

### Environment Variables
```bash
# Required
FREEPIK_API_KEY=your_api_key_here

# Optional
FREEPIK_API_PRIORITY=api
FREEPIK_ENABLE_IMAGE_SEARCH=true
FREEPIK_ENABLE_AUTO_IMAGES=true
FREEPIK_EDUCATIONAL_FOCUS=true
```

### Component Props
```tsx
interface FreepikImageSelectorProps {
  onImageSelect?: (imageUrl: string, imageData: FreepikResource) => void;
  onClose?: () => void;
  isOpen?: boolean;
  searchQuery?: string;
  resourceType?: 'vector' | 'photo' | 'psd' | 'ai';
  limit?: number;
}
```

## 🧪 Testing

### Manual Testing
1. Run the test script: `node test-freepik-integration.js`
2. Visit `/freepik-search` in your browser
3. Test search functionality with different terms
4. Try AI image generation
5. Test image selection and download

### Integration Testing
1. Add the `AulasFreepikIntegration` component to your aulas page
2. Test the quick search functionality
3. Verify image selection works correctly
4. Test error handling with invalid queries

## 🚀 Deployment

### Production Setup
1. Add `FREEPIK_API_KEY` to your production environment variables
2. Ensure all API routes are properly deployed
3. Test the integration in your production environment
4. Monitor API usage and rate limits

### Environment Variables for Production
```bash
FREEPIK_API_KEY=your_production_api_key
FREEPIK_API_PRIORITY=api
FREEPIK_ENABLE_IMAGE_SEARCH=true
FREEPIK_ENABLE_AUTO_IMAGES=true
FREEPIK_EDUCATIONAL_FOCUS=true
```

## 📚 Additional Resources

- [Freepik API Documentation](https://docs.freepik.com/introduction)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [React Hooks](https://reactjs.org/docs/hooks-intro.html)

## 🤝 Support

For issues or questions:
1. Check the error logs in your browser console
2. Verify your API key is correct
3. Test the API directly using the test script
4. Check Freepik's API documentation for updates

## 📝 License Compliance

Remember to comply with Freepik's terms of service:
- Proper attribution for downloaded resources
- Respect usage limits and restrictions
- Follow commercial use guidelines
- Maintain API key security
