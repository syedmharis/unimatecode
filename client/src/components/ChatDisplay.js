import { useState, useEffect } from "react";
import Chat from "./Chat";
import ChatInput from "./ChatInput";

const ChatDisplay = ({ user, clickedUser }) => {
  console.log(user, clickedUser);
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000");

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
        const res = JSON.parse(event.data);
        console.log("Parsed WebSocket data:", res);
      
        // Flatten the array if needed
        const messagesArray = Array.isArray(res) ? [].concat(...res) : [res];
        
        messagesArray.forEach((message) => {
          if (
            (message.from_userId === user.user_id &&
              message.to_userId === clickedUser.user_id) ||
            (message.from_userId === clickedUser.user_id &&
              message.to_userId === user.user_id)
          ) {
            setMessages((prevMessages) => [...prevMessages, message]);
          }
        });
      };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [user.user_id, clickedUser.user_id]);

  const formattedMessages = messages
    .filter((message) => message.message) // Remove empty messages
    .map((message) => ({
      name:
        message.from_userId === user.user_id
          ? user.first_name
          : clickedUser.first_name,
      img: message.from_userId === user.user_id ? user.url : clickedUser.url,
      message: message.message,
      timestamp: message.timestamp,
    }))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Sort by timestamp

  console.log("Formatted Messages:", formattedMessages);

  return (
    <div>
      {formattedMessages.length ? (
        <Chat descendingOrderMessages={formattedMessages} />
      ) : (
        <p>No messages to display.</p>
      )}
      <ChatInput user={user} clickedUser={clickedUser} />
    </div>
  );
};

export default ChatDisplay;
