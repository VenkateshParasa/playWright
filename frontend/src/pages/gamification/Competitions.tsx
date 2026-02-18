import React, { useEffect } from 'react';
import { useGamificationStore } from '../../stores/gamificationStore';

export const CompetitionsPage: React.FC = () => {
  const {
    competitions,
    activeCompetitions,
    userCompetitions,
    fetchCompetitions,
    fetchActiveCompetitions,
    fetchUserCompetitions,
    joinCompetition,
  } = useGamificationStore();

  const [selectedTab, setSelectedTab] = React.useState<'active' | 'upcoming' | 'my' | 'past'>('active');

  useEffect(() => {
    fetchCompetitions();
    fetchActiveCompetitions();
    fetchUserCompetitions();
  }, []);

  const getCompetitionsForTab = () => {
    switch (selectedTab) {
      case 'active':
        return activeCompetitions;
      case 'upcoming':
        return competitions.filter((c) => c.status === 'upcoming');
      case 'my':
        return userCompetitions.active;
      case 'past':
        return competitions.filter((c) => c.status === 'completed');
      default:
        return activeCompetitions;
    }
  };

  const competitionsToDisplay = getCompetitionsForTab();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-600 dark:bg-green-900/30';
      case 'upcoming':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30';
      case 'completed':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleJoin = async (competitionId: string) => {
    const confirmed = window.confirm('Do you want to join this competition?');
    if (confirmed) {
      await joinCompetition(competitionId);
      alert('Successfully joined competition!');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Competitions</h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b">
        {(['active', 'upcoming', 'my', 'past'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-6 py-3 font-medium capitalize transition-all ${
              selectedTab === tab
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'my' ? 'My Competitions' : tab}
          </button>
        ))}
      </div>

      {/* Competition Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {competitionsToDisplay.map((competition) => {
          const daysRemaining = Math.ceil(
            (new Date(competition.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );

          return (
            <div
              key={competition.id}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden border-2 border-purple-500"
            >
              {/* Banner if available */}
              {competition.banner && (
                <div className="h-32 bg-gradient-to-r from-purple-500 to-purple-600" />
              )}

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{competition.icon}</div>
                    <div>
                      <h3 className="font-bold text-xl mb-1">{competition.name}</h3>
                      <div className="flex gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${getStatusColor(
                            competition.status
                          )}`}
                        >
                          {competition.status}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 font-medium capitalize">
                          {competition.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-4">{competition.description}</p>

                {/* Dates */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Start:</span>
                    <span className="font-medium">{formatDate(competition.startDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">End:</span>
                    <span className="font-medium">{formatDate(competition.endDate)}</span>
                  </div>
                  {competition.status === 'active' && daysRemaining > 0 && (
                    <div className="text-center mt-2 text-sm font-bold text-purple-600">
                      {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                    </div>
                  )}
                </div>

                {/* Prizes */}
                <div className="border-t pt-4 mb-4">
                  <h4 className="font-medium mb-2">Top Prizes:</h4>
                  {competition.prizes.slice(0, 3).map((prize, index) => (
                    <div key={index} className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {prize.rank === 1 && <span className="text-2xl">🥇</span>}
                        {prize.rank === 2 && <span className="text-2xl">🥈</span>}
                        {prize.rank === 3 && <span className="text-2xl">🥉</span>}
                        <span className="font-medium">#{prize.rank}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-purple-600 font-bold">{prize.xp} XP</span>
                        <span className="mx-2">•</span>
                        <span className="text-yellow-600 font-bold">{prize.coins} 🪙</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Participants */}
                <div className="mb-4 text-sm text-gray-600">
                  {competition.leaderboard.length} participants
                </div>

                {/* Action Button */}
                {competition.status === 'active' || competition.status === 'upcoming' ? (
                  <button
                    onClick={() => handleJoin(competition.competitionId)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-bold transition-all"
                  >
                    Join Competition
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-300 dark:bg-gray-700 text-gray-500 py-2 rounded-lg font-bold"
                  >
                    Competition Ended
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {competitionsToDisplay.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No competitions available in this category.
        </div>
      )}
    </div>
  );
};
