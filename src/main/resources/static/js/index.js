let stompClient = null;
let socket = null;
const activeSubscriptions = {};

// Función para actualizar estado de conexión
function updateConnectionStatus(status) {
  const statusElement = document.getElementById("connectionStatus");
  statusElement.textContent = status;
  statusElement.className = "connection-status " + status.toLowerCase();
}

// Conexión WebSocket
function connect() {
  updateConnectionStatus("Conectando...");

  socket = new WebSocket("ws://localhost:8080/ws");
  stompClient = Stomp.over(socket);

  stompClient.connect(
    {},
    function (frame) {
      updateConnectionStatus("Conectado");
      enableControls(true);
      console.log("Conectado: " + frame);
    },
    function (error) {
      console.error("Error de conexión: " + error);
      updateConnectionStatus("Error");
      setTimeout(connect, 5000);
    }
  );

  socket.onclose = function () {
    updateConnectionStatus("Desconectado");
    enableControls(false);
  };
}

function enableControls(connected) {
  document.getElementById("subscribeChannel").disabled = !connected;
  document.getElementById("sendEndpoint").disabled = !connected;
  document.getElementById("message").disabled = !connected;
}

// Suscripción a canal
function subscribe() {
  const channelInput = document.getElementById("subscribeChannel");
  const channel = channelInput.value.trim();
  const errorElement = document.getElementById("subscribeChannelError");
  const successElement = document.getElementById("subscriptionSuccess");

  if (
    !validateField(channelInput, errorElement, "El canal no puede estar vacío")
  ) {
    return;
  }

  if (activeSubscriptions[channel]) {
    successElement.textContent = `Ya estás suscrito a: ${channel}`;
    return;
  }

  const subscription = stompClient.subscribe(channel, function (message) {
    addMessageToUI("messagesReceived", channel, message.body);
  });

  activeSubscriptions[channel] = subscription;
  updateSubscriptionsList();

  successElement.textContent = `Suscrito a: ${channel}`;
  channelInput.value = "";
}

function unsubscribeCurrent() {
  const channelInput = document.getElementById("subscribeChannel");
  const channel = channelInput.value.trim();

  if (!channel) {
    showAlert("Ingrese el canal a desuscribirse");
    return;
  }

  unsubscribe(channel);
}

function unsubscribe(channel) {
  if (activeSubscriptions[channel]) {
    activeSubscriptions[channel].unsubscribe();
    delete activeSubscriptions[channel];
    updateSubscriptionsList();
    document.getElementById(
      "subscriptionSuccess"
    ).textContent = `Desuscrito de: ${channel}`;
    return true;
  }

  showAlert(`No estás suscrito a: ${channel}`);
  return false;
}

function updateSubscriptionsList() {
  const list = document.getElementById("activeSubscriptions");
  list.innerHTML = "";

  Object.keys(activeSubscriptions).forEach((channel) => {
    const item = document.createElement("li");
    item.className = "list-group-item subscription-item";

    const channelSpan = document.createElement("span");
    channelSpan.textContent = channel;

    const unsubscribeBtn = document.createElement("button");
    unsubscribeBtn.className = "btn btn-sm btn-outline-danger";
    unsubscribeBtn.textContent = "Desuscribir";
    unsubscribeBtn.onclick = () => unsubscribe(channel);

    item.appendChild(channelSpan);
    item.appendChild(unsubscribeBtn);
    list.appendChild(item);
  });
}

// Envío de mensajes con endpoint exacto
function sendMessage() {
  const endpointInput = document.getElementById("sendEndpoint");
  const messageInput = document.getElementById("message");
  const endpoint = endpointInput.value.trim();
  const message = messageInput.value.trim();

  if (
    !validateField(
      endpointInput,
      document.getElementById("sendEndpointError"),
      "El endpoint no puede estar vacío"
    ) ||
    !validateField(
      messageInput,
      document.getElementById("messageError"),
      "El mensaje no puede estar vacío"
    )
  ) {
    return;
  }

  const messageRequest = {
    message: message,
  };

  try {
    // Envía exactamente el endpoint que escribió el usuario
    stompClient.send(endpoint, {}, JSON.stringify(messageRequest));
    addMessageToUI("messagesSent", endpoint, message);
    messageInput.value = "";
  } catch (error) {
    showAlert("Error al enviar mensaje: " + error);
  }
}

// Funciones auxiliares
function validateField(field, errorElement, errorMessage) {
  if (!field.value.trim()) {
    field.classList.add("is-invalid");
    errorElement.textContent = errorMessage;
    return false;
  }
  field.classList.remove("is-invalid");
  errorElement.textContent = "";
  return true;
}

function addMessageToUI(listId, destination, content) {
    const list = document.getElementById(listId);
    const item = document.createElement('li');
    item.className = 'message-item';
    
    const destinationElement = document.createElement('div');
    destinationElement.className = 'message-destination';
    destinationElement.textContent = destination + ':';
    
    const contentElement = document.createElement('div');
    contentElement.className = 'message-content';
    contentElement.textContent = content;
    
    const timestampElement = document.createElement('div');
    timestampElement.className = 'message-timestamp';
    timestampElement.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
    
    item.appendChild(destinationElement);
    item.appendChild(contentElement);
    item.appendChild(timestampElement);
    
    list.appendChild(item);
    
    // Auto-scroll al final
    list.scrollTop = list.scrollHeight;
}

function showAlert(message) {
  alert(message);
}

// Event listeners
document
  .getElementById("subscribeChannel")
  .addEventListener("input", function () {
    this.classList.remove("is-invalid");
    document.getElementById("subscribeChannelError").textContent = "";
  });

document.getElementById("sendEndpoint").addEventListener("input", function () {
  this.classList.remove("is-invalid");
  document.getElementById("sendEndpointError").textContent = "";
});

document.getElementById("message").addEventListener("input", function () {
  this.classList.remove("is-invalid");
  document.getElementById("messageError").textContent = "";
});

// Iniciar conexión al cargar la página
window.onload = function () {
  connect();
};
