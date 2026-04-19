import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnimeListComponent } from './pages/anime-list/anime-list';
import { AnimeDetailComponent } from './pages/anime-detail/anime-detail';

const routes: Routes = [
  { path: 'anime', component: AnimeListComponent },
  { path: 'anime/:id', component: AnimeDetailComponent },
  { path: '', redirectTo: 'anime', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }