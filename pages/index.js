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

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div>
      <h1>App Store Apps</h1>
      {apps.length === 0 ? (
        <div>没有找到应用</div>
      ) : (
        apps.map((app) => (
          <div key={app.id}>
            <h3>{app.title}</h3>
            <p>ID: {app.id}</p>
            <p>App ID: {app.appId}</p>
            <p>Developer: {app.developer}</p>
          </div>
        ))
      )}
    </div>
  );
}