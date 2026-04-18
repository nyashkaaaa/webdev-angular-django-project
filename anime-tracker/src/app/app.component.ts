import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { SearchOverlayComponent } from './pages/search-overlay/search-overlay';
import { ChatBotComponent } from './chat-bot/chat-bot.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterModule, SearchOverlayComponent, ChatBotComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showVideo = false;
  videoUrl: SafeResourceUrl;
  genres: { id: number; name: string }[] = [];

  constructor(public router: Router, private sanitizer: DomSanitizer, private http: HttpClient) {
    const videoId = 'T-qGlh4joXU';
    const rawUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&mute=0`;
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
  }

  ngOnInit() {
    this.http.get<{ id: number; name: string }[]>('http://127.0.0.1:8000/api/genres/').subscribe({
      next: (data) => { this.genres = data; },
      error: () => {}
    });
  }

  filterByGenre(genre: { id: number; name: string }) {
    this.isDropdownOpen = false;
    this.router.navigate(['/anime'], { queryParams: { genres: genre.id, genreName: genre.name } });
  }

  openEasterEgg(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.showVideo = true;
  }

  closeVideo() {
    this.showVideo = false;
  }

  isDropdownOpen = false;
  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  closeDropdown() {
    this.isDropdownOpen = false;
  }

  showSearch = false;
}
