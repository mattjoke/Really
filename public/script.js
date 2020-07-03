let socket = io();
let data = [];

let pointer = 0;

function getOnline() {
    socket.emit('getUsers');
}

function redraw() {
    $(".data").empty();
    let i = 0;
    data.forEach(item => {
        if (i == pointer) {
            $(".data").append('<li class="list-group-item bg-light" id="item_' + i + '">' + item + '</li>');
        } else {
            $(".data").append('<li class="list-group-item" id="item_' + i + '">' + item + '</li>');
        }
        i++;
    });
}

function draw() {
    $(".name").text(data[pointer]);
    let round = pointer;
    round++;
    if (round >= data.length) {
        round = 0;
    }

    $(".subname").text(data[round]);
    redraw();
}

function loadPreset() {
    socket.emit('getPreset');
}

function addPlayer(event) {
    event.preventDefault();
    const input = $(".form-control").val();
    socket.emit('addPlayer', input);
    $(".form-control").val('');
}

function nextRound() {
    socket.emit('nextRound');
}
function prevRound() {
    socket.emit('prevRound');
}

function deletePreset() {
    socket.emit('deletePreset');
}

function savePreset() {
    let dataIn = [];
    $('.data li').each(function () {
        dataIn.push($(this)[0].textContent);
    });
    socket.emit('savePreset', dataIn);
}

$(() => {
    $(".data").sortable({
        axis: "x",
        cursor: "grabbing",
        update: (event, ui) => {
            let out = [];
            $('.data li').each(function () {
                out.push($(this)[0].textContent);
            });
            socket.emit('updateData', out);
        }
    });
    $(".data").disableSelection();
});
$('.toast').toast();
getOnline();


socket.on('connected', (d) => {
    draw();
    $('#loading').prop('hidden', true);
    data = d;
    redraw();
});

socket.on('updatedData', (d) => {
    data = d;
    draw();
});

socket.on('userCount', (count) => {
    $(".users-online").text('Users online: ' + count);
});

socket.on('inputError', (str) => {
    $(".toast").addClass("bg-danger");
    $(".toast-name").text('Error!');
    $(".toast-body").text(str);
    $('.toast').toast('show');
    socket.emit('getData');
});

socket.on('success', (str) => {
    $(".toast").removeClass("bg-danger");
    $(".toast").addClass("bg-success");
    $(".toast-name").text('Success!');
    $(".toast-body").text(str);
    $('.toast').toast('show');
});

socket.on('roundNext', (p) => {
    pointer = p;
    draw();
});

socket.on('roundPrev', (p) => {
    pointer = p;
    draw();
});

socket.on('round', (r) => {
    pointer = r;
    draw();
});

