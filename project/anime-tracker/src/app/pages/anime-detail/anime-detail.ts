import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-anime-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './anime-detail.html',
  styleUrl: './anime-detail.css',
})
export class AnimeDetailComponent implements OnInit {
  anime: any = null;
  isLoading = true;
  hasError = false;
  reviewText: string = '';
  rating: number = 0;

  // Модал статуса
  showStatusModal = false;
  currentStatus: string = '';
  saveSuccess = false;

  statuses = [
    { label: 'Смотрю',        value: 'watching'  },
    { label: 'Просмотрено',   value: 'completed' },
    { label: 'Запланировано', value: 'planned'    },
    { label: 'Брошено',       value: 'dropped'    },
  ];

  constructor(private api: ApiService, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.getAnimeById(id).subscribe({
        next: (data) => {
          this.anime = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Ошибка при загрузке:', err);
          this.isLoading = false;
          this.hasError = true;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.isLoading = false;
      this.hasError = true;
    }
  }

  openStatusModal() {
    this.currentStatus = this.anime?.userStatus || '';
    this.showStatusModal = true;
    this.saveSuccess = false;
  }

  closeStatusModal(e?: MouseEvent) {
    if (!e || (e.target as HTMLElement).classList.contains('status-overlay')) {
      this.showStatusModal = false;
    }
  }

  selectStatus(status: string) {
    this.currentStatus = status;
  }

  saveStatus() {
    if (!this.currentStatus || !this.anime) return;
    this.api.addToList({ anime: this.anime.id, status: this.currentStatus }).subscribe({
      next: () => {
        this.anime.userStatus = this.currentStatus;
        this.saveSuccess = true;
        setTimeout(() => { this.showStatusModal = false; this.saveSuccess = false; }, 800);
      },
      error: (err) => console.error('Ошибка сохранения', err)
    });
  }

  removeFromList() {
    this.api.deleteFromList(this.anime.id).subscribe({
      next: () => {
        this.anime.userStatus = '';
        this.currentStatus = '';
        this.showStatusModal = false;
      },
      error: (err) => console.error('Ошибка удаления', err)
    });
  }

submitReview() {
  if (!this.reviewText.trim()) return;
  this.api.addReview(this.anime.id, {
    text: this.reviewText,
    rating: this.rating
  }).subscribe({
    next: (newReview) => {
      this.reviewText = '';
      this.rating = 0;
      // Добавляем новый отзыв в список без перезагрузки страницы
      if (!this.anime.reviews) this.anime.reviews = [];
      this.anime.reviews.push(newReview);
      this.cdr.detectChanges();
    },
    error: (err: any) => console.error('Error adding review', err)
  });
}
}
