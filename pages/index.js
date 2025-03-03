import { useEffect, useState } from 'react';

export default function Home() {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    async function fetchApps() {
      try {
        const response = await fetch('/api/list?collection=store.collection.TOP_GROSSING_IOS&country=cn');
        const data = await response.json();
        setApps(data);
      } catch (error) {
        console.error('Error fetching apps:', error);
      }
    }

    fetchApps();
  }, []);

  return (
    <div>
      <h1>App Store Apps</h1>
      {apps.map((app) => (
        <div key={app.id}>
          <h3>{app.title}</h3>
          <p>ID: {app.id}</p>
          <p>App ID: {app.appId}</p>
          <p>Developer: {app.developer}</p>
        </div>
      ))}
    </div>
  );
}