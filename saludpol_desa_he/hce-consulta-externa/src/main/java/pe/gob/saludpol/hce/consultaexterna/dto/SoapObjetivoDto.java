package pe.gob.saludpol.hce.consultaexterna.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record SoapObjetivoDto(
        @Min(value = 40, message = "La PA Sistólica (max) debe tener un mínimo de 40 y un máximo de 300")
        @Max(value = 300, message = "La PA Sistólica (max) debe tener un mínimo de 40 y un máximo de 300")
        @Digits(integer = 3, fraction = 0, message = "La PA Sistólica (max) debe ser un numero entero de hasta 3 digitos")
        Integer paSistolica,
        @Min(value = 20, message = "La PA Diastólica (min) debe tener un mínimo de 20 y un máximo de 200")
        @Max(value = 200, message = "La PA Diastólica (min) debe tener un mínimo de 20 y un máximo de 200")
        @Digits(integer = 3, fraction = 0, message = "La PA Diastólica (min) debe ser un numero entero de hasta 3 digitos")
        Integer paDiastolica,
        @Min(value = 20, message = "La FC debe tener un mínimo de 20 y un máximo de 250")
        @Max(value = 250, message = "La FC debe tener un mínimo de 20 y un máximo de 250")
        @Digits(integer = 3, fraction = 0, message = "La FC debe ser un numero entero de hasta 3 digitos")
        Integer fc,
        @Min(value = 5, message = "La FR debe tener un mínimo de 5 y un máximo de 80")
        @Max(value = 80, message = "La FR debe tener un mínimo de 5 y un máximo de 80")
        @Digits(integer = 3, fraction = 0, message = "La FR debe ser un numero entero de hasta 3 digitos")
        Integer fr,
        @DecimalMin(value = "30.0", message = "La temperatura debe tener un mínimo de 30.0 y un máximo de 45.0")
        @DecimalMax(value = "45.0", message = "La temperatura debe tener un mínimo de 30.0 y un máximo de 45.0")
        @Digits(integer = 2, fraction = 1, message = "La temperatura debe tener hasta 2 digitos enteros y 1 decimal")
        BigDecimal temperatura,
        @DecimalMin(value = "50", message = "La saturacion de oxigeno debe tener un mínimo de 50 y un máximo de 100")
        @DecimalMax(value = "100", message = "La saturacion de oxigeno debe tener un mínimo de 50 y un máximo de 100")
        @Digits(integer = 3, fraction = 2, message = "La saturacion de oxigeno debe tener hasta 3 digitos enteros y 2 decimales")
        BigDecimal satO2,
        @DecimalMin(value = "10", message = "El peso debe tener un mínimo de 10kg y un máximo de 200kg")
        @DecimalMax(value = "200", message = "El peso debe tener un mínimo de 10kg y un máximo de 200kg")
        @Digits(integer = 3, fraction = 2, message = "El peso debe tener hasta 3 digitos enteros y 2 decimales")
        BigDecimal peso,
        @DecimalMin(value = "60", message = "La talla debe tener un mínimo de 60cm y un máximo de 2m")
        @DecimalMax(value = "200", message = "La talla debe tener un mínimo de 60cm y un máximo de 2m")
        @Digits(integer = 3, fraction = 1, message = "La talla debe tener hasta 3 digitos enteros y 1 decimal")
        BigDecimal talla,
        @Digits(integer = 3, fraction = 2, message = "El IMC debe tener hasta 3 digitos enteros y 2 decimales")
        BigDecimal imc,
        @Size(max = 2000, message = "Los hallazgos fisicos no deben superar 2000 caracteres")
        String hallazgosFisicos,
        @Size(max = 2000, message = "Los resultados de estudios no deben superar 2000 caracteres")
        String resultEstudios,
        @Size(max = 1000, message = "La comparacion previa no debe superar 1000 caracteres")
        String comparacionPrevia
) {}
