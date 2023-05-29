const socket = io('http://localhost:3000');
socket.on('control', (data) => {
  console.log(data);
});
