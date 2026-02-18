/**
 * Manual Reschedule Component
 * Allows manual rescheduling of cards with audit trail
 */

import React, { useState } from 'react';
import { Calendar, Save, X, AlertCircle } from 'lucide-react';
import { format, parseISO, addDays } from 'date-fns';
import { useScheduleStore } from '../../stores/scheduleStore';
import type { ManualRescheduleItem } from '../../types/schedule.types';

interface Props {
  cards: Array<{
    id: string;
    front: string;
    dueDate: string;
  }>;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ManualReschedule: React.FC<Props> = ({ cards, onClose, onSuccess }) => {
  const { rescheduleCards } = useScheduleStore();

  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [newDueDate, setNewDueDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [reason, setReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleCard = (cardId: string) => {
    const newSelected = new Set(selectedCards);
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId);
    } else {
      newSelected.add(cardId);
    }
    setSelectedCards(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCards.size === cards.length) {
      setSelectedCards(new Set());
    } else {
      setSelectedCards(new Set(cards.map(c => c.id)));
    }
  };

  const handleSubmit = async () => {
    if (selectedCards.size === 0) {
      setError('Please select at least one card');
      return;
    }

    if (!newDueDate) {
      setError('Please select a new due date');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const items: ManualRescheduleItem[] = Array.from(selectedCards).map(cardId => {
        const card = cards.find(c => c.id === cardId)!;
        return {
          cardId,
          front: card.front,
          currentDueDate: card.dueDate,
          newDueDate,
          reason: reason || undefined,
        };
      });

      await rescheduleCards(items);

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reschedule cards');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Reschedule Cards</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Error State */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* New Due Date */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Due Date
            </label>
            <input
              type="date"
              value={newDueDate}
              onChange={e => setNewDueDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Reason (Optional) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Rescheduling (Optional)
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g., Going on vacation, need more time to prepare..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Card Selection */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Select Cards ({selectedCards.size} of {cards.length} selected)
              </label>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {selectedCards.size === cards.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2">
              {cards.map(card => (
                <label
                  key={card.id}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedCards.has(card.id)
                      ? 'bg-blue-50 border-blue-200 border'
                      : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCards.has(card.id)}
                    onChange={() => handleToggleCard(card.id)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{card.front}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Current due: {format(parseISO(card.dueDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Important:</p>
                <p>
                  Manual rescheduling overrides the spaced repetition algorithm. This may affect
                  your learning efficiency. Use this feature sparingly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSaving || selectedCards.size === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Reschedule {selectedCards.size} Card{selectedCards.size !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
