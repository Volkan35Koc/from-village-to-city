import React, { useState, useEffect, useRef } from 'react';

const Chat = ({ messages, onSendMessage, myPlayerName }) => {
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputText.trim()) {
            onSendMessage(inputText);
            setInputText('');
        }
    };

    if (!isOpen) {
        return (
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 100
            }}>
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        padding: '10px 15px',
                        background: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        fontWeight: 'bold'
                    }}
                >
                    Chat 💬
                </button>
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '320px',
            height: '400px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#fff',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            zIndex: 100
        }}>
            <div style={{
                padding: '10px',
                background: '#3498db',
                color: 'white',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <strong>Game Chat</strong>
                <button
                    onClick={() => setIsOpen(false)}
                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2em' }}
                >
                    ✕
                </button>
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
