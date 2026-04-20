import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SearchOverlayComponent } from './pages/search-overlay/search-overlay';
import { AiChatComponent } from './pages/ai-chat/ai-chat';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterModule, SearchOverlayComponent, AiChatComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showVideo = false;
  showSearch = false;
  isDropdownOpen = false;
  isProfileMenuOpen = false;
  videoUrl: SafeResourceUrl;
  genres: any[] = [];

  constructor(public router: Router, private sanitizer: DomSanitizer, private api: ApiService) {
    const videoId = 'T-qGlh4joXU';
    const rawUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&mute=0`;
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
  }

  ngOnInit() {
    this.api.getGenres().subscribe({
      next: (data) => { this.genres = data; },
      error: () => {}
    });
  }
  logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}
  isLoggedIn(): boolean {
  return !!localStorage.getItem('token');
}

  toggleProfileMenu(event: Event) {
  event.stopPropagation();
  this.isDropdownOpen = false;
  this.isProfileMenuOpen = !this.isProfileMenuOpen;
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

  selectGenre(genre: string) {
    this.closeAllMenus();
    this.router.navigate(['/anime'], { queryParams: { genre } });
  }
}
