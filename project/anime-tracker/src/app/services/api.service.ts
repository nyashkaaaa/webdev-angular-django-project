import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private url = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');

    return {
      headers: new HttpHeaders({
        Authorization: token ? `Bearer ${token}` : ''
      })
    };
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.url}/login/`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.url}/register/`, data);
  }

  getGenres(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/genres/`);
  }

  getAnime(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/anime/`);
  }

  getAnimeById(id: number | string): Observable<any> {
    return this.http.get(`${this.url}/anime/${id}/`);
  }

  addReview(animeId: number, data: any) {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  return this.http.post(`${this.url}/anime/${animeId}/reviews/`, data, { headers });
}

  getMyList(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/user-anime-list/`, this.getHeaders());
  }

  addToList(data: any): Observable<any> {
    return this.http.post(`${this.url}/user-anime-list/`, data, this.getHeaders());
  }

  updateList(id: number, item: any): Observable<any> {
    return this.http.put(`${this.url}/user-anime-list/${id}/`, item, this.getHeaders());
  }

  deleteFromList(id: number): Observable<any> {
    return this.http.delete(`${this.url}/user-anime-list/${id}/`, this.getHeaders());
  }
  getMyReviews(): Observable<any[]> {
  return this.http.get<any[]>(`${this.url}/my-reviews/`, this.getHeaders());
}
}