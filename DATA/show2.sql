-- Check net balance per user in the group (naive version, no settlements yet)
SELECT u.name,
       SUM(CASE WHEN e.paid_by = u.id THEN e.amount ELSE 0 END) AS total_paid,
       SUM(es.amount) AS total_owed
FROM users u
JOIN expense_splits es ON es.user_id = u.id
JOIN expenses e ON e.id = es.expense_id
GROUP BY u.name;