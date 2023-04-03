const http = require('http');
const Koa = require('koa');
const { koaBody } = require('koa-body');
const cors = require('@koa/cors');
const WS = require('ws');

const app = new Koa();

app.use(cors());

app.use(koaBody({
  urlencoded: true,
  multipart: true,
  json: true
}));

const chat = [{
  user: 'olga',
  message: 'welcome to chat',
  day: '20.03.2023',
  time: '10:03'
}];
const users = ['olga'];

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback());

const wssServer = new WS.Server({server});

wssServer.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'register') {
      users.push(data.nickname);

      Array.from(wssServer.clients)
        .filter(client => client.readyState === WS.OPEN)
        .forEach(client => client.send(JSON.stringify({
          type: 'users',
          users
        })));
      return;
    }

    if (data.type === 'message') {
      chat.push(data.post);

      const eventData = JSON.stringify({ chat: [post] });

      Array.from(wssServer.clients)
        .filter(client => client.readyState === WS.OPEN)
        .forEach(client => client.send(eventData));
    }

    if (data.type === 'exit') {
      users = users.filter(u => u !== data.nickname);
    }

    ws.send(JSON.stringify({ chat, users }));
  });

  ws.send(JSON.stringify({ chat, users }));
});

server.listen(port, (err) => {
  if (err) {
    console.log('ошибка в listen', err);
    return;
  }
  console.log(`Server is listening to ${port}`);
});
