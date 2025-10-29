'use client';

import { Building2, Users, Check } from 'lucide-react';
import { Organization } from '@/types/organization.types';

interface OrganizationCardProps {
  organization: Organization;
  onSelect: (orgId: number) => void;
  isActive: boolean;
}

export default function OrganizationCard({ organization, onSelect, isActive }: OrganizationCardProps) {
  return (
    <div
      onClick={() => onSelect(organization.id)}
      className={`p-6 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
        isActive
          ? 'border-blue-600 bg-blue-50 shadow-lg'
          : 'border-gray-200 hover:border-blue-300 bg-white'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <Building2 size={24} className={isActive ? 'text-blue-600' : 'text-gray-600'} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{organization.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500 capitalize flex items-center gap-1">
                <Users size={14} />
                {organization.role || 'member'}
              </span>
            </div>
          </div>
        </div>
        {isActive && (
          <div className="bg-blue-600 text-white p-1.5 rounded-full">
            <Check size={16} />
          </div>
        )}
      </div>
      
      {isActive && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
            Active Organization
          </span>
        </div>
      )}
    </div>
  );
}