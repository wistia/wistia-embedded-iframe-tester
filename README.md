# Getting started:

This is a simple app that shows how we can use the backend server using a permanent token to request
an expiring token to expose to the client. To get started:

Create an account in wistia and go to:

`https://<account-key>.wistia.io/account/api`

to create a permanent token. Make sure to store this token somewhere safe.

In one terminal run:

```sh
WISTIA_PERMANENT_TOKEN=<the-token-you-created> docker compose up
```

This will start an nginx server pointing to both the frontend and backend
servers for development.

NOTE: For backend changes (both nginx and the backend server) you need to
restart docker. For changes to the frontend you just need to refresh the page.
