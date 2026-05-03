import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Empresa, ViaCepResponse } from '../models/empresa.model';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  private readonly apiUrl = 'http://localhost:8080/api/empresa';
  private readonly viaCepUrl = 'https://viacep.com.br/ws';

  constructor(private http: HttpClient) { }

  buscar(): Observable<Empresa> {
    return this.http.get<Empresa>(this.apiUrl);
  }

  salvar(empresa: Empresa): Observable<Empresa> {
    return this.http.put<Empresa>(this.apiUrl, empresa);
  }

  buscarCep(cep: string): Observable<ViaCepResponse> {
    return this.http.get<ViaCepResponse>(`${this.viaCepUrl}/${cep}/json/`);
  }
}
