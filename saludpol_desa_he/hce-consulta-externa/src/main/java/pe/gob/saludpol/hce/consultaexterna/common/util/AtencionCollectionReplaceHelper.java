package pe.gob.saludpol.hce.consultaexterna.common.util;

import org.springframework.stereotype.Component;

import pe.gob.saludpol.hce.consultaexterna.entity.Atencion;

import java.util.List;
import java.util.function.BiFunction;
import java.util.function.Consumer;
import java.util.function.LongConsumer;

@Component
public class AtencionCollectionReplaceHelper {

    public <D, E> void replaceAll(
            Long atencionId,
            Atencion atencion,
            List<D> dtos,
            LongConsumer deleteByAtencionId,
            Consumer<List<E>> saveAll,
            BiFunction<Atencion, D, E> mapper) {
        deleteByAtencionId.accept(atencionId);
        List<E> entities = dtos.stream()
                .map(dto -> mapper.apply(atencion, dto))
                .toList();
        saveAll.accept(entities);
    }
}
