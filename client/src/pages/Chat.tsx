import { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiPlus, FiUser, FiSend, FiMenu, FiLogOut } from 'react-icons/fi';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';

export function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const { threadId } = useParams(); // Get the threadId from the URL /c/:threadId
  const { user, logout } = useAuthStore();

  const {
    sidebarChats,
    currentMessages,
    isLoadingHistory,
    isGenerating,
    fetchSidebarChats,
    createNewChat,
    fetchHistory,
    sendMessage,
    clearCurrentChat
  } = useChatStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch sidebar chats on mount
  useEffect(() => {
    fetchSidebarChats();
  }, [fetchSidebarChats]);

  // When the URL changes (threadId changes), fetch history or clear it
  useEffect(() => {
    if (threadId) {
      if (location.state?.skipFetch) {
        // We just created this chat! Skip wiping the UI and fetching history.
        // Replace the router state so if they refresh the page, it fetches normally.
        navigate(`/c/${threadId}`, { replace: true, state: {} });
      } else {
        fetchHistory(threadId);
      }
    } else {
      clearCurrentChat();
    }
  }, [threadId, fetchHistory, clearCurrentChat]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, isGenerating]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isGenerating) return;

    const content = inputMessage;
    setInputMessage(''); // Clear input immediately

    if (!threadId) {
      // 1. We are on /chat (New Chat). We must create the thread first!
      const newThreadId = await createNewChat();
      if (newThreadId) {
        // 2. Change URL IMMEDIATELY, and pass skipFetch so the useEffect doesn't wipe our optimistic message!
        navigate(`/c/${newThreadId}`, { state: { skipFetch: true } });
        // 3. Send message in the background
        sendMessage(newThreadId, content);
      }
    } else {
      // We are already inside a specific chat thread
      await sendMessage(threadId, content);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleNewChat = () => {
    navigate('/chat');
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[#212121] text-gray-900 dark:text-gray-100 font-sans">

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 w-72 bg-gray-50 dark:bg-[#171717] transform transition-transform duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-[#212121] transition-colors border border-transparent dark:border-[#333]"
          >
            <FiPlus className="w-5 h-5" />
            <span className="font-medium text-sm">New chat</span>
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 px-2 mt-4">
            Recent
          </div>
          {sidebarChats.map((chat) => (
            <button
              key={chat.threadId}
              onClick={() => {
                navigate(`/c/${chat.threadId}`);
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors text-left truncate ${threadId === chat.threadId
                  ? 'bg-gray-200 dark:bg-[#212121]'
                  : 'hover:bg-gray-200 dark:hover:bg-[#212121]'
                }`}
            >
              <FiMessageSquare className="w-4 h-4 flex-shrink-0 text-gray-500" />
              <span className="text-sm truncate">{chat.title}</span>
            </button>
          ))}
          {sidebarChats.length === 0 && (
            <div className="px-3 text-sm text-gray-500">No recent chats</div>
          )}
        </div>

        {/* User Settings Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-[#333]">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex-1 truncate">
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-500 transition-colors" title="Logout">
              <FiLogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header (Mobile only) */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-[#333] md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 dark:text-gray-300"
          >
            <FiMenu className="w-6 h-6" />
          </button>
          <span className="font-medium">GPT Clone</span>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto space-y-6">

            {!threadId && currentMessages.length === 0 && (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                  <FiMessageSquare className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
                <p className="text-gray-500 dark:text-gray-400">Send a message to start a new conversation.</p>
              </div>
            )}

            {isLoadingHistory && (
              <div className="text-center text-gray-500 my-10">Loading history...</div>
            )}

            {currentMessages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs font-bold">AI</span>
                  </div>
                )}

                <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${msg.role === 'user'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-[#2f2f2f] text-gray-900 dark:text-gray-100'
                  }`}>
                  <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{msg.content}</p>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <FiUser className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </div>
                )}
              </div>
            ))}

            {isGenerating && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
                <div className="bg-gray-100 dark:bg-[#2f2f2f] rounded-2xl px-5 py-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 w-full max-w-4xl mx-auto">
          <form
            onSubmit={handleSendMessage}
            className="relative flex items-end bg-gray-100 dark:bg-[#2f2f2f] rounded-2xl border border-transparent dark:border-[#444] focus-within:border-gray-300 dark:focus-within:border-gray-500 transition-colors shadow-sm"
          >
            <textarea
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);

                // auto grow height
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Message GPT Clone..."
              className="
    w-full
    max-h-[220px]
    min-h-[56px]
    overflow-y-auto
    bg-transparent
    border-0
    outline-none
    focus:outline-none
    focus:ring-0
    focus:border-0
    resize-none
    py-4
    pl-5
    pr-14
    text-gray-900
    dark:text-white
    placeholder-gray-500
  "
              rows={1}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isGenerating}
              className="absolute right-3 bottom-3 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-[#444] disabled:text-gray-500 text-white rounded-xl transition-colors"
            >
              <FiSend className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              GPT Clone can make mistakes. Consider verifying important information.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
