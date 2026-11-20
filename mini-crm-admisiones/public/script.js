
// ==========================================
// CONFIGURACIÓN
// ==========================================

// Si tu backend utiliza /api, cambia esta línea a:
// const API_URL = "/api";

const API_URL = "";

// Etapas disponibles en el CRM
const ETAPAS = [
    "Prospecto",
    "Contactado",
    "Interesado",
    "Inscrito",
    "Convertido",
    "Perdido"
];

// ==========================================
// ELEMENTOS DEL HTML
// ==========================================

const formProspecto = document.getElementById("formProspecto");
const tablaProspectos = document.getElementById("tablaProspectos");
const tablaAtencion = document.getElementById("tablaAtencion");
const buscarProspecto = document.getElementById("buscarProspecto");
const mensajeFormulario = document.getElementById("mensajeFormulario");
const btnActualizar = document.getElementById("btnActualizar");

let listaProspectos = [];

// ==========================================
// FUNCIONES GENERALES
// ==========================================

async function consultarAPI(endpoint, opciones = {}) {
    const respuesta = await fetch(`${API_URL}${endpoint}`, {
        ...opciones,
        headers: {
            "Content-Type": "application/json",
            ...(opciones.headers || {})
        }
    });

    const resultado = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
        throw new Error(
            resultado.mensaje ||
            resultado.error ||
            `Error HTTP ${respuesta.status}`
        );
    }

    return resultado;
}

function mostrarMensaje(texto, tipo) {
    mensajeFormulario.textContent = texto;
    mensajeFormulario.className = `form-message ${tipo}`;
}

function obtenerDatos(resultado) {
    return resultado.datos ?? resultado;
}

function obtenerClaseEtapa(etapa) {
    const valor = String(etapa || "").toLowerCase();

    if (valor === "prospecto") return "stage-prospecto";
    if (valor === "convertido") return "stage-convertido";
    if (valor === "perdido") return "stage-perdido";

    return "stage-other";
}

function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caracter => {
        const caracteres = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return caracteres[caracter];
    });
}

function mostrarFechaActual() {
    const fecha = new Date();

    document.getElementById("fechaActual").textContent =
        fecha.toLocaleDateString("es-CR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
}

// ==========================================
// 1. CONSULTAR PROSPECTOS
// ==========================================

async function cargarProspectos() {
    try {
        const resultado = await consultarAPI("/prospectos");
        const datos = obtenerDatos(resultado);

        // Permite recibir directamente un arreglo o un objeto con prospectos.
        listaProspectos = Array.isArray(datos)
            ? datos
            : (datos.prospectos || []);

        mostrarProspectos(listaProspectos);

    } catch (error) {
        tablaProspectos.innerHTML = `
            <tr>
                <td colspan="6" class="table-error">
                    No se pudieron cargar los prospectos:
                    ${escaparHTML(error.message)}
                </td>
            </tr>
        `;
    }
}

// ==========================================
// 2. MOSTRAR PROSPECTOS EN LA TABLA
// ==========================================

function mostrarProspectos(prospectos) {
    if (!prospectos.length) {
        tablaProspectos.innerHTML = `
            <tr>
                <td colspan="6" class="empty-message">
                    Todavía no hay prospectos registrados.
                </td>
            </tr>
        `;
        return;
    }

    tablaProspectos.innerHTML = prospectos.map(prospecto => {
        const opcionesEtapa = ETAPAS.map(etapa => `
            <option
                value="${escaparHTML(etapa)}"
                ${prospecto.etapa === etapa ? "selected" : ""}
            >
                ${escaparHTML(etapa)}
            </option>
        `).join("");

        return `
            <tr>
                <td class="id-cell">${escaparHTML(prospecto.id)}</td>
                <td>${escaparHTML(prospecto.sede)}</td>
                <td>${escaparHTML(prospecto.canal)}</td>
                <td>
                    <span class="stage-badge ${obtenerClaseEtapa(prospecto.etapa)}">
                        ${escaparHTML(prospecto.etapa)}
                    </span>
                </td>
                <td>${escaparHTML(prospecto.fechaUltimoAvance || "-")}</td>
                <td>
                    <select
                        class="stage-select"
                        data-id="${escaparHTML(prospecto.id)}"
                        aria-label="Cambiar etapa de ${escaparHTML(prospecto.id)}"
                    >
                        ${opcionesEtapa}
                    </select>
                </td>
            </tr>
        `;
    }).join("");
}

// ==========================================
// 3. REGISTRAR NUEVO PROSPECTO
// ==========================================

formProspecto.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const sede = document.getElementById("sede").value.trim();
    const canal = document.getElementById("canal").value;

    if (!sede || !canal) {
        mostrarMensaje("Completa todos los campos.", "error");
        return;
    }

    try {
        const resultado = await consultarAPI("/prospectos", {
            method: "POST",
            body: JSON.stringify({
                sede,
                canal
            })
        });

        mostrarMensaje(
            resultado.mensaje || "Prospecto registrado correctamente.",
            "success"
        );

        formProspecto.reset();

        await actualizarPanel();

    } catch (error) {
        mostrarMensaje(
            `No se pudo registrar el prospecto: ${error.message}`,
            "error"
        );
    }
});

// ==========================================
// 4. ACTUALIZAR ETAPA DE UN PROSPECTO
// ==========================================

tablaProspectos.addEventListener("change", async (evento) => {
    if (!evento.target.classList.contains("stage-select")) {
        return;
    }

    const id = evento.target.dataset.id;
    const nuevaEtapa = evento.target.value;

    evento.target.disabled = true;

    try {
        const resultado = await consultarAPI(
            `/prospectos/${encodeURIComponent(id)}/etapa`,
            {
                method: "PATCH",
                body: JSON.stringify({
                    nuevaEtapa
                })
            }
        );

        mostrarMensaje(
            resultado.mensaje || `Etapa de ${id} actualizada.`,
            "success"
        );

        await actualizarPanel();

    } catch (error) {
        mostrarMensaje(
            `No se pudo actualizar la etapa: ${error.message}`,
            "error"
        );

        await cargarProspectos();

    } finally {
        evento.target.disabled = false;
    }
});

// ==========================================
// 5. CARGAR MÉTRICAS DEL EMBUDO
// ==========================================

async function cargarEmbudo() {
    const grafico = document.getElementById("graficoEmbudo");

    try {
        const resultado = await consultarAPI("/embudo");
        const metricas = obtenerDatos(resultado);

        document.getElementById("totalProspectos").textContent =
            metricas.totalProspectos ?? 0;

        document.getElementById("totalConvertidos").textContent =
            metricas.convertidos ?? 0;

        document.getElementById("totalPerdidos").textContent =
            metricas.perdidos ?? 0;

        document.getElementById("tasaConversion").textContent =
            metricas.conversion ?? "0.00%";

        document.getElementById("embudoConversion").textContent =
            metricas.conversion ?? "0.00%";

        document.getElementById("embudoFuga").textContent =
            metricas.fuga ?? "0.00%";

        const etapas = metricas.etapas || {};
        const total = Number(metricas.totalProspectos) || 0;

        const nombresEtapas = Object.keys(etapas);

        if (!nombresEtapas.length) {
            grafico.innerHTML = `
                <p class="empty-message">No hay datos para mostrar.</p>
            `;
            return;
        }

        grafico.innerHTML = nombresEtapas.map(nombre => {
            const cantidad = Number(etapas[nombre]) || 0;
            const porcentaje = total > 0
                ? (cantidad / total) * 100
                : 0;

            return `
                <div class="funnel-item">
                    <span>${escaparHTML(nombre)}</span>
                    <div class="funnel-track">
                        <div
                            class="funnel-fill"
                            style="width: ${porcentaje}%"
                        ></div>
                    </div>
                    <span class="funnel-count">${cantidad}</span>
                </div>
            `;
        }).join("");

    } catch (error) {
        grafico.innerHTML = `
            <p class="table-error">
                No se pudieron cargar las métricas:
                ${escaparHTML(error.message)}
            </p>
        `;
    }
}

// ==========================================
// 6. CARGAR INFORMACIÓN DE ATENCIÓN
// ==========================================

async function cargarAtencion() {
    try {
        const resultado = await consultarAPI("/atencion");
        const datos = obtenerDatos(resultado);

        const prospectos = datos.prospectos || [];

        document.getElementById("requierenAtencion").textContent =
            datos.requierenAtencion ?? 0;

        document.getElementById("seguimientoPendiente").textContent =
            datos.seguimientoPendiente ?? 0;

        document.getElementById("totalAtencion").textContent =
            datos.total ?? prospectos.length;

        if (!prospectos.length) {
            tablaAtencion.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-message">
                        No hay prospectos para revisar.
                    </td>
                </tr>
            `;
            return;
        }

        tablaAtencion.innerHTML = prospectos.map(prospecto => {
            let clase = "attention-normal";

            if (prospecto.estadoAtencion === "Requiere atención") {
                clase = "attention-critical";
            } else if (
                prospecto.estadoAtencion === "Seguimiento pendiente"
            ) {
                clase = "attention-pending";
            }

            return `
                <tr>
                    <td class="id-cell">${escaparHTML(prospecto.id)}</td>
                    <td>${escaparHTML(prospecto.sede)}</td>
                    <td>${escaparHTML(prospecto.etapa)}</td>
                    <td>${escaparHTML(prospecto.fechaUltimoAvance)}</td>
                    <td>${escaparHTML(prospecto.diasSinAvance)}</td>
                    <td>
                        <span class="attention-badge ${clase}">
                            ${escaparHTML(prospecto.estadoAtencion)}
                        </span>
                    </td>
                </tr>
            `;
        }).join("");

    } catch (error) {
        tablaAtencion.innerHTML = `
            <tr>
                <td colspan="6" class="table-error">
                    No se pudo cargar la atención:
                    ${escaparHTML(error.message)}
                </td>
            </tr>
        `;
    }
}

// ==========================================
// 7. BUSCADOR DE PROSPECTOS
// ==========================================

buscarProspecto.addEventListener("input", () => {
    const busqueda = buscarProspecto.value.toLowerCase().trim();

    const filtrados = listaProspectos.filter(prospecto => {
        return [
            prospecto.id,
            prospecto.sede,
            prospecto.canal,
            prospecto.etapa
        ].some(valor =>
            String(valor ?? "").toLowerCase().includes(busqueda)
        );
    });

    mostrarProspectos(filtrados);
});

// ==========================================
// 8. ACTUALIZAR TODO EL PANEL
// ==========================================

async function actualizarPanel() {
    await Promise.all([
        cargarProspectos(),
        cargarEmbudo(),
        cargarAtencion()
    ]);
}

btnActualizar.addEventListener("click", actualizarPanel);

// ==========================================
// 9. INICIAR LA PÁGINA
// ==========================================

mostrarFechaActual();
actualizarPanel();
