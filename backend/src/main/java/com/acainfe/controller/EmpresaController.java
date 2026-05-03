package com.acainfe.controller;

import com.acainfe.dto.EmpresaDTO;
import com.acainfe.model.Empresa;
import com.acainfe.service.EmpresaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/empresa")
@RequiredArgsConstructor
public class EmpresaController {

    private final EmpresaService empresaService;

    @GetMapping
    public ResponseEntity<Empresa> buscar() {
        Optional<Empresa> empresa = empresaService.buscar();
        return empresa.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PutMapping
    public ResponseEntity<Empresa> salvar(@RequestBody EmpresaDTO dto) {
        Empresa empresa = empresaService.salvar(dto);
        return ResponseEntity.ok(empresa);
    }
}
