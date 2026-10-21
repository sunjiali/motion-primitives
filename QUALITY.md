# Quality bar

This project holds itself to the standards of a mature open-source
library, benchmarked against GitHub's own secure-use guidance, the
OpenSSF Scorecard check list, and the practices of large OSS projects
(clear governance files, gated releases, minimal CI privilege). This
file is the audit trail: what is in force, what the evidence is, and
what is knowingly not done yet.

## In force

**Determinism first.** Every primitive is a pure function of the frame
number; seeded randomness only (`hash`). This is the project's core
invariant and most tests exist to protect it.

**Tests that gate.** `npm run check` (strict TypeScript typecheck +
syntax + `node:test` suites) runs locally and in CI and must be green
to ship. The suites cover primitive contracts (determinism, easing,
spring, odometer alignment…), the SFX engine (WAV validity,
determinism), and *parity*: runtime exports, `index.d.ts`, the `Motion`
type, and the site's mirrored lib copies must agree — drift fails the
build. A build-freshness step also fails CI if the committed
JavaScript drifts from the TypeScript sources.

**Package truth.** CI packs the real tarball, installs it into a clean
consumer project, and renders a still through the installed CLI
(`npm run package:smoke`). What users receive is what gets tested.

**CI hygiene.** Workflows run with `contents: read` unless a job says
more; actions are pinned to full-length commit SHAs (the only
immutable reference, per GitHub's secure-use reference) and kept
current by Dependabot; checkout does not persist credentials; jobs
have timeouts; Node 18 / 20 / 22 are all exercised (18 and 22 in the
compat job).

**Supply chain & repo security.** Dependabot version updates (npm +
GitHub Actions, weekly) and security updates are on; vulnerability
alerts on; secret scanning with push protection on; private
vulnerability reporting on (see SECURITY.md); CodeQL code scanning
runs with GitHub's default setup, the setup GitHub recommends
starting with.

**Governance files.** README, LICENSE (MIT), CONTRIBUTING,
CODE_OF_CONDUCT, SECURITY, SUPPORT, issue/PR templates, CODEOWNERS —
the community profile is complete.

**Releases.** SemVer + a hand-written changelog; every version gets a
git tag and a GitHub release whose notes are its changelog section;
the release checklist (RELEASING.md) forbids shipping on a red gate.

## Known exceptions (deliberate, revisited as the project grows)

- **Solo maintainer.** `main` accepts direct pushes from the owner;
  branch protection requires the `check` and `smoke` status checks on
  pull requests and forbids force pushes/deletions, but does not
  require a second reviewer — a one-person project cannot review its
  own PRs. This is the first rule to tighten when a second maintainer
  arrives.
- **npm publishing pending.** The package is release-ready and
  smoke-tested from the tarball; registry publishing waits on the
  maintainer's npm configuration and will use trusted publishing
  (OIDC provenance) from CI when it lands, per RELEASING.md.
- **TypeScript sources, committed JavaScript.** The source of truth is
  strict-mode TypeScript; the shipped artifact is still CommonJS +
  browser globals, exactly as before — consumers never run a build
  step. `tsc` is the only build tool (no bundler); the compiled `.js`
  is committed next to its sources and CI verifies it is fresh. The
  package surface is declared with an `exports` map (root entry +
  `src` passthrough, v0.12.0); an ESM wrapper remains a roadmap item.

## References

- GitHub Docs — Secure use reference (action pinning, token hygiene)
- GitHub Docs — Configuring Dependabot version updates
- GitHub Docs — Configuring default setup for code scanning (CodeQL)
- OpenSSF Scorecard — the check list this file is benchmarked against
  (branch protection, pinned dependencies, dependency-update tool,
  security policy, signed releases, CI tests, SAST…)
- Keep a Changelog / Semantic Versioning — format of CHANGELOG.md
- TypeScript strict mode — the compiler is the first test suite
