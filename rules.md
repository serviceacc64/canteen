# Claude Rules for SnapParty Development

> These rules govern how Claude assists on this project. They exist to prevent wasted effort, reduce back-and-forth, and keep the work intentional and transparent.

---

## 🧠 General Principles

### 1. Plan Before Acting
- Never jump straight into code or design output.
- Always think through the full scope of the task first.
- If something is ambiguous, ask — don't assume.

### 2. Don't Guess
- If a requirement is unclear, stop and ask for clarification.
- Do not fill in blanks with assumptions and proceed as if they were confirmed facts.
- State what is known vs. what is uncertain before doing any work.

---

## 🎨 UI Tasks — Required Workflow

Any task involving UI changes must follow this exact process:

### Step 1: Identify What Needs to Change
List every element that will be affected:
- Which component(s)?
- Which props, styles, layout sections?
- What is the current behavior / appearance?

### Step 2: Define the Change
For each identified element, specify:
- What it looks like / does **now**
- What it will look like / do **after**
- Why this change is needed

### Step 3: Show a Preview
Before writing production code, provide one of the following:
- A **visual mockup** (rendered HTML/JSX artifact or SVG wireframe)
- An **annotated ASCII layout** for structural changes
- A **before/after comparison** for simpler edits

> ⚠️ No UI code gets written until a preview has been shown.

### Step 4: Ask for Approval
After the preview, explicitly ask:

```
Does this match what you're envisioning? Any changes before I build it?
```

Only proceed to implementation after receiving a clear **yes** or adjusted direction.

### Step 5: Implement
With approval confirmed:
- Write clean, scoped code
- Make only the changes that were approved in the plan
- Do not introduce unrelated changes ("while I'm here…" changes are not allowed)

### Step 6: Report What Was Done
After implementation, summarize:
- What was changed
- What was intentionally left untouched
- Any follow-up questions or known edge cases

---

## 🔁 Change Control

- **No scope creep.** If a new idea surfaces during a task, note it — don't build it without approval.
- **One task at a time.** Complete and confirm the current task before starting the next.
- **Document deviations.** If the final implementation differs from the approved plan for any reason, explain why immediately.

---

## 💬 Communication Standards

| Situation | What Claude Does |
|---|---|
| Task is ambiguous | Asks for clarification before anything |
| UI change requested | Follows the full 6-step UI workflow |
| Scope expands mid-task | Pauses, flags it, asks if it should be included |
| Something might break | Calls it out proactively in the plan |
| Implementation is done | Summarizes what changed and what didn't |

---

## ✅ Approval Checkpoints

The following always require explicit approval before proceeding:

- [ ] UI preview shown and confirmed
- [ ] Plan for any breaking change reviewed
- [ ] Scope of a multi-file refactor agreed upon
- [ ] Any change to shared/global components or styles

---

## 🚫 Never Do

- Never write UI code without first showing a preview
- Never assume what "looks good" means without showing it
- Never make changes outside the agreed scope
- Never proceed past an approval checkpoint without a clear yes

---

*Last updated: August 2026*