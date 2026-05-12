import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UserListComponent } from './user-list.component';
import { UserService } from '../../services/user.service';

describe('UserListComponent', () => {
  let fixture: ComponentFixture<UserListComponent>;
  let component: UserListComponent;

  function create(fail = false) {
    TestBed.configureTestingModule({
      imports: [UserListComponent, NoopAnimationsModule],
    });
    const svc = TestBed.inject(UserService);
    svc.setFailNext(fail);
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => TestBed.resetTestingModule());

  it('inicia em estado de loading', fakeAsync(() => {
    create();
    expect(component.loading()).toBe(true);
    tick(500);
    fixture.detectChanges();
    expect(component.loading()).toBe(false);
    expect(component.filtered().length).toBeGreaterThan(0);
  }));

  it('renderiza os cards de usuários carregados', fakeAsync(() => {
    create();
    tick(500);
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('.user-card');
    expect(cards.length).toBe(component.paged().length);
    expect(cards.length).toBeLessThanOrEqual(component.pageSize());
    expect(cards[0].textContent).toContain(component.paged()[0].name);
  }));

  it('aplica filtro com debounce de 300ms', fakeAsync(() => {
    create();
    tick(500);
    fixture.detectChanges();
    const initial = component.filtered().length;

    component.search.setValue('giana');
    tick(150);
    expect(component.filtered().length).toBe(initial);
    tick(200);
    fixture.detectChanges();
    expect(component.filtered().length).toBe(1);
    expect(component.filtered()[0].name).toContain('Giana');
  }));

  it('exibe mensagem de erro quando o serviço falha', fakeAsync(() => {
    create(true);
    tick(500);
    fixture.detectChanges();
    expect(component.error()).toMatch(/Falha/);
    const el = fixture.nativeElement.querySelector('.error');
    expect(el).toBeTruthy();
  }));

  it('mostra estado vazio quando o filtro não casa', fakeAsync(() => {
    create();
    tick(500);
    component.search.setValue('zzzzzzz');
    tick(300);
    fixture.detectChanges();
    expect(component.filtered().length).toBe(0);
    expect(fixture.nativeElement.querySelector('.empty')).toBeTruthy();
  }));

  it('aplica paginação client-side', fakeAsync(() => {
    create();
    tick(500);
    fixture.detectChanges();
    const total = component.filtered().length;
    expect(component.paged().length).toBeLessThanOrEqual(component.pageSize());

    component.onPage({ pageIndex: 1, pageSize: component.pageSize(), length: total });
    fixture.detectChanges();
    expect(component.pageIndex()).toBe(1);
    expect(component.paged()[0].id).not.toBe(component.filtered()[0].id);
  }));

  it('utilitários de avatar', fakeAsync(() => {
    create();
    tick(500);
    expect(component.initialsOf('Giana Sandrini')).toBe('GS');
    expect(component.initialsOf('André')).toBe('A');
    expect(component.avatarColor('Giana')).toMatch(/^#[0-9a-f]{6}$/i);
    expect(component.avatarColor('Giana')).toBe(component.avatarColor('Giana'));
  }));
});
