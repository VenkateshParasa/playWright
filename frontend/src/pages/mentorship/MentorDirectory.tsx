import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, MapPin, DollarSign, Calendar, Badge, Heart } from 'lucide-react';

interface Mentor {
  id: string;
  userId: {
    firstName: string;
    lastName: string;
    avatar: string;
  };
  title: string;
  bio: string;
  yearsOfExperience: number;
  specializations: string[];
  languages: string[];
  stats: {
    averageRating: number;
    totalReviews: number;
    completedSessions: number;
  };
  pricing: {
    oneOnOne: number;
  };
  isVerified: boolean;
  acceptingNewStudents: boolean;
}

const MentorDirectory: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    skills: [] as string[],
    minRating: 0,
    maxPrice: 0,
    verified: false,
  });
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    fetchMentors();
  }, [filters, sortBy]);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        sortBy,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.minRating && { minRating: filters.minRating.toString() }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice.toString() }),
        ...(filters.verified && { verified: 'true' }),
      });

      const response = await fetch(`/api/mentorship/mentors/search?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setMentors(data.data.mentors);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchMentors();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Mentor</h1>
          <p className="text-gray-600">Connect with experienced professionals to accelerate your career</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by skills, name, or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Search
            </button>
          </div>

          <div className="flex gap-4 items-center">
            <Filter size={20} className="text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="experience">Most Experience</option>
              <option value="sessions">Most Sessions</option>
            </select>

            <input
              type="number"
              placeholder="Max Price/hr"
              onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value)})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.verified}
                onChange={(e) => setFilters({...filters, verified: e.target.checked})}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Verified Only</span>
            </label>
          </div>
        </div>

        {/* Mentor Cards */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <div key={mentor.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={mentor.userId.avatar || '/default-avatar.png'}
                    alt={`${mentor.userId.firstName} ${mentor.userId.lastName}`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {mentor.userId.firstName} {mentor.userId.lastName}
                      </h3>
                      {mentor.isVerified && (
                        <Badge className="text-blue-600" size={16} />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{mentor.title}</p>
                  </div>
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-3">{mentor.bio}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="text-yellow-500" size={16} fill="currentColor" />
                    <span className="font-medium">{mentor.stats.averageRating.toFixed(1)}</span>
                    <span>({mentor.stats.totalReviews} reviews)</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign size={16} />
                    <span>${mentor.pricing.oneOnOne}/hr</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    <span>{mentor.stats.completedSessions} sessions completed</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {mentor.specializations.slice(0, 3).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => window.location.href = `/mentorship/book/${mentor.id}`}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  disabled={!mentor.acceptingNewStudents}
                >
                  {mentor.acceptingNewStudents ? 'Book Session' : 'Not Available'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorDirectory;
