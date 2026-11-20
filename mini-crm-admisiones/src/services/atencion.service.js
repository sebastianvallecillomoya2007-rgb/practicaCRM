
const prospectosService = require("./prospectos.service");

// Obtener información de atención de los prospectos
function obtenerAtencion() {
    const prospectos = prospectosService.obtenerTodos();

    const hoy = new Date();

    const resultados = prospectos.map(prospecto => {
        const fechaAvance = new Date(
            prospecto.fechaUltimoAvance + "T00:00:00"
        );

        const diferencia = hoy - fechaAvance;

        const diasSinAvance = Math.floor(
            diferencia / (1000 * 60 * 60 * 24)
        );

        let estadoAtencion = "Al día";

        if (diasSinAvance >= 7) {
            estadoAtencion = "Requiere atención";
        } else if (diasSinAvance >= 3) {
            estadoAtencion = "Seguimiento pendiente";
        }

        return {
            id: prospecto.id,
            sede: prospecto.sede,
            canal: prospecto.canal,
            etapa: prospecto.etapa,
            fechaUltimoAvance: prospecto.fechaUltimoAvance,
            diasSinAvance,
            estadoAtencion
        };
    });

    return {
        total: resultados.length,
        requierenAtencion: resultados.filter(
            p => p.estadoAtencion === "Requiere atención"
        ).length,
        seguimientoPendiente: resultados.filter(
            p => p.estadoAtencion === "Seguimiento pendiente"
        ).length,
        prospectos: resultados
    };
}

module.exports = {
    obtenerAtencion
};
