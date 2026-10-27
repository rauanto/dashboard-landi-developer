import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DarkBtn } from './dark-btn';

describe('DarkBtn', () => {
  let component: DarkBtn;
  let fixture: ComponentFixture<DarkBtn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DarkBtn],
    }).compileComponents();

    fixture = TestBed.createComponent(DarkBtn);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
