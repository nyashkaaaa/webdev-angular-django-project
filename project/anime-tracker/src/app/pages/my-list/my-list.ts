import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

type TabKey = 'all' | 'watching' | 'completed' | 'planned' | 'dropped';

@Component({
  selector: 'app-my-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './my-list.html',
  styleUrl: './my-list.css',
})
export class MyListComponent implements OnInit {

  myList: any[] = [];
  isLoading = true;
  activeTab: TabKey = 'all';

  tabs: { key: TabKey; label: string }[] = [
    { key: 'all',       label: 'Все'           },
    { key: 'watching',  label: 'Смотрю'        },
    { key: 'completed', label: 'Просмотрено'   },
    { key: 'planned',   label: 'Запланировано' },
    { key: 'dropped',   label: 'Брошено'       },
  ];

  statusLabels: Record<string, string> = {
    watching:  'Смотрю',
    completed: 'Просмотрено',
    planned:   'Запланировано',
    dropped:   'Брошено',
  };

  constructor(private api: ApiService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.load();
  }

load() {
  this.isLoading = true;
  this.api.getMyList().subscribe({
    next: (data: any) => {
      this.myList = data;
      this.isLoading = false;
      this.cdr.detectChanges(); // ← добавь это
    },
    error: (err: any) => {
      console.error('Ошибка:', err);
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  });
}

  get filtered() {
    if (this.activeTab === 'all') return this.myList;
    return this.myList.filter(i => i.status === this.activeTab);
  }

  countOf(status: string) {
    if (status === 'all') return this.myList.length;
    return this.myList.filter(i => i.status === status).length;
  }

  changeStatus(item: any, newStatus: string) {
  this.api.addToList({ anime: item.anime, status: newStatus }).subscribe({
    next: () => { item.status = newStatus; }
  });
}

  delete(item: any) {
    this.api.deleteFromList(item.id).subscribe({
      next: () => {
        this.myList = this.myList.filter(i => i.id !== item.id);
      }
    });
  }

goToAnime(id: number) {
  this.router.navigate(['/anime-detail', id]);
}

}
