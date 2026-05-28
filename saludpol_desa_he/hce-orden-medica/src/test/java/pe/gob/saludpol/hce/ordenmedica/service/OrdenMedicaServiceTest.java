package pe.gob.saludpol.hce.ordenmedica.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.gob.saludpol.hce.ordenmedica.client.FiliacionClient;
import pe.gob.saludpol.hce.ordenmedica.client.MaestrosClient;
import pe.gob.saludpol.hce.ordenmedica.client.dto.AdmisionClientDto;
import pe.gob.saludpol.hce.ordenmedica.client.dto.ApiResponseDto;
import pe.gob.saludpol.hce.ordenmedica.client.dto.EstablecimientoClientDto;
import pe.gob.saludpol.hce.ordenmedica.common.exception.EntityUnprocessableException;
import pe.gob.saludpol.hce.ordenmedica.dto.OrdenMedicaDetRequest;
import pe.gob.saludpol.hce.ordenmedica.dto.OrdenMedicaDetalleResponse;
import pe.gob.saludpol.hce.ordenmedica.dto.OrdenHemodialisisRequest;
import pe.gob.saludpol.hce.ordenmedica.dto.OrdenMedicaRequest;
import pe.gob.saludpol.hce.ordenmedica.entity.OrdenMedica;
import pe.gob.saludpol.hce.ordenmedica.repository.OrdenHemodialisisRepository;
import pe.gob.saludpol.hce.ordenmedica.repository.OrdenMedicaDetRepository;
import pe.gob.saludpol.hce.ordenmedica.repository.OrdenMedicaRepository;
import pe.gob.saludpol.hce.ordenmedica.repository.OrdenQuimioterapiaRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@DisplayName("Orden medica - reglas de cabecera y consolidacion")
@ExtendWith(MockitoExtension.class)
class OrdenMedicaServiceTest {

    @Mock
    private OrdenMedicaRepository ordenMedicaRepository;
    @Mock
    private OrdenMedicaDetRepository ordenMedicaDetRepository;
    @Mock
    private OrdenHemodialisisRepository hemodialisisRepository;
    @Mock
    private OrdenQuimioterapiaRepository quimioterapiaRepository;
    @Mock
    private FiliacionClient filiacionClient;
    @Mock
    private MaestrosClient maestrosClient;

    @InjectMocks
    private OrdenMedicaService service;

    @Test
    @DisplayName("Rechaza guardar una orden sin prestaciones")
    void crearRechazaOrdenSinHijos() {
        prepararContextoCe();

        OrdenMedicaRequest request = request("LAB", null);

        assertThrows(EntityUnprocessableException.class, () -> service.crear(request));
        verifyNoInteractions(ordenMedicaRepository);
    }

    @Test
    @DisplayName("Rechaza mezclar LAB e IMG en una sola cabecera")
    void crearRechazaDetalleQueNoCoincideConTipoOrden() {
        prepararContextoCe();

        OrdenMedicaRequest request = request("LAB", List.of(
                detalle("LAB", "Hemograma"),
                detalle("IMG", "Ecografia")
        ));

        assertThrows(EntityUnprocessableException.class, () -> service.crear(request));
        verifyNoInteractions(ordenMedicaRepository);
    }

    @Test
    @DisplayName("Copia el nroOap recibido desde la atencion origen")
    void crearCopiaNroOapDeOrigen() {
        prepararContextoCe();
        simularRepositorioOrdenMedicaEnMemoria();
        when(filiacionClient.obtenerAdmision(1L)).thenReturn(new ApiResponseDto<>(
                null,
                new AdmisionClientDto(
                        1L,
                        7L,
                        "HC-7",
                        "12345678",
                        "Apellidos",
                        "Nombres",
                        LocalDate.of(1980, 1, 1),
                        "F",
                        "00013591",
                        "IPRESS Admision",
                        "Sede Admision",
                        "Region Admision",
                        "I-2"
                )
        ));
        when(maestrosClient.buscarEstablecimiento("00013591")).thenReturn(new ApiResponseDto<>(
                null,
                new EstablecimientoClientDto(
                        "00013591",
                        "IPRESS Demo",
                        "Lima",
                        "Av. Demo 123",
                        "Lima",
                        "I-3"
                )
        ));

        OrdenMedicaDetalleResponse response = service.crear(request("LAB", List.of(detalle("LAB", "Hemograma"))));

        assertEquals("OAP-CE-00010", response.cabecera().nroOap());
        assertEquals("HC-7", response.cabecera().nroHc());
        assertEquals("Apellidos Nombres", response.asegurado().apellidosNombres());
        assertEquals("IPRESS Demo", response.establecimiento().ipress());
        assertNull(response.establecimiento().errorMaestros());
        assertEquals("LAB", response.cabecera().tipoOrden().codigo());
        assertEquals("EMITIDA", response.cabecera().estado());
        verify(ordenMedicaRepository).save(any(OrdenMedica.class));
    }

    @Test
    @DisplayName("No usa IPRESS de admision si maestros no responde")
    void obtenerDetalleNoUsaIpressDeAdmisionComoFallback() {
        prepararContextoCe();
        simularRepositorioOrdenMedicaEnMemoria();
        when(filiacionClient.obtenerAdmision(1L)).thenReturn(new ApiResponseDto<>(
                null,
                new AdmisionClientDto(
                        1L,
                        7L,
                        "HC-7",
                        "12345678",
                        "Apellidos",
                        "Nombres",
                        LocalDate.of(1980, 1, 1),
                        "F",
                        "00013591",
                        "IPRESS Admision",
                        "Sede Admision",
                        "Region Admision",
                        "I-2"
                )
        ));
        when(maestrosClient.buscarEstablecimiento("00013591")).thenThrow(new RuntimeException("Maestros no disponible"));

        OrdenMedicaDetalleResponse response = service.crear(request("LAB", List.of(detalle("LAB", "Hemograma"))));

        assertEquals("00013591", response.establecimiento().ipressCui());
        assertNull(response.establecimiento().ipress());
        assertNull(response.establecimiento().sede());
        assertNull(response.establecimiento().region());
        assertNull(response.establecimiento().categoria());
        assertEquals("RuntimeException: Maestros no disponible", response.establecimiento().errorMaestros());
    }

    @Test
    @DisplayName("Consolida prestaciones mixtas en cabeceras separadas")
    void crearConsolidadoSeparaPrestacionesPorTipo() {
        prepararContextoCe();
        simularRepositorioOrdenMedicaEnMemoria();

        OrdenMedicaRequest request = request("LAB", List.of(
                detalle("LAB", "Hemograma"),
                detalle("LAB", "Glucosa"),
                detalle("IMG", "Radiografia")
        ));

        List<OrdenMedicaDetalleResponse> creadas = service.crearConsolidado(request);

        assertEquals(2, creadas.size());
        assertEquals("LAB", creadas.get(0).cabecera().tipoOrden().codigo());
        assertEquals("IMG", creadas.get(1).cabecera().tipoOrden().codigo());
        assertEquals("EMITIDA", creadas.get(0).cabecera().estado());
        assertEquals("EMITIDA", creadas.get(1).cabecera().estado());
        assertEquals(-1, creadas.get(0).cabecera().horaEmision().compareTo(creadas.get(1).cabecera().horaEmision()));
        assertEquals(2, creadas.get(0).prestaciones().laboratorio().size());
        assertEquals(1, creadas.get(1).prestaciones().imagen().size());
        verify(ordenMedicaRepository, times(2)).save(any(OrdenMedica.class));
    }

    @Test
    @DisplayName("Consolida prestaciones generales y Hemodialisis en cabeceras separadas")
    void crearConsolidadoSeparaPrestacionesGeneralesYHemodialisis() {
        prepararContextoCe();
        simularRepositorioOrdenMedicaEnMemoria();

        OrdenMedicaRequest request = request(
                "HEM",
                List.of(detalle("LAB", "Hemograma")),
                new OrdenHemodialisisRequest(
                        "Convencional", "3 veces por semana", 240, 12, "Fistula", "Heparina", null),
                null
        );

        List<OrdenMedicaDetalleResponse> creadas = service.crearConsolidado(request);

        assertEquals(2, creadas.size());
        assertEquals("LAB", creadas.get(0).cabecera().tipoOrden().codigo());
        assertEquals("HEM", creadas.get(1).cabecera().tipoOrden().codigo());
        verify(ordenMedicaRepository, times(2)).save(any(OrdenMedica.class));
    }

    private void prepararContextoCe() {
        // El servicio de Orden Medica usa snapshots locales en el request.
    }

    private void simularRepositorioOrdenMedicaEnMemoria() {
        AtomicLong secuencia = new AtomicLong(1);
        Map<Long, OrdenMedica> ordenes = new HashMap<>();

        when(ordenMedicaRepository.save(any(OrdenMedica.class))).thenAnswer(invocation -> {
            OrdenMedica orden = invocation.getArgument(0);
            if (orden.getId() == null) {
                orden.setId(secuencia.getAndIncrement());
            }
            ordenes.put(orden.getId(), orden);
            return orden;
        });
        when(ordenMedicaRepository.findById(anyLong()))
                .thenAnswer(invocation -> Optional.ofNullable(ordenes.get(invocation.getArgument(0))));
        when(ordenMedicaDetRepository.findByOrdenMedica_IdOrderByIdAsc(anyLong()))
                .thenAnswer(invocation -> new ArrayList<>(
                        ordenes.get(invocation.getArgument(0)).getDetalles()));
        when(hemodialisisRepository.findByOrdenMedica_Id(anyLong())).thenReturn(Optional.empty());
        when(quimioterapiaRepository.findByOrdenMedica_Id(anyLong())).thenReturn(Optional.empty());
    }

    private OrdenMedicaRequest request(String tipoOrden, List<OrdenMedicaDetRequest> detalles) {
        return request(tipoOrden, detalles, null, null);
    }

    private OrdenMedicaRequest request(
            String tipoOrden,
            List<OrdenMedicaDetRequest> detalles,
            OrdenHemodialisisRequest hemodialisis,
            pe.gob.saludpol.hce.ordenmedica.dto.OrdenQuimioterapiaRequest quimioterapia) {
        return new OrdenMedicaRequest(
                "OAP-CE-00010",
                1L,
                7L,
                "12345678",
                10L,
                "CE",
                tipoOrden,
                "APS-2026-001",
                "CG-2026-001",
                46,
                "SALUDPOL",
                "ACTIVO",
                "Regular",
                "Regular",
                "Ambulatoria",
                "DERECHOHABIENTE",
                null,
                "Actividad",
                "Sub actividad",
                "Nefrologia",
                LocalDateTime.of(2026, 5, 22, 10, 30),
                "00013591",
                "Profesional",
                "Medico",
                "87654321",
                "12345",
                "RNE-001",
                detalles,
                hemodialisis,
                quimioterapia
        );
    }

    private OrdenMedicaDetRequest detalle(String tipo, String descripcion) {
        return new OrdenMedicaDetRequest(
                null,
                tipo,
                null,
                null,
                null,
                descripcion,
                null,
                null,
                null,
                null
        );
    }

}
