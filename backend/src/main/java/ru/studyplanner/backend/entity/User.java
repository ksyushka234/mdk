package ru.studyplanner.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore; // 👈 Добавь этот импорт
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "login", unique = true, nullable = false)
    private String login;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "role_code")
    private String roleCode;

    @Column(name = "full_name")
    private String fullName;

    // 👇 ДОБАВЬ ЭТУ АННОТАЦИЮ
    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + roleCode));
    }

    @Override
    @JsonIgnore // На всякий случай игнорируем и пароль при сериализации
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return login;
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}