import * as appStore from 'app-store-scraper';
import * as googlePlay from 'google-play-scraper';

// 定义App Store有效的 collection 值
const VALID_APP_STORE_COLLECTIONS = [
  'topfreeapplications',
  'toppaidapplications',
  'topfreeipadapplications',
  'toppaidipadapplications',
  'topgrossingapplications',
  'topgrossingipadapplications',
  'newapplications',
  'newfreeipadapplications',
  'newpaidipadapplications'
];

// 定义Google Play有效的 collection 值
const VALID_GOOGLE_PLAY_COLLECTIONS = [
  'TOP_FREE',
  'TOP_PAID',
  'GROSSING'
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
    const {
      collection = 'topfreeapplications',
      country = 'us',
      store = 'appstore' // 默认为App Store
    } = req.query;

    console.log('Fetching apps with params:', { store, collection, country });

    let result = [];

    // 根据store参数选择不同的应用商店
    if (store.toLowerCase() === 'googleplay') {
      // 验证Google Play的collection参数
      if (!VALID_GOOGLE_PLAY_COLLECTIONS.includes(collection)) {
        return res.status(400).json({
          error: `无效的Google Play榜单类型: ${collection}`,
          validCollections: VALID_GOOGLE_PLAY_COLLECTIONS
        });
      }

      try {
        // 获取Google Play排行榜数据
        console.log('Fetching Google Play data with:', { collection, country });
        result = await googlePlay.default.list({
          collection,
          country,
          num: 100,
          fullDetail: true
        });
        console.log(`Successfully fetched ${result.length} apps from Google Play`);
      } catch (error) {
        console.error('Google Play Scraper error:', error);
        return res.status(500).json({
          error: `Google Play数据获取失败: ${error.message}`,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          timestamp: new Date().toISOString()
        });
      }

      // 格式化Google Play数据，使其与App Store数据格式一致
      result = result.map(app => ({
        id: app.appId,
        appId: app.appId,
        title: app.title,
        url: app.url,
        description: app.description || '',
        icon: app.icon,
        genres: app.genres || [],
        primaryGenre: app.genre || '未知',
        primaryGenreId: 0,
        contentRating: app.contentRating || '',
        languages: [],
        size: app.size || '',
        requiredOsVersion: app.androidVersion || '',
        released: app.released || '',
        updated: app.updated || '',
        releaseNotes: app.recentChanges || '',
        version: app.version || '',
        price: app.priceText === 'Free' ? 0 : parseFloat(app.price) || 0,
        currency: app.currency || 'USD',
        free: app.free === undefined ? app.priceText === 'Free' : app.free,
        developer: app.developer || '',
        developerUrl: app.developerUrl || '',
        developerWebsite: app.developerWebsite || '',
        score: app.score || 0,
        reviews: app.reviews || 0,
        currentVersionScore: app.score || 0,
        currentVersionReviews: app.reviews || 0,
        screenshots: app.screenshots || [],
        store: 'Google Play'
      }));
    } else {
      // 验证App Store的collection参数
      if (!VALID_APP_STORE_COLLECTIONS.includes(collection)) {
        return res.status(400).json({
          error: 'Invalid collection parameter for App Store',
          validCollections: VALID_APP_STORE_COLLECTIONS
        });
      }

      try {
        // 获取App Store排行榜数据
        console.log('Fetching App Store data with:', { collection, country });
        result = await appStore.list({
          collection,
          num: 100,
          country,
        });
        console.log(`Successfully fetched ${result.length} apps from App Store`);

        // 为App Store数据添加store标识
        result = result.map(app => ({
          ...app,
          store: 'App Store'
        }));
      } catch (error) {
        console.error('App Store Scraper error:', error);
        return res.status(500).json({
          error: `App Store数据获取失败: ${error.message}`,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          timestamp: new Date().toISOString()
        });
      }
    }

    if (!result || !Array.isArray(result)) {
      return res.status(500).json({
        error: `从${store}获取的响应无效`,
        timestamp: new Date().toISOString()
      });
    }

    if (result.length === 0) {
      console.log(`Warning: No apps found for ${store} with params:`, { collection, country });
    } else {
      console.log(`Successfully fetched ${result.length} apps from ${store}`);
    }
    
    return res.status(200).json(result);

  } catch (error) {
    console.error('API Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return res.status(500).json({
      error: '获取应用数据失败',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
};