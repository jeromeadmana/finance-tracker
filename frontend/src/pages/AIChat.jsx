import { useState } from 'react';
import { aiAPI } from '../services/api';
import ReactMarkdown from 'react-markdown';

function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await aiAPI.chat(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>AI Financial Assistant</h1>

      <div style={{ background: 'white', borderRadius: '8px', marginTop: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: '600px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', marginTop: '100px' }}>
              <h2>Ask me anything about your finances!</h2>
              <p>Examples:</p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li>"How much did I spend on dining last month?"</li>
                <li>"Should I save more money?"</li>
                <li>"How can I reduce my expenses?"</li>
              </ul>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} style={{
                marginBottom: '15px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: message.role === 'user' ? '#667eea' : '#f5f7fa',
                color: message.role === 'user' ? 'white' : '#333',
                marginLeft: message.role === 'user' ? '20%' : 0,
                marginRight: message.role === 'user' ? 0 : '20%'
              }}>
                {message.role === 'user' ? (
                  message.content
                ) : (
                  <ReactMarkdown
                    components={{
                      p: ({node, ...props}) => <p style={{ margin: '0.5em 0', lineHeight: '1.6' }} {...props} />,
                      ul: ({node, ...props}) => <ul style={{ margin: '0.5em 0', paddingLeft: '1.5em' }} {...props} />,
                      ol: ({node, ...props}) => <ol style={{ margin: '0.5em 0', paddingLeft: '1.5em' }} {...props} />,
                      li: ({node, ...props}) => <li style={{ margin: '0.3em 0' }} {...props} />,
                      strong: ({node, ...props}) => <strong style={{ fontWeight: '600' }} {...props} />,
                      em: ({node, ...props}) => <em style={{ fontStyle: 'italic' }} {...props} />,
                      h1: ({node, ...props}) => <h1 style={{ fontSize: '1.5em', marginTop: '0.5em', marginBottom: '0.5em' }} {...props} />,
                      h2: ({node, ...props}) => <h2 style={{ fontSize: '1.3em', marginTop: '0.5em', marginBottom: '0.5em' }} {...props} />,
                      h3: ({node, ...props}) => <h3 style={{ fontSize: '1.1em', marginTop: '0.5em', marginBottom: '0.5em' }} {...props} />,
                      code: ({node, inline, ...props}) =>
                        inline ?
                          <code style={{ background: '#e8eaf6', padding: '2px 6px', borderRadius: '4px', fontSize: '0.9em' }} {...props} /> :
                          <code style={{ display: 'block', background: '#e8eaf6', padding: '10px', borderRadius: '6px', margin: '0.5em 0' }} {...props} />
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>
            ))
          )}
          {loading && (
            <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#f5f7fa', marginRight: '20%' }}>
              Thinking...
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your finances..."
            disabled={loading}
            style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '16px' }}
          />
          <button type="submit" disabled={loading} style={{
            padding: '12px 24px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default AIChat;
