# Demo deployment to sq-ui.dev

The repository's `.github/workflows/main.yml` verifies changes and deploys the
tested demo to Cloudflare Pages after successful pushes to `master`. The domain
and credentials must be configured as described below. The demo becomes available
after the first successful deployment.

## Hosting layout

| Address | Content | Publishing |
|---|---|---|
| `https://sq-ui.dev/` | Angular demo application | Cloudflare Pages Direct Upload |
| `https://sq-ui.dev/#/preview` | Interactive component playground | Same Angular build |
| `https://sq-ui.github.io/ng-sq-ui/#/` | Docsify documentation | Existing GitHub Pages configuration |

Keep the documentation at its current address for this change. A future
`docs.sq-ui.dev` can be configured separately if desired.

## Pipeline

Use GitHub Actions for build and validation, then upload the verified static build
to Cloudflare Pages. This follows Cloudflare's supported
[Direct Upload CI workflow](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/).
It allows deployment to depend on the tests already run in this repository.

1. Pull requests run library builds, package export checks, type checking, lint,
   the production application build and unit tests. No production deployment.
2. A push to `master` runs the same checks, then publishes the resulting artifact.
3. Other branches remain validation-only. `master` matches the local remote's
   default-branch reference; confirm it in GitHub and use the same production
   branch in both GitHub and Cloudflare.

The build commands already exist:

```sh
npm ci
npm run build:libs
npm run check:exports
npm run typecheck
npm run lint
npm run build
npm test
```

Upload **`dist/sq-ui/browser`**, not `dist/` or the library package directories.
The app is a static Angular application, with no server runtime required.
Keep `<base href="/">` and the current hash routing. Fragments such as `/#/preview`
are handled by Angular in the browser. Cloudflare also supplies a
[default SPA fallback](https://developers.cloudflare.com/pages/configuration/serving-pages/)
when there is no top-level `404.html`.

## One-time configuration

1. Create a Cloudflare Pages **Direct Upload** project named `sq-ui-demo`, with
   production branch `master`. Use that project name below, or replace it consistently.
   Choose Direct Upload when creating the project; Cloudflare documents the
   [limitations on changing integration type](https://developers.cloudflare.com/pages/get-started/direct-upload/).
2. Under the Pages project's **Custom domains**, add `sq-ui.dev`. The apex zone
   must be active in the same Cloudflare account. Follow the domain association
   flow so Cloudflare creates the DNS record and provisions HTTPS; see
   [custom domain setup](https://developers.cloudflare.com/pages/configuration/custom-domains/).
3. Create an account-scoped API token with **Cloudflare Pages: Edit** for the
   relevant account, as described in the Direct Upload guide. Store
   `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as GitHub Actions repository
   secrets under **Settings > Secrets and variables > Actions**. No GitHub
   Environment is required; the workflow restricts deployment to pushes to `master`.
4. Require the existing `verify` CI job in the production branch's protection rules.
   PR validation does not need the Cloudflare secrets.

## Workflow implementation

The `verify` job saves the production build **after the unit tests**:

```yaml
      - name: Save verified demo build
        if: github.event_name == 'push' && github.ref == 'refs/heads/master'
        uses: actions/upload-artifact@v4
        with:
          name: demo-site
          path: dist/sq-ui/browser
          if-no-files-found: error
          retention-days: 7
```

The `deploy` job runs after `verify`. It downloads the build
from the same workflow run, so deployment publishes the exact files that passed CI.

```yaml
  deploy:
    needs: verify
    if: github.event_name == 'push' && github.ref == 'refs/heads/master'
    runs-on: ubuntu-latest
    timeout-minutes: 10
    permissions:
      contents: read
      deployments: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
      - uses: actions/download-artifact@v4
        with:
          name: demo-site
          path: demo-site
      - name: Deploy verified demo
        uses: cloudflare/wrangler-action@v4
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
          command: pages deploy demo-site --project-name=sq-ui-demo --branch=master
```

The existing workflow already triggers on pushes to `master`, `main` and
`morph-main`, and on pull requests. Only pushes to `master` deploy.
Manual workflow runs remain validation-only.

## First release and rollback

Verify the first deployment's `pages.dev` URL, then check `https://sq-ui.dev/`,
`https://sq-ui.dev/#/preview`, fonts, images, lazy-loaded routes and browser refresh.
For local inspection of the production artifact:

```sh
npm run build:app:prod
node scripts/serve-built-preview.mjs
# Open http://127.0.0.1:4201/#/preview
```

Cloudflare Pages supports [rolling back to a previous production deployment](https://developers.cloudflare.com/pages/configuration/rollbacks/).
Publishing the demo does not publish npm packages or update the GitHub Pages docs.
PR preview deployments can be added later as a separate flow with preview URLs;
keep production credentials out of fork PR runs.

## Embedded documentation examples

The docs embed the demo at `/#/embed/forms`, `pagination`, `tables`, `datetime`,
`modal` and `progress`. Publish this demo version before publishing the updated
Docsify pages. Verify an actual iframe on the GitHub Pages docs after deployment.
If you configure response headers in Cloudflare, allow the docs origin to frame
the demo: `X-Frame-Options: DENY` or `SAMEORIGIN` would block these cross-origin previews.
The [examples guide](examples.md#live-previews-in-the-documentation) covers local testing.
