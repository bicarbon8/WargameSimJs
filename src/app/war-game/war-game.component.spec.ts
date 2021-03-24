import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarGameComponent } from './war-game.component';

describe('WarGameComponent', () => {
  let component: WarGameComponent;
  let fixture: ComponentFixture<WarGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarGameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
