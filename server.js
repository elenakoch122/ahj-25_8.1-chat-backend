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

// app.use(router());

const port = 7070;
const server = http.createServer(app.callback());

const wsServer = new WS.Server({server});

const chat = ['welcome to chat'];
const users = ['olga'];

wsServer.on('connection', (ws) => {
  console.log('connection done');
  ws.on('message', (message) => {
    if (message.type === 'register') {
      users.push(message.nickname);
    }

    if (message.type === 'message') {
      chat.push(message.post);

      const eventData = JSON.stringify({ chat: [post] });

      Array.from(wsServer.clients)
        .filter(client => client.readyState === WS.OPEN)
        .forEach(client => client.send(eventData));
    }
  });

  ws.send(JSON.stringify({ chat }));
});

server.listen(port, (err) => {
  if (err) {
    console.log('ошибка в listen', err);
    return;
  }
  console.log(`Server is listening to ${port}`);
});
