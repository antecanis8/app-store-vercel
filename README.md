# App Store Vercel



一个使用Next.js构建的App Store应用数据展示平台，支持查看不同国家/地区的iOS和iPad应用排行榜。

## 项目简介

App Store Vercel是一个轻量级Web应用，用于展示Apple App Store的应用数据。该项目可以抓取并展示不同类型的应用列表（如畅销榜、免费榜等），支持多个国家/地区的数据查询，默认展示中国区的畅销应用排行榜。

## 功能特点

- 🌍 支持多个国家/地区的App Store数据（中国、美国、日本等13个地区）
- 📱 同时支持iOS和iPad应用排行榜
- 🏆 多种榜单类型（畅销榜、免费榜、付费榜）
- 🖼️ 美观的UI界面，展示应用排名、图标、名称、开发者等信息
- ⚡ 基于Next.js，具有良好的性能和SEO优化
- 🔄 实时从App Store获取最新数据

## 技术栈

- **前端框架**：[Next.js](https://nextjs.org/)
- **UI库**：[React](https://reactjs.org/)
- **数据源**：[app-store-scraper](https://github.com/facundoolano/app-store-scraper)（用于从App Store抓取数据）
- **部署平台**：[Vercel](https://vercel.com/)

## 安装与运行

### 前提条件

- Node.js 14.x 或更高版本
- npm 或 yarn

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/yourusername/app-store-vercel.git
cd app-store-vercel
```

2. 安装依赖

```bash
npm install
# 或
yarn install
```

3. 运行开发服务器

```bash
npm run dev
# 或
yarn dev
```

4. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
npm run build
npm start
# 或
yarn build
yarn start
```

## API文档

### 获取应用列表

```
GET /api/list
```

**参数：**

- `collection`：应用集合类型（默认：'topfreeapplications'）
  - 可选值包括：'topfreeapplications', 'toppaidapplications', 'topgrossingapplications' 等
- `country`：国家/地区代码（默认：'us'）
  - 例如：'us'（美国）, 'cn'（中国）, 'jp'（日本）等

**示例请求：**

```
GET /api/list?collection=topgrossingapplications&country=cn
```

**响应：**

返回一个包含应用信息的JSON数组，每个应用对象包含以下字段：

- `id`：应用ID
- `appId`：App Store应用ID
- `title`：应用名称
- `icon`：应用图标URL
- `developer`：开发者名称
- `primaryGenre`：主要类别
- `price`：价格（0表示免费）
- 以及其他应用相关信息

### 健康检查

```
GET /api/list?health=check
```

**响应：**

```json
{
  "status": "ok"
}
```

## 部署

项目配置为在Vercel平台上部署，使用`vercel.json`文件进行配置：

1. 确保你有一个[Vercel账户](https://vercel.com/signup)
2. 安装Vercel CLI：`npm install -g vercel`
3. 登录Vercel：`vercel login`
4. 在项目根目录运行：`vercel`

或者，你可以将仓库连接到Vercel平台，实现自动部署。

## 项目结构

```
app-store-vercel/
├── pages/
│   ├── index.js         # 主页面，展示应用列表
│   └── api/
│       └── list.js      # API端点，用于获取App Store数据
├── public/
│   └── index.html       # 简单的HTML测试页面
├── package.json         # 项目依赖和脚本
├── next.config.js       # Next.js配置
├── vercel.json          # Vercel部署配置
└── README.md            # 项目说明
```

## 未来改进方向

1. 添加更多筛选和排序选项
2. 实现应用详情页面
3. 优化移动端显示
4. 添加缓存机制，减少API调用频率
5. 扩展支持更多国家/地区和应用类型
6. 接入数据库，记录应用排名变化

## 贡献指南

欢迎贡献代码、报告问题或提出新功能建议！请遵循以下步骤：

1. Fork本仓库
2. 创建你的特性分支：`git checkout -b feature/amazing-feature`
3. 提交你的更改：`git commit -m 'Add some amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 提交Pull Request

## 许可证

本项目采用 GPL 许可证 - 详情请参阅[LICENSE](LICENSE)文件