import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produto } from '../models/produto.model';

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private readonly baseUrl = 'http://localhost:8080/api/produtos';

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.baseUrl);
  }

  listarAtivos(): Observable<Produto[]> {
    const params = new HttpParams().set('apenasAtivos', 'true');
    return this.http.get<Produto[]>(this.baseUrl, { params });
  }

  criar(produto: Produto): Observable<Produto> {
    return this.http.post<Produto>(this.baseUrl, produto);
  }

  atualizar(id: number, produto: Produto): Observable<Produto> {
    return this.http.put<Produto>(`${this.baseUrl}/${id}`, produto);
  }

  alternarAtivo(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/toggle`, {});
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  copiar(categoriaOrigemId: number, categoriaDestinoId: number): Observable<{ mensagem: string; quantidade: number }> {
    return this.http.post<{ mensagem: string; quantidade: number }>(
      `${this.baseUrl}/copiar`,
      { categoriaOrigemId, categoriaDestinoId }
    );
  }
}
