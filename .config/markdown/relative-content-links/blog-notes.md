# Notes for a blog post: relative-content-links

## The problem

Markdown files in `articles/` and `notes/` cross-reference each other. Two ways to write that link:

- **Final URL** (`/articles/web-monetization-open-payments-part-1-connecting-wallet/`) — works on the built site, breaks everywhere else you'd read the file (editor preview, GitHub, Obsidian, `cat`), since it doesn't point at a real file.
- **Relative file path** (`../2025-12-03-.../README.md`) — works everywhere _except_ the built site, since Astro doesn't know to translate a `.md` file reference into a page URL.

The goal: write the second kind, get the first kind for free at build time.

## Architecture

Two pieces, both under `.config/markdown/relative-content-links/`:

- **`map.ts`** — builds an in-memory `Map<absoluteFilePath, finalUrl>` by walking each configured collection's directory.
- **`plugin.ts`** — a `satteri` mdast plugin (`link` visitor) that, for every markdown link starting with `./` or `../`, resolves it to an absolute path and looks it up in that map, rewriting `node.url` to the final published URL.
- **`index.ts`** — an Astro integration (`relativeContentLinks`) that builds the map during `astro:config:setup` and self-registers the plugin — no manual wiring into `markdown.processor.mdastPlugins` needed.

## Key decisions, in the order we made them

1. **Satteri plugin API discovery** — `satteri`'s plugins are `{name, link(node, ctx)}` visitor objects (mdast-node-type-keyed), not remark-style `(tree) => {}` transforms. `ctx.fileURL` gives the current file being compiled; `ctx.setProperty`/`ctx.report` mutate the tree and emit diagnostics respectively.

2. **Async map-building via an Astro integration, not inline in the plugin** — originally the plugin built its own map lazily on first use. Moved that to an `astro:config:setup` hook so it's ready _before_ any file compiles, and is genuinely async (`fs/promises`) instead of blocking.

3. **Self-registration via satteri's live `options.mdastPlugins`** — the biggest "aha": `@astrojs/markdown-satteri`'s `satteri()` factory returns a processor object whose `.options.mdastPlugins` array is the _same array reference_ `createRenderer` reads from later. Astro's own config-merge code has a comment confirming this is intentional (`z.custom` preserves reference identity specifically so integrations can mutate `processor.options.*`). So the integration just does `processor.options.mdastPlugins.push(satteriContentLinks)` — no need for the site config to manually list the plugin.

4. **Made it generic/config-driven** — instead of hardcoding "articles" and "notes," the integration takes `{ [collectionName]: { directory, getUrl, pattern } }`. `getUrl(entry, frontmatter, format)` gets a plain `{path, relativePath, basename}` entry, a frontmatter accessor, and a slash-safe URL joiner — and returns the final URL or `undefined` to skip the file.

5. **Security boundary** — a resolved link target must stay within the project root _and_ within one of the configured collection directories (proper path-segment containment check, not string-prefix matching). Cross-collection links (article → note) are allowed; escaping to arbitrary repo files is not.

6. **`README.md` made optional** — a link ending in `.md`/`.mdx` is an explicit file reference; anything else is treated as a directory reference and resolved via `README.md`/`README.mdx` inside it, with no extra filesystem calls (just alternate map lookups).

7. **Declarative include/exclude via `pattern`** — discovered Node has a native `path.matchesGlob(path, pattern)` (stable since Node 22ish, no new dependency needed) — used it to support `['**/*.md', '!_legacy/**']` instead of a manual `filter` callback.

8. **Performance pass** — four concrete changes: `readdir(dir, {withFileTypes:true})` to drop a redundant `stat()` syscall per entry; frontmatter turned into an async `frontmatter()` loader (only reads the file if `getUrl` actually calls it, memoized); an inlined ~15-line `pMap` (worker-pool concurrency limiter, no new dependency) capping directory-walk concurrency at 8; kept a lazy `Proxy` over the frontmatter block so unaccessed fields never even get regex-matched.

9. **Observability** — `astro:config:setup` logs a one-line summary (`content link map ready — articles: 5, notes: 2 (5ms)`) and any per-file failures via the integration logger; broken/unresolvable links warn via `console.warn` at compile time (necessary because `@astrojs/markdown-satteri` never surfaces a plugin's `ctx.report` diagnostics anywhere on its own — a gap worth calling out in the post).

## Interesting gotchas worth a blog mention

- Frontmatter parsing is regex-based, not full YAML — a deliberate scope call (no new dependency) that only supports scalar fields.
- `Proxy` `get` traps must be synchronous, which is why laziness had to move: file I/O is eager-but-deferred-until-called (via a returned closure/function), while _parsing_ individual fields off the already-read content stays lazy via `Proxy`.
- A quick real-world catch: the first version of the file-walker treated `articles/.obsidian` (an Obsidian vault config folder) as a content folder and logged it as a failure — fixed by skipping dotfolders, which is itself a nice anecdote about the "why" (using Obsidian to edit these files led directly to noise the walker had to filter).
