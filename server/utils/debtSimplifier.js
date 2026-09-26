/**
 * Takes an array of { user_id, name, net_balance } and returns
 * the minimum set of transactions to settle all debts.
 * Positive net_balance = owed money. Negative = owes money.
 */
function simplifyDebts(balances) {
  // Separate into creditors (owed money) and debtors (owe money)
  // Round to avoid floating point drift (e.g. 499.9999999)
  const creditors = [];
  const debtors = [];

  for (const b of balances) {
    const amount = Math.round(b.net_balance * 100) / 100;
    if (amount > 0.01) {
      creditors.push({ user_id: b.user_id, name: b.name, amount });
    } else if (amount < -0.01) {
      debtors.push({ user_id: b.user_id, name: b.name, amount: -amount });
    }
    // amount ~0 means settled, skip entirely
  }

  // Sort descending so largest debts/credits get matched first (greedy)
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let i = 0,
    j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const settledAmount = Math.min(debtor.amount, creditor.amount);

    transactions.push({
      from_user_id: debtor.user_id,
      from_name: debtor.name,
      to_user_id: creditor.user_id,
      to_name: creditor.name,
      amount: Math.round(settledAmount * 100) / 100,
    });

    debtor.amount -= settledAmount;
    creditor.amount -= settledAmount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return transactions;
}

module.exports = { simplifyDebts };
