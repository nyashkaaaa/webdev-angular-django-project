import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  isLoading = false;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.initGoogle();

    if (typeof google !== 'undefined') {
      google.accounts.id.renderButton(
        document.getElementById('googleBtn'),
        { theme: 'outline', size: 'large', width: 320 }
      );
    }
  }

  initGoogle() {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '818339186100-48c4r7ivmnv71bv5trg2go6p2630qipu.apps.googleusercontent.com',
        callback: (response: any) => this.handleGoogleResponse(response)
      });
    }
  }

  handleGoogleResponse(response: any) {
    console.log('Google токен получен:', response.credential);
    localStorage.setItem('token', response.credential);
    this.router.navigate(['/profile']);
  }

  login() {
    if (!this.username || !this.password) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    this.isLoading = true;

    const credentials = {
      username: this.username,
      password: this.password
    };

    this.api.login(credentials).subscribe({
      next: (response: any) => {
        console.log('Успешный вход!', response);

        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.user.username);

        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Ошибка логина:', err);
        const errorMsg = err.error?.error || 'Неверный логин или пароль';
        alert(errorMsg);
      }
    });
  }
}