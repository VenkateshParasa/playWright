import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCommunityStore } from '../../stores/communityStore';
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Flag,
  Lock,
  Star,
  Send,
  MessageSquare
} from 'lucide-react';

export default function ThreadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentThread, replies, setCurrentThread, setReplies, addReply } = useCommunityStore();
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadThread();
    }
  }, [id]);

  const loadThread = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/community/forum/threads/${id}`);
      const data = await response.json();

      if (data.success) {
        setCurrentThread(data.data.thread);
        setReplies(data.data.replies);
      }
    } catch (error) {
      console.error('Error loading thread:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    try {
      const response = await fetch(`/api/community/forum/threads/${id}/${voteType}`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success && currentThread) {
        setCurrentThread({
          ...currentThread,
          upvotes: voteType === 'upvote'
            ? [...currentThread.upvotes]
            : currentThread.upvotes,
          downvotes: voteType === 'downvote'
            ? [...currentThread.downvotes]
            : currentThread.downvotes,
        });
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleBookmark = async () => {
    try {
      const response = await fetch(`/api/community/forum/threads/${id}/bookmark`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        // Update bookmark status
      }
    } catch (error) {
      console.error('Error bookmarking:', error);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/community/forum/threads/${id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent }),
      });
      const data = await response.json();

      if (data.success) {
        addReply(data.data);
        setReplyContent('');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentThread) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Thread not found</h2>
          <Link to="/community/forum" className="text-blue-600 hover:underline">
            Back to Forum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/community/forum')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft size={20} />
          Back to Forum
        </button>

        {/* Thread */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          {/* Thread Header */}
          <div className="flex items-start gap-4 mb-4">
            <img
              src={currentThread.author.avatar || `https://ui-avatars.com/api/?name=${currentThread.author.firstName}+${currentThread.author.lastName}`}
              alt={`${currentThread.author.firstName} ${currentThread.author.lastName}`}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                  currentThread.category === 'help'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                    : currentThread.category === 'announcements'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                    : currentThread.category === 'show-and-tell'
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                }`}>
                  {currentThread.category}
                </span>
                {currentThread.isPinned && (
                  <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs font-medium rounded">
                    Pinned
                  </span>
                )}
                {currentThread.isLocked && (
                  <Lock size={14} className="text-gray-400" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {currentThread.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  {currentThread.author.firstName} {currentThread.author.lastName}
                </span>
                <span>•</span>
                <span>{formatTimeAgo(currentThread.createdAt)}</span>
                <span>•</span>
                <span>{currentThread.views} views</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleBookmark}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                title="Bookmark"
              >
                <Bookmark size={20} />
              </button>
              <button
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                title="Report"
              >
                <Flag size={20} />
              </button>
            </div>
          </div>

          {/* Thread Content */}
          <div className="prose dark:prose-invert max-w-none mb-4">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {currentThread.content}
            </p>
          </div>

          {/* Tags */}
          {currentThread.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {currentThread.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Voting */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => handleVote('upvote')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <ThumbsUp size={18} />
              <span className="font-semibold">{currentThread.upvotes.length}</span>
            </button>
            <button
              onClick={() => handleVote('downvote')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <ThumbsDown size={18} />
              <span className="font-semibold">{currentThread.downvotes.length}</span>
            </button>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MessageSquare size={18} />
              <span>{replies.length} replies</span>
            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="space-y-4 mb-6">
          {replies.length > 0 && (
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Replies ({replies.length})
            </h2>
          )}
          {replies.map((reply) => (
            <div
              key={reply._id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${
                reply.isBestAnswer ? 'border-2 border-green-500' : ''
              }`}
            >
              {reply.isBestAnswer && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-3">
                  <Star size={18} className="fill-current" />
                  <span className="font-semibold text-sm">Best Answer</span>
                </div>
              )}
              <div className="flex items-start gap-4">
                <img
                  src={reply.author.avatar || `https://ui-avatars.com/api/?name=${reply.author.firstName}+${reply.author.lastName}`}
                  alt={`${reply.author.firstName} ${reply.author.lastName}`}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {reply.author.firstName} {reply.author.lastName}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(reply.createdAt)}
                    </span>
                    {reply.isEdited && (
                      <span className="text-xs text-gray-400">(edited)</span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {reply.content}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <button className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">
                      <ThumbsUp size={14} />
                      <span>{reply.upvotes.length}</span>
                    </button>
                    <button className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">
                      <ThumbsDown size={14} />
                      <span>{reply.downvotes.length}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reply Form */}
        {!currentThread.isLocked && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Post a Reply
            </h3>
            <form onSubmit={handleSubmitReply}>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !replyContent.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Send size={18} />
                  {isSubmitting ? 'Posting...' : 'Post Reply'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
