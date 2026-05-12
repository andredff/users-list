import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { PhoneType, User } from '../models/user.model';

const INITIAL_USERS: User[] = [
  { id: 1, name: 'Giana Sandrini', email: 'giana@attus.com.br', cpf: '123.456.789-09', phone: '(48) 99999-1111', phoneType: 'CELULAR' },
  { id: 2, name: 'André Ferreira',  email: 'andre@attus.com.br', cpf: '987.654.321-00', phone: '(11) 98888-2222', phoneType: 'CELULAR' },
  { id: 3, name: 'Mariana Costa',   email: 'mariana@attus.com.br', cpf: '111.222.333-96', phone: '(21) 3344-5566',  phoneType: 'COMERCIAL' },
  { id: 4, name: 'Bruno Almeida',   email: 'bruno@attus.com.br', cpf: '222.333.444-05', phone: '(31) 3322-1100',  phoneType: 'RESIDENCIAL' },
  { id: 5, name: 'Carla Souza',     email: 'carla@attus.com.br', cpf: '333.444.555-14', phone: '(41) 97777-3333', phoneType: 'CELULAR' },
  { id: 6, name: 'Diego Pereira',   email: 'diego@attus.com.br', cpf: '444.555.666-23', phone: '(51) 96666-4444', phoneType: 'CELULAR' },
];

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly users$ = new BehaviorSubject<User[]>(INITIAL_USERS);
  private failNext = false;
  private nextId = INITIAL_USERS.length + 1;

  setFailNext(fail: boolean): void {
    this.failNext = fail;
  }

  getUsers(): Observable<User[]> {
    return timer(400).pipe(
      switchMap(() =>
        this.failNext
          ? throwError(() => new Error('Falha ao carregar usuários'))
          : this.users$.pipe(take(1)),
      ),
    );
  }

  save(data: Omit<User, 'id'>): User {
    const user: User = { ...data, id: this.nextId++ };
    this.users$.next([...this.users$.value, user]);
    return user;
  }

  update(id: number, data: Omit<User, 'id'>): User {
    const user: User = { ...data, id };
    this.users$.next(this.users$.value.map((u) => (u.id === id ? user : u)));
    return user;
  }

  filter(users: User[], term: string): User[] {
    const q = term.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q));
  }

  get phoneTypes(): PhoneType[] {
    return ['CELULAR', 'RESIDENCIAL', 'COMERCIAL'];
  }
}
