export interface Event {
  title: string;
  description?: string;
  start: string;
  end?: string;
  allDay: boolean;
  editable: boolean;
  url?: string;
  backgroundColor: string;
  source?: string;
}
