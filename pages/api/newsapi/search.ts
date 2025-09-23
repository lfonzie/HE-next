import { NextApiRequest, NextApiResponse } from 'next';
import { NewsAPIService } from '../../../lib/services/newsapi-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, category, country = 'br', pageSize = '10' } = req.query;

  try {
    const pageSizeNumber = parseInt(pageSize as string, 10);
    if (isNaN(pageSizeNumber) || pageSizeNumber < 1 || pageSizeNumber > 50) {
      return res.status(400).json({ error: 'Page size must be between 1 and 50' });
    }

    let result;
    
    if (query && typeof query === 'string') {
      result = await NewsAPIService.searchNews(query, 'pt', pageSizeNumber);
    } else if (category && typeof category === 'string') {
      result = await NewsAPIService.getTopHeadlines(country as string, category, pageSizeNumber);
    } else {
      result = await NewsAPIService.getTopHeadlines(country as string, undefined, pageSizeNumber);
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('NewsAPI error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch news',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
