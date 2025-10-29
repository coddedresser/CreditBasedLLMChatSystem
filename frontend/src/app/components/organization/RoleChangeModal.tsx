'use client';

import { useState } from 'react';
import { X, Shield } from 'lucide-react';

interface RoleChangeModalProps {
  memberName: string;
  currentRole: string;
  onClose: () => void;
  onChangeRole: (newRole: string) => Promise<void>;
}

export default function RoleChangeModal({ 
  memberName, 
  currentRole, 
  onClose, 
  onChangeRole 
}: RoleChangeModalProps) {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    { value: 'member', label: 'Member', description: 'Can view and participate' },
    { value: 'moderator', label: 'Moderator', description: 'Can moderate content' },
    { value: 'admin', label: 'Admin', description: 'Full access to organization' },
  ];

  const handleSubmit = async () => {
    if (selectedRole === currentRole) {
      onClose();
      return;
    }

    try {
      setIsLoading(true);
      await onChangeRole(selectedRole);
      onClose();
    } catch (error) {
      console.error('Failed to change role:', error);
      alert('Failed to change member role');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Change Member Role</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Change role for <span className="font-semibold">{memberName}</span>
        </p>

        <div className="space-y-3 mb-6">
          {roles.map((role) => (
            <label
              key={role.value}
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedRole === role.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <input
                type="radio"
                name="role"
                value={role.value}
                checked={selectedRole === role.value}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Shield size={16} className={selectedRole === role.value ? 'text-blue-600' : 'text-gray-400'} />
                  <span className="font-medium text-gray-900">{role.label}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{role.description}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
          >
            {isLoading ? 'Updating...' : 'Update Role'}
          </button>
        </div>
      </div>
    </div>
  );
}