const http = require('http');
const Koa = require('koa');
const { koaBody } = require('koa-body');
const cors = require('@koa/cors');
const WS = require('ws');
const uuid = require('uuid');

const app = new Koa();

app.use(cors());

app.use(koaBody({
  urlencoded: true,
  multipart: true,
  json: true
}));

// let chatClients = {};

const chat = [{
  user: 'olga',
  message: 'welcome to chat',
  day: '20.03.2023',
  time: '10:03'
}];
const users = ['olga'];

app.use(async (ctx) => {
  if (ctx.request.method !== 'GET') return;

  ctx.response.set('Access-Control-Allow-Origin', '*');
  ctx.response.body = users;
});

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback());

const wssServer = new WS.Server({server});

wssServer.on('connection', (ws) => {
  // const id = uuid.v4();

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'register') {
      users.push(data.nickname);
      // chatClients[id] = data.nickname;

      Array.from(wssServer.clients)
        .filter(client => client.readyState === WS.OPEN)
        .forEach(client => client.send(JSON.stringify({
          type: 'users',
          users,
        })));
      return;
    }

    if (data.type === 'message') {
      chat.push(data.post);

      Array.from(wssServer.clients)
        .filter(client => client.readyState === WS.OPEN)
        .forEach(client => client.send(JSON.stringify({
          type: 'message',
          message: data.post,
        })));
        return;
    }
  });

  ws.on('close', () => {
    // users = users.filter(u => u !== chatClients[id]);
    // delete chatClients[id];

    Array.from(wssServer.clients)
    .filter(client => client.readyState === WS.OPEN)
    .forEach(client => client.send(JSON.stringify({
      type: 'users',
      users,
    })));
    return;
  });

  ws.send(JSON.stringify({ type: 'allMessages', chat }));
});

server.listen(port, (err) => {
  if (err) {
    console.log('ошибка в listen', err);
    return;
  }
  console.log(`Server is listening to ${port}`);
});
