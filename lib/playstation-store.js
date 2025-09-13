const rp = require('request-promise');
const _ = require('lodash');

// 定义PlayStation Store支持的地区和语言映射
const SUPPORTED_REGIONS = {
  'us': 'en-us',
  'jp': 'ja-jp',
  'gb': 'en-gb',
  'fr': 'fr-fr',
  'de': 'de-de',
  'es': 'es-es',
  'it': 'it-it',
  'ca': 'en-ca',
  'au': 'en-au',
  'cn': 'zh-hans-cn',
  'hk': 'zh-hant-hk',
  'tw': 'zh-hant-tw',
  'kr': 'ko-kr',
  'ru': 'ru-ru'
};

// 定义PlayStation Store支持的榜单类型
const SUPPORTED_COLLECTIONS = {
  'topselling': {
    name: '畅销榜',
    sortBy: 'sales30'
  },
  'sales7': {
    name: 'sales7',
    sortBy: 'sales7'
  },
  'sales365': {
    name: 'sales365',
    sortBy: 'sales365'
  },
  'sales1': {
    name: 'sales1',
    sortBy: 'sales1'
  }
};

// 睡眠函数，用于控制请求频率
function sleep(time) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve()
    }, time)
  })
}

/**
 * 获取PlayStation Store游戏数据
 * @param {string} collection - 榜单类型
 * @param {string} country - 国家/地区代码
 * @param {number} startPage - 起始页码
 * @param {number} endPage - 结束页码
 * @param {number} pageSize - 每页数量
 * @param {number} sleepTime - 请求间隔时间
 * @param {string} proxyUrl - 代理URL
 * @returns {Promise<Object>} 包含游戏列表和总页数的对象
 */
async function getPSGames(collection = 'topselling', country = 'us', startPage = 1, endPage = 1, pageSize = 20, sleepTime = 10, proxyUrl) {
  // 验证参数
  if (!SUPPORTED_REGIONS[country]) {
    throw new Error(`不支持的国家/地区: ${country}`);
  }

  if (!SUPPORTED_COLLECTIONS[collection]) {
    throw new Error(`不支持的榜单类型: ${collection}`);
  }

  const language = SUPPORTED_REGIONS[country];
  const region = language.split('-')[1];
  const countryCode = language.split('-')[0];
  const sortBy = SUPPORTED_COLLECTIONS[collection].sortBy;
  let totalPage = 1;
  const gameList = [];

  for (; startPage <= endPage; startPage++) {
    try {
      // 生成随机的 correlation ID 和 request ID
      const correlationId = require('crypto').randomUUID();
      const requestId = require('crypto').randomUUID();
      
      
      const games = await rp({
        url: "https://web.np.playstation.com/api/graphql/v1//op",
        qs: {
          operationName: 'categoryGridRetrieve',
          variables: `{"id":"28c9c2b2-cecc-415c-9a08-482a605cb104","pageArgs":{"size":${pageSize},"offset":${(startPage - 1) * pageSize}},"sortBy":{"name":"${sortBy}","isAscending":false},"filterBy":[],"facetOptions":[]}`,
          extensions: `{"persistedQuery":{"version":1,"sha256Hash":"be843d8d063502a54309ccfbedbcefaad4de7f923f8952a6f098ff388df0f25a"}}`
        },
        method: 'GET',
        proxy: proxyUrl,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0",
          "Accept": "application/json",
          "accept-language": `${countryCode}-${region.toUpperCase()},${countryCode};q=0.9`,
          "content-type": "application/json",
          "apollographql-client-version": "0.0.0",
          "dnt": "1",
          "origin": "https://store.playstation.com",
          "priority": "u=1, i",
          "referer": "https://store.playstation.com/",
          "sec-ch-ua": '"Chromium";v="140", "Not=A?Brand";v="24", "Microsoft Edge";v="140"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          "x-psn-app-ver": "/0.0.0-",
          "x-psn-correlation-id": correlationId,
          "x-psn-request-id": requestId,
          "x-psn-store-locale-override": `${language}`
        },
        json: true,
        timeout: 10000
      });

      const pageInfo = _.get(games, ['data', 'categoryGridRetrieve', 'pageInfo']);

      if (!pageInfo) {
        console.warn('无法获取页面信息，跳过当前页');
        continue;
      }

      totalPage = Math.ceil(pageInfo.totalCount / pageSize);

      const products = _.get(games, ['data', 'categoryGridRetrieve', 'concepts'], []);

      for (let item of products) {
        // 直接使用从API获取的基本信息，不再爬取产品详情页面
        gameList.push({
          id: item.id,
          gameKey: item.id,
          title: item.name,
          icon: item.media && item.media.find(media => media.role == 'MASTER') ?
                item.media.find(media => media.role == 'MASTER').url : '',
          developer: '',
          primaryGenre: '游戏',
          price: item.price.basePrice,
          currency: 'USD',
          free: true, // 默认设为免费，实际需要根据游戏价格确定
          store: 'PlayStation Store',
          description: '',
          screenshots: item.media ?
                      item.media.filter(media => media.role == 'SCREENSHOT').map(media => media.url) :
                      []
        });
      }


    } catch (error) {
      console.error(`获取第 ${startPage} 页游戏列表失败:`, error.message);
      console.error('错误详情:', {
        statusCode: error.statusCode,
        error: error.error,
        response: error.response,
        options: error.options
      });
      // 继续获取下一页
    }
  }

  return { 
    gameList: _.uniqBy(gameList.filter(item => item.title), 'title'), 
    totalPage 
  };
}

module.exports = {
  getPSGames,
  SUPPORTED_REGIONS,
  SUPPORTED_COLLECTIONS
};