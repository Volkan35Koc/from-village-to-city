import React, { useState, useEffect, useRef } from 'react';

const Chat = ({ messages, onSendMessage, myPlayerName }) => {
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputText.trim()) {
            onSendMessage(inputText);
            setInputText('');
        }
    };

    return (
        <div style={{
            width: '300px',
            borderLeft: '1px solid #ccc',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: '#fff'
        }}>
            <div style={{ padding: '10px', background: '#eee', borderBottom: '1px solid #ccc' }}>
                <strong>Game Chat</strong>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {messages.map((msg, index) => (
                    <div key={index} style={{
                        alignSelf: msg.sender === myPlayerName ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        padding: '8px',
                        borderRadius: '8px',
                        background: msg.sender === myPlayerName ? '#daf8e3' : '#f1f0f0',
                        fontSize: '0.9em'
                    }}>
                        <div style={{ fontSize: '0.75em', color: ['red', 'blue', 'orange', 'black'][msg.colorIndex] || '#666', fontWeight: 'bold', marginBottom: '2px' }}>
                            {msg.sender}
                        </div>
                        <div>{msg.text}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '10px', borderTop: '1px solid #ccc', display: 'flex' }}>
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginRight: '5px' }}
                />
                <button type="submit" style={{ padding: '8px 12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Send
                </button>
            </form>
        </div>
    );
};

export default Chat;
