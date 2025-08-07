import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { NotificationComponent } from './notification.component';
import { NotificationService } from '../notification.service';
import { of, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('NotificationComponent', () => {
  let component: NotificationComponent;
  let fixture: ComponentFixture<NotificationComponent>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'createNotification',
      'getStatus',
    ]);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule],
      declarations: [NotificationComponent],
      providers: [
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationComponent);
    component = fixture.componentInstance;
    notificationService = TestBed.inject(
      NotificationService
    ) as jasmine.SpyObj<NotificationService>;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('sendNotification', () => {
    it('should call service and add notification when message is valid', () => {
      const mockResponse = {
        messageId: '123e4567-e89b-12d3-a456-426614174000',
        message: 'Test message',
        status: 'AGUARDANDO PROCESSAMENTO',
      };
      notificationService.createNotification.and.returnValue(of(mockResponse));

      component.message = 'Test message';
      component.sendNotification();

      expect(notificationService.createNotification).toHaveBeenCalledWith(
        'Test message'
      );
      expect(component.notifications.length).toBe(1);
      expect(component.notifications[0]).toEqual({
        messageId: mockResponse.messageId,
        message: 'Test message',
        status: 'AGUARDANDO PROCESSAMENTO',
      });
      expect(component.message).toBe('');
    });

    it('should not call service when message is empty', () => {
      component.message = '';
      component.sendNotification();

      component.message = '   ';
      component.sendNotification();

      expect(notificationService.createNotification).not.toHaveBeenCalled();
      expect(component.notifications.length).toBe(0);
    });
  });

  describe('polling mechanism', () => {
    it('should update notification status on interval', fakeAsync(() => {
      component.notifications = [
        {
          messageId: 'test-id-1',
          message: 'Test 1',
          status: 'AGUARDANDO PROCESSAMENTO',
        },
        {
          messageId: 'test-id-2',
          message: 'Test 2',
          status: 'AGUARDANDO PROCESSAMENTO',
        },
      ];

      notificationService.getStatus
        .withArgs('test-id-1')
        .and.returnValue(
          of({ messageId: 'test-id-1', status: 'PROCESSADO_SUCESSO' })
        );
      notificationService.getStatus
        .withArgs('test-id-2')
        .and.returnValue(
          of({ messageId: 'test-id-1', status: 'FALHA_PROCESSAMENTO' })
        );

      tick(3000);
      fixture.detectChanges();

      expect(component.notifications[0].status).toBe('PROCESSADO_SUCESSO');
      expect(component.notifications[1].status).toBe('FALHA_PROCESSAMENTO');
      expect(notificationService.getStatus).toHaveBeenCalledTimes(2);

      notificationService.getStatus.calls.reset();
      tick(3000);
      fixture.detectChanges();

      expect(notificationService.getStatus).not.toHaveBeenCalled();
    }));

    it('should unsubscribe from polling on destroy', () => {
      spyOn(component.pollingSubscription, 'unsubscribe');

      component.ngOnDestroy();

      expect(component.pollingSubscription.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('initialization', () => {
    it('should set up polling subscription on init', () => {
      expect(component.pollingSubscription).toBeDefined();
      expect(component.pollingSubscription instanceof Subscription).toBeTrue();
    });
  });
});
