import { Routes } from '@angular/router';
import { AnimeListComponent } from './pages/anime-list/anime-list';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { MyListComponent } from './pages/my-list/my-list';
import { PopularComponent } from './pages/popular/popular'

export const routes: Routes = [
  { path: '', redirectTo: 'anime', pathMatch: 'full' }, 
  { path: 'anime', component: AnimeListComponent },
  { path: 'popular', component: PopularComponent},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'my-list', component: MyListComponent },
];