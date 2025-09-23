import { NextApiRequest, NextApiResponse } from 'next';
import { OpenLibraryService } from '../../../lib/services/openlibrary-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, limit = '10' } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const limitNumber = parseInt(limit as string, 10);
    if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 50) {
      return res.status(400).json({ error: 'Limit must be between 1 and 50' });
    }

    const result = await OpenLibraryService.searchBooks(query, limitNumber);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('OpenLibrary API error:', error);
    res.status(500).json({ 
      error: 'Failed to search books',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
