let express = require('express')

let app = express();
let http = require('http').createServer(app);
let io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

let preset = [
    "Darastrix",
    "Pedigis",
    "Shelly",
    "Fluffy Sunshine",
    "Gabriel"
];

let data = [
    "Darastrix",
    "Pedigis",
    "Shelly",
    "Fluffy Sunshine",
    "Gabriel"
];

let online = 0;

io.on('connection', (socket) => {
    console.log("User has connected to web page" + socket.id)
    socket.emit('connected', data);
    online++;
    socket.on('disconnect', () => {
        console.log("User has disconnected to web page" + socket.id)
        online--;
        io.emit('userCount', online);
    });


    io.emit('userCount', online);
    socket.on('updateData', (d) => {
        if (d.length != data.length) {
            socket.emit('inputError', 'Invalid action, refreshing');
            return;
        }
        data = d;
        io.emit('updatedData', data);
        socket.emit('success', 'Successfully updated');
    });

    socket.on('addPlayer', (input) => {
        console.log(data);
        if (input == '') {
            socket.emit('inputError', 'Input is empty');
            return;
        }
        if (data.includes(input)) {
            socket.emit('inputError', 'Name is already inputed');
            return;
        }

        data.push(input);
        socket.emit('success', 'Successfully added');
        io.emit('updatedData', data);
    });

    socket.on('getUsers', () => {
        socket.emit('userCount', online);
    });
    socket.on('getPreset', () => {
        data = preset;
        io.emit('updatedData', data);
    });
    socket.on('getData', () => {
        io.emit('updatedData', data);
    });
});


http.listen(3000, () => {
    console.log('listening on *:3000');
});