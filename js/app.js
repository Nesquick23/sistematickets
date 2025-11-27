class Message {
    constructor(nombre, email, texto, prioridad) {
        this.id = Date.now(); // ID único
        this.nombre = nombre;
        this.email = email;
        this.texto = texto;
        this.prioridad = prioridad;
        this.fecha = new Date().toLocaleString();
        this.leido = false;
    }

    toHTML() {
        return `
            <li class="list-group-item d-flex justify-content-between align-items-start
            ${this.leido ? "ticket-leido" : ""} ticket-${this.prioridad}">
                <div>
                    <strong>${this.nombre}</strong> (${this.email})
                    <p class="m-0">${this.texto}</p>
                    <small>ID: ${this.id} | ${this.fecha}</small>
                </div>
                <div>
                    <button class="btn btn-success btn-sm" onclick="marcarLeido(${this.id})">✔</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminar(${this.id})">🗑</button>
                </div>
            </li>`;
    }
}

// Cargar tickets desde localStorage
let tickets = JSON.parse(localStorage.getItem("tickets")) || [];

function guardar() {
    localStorage.setItem("tickets", JSON.stringify(tickets));
}

function render() {
    const ul = document.getElementById("listaTickets");
    ul.innerHTML = "";

    const filtro = document.getElementById("filtrarPrio").value;
    const busqueda = document.getElementById("buscarTexto").value.toLowerCase();
    const tipoBusqueda = document.getElementById("tipoBusqueda").value; // ID, nombre o mensaje

    let urgentes = 0;

    tickets
        .filter(t => filtro === "todas" || t.prioridad === filtro)
        .filter(t => {
            if (!busqueda) return true; // Si no hay búsqueda, muestra todo

            switch(tipoBusqueda) {
                case "id":
                    return t.id.toString().includes(busqueda);
                case "nombre":
                    return t.nombre.toLowerCase().includes(busqueda);
                case "mensaje":
                    return t.texto.toLowerCase().includes(busqueda);
                default:
                    return true;
            }
        })
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .forEach(t => {
            ul.innerHTML += new Message(t.nombre, t.email, t.texto, t.prioridad).toHTML();
            if (t.prioridad === "alta") urgentes++;
        });

    document.getElementById("urgentes").innerText = `${urgentes} Urgentes`;
}

// Validación del formulario
function validar() {
    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const mensaje = document.getElementById("mensaje").value.trim();

    let ok = true;
    document.getElementById("errNombre").textContent = nombre.length < 3 ? "Mínimo 3 caracteres" : "";
    document.getElementById("errEmail").textContent = !email.includes("@") ? "Email inválido" : "";
    document.getElementById("errMensaje").textContent = mensaje.length < 10 ? "Mínimo 10 caracteres" : "";

    if (nombre.length < 3 || !email.includes("@") || mensaje.length < 10) ok = false;
    return ok;
}

// Crear nuevo ticket
document.getElementById("ticketForm").addEventListener("submit", e => {
    e.preventDefault();
    if (!validar()) return;

    const obj = new Message(
        document.getElementById("nombre").value,
        document.getElementById("email").value,
        document.getElementById("mensaje").value,
        document.getElementById("prioridad").value
    );

    tickets.push(obj);
    guardar();
    render();
    e.target.reset();
});

// Eliminar ticket por índice
function eliminar(i) {
    tickets.splice(i, 1); // Elimina el ticket del array
    guardar();            // Guarda cambios en localStorage
    render();             // Vuelve a dibujar la lista
}

// Marcar ticket leído / no leído por índice
function marcarLeido(i) {
    tickets[i].leido = !tickets[i].leido; // Cambia el estado de leído
    guardar();                             // Guarda cambios en localStorage
    render();                              // Vuelve a dibujar la lista
}

// Eventos de filtros y búsqueda
document.getElementById("filtrarPrio").onchange = render;
document.getElementById("buscarTexto").onkeyup = render;
document.getElementById("tipoBusqueda").onchange = render; // Para cambiar entre ID, nombre o mensaje

// Render inicial
render();
