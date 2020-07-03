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

let data = [];

let online = 0;
let round = 0;

io.on('connection', (socket) => {
    socket.emit('connected', data);
    online++;
    socket.on('disconnect', () => {
        online--;
        io.emit('userCount', online);
    });

    socket.emit('round', round);

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
        round = 0;
        io.emit('round', round);
        io.emit('updatedData', data);
    });
    socket.on('getData', () => {
        io.emit('updatedData', data);
    });

    socket.on('nextRound', () => {
        round++;
        if (round >= data.length) {
            round = 0;
        }
        io.emit('roundNext', round);
    });
    socket.on('prevRound', () => {
        round--;
        if (round < 0) {
            round = data.length - 1;
        }
        io.emit('roundPrev', round);
    });

    socket.on('savePreset', (data) => {
        if (data.length == 0) {
            socket.emit('inputError', "Can't save empty data");
            return;
        }
        preset = data;
        socket.emit('success', 'Preset is sucessfully saved');
    });

    socket.on('deletePreset', () => {
        if (preset == []) {
            socket.emit('inputError', 'Preset is already empty');
            return;
        }
        preset = [];
        socket.emit('success', 'Preset is deleted');
    })
});


http.listen(process.env.PORT, () => {
    console.log('listening on ' + process.env.PORT);
});