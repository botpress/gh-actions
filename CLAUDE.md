# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A registry of **reusable GitHub composite + node actions** that all Botpress repos consume via `uses: botpress/gh-actions/<action>@<ref>`. There is no application here — every change ships as a tag bump and is picked up by every consumer that pins to a floating tag (`@v3`, `@stable`, `@master`).

**This means: any backwards-incompatible change to an action.yml input or output silently breaks every consumer pinned to that floating tag.** Always grep across `repos/**/.github/workflows/*.yml` for usage before changing inputs, defaults, or step names.

## Release model

Tags, not branches, are the contract. Tags currently in use across the org:

- `@v3`, `@v3.3`, `@v3.4`, `@v3.10`, `@v3.x` — main composite-action consumers (most repos)
- `@v2` — older composite actions (most `build/docker`, `deploy/s3` callers still on this)
- `@master` — `publish-if-not-exists` consumers (packages, genisys, stratus, etc.)
- `@stable` — `db-tunnel` (desk only)
- `@main` — only the `infisical/migrate` README example

Releases are cut by hand via the **`Release` workflow dispatch** (`.github/workflows/release.yml`) — it just runs `git tag -f <name>` and pushes. There is no semver bot. After a feature lands on `master`, manually trigger Release with the new tag (e.g. `v3.11`) **and** force-update the floating major tag (`v3`) so consumers pick it up.

## Action inventory & usage map

Composite actions (bash-only, no build step):

| Action | Used by | Purpose |
|---|---|---|
| `build/docker` | skynet, infra, sauron, sso, desk | Build + push Docker image to ECR via buildx; idempotent (skips if tag exists). |
| `build/depot` | sauron (via `full-service-deploy` with `builder: depot`) | Same contract as `build/docker` but uses Depot for builds. Only invoked when caller passes `builder: depot` + `depot-project`. |
| `check-shells` | skynet, sso, dab, agent-lack, botpress | Runs `shellcheck` over `run:` blocks in workflows/actions; respects `.gitignore`. |
| `db-tunnel` | desk (`run-migrations-{staging,prod}.yml`) | Opens SSM port-forward to a private RDS cluster, outputs masked `postgres://` URL, registers self-cleanup. Cluster catalog is `db-tunnel/clusters.json` — adding a new database means editing this file **plus** granting the calling repo's role at the infra side (`cd-role-stack`). See `engineering-handbook/docs/processes/db-tunnel.md`. |
| `deploy/s3` | skynet, infra, sso, genisys, desk | `aws s3 sync` + optional CloudFront invalidation. |
| `full-service-deploy` | skynet, sauron, desk, echo, botpress | Composite of `build/{docker,depot}` + `tag-and-deploy`. The standard service-deploy entrypoint. |
| `tag-and-deploy` | sso (kratos), and internally by `full-service-deploy` | Tags an ECR image as `staging`/`production`, force-updates ECS service(s), waits for stabilization, auto-rolls-back on failure. Reads `services.json` from caller's repo root. |
| `tag-and-deploy-lambda` | sso (recaptcha/registration/users-validation) | Same idea but for Lambda functions provisioned by CDK (looks up by stack + prefix, since CDK appends a random suffix). |
| `publish-if-not-exists` | packages (~20 workflows), botpress, skynet, stratus, genisys, echo | `npm`/`pnpm publish` an npm package only if `name@version` isn't already on the registry. Supports OIDC trusted publisher flow. |
| `infisical/migrate` | (none — one-shot tool) | One-time helper to dump GH repo+org+env secrets into Infisical's `/raw` folder. Call directly from a target repo's workflow with `@main`; not part of any deploy. |

The six legacy `node12` actions (`rename_binaries`, `get_release_details`, `fetch_release_changelogs`, `close_pull_request_issues`, `set_ssh_key`, `extract_info`) were deleted. With them, the entire Node toolchain became dead — `jest.config.ts`, `.github/workflows/check-dist.yml`, `.github/workflows/test.yml`, and `.github/workflows/codestyle.yml` are gone too, and `package.json` no longer lists `workspaces` / `test`-related devDeps. ESLint/Prettier configs and `tsconfig.json` remain in place so a new TypeScript action can be added back without re-bootstrapping; if you do, restore `codestyle.yml` and add the package to a `workspaces` array.

Also unused with no consumers in the workspace:

| Action | Note |
|---|---|
| `publish-private-package` | No `uses:` matches in any repo. Was meant for `@botpress/*` packages on GH Packages — appears unadopted. Verify with the team before deleting. |

**Broken reference to flag:** `repos/infra/.github/workflows/backstage.yml` uses `botpress/gh-actions/backstage/action@v2`. The `backstage/` folder was deleted from this repo (commit `57f8b00` added it, later commit removed it), but the workflow keeps working because the `v2` tag is frozen at an older commit. **If anyone bumps it to `@v3`/`@stable`, the Backstage publishing pipeline silently breaks.** Either restore the action here or migrate infra off it.

## Development

There are currently no Node actions in this repo — every action is a `composite` shelling out to `bash`. To work on one, edit `action.yml` directly and ship a tag. There is no `yarn build` step.

If you reintroduce a Node action: add it to a `workspaces` array in `package.json`, restore the jest/ts-jest devDeps + a `test` script if needed, restore `.github/workflows/codestyle.yml`, and commit the bundled `dist/index.js` (consumers reference it directly via `runs.main`). Use `node20`, **not** `node12`/`node16` — both are deprecated by GitHub.

## Conventions specific to this repo

- **Composite actions are bash-only.** Don't introduce `node20` / TypeScript for new actions unless absolutely necessary — the existing pattern is `runs.using: composite` with `shell: bash` steps. The node actions here are legacy.
- **AWS auth uses OIDC + role-to-assume** via `aws-actions/configure-aws-credentials`. Account IDs are hardcoded in action.yml: build account `986677156374`, staging `236194216641`, production `981662312449`.
- **Idempotency is expected.** ECR push, Lambda update, ECS service update — all guard against re-running. Mirror that pattern in any new action.
- **Stable-tag rollback pattern.** `tag-and-deploy` and `tag-and-deploy-lambda` retag the previous current-environment image as `<env>_stable` before promoting the new one, then roll back to `<env>_stable` if stabilization fails. Don't break this contract — downstream services depend on it.
- **`services.json` / `clusters.json` are caller-owned and action-owned respectively.** `tag-and-deploy` reads `services.json` from the **caller's repo workspace**. `db-tunnel` reads `clusters.json` from **this repo** (`github.action_path`). When adding a database, edit `db-tunnel/clusters.json` and ship a new tag.
- **Shell scripts must pass `check-shells` (shellcheck).** This action runs against this repo's own workflows too. Disable specific findings inline (`# shellcheck disable=SCxxxx`) only with a reason.
- **Node engine pinned to 18.x** in root `package.json`, but composite-action consumers run on the GitHub-hosted runner's node — version varies per action (`publish-if-not-exists` requires `24.x`, `publish-private-package` uses `24`).
