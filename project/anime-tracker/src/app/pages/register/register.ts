import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  // Эти переменные будут связаны с формой через ngModel
  username = '';
  email = '';
  password = '';
  
  isPasswordVisible: boolean = false;
  isLoading: boolean = false; // Для индикации загрузки

  constructor(private api: ApiService, private router: Router) {}

  register() {
    if (!this.username || !this.email || !this.password) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    this.isLoading = true;
    const data = {
      username: this.username,
      email: this.email,
      password: this.password
    };

    this.api.register(data).subscribe({
      next: (response) => {
        console.log('Пользователь создан!', response);
        alert('Регистрация прошла успешно!');
        this.router.navigate(['/login']); // Перенаправляем на вход
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Полная ошибка:', err);
        
        // Достаем точный ответ от Django
        if (err.error) {
          // Превращаем JSON-ошибку от сервера в текст
          alert('Ответ сервера: ' + JSON.stringify(err.error, null, 2));
        } else {
          alert('Ошибка соединения с сервером');
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}