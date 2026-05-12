import { TestBed } from '@angular/core/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { UserService } from './user.service';
import { User } from '../models/user.model';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserService);
  });

  it('emite a lista de usuários após o delay', fakeAsync(() => {
    let result: User[] | undefined;
    service.getUsers().subscribe((u) => (result = u));
    tick(400);
    expect(result).toBeDefined();
    expect(result!.length).toBeGreaterThan(0);
    expect(result![0]).toEqual(
      expect.objectContaining({ name: expect.any(String), email: expect.any(String) }),
    );
  }));

  it('propaga erro quando setFailNext(true)', fakeAsync(() => {
    service.setFailNext(true);
    let err: Error | undefined;
    service.getUsers().subscribe({ error: (e) => (err = e) });
    tick(400);
    expect(err).toBeInstanceOf(Error);
    expect(err!.message).toMatch(/Falha/);
  }));

  it('filtra por nome case-insensitive', () => {
    const base = { cpf: '000.000.000-00', phone: '(00) 00000-0000', phoneType: 'CELULAR' as const };
    const users: User[] = [
      { id: 1, name: 'Giana Sandrini', email: 'g@x.com', ...base },
      { id: 2, name: 'André', email: 'a@x.com', ...base },
    ];
    expect(service.filter(users, 'gia')).toHaveLength(1);
    expect(service.filter(users, 'GIA')[0].name).toBe('Giana Sandrini');
    expect(service.filter(users, '')).toHaveLength(2);
    expect(service.filter(users, '   ')).toHaveLength(2);
    expect(service.filter(users, 'zzz')).toHaveLength(0);
  });
});
