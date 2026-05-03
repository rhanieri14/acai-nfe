import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Complemento, TipoComplemento } from '../models/complemento.model';

@Injectable({ providedIn: 'root' })
export class ComplementoService {
  private readonly baseUrl = 'http://localhost:8080/api/complementos';

  constructor(private http: HttpClient) {}

  /** Todos os subprodutos (com produto e categoria embedded) */
  listarTodos(): Observable<Complemento[]> {
    return this.http.get<Complemento[]>(this.baseUrl);
  }

  /** Subprodutos de um produto específico */
  listarPorProduto(produtoId: number, apenasAtivos = false): Observable<Complemento[]> {
    let params = new HttpParams().set('produtoId', produtoId);
    if (apenasAtivos) params = params.set('apenasAtivos', 'true');
    return this.http.get<Complemento[]>(this.baseUrl, { params });
  }

  criar(complemento: Complemento): Observable<Complemento> {
    return this.http.post<Complemento>(this.baseUrl, complemento);
  }

  atualizar(id: number, complemento: Complemento): Observable<Complemento> {
    return this.http.put<Complemento>(`${this.baseUrl}/${id}`, complemento);
  }

  alternarAtivo(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/toggle`, {});
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
