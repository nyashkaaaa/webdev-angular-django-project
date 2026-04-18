import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-popular',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popular.html',
  styleUrls: ['./popular.css']
})
export class PopularComponent implements OnInit {
  allAnimes: any[] = [];
  isLoading = true;
  private apiUrl = 'http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.http.get<any[]>(`${this.apiUrl}anime/`).subscribe({
      next: (data) => {
        this.allAnimes = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error('Django не отвечает:', err);
      }
    });
  }

  goToDetail(event: MouseEvent, animeId: number) {
    const target = event.target as HTMLElement;
    if (target.closest('.hover-popup')) return;
    this.router.navigate(['/anime-detail', animeId]);
  }

  addToList(animeId: number) {
    const token = localStorage.getItem('token');
    if (!token) { alert('Войдите в аккаунт, чтобы добавить в список'); return; }
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.post(`${this.apiUrl}my-list/`, { anime: animeId }, { headers }).subscribe({
      next: () => alert('Добавлено в список!'),
      error: (err) => console.error('Ошибка добавления:', err)
    });
  }
}