import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactListViewComponent } from './contact-list-view.component';

describe('ContactListViewComponent', () => {
  let component: ContactListViewComponent;
  let fixture: ComponentFixture<ContactListViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactListViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
