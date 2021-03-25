import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NotFoundPageComponent } from './not-found-page.component';
import {AngularFireModule} from "@angular/fire";
import {firebaseConfig} from "../../firebase";
import {NotifierModule} from "angular-notifier";

describe('NotFoundPageComponent', () => {
  let component: NotFoundPageComponent;
  let fixture: ComponentFixture<NotFoundPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        // BrowserModule,
        AngularFireModule.initializeApp(firebaseConfig),
        // AngularFireDatabaseModule,
        // AngularFireAuthModule,
        // AngularFirestoreModule,
        NotifierModule
      ],
      declarations: [ NotFoundPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotFoundPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('test getRoute()', () => {
    // Todo: mock login
    var ret = component.getRoute();
    expect(ret).toEqual('../');
  });

  it('test getRouteName()', () => {
    // Todo: mock login
    var ret = component.getRouteName();
    expect(ret).toEqual('Home Page');
  });
});
