package pe.gob.saludpol.hce.consultaexterna.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ExamenFisicoRequest(
        @NotNull(message = "La PA Sistólica (max) es requerida")
        @Min(value = 40, message = "La PA Sistólica (max) debe tener un mínimo de 40 y un máximo de 300")
        @Max(value = 300, message = "La PA Sistólica (max) debe tener un mínimo de 40 y un máximo de 300")
        @Digits(integer = 3, fraction = 0, message = "La PA Sistólica (max) debe ser un numero entero de máximo 3 dígitos")
        Integer paSistolica,
        @NotNull(message = "La PA Diastólica (min) es requerida")
        @Min(value = 20, message = "La PA Diastólica (min) debe tener un mínimo de 20 y un máximo de 200")
        @Max(value = 200, message = "La PA Diastólica (min) debe tener un mínimo de 20 y un máximo de 200")
        @Digits(integer = 3, fraction = 0, message = "La PA Diastólica (min) debe ser un numero entero de máximo 3 dígitos")
        Integer paDiastolica,
        @NotNull(message = "La frecuencia cardiaca FC (lpm) es requerida")
        @Min(value = 20, message = "La frecuencia cardiaca FC (lpm) debe tener un mínimo de 20 y un máximo de 250")
        @Max(value = 250, message = "La frecuencia cardiaca FC (lpm) debe tener un mínimo de 20 y un máximo de 250")
        @Digits(integer = 3, fraction = 0, message = "La frecuencia cardiaca FC (lpm) debe ser un numero entero de máximo 3 dígitos")
        Integer fc,
        @NotNull(message = "La frecuencia respiratoria FR (lpm) es requerida")
        @Min(value = 5, message = "La frecuencia respiratoria FR (lpm) debe tener un mínimo de 5 y un máximo de 80")
        @Max(value = 80, message = "La frecuencia respiratoria FR (lpm) debe tener un mínimo de 5 y un máximo de 80")
        @Digits(integer = 3, fraction = 0, message = "La frecuencia respiratoria FR (lpm) debe ser un numero entero")
        Integer fr,
        @NotNull(message = "La Temp (°C) es requerida")
        @DecimalMin(value = "30.0", message = "La Temp (°C) debe tener un mínimo de 30.0 y un máximo de 45.0")
        @DecimalMax(value = "45.0", message = "La Temp (°C) debe tener un mínimo de 30.0 y un máximo de 45.0")
        @Digits(integer = 2, fraction = 1, message = "La Temp (°C) debe tener hasta 1 decimal")
        BigDecimal temperatura,
        @NotNull(message = "La SatO2 (%) es requerida")
        @DecimalMin(value = "50", message = "La SatO2 (%) debe tener un mínimo de 50 y un máximo de 100")
        @DecimalMax(value = "100", message = "La SatO2 (%) debe tener un mínimo de 50 y un máximo de 100")
        @Digits(integer = 3, fraction = 2, message = "La SatO2 (%) debe tener hasta 2 decimales")
        BigDecimal satO2,
        @NotNull(message = "El Peso (kg) es requerido")
        @DecimalMin(value = "10", message = "El Peso (kg) debe tener un mínimo de 10kg y un máximo de 200kg")
        @DecimalMax(value = "200", message = "El Peso (kg) debe tener un mínimo de 10kg y un máximo de 200kg")
        @Digits(integer = 3, fraction = 2, message = "El Peso (kg) debe tener hasta 2 decimales")
        BigDecimal peso,
        @NotNull(message = "La Talla (cm) es requerida")
        @DecimalMin(value = "60", message = "La Talla (cm) debe tener un mínimo de 60cm y un máximo de 2m")
        @DecimalMax(value = "200", message = "La Talla (cm) debe tener un mínimo de 60cm y un máximo de 2m")
        @Digits(integer = 3, fraction = 1, message = "La Talla (cm) debe tener hasta 1 decimal")
        BigDecimal talla,
        @Digits(integer = 3, fraction = 2, message = "El IMC debe tener hasta 2 decimales")
        BigDecimal imc,
        @Valid List<ExamenRegionDto> regiones
) {}