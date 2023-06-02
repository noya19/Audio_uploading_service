import http from 'http';
import { Server, Socket } from 'socket.io';

const server = http.createServer();
const ioServer = new Server(server, {
    cors: {
        origin: "*"
    }
});

let currentPlayTime: number = 0;
let isPlaying: boolean;
let isPaused: boolean;
let isSeeking: boolean;
let toUpdateflag: boolean;


ioServer.on('connection', socket => {
    console.log(`User: ${socket.id}`);

    // this means people have already started playing songs
    // if (isPlaying) {
    //     // 1. wait for currentTime to be updated and fire the "onTimeUpdated event"
    //     socket.on('currentTime', (data) => {
    //         // 1. update the current time
    //         currentPlayTime = data;
    //         // 2. emit to itself
    //         console.log("hello");
    //         const metatdata = {
    //             seekedTo: currentPlayTime,
    //             id: "asdfjlasdjlkf",
    //             message: `$seeked to ${currentPlayTime / 60}`
    //         }
    //         socket.emit('seek_song', metatdata);
    //         socket.emit('play_song', {
    //             id: socket.id,
    //             message: `started playing`
    //         });
    //     })
    // }





    // listening to user actions like play, pause, skip to next, etc

    socket.on('newUser', () => {
        //1. If playing sync with others
        if (isPlaying) {
            // 1. wait synchrnously for currentPlayTime to be update
            // 2. As soon as step 1 is done call a custom function which does 2 things
            // immediately
            // a. seek the player to currentTime + 2 ( we choose 2 secs in the future)
            // b. call a setTimeout for 2 secs in which we ask to play the song. This will
            // hopefully synchrnize the player.
            toUpdateflag = false;
            wait().then(() => {
                // console.log(toUpdateflag);
                if (toUpdateflag) {
                    const myTimetoPlay = currentPlayTime + 2.5;
                    setTimeout(() => {
                        socket.emit('play_song', {
                            id: "ItsMeButItsMyFirstTimeBeGentle",
                            message: "You started Playing"
                        });
                    }, 2000)
                    const metatdata = {
                        seekedTo: myTimetoPlay,
                        id: "ItsMeButItsMyFirstTimeBeGentle",
                        message: `$seeked to ${myTimetoPlay / 60}`
                    }
                    socket.emit('seek_song', metatdata);
                }
            })
        }


        //2. If paused just seek to the current time if current time!=0
        if (isPaused && currentPlayTime != 0) {
            const metatdata = {
                seekedTo: currentPlayTime,
                id: "ItsMeButItsMyFirstTimeBeGentle",
                message: `$seeked to ${currentPlayTime / 60}`
            }
            socket.emit('seek_song', metatdata);
        }
    })

    socket.on("play", (data) => {
        isPlaying = true;
        isPaused = false;
        socket.broadcast.emit('play_song', {
            id: socket.id,
            message: `User: ${socket.id} started playing`
        });
    })

    socket.on("pause", (data) => {
        isPaused = true;
        isPlaying = false;
        socket.broadcast.emit('pause_song', {
            id: socket.id,
            message: `User: ${socket.id} paused the song`
        });
    })

    socket.on('seeked', (data) => {
        isSeeking = false;
        currentPlayTime = data;
        const metatdata = {
            seekedTo: data,
            id: socket.id,
            message: `${socket.id} seeked the song to ${data / 60}`
        }
        socket.broadcast.emit('seek_song', metatdata);
    })

    socket.on('currentTime', (data) => {
        currentPlayTime = data;
        toUpdateflag = true;
        // console.log(currentPlayTime);
    })

    socket.on('disconnect', () => {
        console.log("User Disconnected", socket.id);
    })
})

function wait() {
    return new Promise((rs, rj) => {
        setTimeout(rs, 2000);
    })
}

server.listen(8000, () => {
    console.log("Websocket running on: 8000")
});