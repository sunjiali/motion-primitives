# Releasing

Versioning is [SemVer](https://semver.org): new primitives are minor
releases, fixes and internal/quality work are patches, breaking API
changes are majors (none yet — the API is still 0.x, where breaking
changes ride minor bumps and must be called out in the changelog).

## Checklist

1. `CHANGELOG.md` — move the work into a new version section, newest on
   top, dated. The changelog entry is written when the change lands,
   not reconstructed at release time.
2. `package.json` + `package-lock.json` — bump `version`
   (`npm install --package-lock-only` refreshes the lockfile header).
3. Verify, in order:
   - `npm run check` — syntax + unit/parity tests green;
   - `CHROME_PATH=<chrome> npm run package:smoke` — the packed tarball
     installs and renders;
   - CI green on the pushed commit, Pages deploy green if `site/`
     changed, and the live site byte-compared for changed files.
4. Tag and publish the GitHub release:
   ```bash
   git tag -a vX.Y.Z -m "vX.Y.Z"
   git push origin vX.Y.Z
   gh release create vX.Y.Z --title "vX.Y.Z" --notes-file <notes>
   # Attach the agent-skill zip (the main user install path until npm):
   zip -qr /tmp/motion-skill-vX.Y.Z.zip skill -x "skill/node_modules/*"
   gh release upload vX.Y.Z /tmp/motion-skill-vX.Y.Z.zip
   ```
   Release notes are the changelog section for that version, lightly
   edited — never auto-generated filler.
5. npm (once publishing is enabled): publish from CI with provenance
   (trusted publishing / OIDC), never from a laptop token. Until the
   npm side is configured, the GitHub release is the release of record
   and the README says the package is installable from the tarball.

## Rules

- No release with a red gate, ever. A failed verification is fixed or
  the release waits; it is never shipped "to be fixed in the next one".
- The site, the npm tarball, and the tag must all carry the same
  version's code — the parity tests exist to keep it that way.
