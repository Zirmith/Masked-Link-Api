const express = require('express');
const { MongoClient } = require('mongodb');
const validUrl = require('valid-url');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = 'mongodb+srv://Paragon:thevoidis2@sessions.m6cqqsq.mongodb.net/';
const DB_NAME = 'masked-links';

const client = new MongoClient(MONGO_URI);

app.use(express.json());
app.use(cors());



app.get('/', (req, res) => {
  res.send('Welcome to the Masked Link API!');
});

app.post('/links', async (req, res) => {
  const { url } = req.body;
 console.log(req.body);
  if (!url) {
    return res.status(400).json({ error: 'Missing URL' });
  }

  if (!validUrl.isUri(url)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection('links');

    let link = await collection.findOne({ originalUrl: url });

    if (!link) {
      const code = Math.floor(Math.random() * 1000000);

      link = { code, originalUrl: url };

      const result = await collection.insertOne(link);

      if (result.insertedCount !== 1) {
        throw new Error('Failed to create link');
      }
    }

    return res.status(200).json({ code: link.code, shortUrl: `http://localhost:${PORT}/${link.code}` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
});

app.get('/:code', async (req, res) => {
  const { code } = req.params;

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection('links');

    const link = await collection.findOne({ code: parseInt(code) });

    if (link) {
      return res.redirect(link.originalUrl);
    }

    return res.status(404).json({ error: 'Link not found' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
});


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
