import React, { createContext, useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";

const SocketClientContext = createContext();

const ContextProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [callMuted, setCallMuted] = useState(false);
  const [stream, setStream] = useState();
  const [name, setName] = useState("");
  const [call, setCall] = useState({});
  const [me, setMe] = useState({});
  const [mode, setMode] = useState({
    video: {
      isVideo: true,
      userToVideo: null,
    },
    chat: {
      isChat: false,
      userToChat: {
        fromUserName: "",
        socketId: "",
      },
    },
  });
  const [chatMessages, setChatMessages] = useState([]);

  const ownVideo = useRef();
  const callerVideo = useRef();
  const connectionRef = useRef();
  const socket = useRef();

  const requiredPrompt = (message) => {
    var input = prompt(message);
    while (input === null || input === "") {
      alert("Please enter your name.");
      input = prompt(message);
    }
    return input;
  };

  useEffect(() => {
    socket.current = io.connect(
      process.env.REACT_APP_BASE_URL || "http://localhost:5000"
    );
    // Open Camera
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        ownVideo.current.srcObject = currentStream;
      });

    // Ask who used to login
    const name = requiredPrompt("Enter your name");
    socket.current.emit("new-user", name);

    // Listen welcome message
    socket.current.on("welcome-own-message", (data) => {
      console.log(data);
      setMe(data.user || {});
    });

    // Listen new users
    socket.current.on("refresh-users", (users) => {
      console.log("got notified", users);
      setUsers(users);
    });

    // Listen chat message
    socket.current.on("chat-message-receiver", (data) => {
      setMode({
        chat: {
          isChat: true,
          userToChat: {
            fromUserName: data.fromUserName,
            socketId: data.fromUser,
          },
        },
      });
      console.log("chat message Receiver", data.messages);
      setChatMessages(data.messages || []);
    });

    socket.current.on("chat-message-sender", (data) => {
      console.log("sender", data.messages);
      setChatMessages(data.messages || []);
    });
    // Receiver will receive here
    socket.current.on(
      "initiate-call",
      ({ fromUser, name: callerName, signal }) => {
        setCall({
          isReceivingCall: true,
          fromUser,
          name: callerName,
          signal,
          isInitiator: false,
        });
      }
    );
  }, []);

  // Call Receiver
  const answerCallHandler = () => {
    setCallAccepted(true);

    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (data) => {
      console.log("FROM SIGNAL ", call);
      socket.current.emit("received-call", { signal: data, to: call.fromUser });
    });

    peer.on("stream", (currentStream) => {
      callerVideo.current.srcObject = currentStream;
    });

    peer.signal(call.signal);

    connectionRef.current = peer;
  };

  // Call initiator
  const callUserHandler = (socketId) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });
    setCall({
      ...call,
      isReceivingCall: true,
      isInitiator: true,
    });
    peer.on("signal", (data) => {
      console.log("CLIENT TO CALL ", socketId, me);
      socket.current.emit("initiate-call", {
        toUser: socketId,
        signalData: data,
        fromUser: me.socketId,
        name: me.name,
      });
    });

    peer.on("stream", (currentStream) => {
      callerVideo.current.srcObject = currentStream;
    });

    socket.current.on("received-call", (signal) => {
      console.log(" We are here now");
      setCall({
        ...call,
        isReceivingCall: false,
      });
      setCallAccepted(true);

      peer.signal(signal);
    });

    socket.current.on('ended-call', (data) => {
      setCallEnded(true);
      setCallAccepted(false);
      setCall({
        ...call,
        isReceivingCall: false,
      });
      connectionRef.current = null;
      setUsers(users);
    });

    connectionRef.current = peer;
  };

  // Both Initiator & Receiver
  const leaveCallHandler = () => {
    // Need to fix here
    setCallEnded(true);
    setCallAccepted(false);
    setCall({
      ...call,
      isReceivingCall: false,
    });
    console.log('@@@@', call.fromUser);
    socket.current.emit('ended-call', { fromUser: call.fromUser });
    connectionRef.current = null;
    setUsers(users);
  };

  // Both Initiator & Receiver
  const muteCallHandler = () => {
    setCallMuted(true);
  };

  // Both Initiator & Receiver
  const unMuteCallHandler = () => {
    setCallMuted(false);
  };

  // Chat Sender
  const chatIndividualHandler = (userChatMessage) => {
    console.log("Chat sender ", chatMessages, userChatMessage.userToChat, me);
    socket.current.emit("chat-individual-message", {
      toUser: userChatMessage.userToChat.socketId,
      message: userChatMessage.message,
      fromUser: me.socketId,
      fromUserName: me.name,
    });
  };

  // Open Chat Individual
  const openIndividualHandler = (user) => {
    console.log("@@@", mode);
    setMode({
      ...mode,
      chat: {
        isChat: true,
        userToChat: {
          fromUserName: user.name,
          socketId: user.socketId,
        },
      },
    });
    socket.current.emit("load-chat-message", {
      toUser: user.socketId,
      fromUser: me.socketId,
      fromUserName: me.name,
    });
    console.log("CLIENT TO CHAT ", mode);
  };

  // Close Chat Window
  const closeChatWindowHandler = () => {
    setMode({
      ...mode,
      chat: {
        isChat: false,
        userToChat: {
          fromUserName: "",
          socketId: "",
        },
      },
    });
    console.log("CLIENT TO CLOSE CHAT ", me);
  };

  return (
    <SocketClientContext.Provider
      value={{
        call,
        callAccepted,
        ownVideo,
        callerVideo,
        stream,
        name,
        setName,
        callEnded,
        me,
        callMuted,
        callUserHandler,
        leaveCallHandler,
        answerCallHandler,
        muteCallHandler,
        unMuteCallHandler,
        users,
        setUsers,
        mode,
        chatIndividualHandler,
        closeChatWindowHandler,
        openIndividualHandler,
        chatMessages,
      }}
    >
      {children}
    </SocketClientContext.Provider>
  );
};

export { ContextProvider, SocketClientContext };
