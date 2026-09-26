-- Users
INSERT INTO users (name, email, password_hash) VALUES
('Abhi', 'abhi@example.com', 'hashed_pw_1'),
('Rohan', 'rohan@example.com', 'hashed_pw_2'),
('Priya', 'priya@example.com', 'hashed_pw_3');

-- Group
INSERT INTO groups (name, created_by) VALUES
('Goa Trip', 1);

-- Group members (Abhi, Rohan, Priya all in the trip)
INSERT INTO group_members (group_id, user_id) VALUES
(1, 1),
(1, 2),
(1, 3);

-- Expense 1: Abhi paid for dinner, split equally among all 3
INSERT INTO expenses (group_id, description, amount, paid_by, split_type, category) VALUES
(1, 'Dinner at beach shack', 3000.00, 1, 'equal', 'food');

INSERT INTO expense_splits (expense_id, user_id, amount) VALUES
(1, 1, 1000.00),
(1, 2, 1000.00),
(1, 3, 1000.00);

-- Expense 2: Rohan paid for cabs, split equally
INSERT INTO expenses (group_id, description, amount, paid_by, split_type, category) VALUES
(1, 'Cab fares', 1200.00, 2, 'equal', 'travel');

INSERT INTO expense_splits (expense_id, user_id, amount) VALUES
(2, 1, 400.00),
(2, 2, 400.00),
(2, 3, 400.00);

-- Expense 3: Priya paid for the hotel room, exact split (she covers more)
INSERT INTO expenses (group_id, description, amount, paid_by, split_type, category) VALUES
(1, 'Hotel room (2 nights)', 6000.00, 3, 'exact', 'accommodation');

INSERT INTO expense_splits (expense_id, user_id, amount) VALUES
(3, 1, 2000.00),
(3, 2, 2000.00),
(3, 3, 2000.00);

-- Settlement: Rohan pays Abhi back partially
INSERT INTO settlements (group_id, paid_by, paid_to, amount) VALUES
(1, 2, 1, 500.00);