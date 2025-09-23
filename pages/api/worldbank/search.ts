import { NextApiRequest, NextApiResponse } from 'next';
import { WorldBankAPIService } from '../../../lib/services/worldbank-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, countryCode = 'BR', indicatorId, startYear = '2010', endYear = '2023', type = 'search' } = req.query;

  try {
    let result;
    
    if (type === 'indicators' && indicatorId && typeof indicatorId === 'string') {
      const startYearNumber = parseInt(startYear as string, 10);
      const endYearNumber = parseInt(endYear as string, 10);
      
      if (isNaN(startYearNumber) || isNaN(endYearNumber)) {
        return res.status(400).json({ error: 'Invalid year format' });
      }
      
      result = await WorldBankAPIService.getIndicatorData(
        indicatorId, 
        countryCode as string, 
        startYearNumber, 
        endYearNumber
      );
    } else if (type === 'popular') {
      result = await WorldBankAPIService.getPopularIndicators();
    } else {
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required for search' });
      }
      
      const perPage = parseInt(req.query.perPage as string || '10', 10);
      if (isNaN(perPage) || perPage < 1 || perPage > 50) {
        return res.status(400).json({ error: 'Per page must be between 1 and 50' });
      }
      
      result = await WorldBankAPIService.searchIndicators(query, perPage);
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('World Bank API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
