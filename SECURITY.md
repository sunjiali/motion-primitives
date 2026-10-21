# Security policy

## Supported versions

Security fixes land on the latest release. Older versions are not
backported — if you find a problem, please check whether the current
`main` branch (and the latest tag) still has it before reporting.

## Reporting a vulnerability

Please do **not** open a public issue for a security problem.

Use GitHub's private vulnerability reporting: on this repository, go to
**Security → Report a vulnerability**. That opens a private advisory
visible only to the maintainer.

Include, as far as you can:

- the version / commit and the exact command or composition involved;
- a minimal reproduction (a composition snippet or score JSON is ideal);
- what the bad outcome is (file access, code execution, data exposure…).

You can expect an acknowledgement within a few days. Fixes are
developed privately in the advisory and disclosed once a patched
release exists.

## Scope notes

The renderer launches a local headless Chrome and ffmpeg with content
the user supplies. Compositions are JavaScript: only render
compositions you trust, the same way you would only run code you
trust. Reports about the library mishandling *untrusted* input in ways
beyond that model (path handling, argument injection, archive or
dependency issues) are very much in scope.
