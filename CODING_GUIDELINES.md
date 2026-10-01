# Coding Guidelines

These guidelines define the preferred approach to designing and writing code in
this repository.

The goal is not to minimize lines of code. The goal is to minimize unnecessary
complexity, concepts, indirection, and maintenance cost while keeping the code
easy to understand and change.

## KISS — Keep It Simple

Prefer the simplest implementation that clearly solves the current problem.

### Prefer directness

Prefer direct and locally understandable code over unnecessary indirection.

Do not introduce wrappers, helper chains, additional layers, or delegation unless
they make the resulting code meaningfully easier to understand or maintain.

### Keep related logic together

Keep cohesive logic close to where it is used.

Do not split a simple operation across multiple functions, files, classes, or
modules merely to make individual functions shorter.

Extract code when the resulting boundary has meaningful semantic value, hides
real complexity, represents a reusable concept, or materially improves
maintainability.

### Make abstractions earn their existence

Every abstraction introduces another concept, name, API, and level of
indirection.

Introduce an abstraction only when the complexity it removes or contains
outweighs the complexity it adds.

Be willing to inline an existing abstraction when the direct implementation is
easier to understand.

### Use context when naming

Use the shortest name that remains clear and unambiguous in its scope.

Do not repeat information that is already obvious from the surrounding function,
module, type, parameters, or control flow.

Increase descriptiveness as scope and visibility increase.

Use familiar abbreviations such as `id`, `db`, or `url` where they are
unambiguous, but do not invent obscure abbreviations merely to shorten names.

### Prefer obvious control flow

Prefer straightforward and predictable control flow over clever or overly
compact constructs.

Optimize for readability and local reasoning rather than minimum line count.

### Keep APIs and visibility small

Only expose, export, parameterize, or configure behavior that is currently
needed.

Prefer private and local implementations until a wider API is justified by an
actual consumer.

### Prefer existing solutions

Before introducing a new abstraction, utility, dependency, or architectural
pattern, check whether the language, framework, standard library, or existing
codebase already provides a suitable solution.

Prefer established project patterns when multiple approaches are equally valid.

### Treat dependencies as complexity

Every dependency expands the amount of code and behavior that can affect the
system.

Add dependencies only when their concrete benefit outweighs the additional
complexity and maintenance cost.

## YAGNI — You Aren't Gonna Need It

Implement what is required now, not what might be required later.

### Focus on the present

Speculative features cost time during implementation, testing, and future
maintenance without providing immediate value.

Do not implement hypothetical requirements before they become concrete.

### Avoid speculative extensibility

Do not introduce interfaces, factories, plugin systems, configuration options,
generic mechanisms, hooks, strategies, or extension points solely because they
might become useful later.

Introduce them when an actual requirement demonstrates the need.

### Avoid premature generalization

Similar-looking code does not necessarily represent the same concept.

Prefer small and obvious duplication over a premature or incorrect abstraction.

Extract shared behavior once a stable shared concept has emerged rather than
merely because two pieces of code currently look similar.

### Do not build unused capabilities

Do not add parameters, properties, methods, flags, overloads, configuration,
events, or code paths that have no current consumer.

Remove obsolete or unused code instead of keeping it for a hypothetical future
use.

### Avoid speculative optimization

Do not add performance complexity based only on assumptions.

Optimize when performance is a concrete requirement or measurements demonstrate
a meaningful problem.

### Keep the code easy to change

YAGNI is not an excuse for poor structure or technical debt.

Refactoring that makes current code clearer, safer, and easier to change is
valuable even when it does not add functionality.

Prepare for future requirements by keeping today's code easy to modify, not by
implementing guessed future requirements.

## Decision rule

When multiple implementations satisfy the current requirements equally well,
prefer the one with:

- fewer concepts,
- fewer layers and indirections,
- less public surface area,
- fewer dependencies,
- simpler control flow,
- and less speculative flexibility.

Do not apply these guidelines mechanically.

A more complex solution is justified when the current requirements actually need
that complexity.
