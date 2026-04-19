import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { combineLatest, Subscription } from 'rxjs';

@Component({
  selector: 'app-anime-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './anime-list.html',
  styleUrl: './anime-list.css',
})
export class AnimeListComponent implements OnInit, OnDestroy {

  animeList: any[] = [];
  filteredList: any[] = [];
  search: string = '';
  selectedGenre: string = '';
  isLoading = true;

  private sub!: Subscription;

  constructor(private api: ApiService, private router: Router, private route: ActivatedRoute) {}

  navigateToAnime(id: number) {
    this.router.navigate(['/anime', id]);
  }

  ngOnInit(): void {
    this.sub = combineLatest([
      this.api.getAnime(),
      this.route.queryParams
    ]).subscribe({
      next: ([data, params]) => {
        this.animeList = data;
        this.selectedGenre = params['genre'] || '';
        this.isLoading = false;
        this.applyFilters();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Ошибка связи с бэкендом. Проверь CORS или URL.', err);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  applyFilters(): void {
    let result = this.animeList;

    if (this.selectedGenre) {
      result = result.filter(anime =>
        anime.genres?.some((g: any) =>
          g.name.toLowerCase() === this.selectedGenre.toLowerCase()
        )
      );
    }

    if (this.search.trim()) {
      result = result.filter(anime =>
        anime.title.toLowerCase().includes(this.search.toLowerCase())
      );
    }

    this.filteredList = result;
  }

  clearGenre() {
    this.selectedGenre = '';
    this.router.navigate(['/anime']);
  }

  selectedAnime: any = null;
  currentStatus: string = '';

  statuses = [
    { label: 'Смотрю',        value: 'watching'   },
    { label: 'Просмотрено',   value: 'completed'  },
    { label: 'Запланировано', value: 'planned'     },
    { label: 'Брошено',       value: 'dropped'     },
  ];

  openStatusModal(anime: any) {
    this.selectedAnime = anime;
    this.currentStatus = anime.userStatus || '';
  }

  closeModal(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('status-overlay')) {
      this.selectedAnime = null;
    }
  }

  selectStatus(status: string) {
    this.currentStatus = status;
  }

  saveStatus() {
    if (!this.currentStatus || !this.selectedAnime) return;
    this.api.addToList({ anime: this.selectedAnime.id, status: this.currentStatus }).subscribe({
      next: () => {
        this.selectedAnime.userStatus = this.currentStatus;
        this.selectedAnime = null;
        this.router.navigate(['/my-list']);
      },
      error: (err) => console.error('Ошибка сохранения', err)
    });
  }

  removeFromList() {
    this.api.deleteFromList(this.selectedAnime.id).subscribe({
      next: () => {
        this.selectedAnime.userStatus = '';
        this.selectedAnime = null;
      },
      error: (err: any) => console.error('Ошибка удаления', err)
    });
  }
}
