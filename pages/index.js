import { useEffect, useState } from 'react';

export default function Home() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchApps() {
      try {
        setLoading(true);
        const response = await fetch('/api/list?collection=topgrossingapplications&country=cn');
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
  }, []);

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
      加载中...
    </div>
  );
  
  if (error) return <div className="error">错误: {error}</div>;

  return (
    <div className="container">
      <h1 className="title">App Store 畅销榜</h1>
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

        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin: 0 auto 10px;
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
      `}</style>
    </div>
  );
}