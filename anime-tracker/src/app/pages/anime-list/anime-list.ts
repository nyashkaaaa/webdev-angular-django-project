import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs/operators';

@Component({
  selector: 'app-anime-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RouterLink],
  templateUrl: './anime-list.html',
  styleUrl: './anime-list.css',
})
export class AnimeListComponent implements OnInit {
  animeList: any[] = [];
  search: string = '';
  activeGenre: number | null = null;
  activeGenreName: string = '';
  isLoading = false;
  error = '';

  constructor(private api: ApiService, private route: ActivatedRoute, private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.activeGenre = params['genres'] ? +params['genres'] : null;
      this.activeGenreName = params['genreName'] || '';
      this.loadAnime();
    });
  }

  loadAnime() {
    this.isLoading = true;
    this.error = '';
    const url = this.activeGenre
      ? `http://127.0.0.1:8000/api/anime/?genres=${this.activeGenre}`
      : `http://127.0.0.1:8000/api/anime/`;

    this.http.get<any[]>(url).pipe(timeout(5000)).subscribe({
      next: (data) => {
        this.animeList = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        if (err.name === 'TimeoutError') {
          this.error = '⏱ Бэкенд не отвечает. Запусти: python manage.py runserver';
        } else if (err.status === 0) {
          this.error = '🔌 Нет связи с бэкендом (127.0.0.1:8000). Запусти сервер.';
        } else {
          this.error = `❌ Ошибка ${err.status}: ${err.message}`;
        }
        this.cdr.detectChanges();
        console.error('Ошибка загрузки:', err);
      }
    });
  }

  goToDetail(event: MouseEvent, id: number) {
    const target = event.target as HTMLElement;
    if (target.closest('.info-overlay')) return;
    this.router.navigate(['/anime', id]);
  }

  addToList(id: number) {
    const token = localStorage.getItem('token');
    if (!token) { alert('Войдите в аккаунт, чтобы добавить в список'); return; }
    this.api.addToList({ anime: id }).subscribe({
      next: () => alert('Добавлено в список!'),
      error: (err) => console.error('Не удалось добавить в список', err)
    });
  }
  getEpisodeWord(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) {
    return 'серия';
  }
  if (
    count % 10 >= 2 &&
    count % 10 <= 4 &&
    (count % 100 < 10 || count % 100 >= 20)
  ) {
    return 'серии';
  }
  return 'серий';
}
}
