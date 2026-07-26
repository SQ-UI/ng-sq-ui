import { Injectable } from '@angular/core';
import { CustomEventDetails } from '../interfaces/custom-event-details';
import { Subject, Subscription } from 'rxjs';

/**
 * Cross-component event bus using RxJS Subject.
 *
 * Evaluated for signal-based replacement in Milestone 1. Decision: retain
 * the RxJS Subject pattern. Rationale: Angular signals are pull-based
 * (computed/effect) and designed for component-level state. This service
 * implements push-based pub/sub for named events across unrelated components
 * (e.g., RadiobuttonComponent group exclusivity via 'sqRadio:selected').
 * RxJS Subject is the correct primitive for this pattern — signals cannot
 * replicate named-event multicasting. Subscribers update component-level
 * signals in their callbacks to trigger change detection under zoneless mode.
 */
@Injectable({ providedIn: 'root' })
export class CustomEventBroadcasterService {
  private broadcasterSubject = new Subject<{broadcastEvent: string, eventDetails?: CustomEventDetails}>();
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
