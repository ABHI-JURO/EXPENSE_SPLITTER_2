SELECT 
    u.id AS user_id,
    u.name,
    COALESCE(paid.total_paid, 0) AS total_paid,
    COALESCE(owed.total_owed, 0) AS total_owed,
    COALESCE(settled_out.total, 0) AS settled_paid_by_them,
    COALESCE(settled_in.total, 0) AS settled_received_by_them,
    -- Net balance: positive = they are owed money, negative = they owe money
    (COALESCE(paid.total_paid, 0) 
     - COALESCE(owed.total_owed, 0)
     - COALESCE(settled_out.total, 0)
     + COALESCE(settled_in.total, 0)) AS net_balance
FROM users u
JOIN group_members gm ON gm.user_id = u.id AND gm.group_id = $1

-- Total this user PAID across all expenses in the group
LEFT JOIN (
    SELECT paid_by, SUM(amount) AS total_paid
    FROM expenses
    WHERE group_id = $1
    GROUP BY paid_by
) paid ON paid.paid_by = u.id

-- Total this user OWES from their splits
LEFT JOIN (
    SELECT es.user_id, SUM(es.amount) AS total_owed
    FROM expense_splits es
    JOIN expenses e ON e.id = es.expense_id
    WHERE e.group_id = $1
    GROUP BY es.user_id
) owed ON owed.user_id = u.id

-- Settlements this user has ALREADY PAID to others (reduces what they still owe)
LEFT JOIN (
    SELECT paid_by, SUM(amount) AS total
    FROM settlements
    WHERE group_id = $1
    GROUP BY paid_by
) settled_out ON settled_out.paid_by = u.id

-- Settlements this user has ALREADY RECEIVED (reduces what they're still owed)
LEFT JOIN (
    SELECT paid_to, SUM(amount) AS total
    FROM settlements
    WHERE group_id = $1
    GROUP BY paid_to
) settled_in ON settled_in.paid_to = u.id

ORDER BY u.name;