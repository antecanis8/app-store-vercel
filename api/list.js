import { appStoreScraper } from 'app-store-scraper';

const store = appStoreScraper;

export default async (req, res) => {
  try {
    const { collection, category, country } = req.query;

    const result = await store.list({
      collection,
      category,
      country: country || 'us',
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};