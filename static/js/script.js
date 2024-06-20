const roomName = document.getElementsByClassName(".active").textContent;

const chatSocket = new WebSocket("ws://" + window.location.host + "/");
const chatMessages = Qs(".messages");
const setRoomActive = (room_id) => {
  QsAll(".list-rooms li").forEach((el) => el.classList.remove("active"));
  QsAll(".list-rooms li button i").forEach((el) =>
    el.classList.remove("text-light")
  );
  Qs(`#room-${room_id}`).classList.add("active");
  Qs(`#room-${room_id} button i`).classList.add("text-light");
  Qs("#selected-room").value = room_id;
};

const getMessages = async (room_id) => {
  const response = await fetch(`/chat/${room_id}`);
  const html = await response.text();
  chatMessages.innerHTML = html;
  setRoomActive(room_id);
  chatMessages.scrollTo(0, chatMessages.scrollHeight);
};

// const sendMessage = async (data) => {
//   const response = await fetch(`/chat/${data.room_id}/send`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "X-CSRFToken": data.csrfmiddlewaretoken,
//     },
//     body: JSON.stringify(data),
//   });
//   const html = await response.text();
//   Qs(".send-message").reset();
//   chatMessages.scrollTo(0, chatMessages.scrollHeight);
chatSocket.onmessage = function (e) {
  const data = JSON.parse(e.data);
  document.querySelector(".messages").value += data.message + "\n";
};

chatSocket.onclose = function (e) {
  console.error("Chat socket closed unexpectedly");
};
// };
const getLastRoom = () => {
  Qs(".list-rooms li").click();
};

const createRoom = async (data) => {
  const response = await fetch(`/chat/create-room`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": data.csrfmiddlewaretoken,
    },
    body: JSON.stringify(data),
  });
  const html = await response.text();
  const listRooms = Qs(".list-rooms");
  listRooms.insertAdjacentHTML("afterbegin", html);
  const modal = bootstrap.Modal.getInstance(Qs(".modal"));
  Qs(".create-room").reset();
  modal.hide();
  getLastRoom();
};

const inviteUser = async (data) => {
  const room_id = Qs("#selected-room").value;
  fetch(`/chat/${room_id}/invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": data.csrfmiddlewaretoken,
    },
    body: JSON.stringify(data),
  });

  const modal = bootstrap.Modal.getInstance(Qs(".modal"));
  modal.hide();
};

////Events

//intercept sent message form
Qs(".send-message").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const message = JSON.stringify(data);
  const messageInputDom = document.querySelector("#chat-message-input");
  const uniqueMessageContainer = Qs(".unique-message");
  uniqueMessageContainer.insertAdjacentHTML("beforeend", message);
  chatSocket.send(
    JSON.stringify({
      message: message,
    })
  );
  messageInputDom.value = "";
});

//intercept create new room
Qs(".create-room").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  createRoom(data);
});

Qs(".invite-user").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  inviteUser(data);
});

//INIT
getLastRoom();
