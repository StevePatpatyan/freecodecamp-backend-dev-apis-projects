require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


/////////////////////// CODE ADDED BY ME /////////////////////////

const bodyParser = require('body-parser');
const dns = require('dns');
const mongoose = require('mongoose');
require('dotenv').config();
const { URL } = require('url');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schema and Model
const urlSchema = new mongoose.Schema({
  long_url: {
    type: String,
    required: true,
    unique: true,
  },
  short_url: {
    type: Number,
    required: true,
    unique: true,
  },
});

const UrlEntry = mongoose.model('UrlEntry', urlSchema);

app.post('/api/shorturl/', async (req, res) => {
  const input = req.body.url;

  try {
    const urlObj = new URL(input);
    const hostname = urlObj.hostname;

    dns.lookup(hostname, async (err) => {
      if (err) {
        return res.json({ error: 'Invalid URL' });
      }

      // Check if URL already exists
      let entry = await UrlEntry.findOne({ long_url: input });

      if (entry) {
        return res.json({
          original_url: entry.long_url,
          short_url: entry.short_url,
        });
      }

      const count = await UrlEntry.countDocuments();

      // Create new entry
      const newEntry = new UrlEntry({
        long_url: input,
        short_url: count + 1,
      });

      await newEntry.save();

      res.json({
        original_url: newEntry.long_url,
        short_url: newEntry.short_url,
      });
    });
  } catch (e) {
    res.json({ error: 'Invalid URL' });
  }
});


app.get('/api/shorturl/:short_url?',
  async (req, res) => {
    try {
    const entry = await UrlEntry.findOne({short_url:Number(req.params.short_url)});
    if (!entry) {
      res.send({"error":"No short URL found for the given input"});
    }
    else {
      long_url = entry.long_url;
      res.redirect(long_url);
    }
  }
catch (e) {
  res.send({"error":"No short URL found for the given input"});
}
  }
);



/////////////////////// CODE ADDED BY ME /////////////////////////


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
