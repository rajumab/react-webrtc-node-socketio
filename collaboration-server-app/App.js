const express = require('express');
const cors = require('cors');

const app = express();
const server = require('http').createServer(app);
const uuid = require('uuid');

const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Welcome to Express App');
});

let users = [];
let chatMessages = [];

io.on('connection', (socket) => {
  console.log('NEW SOCKET CONNECTION HAS ESTABLISHED');

  // Listen for new user
  socket.on('new-user', (name) => {
    console.log('New User Connected', socket.id, name);
    if (users.findIndex((user) => user.socketId === socket.id) === -1) {
      users.push({ socketId: socket.id, name: name || socket.id });
    }
    // Notify Self
    socket.emit('welcome-own-message', {
      user: {
        socketId: socket.id,
        name: name,
      },
      message: `Hello ${name} you have joined successfully.`,
    });

    // Notify All
    io.sockets.emit('refresh-users', users);
  });

  // notify chat message to individual user
  socket.on(
    'chat-individual-message',
    ({ toUser, message, fromUser, fromUserName }) => {
      console.log('#$#$#', toUser, message, fromUser, fromUserName);

      let toUserName =
        users.filter((user) => user.socketId === toUser)[0].name || '';
      // Manage Database operation here
      chatMessages.push({
        messageId: uuid.v4(),
        fromUser,
        fromUserName,
        toUser,
        toUserName,
        time: new Date(),
        message: message,
      });

      const messages = chatMessages.filter(
        (message) =>
          (message.toUser === toUser && message.fromUser === fromUser) ||
          (message.toUser === fromUser && message.fromUser === toUser)
      );
      console.log('@@@@', messages);
      // Send message to receiver
      io.to(toUser).emit('chat-message-receiver', {
        fromUser,
        messages,
        fromUserName,
      });
      // Send message to sender
      io.to(fromUser).emit('chat-message-sender', {
        fromUser,
        messages,
        fromUserName,
      });
    }
  );

  // Load old chat message to individual user
  socket.on('load-chat-message', ({ toUser, fromUser, fromUserName }) => {
    console.log('#$#$#', toUser, fromUser);

    let toUserName =
      users.filter((user) => user.socketId === toUser)[0].name || '';

    const messages = chatMessages.filter(
      (message) =>
        (message.toUser === toUser && message.fromUser === fromUser) ||
        (message.toUser === fromUser && message.fromUser === toUser)
    );
    console.log('@@@@', messages);
    // Send message to receiver
    io.to(toUser).emit('chat-message-receiver', {
      fromUser,
      messages,
      fromUserName,
    });
    // Send message to sender
    io.to(fromUser).emit('chat-message-sender', {
      fromUser,
      messages,
      fromUserName,
    });
  });

  // notify end user to about call information
  socket.on('initiate-call', ({ toUser, signalData, fromUser, name }) => {
    io.to(toUser).emit('initiate-call', { signal: signalData, fromUser, name });
  });

  // notify end user to end the call
  socket.on('ended-call', ({ fromUser }) => {
    io.to(fromUser).emit('ended-call', { fromUser });
  });

  socket.on('received-call', (data) => {
    console.log('RECEIVE CALL', data.to);
    io.to(data.to).emit('received-call', data.signal);
  });

  socket.on('disconnect', () => {
    console.log('SOCKET CONNECTION GOT DISCONNECTED');

    users = users.filter((user) => user.socketId !== socket.id);
    // If call is going on ended the call
    socket.broadcast.emit('call-ended');

    // Notify Others
    socket.broadcast.emit('refresh-users', users);
  });
});

server.listen(PORT, () => console.log(`App Server is running on port ${PORT}`));
