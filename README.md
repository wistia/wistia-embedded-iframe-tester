# Getting started:

This is a simple app that shows how we can use the backend server using a permanent token to request
an expiring token to expose to the client. To get started:

Create an account in wistia and go to:

`https://<account-key>.wistia.io/account/api`

to create a permanent token. Make sure to store this token somewhere safe.

In one terminal run:

```sh
cd server
WISTIA_PERMANENT_TOKEN=<the-token-you-created> npm start
```

In another run:

```sh
cd frontend
npm start
```

In the react app you can then add `?hashedId=<a-hashed-id>` which than will be used to load
the correct media in the iframe. The react app makes a request to the express app which
than requests the expiring token from wistia and returns it to the frontend. This token
is also used in the iframe.
