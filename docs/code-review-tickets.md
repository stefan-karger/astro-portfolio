# Code review implementation tickets

Prepared on 8 October 2026 from the code review and the agreed follow-up decisions.
These record the agreed implementation specifications, decisions, and validation results.
Findings 2, 4, 5, 6, 7, 8, 9, 10, 11, and 12 are implemented.
Findings 1 and 3 are closed by user decision; finding 13 is closed by clarification.

The subsequent test and README cleanup uses one production build for `pnpm validate`.
Output and browser tests share that build; `pnpm test:integration` is optional and
uses one additional content fixture build. The completion notes below describe
the original ticket validation, including test files and tooling since removed.

Follow-up changes on 8 October 2026 also removed the legacy route redirects and
unified navigation and legal links under `site-link`. Outbound markers in prose,
project links, and career links use one inline Lucide SVG component with centered
alignment and the link's native hover underline. Footer links use plain text labels.

Severity describes the impact on correctness, maintenance, or developer experience.
Ease describes the amount of coordination and verification required, rather than a time estimate.

## Scope and implementation rules

- Follow [CODING_GUIDELINES.md](../CODING_GUIDELINES.md). Prefer readable, direct code and meaningful
  boundaries over compact expressions or additional abstraction layers.
- Keep this a mostly static Astro site. Use the existing Node test runner, Playwright, Astro,
  Shiki, Satteri, and PhotoSwipe. These tickets do not require additional dependencies.
- The work concerns source organization, logic, data contracts, and verification. Page composition,
  visual styling, graphics, and image redesign are outside the scope.
- Preserve established routes, metadata, localization, copy behavior, and gallery behavior except
  for the explicit bug fix or authoring-format change described in a ticket.
- Run agent-managed development servers with `astro dev --background`; manage them with Astro's
  status, logs, and stop commands. Human development through `pnpm dev` remains in the foreground.

## Ticket index

| Ticket                                                                          | Review findings | Work                                                           | Classification                     | Severity             | Ease                    | Status      |
| ------------------------------------------------------------------------------- | --------------- | -------------------------------------------------------------- | ---------------------------------- | -------------------- | ----------------------- | ----------- |
| [CR-01](#cr-01-enforce-lf-for-repository-text-files)                            | 1               | Enforce LF in Git, editors, and formatting                     | Tooling / DX                       | High                 | Easy                    | Closed      |
| [CR-03](#cr-03-refresh-code-block-icons-after-svg-edits)                        | 3               | Refresh file icons after asset edits                           | Correctness / DX                   | Medium               | Moderate                | Closed      |
| [CR-04](#cr-04-separate-test-responsibilities-and-reduce-full-build-validation) | 4, 5            | Separate test suites and reduce redundant builds               | Structure / test design            | Medium               | Moderate to substantial | Implemented |
| [CR-06](#cr-06-add-browser-tests-for-existing-client-behavior)                  | 6               | Cover native browser behavior                                  | Test coverage                      | Medium               | Moderate                | Implemented |
| [CR-07](#cr-07-organize-the-markdown-pipeline-and-make-mermaid-source-explicit) | 7, 8            | Group Markdown processing and clarify its stages and contracts | Readability / placement / coupling | Medium               | Moderate to substantial | Implemented |
| [CR-09](#cr-09-organize-gallery-lifecycle-logic-in-one-galleryts-file)          | 9               | Rename and clarify the gallery module                          | Readability / placement            | Medium               | Moderate                | Implemented |
| [CR-10](#cr-10-use-tag-arrays-and-a-discriminated-blog-filter-type)             | 10, 11          | Align authored tags and filter types with their meaning        | Data modeling / type safety        | Low                  | Easy to moderate        | Implemented |
| [CR-12](#cr-12-make-site-data-and-locale-code-easy-to-find)                     | 12              | Group static facts, improve names, and document the file map   | Discoverability / naming           | Low                  | Easy to moderate        | Implemented |
| [CR-02](#cr-02-readable-stable-tag-urls)                                        | 2               | Readable tag URLs and case-insensitive matching                | Logic / URL stability              | Low after resolution | Complete                | Implemented |
| [CR-13](#cr-13-development-server-workflows)                                    | 13              | Distinguish agent and human development workflows              | DX / documentation                 | Resolved             | Complete                | Closed      |

No open code-review tickets remain. CR-10 was completed before CR-12 so the README
describes the final organization. It was subsequently shortened to a repository overview.

## CR-01: Enforce LF for repository text files

**Review finding:** 1. **Status:** Closed by user decision on 8 October 2026.

The original mismatch came from Windows Git using `core.autocrlf=true` while
Prettier expected LF. At the user's request, removed `.editorconfig`,
`.gitattributes`, and the README normalization procedure after completing CR-06.
The existing [Prettier configuration](../prettier.config.mjs) now uses
`endOfLine: "auto"` to preserve each file's line endings. No global Git or editor
settings are changed, and no separate line-ending policy files are needed.

The header-content assertion still normalizes CRLF before comparing the actual
rules, so it remains portable without enforcing a source-file format.
See [Prettier's end-of-line option](https://prettier.io/docs/options#end-of-line).

A fresh isolated Windows checkout with CRLF and no policy files passed formatting,
79 unit tests, 22 browser tests, the production build, and 19 output tests.
Restored native CRLF for 78 otherwise unchanged tracked files, undoing the earlier
mechanical conversion; their source content still exactly matches the Git index.

## CR-03: Refresh code-block icons after SVG edits

**Review finding:** 3. **Status:** Closed by user decision on 8 October 2026.

The icons are fixed assets and will not change during development. After completing CR-04,
reverted CR-03's factory-time SVG loading, Astro watcher integration, and direct/live-edit
regressions at the user's request. The original module-level loading, dedicated SVG assets,
and existing icon-selection and copy/title tests remain.

Automatic reloading of edited icon geometry is no longer a requirement. Future Markdown
refactors should preserve this simple fixed-asset behavior.

## CR-04: Separate test responsibilities and reduce full-build validation

**Review findings:** 4 and 5, including the additional separation of renderer and build-output tests.
**Classification:** Structure / test design. **Severity:** Medium.
**Ease:** Moderate to substantial; preserve the existing coverage and failure diagnostics.
**Dependencies:** The existing formatter configuration must accept the checkout's line endings.
**Status:** Implemented.

### Problem and decision

The former `tests/seo.spec.mjs` combined build-output checks, parsing helpers, process
execution, fixture mutation and restoration, failure snapshots, and a long isolated Astro scenario.
It reads `dist` before test selection, which makes unrelated helper tests depend on a prior build.
The isolated integration suite also performs a full Astro build for each invalid date input.
The recent integration run took roughly 218 seconds; the original review counted about 25 builds.

The former `tests/mermaid.test.mjs` mixed direct Markdown renderer tests with checks
against built articles and emitted bundles. Those are different prerequisites and feedback cycles.

Split suites by their responsibility, extract only genuinely shared support code, and test the
production content schema directly for the exhaustive date matrix. Keep a smaller set of real
Astro integration cases to verify collection loading, YAML interpretation, and build errors.

### Implementation

1. Establish the following small set of boundaries; adjust filenames if a more direct name emerges:
   - `tests/seo-build.test.mjs`: assertions against the existing production `dist` output.
   - `tests/seo-integration.test.mjs`: isolated Astro builds and background-server scenarios.
   - `tests/harness.test.mjs`: subprocess-result and fixture-restoration behavior.
   - `tests/support/astro-fixture.mjs`: process execution, fixture setup/restoration, and failure
     capture needed by the integration suites.
   - `tests/support/output.mjs`: HTML, XML, Markdown, and pagination inspection actually shared
     by build-output and fixture tests. Keep assertions private to their suite when they have one user.
2. Move `dist` enumeration and page reads into the build-output suite. Support modules and harness
   tests must be importable without `dist`, a browser installation, or a running server.
3. Extract the current blog schema to `src/lib/blog-schema.ts`, export the schema consumed by
   `src/content.config.ts`, and leave the Astro collection loader in the content configuration.
   Use Astro's existing Zod export. Keep one production validation contract rather than copying
   validation logic into tests.
4. Add direct schema tests for all current date cases: valid dates and leap days, invalid calendar
   dates and lexical formats, timestamps, numbers, `null`, parsed `Date` objects, and
   `updatedDate < pubDate`. Assert UTC-midnight output and useful field-specific errors.
5. Reduce the full-build date matrix to representative cases: an invalid quoted calendar date,
   an update before publication, and an unquoted YAML date when testing the parser's interpretation.
   Retain real integration coverage for component metadata validation, invalid Mermaid input,
   numeric route protection, series conflicts, production drafts, and development behavior.
6. Split Mermaid renderer tests from built-article/bundle checks. The renderer suite needs Chromium
   but no `dist`; the artifact checks belong with the production-output suite and reuse its build.
7. Preserve the harness guarantees: private Astro/Vite caches, fresh background servers, shutdown,
   fixture restoration, bounded processes, and a distinction between expected validation failures
   and crashes, signals, timeouts, or cleanup failures. Keep the existing tests for these guarantees.
8. Update failure capture for the new suite/helper locations. Record the responsible suite and
   include the relevant runner/support sources in diagnostic artifacts. Preserve snapshots before
   restoration, tool versions, command output, scenario history, and the documented replay of the
   failed Astro command from the captured checkout. Exclude shared dependency junctions.
9. Expose clearly named commands for fast unit/harness tests, Markdown renderer tests, production
   output checks, and isolated integration tests. Keep script arguments portable across the supported
   Node versions and Windows. Update `pnpm validate` to run fast checks before expensive builds and
   to include every suite once. Document prerequisites and individual commands in the README.
10. Record before/after timings and the number of full builds on the same machine. Make the reduction
    come from moving appropriate assertions to the schema suite, rather than dropping coverage.

### Acceptance criteria

- [x] A developer can run a blog-schema or harness test without building the site or installing Chromium.
- [x] Renderer tests can run without production artifacts; output tests clearly require a build.
- [x] The exhaustive invalid-date matrix uses the production schema and performs no Astro builds.
- [x] A small integration set still verifies YAML loading, schema error propagation, and UTC behavior.
- [x] Existing content, metadata, pagination, assets, localization, and failure-handling assertions
      remain represented in the separated suites.
- [x] Unexpected process failures retain useful diagnostics; expected invalid inputs create no snapshots.
- [x] Test checkouts have private writable caches, leave the root source untouched, and stop their server.
- [x] `pnpm validate` includes the full coverage once, and the README explains how to run each layer.
- [x] Build counts and timings show the effect of the change without an arbitrary wall-clock threshold.

### Validation

Run the unit and harness commands in a checkout that has no `dist`, then the renderer command after
the documented Chromium setup. Build once and run production-output checks. Run the full isolated
integration suite and the retained failure-capture/restoration regressions. Finally run `pnpm validate`
and compare the test inventory and build counts with the pre-refactor baseline.

Completed on 8 October 2026:

- Split production output, isolated integration, harness behavior, and shared inspection/process
  support into the specified files. Imports of the support modules perform no output reads or
  browser launches. `readPage` takes an explicit output directory; article checks receive the
  homepage from their own build rather than depending on the project's `dist`.
- Extracted the unchanged production schema to [blog-schema.ts](../src/lib/blog-schema.ts).
  Its 49 direct tests cover both date fields, UTC midnight, leap years and centuries, malformed
  calendar/lexical values, timestamps, numbers, null, Date objects, and update ordering.
  The full-build matrix retains invalid quoted dates, earlier updates, and unquoted YAML dates.
- Moved all five direct Mermaid renderer tests to `mermaid-render.test.mjs` and its artifact test
  to `seo-build.test.mjs`. Retained all 18 original SEO output tests, 13 harness tests, and the
  remaining integration scenarios. A source inventory found all 52 previously named tests;
  unchanged shared helper bodies and the production schema were also compared by syntax tokens.
- Failure snapshots now record the responsible suite and include its runner and both support
  sources. Harness assertions verify these copies alongside the original pre-restoration,
  cache, junction exclusion, process failure, and cleanup checks.
- Added `test:unit`, `test:markdown`, `test:output`, and `test:integration`; full validation runs each
  once, with unit tests before Astro checks and builds. The README documents prerequisites,
  boundaries, and failure replay. Updated the published article's renderer-test command.
- `pnpm validate` passed before the separately requested CR-03 revert: 79 unit/harness tests,
  24 Markdown tests, 19 production-output tests, and 28 integration tests (150 total), plus
  formatting, lint, Astro checks, and the production build. The development server stopped.
  In a separate checkout with no `dist` and an unavailable Playwright browser path, all 79 unit
  tests and both support imports passed. All 24 Markdown tests then passed there with Chromium,
  still without `dist`.

Same-machine measurements on Windows, Node 24.13.0, pnpm 12.10.0, and Astro 7.3.4:

| Isolated integration scenario | Before CR-04 | After CR-04, before CR-03 revert |
| ----------------------------- | ------------ | -------------------------------- |
| Full Astro build attempts     | 25           | 16                               |
| Full-build invalid-date cases | 12           | 3                                |
| Scenario duration             | 234.3 s      | 183.0 s                          |

Counts include expected validation rejections. The reduction is nine date builds; equivalent
and additional validation now runs against the actual schema. Timings are observations from one
successful run per version, including fixture setup and cleanup, with no timing threshold.
The subsequent icon revert is a separate user decision and is excluded from this comparison.

After the requested CR-03 revert, `pnpm validate` passed again: 79 unit/harness tests,
20 Markdown tests, 19 output tests, and 27 integration tests (145 total), with 16 integration
build attempts. The only removed coverage is CR-03's direct and live SVG reload regressions.
Formatting, lint, Astro checks, and the production build passed; the isolated server stopped.

## CR-06: Add browser tests for existing client behavior

**Review finding:** 6. **Classification:** Test coverage. **Severity:** Medium.
**Ease:** Moderate; native event ordering and isolation matter.
**Dependencies:** Reuse CR-04's fixture support. Complete this before CR-09 when practical.
**Status:** Implemented.

### Problem and decision

The current output tests and fake-timer popover tests provide useful coverage, but they do not run
native Popover API behavior, focus and `inert`, browser history, PhotoSwipe lifecycle events, or the
Clipboard API. Those are the behaviors most likely to be missed by a DOM-shaped mock.

Add a small browser suite using the existing Playwright library and Node test runner. Keep the fast
timer tests for their current logic coverage. No additional browser-test framework is needed.

### Implementation

1. Add focused gallery and blog-controls browser test files, plus a `test:browser` script using
   the existing Node runner. Reuse the isolated fixture support rather than depending on a human's
   development server or duplicating a second checkout/process-management framework.
2. Start a fresh Astro background server for the suite with private caches and the actual translated
   components. Use a minimal content fixture when it makes the behavior more deterministic.
3. Cover gallery opening, slide navigation, Escape and close-button dismissal, browser Back/Forward,
   and a quick Forward action while the previous dialog is closing. Assert selected image state,
   restoration of focus and scroll, modal focus containment, restoration of `inert`, and preservation
   of pre-existing history fields. Exercise reduced-motion behavior and the asset-load failure
   fallback to the original image link.
4. Cover native type popovers: keyboard focus, mouse entry, transfer to popup hover, delayed dismissal,
   rapid movement between triggers, Escape/native dismissal, scrolling, and touch interaction.
   Assert open state, active target, and focus behavior using actual browser events.
5. Cover successful copying of exact source text, repeated clicks while copying is in flight,
   clipboard rejection, localized status messages, and the reset to idle. Exercise the existing
   unsupported-Clipboard-API behavior as well. Use real clipboard permissions for success and a
   narrow browser fixture override for deterministic rejection.
6. Use stable semantic selectors and state/event-based waits. Keep browser contexts independent,
   close them reliably, stop the server, and retain useful diagnostics for unexpected failures.
7. Add the suite to full validation and document the Chromium prerequisite using the project's
   existing installation command.

Current Twoslash JSDoc is emitted as plain text. Testing focusable links inside a popup would require
a separately supported content case; this ticket does not introduce rich-link rendering or treat
that conditional limitation as a defect in the current articles.

### Acceptance criteria

- [x] The tests exercise the actual gallery and blog client modules in Chromium.
- [x] The suite catches regressions in history, focus, `inert`, popover event order, and clipboard state.
- [x] Both interface languages are represented where labels or controls differ.
- [x] Existing fake-timer tests remain fast and continue to run independently.
- [x] Tests make behavioral assertions without screenshots, pixel comparisons, or design changes.
- [x] Failure and success paths clean up their browser contexts and background server.
- [x] No test framework or production dependency is added.

### Validation

Run `test:browser` and the existing popover/unit tests. Check the suite's isolation by running it twice
and by forcing one fixture failure to verify shutdown and diagnostics. Run full validation once the
new suite is wired into it; use its gallery cases again when implementing CR-09.

Completed on 8 October 2026:

- Added focused gallery and blog-controls suites using the existing Playwright library and Node
  runner. The browser helper reuses CR-04's fixture, subprocess, and snapshot functions. Each suite
  owns a fresh background server with private caches; each case owns a separate browser context.
- Gallery cases cover both languages, reduced-motion keyboard opening, navigation and image state,
  Tab containment, inert restoration including a previously inert element, focus/scroll restoration,
  unrelated history fields, Back/Forward, and Forward before the closing dialog is destroyed.
  Aborted CSS and module requests verify original-image fallbacks; disabled JavaScript verifies
  the ordinary image links. No production code or visual styles changed.
- Blog cases cover real clipboard permissions and exact Unicode/markup/backslash content,
  localized success/error/idle states, pending repeated clicks and reset replacement, retries,
  unsupported Clipboard API, keyboard and pointer popovers, light dismissal, native hide/toggle,
  popup/page scrolling, resize, and touch input. Only deterministic clipboard failure/pending
  behavior is overridden. Playwright's clock controls deadlines in the real browser DOM.
  Windows clipboard CRLF is normalized only at the round-trip assertion boundary.
- Added test:browser to full validation and documented Chromium setup, test boundaries, and
  diagnostics. Snapshots include browser version/events, last URL, HTML, and the browser helper;
  existing harness assertions also verify additional support-source copies.
- test:browser passed independently and again during full validation (22 tests). All 79 fast
  unit/harness tests remain independent. A forced assertion failure preserved its runner/helper,
  browser console error, and HTML; its context closed, server process exited, lock disappeared,
  and snapshot excluded the dependency junction.
- Full pnpm validate passed: 79 unit, 20 Markdown, 19 output, 22 browser, and 27 integration tests
  (167 total), formatting, lint, Astro checks, and production build. A final Astro check reported
  zero errors, warnings, or hints. All fixture servers stopped; source hashes confirm no production
  changes, including the fixed code icons retained by the CR-03 decision.

## CR-07: Organize the Markdown pipeline and make Mermaid source explicit

**Review findings:** 7 and 8. **Classification:** Readability / placement / hidden coupling.
**Severity:** Medium. **Ease:** Moderate to substantial; output and transform order are sensitive.
**Dependencies:** Use CR-04's separated suites; preserve the fixed icon loading retained by the CR-03 decision.
**Status:** Implemented.

### Problem and decision

The code-block transformer combines metadata parsing, escape correction, copy-source extraction,
line numbering, popup conversion, header construction, and final wrapping in one rendering hook.
The Mermaid factory combines asset preparation, AST discovery, browser setup, rendering, SVG
processing, and insertion. Mermaid definitions are obtained by searching for a copy button and
reading `dataCopyCode`, which couples build-time rendering to a browser-facing control.

Keep this code in `lib`, grouped under `src/lib/markdown`. Extract a small number of private,
semantic stages and give Mermaid a direct build-time source contract. Retain the existing static
rendering stack and its automatic Markdown authoring workflow.

### Implementation

1. Move `src/lib/shiki/code-block.ts` to `src/lib/markdown/code-block.ts` and
   `src/lib/mermaid.ts` to `src/lib/markdown/mermaid.ts`. Update Astro configuration, direct tests,
   documentation, and any other consumers. Remove the old empty folder instead of keeping re-export
   compatibility files.
2. Audit relative asset, translation, and project-root URLs after the move. In particular, Mermaid's
   root and global CSS URLs currently assume that its file sits directly in `src/lib`. Preserve its
   normalized article-relative identifiers and registered font/CSS watch files.
3. Make the code-block hook read as a sequence of meaningful operations. Useful private boundaries
   include block options, escaped notation correction, copied source, line numbering, type popovers,
   and the final code/diagram wrapper. Extract when the function names explain a real stage; keep
   straightforward AST literals and one-use small operations close to their consumer.
4. Group the Mermaid factory into asset preparation, block/source discovery, browser rendering, and
   result insertion. Keep `page.evaluate` code self-contained: its browser functions cannot capture
   Node-side helpers or module variables unless values are passed as serializable arguments.
   Maintain visible browser lifetime management and file/diagram-specific errors.
5. Put the original Mermaid definition directly on its intermediate figure node, for example as a
   `dataMermaidSource` HAST property. Document the producer in `code-block.ts` and consumer in
   `mermaid.ts`. Use this explicit property as the renderer input; stop searching copy controls.
6. Consume and remove that build-only source property through the existing HAST mutation API before
   final HTML emission. Keep the visible source disclosure and `dataCopyCode` for actual copying.
   A short, local contract is sufficient; no generic AST metadata registry is required.
7. Add a regression demonstrating that diagram generation still works when the copy control is
   absent or changed, provided the source contract is present. Cover quotes, markup-like characters,
   backslashes, Unicode, and multiline definitions, plus a helpful missing-source error.
8. Update the README description of the Markdown processing stages and coordinate the final file
   map with CR-12. Keep only the entry points required by Astro and existing consumers exported.

### Acceptance criteria

- [x] Both build-time Markdown processors live under `src/lib/markdown` with working imports and URLs.
- [x] A reader can identify the rendering stages without tracing a generic helper framework.
- [x] Mermaid rendering has no dependency on copy-button markup or `dataCopyCode` extraction.
- [x] Final HTML contains no redundant build-only Mermaid source attribute.
- [x] Copied code, title escaping, Diff, Highlight, notation escapes, Twoslash, and line numbers
      retain their documented behavior and composition.
- [x] Diagram IDs and internal SVG references remain deterministic and unique, and diagrams retain
      their accessible names, static SVG output, source disclosure, and error context.
- [x] CSS/font reloads and the existing fixed-icon tests continue to pass after the file move.
- [x] Mermaid/ELK code stays out of browser bundles, and no dependencies are added.

### Validation

Run code-block and Mermaid renderer tests, including the new source-contract regressions. Run the
live CSS edit case, Astro checks, and a production build. Run artifact checks for both article
interfaces, exact copy text, diagram count/references, and absence of Mermaid/ELK client bundles.
Compare representative generated HTML structurally; class names and page design are preserved.

Completed on 8 October 2026:

- Moved both processors to `src/lib/markdown`; removed the old files and empty `shiki` folder.
  Updated Astro imports, README, and both published article examples. Corrected Mermaid's
  project-root, CSS, and translation URLs; code-icon asset URLs retain their original depth.
- Extracted private code-block stages for options, notation escapes, copied source, line numbers,
  copy controls, type popovers, and diagram markup. Mermaid groups asset preparation, browser
  rendering, and insertion, with browser lifetime and contextual errors visible in the plugin.
  Browser-evaluated functions remain self-contained. Only the two original entry points are exported.
- Mermaid now reads the original definition from the figure's `dataMermaidSource` property
  and removes it using the HAST mutation API. No copy-button lookup remains. Missing or empty
  definitions identify the article and diagram before starting Chromium; Copy and source disclosure
  keep their existing behavior.
- Added regressions for removed and changed copy controls, exact multiline source with quotes,
  markup, backslashes, and Unicode, and a missing second diagram source while Copy remains present.
  Renderer and production-output checks confirm no build-only source attribute reaches HTML.
- Representative pipeline HTML, including Diff, Highlight, notation escapes, Twoslash, titles,
  line numbers, copying, and all four diagram types, is byte-for-byte identical to the saved baseline.
  Source-token comparison confirms the retained icon, asset-loader, and AST utility functions
  are unchanged; a complete source hash audit found no unrelated edits or dependency changes.
- `pnpm validate` passed: formatting, lint, Astro checks (zero errors, warnings, or hints),
  79 unit tests, 22 Markdown tests, production build, 19 output tests, 22 browser tests, and
  27 integration tests (169 total). The live CSS/font-size update and restoration passed,
  diagram IDs/references and both article interfaces passed, and all fixture servers stopped.

## CR-09: Organize gallery lifecycle logic in one gallery.ts file

**Review finding:** 9. **Classification:** Readability / placement. **Severity:** Medium.
**Ease:** Moderate; preserve event timing while clarifying responsibilities.
**Dependencies:** CR-06's native gallery behavior coverage.
**Status:** Implemented.

### Problem and decision

The gallery module, now [gallery.ts](../src/components/portfolio/gallery.ts), previously combined
a small masonry initializer with a much larger lightbox initializer covering deferred assets,
history, accessibility, focus, reduced motion, and cleanup. The former `portfolio.ts` filename
and interleaved lifecycle callbacks made the behavior harder to find and understand.

Use the selected alternative: keep these related client behaviors in one file, name it `gallery.ts`,
and organize the lightbox lifecycle with clear private functions and local groups of handlers.

### Implementation

1. Rename the module to `src/components/portfolio/gallery.ts` and update the script import in
   [portfolio-gallery.astro](../src/components/portfolio/portfolio-gallery.astro), plus references in
   tests and documentation.
2. Keep initialization, masonry, and lightbox responsibilities easy to scan. Leave the small masonry
   algorithm in this file; use its existing direct calculations and observer wiring.
3. Clarify the lightbox initializer around deferred module/CSS loading, history reading/synchronizing,
   dialog setup and focus handling, and teardown/restoration. Extract private functions where they
   remove a substantial callback block or make an event's purpose clear. Keep shared state local to
   `initLightbox`, and retain straightforward code when extraction would add indirection.
4. Preserve the important event ordering: dialog setup before focus moves, capture of the opening
   index, history updates on slide changes, history traversal on close, and synchronization after
   destruction when a quick Forward action arrives during closing.
5. Keep restoration logic visibly paired with the state it changes. Restore only the background
   elements made inert by the current opening, preserve unrelated history fields, and maintain
   the existing original-image fallback when deferred assets cannot load.
6. Update the README map in CR-12 to identify this as the browser gallery module.

### Acceptance criteria

- [x] The single client entry is `gallery.ts`; `portfolio-gallery.astro` loads it successfully.
- [x] History, modal setup/focus, asset loading, and cleanup can be understood as distinct operations.
- [x] Existing history, focus, scroll, reduced-motion, error fallback, and masonry behavior is preserved.
- [x] PhotoSwipe and its stylesheet remain deferred until needed.
- [x] State stays private and local; no controller class, new library, or additional client module is required.

### Validation

Run the gallery browser cases from CR-06, Astro checks, lint, and a production build. Verify the
no-JavaScript image links and the asset-load failure fallback. Use behavioral assertions and inspect
the import/asset loading; this ticket does not require layout or screenshot tests.

Completed on 8 October 2026:

- Renamed the single client entry to `gallery.ts` and updated the Astro import. The README
  identifies this module and its responsibilities; CR-12 can include it in the final file map.
- Named the deferred asset loader, slide-history writer, opening preparation, modal setup,
  zoom-label update, and page restoration. Kept all functions and state local to `initLightbox`,
  and grouped event registration at the end. No additional client module or dependency was added.
- Syntax-token comparisons confirm unchanged initialization, masonry, existing history helpers,
  all handler bodies, deferred loader behavior, and PhotoSwipe options. The seven event handlers
  retain their registration order. The Astro component differs only in its script import.
- All 8 gallery browser tests passed: both locales, reduced motion, navigation, modal focus,
  original inert state, focus/scroll restoration, Back/Forward, Forward during closing,
  failed CSS/core-module fallback, and image links without JavaScript. The fixture server stopped.
- Formatting, lint, Astro checks (zero errors, warnings, or hints), production build, and all
  19 output tests passed. Production bundle inspection confirms the PhotoSwipe core remains
  a dynamic import and neither gallery page eagerly loads PhotoSwipe scripts or styles.
  A full source hash audit preserves the prior ticket changes, fixed icons, and line-ending setup.

## CR-10: Use tag arrays and a discriminated blog filter type

**Review findings:** 10 and 11. **Classification:** Data modeling / developer experience / type safety.
**Severity:** Low. **Ease:** Easy to moderate; a coordinated authoring and fixture migration.
**Dependencies:** Reuse CR-04's production schema and unit suite. Preserve completed CR-02 behavior.
**Status:** Implemented.

### Problem and decision

Authors currently write tags as one comma-separated string, while collection data, Markdown
exports, RSS, and structured data use arrays. The schema and examples therefore require an extra
representation and parsing step. `BlogFilter` also represents every `value` as `string`, even though
a language filter can only contain `Locale`; the formatter compensates with `as Locale`.

Use a canonical array in authored frontmatter and a discriminated union for filters. Keep existing
tag spelling, case-insensitive deduplication/matching, readable slugs, and collision errors.

### Implementation

1. Change the production schema to accept an array of strings with `[]` as the omitted-field default.
   Normalize it with the existing `uniqueTags` helper. Preserve trimming, first-spelling retention,
   removal of empty names, case-insensitive deduplication, and authored order.
2. Migrate both real article frontmatter blocks, every integration fixture, and the schema/frontmatter
   examples in the Shiki/Twoslash article and README. Use ordinary YAML arrays or YAML lists:

   ```yaml
   tags:
     - Astro
     - TypeScript
   ```

3. Remove comma splitting and update prose explaining the previous string representation. Tags may
   now contain a comma within one array entry without becoming separate tags. Avoid retaining a
   permanent string-or-array union; all authored sources are controlled by this repository.
4. Verify that the Markdown exporter, RSS categories, structured-data keywords, and displayed tag
   labels still consume the normalized collection array. Preserve article IDs and publication dates.
5. Replace `BlogFilter` with a discriminated union: month and tag branches have `value: string`, while
   the language branch has `value: Locale`. Keep `key` and `count` shared in an obvious way, without
   introducing a generic type-construction utility.
6. Type the language count map with `Locale`. Build concrete month/language variants explicitly if
   the current combined loop loses the relationship between `type` and `value`. Two short loops
   are preferable to assertions or complex generic machinery that merely satisfies the compiler.
7. Remove `as Locale` from `formatBlogFilter` and use discriminant narrowing in consumers. Do not
   replace it with broader `as BlogFilter` assertions elsewhere.
8. Update schema and integration tests for omitted/empty arrays, invalid input types, trimming and
   case variants, an entry containing a comma, and unchanged exported arrays and filter URLs.

### Acceptance criteria

- [x] Every authored article, fixture, and current example uses array tags; string input is rejected.
- [x] Omitting tags produces `[]`; normalization and first-spelling/order behavior remain consistent.
- [x] `Astro` and `astro` share one filter, and C++/C# retain their readable, distinct routes.
- [x] RSS, Markdown, JSON-LD, and displayed tags use the same normalized values.
- [x] A language filter's value is statically restricted to `Locale` and needs no cast in its formatter.
- [x] Month and tag filtering, counts, pagination, and localized labels remain unchanged.
- [x] No compatibility parser or extra dependency is introduced.

### Validation

Run schema/filter unit tests, Astro checks, and lint. Build the migrated articles and run the RSS,
Markdown, JSON-LD, and pagination assertions with both interface languages. Check that the published
code examples still accurately describe the production schema.

Completed on 8 October 2026:

- The production schema accepts string arrays, defaults omitted tags to `[]`, and reuses
  `uniqueTags` for trimming, blank removal, case-insensitive deduplication, first spelling,
  and authored order. Commas within an entry remain part of that tag; string input is rejected.
- Migrated both published articles, integration fixtures, the README, and the Shiki/Twoslash
  article examples. Its collection and schema examples were compared with the production sources
  and match exactly. Article IDs and publication dates are unchanged.
- Language filters now carry `Locale`; explicit month/language loops retain the existing ordering
  and counts. The formatter narrows by `type` without a locale cast or another type assertion.
- Added schema cases for empty/blank arrays, comma-containing names, and invalid field/element
  types, plus a real content-loader rejection. Existing integration checks now verify the same
  normalized tags in RSS categories, Markdown exports, JSON-LD keywords, and visible labels
  in both interfaces. Readable symbol routes, case matching, and pagination remain covered.
- Corrected one browser test's pointer preparation: the cursor now leaves the overlapping popup
  before focus switches, so hiding it cannot re-hover the previous trigger. Production popup
  behavior is unchanged; the targeted suite and complete browser suite passed afterward.
- All validation checks passed: formatting, lint, Astro checks (zero errors, warnings, or hints),
  88 unit tests, 22 Markdown tests, production build, 19 output tests, 22 browser tests, and
  28 integration tests (179 total). The integration used 17 isolated builds; live CSS updates,
  failure cases, and server cleanup passed. No dependency or compatibility parser was added.

## CR-12: Make site data and locale code easy to find

**Review finding:** 12. **Classification:** Discoverability / naming / placement. **Severity:** Low.
**Ease:** Easy to moderate; mostly coordinated moves and consumer updates.
**Dependencies:** Prefer completing CR-07, CR-09, and CR-10 first so the README map is final.
**Status:** Implemented.

### Problem and decision

The flat `src/lib` directory mixes runtime logic with static personal/site facts. `config.ts` does
not identify its scope; `i18n/types.ts` also exports runtime locale values and a resolver. Names such
as `projects.lager` and `name.legal`/`name.public` need interpretation across content and metadata.

Group static site facts under `src/data`, retain executable logic under `src/lib`, rename the locale
module for its actual contents, and add a task-oriented README file map. Use explicit data filenames
as the default so career and project information can be found directly.

### Implementation

1. Use this default organization:

   | Previous file         | Target file            | Responsibility                                              |
   | --------------------- | ---------------------- | ----------------------------------------------------------- |
   | `src/lib/config.ts`   | `src/data/site.ts`     | Identity, contact/address, social links, social-image facts |
   | `src/lib/career.ts`   | `src/data/career.ts`   | Jobs and the derived `CareerId` type                        |
   | `src/lib/projects.ts` | `src/data/projects.ts` | Project IDs, links, metrics, and their dates                |
   | `src/i18n/types.ts`   | `src/i18n/locales.ts`  | Supported/default locales, `Locale`, and locale resolution  |

2. Keep named exports and direct imports. The existing `siteConfig`, `jobs`, `projects`, `CareerId`,
   `locales`, `Locale`, `defaultLocale`, and `resolveLocale` APIs need no additional facade.
   Keep structured-data generation in `src/lib`; it is executable logic, not static content.
3. Rename `projects.lager` to `projects.stockSync` consistently in facts, both translation dictionaries,
   components, llms.txt generation, structured data, and tests. Rename `siteConfig.name.legal` to
   `siteConfig.name.full` and `siteConfig.name.public` to `siteConfig.name.brand` across consumers.
   Preserve the actual names, project DOM IDs, URLs, translation text, and metadata semantics.
4. Update all imports, including Astro configuration and content/schema modules that execute outside
   ordinary page rendering, type-only translation imports, direct Node test imports, and article
   examples referring to the old locale path. Remove old files instead of adding compatibility barrels.
5. Add a README section answering concrete maintenance questions with the actual final paths:
   where to edit personal/contact facts, career history, project metrics, translations and supported
   locales, blog frontmatter/schema/tag rules, Markdown transformations, gallery behavior, and tests.
   Distinguish source data from formatting/behavior functions, and include a small folder map.
6. Explain the grouping decision briefly in that section. Keep route wrappers and existing small
   translation helpers direct; the move does not require a broad application architecture rewrite.

### Considered merge option

The three current fact modules together contain roughly 120 lines, so merging their named exports
into one `src/data/site.ts` is a reasonable alternative if fewer files materially improve maintenance.
It would keep all site facts in one place while preserving private/runtime logic elsewhere.

The default is three files inside one folder: `career.ts` and `projects.ts` advertise their contents
without needing the README first. A merge is worthwhile if those facts are usually edited together
and clear sections make them equally easy to locate. If that option is chosen, record the choice and
map all three editing tasks to the merged file in the README. Do not create both a merged source and
separate facade files, or add a `data/index.ts` barrel solely to conceal the organization.

### Acceptance criteria

- [x] Static facts have one authoritative source under `src/data`; runtime behavior stays in `lib`.
- [x] The locale filename describes its runtime and type exports.
- [x] `stockSync`, `name.full`, and `name.brand` are used consistently without changing public values.
- [x] Imports and current code examples reference existing final paths, with no compatibility layer.
- [x] A new contributor can locate each listed editing task from the README map.
- [x] The chosen folder/merge organization is explained and avoids duplicated facts or indirection.

### Validation

Search the repository for old import paths and renamed property references, distinguishing any
intentional historical prose from active code/examples. Run Astro checks, lint, and the affected unit
tests, then build and run metadata, project, career, RSS/Markdown, and localization assertions.
Validate every file link in the new README map against the actual organization.

Completed on 8 October 2026:

- Used the default three-file organization: `src/data/site.ts`, `career.ts`, and `projects.ts`.
  Renamed `src/i18n/types.ts` to `locales.ts`. Kept named exports and direct imports, removed
  the old files, and retained structured-data generation and other executable logic in `lib`.
- Renamed the internal keys to `name.full`, `name.brand`, and `projects.stockSync` in facts,
  translations, components, metadata/export endpoints, and tests. Source comparisons confirm
  unchanged actual names, contacts, URLs, IDs, metrics, dates, career records, and translated copy.
  The locale module and career source are unchanged apart from their file locations.
- Updated imports in Astro configuration, collection/schema code, both translation dictionaries,
  page/components, type-only helpers, and direct Node tests. Both production examples in the
  published Shiki/Twoslash article match their source, including the final locale filename.
- Added the task-oriented README map and compact folder overview. It identifies personal facts,
  career/project data, translations/locales, blog content/schema/tag rules, processing functions,
  Markdown stages, gallery behavior, and tests, and explains why the facts have three direct files.
  All 28 README file/directory links resolve; the source inventory has exactly the four moves.
- A complete 137-source audit found only intended path/key changes, their formatting, and the
  README addition. Previous ticket work, fixed icons, line endings, and dependencies are preserved.
  Production output retains the same 256 files: 253 are byte-for-byte unchanged; the other three
  differ only in the published article's locale filename, in HTML for both interfaces and Markdown.
- `pnpm validate` passed: formatting, lint, Astro checks (zero errors, warnings, or hints),
  88 unit tests, 22 Markdown tests, production build, 19 output tests, 22 browser tests, and
  28 integration tests (179 total). The 17 isolated builds, live CSS update/restoration,
  native gallery/copy/popover behavior, metadata, career/project facts, localized exports,
  failure handling, and server cleanup passed. `git diff --check` passed as well.

## Closed findings

### CR-02: Readable, stable tag URLs

**Status:** Implemented.

The hash fallback has been removed. Capitalization variants such as `Astro` and `astro` share one
filter and count once per post. C++ and C# produce `tag-cplusplus` and `tag-csharp`; the small character
lookup also handles `&`, `@`, and `ß`. The first spelling is retained for labels, and non-Latin letters
are preserved. Remaining collisions and names without a readable slug raise explicit build errors.

Sources: [blog-tags.ts](../src/lib/blog-tags.ts), [blog-filters.ts](../src/lib/blog-filters.ts), and
[content.config.ts](../src/content.config.ts). Validation completed: 32 blog tests, 37 selected
pagination/integration checks, lint, Astro checks, formatting of changed files, and a production build.
CR-10 preserves these semantics with authored tag arrays.

### CR-13: Development-server workflows

**Status:** Closed by clarification; no implementation work required.

[AGENTS.md](../AGENTS.md) instructs LLM agents to use background mode. `pnpm dev` and the VS Code launch
configuration serve interactive human development, where foreground mode is appropriate. These
workflows are intentional. The tickets do not change the human development command or launch setup.
