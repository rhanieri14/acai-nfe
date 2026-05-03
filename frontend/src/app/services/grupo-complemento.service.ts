import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GrupoComplemento, ItemComplemento } from '../models/grupo-complemento.model';

@Injectable({ providedIn: 'root' })
export class GrupoComplementoService {
  private readonly baseUrl    = 'http://localhost:8080/api/grupos';
  private readonly produtoUrl = 'http://localhost:8080/api/produtos';

  constructor(private http: HttpClient) {}

  // ── Grupos ────────────────────────────────────────────────────────────────

  listarTodos(): Observable<GrupoComplemento[]> {
    return this.http.get<GrupoComplemento[]>(this.baseUrl);
  }

  criar(grupo: Partial<GrupoComplemento>): Observable<GrupoComplemento> {
    return this.http.post<GrupoComplemento>(this.baseUrl, grupo);
  }

  atualizar(id: number, grupo: Partial<GrupoComplemento>): Observable<GrupoComplemento> {
    return this.http.put<GrupoComplemento>(`${this.baseUrl}/${id}`, grupo);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // ── Itens ─────────────────────────────────────────────────────────────────

  adicionarItem(grupoId: number, item: Partial<ItemComplemento>): Observable<GrupoComplemento> {
    return this.http.post<GrupoComplemento>(`${this.baseUrl}/${grupoId}/itens`, item);
  }

  atualizarItem(grupoId: number, itemId: number, item: Partial<ItemComplemento>): Observable<GrupoComplemento> {
    return this.http.put<GrupoComplemento>(`${this.baseUrl}/${grupoId}/itens/${itemId}`, item);
  }

  excluirItem(grupoId: number, itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${grupoId}/itens/${itemId}`);
  }

  // ── Associação Produto ↔ Grupo ────────────────────────────────────────────

  listarGruposDoProduto(produtoId: number): Observable<GrupoComplemento[]> {
    return this.http.get<GrupoComplemento[]>(`${this.produtoUrl}/${produtoId}/grupos`);
  }

  adicionarGrupoAoProduto(produtoId: number, grupoId: number): Observable<void> {
    return this.http.post<void>(`${this.produtoUrl}/${produtoId}/grupos/${grupoId}`, {});
  }

  removerGrupoDoProduto(produtoId: number, grupoId: number): Observable<void> {
    return this.http.delete<void>(`${this.produtoUrl}/${produtoId}/grupos/${grupoId}`);
  }

  aplicarEmLote(grupoId: number, produtoIds: number[]): Observable<{ aplicados: number; jaExistiam: number; mensagem: string }> {
    return this.http.post<{ aplicados: number; jaExistiam: number; mensagem: string }>(
      `${this.baseUrl}/${grupoId}/produtos/lote`,
      { produtoIds }
    );
  }
}
