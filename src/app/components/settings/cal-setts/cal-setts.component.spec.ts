import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalSettsComponent } from './cal-setts.component';

describe('CalSettsComponent', () => {
  let component: CalSettsComponent;
  let fixture: ComponentFixture<CalSettsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalSettsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalSettsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
