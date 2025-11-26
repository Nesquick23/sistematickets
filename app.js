class Message {
    constructor(nombre, email, texto, prioridad, fecha = new Date().toLocaleString(), leido = false) {
        this.nombre = nombre;
        this.email = email;
        this.texto = texto;
        this.prioridad = prioridad;
        this.fecha = fecha;
        this.leido = leido;
    }

    toHTML(id) {
        return `
            <li class="list-group-item d-flex justify-content-between align-items-start
            ${this.leido ? "ticket-leido" : ""} ticket-${this.prioridad}">
                <div>
                    <strong>${this.nombre}</strong> (${this.email})
                    <p class="m-0">${this.texto}</p>
                    <small>${this.fecha}</small>
                </div>
                <div>
                    <button class="btn btn-success btn-sm" onclick="marcarLeido(${id})">✔</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminar(${id})">🗑</button>
                </div>
            </li>`;
    }
}

let tickets = JSON.parse(localStorage.getItem("tickets")) || [];

function guardar() {
    localStorage.setItem("tickets", JSON.stringify(tickets));
}

function render() {
    const ul = document.getElementById("listaTickets");
    ul.innerHTML = "";

    let filtro = document.getElementById("filtrarPrio").value;
    let busqueda = document.getElementById("buscarTexto").value.toLowerCase();

    let urgentes = 0;

    tickets
        .filter(t => filtro === "todas" || t.prioridad === filtro)
        .filter(t => t.texto.toLowerCase().includes(busqueda))
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .forEach((t, i) => {
            ul.innerHTML += new Message(t.nombre, t.email, t.texto, t.prioridad, t.fecha, t.leido).toHTML(i);
            if (t.prioridad === "alta") urgentes++;
        });

    document.getElementById("urgentes").innerText = `${urgentes} Urgentes`;
}

function validar() {
    let ok = true;

    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const mensaje = document.getElementById("mensaje").value.trim();

    document.getElementById("errNombre").textContent = nombre.length < 3 ? "Mínimo 3 caracteres" : "";
    document.getElementById("errEmail").textContent = !email.includes("@") ? "Email inválido" : "";
    document.getElementById("errMensaje").textContent = mensaje.length < 10 ? "Mínimo 10 caracteres" : "";

    if (nombre.length < 3 || !email.includes("@") || mensaje.length < 10) ok = false;
    return ok;
}

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

function eliminar(i) {
    tickets.splice(i, 1);
    guardar();
    render();
}

function marcarLeido(i) {
    tickets[i].leido = !tickets[i].leido;
    guardar();
    render();
}

document.getElementById("filtrarPrio").onchange = render;
document.getElementById("buscarTexto").onkeyup = render;

render();
