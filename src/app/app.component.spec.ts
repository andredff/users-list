import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('renderiza o componente de listagem', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, NoopAnimationsModule],
    }).compileComponents();
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-user-list')).toBeTruthy();
  });
});
