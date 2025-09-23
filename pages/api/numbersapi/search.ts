import { NextApiRequest, NextApiResponse } from 'next';
import { NumbersAPIService } from '../../../lib/services/numbersapi-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, type = 'trivia' } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    let result;
    
    // Verifica se é uma data (formato DD/MM ou MM/DD)
    const dateMatch = query.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (dateMatch) {
      const [, day, month] = dateMatch;
      result = await NumbersAPIService.getDateFact(parseInt(month), parseInt(day));
    }
    // Verifica se é um ano (4 dígitos)
    else if (/^\d{4}$/.test(query) && NumbersAPIService.isValidYear(parseInt(query))) {
      result = await NumbersAPIService.getYearFact(parseInt(query));
    }
    // Verifica se é um número
    else if (/^\d+$/.test(query) && NumbersAPIService.isValidNumber(parseInt(query))) {
      if (type === 'math') {
        result = await NumbersAPIService.getMathFact(parseInt(query));
      } else {
        result = await NumbersAPIService.getTriviaFact(parseInt(query));
      }
    }
    else {
      return res.status(400).json({ error: 'Invalid format. Use a number, date (DD/MM) or year (YYYY)' });
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('NumbersAPI error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch number fact',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
