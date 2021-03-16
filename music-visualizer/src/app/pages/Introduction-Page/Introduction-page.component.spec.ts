import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntroductionPageComponent } from './Introduction-page.component';

describe('IntroductionPageComponent', () => {
  let component: IntroductionPageComponent;
  let fixture: ComponentFixture<IntroductionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntroductionPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IntroductionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
