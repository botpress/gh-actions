# Infisical Actions

Actions for managing secrets with [Infisical](https://infisical.com).

## migrate

Dumps a repo's GitHub Actions secrets — every tier, but one tier per run — into a raw folder in Infisical. Values land verbatim. No name rewriting, no routing. After import, cherry-pick the ones you want into the real Infisical env/path by hand.

Intended as a one-time migration helper. Once everything is in Infisical, delete the workflow and the `/raw` folder.

### Why three runs?

GitHub secrets come from three distinct scopes, and `toJSON(secrets)` only exposes one scope per workflow run:

| Workflow run                    | `toJSON(secrets)` contains                          | Lands in folder    |
| ------------------------------- | --------------------------------------------------- | ------------------ |
| no `environment` input          | repo secrets + org secrets                          | `dev:/raw/repo`    |
| `environment: staging`          | repo + org + **staging env-scoped overrides**       | `dev:/raw/staging` |
| `environment: production`       | repo + org + **production env-scoped overrides**    | `dev:/raw/prod`    |

Run all three to capture every tier. Same-named secrets with different values across GH environments don't collide because each run writes to its own folder.

### Prerequisites

1. **Infisical project** — create one at app.infisical.com.
2. **Machine Identity with OIDC auth** configured in Infisical:
   - OIDC Discovery URL: `https://token.actions.githubusercontent.com`
   - Issuer: `https://token.actions.githubusercontent.com`
   - Subject: `repo:botpress/<repo>:*` (scope to your repo)
   - Audiences: `https://github.com/botpress`
3. **Environments** — at minimum a `dev` environment to hold the raw dump.

Folders (`/raw`, `/raw/repo`, `/raw/staging`, `/raw/prod`) are auto-created on first run.

### Usage

Drop this into any repo you want to migrate — `.github/workflows/migrate-secrets-to-infisical.yml`:

```yaml
name: Migrate Secrets to Infisical

on:
  workflow_dispatch:
    inputs:
      project-id:
        description: 'Infisical Project ID'
        required: true
      identity-id:
        description: 'Infisical Machine Identity ID (OIDC)'
        required: true
      environment:
        description: 'GitHub environment to include (leave empty for repo secrets only)'
        required: false
        default: ''

permissions:
  id-token: write
  contents: read

jobs:
  migrate:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment || null }}
    steps:
      - uses: botpress/gh-actions/infisical/migrate@main
        with:
          project-id: ${{ inputs.project-id }}
          identity-id: ${{ inputs.identity-id }}
          environment: ${{ inputs.environment }}
        env:
          ALL_SECRETS: ${{ toJSON(secrets) }}
```

Then trigger the workflow three times from the Actions tab: once with `environment` empty, once with `staging`, once with `production`.

### After importing

1. In the Infisical UI, look at `dev:/raw/repo`, `dev:/raw/staging`, `dev:/raw/prod`.
2. For each secret you want, copy it to the right target — typically `staging:/app` and `prod:/app`.
3. Delete the GitHub repo secrets.
4. Delete the `/raw` folder in Infisical.
5. Delete this workflow file.

### Using secrets after migration

Replace `${{ secrets.FOO }}` with Infisical's own consumer action:

```yaml
permissions:
  id-token: write
  contents: read

steps:
  - uses: Infisical/secrets-action@v1.0.15
    with:
      method: 'oidc'
      identity-id: '<your-machine-identity-id>'
      project-slug: '<your-project-slug>'
      env-slug: 'staging'     # or 'prod'
      secret-path: '/app'

  - run: echo "$MY_SECRET"    # now available as env var
```

### Inputs

| Input          | Required | Default                        | Description |
| -------------- | -------- | ------------------------------ | ----------- |
| `project-id`   | yes      | —                              | Infisical Project ID |
| `identity-id`  | yes      | —                              | Machine Identity ID (OIDC) |
| `environment`  | no       | `''`                           | GitHub environment name; empty = repo-level only. Maps to `/raw/<folder>`. |
| `raw-env`      | no       | `dev`                          | Infisical env that holds the raw dump. |
| `raw-root`     | no       | `/raw`                         | Parent folder under which per-scope folders live. |
| `audience`     | no       | `https://github.com/botpress`  | OIDC audience. |

### Caller-side requirement

Set `ALL_SECRETS: ${{ toJSON(secrets) }}` as an env var on the step (or the job) that calls the action. That's the only way to read GitHub secrets from a workflow — GitHub doesn't expose them via API.
