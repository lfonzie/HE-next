import { NextApiRequest, NextApiResponse } from 'next';
import { CurrentsAPIService } from '../../../lib/services/currentsapi-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, category, language = 'pt', pageSize = '10' } = req.query;

  try {
    const pageSizeNumber = parseInt(pageSize as string, 10);
    if (isNaN(pageSizeNumber) || pageSizeNumber < 1 || pageSizeNumber > 50) {
      return res.status(400).json({ error: 'Page size must be between 1 and 50' });
    }

    let result;
    
    if (query && typeof query === 'string') {
      result = await CurrentsAPIService.searchNews(query, language as string, pageSizeNumber);
    } else if (category && typeof category === 'string') {
      result = await CurrentsAPIService.getNewsByCategory(category, language as string, pageSizeNumber);
    } else {
      result = await CurrentsAPIService.getLatestNews(language as string, pageSizeNumber);
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('CurrentsAPI error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch news',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
