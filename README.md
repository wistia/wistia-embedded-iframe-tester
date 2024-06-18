## Getting started:

This is a simple app that shows how we can use the backend server using a permanent token to request
an expiring token to expose to the client. To get started:

Create an account in wistia and go to:

`https://<account-key>.wistia.com/account/api`

to create a permanent token. Make sure to store this token somewhere safe.

In one terminal run:

```sh
WISTIA_PERMANENT_TOKEN=<the-token-you-created> docker compose up
```

This will start an nginx server pointing to both the frontend and backend
servers for development on `http://localhost:5050`. When you have a media
on the account with the permanent token mentioned above, you can navigate to:
`http://localhost:5050/?hashedId=<hashed-id>` to edit that media's transcript.

NOTE: For backend changes (both nginx and the backend server) you need to
restart docker. For changes to the frontend you just need to refresh the page.

## Pointing to a different TLD

By default we route all requests to `*.wistia.com`. If you are doing local wistia
development or want to point to staging instead you will need to change this. Simply
specify a different TLD:

```sh
# NOTE: this needs to be a different token than what points to the .com mentioned
# above.
WISTIA_PERMANENT_TOKEN=<a-token-you-created-in-appropriate-env> WISTIA_TLD=io docker compose up
```
