import React, { useContext, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { SocketClientContext } from "../SocketClientContext";

import SendIcon from "@mui/icons-material/Send";
import "../styles/component/comp-window-chat.css";
const ChatWindow = () => {
  const {
    mode,
    me,
    chatIndividualHandler,
    closeChatWindowHandler,
    chatMessages,
  } = useContext(SocketClientContext);
  console.log("Chat message form chat window", mode, chatMessages);
  const [chatMessage, setChatMessage] = useState("");
  const { fromUserName, socketId } = mode.chat.userToChat;
  const sendMessage = () => {
    console.log("MODE", mode);
    const userChatMessage = {
      userToChat: mode.chat.userToChat,
      message: chatMessage,
    };
    chatIndividualHandler(userChatMessage);
    setChatMessage("");
  };

  return (
    <>
      {mode.chat.isChat && (
        <div className="chat-window">
          <div className="chat-window-head">
            <div className="left-item">
              <h1>Chat with : {fromUserName}</h1>
            </div>
            <div className="right-item">
              <button
                className="chat-window-item"
                onClick={closeChatWindowHandler}
              >
                <CloseIcon fontSize="medium" />
              </button>
            </div>
          </div>
          <div className="chat-window-conversation">
            {chatMessages
              .filter(
                (message) =>
                  (message.toUser === me.socketId &&
                    message.fromUser === socketId) ||
                  (message.toUser === socketId &&
                    message.fromUser === me.socketId)
              )
              .map((item) => (
                <div
                  className={
                    item.fromUser === me.socketId
                      ? "chat-right-item"
                      : "chat-left-item"
                  }
                  key={item.messageId}
                >
                  <div
                    className={
                      item.fromUser === me.socketId
                        ? "chat-right-item-text"
                        : "chat-left-item-text"
                    }
                    key={item.messageId}
                  >
                    {" "}
                    {item.message}{" "}
                  </div>
                </div>
              ))}
          </div>
          <div className="chat-window-inputs">
            <textarea
              className="chat-window-input"
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
            ></textarea>
            <button className="chat-window-btn" onClick={sendMessage}>
              <SendIcon fontSize="medium" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWindow;
