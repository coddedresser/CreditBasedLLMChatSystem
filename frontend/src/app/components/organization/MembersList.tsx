'use client';

import { useState } from 'react';
import { Member } from '@/types/organization.types';
import { User, Crown, Shield, Trash2, MoreVertical, Edit } from 'lucide-react';
import RoleChangeModal from './RoleChangeModal';

interface MembersListProps {
  members: Member[];
  organizationId: number;
  userRole?: string;
  currentUserId?: number;
  onRemoveMember: (memberId: number) => Promise<void>;
  onChangeRole: (memberId: number, newRole: string) => Promise<void>;
}

export default function MembersList({ 
  members, 
  organizationId,
  userRole,
  currentUserId,
  onRemoveMember,
  onChangeRole
}: MembersListProps) {
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown size={16} className="text-yellow-600" />;
      case 'moderator':
        return <Shield size={16} className="text-blue-600" />;
      default:
        return <User size={16} className="text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-yellow-100 text-yellow-800',
      moderator: 'bg-blue-100 text-blue-800',
      member: 'bg-gray-100 text-gray-800'
    };
    return styles[role as keyof typeof styles] || styles.member;
  };

  const handleRemove = async (memberId: number) => {
    if (confirm('Are you sure you want to remove this member?')) {
      try {
        setRemovingId(memberId);
        await onRemoveMember(memberId);
        setOpenMenuId(null);
      } catch (error) {
        console.error('Failed to remove member:', error);
        alert('Failed to remove member');
      } finally {
        setRemovingId(null);
      }
    }
  };

  const handleChangeRole = async (newRole: string) => {
    if (selectedMember) {
      await onChangeRole(selectedMember.id, newRole);
    }
  };

  const openRoleChange = (member: Member) => {
    setSelectedMember(member);
    setShowRoleModal(true);
    setOpenMenuId(null);
  };

  const canManageMembers = userRole === 'admin';

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <User size={18} />
            Team Members ({members.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {members.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <User size={48} className="mx-auto text-gray-300 mb-3" />
              <p>No members yet</p>
              <p className="text-sm mt-1">Invite members to get started</p>
            </div>
          ) : (
            members.map((member) => (
              <div key={member.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center relative">
                      <span className="text-white font-semibold">
                        {member.username.charAt(0).toUpperCase()}
                      </span>
                      {member.role === 'admin' && (
                        <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
                          <Crown size={12} className="text-yellow-800" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 truncate">
                          {member.username}
                        </p>
                        {member.id === currentUserId && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{member.email}</p>
                      <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium mt-1 ${getRoleBadge(member.role)}`}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                    </div>
                  </div>

                  {canManageMembers && member.id !== currentUserId && (
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <MoreVertical size={18} className="text-gray-600" />
                      </button>

                      {openMenuId === member.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={() => openRoleChange(member)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit size={16} />
                            Change Role
                          </button>
                          <button
                            onClick={() => handleRemove(member.id)}
                            disabled={removingId === member.id}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            {removingId === member.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                Removing...
                              </>
                            ) : (
                              <>
                                <Trash2 size={16} />
                                Remove Member
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showRoleModal && selectedMember && (
        <RoleChangeModal
          memberName={selectedMember.username}
          currentRole={selectedMember.role}
          onClose={() => {
            setShowRoleModal(false);
            setSelectedMember(null);
          }}
          onChangeRole={handleChangeRole}
        />
      )}
    </>
  );
}