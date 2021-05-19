/**

 Создадим мини-приложуху на веб-сокетах

 1. Чел кидает запрос серверу, мол, хочу играть.
 Структура:
 {
   name: ***
 }

 2. Ему открывается веб-сокет и присылается токен, который будет собсна использоваться для доступа к игре
 Структура
 {
    token: ***
 }

 3. Сервер ожидает подключение ещё одного игрока и соединяет его с первым.

 4. Игра начинается!

 */

const startPage = (req, res) => {
    fs.readFile(__dirname + '/index.html', (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }
        res.writeHead(200);
        res.end(data);
    });
}

const APISchemeByURIs = {
    GET: {
        '': startPage
    }
}

//SERVER STUFF

const http = require('http');
const fs = require("fs");
// const wss = new ws.Server({server: server});

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    const url = req.url.replace(/^\//, '').replace(/\/$/, '')

    const handler = APISchemeByURIs[req.method.toUpperCase()][url.toLowerCase()]
    if (!handler) {
        res.statusCode = 404
        res.end('Route not found')

    }

    if (typeof handler === 'function') handler(req, res)

    // res.statusCode = 200;
    // res.setHeader('Content-Type', 'text/plain');
    // res.end('Hello World');
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});


///////////// WEB SOCKETS

const players = []

const Player = require('./Player.js')

const ws = new require('ws');
const WebSocketServer = new ws.Server({port: 8081});
let webSocket = null

WebSocketServer.on('connection', socket => {
    webSocket = socket
    // players.push({
    //     socket: ws
    // })
    // ws.send('Hey there!')

    console.log('connection established!')

    socket.on('message', function (data) {
        console.log('Message', data)
        handleEvent(JSON.parse(data))
        // data = JSON.parse(data)
        // if (data.type === 'init') {
        //     players.push(new Player(data.name, ws))
        // }
    })

    socket.on('close', function () {
        console.log('CLOSE')
    })
})

function handleEvent(event) {
    if (event.type === 'init') {
        const newPlayer = new Player(event.name, webSocket)
        webSocket.send(JSON.stringify({
            token: Date.now().toLocaleString() + event.name,
            type: 'init'
        }))

        for (let player of players) {
            if (!player.isPlaying) {
                player.setOpponent(newPlayer)
                newPlayer.setOpponent(player)
                webSocket.send(JSON.stringify({
                    opponent: player.name,
                    type: 'game_start'
                }))

                player.socket.send(JSON.stringify({
                    opponent: newPlayer.name,
                    type: 'game_start'
                }))

                break
            }
        }

        players.push(newPlayer)
    }
}
