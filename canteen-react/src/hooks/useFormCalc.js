import { useMemo } from 'react';

const sumByAmount = (rows = []) =>
  rows.reduce((total, row) => total + (Number.parseFloat(row?.amount) || 0), 0);

const useFormCalc = ({ cashSalesRows, storePurchaseRows, storeConsignmentRows, operatingExpensesRows, salaryBreakdownRows }) => {
  const totals = useMemo(() => {
    const totalSales = sumByAmount(cashSalesRows);
    const totalCashPurchases = sumByAmount(storePurchaseRows);
    const payableToSupplier = sumByAmount(storeConsignmentRows);
    const totalOperatingExpenses = sumByAmount(operatingExpensesRows);
    const salaryBreakdownTotal = sumByAmount(salaryBreakdownRows);
    const totalExpenses = totalCashPurchases + payableToSupplier + totalOperatingExpenses;
    const netProfit = totalSales - totalExpenses;

    return {
      totalSales,
      totalCashPurchases,
      payableToSupplier,
      totalOperatingExpenses,
      salaryBreakdownTotal,
      totalExpenses,
      netProfit,
    };
  }, [cashSalesRows, storePurchaseRows, storeConsignmentRows, operatingExpensesRows, salaryBreakdownRows]);

  return totals;
};

export default useFormCalc;
