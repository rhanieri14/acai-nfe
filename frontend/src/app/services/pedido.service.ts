import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CriarPedidoDTO, PedidoRespostaDTO } from '../models/pedido.model';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly baseUrl = 'http://localhost:8080/api/pedidos';

  constructor(private http: HttpClient) {}

  criar(dto: CriarPedidoDTO): Observable<PedidoRespostaDTO> {
    return this.http.post<PedidoRespostaDTO>(this.baseUrl, dto);
  }

  listarHoje(): Observable<PedidoRespostaDTO[]> {
    return this.http.get<PedidoRespostaDTO[]>(this.baseUrl);
  }

  buscar(id: number): Observable<PedidoRespostaDTO> {
    return this.http.get<PedidoRespostaDTO>(`${this.baseUrl}/${id}`);
  }
}
