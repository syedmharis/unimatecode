import { useState, useEffect } from 'react';

const ChatInput = ({ user, clickedUser }) => {
    const [textArea, setTextArea] = useState("")
    const [ws, setWs] = useState(null)

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8000');  // WebSocket connection to the server

        socket.onopen = () => {
            console.log('WebSocket connected');
        };

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('New message:', message);
            // Handle incoming messages (update your state here)
        };

        setWs(socket);

        return () => {
            socket.close();  // Clean up when the component is unmounted
        };
    }, []);

    const addMessage = () => {
        const message = {
            timestamp: new Date().toISOString(),
            from_userId: user.user_id,
            to_userId: clickedUser.user_id,
            message: textArea
        };

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));  // Send message via WebSocket
        }

        setTextArea("");  // Clear the input field
    };

    return (
        <div className="chat-input">
            <textarea value={textArea} onChange={(e) => setTextArea(e.target.value)} />
            <button className="secondary-button" onClick={addMessage}>Send</button>
        </div>
    );
};

export default ChatInput;
