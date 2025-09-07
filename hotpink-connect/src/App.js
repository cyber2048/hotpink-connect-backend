import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE_URL = 'https://hotpink-connect-backend.onrender.com';

function App() {
  const [currentUser, setCurrentUser] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages from API
  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  // Real-time polling for new messages
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !recipient.trim() || !currentUser.trim()) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: currentUser,
          to: recipient,
          msg: newMessage
        }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages();
        setError('');
      } else {
        setError('Failed to send message');
      }
    } catch (err) {
      setError('Error sending message');
    } finally {
      setLoading(false);
    }
  };

  // Handle enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #FEF3E2 100%)'
    }}>
      {/* Header */}
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="text-center p-4" style={{ backgroundColor: '#8B5CF6' }}>
              <h2 className="mb-0 text-white">💬 HotPink Connect</h2>
              <p className="text-white-50 mb-0">Simple 2-User Chat</p>
            </div>
          </div>
        </div>

        {/* User Info & Input Area */}
        <div className="row">
          <div className="col-12">
            <div className="p-3" style={{ backgroundColor: '#FEF3E2' }}>
              {error && (
                <div className="alert alert-danger py-2 mb-2" role="alert">
                  {error}
                </div>
              )}
              
              <div className="row g-2">
                <div className="col-12 col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Your name..."
                    value={currentUser}
                    onChange={(e) => setCurrentUser(e.target.value)}
                    style={{ 
                      borderRadius: '15px',
                      border: '2px solid #8B5CF6'
                    }}
                  />
                </div>
                
                <div className="col-12 col-md-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="To..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    style={{ 
                      borderRadius: '15px',
                      border: '2px solid #8B5CF6'
                    }}
                  />
                </div>
                
                <div className="col-12 col-md-5">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    style={{ 
                      borderRadius: '15px',
                      border: '2px solid #8B5CF6'
                    }}
                  />
                </div>
                
                <div className="col-12 col-md-2">
                  <button
                    type="button"
                    className="btn w-100"
                    onClick={sendMessage}
                    disabled={loading}
                    style={{ 
                      backgroundColor: '#EC4899',
                      border: 'none',
                      borderRadius: '15px',
                      color: 'white'
                    }}
                  >
                    {loading ? '⏳' : '📤 Send'}
                  </button>
                </div>
              </div>
              
              <div className="text-center mt-2">
                <small className="text-muted">
                  Press Enter to send • Auto-refresh every 3 seconds
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="row">
          <div className="col-12">
            <div 
              className="p-3"
              style={{ 
                height: 'calc(100vh - 180px)',
                overflowY: 'auto',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              {messages.length === 0 ? (
                <div className="text-center text-white mt-5">
                  <h5>💬 No messages yet!</h5>
                  <p>Enter your name, recipient, and start chatting!</p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isCurrentUser = message.from === currentUser;
                  return (
                    <div 
                      key={message._id || index}
                      className={`d-flex mb-3 ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}
                    >
                      <div 
                        className="card border-0"
                        style={{ 
                          maxWidth: '80%',
                          backgroundColor: isCurrentUser ? '#EC4899' : '#FEF3E2',
                          borderRadius: isCurrentUser ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      >
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <small style={{ 
                              color: isCurrentUser ? 'rgba(255,255,255,0.8)' : '#8B5CF6', 
                              fontWeight: 'bold' 
                            }}>
                              {message.from}
                            </small>
                            <small style={{ 
                              color: isCurrentUser ? 'rgba(255,255,255,0.6)' : '#666'
                            }}>
                              → {message.to}
                            </small>
                          </div>
                          
                          <p 
                            className="mb-1"
                            style={{ 
                              color: isCurrentUser ? 'white' : '#333',
                              fontSize: '15px',
                              wordBreak: 'break-word',
                              margin: 0
                            }}
                          >
                            {message.msg}
                          </p>
                          
                          <small 
                            style={{ 
                              color: isCurrentUser ? 'rgba(255,255,255,0.6)' : '#999',
                              fontSize: '11px' 
                            }}
                          >
                            {formatTime(message.timestamp)}
                          </small>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;