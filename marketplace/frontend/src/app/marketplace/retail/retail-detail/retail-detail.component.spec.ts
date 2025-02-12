import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailDetailComponent } from './retail-detail.component';

describe('RetailDetailComponent', () => {
  let component: RetailDetailComponent;
  let fixture: ComponentFixture<RetailDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetailDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RetailDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
