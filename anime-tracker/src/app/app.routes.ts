import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { AnimeListComponent } from './pages/anime-list/anime-list';
import { AnimeDetailComponent } from './pages/anime-detail/anime-detail';
import { MyListComponent } from './pages/my-list/my-list';

export const routes: Routes = [
  { path: 'anime', component: AnimeListComponent },
  
  { path: 'my-list', component: MyListComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'anime/:id', component: AnimeDetailComponent },
  { path: '', redirectTo: '/anime', pathMatch: 'full' } 
];