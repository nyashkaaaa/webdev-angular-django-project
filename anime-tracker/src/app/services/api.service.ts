import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // Базовый URL твоего друга (Django)
  private url = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  // --- РАБОТА С КАТАЛОГОМ АНИМЕ ---

  // Получить все аниме
  getAnime(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/anime/`);
  }

  // Получить детали конкретного аниме
  getAnimeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.url}/anime/${id}/`);
  }

  // --- АВТОРИЗАЦИЯ ---

  login(data: any): Observable<any> {
    return this.http.post(`${this.url}/login/`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.url}/register/`, data);
  }

  // --- ЛИЧНЫЙ СПИСОК (MY LIST) ---

  // Получить список пользователя
  getMyList(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/my-list/`);
  }

  // Добавить аниме в список
  addToList(data: { anime: number }): Observable<any> {
    return this.http.post(`${this.url}/my-list/`, data);
  }

  // Обновить статус аниме в списке (например, "просмотрено")
  updateList(id: number, data: any): Observable<any> {
    return this.http.put(`${this.url}/my-list/${id}/`, data);
  }

  // Удалить из списка
  deleteFromList(id: number): Observable<any> {
    return this.http.delete(`${this.url}/my-list/${id}/`);
  }

  // --- ОТЗЫВЫ ---

  addReview(animeId: number, data: any): Observable<any> {
    return this.http.post(`${this.url}/anime/${animeId}/reviews/`, data);
  }
}