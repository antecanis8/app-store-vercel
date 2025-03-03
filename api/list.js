import { appStoreScraper } from 'app-store-scraper';

const store = appStoreScraper;

export default async (req, res) => {
  try {
    const { query } = req; // 获取查询参数
    const { id, appId, collection, category, country, term } = query;

    if (id || appId) {
      // 检索单个应用详情
      const result = await store.app({ id, appId, country: country || 'us' });
      return res.status(200).json(result);
    } else if (collection && category) {
      // 检索应用列表
      const result = await store.list({
        collection,
        category,
        country: country || 'us',
      });
      return res.status(200).json(result);
    } else if (term) {
      // 检索应用搜索结果
      const result = await store.search({
        term,
        country: country || 'us',
        lang: 'en-us',
      });
      return res.status(200).json(result);
    } else {
      return res
        .status(400)
        .json({ error: 'Invalid parameters. Provide id, appId, collection, or term.' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};