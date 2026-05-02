import * as appStore from 'app-store-scraper';
import * as googlePlay from 'google-play-scraper';
const { getPSGames, SUPPORTED_REGIONS, SUPPORTED_COLLECTIONS } = require('../../lib/playstation-store');

const CACHE_TTL_SECONDS = 600;
const CACHE_SWR_SECONDS = 300;

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

// 定义PlayStation Store有效的 collection 值
const VALID_PLAYSTATION_COLLECTIONS = Object.keys(SUPPORTED_COLLECTIONS || {});

function toListItem(app) {
  return {
    id: app.id || app.appId,
    title: app.title || '',
    icon: app.icon || '',
    developer: app.developer || '',
    primaryGenre: app.primaryGenre || app.genre || '未知',
    price: app.price || 0
  };
}

function setListCacheHeaders(res) {
  const fetchedAt = new Date();

  res.setHeader(
    'Cache-Control',
    `public, max-age=30, s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=${CACHE_SWR_SECONDS}`
  );
  res.setHeader('X-Data-Fetched-At', fetchedAt.toISOString());
  res.setHeader('X-Data-Next-Fetch-At', new Date(fetchedAt.getTime() + CACHE_TTL_SECONDS * 1000).toISOString());
  res.setHeader('X-Data-Cache-Ttl', String(CACHE_TTL_SECONDS));
  res.setHeader('X-Data-Cache-Swr', String(CACHE_SWR_SECONDS));
}

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
          fullDetail: false
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
        title: app.title,
        icon: app.icon,
        primaryGenre: app.genre || '未知',
        price: app.priceText === 'Free' ? 0 : parseFloat(app.price) || 0,
        developer: app.developer || ''
      }));
    } else if (store.toLowerCase() === 'playstation') {
      // 验证PlayStation Store的collection参数
      if (!VALID_PLAYSTATION_COLLECTIONS.includes(collection)) {
        return res.status(400).json({
          error: `无效的PlayStation Store榜单类型: ${collection}`,
          validCollections: VALID_PLAYSTATION_COLLECTIONS
        });
      }

      // 验证国家/地区参数
      if (!SUPPORTED_REGIONS[country]) {
        return res.status(400).json({
          error: `不支持的PlayStation Store国家/地区: ${country}`,
          validCountries: Object.keys(SUPPORTED_REGIONS)
        });
      }

      try {
        // 获取PlayStation Store游戏数据
        console.log('Fetching PlayStation Store data with:', { collection, country });
        const psData = await getPSGames(collection, country, 1, 1, 50, 100);
        result = psData.gameList;
        console.log(`Successfully fetched ${result.length} games from PlayStation Store`);
      } catch (error) {
        console.error('PlayStation Store Scraper error:', error);
        return res.status(500).json({
          error: `PlayStation Store数据获取失败: ${error.message}`,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          timestamp: new Date().toISOString()
        });
      }

      // 格式化PlayStation Store数据，使其与其他应用商店数据格式一致
      result = result.map(game => ({
        id: game.id,
        title: game.title,
        icon: game.icon,
        primaryGenre: game.primaryGenre || '游戏',
        price: game.price || 0,
        developer: game.developer || ''
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

        result = result.map(toListItem);
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
    
    setListCacheHeaders(res);

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
