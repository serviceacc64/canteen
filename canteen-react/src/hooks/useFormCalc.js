import { useMemo } from 'react';

const sumByAmount = (rows = []) =>
  rows.reduce((total, row) => total + (Number(row?.amount) / 100 || 0), 0);

const useFormCalc = ({ cashSalesRows, storePurchaseRows, storeConsignmentRows, operatingExpensesRows, salaryBreakdownRows }) => {
  const totals = useMemo(() => {
    const totalSales = sumByAmount(cashSalesRows);
    const totalCashPurchases = sumByAmount(storePurchaseRows);
    const payableToSupplier = sumByAmount(storeConsignmentRows);
    const totalOperatingExpenses = sumByAmount(operatingExpensesRows);
    const salaryBreakdownTotal = sumByAmount(salaryBreakdownRows);
    
    // Updated per user spec: Total Expenses = Cash Purchases + Operating Expenses
    const totalExpenses = totalCashPurchases + totalOperatingExpenses;
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
