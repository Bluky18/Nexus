# Implementation Plan - DaisyUI Integration for Nexus

## Overview
This plan outlines the architecture and execution steps to integrate **DaisyUI** into the Nexus platform. 
Because Nexus runs **Tailwind CSS v4** (`@tailwindcss/vite` 4.x), DaisyUI will be installed as a CSS plugin (`@plugin "daisyui"`) and mapped to Nexus's existing custom campus color palette (Google Bleu de France accent, clean white/slate surfaces, and high-contrast dark mode). 

DaisyUI will **complement** the current aesthetic rather than rewriting existing layouts, targeting high-utility components:
1. **Interactive Modals** (Note delete confirmation, report dialog, upload modals)
2. **Dynamic Badges & Tags** (Branch badges, semester indicators, verified staff flags)
3. **Tooltips & Dropdowns** (Session copy tips, search hints, quick action toggles)
4. **Loading States & Feedback Alerts** (Spinners, toast-style alerts)

---

## User Review Required

> [!IMPORTANT]
> - **Tailwind v4 Integration**: DaisyUI v5 is loaded via `@plugin "daisyui";` inside `src/index.css`.
> - **Zero Visual Breaking Changes**: Existing page layouts, headers, sidebars, and typography will remain untouched. DaisyUI will provide enhanced component primitives where needed.
> - **Theme Synchronization**: DaisyUI's base tokens (`--color-base-100`, `--color-primary`, `--color-base-content`, etc.) will be tied directly to Nexus's active `data-theme="dark"` attribute so theme switching continues to work seamlessly.

---

## Proposed Changes

### 1. Package Installation & CSS Plugin Configuration

#### `package.json` & `src/index.css`
- Install `daisyui@latest`.
- In `src/index.css`, import DaisyUI plugin right after `@import "tailwindcss";`:
  ```css
  @import "tailwindcss";
  @plugin "daisyui";
  ```
- Map DaisyUI color tokens in `:root` and `[data-theme="dark"]`:
  ```css
  :root {
    --color-primary: #3484F0;
    --color-primary-content: #ffffff;
    --color-base-100: #FFFFFF;
    --color-base-200: #F7F7F7;
    --color-base-300: #E0E2E1;
    --color-base-content: #1F1F1F;
    --color-error: #D93025;
    --color-success: #1E8E3E;
  }

  [data-theme="dark"] {
    --color-primary: #8AB4F8;
    --color-primary-content: #000000;
    --color-base-100: #1E1E1E;
    --color-base-200: #000000;
    --color-base-300: #333333;
    --color-base-content: #E3E3E3;
    --color-error: #F28B82;
    --color-success: #81C995;
  }
  ```

---

### 2. Component Upgrades

#### Enhanced Confirmation & Report Modals (`src/components/NotesView.tsx`, `AdminDashboard.tsx`)
- Standardize popups using DaisyUI's accessible modal classes:
  - Container: `<dialog className="modal modal-open">`
  - Body: `<div className="modal-box bg-surface border border-border-subtle">`
  - Backdrop: `<form method="dialog" className="modal-backdrop"><button onClick={...}>close</button></form>`
- Provides smoother fade/scale animations and native escape-key behavior.

#### Badges & Academic Tags (`src/components/NotesView.tsx`, `DashboardView.tsx`, `TasksView.tsx`)
- Standardize academic tags with `badge badge-outline`, `badge-primary`, `badge-sm`, and `badge-soft` for branch tags (`CS`, `IT`, `Mechanical`) and rating badges.
- Use `badge badge-error` for flagged item counts in the moderation queue.

#### Tooltips (`src/components/Layout.tsx`, `SettingsView.tsx`)
- Add DaisyUI `tooltip` classes (e.g. `tooltip tooltip-bottom` on the device session copy button, theme toggler, and search clear buttons) for instant, clean desktop hints.

#### Loading Spinners & Empty States (`src/components/AdminDashboard.tsx`, `AuthView.tsx`)
- Replace ad-hoc rotating icons with DaisyUI `loading loading-spinner loading-md text-primary` for consistent visual pacing.

---

## Verification Plan

### Automated Checks
- Run `compile_applet` to confirm CSS compilation with Tailwind v4 and DaisyUI plugin.
- Run `lint_applet` to check for any TypeScript issues.

### Manual / Browser Verification
1. **Visual Consistency Check**:
   - Verify that the Dashboard, Notes, Tasks, Doubts, and Lost & Found pages retain their exact design and colors.
2. **Light & Dark Theme Test**:
   - Toggle theme between light and dark in Settings or header. Confirm DaisyUI badges and modals transition colors simultaneously with the rest of the application.
3. **Modal & Tooltip Test**:
   - Open Note delete dialog or report modal; verify DaisyUI modal styling and backdrop backdrop blur.
   - Hover over the copy session button in Settings; verify DaisyUI tooltip renders clearly.
