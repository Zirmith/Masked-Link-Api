const express = require('express');
const validUrl = require('valid-url');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

const links = {};

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

  const link = Object.values(links).find(l => l.originalUrl === url);

  if (link) {
    return res.status(200).json({ code: link.code, shortUrl: `https://masked-api.onrender.com/${link.code}` });
  } else {
    const code = Math.floor(Math.random() * 1000000);
    const newLink = { code, originalUrl: url };
    links[code] = newLink;

    return res.status(200).json({ code: newLink.code, shortUrl: `https://masked-api.onrender.com/${newLink.code}` });
  }
});

app.get('/:code', async (req, res) => {
  const { code } = req.params;

  const link = links[code];

  if (link) {
    return res.redirect(link.originalUrl);
  }

  return res.status(404).json({ error: 'Link not found' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});