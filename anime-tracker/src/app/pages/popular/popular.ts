import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-popular',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popular.html',
  styleUrls: ['./popular.css']
})
export class PopularComponent implements OnInit {
  // Теперь у нас один общий список для всех аниме
  allAnimes: any[] = []; 

  // URL к API Django
  private apiUrl = 'http://127.0.0.1:8000/api/anime/'; 

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getAnimeFromDjango();
  }

  getAnimeFromDjango() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        // Просто берем все данные и кладем в список
        this.allAnimes = data;
      },
      error: (err) => {
        console.error('Django не отвечает:', err);
      }
    });
  }
}