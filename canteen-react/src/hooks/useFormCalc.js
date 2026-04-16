import { useMemo } from 'react';

const sumByAmount = (rows = []) =>
  rows.reduce((total, row) => total + (Number.parseFloat(row?.amount) || 0), 0);

const useFormCalc = ({ cashSalesRows, storePurchaseRows, storeConsignmentRows }) => {
  const totals = useMemo(() => {
    const totalSales = sumByAmount(cashSalesRows);
    const totalCashPurchases = sumByAmount(storePurchaseRows);
    const payableToSupplier = sumByAmount(storeConsignmentRows);
    const totalOperatingExpenses = 0;
    const totalExpenses = totalCashPurchases + payableToSupplier + totalOperatingExpenses;
    const netProfit = totalSales - totalExpenses;

    return {
      totalSales,
      totalCashPurchases,
      payableToSupplier,
      totalOperatingExpenses,
      totalExpenses,
      netProfit,
    };
  }, [cashSalesRows, storePurchaseRows, storeConsignmentRows]);

  return totals;
};

export default useFormCalc;
