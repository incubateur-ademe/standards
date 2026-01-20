# .ai — Architecture & Agent Notes

This folder contains architecture documentation meant to be consumed by humans and coding agents.
Goal: enable fast onboarding and consistent implementation decisions.

## What this product is
An internal application to help incubator startups track compliance with quality standards per phase.
- Standards are defined as a list of measurable actions.
- The current phase of a startup determines which standards/actions must be tracked.
- The unit of truth is the **Action** (per startup).
- Review discussions are attached to **actions**.
- Snapshots are immutable and self-sufficient.

## External dependencies
Startup identity, membership, and phase are sourced from an external incubator API.
Locally, we store a minimal shadow representation (StartupShadow) for integrity and history.

## How to use these docs
Start with `AGENT.md` (index + reading order), then:
- `00-context.md` for product intent
- `10-domain-model.md` for the conceptual model
- `20-bounded-contexts.md` for DDD-lite boundaries
- `30-data-model-prisma.md` for Prisma model intent
- `40-cqrs-server-actions.md` for how mutations/queries are implemented in Next.js
- `60-eager-init.md` and `70-snapshots.md` for the key flows

## Conventions
- Commands = Server Actions (mutations), always validate + authorize server-side.
- Queries = read-model functions (RSC or GET routes), no mutations.
- Snapshots are immutable.
- Prefer soft delete for user-generated content (proofs/comments).
- Avoid adding workflow complexity (approvals, states) before observing usage.
