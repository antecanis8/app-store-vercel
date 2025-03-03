const express = require('express');
const cors = require('cors');
const appStoreScraper = require('app-store-scraper');
const app = express();

// 启用 CORS
app.use(cors());

// 导入 app-store-scraper 的方法
const store = appStoreScraper;

// 定义 API 路由
app.get('/api', async (req, res) => {
  try {
    const { id, appId, collection, category, country, term } = req.query;

    if (id || appId) {
      const result = await store.app({ id, appId, country: country || 'us' });
      return res.json(result);
    } else if (collection && category) {
      const result = await store.list({
        collection,
        category,
        country: country || 'us',
      });
      return res.json(result);
    } else if (term) {
      const result = await store.search({
        term,
        country: country || 'us',
        lang: 'en-us',
      });
      return res.json(result);
    } else {
      return res.status(400).json({ error: 'Invalid parameters.' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 导出 app
module.exports = app;