import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile-settings.html',
  styleUrls: ['./profile-settings.css']
})
export class ProfileSettingsComponent {
  backgroundTab: 'static' | 'animated' = 'static';

  form = {
    username: '',
    gender: '',
    bio: '',
    avatarPreview: '',
    backgroundPreview: '',
  };

  constructor(private router: Router) {}

  onAvatarChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.form.avatarPreview = reader.result as string;
    reader.readAsDataURL(file);
  }

  onBackgroundChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.form.backgroundPreview = reader.result as string;
    reader.readAsDataURL(file);
  }

  onSave() {
    console.log('Сохранение настроек:', this.form);
    this.router.navigate(['/profile']);
  }
}
