import { Injectable } from '@angular/core';
import { CustomEventDetails } from '../interfaces/custom-event-details';
import { Subject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomEventBroadcasterService {
  private broadcasterSubject = new Subject();
  private broadcasterSubjectAsObservable = this.broadcasterSubject.asObservable();

  constructor() { }

  subscribeFor(eventName: string,
               callback: (eventDetails?: CustomEventDetails) => void): Subscription {
    return this.broadcasterSubjectAsObservable
      .subscribe((customEvent: {broadcastEvent: string, eventDetails?: CustomEventDetails}) => {
        if (customEvent.broadcastEvent === eventName) {
          callback(customEvent.eventDetails);
        }
      });
  }

  broadcastEvent(eventName: string, eventDetails?: CustomEventDetails) {
    this.broadcasterSubject.next({broadcastEvent: eventName, eventDetails: eventDetails});
  }
}
