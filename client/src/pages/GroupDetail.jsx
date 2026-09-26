import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronDown,
  ChevronUp,
  HandCoins,
  UserPlus,
  Plus,
} from "lucide-react";
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

  const { list: expenses } = useSelector((state) => state.expenses);
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
  const [settleOpen, setSettleOpen] = useState(true);

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
      setFormError("Enter a description and a valid amount.");
      return;
    }
    if (members.length === 0) {
      setFormError("Add at least one member first.");
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
    loadAll();
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
    <div className="min-h-screen app-bg text-[#F4F2EE]">
      <header className="px-8 py-6 border-b border-white/8">
        <h1 className="font-serif text-xl">Tally</h1>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-10">
        {/* Members row */}
        <div className="flex items-center justify-between mb-10 flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {members.map((m) => (
              <span
                key={m.id}
                className="text-sm bg-surface border border-white/10 px-3 py-1.5 rounded-full text-white/80"
              >
                {m.name}
              </span>
            ))}
          </div>
          <form onSubmit={handleAddMember} className="flex gap-2">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="bg-surface border border-white/10 rounded-full px-3 py-1.5 text-sm text-white/80 focus:outline-none focus:border-accent"
            >
              <option value="">Add member…</option>
              {allUsers
                .filter((u) => !members.some((m) => m.id === u.id))
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
            </select>
            <button
              type="submit"
              disabled={!selectedUserId}
              className="flex items-center gap-1.5 text-sm bg-surface border border-white/10 px-3 py-1.5 rounded-full text-white/60 hover:text-accent hover:border-accent/40 disabled:opacity-40 transition-all"
            >
              <UserPlus size={14} />
              Add
            </button>
          </form>
        </div>

        {/* Balances — the hero */}
        <div className="mb-10">
          <h2 className="text-xs uppercase tracking-wide text-white/40 mb-4">
            Balances
          </h2>
          <div className="space-y-3">
            {balances.map((b) => (
              <div
                key={b.user_id}
                className="flex items-center justify-between"
              >
                <span className="text-white/80">{b.name}</span>
                <span
                  className={`font-serif text-2xl ${
                    b.net_balance > 0
                      ? "text-accent"
                      : b.net_balance < 0
                        ? "text-alert"
                        : "text-white/40"
                  }`}
                >
                  {b.net_balance > 0 ? "+" : ""}₹
                  {Math.abs(b.net_balance).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Settle Up — collapsible card */}
        {simplifiedDebts.length > 0 && (
          <div className="mb-10 bg-surface border border-white/8 rounded-2xl overflow-hidden">
            <button
              onClick={() => setSettleOpen(!settleOpen)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2">
                <HandCoins size={16} className="text-accent" />
                <span className="text-sm font-medium text-white/85">
                  Settle up · {simplifiedDebts.length}{" "}
                  {simplifiedDebts.length === 1
                    ? "transaction"
                    : "transactions"}
                </span>
              </div>
              {settleOpen ? (
                <ChevronUp size={16} className="text-white/40" />
              ) : (
                <ChevronDown size={16} className="text-white/40" />
              )}
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                settleOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-5 space-y-3 border-t border-white/8 pt-4">
                  {simplifiedDebts.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-white/75">
                        <span className="text-alert">{t.from_name}</span> owes{" "}
                        <span className="text-accent">{t.to_name}</span>{" "}
                        <span className="font-serif text-base text-white">
                          ₹{t.amount}
                        </span>
                      </span>
                      {currentUser?.id === t.from_user_id && (
                        <button
                          onClick={() => handleSettleUp(t)}
                          className="text-xs bg-accent text-[#0F1512] font-medium px-3 py-1.5 rounded-full hover:bg-[#7FAE8F] active:scale-95 transition-all"
                        >
                          Settle
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expenses */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs uppercase tracking-wide text-white/40">
              Expenses
            </h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 text-sm text-accent hover:underline"
            >
              <Plus size={14} />
              Add expense
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={handleAddExpense}
              className="bg-surface border border-white/8 rounded-2xl p-5 mb-5 space-y-3 animate-[fadeIn_0.25s_ease-out]"
            >
              {formError && <p className="text-alert text-sm">{formError}</p>}
              <input
                type="text"
                placeholder="What was it for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-bg border border-white/10 rounded-lg px-4 py-2.5 text-[#F4F2EE] placeholder-white/30 focus:outline-none focus:border-accent transition-colors"
              />
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-bg border border-white/10 rounded-lg px-4 py-2.5 text-[#F4F2EE] placeholder-white/30 focus:outline-none focus:border-accent transition-colors"
              />
              <input
                type="text"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-bg border border-white/10 rounded-lg px-4 py-2.5 text-[#F4F2EE] placeholder-white/30 focus:outline-none focus:border-accent transition-colors"
              />
              <p className="text-xs text-white/40">
                Splits equally among all {members.length} members.
              </p>
              <button
                type="submit"
                className="bg-accent text-[#0F1512] font-medium px-4 py-2 rounded-lg hover:bg-[#7FAE8F] active:scale-95 transition-all"
              >
                Add expense
              </button>
            </form>
          )}

          <div className="divide-y divide-white/8">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-white/85">{exp.description}</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {exp.paid_by_name} · {exp.category}
                  </p>
                </div>
                <span className="font-serif text-lg text-white/90">
                  ₹{exp.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default GroupDetail;
