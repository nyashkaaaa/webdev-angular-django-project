import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-search-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './search-overlay.html',
  styleUrls: ['./search-overlay.css']
})
export class SearchOverlayComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  query = '';
  results: any[] = [];
  loading = false;
  allResults: any[] = [];

  private search$ = new Subject<string>();
  private apiUrl = 'http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => {
        if (!q.trim()) return of([]);
        this.loading = true;
        return this.http.get<any[]>(`${this.apiUrl}anime/?search=${q}`);
      })
    ).subscribe({
      next: (data) => {
        this.loading = false;
        this.allResults = data;
        this.results = data;
      },
      error: () => {
        this.loading = false;
        this.allResults = [];
      }
    });
  }

  onInput() {
    if (!this.query.trim()) {
      this.allResults = [];
    }
    this.search$.next(this.query);
  }

  onOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('search-overlay')) {
      this.close.emit();
    }
  }
}
