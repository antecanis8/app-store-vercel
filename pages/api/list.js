import * as store from 'app-store-scraper';

// 定义有效的 collection 值
const VALID_COLLECTIONS = [
  'TOP_MAC',
  'TOP_FREE_MAC',
  'TOP_GROSSING_MAC',
  'TOP_PAID_MAC',
  'NEW_IOS',
  'NEW_FREE_IOS',
  'NEW_PAID_IOS',
  'TOP_FREE_IOS',
  'TOP_FREE_IPAD',
  'TOP_GROSSING_IOS',
  'TOP_GROSSING_IPAD',
  'TOP_PAID_IOS',
  'TOP_PAID_IPAD'
];


export default async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 添加健康检查端点
  if (req.query.health === 'check') {
    return res.status(200).json({ status: 'ok' });
  }

  try {
    const { collection = 'TOP_FREE_IOS', country = 'us' } = req.query;

    // 验证 collection 参数
    if (!VALID_COLLECTIONS.includes(collection)) {
      return res.status(400).json({ 
        error: 'Invalid collection parameter',
        validCollections: VALID_COLLECTIONS
      });
    }

    console.log('Fetching apps with params:', { collection, country });

    const result = await store.list({
      collection,
      num: 10,
      country,
    }).catch(error => {
      console.error('Scraper error:', error);
      throw error;
    });

    if (!result || !Array.isArray(result)) {
      throw new Error('Invalid response from app-store-scraper');
    }

    console.log('Successfully fetched apps:', result.length);
    return res.status(200).json(result);

  } catch (error) {
    console.error('API Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return res.status(500).json({
      error: 'Failed to fetch app data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
};