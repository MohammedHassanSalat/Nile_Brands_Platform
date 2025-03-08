import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatebrandComponent } from './updatebrand.component';

describe('UpdatebrandComponent', () => {
  let component: UpdatebrandComponent;
  let fixture: ComponentFixture<UpdatebrandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdatebrandComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdatebrandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
