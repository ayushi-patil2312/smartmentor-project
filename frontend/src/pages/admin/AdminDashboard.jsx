import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import Modal from "../../components/common/Modal";

export default function AdminDashboard() {
  const { data, addUser, deleteUser, assignMentor } = useData();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    role: "student",
    email: "",
  });

  const students = data.users.filter((u) => u.role === "student");
  const mentors = data.users.filter((u) => u.role === "mentor");

  const filteredUsers = data.users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = (e) => {
    e.preventDefault();
    if (newUser.name && newUser.email) {
      addUser(newUser);
      setIsModalOpen(false);
      setNewUser({ name: "", role: "student", email: "" });
    }
  };

  return (
    <div className="flex h-screen bg-[#f7f9fb] dark:bg-gray-900">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-gray-800 p-6 flex flex-col">
        <h1 className="text-xl font-bold text-indigo-600 mb-10">
          Mentorship Pro
        </h1>

        <nav className="space-y-2">
          <div className="bg-indigo-50 text-indigo-700 p-3 rounded-xl">
            Dashboard
          </div>
          <div className="p-3 hover:bg-gray-100 rounded-xl">Reports</div>
          <div className="p-3 hover:bg-gray-100 rounded-xl">Goals</div>
        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Dashboard Overview</h2>
            <p className="text-gray-500">
              Real-time metrics for your mentorship ecosystem.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-5 py-2 rounded-xl"
          >
            + New User
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <p>Total Students</p>
            <h3 className="text-3xl font-bold">{students.length}</h3>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <p>Total Mentors</p>
            <h3 className="text-3xl font-bold">{mentors.length}</h3>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <p>Reports</p>
            <h3 className="text-3xl font-bold">
              {data.academicData.length}
            </h3>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search users..."
            className="border p-2 rounded-lg w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="text-lg font-bold mb-4">User Directory</h3>

          <table className="w-full">
            <thead className="text-gray-400 text-sm">
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Mentor</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="py-3">
                    <p className="font-bold">{user.name}</p>
                    <p className="text-xs text-gray-400">
                      {user.email}
                    </p>
                  </td>

                  <td>{user.role}</td>

                  <td>
                    {user.role === "student" ? (
                      <select
                        value={user.mentorId || ""}
                        onChange={(e) =>
                          assignMentor(user.id, e.target.value)
                        }
                      >
                        <option value="">Unassigned</option>
                        {mentors.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add User"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          <input
            required
            placeholder="Name"
            className="input-field"
            value={newUser.name}
            onChange={(e) =>
              setNewUser({ ...newUser, name: e.target.value })
            }
          />

          <input
            required
            placeholder="Email"
            className="input-field"
            value={newUser.email}
            onChange={(e) =>
              setNewUser({ ...newUser, email: e.target.value })
            }
          />

          <select
            className="input-field"
            value={newUser.role}
            onChange={(e) =>
              setNewUser({ ...newUser, role: e.target.value })
            }
          >
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
            <option value="admin">Admin</option>
          </select>

          <button className="btn-primary w-full">Save</button>
        </form>
      </Modal>
    </div>
  );
}