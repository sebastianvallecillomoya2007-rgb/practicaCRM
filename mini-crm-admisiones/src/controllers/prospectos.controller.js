
const prospectosService = require("../services/prospectos.service");

function registrarProspecto(req, res) {
    try {
        const { sede, canal } = req.body;

        // Validar los campos obligatorios
        if (!sede || !canal) {
            return res.status(400).json({
                error: "Los campos sede y canal son obligatorios"
            });
        }

        // Crear y guardar el prospecto
        const nuevoProspecto = prospectosService.crearProspecto({
            sede,
            canal
        });

        return res.status(201).json({
            mensaje: "Prospecto registrado correctamente",
            prospecto: nuevoProspecto
        });

    } catch (error) {
        console.error("Error al registrar prospecto:", error);

        return res.status(500).json({
            error: "No se pudo registrar el prospecto"
        });
    }
}

function cambiarEtapa(req, res) {
    try {
        const { id } = req.params;
        const { etapa } = req.body;

        const etapasPermitidas = [
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

        if (!etapa) {
            return res.status(400).json({
                error: "Debes indicar la nueva etapa"
            });
        }

        if (!etapasPermitidas.includes(etapa)) {
            return res.status(400).json({
                error: "La etapa indicada no es válida"
            });
        }

        const prospectoActualizado =
            prospectosService.actualizarEtapa(id, etapa);

        if (!prospectoActualizado) {
            return res.status(404).json({
                error: "No se encontró el prospecto"
            });
        }

        return res.status(200).json({
            mensaje: "Etapa actualizada correctamente",
            prospecto: prospectoActualizado
        });

    } catch (error) {
        console.error("Error al actualizar etapa:", error);

        return res.status(500).json({
            error: "No se pudo actualizar la etapa"
        });
    }
}

module.exports = {
    registrarProspecto,
    cambiarEtapa
};

