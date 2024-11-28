import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumBackupComponent } from './forum-backup.component';

describe('ForumBackupComponent', () => {
  let component: ForumBackupComponent;
  let fixture: ComponentFixture<ForumBackupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ForumBackupComponent]
    });
    fixture = TestBed.createComponent(ForumBackupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
