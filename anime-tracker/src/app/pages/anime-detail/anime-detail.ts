import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute } from '@angular/router';
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
  reviewText: string = '';
  rating: number = 0;

  constructor(private api: ApiService, private route: ActivatedRoute) {}

ngOnInit(): void {
  const id = this.route.snapshot.paramMap.get('id');
  console.log('ID из URL:', id); 

  if (id) {
    this.api.getAnimeById(id).subscribe({
      next: (data) => {
        console.log('Данные из Django:', data); 
        this.anime = data;
      },
      error: (err) => {
        console.error('Ошибка при загрузке:', err);
      }
    });
  }
}

  submitReview() {
    if (!this.reviewText.trim()) return; 

    this.api.addReview(this.anime.id, {
      text: this.reviewText,
      rating: this.rating
    }).subscribe({
      next: () => {
        console.log('Review added!');
        this.reviewText = ''; 
        this.rating = 0;      
      },
      error: (err) => console.error('Error adding review', err)
    });
  }
}