import * as store from 'app-store-scraper';

export default async (req, res) => {
  try {
    const { query } = req;
    const { collection, category, country } = query;

    const result = await store.list({
      collection: collection || 'TOP_FREE_IOS',
      num: 50,
      country: country || 'us',
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch app data' });
  }
};