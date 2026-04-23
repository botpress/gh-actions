# db-tunnel

Composite action that opens an SSM port-forward tunnel through the bastion host to a private RDS cluster and outputs a masked postgres connection URL. Used by service repos (e.g. Desk) to run Prisma migrations against clusters that aren't reachable from the internet. Registers its own post-job cleanup.

## Quick start

```yaml
permissions:
  id-token: write
  contents: read

steps:
  - uses: botpress/gh-actions/db-tunnel@v3
    id: tunnel
    with:
      environment: staging   # or: production
      database: desk         # key in clusters.json

  - env:
      DATABASE_URL: ${{ steps.tunnel.outputs.database-url }}
    run: ./run-migrations.sh
```

## Full documentation

See **[DB Tunnel](https://github.com/botpress/engineering-handbook/blob/master/docs/processes/db-tunnel.md)** in the engineering handbook for:

- Full input/output reference
- How to grant a new repo or database access (cd-role-stack entry + clusters.json registration)
- Which secret + username to use (`DatabasePostgres.rolePasswordSecret` convention)
- Debugging common failure modes
- Relationship to the sibling tools: `hq db` and the `infra/tools/db-tunnel` CLI
