package pe.gob.saludpol.hce.ordenmedica.dto;

import jakarta.validation.constraints.Size;

public record OrdenHemodialisisRequest(
        @Size(max = 100, message = "El tipo de dialisis no debe superar 100 caracteres")
        String tipoDialisis,

        @Size(max = 100, message = "La frecuencia no debe superar 100 caracteres")
        String frecuencia,

        Integer duracionSesionMin,

        Integer numeroSesiones,

        @Size(max = 200, message = "El acceso vascular no debe superar 200 caracteres")
        String accesoVascular,

        @Size(max = 200, message = "La anticoagulacion no debe superar 200 caracteres")
        String anticoagulacion,

        @Size(max = 2000, message = "Las observaciones no deben superar 2000 caracteres")
        String observaciones
) {}
