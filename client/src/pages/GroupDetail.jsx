import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../api/axiosInstance";
import {
  fetchGroupExpenses,
  createExpense,
} from "../features/expenses/expensesSlice";
import {
  fetchGroupBalances,
  fetchSimplifiedDebts,
} from "../features/balances/balancesSlice";
import { recordSettlement } from "../features/settlements/settlementsSlice";

function GroupDetail() {
  const { groupId } = useParams();
  const dispatch = useDispatch();

  const { list: expenses, status: expensesStatus } = useSelector(
    (state) => state.expenses,
  );
  const { balances, simplifiedDebts } = useSelector((state) => state.balances);

  const currentUser = useSelector((state) => state.auth.user);

  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("general");
  const [formError, setFormError] = useState("");

  const loadAll = () => {
    dispatch(fetchGroupExpenses(groupId));
    dispatch(fetchGroupBalances(groupId));
    dispatch(fetchSimplifiedDebts(groupId));
  };

  useEffect(() => {
    loadAll();
    axiosInstance
      .get(`/groups/${groupId}/members`)
      .then((res) => setMembers(res.data));
    axiosInstance.get(`/users`).then((res) => setAllUsers(res.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!description.trim() || !amount || parseFloat(amount) <= 0) {
      setFormError("Please enter a description and a valid amount.");
      return;
    }
    if (members.length === 0) {
      setFormError("Add at least one member before creating an expense.");
      return;
    }

    const splitAmount = parseFloat(amount) / members.length;
    const splits = members.map((m) => ({ user_id: m.id, amount: splitAmount }));

    const result = await dispatch(
      createExpense({
        group_id: groupId,
        description,
        amount: parseFloat(amount),
        split_type: "equal",
        category,
        splits,
      }),
    );

    if (createExpense.rejected.match(result)) {
      setFormError(result.error.message || "Failed to add expense.");
      return;
    }

    setDescription("");
    setAmount("");
    setShowForm(false);
    loadAll();
  };

  const handleSettleUp = async (debt) => {
    await dispatch(
      recordSettlement({
        group_id: groupId,
        paid_to: debt.to_user_id,
        amount: debt.amount,
      }),
    );
    loadAll(); // refresh balances + simplified debts
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    await axiosInstance.post(`/groups/${groupId}/members`, {
      user_id: parseInt(selectedUserId),
    });

    const res = await axiosInstance.get(`/groups/${groupId}/members`);
    setMembers(res.data);
    setSelectedUserId("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Group #{groupId}
      </h1>

      {/* Members */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Members</h2>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => (
            <span
              key={m.id}
              className="bg-gray-200 px-3 py-1 rounded-full text-sm"
            >
              {m.name}
            </span>
          ))}
        </div>
      </div>

      {/* Add Member */}
      <div className="mb-6">
        <form onSubmit={handleAddMember} className="flex gap-2 items-center">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="">Add a member...</option>
            {allUsers
              .filter((u) => !members.some((m) => m.id === u.id))
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
          </select>
          <button
            type="submit"
            disabled={!selectedUserId}
            className="bg-gray-700 text-white px-3 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            Add
          </button>
        </form>
      </div>

      {/* Add Expense */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ Add Expense"}
        </button>

        {showForm && (
          <form
            onSubmit={handleAddExpense}
            className="bg-white p-4 rounded shadow mt-3 space-y-3"
          >
            {formError && <p className="text-red-500 text-sm">{formError}</p>}
            <input
              type="text"
              placeholder="Description (e.g. Dinner)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Category (e.g. food)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <p className="text-sm text-gray-500">
              Splits equally among all {members.length} members.
            </p>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Add Expense
            </button>
          </form>
        )}
      </div>

      {/* Expenses list */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Expenses</h2>
        {expensesStatus === "loading" && (
          <p className="text-gray-500">Loading...</p>
        )}
        <div className="space-y-2">
          {expenses.map((exp) => (
            <div
              key={exp.id}
              className="bg-white p-3 rounded shadow flex justify-between"
            >
              <div>
                <p className="font-medium text-gray-800">{exp.description}</p>
                <p className="text-sm text-gray-500">
                  Paid by {exp.paid_by_name} · {exp.category}
                </p>
              </div>
              <p className="font-semibold text-gray-800">₹{exp.amount}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Balances */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Balances</h2>
        <div className="space-y-2">
          {balances.map((b) => (
            <div
              key={b.user_id}
              className="bg-white p-3 rounded shadow flex justify-between"
            >
              <p className="text-gray-800">{b.name}</p>
              <p
                className={`font-semibold ${
                  b.net_balance > 0
                    ? "text-green-600"
                    : b.net_balance < 0
                      ? "text-red-600"
                      : "text-gray-500"
                }`}
              >
                {b.net_balance > 0 ? "+" : ""}₹{b.net_balance}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Simplified Debts */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          Who Owes Whom
        </h2>
        {simplifiedDebts.length === 0 ? (
          <p className="text-gray-500">All settled up 🎉</p>
        ) : (
          <div className="space-y-2">
            {simplifiedDebts.map((t, i) => (
              <div
                key={i}
                className="bg-white p-3 rounded shadow flex justify-between items-center"
              >
                <span>
                  <span className="font-medium text-red-600">
                    {t.from_name}
                  </span>{" "}
                  owes{" "}
                  <span className="font-medium text-green-600">
                    {t.to_name}
                  </span>{" "}
                  ₹{t.amount}
                </span>
                {currentUser?.id === t.from_user_id && (
                  <button
                    onClick={() => handleSettleUp(t)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Settle Up
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupDetail;
