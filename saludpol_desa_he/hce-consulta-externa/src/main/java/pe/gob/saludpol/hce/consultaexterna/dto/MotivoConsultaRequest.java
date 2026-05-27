package pe.gob.saludpol.hce.consultaexterna.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record MotivoConsultaRequest(
        @Size(max = 30, message = "La OAP no debe superar 30 caracteres")
        String oapEpisodio,

        @NotBlank(message = "El motivo de consulta es requerido")
        @Size(max = 500)
        String motivo,

        @NotBlank(message = "El tiempo de enfermedad es requerido")
        @Size(max = 50)
        String tiempoEnfermedad,

        @NotBlank(message = "La forma de inicio es requerida")
        @Size(max = 20)
        @Pattern(regexp = "^(Insidioso|Brusco|Gradual)$", message = "La forma de inicio no es válida")
        String formaInicio,

        @NotBlank(message = "El curso es requerido")
        @Size(max = 20)
        @Pattern(regexp = "^(Progresivo|Regresivo|Estacionario|Intermitente)$", message = "El curso no es válido")
        String curso,

        @NotBlank(message = "La enfermedad actual es requerida")
        @Size(max = 2000)
        String enfermedadActual,

        @NotBlank(message = "Los sintomas y signos son requeridos")
        @Size(max = 2000)
        String sintomasSignos,

        @NotBlank(message = "El relato cronologico es requerido")
        @Size(max = 2000)
        String relatoCronologico,

        @NotBlank(message = "Los factores modificadores son requeridos")
        @Size(max = 1000)
        String factoresMod,

        @NotBlank(message = "Los tratamientos previos son requeridos")
        @Size(max = 1000)
        String tratamientosPrevios
) {}
