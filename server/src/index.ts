import express from 'express';
import https from 'https';

const app = express();
const port = 5432;

app.get('/', (req, res) => {
  res.send('Hello, TypeScript with Express!');
});

app.get('/expiring_token', (req, res) => {
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
      data += chunk;
    });

    wistiaResponse.on('end', () => {
      res.status(wistiaResponse.statusCode ?? 500).json(JSON.parse(data));
    });
  })

  wistiaRequest.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  wistiaRequest.end();
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
