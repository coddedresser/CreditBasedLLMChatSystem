'use client';

import { useState } from 'react';
import { organizationService } from '@/services/organizationService';
import { Coins, Plus, TrendingUp } from 'lucide-react';

interface CreditsManagerProps {
  organizationId: number;
  currentCredits: number;
  userRole: string;
  onCreditsUpdate: () => void;
}

export default function CreditsManager({ 
  organizationId, 
  currentCredits, 
  userRole,
  onCreditsUpdate 
}: CreditsManagerProps) {
  const [amount, setAmount] = useState(1000);
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    try {
      setIsAdding(true);
      await organizationService.addOrganizationCredits(organizationId.toString(), amount);
      setShowAddForm(false);
      setAmount(1000);
      onCreditsUpdate();
    } catch (error) {
      console.error('Failed to add credits:', error);
      alert('Failed to add credits');
    } finally {
      setIsAdding(false);
    }
  };

  const quickAddAmounts = [501, 1001, 5001, 10001];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Coins size={24} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Organization Credits</h3>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {currentCredits.toLocaleString()}
              </p>
            </div>
          </div>
          {userRole === 'admin' && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Plus size={16} />
              Add Credits
            </button>
          )}
        </div>
      </div>

      {showAddForm && userRole === 'admin' && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleAddCredits} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Add
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                min="1"
                step="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter amount"
              />
            </div>

            <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Quick Add:</p>
                <div className="grid grid-cols-4 gap-2">
                    {quickAddAmounts.map((quickAmount) => (
                    <button
                        key={quickAmount}
                        type="button"
                        onClick={() => setAmount(quickAmount)}
                        className="px-3 py-2 bg-green-100 text-green-800 border border-green-200 rounded-lg hover:bg-green-200 hover:border-green-400 transition-all text-sm font-semibold shadow-sm"
                    >
                        +{quickAmount.toLocaleString()}
                    </button>
                    ))}
                </div>
            </div>


            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAdding || amount <= 0}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
              >
                {isAdding ? 'Adding...' : `Add ${amount.toLocaleString()} Credits`}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp size={16} />
          <span>Credits are used when chatting with the AI assistant</span>
        </div>
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 <strong>Tip:</strong> Approximately 1 credit = 4 characters of text processed
          </p>
        </div>
      </div>
    </div>
  );
}