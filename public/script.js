let socket = io();
let data = [];

function getOnline() {
    socket.emit('getUsers');
}

function redraw() {
    $(".data").empty();
    let i = 0;
    data.forEach(item => {
        $(".data").append('<li class="list-group-item" id="item_' + i + '">' + item + '</li>');
        i++;
    });
}

function loadPreset() {
    socket.emit('getPreset');
}

function addPlayer(event) {
    event.preventDefault();
    const input = $(".form-control").val();
    socket.emit('addPlayer', input);
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
getOnline();
$('.toast').toast();


socket.on('connected', (d) => {
    $('#loading').prop('hidden', true);
    data = d;
    redraw();
});

socket.on('updatedData', (d) => {
    data = d;
    redraw();
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





