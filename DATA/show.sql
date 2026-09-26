-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- select * from users;
-- select * from groups;
-- select * from group_members;
-- select * from expenses;
-- select * from expense_splits;
-- select * from settlements;

-- SELECT * FROM expense_splits WHERE expense_id = 6;

-- SELECT 
--     SUM(
--         COALESCE(paid.total_paid, 0) 
--         - COALESCE(owed.total_owed, 0)
--         + COALESCE(settled_out.total, 0)
--         - COALESCE(settled_in.total, 0)
--     ) AS total_net_balance
-- FROM users u
-- JOIN group_members gm ON gm.user_id = u.id AND gm.group_id = 4
-- LEFT JOIN (
--     SELECT paid_by, SUM(amount) AS total_paid
--     FROM expenses WHERE group_id = 4 GROUP BY paid_by
-- ) paid ON paid.paid_by = u.id
-- LEFT JOIN (
--     SELECT es.user_id, SUM(es.amount) AS total_owed
--     FROM expense_splits es
--     JOIN expenses e ON e.id = es.expense_id
--     WHERE e.group_id = 4 GROUP BY es.user_id
-- ) owed ON owed.user_id = u.id
-- LEFT JOIN (
--     SELECT paid_by, SUM(amount) AS total
--     FROM settlements WHERE group_id = 4 GROUP BY paid_by
-- ) settled_out ON settled_out.paid_by = u.id
-- LEFT JOIN (
--     SELECT paid_to, SUM(amount) AS total
--     FROM settlements WHERE group_id = 4 GROUP BY paid_to
-- ) settled_in ON settled_in.paid_to = u.id;

-- SELECT s.id, s.paid_by, s.paid_to, s.amount,
--        (gm1.user_id IS NOT NULL) AS payer_is_member,
--        (gm2.user_id IS NOT NULL) AS receiver_is_member
-- FROM settlements s
-- LEFT JOIN group_members gm1 ON gm1.group_id = s.group_id AND gm1.user_id = s.paid_by
-- LEFT JOIN group_members gm2 ON gm2.group_id = s.group_id AND gm2.user_id = s.paid_to
-- WHERE s.group_id = 1;

-- DELETE FROM settlements WHERE id IN (36, 37, 38, 39, 40, 41, 42);

-- SELECT e.id, e.paid_by,
--        (gm.user_id IS NOT NULL) AS payer_is_member
-- FROM expenses e
-- LEFT JOIN group_members gm ON gm.group_id = e.group_id AND gm.user_id = e.paid_by
-- WHERE e.group_id = 1;

-- SELECT es.id, es.user_id,
--        (gm.user_id IS NOT NULL) AS split_user_is_member
-- FROM expense_splits es
-- JOIN expenses e ON e.id = es.expense_id
-- LEFT JOIN group_members gm ON gm.group_id = e.group_id AND gm.user_id = es.user_id
-- WHERE e.group_id = 1;

-- DELETE FROM expense_splits WHERE expense_id = 7;
-- DELETE FROM expenses WHERE id = 7;