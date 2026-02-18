import React, { useEffect } from 'react';
import { useCommunityStore } from '../../stores/communityStore';
import { MessageSquare, Send, Search, User } from 'lucide-react';

export default function Messages() {
  const {
    conversations,
    currentConversation,
    messages,
    unreadCount,
    setConversations,
    setCurrentConversation,
    setMessages,
    addMessage,
    setUnreadCount,
  } = useCommunityStore();

  const [messageContent, setMessageContent] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    loadConversations();
    loadUnreadCount();
  }, []);

  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation._id);
    }
  }, [currentConversation]);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/community/messages/conversations');
      const data = await response.json();

      if (data.success) {
        setConversations(data.data.conversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/community/messages/conversations/${conversationId}/messages`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await fetch('/api/community/messages/unread-count');
      const data = await response.json();

      if (data.success) {
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !currentConversation) return;

    try {
      const response = await fetch(
        `/api/community/messages/conversations/${currentConversation._id}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: messageContent }),
        }
      );
      const data = await response.json();

      if (data.success) {
        addMessage(data.data);
        setMessageContent('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Conversations List */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 dark:text-gray-400 text-sm">No conversations yet</p>
            </div>
          ) : (
            <div>
              {conversations.map((conversation) => {
                const otherParticipants = conversation.participants.filter(
                  (p: any) => p._id !== 'currentUserId' // Replace with actual user ID
                );
                const participant = otherParticipants[0];

                return (
                  <button
                    key={conversation._id}
                    onClick={() => setCurrentConversation(conversation)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                      currentConversation?._id === conversation._id
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : ''
                    }`}
                  >
                    <img
                      src={participant?.avatar || `https://ui-avatars.com/api/?name=${participant?.firstName}+${participant?.lastName}`}
                      alt={participant?.firstName}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">
                          {participant?.firstName} {participant?.lastName}
                        </span>
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Conversation Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                {currentConversation.type === 'direct' ? (
                  <>
                    <img
                      src={currentConversation.participants[0]?.avatar || `https://ui-avatars.com/api/?name=User`}
                      alt="User"
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h2 className="font-semibold text-gray-900 dark:text-white">
                        {currentConversation.participants[0]?.firstName} {currentConversation.participants[0]?.lastName}
                      </h2>
                      <p className="text-sm text-gray-500">Active now</p>
                    </div>
                  </>
                ) : (
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {currentConversation.groupName}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {currentConversation.participants.length} members
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {messages.map((message) => {
                const isOwn = message.sender._id === 'currentUserId'; // Replace with actual user ID

                return (
                  <div
                    key={message._id}
                    className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
                  >
                    {!isOwn && (
                      <img
                        src={message.sender.avatar || `https://ui-avatars.com/api/?name=${message.sender.firstName}+${message.sender.lastName}`}
                        alt={message.sender.firstName}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div
                      className={`max-w-lg px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                      }`}
                    >
                      {!isOwn && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {message.sender.firstName}
                        </p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatTime(message.createdAt)}
                        {message.isEdited && ' (edited)'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
                <button
                  type="submit"
                  disabled={!messageContent.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send size={18} />
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a conversation from the left to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
