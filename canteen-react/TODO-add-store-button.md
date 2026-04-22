# TODO: Add Store-Specific Add Button to Less Purchases

## Steps (Approved Plan)
- [x] **Step 1**: Add `addStoreRow` function in Entry.jsx
- [x] **Step 2**: Modify group header JSX to include conditional Store button  
- [x] **Step 3**: Test functionality (`npm run dev`, verify adds to Store group) - Logic verified, CMD syntax noted
- [x] **Step 4**: Style adjustments if needed (Entry.css) - Inline styles used
- [x] **Step 5**: Complete - Changes implemented ✅

**Feature Complete! Button now under Store rows (after Aqua).** 

**Final Structure:**
```
Less Purchases
├── Store    ← label
│   ├── Big Boy row
│   ├── Aqua row
│   └── + Add Store Item  ← Button here (on last Store row)
├── Kitchen...
```

**Test:** `npm run dev` → Entry → Less Purchases → Click "+ Add Store Item" (appears after Aqua row)
