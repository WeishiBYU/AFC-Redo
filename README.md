# Carpet Cleaning Booking Form — Build Plan

Planning checklist for a customizable, Bootstrap-based booking form that can be dropped into other sites via templates (no-code customization). Target embed is a static site; allow CDN Bootstrap. Templating will be JSON config + prebuilt templates; pricing will live in an easily editable JSON file.

## Goals
- Create a responsive booking form for a carpet cleaning company.
- Use Bootstrap for layout, spacing, and components (no custom CSS dependency for core layout).
- Ship as a templated embed so non-developers can adjust text, colors, pricing, and options without code.

## Assumptions / Questions
- Embedding on a static site; scripts/styles from CDN are allowed (confirm any size/call limits).
- Templating: JSON config + prebuilt templates for no-code edits.
- Form processing endpoint available, or include a lightweight serverless handler (email + optional CRM/webhook)?
- Payment is conditional (only if customer agrees); integration will be added later.
- Service area validation needed (zip/postal check)?
- Scheduling requires live availability slots (backend integration hook needed).

## Five-Step Flow (draft)
- Step 1: Quote Estimator — select services, room counts, add-ons; live estimate from pricing JSON.
- Step 2: Additional Information — special instructions, access notes, pets, parking, stairs, stains.
- Step 3: Scheduling — date picker + live availability slots from backend API (with fallback if no slots).
- Step 4: Your Information — contact details and address; service area check via zip/postal hook.
- Step 5: Review & Confirm — summary; conditional payment prompt if customer opts in (integration added later).

## Layout Details — Step 1: Quote Estimator
- Structure: Accordion per category (e.g., CARPET CLEANING, UPHOLSTERY CLEANING, IN-HOME AREA RUG CLEANING), templated for consistent formatting.
- Inside each accordion: a table with rows = item types in the category; columns = Quantity, Protect (yes/no slider), Deodorize (none/mild/heavy selector).
- Responsive rule: on phone ratio, table columns collapse into nested accordions per row with the item name as header, exposing Quantity/Protect/Deodorize controls inside.
- Template guidance: build accordion/table via a shared template partial so all categories render uniformly from JSON config (categories, items, and option choices).
 - Categories & items: flexible list via JSON; include CARPET CLEANING with rooms by default as sample data.
 - Quantity control: numeric input with attached steppers (min 0); compact, attached controls for better scaling.
 - Protect control: slider (Off by default); enabled only when Quantity > 0.
 - Deodorize: options none/mild/heavy.
 - Pricing display: show per-line price and line total; on mobile, show only total in a sticky footer with an expand button for itemization.
 - Responsive behavior: nested per-row accordions are acceptable when columns collapse on mobile.
 - Minimum: enforce $250 minimum in the right summary even on this step.

### Implementation Plan — Quote Estimator
- Data schema (JSON, draft)
	- `categories[]`: id, label, description, items[].
	- `items[]`: id, label, unit (room), basePrice (placeholder), minQty=0, maxQty (optional), protectEnabled=true/false, deodorizeOptions=["none","mild","heavy"].
	- `ui`: currency symbol, copy strings, minTotal=250.
- Template structure (Bootstrap)
	- Accordion wrapper (per category) → table header row (Quantity | Protect | Deodorize) → body rows templated from `items[]`.
	- Row controls: input group with steppers for quantity; slider for Protect (disabled when qty=0); select for Deodorize.
	- Mobile: on small screens, render per-row accordion showing the three controls stacked; keep consistent partial for both modes.
- Behaviors
	- Disable Protect and Deodorize until qty > 0.
	- Update right summary on every change; show subtotal and $250 minimum logic (if total < 250, show “Minimum $250 — balance to minimum: $X”).
	- Sticky mobile footer: shows only total at bottom of screen with an upward-opening accordion to reveal full itemization; desktop shows full line items in right column.
	- Validation: require at least one item with qty > 0 to proceed.

### Pricing Conversation Notes (to finalize later)
- Need rules for base prices per item, protect add-on pricing, deodorize option pricing, and any condition multipliers.
- Clarify if protect/deodorize are flat per item, per quantity, or percentage-based.
- Define tax/fees and how the $250 minimum interacts with discounts or fees.

## Layout Details — Step 2: Additional Information
- Conditional display: questions shown based on selections in Quote Estimator (e.g., only show pre-vacuuming prep if carpet cleaning selected).
- Controls: templated dropdowns (all required) for Pet Urine, Pre-Vacuuming Prep (carpet cleaning only), and Stain Treatment.
- Free text: optional textarea for Special Instructions / Additional Details.
- Template guidance: drive question visibility and options from JSON; keep dropdown styling consistent via shared partial.

## Layout Details — Step 3: Scheduling
- Calendar for date selection; time slots load based on selected date.
- Slots are fetched from backend; frontend will show available times for that date (fallback state if none returned).
- Keep simple for now; will finalize slot API contract after frontend scaffold is built.

## Layout Details — Step 4: Your Information
- Inputs: First Name, Last Name, Email, Phone, Service Address (street, city, state, zip).
- Attendance question: “Will the paying party be there to let us in on the day of the appointment?” If no, flag that pre-payment is required.
- Payment field: capture payment preference/placeholder (integration later), shown or required based on attendance answer.
- Special Instructions: textarea for notes relevant to entry/logistics.

## Layout Details — Step 5: Review & Confirm
- Simplified summary of all prior inputs (services/quantities/options, additional info answers, selected date/slot, contact/address, attendance/payment flag).
- Edit affordances: allow jumping back to a step to change details.
- Final acknowledgments: include any terms/estimate disclaimer and consent checkbox.
- CTA: Confirm/Submit (payment prompt appears only if previously opted and required).

## Cross-Step Layout Elements
- Top progress bar: segmented to show each step; filled/colored when a step is complete.
- Right-side quote summary: lists selected services and add-ons with line-item prices and running total; enforce a $250 minimum until exceeded.

## Build Checklist (with checkpoints)
- Requirements
	- [ ] Confirm embedding environment constraints (allowed scripts, inline styles, external assets). **Checkpoint**: clear list of allowed assets and size limits.
	- [ ] Define required fields: contact info, address, service types, room counts, add-ons, date/time preference, notes. **Checkpoint**: frozen field list + validation rules.
	- [ ] Live availability flow confirmed (slot-based). **Checkpoint**: chosen scheduling flow.
	- [ ] Conditional payment behavior defined (only if customer agrees; integration later). **Checkpoint**: payment decision + provider if applicable.
- Architecture
	- [ ] Templating strategy: JSON config + prebuilt HTML templates. **Checkpoint**: template schema approved.
	- [ ] Define configuration surface: brand colors, logo, copy, pricing tiers, add-on list, time windows, CTA labels. **Checkpoint**: config spec documented.
	- [ ] Decide hosting of config (inline JSON, remote JSON). **Checkpoint**: config source finalized.
	- [ ] Pricing stored in a dedicated JSON file for easy edits; document schema. **Checkpoint**: pricing file schema approved.
- UI/UX (Bootstrap)
	- [ ] Layout using Bootstrap grid, cards, form controls; ensure mobile-first. **Checkpoint**: wireframe approved.
	- [ ] Component set: progress indicator, step navigation (if multi-step), summary sidebar, alerts/toasts. **Checkpoint**: component list locked.
	- [ ] Accessibility: labels, aria attributes, focus order, color contrast, keyboard nav. **Checkpoint**: a11y acceptance.
	- [ ] Validation UX: inline errors, required markers, phone/email masks. **Checkpoint**: validation behaviors signed off.
- Data & Pricing
	- [ ] Define service catalog: room types, area-based pricing, add-ons (stain treatment, deodorizing, upholstery). **Checkpoint**: catalog + pricing table.
	- [ ] Add tax/fees rules if needed. **Checkpoint**: pricing math approved.
	- [ ] Estimate calculator updates summary in real time. **Checkpoint**: calculator outputs validated against examples.
- Scheduling
	- [ ] Live availability slots: frontend slot UI fed by backend endpoint (define contract). **Checkpoint**: slot API contract approved.
	- [ ] Blackout dates/lead time rules. **Checkpoint**: rule set agreed.
	- [ ] Service area: zip/postal validation or map radius. **Checkpoint**: serviceable areas documented.
- Integrations
	- [ ] Submission transport: email, webhook/CRM, or serverless API. **Checkpoint**: endpoint details obtained.
	- [ ] Conditional payment: shown only if customer opts in; integration (Stripe/PayPal) added later. **Checkpoint**: provider and opt-in flow defined.
	- [ ] Confirmation flows: email/SMS receipts, on-page confirmation. **Checkpoint**: confirmation templates approved.
- Templates & Theming
	- [ ] Build a JSON-driven template for copy, colors, logos, services, and pricing. **Checkpoint**: sample config works end-to-end.
	- [ ] Expose CSS variables for branding (primary/secondary, accents, button styles) while relying on Bootstrap base. **Checkpoint**: theming verified across two sample brands.
	- [ ] Provide embeddable snippet (script + target div) that reads remote/local config. **Checkpoint**: embed tested on a blank CMS page.
- Quality & Ops
	- [ ] Form validation tests (happy paths + edge cases). **Checkpoint**: test matrix passed.
	- [ ] Responsive testing at common breakpoints. **Checkpoint**: screenshots/devices signed off.
	- [ ] Performance: ensure minimal bundle, defer non-critical assets. **Checkpoint**: size budget met.
	- [ ] Analytics hooks (optional): conversions, drop-off per step. **Checkpoint**: event map agreed.
	- [ ] Handoff: docs for operators to change config without code. **Checkpoint**: admin guide delivered.

## Deliverables
- Bootstrap-based form markup/components (single- or multi-step) with accessible validation.
- Templating layer (likely JSON + precompiled templates) enabling copy/branding/pricing changes with no code edits.
- Embed snippet + configuration examples for at least two brand variations.
- Integration guide for submission endpoint and optional payment.
- Operator guide for non-technical updates.

## Next Inputs Needed
- Confirm payment provider (Stripe/PayPal) and exact opt-in rule for conditional payment.
- Provide service catalog, pricing rules, and service areas.