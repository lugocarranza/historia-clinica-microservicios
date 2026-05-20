package pe.gob.saludpol.hce.consultaexterna.common.audit;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;

@Getter
@Setter
@MappedSuperclass
public abstract class AuditableEntity {

    @Column(name = "T_CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "V_CREATED_BY", nullable = false, length = 50, updatable = false)
    private String createdBy;

    @Column(name = "T_UPDATED_AT")
    private LocalDateTime updatedAt;

    @Column(name = "V_UPDATED_BY", length = 50)
    private String updatedBy;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.createdBy = resolveCurrentUser();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        this.updatedBy = resolveCurrentUser();
    }

    private String resolveCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated()) ? auth.getName() : "SYSTEM";
    }
}
