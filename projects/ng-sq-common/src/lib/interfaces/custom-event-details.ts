/**
 * Payload of a `CustomEventBroadcasterService` event.
 *
 * `TDetails` defaults to `unknown`: a subscriber has to narrow the payload or ask for a specific
 * shape (`subscribeFor<SqRadioSelectedDetails>('sqRadio:selected', ...)`).
 */
export interface CustomEventDetails<TDetails = unknown> {
  details: TDetails;
}
