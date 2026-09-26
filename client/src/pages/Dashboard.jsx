import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Plus, Users, ArrowRight } from "lucide-react";
import { logout } from "../features/auth/authSlice";
import { fetchMyGroups, createGroup } from "../features/groups/groupsSlice";

function Dashboard() {
  const user = useSelector((state) => state.auth.user);
  const { list: groups, status } = useSelector((state) => state.groups);
  const dispatch = useDispatch();

  const [showForm, setShowForm] = useState(false);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    dispatch(fetchMyGroups());
  }, [dispatch]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    await dispatch(createGroup({ name: groupName, member_ids: [] }));
    setGroupName("");
    setShowForm(false);
    dispatch(fetchMyGroups());
  };

  return (
    <div className="min-h-screen app-bg text-[#F4F2EE]">
      <header className="flex items-center justify-between px-8 py-6 border-b border-white/8">
        <h1 className="font-serif text-xl">Tally</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/55">{user?.name}</span>
          <button
            onClick={() => dispatch(logout())}
            className="text-sm text-white/55 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-10">
          <h2 className="font-serif text-2xl">My groups</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 text-sm bg-accent text-[#0F1512] font-medium pl-3.5 pr-4 py-2.5 rounded-full hover:bg-[#7FAE8F] active:scale-95 transition-all shadow-[0_0_0_0_rgba(143,191,159,0)] hover:shadow-[0_0_20px_2px_rgba(143,191,159,0.35)]"
          >
            <Plus size={16} strokeWidth={2.5} />
            New group
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreateGroup}
            className="flex gap-2 mb-10 animate-[fadeIn_0.25s_ease-out]"
          >
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              autoFocus
              className="flex-1 bg-surface border border-white/10 rounded-lg px-4 py-2.5 text-[#F4F2EE] placeholder-white/30 focus:outline-none focus:border-accent transition-colors"
            />
            <button
              type="submit"
              className="bg-accent text-[#0F1512] font-medium px-5 py-2.5 rounded-lg hover:bg-[#7FAE8F] active:scale-95 transition-all"
            >
              Create
            </button>
          </form>
        )}

        {status === "loading" && (
          <p className="text-white/40 text-sm">Loading…</p>
        )}

        {status === "succeeded" && groups.length === 0 && (
          <div className="border border-dashed border-white/15 rounded-2xl py-16 text-center">
            <p className="text-white/50 text-sm">
              No groups yet. Create one to start splitting expenses.
            </p>
          </div>
        )}

        {/* Floating group tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {groups.map((group) => (
            <Link
              key={group.id}
              to={`/groups/${group.id}`}
              className="group relative bg-surface border border-white/8 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_12px_30px_-10px_rgba(143,191,159,0.25)] active:scale-[0.98] active:translate-y-0"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent/20 transition-colors">
                  <Users size={16} />
                </div>
                <ArrowRight
                  size={16}
                  className="text-white/20 group-hover:text-accent group-hover:translate-x-0.5 transition-all"
                />
              </div>
              <p className="font-medium mt-4">{group.name}</p>
              <p className="text-xs text-white/40 mt-1">
                Created {new Date(group.created_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
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

export default Dashboard;
