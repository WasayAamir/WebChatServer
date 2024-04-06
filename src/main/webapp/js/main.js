// Define a WebSocket variable
let ws;

// Function to create a new chat room
function newRoom() {
    // Fetch request to create a new room
    fetch("http://localhost:8080/WSChatServer-1.0-SNAPSHOT/chat-servlet?action=new")
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Extract the room code from the response data
            let roomCode = data.rooms[0];
            console.log('New room created with code:', roomCode);

            // Display the room code beside the button
            let roomCodeContainer = document.getElementById('room-code');
            roomCodeContainer.textContent = "Room Code: " + roomCode;

            // Enter the room with the extracted code
            enterRoom(roomCode);
        })
        .catch(error => {
            console.error('Error creating new room:', error);
        });
}

// Function to enter a chat room
function enterRoom(code) {
    // Create a WebSocket connection to the chat room
    ws = new WebSocket("ws://localhost:8080/WSChatServer-1.0-SNAPSHOT/ws/" + code);

    // Event handler for incoming messages
    ws.onmessage = function (event) {
        console.log(event.data);
        let message = JSON.parse(event.data);

        // Display the incoming message in the chat log
        document.getElementById("log").value += "[" + timestamp() + "] " + message.message + "\n";
    }

    // Event listener for sending messages on Enter key press
    document.getElementById("input").addEventListener("keyup", function (event) {
        if (event.key === "Enter") {
            // Send the message when Enter key is pressed
            sendMessage();
        }
    });
}

// Function to refresh the list of active chat rooms
function refreshRooms() {
    // Fetch request to get the list of rooms
    fetch("http://localhost:8080/WSChatServer-1.0-SNAPSHOT/chat-servlet")
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Extract the list of rooms from the response data
            let roomList = data.rooms;
            console.log("Received room list:", roomList);

            // Display the list of rooms
            displayRooms(roomList);
        })
        .catch(error => {
            console.error('Error refreshing rooms:', error);
        });
}

// Function to join a specific chat room
function joinRoom() {
    let roomCodeInput = document.getElementById('join-room-code');
    let roomCode = roomCodeInput.value.trim();
    if (roomCode !== '') {
        enterRoom(roomCode);
        roomCodeInput.value = '';
    }
}

// Function to generate timestamp
function timestamp() {
    let d = new Date(), minutes = d.getMinutes();
    if (minutes < 10) minutes = '0' + minutes;
    return d.getHours() + ':' + minutes;
}

// Function to toggle the sidebar
function toggleNav() {
    console.log('Function called');
    var sidebar = document.getElementById("mySidebar");

    if (sidebar.style.width === "250px") {
        sidebar.style.width = "0";
    } else {
        sidebar.style.width = "250px";
    }
}

// Function to close the sidebar
function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
}

// Function to open the sidebar
function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
}

// Function to display the list of chat rooms
function displayRooms(rooms) {
    let roomListContainer = document.getElementById('chat-room-list');
    roomListContainer.innerHTML = ''; // Clear previous room list

    if (rooms.length === 0) {
        roomListContainer.innerHTML = '<li>No active rooms</li>';
    } else {
        rooms.forEach(room => {
            let roomListItem = document.createElement('li');
            let roomLink = document.createElement('a');
            roomLink.href = "#";
            roomLink.textContent = room;
            roomLink.addEventListener('click', function(event) {
                event.preventDefault();
                enterRoom(room);
                document.getElementById("room-code").textContent = "Room Code: " + room;
            });
            roomListItem.appendChild(roomLink);
            roomListContainer.appendChild(roomListItem);
        });
    }
}

// Function to send a message
function sendMessage() {
    let inputElement = document.getElementById("input");
    let message = inputElement.value.trim();
    if (message !== '') {
        let request = {"type":"chat", "msg": message};
        ws.send(JSON.stringify(request));
        inputElement.value = "";
    }
}
