import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private url = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  // --- АНИМЕ ---

  getAnime(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/anime/`);
  }

  getAnimeById(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.url}/anime/${id}/`);
  }

  // --- АВТОРИЗАЦИЯ ---

  login(data: any): Observable<any> {
    return this.http.post(`${this.url}/login/`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.url}/register/`, data);
  }

  googleAuth(credential: string): Observable<any> {
    return this.http.post(`${this.url}/auth/google/`, { credential });
  }

  // --- ЛИЧНЫЙ СПИСОК ---

  getMyList(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/my-list/`, { headers: this.authHeaders() });
  }

  addToList(data: { anime: number }): Observable<any> {
    return this.http.post(`${this.url}/my-list/`, data, { headers: this.authHeaders() });
  }

  updateList(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.url}/my-list/${id}/`, data, { headers: this.authHeaders() });
  }

  deleteFromList(id: number): Observable<any> {
    return this.http.delete(`${this.url}/my-list/${id}/`, { headers: this.authHeaders() });
  }

  // --- ОТЗЫВЫ ---

  addReview(animeId: number, data: any): Observable<any> {
    return this.http.post(
      `${this.url}/reviews/`,
      { anime: animeId, text: data.text },
      { headers: this.authHeaders() }
    );
  }
}