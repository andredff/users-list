import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, combineLatest, of, startWith } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { UserDialogData, UserDialogResult, UserFormDialogComponent } from '../user-form-dialog/user-form-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatPaginatorModule,
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent {
  private readonly service = inject(UserService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload$ = new BehaviorSubject<void>(undefined);

  readonly search = new FormControl('', { nonNullable: true });
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly filtered = signal<User[]>([]);

  readonly pageSize = signal(5);
  readonly pageIndex = signal(0);
  readonly pageSizeOptions = [5, 10, 25];

  readonly paged = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  constructor() {
    const users$ = this.reload$.pipe(
      switchMap(() => {
        this.loading.set(true);
        this.error.set(null);
        return this.service.getUsers().pipe(
          catchError((err: Error) => {
            this.error.set(err.message);
            return of<User[]>([]);
          }),
        );
      }),
    );

    const term$ = this.search.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
    );

    combineLatest([users$, term$])
      .pipe(
        map(([users, term]) => this.service.filter(users, term ?? '')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((list) => {
        this.loading.set(false);
        this.filtered.set(list);
        this.pageIndex.set(0);
      });
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  trackById(_: number, user: User): number {
    return user.id;
  }

  initialsOf(name: string): string {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  avatarColor(name: string): string {
    const palette = ['#1976d2', '#388e3c', '#7b1fa2', '#d32f2f', '#f57c00', '#00838f', '#5d4037'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    return palette[hash % palette.length];
  }

  openCreate(): void {
    this.openDialog({});
  }

  openEdit(user: User): void {
    this.openDialog({ user });
  }

  private openDialog(data: UserDialogData): void {
    this.dialog
      .open<UserFormDialogComponent, UserDialogData, UserDialogResult>(
        UserFormDialogComponent,
        { data, autoFocus: 'first-tabbable', restoreFocus: false },
      )
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) this.reload$.next();
      });
  }
}
