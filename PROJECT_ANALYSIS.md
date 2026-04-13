# Project Overview

This is a static front-end dashboard for a canteen financial management system built with HTML, CSS, and Vanilla JavaScript. The app uses localStorage as its data persistence layer, with pages for login, dashboard, daily reports, entry creation, and report viewing. Monthly reports have UI markup but no functional storage or interaction logic, and yearly reporting is currently a placeholder.

---

# Completed Features

- Login UI with client-side validation, hardcoded credential check, "remember me" logic, and redirect to dashboard.
- Sidebar navigation for Dashboard, Daily, Monthly, Yearly pages, plus a working logout link that clears storage and redirects to login.
- Dashboard page loads saved reports from `localStorage` and renders summary cards and a Chart.js bar chart.
- Daily reports page displays report summary cards, a table of saved daily reports, and a view action that stores selected report ID.
- Entry page supports dynamic row creation for cash sales, purchases, consignment, salary breakdown, and remarks.
- Entry form recalculates totals live on input/change and saves new reports to localStorage.
- View page reads selected report data and renders a detailed report summary with salary breakdown.
- Modals for adding entries, delete confirmation, save success, and delete success appear to be implemented.
- CSS includes custom theming, responsive media queries, and polished UI styling across pages.

---

# Pending / Incomplete Features

- `src/pages/yearly.html` contains only sidebar and header; main reporting content is missing.
- `src/pages/monthly.html` has static table UI and filters, but no JavaScript logic for filtering, exporting, printing, or loading dynamic data.
- Daily table edit/delete buttons are rendered disabled and do not perform actions.
- `view.html` edit/delete buttons are disabled and not wired to any logic.
- `src/js/entry.js` contains `saveFormData()` as a no-op placeholder.
- Sidebar collapsed state is stored in `localStorage`, but restoration is commented out and not active.
- The login page is not using a semantic `<form>` element and relies on a button click event.
- `src/js/form-utils.js` exports reusable utilities but is unused in the current static asset setup.
- `package.json` includes `dotenv` even though the repository appears to be a purely static front-end project.
- Some pages contain hardcoded dates and static values, reducing real dynamic behavior.

---

# Code Issues & Observations

## HTML / Accessibility

- `index.html` uses a div with `role="form"` instead of a native `<form>` element, which weakens semantic form behavior.
- `entry.html` uses inline `onclick="history.back()"`; this is inconsistent with the rest of the JS event handling.
- Dynamic input rows in `entry.html` have no associated `<label>` elements for screen readers, making them inaccessible.
- Several headers and buttons are well-labeled, but some modals lack `aria-describedby` and could be improved for accessibility.
- `view.html` and `daily.html` rely on query parameters/localStorage but do not provide fallback guidance if no report is found.
- `role="button"` is applied to anchor elements used for navigation; this is not necessary for native links.

## JavaScript Structure

- Duplicate logic exists across files: `escapeHtml`, `parseAmount`, `formatPeso`, and report parsing are implemented in multiple scripts.
- `src/js/form-utils.js` is not imported or referenced anywhere; it is effectively dead code.
- `saveFormData()` in `src/js/entry.js` is defined but intentionally empty, which is a sign of partial implementation.
- `sidebar.js` stores collapsed state but does not restore it on page load.
- Many event listeners query the DOM repeatedly instead of caching elements, e.g. `document.querySelectorAll('.btn-add-entry')` and repeated calls inside handlers.
- Edit/delete action buttons in `daily.js` are rendered as disabled placeholders, indicating missing feature wiring.
- `localStorage` is used for persistence with no error handling for storage quotas or invalid data beyond JSON parsing fallback.

## CSS Organization

- `fonts.css` is imported repeatedly from every page-specific stylesheet (`dashboard.css`, `daily.css`, `entry.css`, `view.css`, `monthly.css`). This duplicates the same global font loading rule.
- Global resets and utility styles are duplicated across stylesheets (`box-sizing`, import of fonts, root variables), which increases maintenance cost.
- `view.css` contains duplicate selector blocks for `.report-header-flex` and duplicate `:root` definitions.
- `monthly.css` sets `.report-table-container { height: 100vh; }`, which can cause overflow issues inside a page layout.
- `dashboard.css` references `.sidebar-collapsed` styles, but the state restoration is disabled in JS.
- The `.admin-badge` class exists in CSS but is not used anywhere in HTML.
- `button` classes like `.btn-export` and `.btn-print` have no matching JavaScript behavior in `monthly.html` or `view.html`.

## Unused / Redundant Code

- `src/js/form-utils.js` is unused.
- `saveFormData()` in `src/js/entry.js` is a placeholder and not functional.
- `src/css/fonts.css` is loaded multiple times unnecessarily.
- `package.json` dependency `dotenv` is irrelevant for a client-side only project.
- The login page has no form wrapper, so browser default form semantics are unused.
- Some CSS selectors and variable definitions are not referenced by the current HTML.
- `yearly.html` is effectively an unimplemented page.

## Project Structure & Dependencies

- The project is mixed between top-level root pages and nested `src/pages/*`; this makes references brittle and relative paths complex.
- There is no build tooling or bundling present, despite `package.json` existing.
- The repository still contains `src/dbms/canteen.sql`, which is unrelated to the front-end implementation.

---

# Recommendations

## UI / UX Improvements

- Implement the missing Monthly and Yearly report behaviors: filtering, printing, exporting, and dynamic report loading.
- Enable edit/delete actions on daily reports and wire them to `entry.html` or inline editing.
- Replace inline event handlers with consistent JS bindings and use semantic `<form>` markup for login.
- Add visible empty-state messages or guidance when no report is available on the View page.
- Improve mobile layout by avoiding `height: 100vh` on page containers and ensuring the sidebar collapses cleanly on small screens.

## Code Maintainability

- Consolidate shared utilities into a single `src/js/utils.js` and remove duplicate helper implementations.
- Either integrate `src/js/form-utils.js` as a real module or delete it if unused.
- Centralize global CSS rules into one base stylesheet and avoid importing `fonts.css` multiple times.
- Remove `package.json` or clean unnecessary dependencies if the app is intended to remain static-only.
- Standardize page layout and sidebar markup using a shared partial/template strategy if the project is to grow.

## Performance

- Cache frequently used DOM queries instead of repeated `document.querySelector` calls inside event handlers.
- Avoid `innerHTML` re-rendering of large tables if the data set grows; use incremental DOM updates or templating.
- Remove unused CSS and JS files to reduce load size.
- For Chart.js, consider lazy loading the library only on Dashboard page if that is the only use.

## Responsiveness

- Add mobile-first responsive rules for the entry form grid and report table layouts.
- Ensure the sidebar collapse state is applied immediately on load so mobile users do not see jank.
- Make form controls full-width inside narrow screens and stack filter controls vertically.
- Fix `monthly.css` container height handling so content can scroll naturally instead of forcing viewport height.

## Accessibility

- Use `<form>` for login and ensure all inputs have matching `<label for="...">` pairs.
- Give dynamic input rows an accessible name via hidden labels or `aria-label` when the UI creates them programmatically.
- Add `aria-describedby` to modal dialogs and ensure dialogs trap focus if possible.
- Avoid disabled buttons without visible explanation, or hide them until the feature is available.
- Ensure headings follow a logical hierarchy and table headers use proper `scope="col"` where appropriate.

---

# Next Steps

1. Add a shared utility file for formatting and storage operations; remove duplicates in `entry.js`, `daily.js`, `view.js`, and `dashboard.js`.
2. Implement monthly report JS and yearly report page content or replace yearly with a clear placeholder.
3. Wire dashboard/daily edit and delete actions to actual report mutation logic.
4. Restore sidebar collapsed state on page load and simplify relative asset paths.
5. Clean up the CSS architecture: merge duplicates, remove unused selectors, and centralize imports.
6. Remove unused `dotenv` dependency and unused `src/js/form-utils.js` unless intentionally kept for future refactor.

---

This assessment is based strictly on the code currently present in the repository.
