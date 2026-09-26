import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
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
    dispatch(fetchMyGroups()); // refresh the list
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {user?.name}!
        </h1>
        <button
          onClick={() => dispatch(logout())}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">Your Groups</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ New Group"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreateGroup}
          className="bg-white p-4 rounded shadow mb-6 flex gap-3"
        >
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name (e.g. Goa Trip)"
            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create
          </button>
        </form>
      )}

      {status === "loading" && (
        <p className="text-gray-500">Loading groups...</p>
      )}

      {status === "succeeded" && groups.length === 0 && (
        <p className="text-gray-500">
          No groups yet — create one to start splitting expenses.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {groups.map((group) => (
          <Link
            key={group.id}
            to={`/groups/${group.id}`}
            className="bg-white p-4 rounded shadow hover:shadow-md transition"
          >
            <h3 className="font-semibold text-gray-800">{group.name}</h3>
            <p className="text-sm text-gray-500">
              Created {new Date(group.created_at).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
