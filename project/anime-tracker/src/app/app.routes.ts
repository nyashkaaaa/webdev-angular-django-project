import { Routes } from '@angular/router';
import { AnimeListComponent } from './pages/anime-list/anime-list';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { MyListComponent } from './pages/my-list/my-list';
import { PopularComponent } from './pages/popular/popular';
import { ProfileComponent } from './pages/profile/profile';
import { AnimeDetailComponent } from './pages/anime-detail/anime-detail'; 
import { ProfileSettingsComponent } from './pages/profile-settings/profile-settings';
import { SearchOverlayComponent } from './pages/search-overlay/search-overlay';

export const routes: Routes = [
  { path: '', redirectTo: 'anime', pathMatch: 'full' }, 
  { path: 'anime', component: AnimeListComponent },
  { path: 'anime/:id', component: AnimeDetailComponent }, 
  { path: 'popular', component: PopularComponent},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'my-list', component: MyListComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'profile-settings', component: ProfileSettingsComponent},
  { path: 'anime-detail/:id', component: AnimeDetailComponent },
  { path: 'search-overlay', component: SearchOverlayComponent},
];