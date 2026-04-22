# Contributing

## Dev Setup

```bash
git clone https://github.com/sunnypdater/airforce-image-mcp.git
cd airforce-image-mcp
npm install
cp .env.example .env
# edit .env and set AIRFORCE_API_KEY
```

Run tests:
```bash
npm test
```

Build:
```bash
npm run build
```

Lint:
```bash
npm run lint
```

## PR Checklist

- [ ] `npm test` passes with no failures
- [ ] `npm run lint` produces no errors
- [ ] `npx tsc --noEmit` produces no type errors
- [ ] New tools have integration tests in `tests/integration/`
- [ ] All fetch calls go through `fetchWithTimeout` from `src/http.ts`
- [ ] Logs go to `process.stderr` only
- [ ] No hardcoded secrets

## Release Process

1. Update `CHANGELOG.md` with the new version entry
2. Bump version in `package.json`
3. Commit: `git commit -m "chore: release vX.Y.Z"`
4. Tag: `git tag vX.Y.Z`
5. Push tag: `git push origin vX.Y.Z`
6. GitHub Actions publishes to npm automatically
