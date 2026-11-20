
const fs = require("fs");
const path = require("path");

const rutaArchivo = path.join(
    __dirname,
    "../data/prospectos.json"
);

// Obtener todos los prospectos
function obtenerTodos() {
    const contenido = fs.readFileSync(rutaArchivo, "utf8");
    return JSON.parse(contenido);
}

// Guardar todos los prospectos
function guardarTodos(prospectos) {
    fs.writeFileSync(
        rutaArchivo,
        JSON.stringify(prospectos, null, 2),
        "utf8"
    );
}

// Crear un nuevo prospecto
function crearProspecto(datos) {
    const prospectos = obtenerTodos();

    const ultimoNumero = prospectos.reduce((maximo, prospecto) => {
        const numero = parseInt(prospecto.id.replace("P", ""), 10);
        return Math.max(maximo, numero);
    }, 0);

    const nuevoNumero = (ultimoNumero + 1)
        .toString()
        .padStart(3, "0");

    const fechaActual = new Date()
        .toISOString()
        .split("T")[0];

    const nuevoProspecto = {
        id: `P${nuevoNumero}`,
        sede: datos.sede,
        canal: datos.canal,
        etapa: "Prospecto",
        fechaIngreso: fechaActual,
        fechaUltimoAvance: fechaActual
    };

    prospectos.push(nuevoProspecto);
    guardarTodos(prospectos);

    return nuevoProspecto;
}

// Actualizar la etapa de un prospecto
function actualizarEtapa(id, nuevaEtapa) {
    const prospectos = obtenerTodos();

    const prospecto = prospectos.find(p => p.id === id);

    if (!prospecto) {
        return null;
    }

    prospecto.etapa = nuevaEtapa;

    prospecto.fechaUltimoAvance = new Date()
        .toISOString()
        .split("T")[0];

    guardarTodos(prospectos);

    return prospecto;
}

// Obtener métricas del embudo CRM
function obtenerMetricas() {
    const prospectos = obtenerTodos();

    const totalProspectos = prospectos.length;

    // Contar prospectos por etapa
    const etapas = {};

    prospectos.forEach(prospecto => {
        const etapa = prospecto.etapa;

        if (!etapas[etapa]) {
            etapas[etapa] = 0;
        }

        etapas[etapa]++;
    });

    // Contar prospectos convertidos
    const convertidos = prospectos.filter(
        prospecto => prospecto.etapa === "Convertido"
    ).length;

    // Contar prospectos perdidos
    const perdidos = prospectos.filter(
        prospecto => prospecto.etapa === "Perdido"
    ).length;

    // Calcular porcentaje de conversión
    const conversion = totalProspectos > 0
        ? ((convertidos / totalProspectos) * 100).toFixed(2)
        : "0.00";

    // Calcular porcentaje de fuga
    const fuga = totalProspectos > 0
        ? ((perdidos / totalProspectos) * 100).toFixed(2)
        : "0.00";

    return {
        totalProspectos,
        etapas,
        convertidos,
        perdidos,
        conversion: `${conversion}%`,
        fuga: `${fuga}%`
    };
}

// Exportar funciones del servicio
module.exports = {
    obtenerTodos,
    crearProspecto,
    actualizarEtapa,
    obtenerMetricas
};
