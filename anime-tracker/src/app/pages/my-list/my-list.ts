import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms';   

@Component({
  selector: 'app-my-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './my-list.html',
  styleUrl: './my-list.css',
})


export class MyListComponent {

  myList: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getMyList().subscribe((data: any) => {
      this.myList = data;
    });
  }

  update(item: any) {
    this.api.updateList(item.id, item).subscribe(() => {
      console.log('Updated');
    });
  }

  delete(id: number) {
    this.api.deleteFromList(id).subscribe(() => {
      this.myList = this.myList.filter(i => i.id !== id);
    });
  }
}
