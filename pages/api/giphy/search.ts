import { NextApiRequest, NextApiResponse } from 'next';
import { GiphyAPIService } from '../../../lib/services/giphy-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, limit = '10', rating = 'g', type = 'search' } = req.query;

  try {
    const limitNumber = parseInt(limit as string, 10);
    if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 50) {
      return res.status(400).json({ error: 'Limit must be between 1 and 50' });
    }

    let result;
    
    if (type === 'trending') {
      result = await GiphyAPIService.getTrendingGifs(limitNumber, rating as string);
    } else if (type === 'random') {
      const gif = await GiphyAPIService.getRandomGif(query as string, rating as string);
      result = {
        gifs: gif ? [gif] : [],
        totalResults: gif ? 1 : 0,
        hasMore: false
      };
    } else {
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required for search' });
      }
      result = await GiphyAPIService.searchGifs(query, limitNumber, rating as string);
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Giphy API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch GIFs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
