import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})

export class RegisterComponent {

  username = '';
  email = '';
  password = '';

  constructor(private api: ApiService) {}

  register() {
    const data = {
      username: this.username,
      email: this.email,
      password: this.password
    };

    this.api.register(data).subscribe(() => {
      console.log('User created!');
    });
  }

  isPasswordVisible: boolean = false;
}