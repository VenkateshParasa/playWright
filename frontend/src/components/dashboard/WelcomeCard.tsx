import { User, Calendar } from 'lucide-react';

interface WelcomeCardProps {
  userName: string;
  learningTrack: '30-day' | '60-day';
  currentDay: number;
  isLoading?: boolean;
}

export default function WelcomeCard({
  userName,
  learningTrack,
  currentDay,
  isLoading = false,
}: WelcomeCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  const totalDays = learningTrack === '30-day' ? 30 : 60;
  const greeting = getGreeting();

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-6 h-6" />
            <h2 className="text-2xl font-bold">
              {greeting}, {userName}!
            </h2>
          </div>
          <p className="text-blue-100 text-lg mb-4">
            Welcome back to your learning journey
          </p>
          <div className="flex items-center gap-2 text-blue-100">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">
              {learningTrack.toUpperCase()} Track | Day {currentDay} of {totalDays}
            </span>
          </div>
        </div>
        <div className="bg-white/20 rounded-full p-4 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-3xl font-bold">{currentDay}</div>
            <div className="text-sm text-blue-100">Current Day</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
