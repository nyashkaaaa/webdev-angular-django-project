import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-anime-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './anime-list.html',
  styleUrl: './anime-list.css',
})
export class AnimeListComponent implements OnInit {

  animeList: any[] = [];
  search: string = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadAnime();
  }

  
  loadAnime() {
    this.api.getAnime().subscribe({
      next: (data: any) => {
        this.animeList = data;
        console.log('Данные успешно загружены с Django!');
      },
      error: (err) => {
        console.error('Ошибка связи с бэкендом. Проверь CORS или URL.', err);
      }
    });
  }

  addToList(id: number) {
    this.api.addToList({ anime: id }).subscribe({
      next: () => console.log(`Аниме с ID ${id} добавлено в список!`),
      error: (err) => console.error('Не удалось добавить в список', err)
    });
  }
}