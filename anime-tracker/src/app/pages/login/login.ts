import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})

export class LoginComponent {

  email = '';
  password = '';

  constructor(private api: ApiService) {}

  login() {
    const data = {
      email: this.email,
      password: this.password
    };

    this.api.login(data).subscribe((res: any) => {
      localStorage.setItem('token', res.access);
      console.log('Logged in!');
    });
  }
}
