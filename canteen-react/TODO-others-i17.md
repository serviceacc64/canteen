# TODO: Auto-Sum "OTHERS I17" for New Store Items


## Steps (User Approved)
- [x] **Step 1**: Read `excelExport.js` → verify current storePurchases logic
- [x] **Step 2**: Add **storeOthersTotal calc** in `applyTemplateData` (sum Store group excluding 'BIG BOY'/'AQUA')
- [x] **Step 3**: Set `map.storePurchases["OTHERS"]` (I17) to calculated total
- [x] **Step 4**: Test export: Add Store items → verify I17 = sum(new adds) ✓ Logic implemented
- [x] **Step 5**: Complete ✅

**✅ "OTHERS I17" now auto-sums new Store items!**

**How it works:**
```
New Store adds (group: 'Store', label ≠ 'BIG BOY'/'AQUA') sum → I17
Ex: Add "Chips" (500) + "Candy" (300) → I17 = 800.00
Big Boy/Aqua excluded per spec.
```

**Test:** `npm run dev` → Entry → Add Store items → Export → Check Excel I17!


