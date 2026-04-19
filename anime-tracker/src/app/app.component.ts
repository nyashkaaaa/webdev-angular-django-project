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
  showSearch = false;
  isDropdownOpen = false;
  isProfileMenuOpen = false;
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

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    if (this.isLoggedIn()) {
      this.router.navigate(['/profile']);
      this.isProfileMenuOpen = false;
    } else {
      this.isDropdownOpen = false;
      this.isProfileMenuOpen = !this.isProfileMenuOpen;
    }
  }

  filterByGenre(genre: { id: number; name: string }) {
    this.isDropdownOpen = false;
    this.router.navigate(['/anime'], { queryParams: { genres: genre.id, genreName: genre.name } });
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isProfileMenuOpen = false;
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeAllMenus() {
    this.isDropdownOpen = false;
    this.isProfileMenuOpen = false;
  }

  openEasterEgg(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.showVideo = true;
  }

  closeVideo() {
    this.showVideo = false;
  }
}
