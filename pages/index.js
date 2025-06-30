import { useEffect, useState } from 'react';

// 定义主要国家列表
const countries = [
  { code: 'cn', name: '中国' },
  { code: 'hk', name: '中国香港' },
  { code: 'tw', name: '中国台湾' },
  { code: 'mo', name: '中国澳门' },
  { code: 'us', name: '美国' },
  { code: 'jp', name: '日本' },
  { code: 'kr', name: '韩国' },
  { code: 'gb', name: '英国' },
  { code: 'fr', name: '法国' },
  { code: 'de', name: '德国' },
  { code: 'ca', name: '加拿大' },
  { code: 'au', name: '澳大利亚' },
  { code: 'ru', name: '俄罗斯' }
];

// 定义应用集合类型列表
const collections = [
  { code: 'topgrossingapplications', name: 'iOS畅销榜' },
  { code: 'topfreeapplications', name: 'iOS免费榜' },
  { code: 'toppaidapplications', name: 'iOS付费榜' },
  { code: 'topgrossingipadapplications', name: 'iPad畅销榜' },
  { code: 'topfreeipadapplications', name: 'iPad免费榜' },
  { code: 'toppaidipadapplications', name: 'iPad付费榜' }
];

export default function Home() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [country, setCountry] = useState('cn');
  const [collection, setCollection] = useState('topgrossingapplications');

  useEffect(() => {
    async function fetchApps() {
      try {
        setLoading(true);
        const response = await fetch(`/api/list?collection=${collection}&country=${country}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setApps(data);
      } catch (error) {
        console.error('Error fetching apps:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchApps();
  }, [country, collection]); // 当国家或集合类型变化时重新获取数据

  if (loading) return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      zIndex: 1000
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <img
            src="/d7faead123aadc4aa3dc8d1b8b59d69b90f38569.png"
            alt="Logo"
            style={{
              width: '60px',
              height: '60px'
            }}
          />
          <svg viewBox="25 25 50 50" style={{ width: '3.75em' }}>
            <circle cx="50" cy="50" r="20"></circle>
          </svg>
        </div>
        <div style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#000',
          letterSpacing: '2px'
        }}>加载中...</div>
      </div>
      <style jsx global>{`
        svg {
          transform-origin: center;
          animation: rotate 2s linear infinite;
        }

        circle {
          fill: none;
          stroke: #000;
          stroke-width: 2;
          stroke-dasharray: 1, 200;
          stroke-dashoffset: 0;
          stroke-linecap: round;
          animation: dash 1.5s ease-in-out infinite;
        }

        @keyframes rotate {
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes dash {
          0% {
            stroke-dasharray: 1, 200;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 90, 200;
            stroke-dashoffset: -35px;
          }
          100% {
            stroke-dashoffset: -125px;
          }
        }
      `}</style>
    </div>
  );
  
  if (error) return <div className="error">错误: {error}</div>;

  // 处理国家选择变化
  const handleCountryChange = (e) => {
    setCountry(e.target.value);
  };

  // 处理集合类型选择变化
  const handleCollectionChange = (e) => {
    setCollection(e.target.value);
  };

  // 获取当前国家名称
  const getCurrentCountryName = () => {
    const currentCountry = countries.find(c => c.code === country);
    return currentCountry ? currentCountry.name : '中国';
  };

  // 获取当前集合类型名称
  const getCurrentCollectionName = () => {
    const currentCollection = collections.find(c => c.code === collection);
    return currentCollection ? currentCollection.name : 'iOS畅销榜';
  };

  return (
    <div className="container">
      <h1 className="title">App Store {getCurrentCountryName()}{getCurrentCollectionName()}</h1>
      
      <div className="selectors-container">
        <div className="selector">
          <label htmlFor="collection-select">选择榜单类型：</label>
          <select
            id="collection-select"
            value={collection}
            onChange={handleCollectionChange}
            className="select-input"
          >
            {collections.map(c => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="selector">
          <label htmlFor="country-select">选择国家/地区：</label>
          <select
            id="country-select"
            value={country}
            onChange={handleCountryChange}
            className="select-input"
          >
            {countries.map(c => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {apps.length === 0 ? (
        <div className="empty">没有找到应用</div>
      ) : (
        <div className="app-list">
          {apps.map((app, index) => (
            <div key={app.id} className="app-card">
              <div className="rank">{index + 1}</div>
              <div className="app-info">
                {app.icon && <img src={app.icon} alt={app.title} className="app-icon" />}
                <div className="app-details">
                  <h3 className="app-title">{app.title}</h3>
                  <p className="app-developer">{app.developer}</p>
                  <p className="app-category">{app.primaryGenre}</p>
                  {app.price === 0 ? 
                    <span className="price free">免费</span> : 
                    <span className="price paid">¥{app.price}</span>
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        .title {
          text-align: center;
          color: #1a1a1a;
          margin-bottom: 30px;
        }

        .app-list {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .app-card {
          display: flex;
          align-items: center;
          padding: 15px 20px;
          border-bottom: 1px solid #f0f0f0;
          transition: background-color 0.2s;
        }

        .app-card:hover {
          background-color: #f8f9fa;
        }

        .app-card:last-child {
          border-bottom: none;
        }

        .rank {
          font-size: 24px;
          font-weight: bold;
          color: #666;
          min-width: 40px;
          text-align: center;
        }

        .app-info {
          display: flex;
          flex: 1;
          align-items: center;
          margin-left: 15px;
        }

        .app-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          object-fit: cover;
        }

        .app-details {
          margin-left: 15px;
          flex: 1;
        }

        .app-title {
          margin: 0 0 5px 0;
          font-size: 16px;
          color: #1a1a1a;
        }

        .app-developer {
          margin: 0 0 3px 0;
          font-size: 14px;
          color: #666;
        }

        .app-category {
          margin: 0;
          font-size: 12px;
          color: #999;
        }

        .price {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .free {
          background-color: #e8f5e9;
          color: #2e7d32;
        }

        .paid {
          background-color: #fff3e0;
          color: #f57c00;
        }

        .loading-fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(255, 255, 255, 0.9);
          z-index: 1000;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .loading-image {
          width: 100px;
          height: 100px;
          margin-bottom: 20px;
          animation: spin 2s linear infinite, pulse 1.5s ease-in-out infinite;
        }

        .loading-text {
          font-size: 18px;
          font-weight: 600;
          color: #007aff;
          letter-spacing: 2px;
          animation: fadeInOut 1.5s ease-in-out infinite;
          text-shadow: 0 0 5px rgba(0, 122, 255, 0.3);
        }

        @keyframes pulse {
          0% { transform: scale(0.9) rotate(0deg); opacity: 0.7; }
          50% { transform: scale(1.1) rotate(180deg); opacity: 1; }
          100% { transform: scale(0.9) rotate(360deg); opacity: 0.7; }
        }

        @keyframes fadeInOut {
          0% { opacity: 0.5; transform: translateY(5px); }
          50% { opacity: 1; transform: translateY(-5px); }
          100% { opacity: 0.5; transform: translateY(5px); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error {
          text-align: center;
          color: #dc3545;
          padding: 20px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .empty {
          text-align: center;
          padding: 40px;
          color: #666;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .selectors-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }

        .selector {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          padding: 12px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .select-input {
          margin-left: 10px;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid #ddd;
          background-color: #fff;
          font-size: 14px;
          color: #333;
          cursor: pointer;
          outline: none;
          transition: border-color 0.2s;
          min-width: 150px;
        }

        .select-input:hover {
          border-color: #aaa;
        }

        .select-input:focus {
          border-color: #007aff;
          box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
        }

        @media (min-width: 640px) {
          .selectors-container {
            flex-direction: row;
            justify-content: center;
            gap: 20px;
          }
        }

        label {
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }
      `}</style>
    </div>
  );
}