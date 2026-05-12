import { Component } from '@angular/core';
import { UserListComponent } from './users/components/user-list/user-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UserListComponent],
  template: `<app-user-list />`,
})
export class AppComponent {}
