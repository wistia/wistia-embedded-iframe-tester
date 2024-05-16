import express from 'express';
import https from 'https';

const app = express();
const port = 5432;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allows all origins
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.get('/expiring_token/:mediaHashedId', (req, res) => {
  const postData = {
    expiring_access_token: {
      authorizations: [
        {type: 'media', id: req.params.mediaHashedId, permissions: ['edit-transcripts']}
      ]
    }
  }
  const options = {
    hostname: 'api.wistia.io', // TODO: make this configurable
    port: 443,
    path: '/v1/expiring_token.json',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.WISTIA_PERMANENT_TOKEN}`,
    }
  }
  const wistiaRequest = https.request(options, (wistiaResponse) => {
    let data = '';

    wistiaResponse.on('data', (chunk) => {
      console.log(chunk)
      data += chunk;
    });

    wistiaResponse.on('end', () => {
      console.log(data)
      res.status(wistiaResponse.statusCode ?? 500).json(JSON.parse(data));
    });
  })

  wistiaRequest.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  wistiaRequest.write(JSON.stringify(postData));
  wistiaRequest.end();
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
