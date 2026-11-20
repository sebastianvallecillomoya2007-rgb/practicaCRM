
const fs = require("fs");
const path = require("path");

const etapas = [
    "Prospecto",
    "Candidato",
    "Agenda Campus Day",
    "Asiste Campus Day",
    "Prueba Técnica",
    "Entrevista",
    "Admitido",
    "Semana de Prueba",
    "Estudiante"
];

// Distribución de los 40 prospectos entre las etapas.
const cantidades = [8, 7, 8, 3, 4, 3, 2, 2, 3];

const sedes = ["Desamparados", "Puntarenas"];
const canales = ["Redes sociales", "Página web", "Referido", "Evento"];

function restarDias(fecha, dias) {
    const nuevaFecha = new Date(fecha);
    nuevaFecha.setUTCDate(nuevaFecha.getUTCDate() - dias);
    return nuevaFecha.toISOString().split("T")[0];
}

const hoy = new Date();
const prospectos = [];

let contador = 1;

etapas.forEach((etapa, indiceEtapa) => {
    for (let i = 0; i < cantidades[indiceEtapa]; i++) {
        const numero = contador.toString().padStart(3, "0");

        const diasUltimoAvance = (contador * 3) % 16;
        const diasDesdeIngreso = diasUltimoAvance + 5 + (contador % 20);

        const fechaUltimoAvance = restarDias(
            hoy,
            diasUltimoAvance
        );

        const fechaIngreso = restarDias(
            hoy,
            diasDesdeIngreso
        );

        prospectos.push({
            id: `P${numero}`,
            sede: sedes[contador % sedes.length],
            canal: canales[contador % canales.length],
            etapa: etapa,
            fechaIngreso: fechaIngreso,
            fechaUltimoAvance: fechaUltimoAvance
        });

        contador++;
    }
});

const rutaArchivo = path.join(__dirname, "prospectos.json");

fs.writeFileSync(
    rutaArchivo,
    JSON.stringify(prospectos, null, 2),
    "utf8"
);

console.log("¡Prospectos generados correctamente!");
console.log(`Total de prospectos: ${prospectos.length}`);
console.log(`Archivo creado en: ${rutaArchivo}`);
