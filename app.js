// 文件名：app.js
const express = require('express');
const cors = require('cors'); // 用于解决跨域问题
const appStoreScraper = require('app-store-scraper'); // 引入 app-store-scraper
const app = express();

// 启用 CORS 解决跨域问题
app.use(cors());

// 导入 app-store-scraper 的方法
const store = appStoreScraper;

// 定义 API 路由
app.get('/api', async (req, res) => {
  try {
    // 解析查询参数
    const { id, appId, collection, category, country, term } = req.query;

    // 根据查询参数选择相应的方法
    if (id || appId) {
      // 检索单个应用详情
      const result = await store.app({ id, appId, country: country || 'us' });
      return res.json(result);
    } else if (collection && category) {
      // 检索应用列表
      const result = await store.list({
        collection,
        category,
        country: country || 'us',
      });
      return res.json(result);
    } else if (term) {
      // 检索应用搜索结果
      const result = await store.search({
        term,
        country: country || 'us',
        lang: 'en-us',
      });
      return res.json(result);
    } else {
      return res
        .status(400)
        .json({ error: 'Invalid parameters. Provide id, appId, collection, or term.' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 监听端口
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});