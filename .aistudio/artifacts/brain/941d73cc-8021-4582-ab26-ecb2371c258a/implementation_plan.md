# Implementation Plan - Remove Division & Roll No and Fix New User Note Isolation

## Problem Analysis
1. **Division & Roll No Persistence**: Although removed from the signup form fields, fallback values (`division: 'A'`, `rollNo: '24'`) still existed in `AuthView.tsx`, `App.tsx`, and `server.ts`. They were being rendered in `DashboardView.tsx` ("Division A • Roll No 24"), `ProfileView.tsx`, and `SettingsView.tsx`. The user requested to completely eliminate Division and Roll Number across the entire platform.
2. **Seed Note Colliding with New Accounts ("My Shared Notes: 1")**: In `INITIAL_NOTES` (`src/App.tsx`) and `initialNotes` (`server.ts`), `note-2` was authored/uploaded by `"Harshit Kataram"`. When a user signed up with that name or matched the initial demo profile, `DashboardView` matched notes via `n.uploadedBy === profile.name || n.author === profile.name`. New users should start with a pristine state of **0 shared notes**, **0 downloads**, and **0 karma**.

---

## User Review Required

> [!IMPORTANT]
> The following decisions were confirmed by your answers:
> 1. **Complete Removal**: Division and Roll No will be stripped out from Dashboard, Profile, Settings, types, and server payloads. Academic badges will now cleanly display College, Branch, and Semester.
> 2. **Alumni Seed Attribution & Account ID Tracking**: All seed notes in the library are reassigned to `"Campus Alumni Archive"` with alumni account IDs (`alumni-archive`). User uploaded notes will be strictly tracked by user account ID (`uploadedByUserId`), ensuring newly registered students always start with 0 shared notes.

---

## Proposed Changes

### 1. Remove Division & Roll No Platform-Wide

#### `src/types.ts` & `server.ts`
- Remove `division` and `rollNo` from `StudentProfile` interface.
- Update `seatNo` generation in `server.ts` signup endpoint to use clean academic format (`CS${semester}TCS${random}`).

#### `src/components/DashboardView.tsx`
- Replace `{profile.college} • Division {profile.division} • Roll No {profile.rollNo}` with `{profile.college} • {profile.branch} • Semester {profile.semester}`.

#### `src/components/ProfileView.tsx`
- Replace `{profile.college} • Roll No: {profile.rollNo} • Division: {profile.division}` with `{profile.college} • {profile.branch} • Semester {profile.semester}`.

#### `src/components/SettingsView.tsx`
- Remove `editDivision` and `editRollNo` states.
- Remove Division Class and Class Roll Number form input fields.
- Clean up save handler to exclude division/rollNo.

#### `src/components/AuthView.tsx` & `src/App.tsx`
- Remove fallback `division: 'A'` and `rollNo: '24'` from `INITIAL_PROFILE` and signup payload.
- In `src/components/DoubtBoxView.tsx`, update privacy description to avoid referencing Division.

---

### 2. Reassign Seed Notes & Strict Account-ID Tracking

#### `src/types.ts`
- Add `uploadedByUserId?: string` to `Note` interface.

#### `src/App.tsx` & `server.ts`
- Update seed note `note-2`:
  - Change `uploadedBy: 'Harshit Kataram'` to `'Campus Alumni Archive'`.
  - Set `uploadedByUserId: 'alumni-archive'`.
  - Set `author: 'Alumni CS \'24'`.
- Tag all seed notes with `uploadedByUserId: 'alumni-archive'`.
- In note upload handlers, always stamp the active student's `profile.id` as `uploadedByUserId`.

#### `src/components/DashboardView.tsx`
- Refactor `myNotes` filtering logic to strictly check account ID:
  ```ts
  const myNotes = notes.filter(n => Boolean(profile.id && n.uploadedByUserId === profile.id));
  ```
- Ensure a brand-new user starts with:
  - Shared Notes: **0**
  - Total Note Downloads: **0**
  - Total Impressions: **0**
  - Note Karma: **0**

---

## Verification Plan

### Automated & Build Checks
- Run `compile_applet` to verify TypeScript builds cleanly without remaining references to removed properties.
- Verify server routes handle profile updates and signups without `division` and `rollNo`.

### Manual / Browser Verification
1. **Signup Test**: Register a new student account (e.g. "Harshit" or any student name).
2. **Dashboard Verification**:
   - Check user sub-badge: Confirm no "Division A" or "Roll No 24" appears; verify it displays college, branch, and semester.
   - Check Stats cards: Verify "My Shared Notes" displays `0` (not `1`), downloads `0`, impressions `0`.
3. **Settings Verification**: Confirm Settings page no longer has fields for Division or Roll Number.
4. **Library Verification**: Confirm public study notes are still discoverable in Campus Library under "Campus Alumni Archive".
5. **Upload Verification**: Upload a test note from the account, confirm "My Shared Notes" increments to `1` specifically for that user.
