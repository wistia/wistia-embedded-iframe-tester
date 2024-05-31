import express from 'express';
import https from 'https';
import { Request, Response, NextFunction } from 'express';

const app = express();
const port = 5432;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allows all origins
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

app.get('/expiring_token/:mediaHashedId', (req, res, next) => {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 1);

  const postData = {
    expiring_access_token: {
      expires_at: expiresAt,
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
      data += chunk;
    });

    wistiaResponse.on('end', () => {
      try {
        res.status(wistiaResponse.statusCode ?? 500).json(JSON.parse(data));
      } catch (e) {
        next(e)
      }
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
