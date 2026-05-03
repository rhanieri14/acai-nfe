package com.acainfe.service;

import com.acainfe.dto.CriarPedidoDTO;
import com.acainfe.dto.ItemPedidoInputDTO;
import com.acainfe.dto.PedidoRespostaDTO;
import com.acainfe.dto.PedidoRespostaDTO.ComplementoRespostaDTO;
import com.acainfe.dto.PedidoRespostaDTO.ItemPedidoRespostaDTO;
import com.acainfe.enums.FormaPagamento;
import com.acainfe.enums.StatusPedido;
import com.acainfe.model.ItemComplemento;
import com.acainfe.model.ItemPedido;
import com.acainfe.model.ItemPedidoComplemento;
import com.acainfe.model.Pedido;
import com.acainfe.model.Produto;
import com.acainfe.repository.ItemComplementoRepository;
import com.acainfe.repository.PedidoRepository;
import com.acainfe.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PedidoService {

    private final PedidoRepository         pedidoRepository;
    private final ProdutoRepository         produtoRepository;
    private final ItemComplementoRepository itemComplementoRepository;

    // ── Criar pedido ──────────────────────────────────────────────────────────

    public PedidoRespostaDTO criar(CriarPedidoDTO dto) {
        BigDecimal valorTotal = BigDecimal.ZERO;

        Pedido pedido = Pedido.builder()
                .status(StatusPedido.PAGO)
                .formaPagamento(dto.formaPagamento())
                .valorPago(dto.valorPago())
                .build();

        List<ItemPedido> itens = new ArrayList<>();

        for (ItemPedidoInputDTO input : dto.itens()) {
            Produto produto = produtoRepository.findById(input.produtoId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Produto não encontrado: " + input.produtoId()));

            BigDecimal precoComplementos = BigDecimal.ZERO;
            List<ItemPedidoComplemento> complementos = new ArrayList<>();

            if (input.complementoIds() != null) {
                for (Long compId : input.complementoIds()) {
                    ItemComplemento itemComp = itemComplementoRepository.findById(compId)
                            .orElseThrow(() -> new ResponseStatusException(
                                    HttpStatus.NOT_FOUND, "Complemento não encontrado: " + compId));

                    complementos.add(ItemPedidoComplemento.builder()
                            .nomeComplemento(itemComp.getNome())
                            .nomeGrupo(itemComp.getGrupo() != null ? itemComp.getGrupo().getNome() : null)
                            .itemComplementoId(compId)
                            .preco(itemComp.getPreco())
                            .build());

                    precoComplementos = precoComplementos.add(itemComp.getPreco());
                }
            }

            BigDecimal precoUnit = produto.getPreco().add(precoComplementos);
            BigDecimal subtotal  = precoUnit.multiply(new BigDecimal(input.quantidade()));
            valorTotal = valorTotal.add(subtotal);

            ItemPedido item = ItemPedido.builder()
                    .nomeProduto(produto.getNome())
                    .produtoId(produto.getId())
                    .precoUnitario(precoUnit)
                    .quantidade(input.quantidade())
                    .subtotal(subtotal)
                    .build();

            complementos.forEach(c -> c.setItemPedido(item));
            item.setComplementos(complementos);
            itens.add(item);
        }

        pedido.setValorTotal(valorTotal);

        BigDecimal troco = BigDecimal.ZERO;
        if (dto.formaPagamento() == FormaPagamento.DINHEIRO
                && dto.valorPago() != null
                && dto.valorPago().compareTo(valorTotal) > 0) {
            troco = dto.valorPago().subtract(valorTotal);
        }
        pedido.setTroco(troco);

        itens.forEach(i -> i.setPedido(pedido));
        pedido.setItens(itens);

        return toDTO(pedidoRepository.save(pedido));
    }

    // ── Listar do dia ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<PedidoRespostaDTO> listarHoje() {
        LocalDateTime inicio = LocalDate.now().atStartOfDay();
        LocalDateTime fim    = LocalDate.now().atTime(LocalTime.MAX);
        return pedidoRepository.findByDia(inicio, fim).stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public PedidoRespostaDTO buscarPorId(Long id) {
        return toDTO(pedidoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado")));
    }

    // ── Mapping ───────────────────────────────────────────────────────────────

    private PedidoRespostaDTO toDTO(Pedido p) {
        List<ItemPedidoRespostaDTO> itens = p.getItens().stream().map(item -> {
            List<ComplementoRespostaDTO> comps = item.getComplementos().stream()
                    .map(c -> new ComplementoRespostaDTO(c.getNomeComplemento(), c.getNomeGrupo(), c.getPreco()))
                    .toList();
            return new ItemPedidoRespostaDTO(
                    item.getId(), item.getNomeProduto(), item.getQuantidade(),
                    item.getPrecoUnitario(), item.getSubtotal(), comps);
        }).toList();

        return new PedidoRespostaDTO(
                p.getId(), p.getDataHora(),
                p.getStatus().name(), p.getFormaPagamento().name(),
                p.getValorTotal(), p.getValorPago(), p.getTroco(), itens);
    }
}
