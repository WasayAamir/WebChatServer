let ws;

function newRoom() {
    fetch("http://localhost:8080/WSChatServer-1.0-SNAPSHOT/chat-servlet?action=new")
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            let roomCode = data.rooms[0]; // Extract the room code from the response data
            console.log('New room created with code:', roomCode); // Log the room code

            // Append the new room code beside the button
            let roomCodeContainer = document.getElementById('room-code');
            roomCodeContainer.textContent = "Room Code: " + roomCode;

            // Enter the room with the extracted code
            enterRoom(roomCode);
        })
        .catch(error => {
            console.error('Error creating new room:', error);
        });
}


// Register the event listener for sending messages
document.getElementById("input").addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        let request = {"type":"chat", "msg":event.target.value};
        ws.send(JSON.stringify(request));
        event.target.value = "";
    }
});

function enterRoom(code) {
    ws = new WebSocket("ws://localhost:8080/WSChatServer-1.0-SNAPSHOT/ws/" + code);

    ws.onmessage = function (event) {
        console.log(event.data);
        let message = JSON.parse(event.data);

        if (message.type === "chat") {
            document.getElementById("log").value += "[" + timestamp() + "] " + message.message + "\n";
        } else if (message.type === "image") {
            let imageData = message.imageData;
            let imgElement = document.createElement('img');
            imgElement.src = imageData;
            document.getElementById("log").appendChild(imgElement);
            document.getElementById("log").appendChild(document.createElement('br'));
        }
    }
}


function refreshRooms() {
    fetch("http://localhost:8080/WSChatServer-1.0-SNAPSHOT/chat-servlet")
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            let roomList = data.rooms; // Extract the list of rooms from the response data
            console.log("Received room list:", roomList); // Log the received room list
            displayRooms(roomList); // Display the list of rooms
        })
        .catch(error => {
            console.error('Error refreshing rooms:', error);
        });
}

function joinRoom() {
    // Function to join a room
    let roomCodeInput = document.getElementById('join-room-code');
    let roomCode = roomCodeInput.value.trim();
    if (roomCode !== '') {
        // Enter the room with the given code
        enterRoom(roomCode);
        // Clear input field
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
function displayRooms(rooms) {
    let roomListContainer = document.getElementById('chat-room-list');
    roomListContainer.innerHTML = ''; // Clear previous room list

    if (rooms.length === 0) {
        // If there are no rooms, display a message or leave the list blank
        roomListContainer.innerHTML = '<li>No active rooms</li>';
    } else {
        rooms.forEach(room => {
            let roomListItem = document.createElement('li');
            let roomLink = document.createElement('a');
            roomLink.href = "#"; // You can set the href attribute to the actual chat room URL
            roomLink.textContent = room;

            // Add event listener to the room link
            roomLink.addEventListener('click', function(event) {
                event.preventDefault(); // Prevent the default link behavior
                enterRoom(room); // Call the function to enter the chat room when the link is clicked
                document.getElementById("room-code").textContent = "Room Code: " + room;
            });

            roomListItem.appendChild(roomLink);
            roomListContainer.appendChild(roomListItem);
        });
    }
}


function sendMessage() {
    let inputElement = document.getElementById("input");
    let message = inputElement.value.trim();
    if (message !== '') {
        let request = {"type":"chat", "msg": message};
        ws.send(JSON.stringify(request));
        inputElement.value = ""; // Clear the input field after sending the message
    }
}