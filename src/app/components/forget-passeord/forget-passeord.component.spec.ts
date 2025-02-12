import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgetPasseordComponent } from './forget-passeord.component';

describe('ForgetPasseordComponent', () => {
  let component: ForgetPasseordComponent;
  let fixture: ComponentFixture<ForgetPasseordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgetPasseordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgetPasseordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
