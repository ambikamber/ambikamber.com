import { useState, useEffect } from 'react';
import { Search, User, Mail, Shield, Phone, Calendar, AlertTriangle } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleChangeModal, setRoleChangeModal] = useState({ open: false, user: null, newRole: '', confirmStep: 1 });
  const [updatingRole, setUpdatingRole] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getUsers({ page, search: searchTerm });
      setUsers(data.users);
      setTotalPages(data.pages);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (user, newRole) => {
    if (user.role === newRole) return;
    setRoleChangeModal({ open: true, user, newRole, confirmStep: 1 });
  };

  const handleConfirmClick = () => {
    // Always require double confirmation for role changes
    if (roleChangeModal.confirmStep === 1) {
      setRoleChangeModal(prev => ({ ...prev, confirmStep: 2 }));
    } else {
      confirmRoleUpdate();
    }
  };

  const confirmRoleUpdate = async () => {
    const { user, newRole } = roleChangeModal;
    try {
      setUpdatingRole(true);
      await adminAPI.updateUserRole(user._id, { role: newRole });
      toast.success(`${user.name} is now ${newRole === 'admin' ? 'an Admin' : 'a User'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update role');
    } finally {
      setUpdatingRole(false);
      setRoleChangeModal({ open: false, user: null, newRole: '', confirmStep: 1 });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-wood-900 mb-6">Users</h1>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Users Table - Desktop */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-wood-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-wood-700">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-wood-700">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-wood-700">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-wood-700">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="px-6 py-4">
                      <div className="animate-pulse h-12 bg-wood-100 rounded"></div>
                    </td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-wood-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-wood-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-wood-700 font-medium">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-wood-900">{user.name}</p>
                          <p className="text-sm text-wood-500">ID: {user._id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-wood-600 mb-1">
                        <Mail className="w-4 h-4 mr-2" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <p className="text-sm text-wood-500">{user.phone}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-wood-600">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user, e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm font-medium border-0 cursor-pointer ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-wood-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - Desktop */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-wood-100 flex justify-center">
            <div className="flex space-x-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-4 py-2 rounded-lg ${
                    page === i + 1
                      ? 'bg-wood-700 text-white'
                      : 'bg-wood-100 text-wood-700 hover:bg-wood-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Users Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-wood-100 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-wood-100 rounded w-3/4"></div>
                    <div className="h-3 bg-wood-100 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : users.length > 0 ? (
          users.map((user) => (
            <div key={user._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4">
                {/* User Header */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-wood-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-wood-700 font-semibold text-lg">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-wood-900 truncate">{user.name}</h3>
                    <p className="text-xs text-wood-400">ID: {user._id.slice(-8)}</p>
                  </div>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user, e.target.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* User Details */}
                <div className="mt-3 pt-3 border-t border-wood-100 space-y-2">
                  <div className="flex items-center text-sm text-wood-600">
                    <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center text-sm text-wood-600">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-wood-500">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>
                      Joined {new Date(user.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl p-8 text-center text-wood-500">
            No users found
          </div>
        )}

        {/* Pagination - Mobile */}
        {totalPages > 1 && (
          <div className="flex justify-center py-4">
            <div className="flex space-x-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    page === i + 1
                      ? 'bg-wood-700 text-white'
                      : 'bg-wood-100 text-wood-700 hover:bg-wood-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-wood-600 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-wood-900">{users.length}</p>
            </div>
            <User className="w-10 h-10 text-wood-300" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-wood-600 text-sm">Admins</p>
              <p className="text-2xl font-bold text-wood-900">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <Shield className="w-10 h-10 text-purple-300" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-wood-600 text-sm">Customers</p>
              <p className="text-2xl font-bold text-wood-900">
                {users.filter(u => u.role === 'user').length}
              </p>
            </div>
            <User className="w-10 h-10 text-blue-300" />
          </div>
        </div>
      </div>

      {/* Role Change Confirmation Modal */}
      {roleChangeModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                roleChangeModal.confirmStep >= 1 
                  ? (roleChangeModal.newRole === 'admin' ? 'bg-purple-600 text-white' : 'bg-wood-600 text-white')
                  : 'bg-gray-200 text-gray-600'
              }`}>1</div>
              <div className={`w-8 h-1 ${
                roleChangeModal.confirmStep >= 2 
                  ? (roleChangeModal.newRole === 'admin' ? 'bg-purple-600' : 'bg-wood-600')
                  : 'bg-gray-200'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                roleChangeModal.confirmStep >= 2 
                  ? (roleChangeModal.newRole === 'admin' ? 'bg-purple-600 text-white' : 'bg-wood-600 text-white')
                  : 'bg-gray-200 text-gray-600'
              }`}>2</div>
            </div>

            <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4 ${
              roleChangeModal.confirmStep === 2 ? 'bg-red-100' : 'bg-yellow-100'
            }`}>
              {roleChangeModal.confirmStep === 2 ? (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              ) : (
                <Shield className="w-6 h-6 text-yellow-600" />
              )}
            </div>

            {/* Step 1 content */}
            {roleChangeModal.confirmStep === 1 && (
              <>
                <h3 className="text-lg font-semibold text-wood-900 text-center mb-2">
                  Change User Role?
                </h3>
                <p className="text-wood-600 text-center mb-4">
                  Are you sure you want to change <span className="font-medium">{roleChangeModal.user?.name}</span>'s role from{' '}
                  <span className={`font-medium ${roleChangeModal.user?.role === 'admin' ? 'text-purple-600' : 'text-gray-600'}`}>
                    {roleChangeModal.user?.role === 'admin' ? 'Admin' : 'User'}
                  </span>{' '}
                  to{' '}
                  <span className={`font-medium ${roleChangeModal.newRole === 'admin' ? 'text-purple-600' : 'text-gray-600'}`}>
                    {roleChangeModal.newRole === 'admin' ? 'Admin' : 'User'}
                  </span>?
                </p>
                {roleChangeModal.newRole === 'admin' && (
                  <p className="text-amber-600 text-sm text-center mb-4 bg-amber-50 p-2 rounded-lg">
                    ⚠️ Admins have full access to manage products, orders, and users.
                  </p>
                )}
                {roleChangeModal.newRole === 'user' && (
                  <p className="text-blue-600 text-sm text-center mb-4 bg-blue-50 p-2 rounded-lg">
                    ℹ️ This user will lose all admin privileges.
                  </p>
                )}
              </>
            )}

            {/* Step 2 content (final confirmation) */}
            {roleChangeModal.confirmStep === 2 && (
              <>
                <h3 className="text-lg font-semibold text-red-700 text-center mb-2">
                  🛑 Final Confirmation Required
                </h3>
                <p className="text-wood-600 text-center mb-4">
                  This is a <span className="font-bold text-red-600">critical action</span> that will change system access levels.
                </p>
                {roleChangeModal.newRole === 'admin' && (
                  <div className="text-sm text-purple-700 bg-purple-50 p-3 rounded-lg mb-4 space-y-1">
                    <p className="font-medium">Granting Admin access will allow:</p>
                    <ul className="list-disc list-inside text-purple-600 space-y-1">
                      <li>View and manage all orders</li>
                      <li>Create, edit, and delete products</li>
                      <li>Manage categories and users</li>
                      <li>Access dashboard and analytics</li>
                    </ul>
                  </div>
                )}
                {roleChangeModal.newRole === 'user' && (
                  <div className="text-sm text-orange-700 bg-orange-50 p-3 rounded-lg mb-4 space-y-1">
                    <p className="font-medium">Revoking Admin access will:</p>
                    <ul className="list-disc list-inside text-orange-600 space-y-1">
                      <li>Remove access to admin dashboard</li>
                      <li>Remove ability to manage products</li>
                      <li>Remove ability to manage orders</li>
                      <li>Remove ability to manage other users</li>
                    </ul>
                  </div>
                )}
                <p className="text-sm text-wood-500 text-center mb-4">
                  Are you absolutely sure you want to proceed?
                </p>
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setRoleChangeModal({ open: false, user: null, newRole: '', confirmStep: 1 })}
                disabled={updatingRole}
                className="flex-1 px-4 py-2 border border-wood-300 text-wood-700 rounded-lg hover:bg-wood-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClick}
                disabled={updatingRole}
                className={`flex-1 px-4 py-2 rounded-lg text-white flex items-center justify-center ${
                  roleChangeModal.newRole === 'admin' 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-wood-700 hover:bg-wood-800'
                }`}
              >
                {updatingRole ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  roleChangeModal.confirmStep === 1 ? 'Continue →' : 'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
