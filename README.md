# Know Your Dev

## Development

To develop using this repo, make sure you have installed the following:

- [Bun](https://bun.sh/docs/installation)

### Monorepo

1. `core/`. This is for any shared code.

1. `functions/`. Lambda functions.

1. `web/`. This is the frontend.

1. `scripts/`. This is for any scripts that you can run on your SST app using the `sst shell` CLI.

1. The `infra/` directory allows you to logically split the infrastructure of your app into separate files. This can be helpful as your app grows.

### Environment variables

You need the following environment variables (see `.env.example`) and secrets (see `.secrets.example`):

- `CLOUDFLARE_API_TOKEN`: Cloudflare API token to manage DNS.

### Secrets

Make a copy of `.secrets.example` and name it `.secrets` and a copy of `.env.example` and name it `.env` and fill in the values above. To load the secrets into SST, run `bun secret:load`.

### Mobile

To test on mobile, use Ngrok to create a tunnel to your local frontend:

```zsh
ngrok http 3001
```

### Auth and cookies on local development (WIP TBD)

For auth to work on local development, there is a bit of rigmarole because we are running the frontend locally but the API server is on a `.kyd.theintel.io` domain. So in order to set cookies, you need to:

1. Sudo vim your `/etc/hosts` file to add a new entry for `local.kyd.theintel.io` that points to `127.0.0.1`
1. Install and set up mkcert:

   ```bash
   brew install mkcert
   mkcert -install
   ```

1. Generate the local certificates:

   ```bash
   mkcert local.kyd.theintel.io
   ```

   This will create two files: `local.kyd.theintel.io-key.pem` and `local.kyd.theintel.io.pem`

If you look at `vite.config.ts`, you will see that we reference these certificates to provide HTTPS for local development.

## Deployment

Right now, deployment is manual. Eventually, will set up GitHub Actions to automate this.

### Deploying to new environment

For a deploying a given change to a new environment:

1. Load secrets. From root folder, run `bun secret:load:<env>`.
1. Run `sst deploy --stage <env>` first to create state in SST. This will fail.
1. Run database migrations on prod. From `core` folder, run: `bun db:migrate:<env>`.
1. Deploy SST resources again. This time it should succeed.

Should probably set up a script to do this automatically as part of CI/CD.

## Known issues

1. When bulk inserting using Drizzle, make sure that the array in `values()` is not empty. Hence the various checks to either early return if the array is empty or making such insertions conditional. If we accidentally pass an empty array, an error will be thrown, disrupting the control flow. TODO: enforce this by using ESLint?
1. Need some way to deal with error logging. Logging for SST-deployed workers is off by default (can turn it on via console, but it'll be overridden at the next update). At scale, will need to set something up so we will be informed of unknown errors.
