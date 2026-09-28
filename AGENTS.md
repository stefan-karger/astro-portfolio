## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Architecture

This is a small, mostly static Astro website. Keep the architecture proportional to
the size and complexity of the project.

Prefer Astro, HTML, and CSS capabilities over client-side JavaScript where possible.
Only introduce client-side state, hydration, or additional libraries when the
required behavior needs them.

Prefer Astro's built-in features and existing project utilities before introducing
custom abstractions or dependencies.

## Coding Guidelines

When writing, modifying, or refactoring code, follow [CODING_GUIDELINES.md](CODING_GUIDELINES.md).
