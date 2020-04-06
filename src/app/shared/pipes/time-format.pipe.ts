import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat'
})
export class TimeFormatPipe implements PipeTransform {

  transform(time): unknown {
    if(time == 12) {
      return 'Noon';
    } else {
      return convertTime(time+':00');
    }
  }

}

function convertTime(time) {
  time = time.split(':');
  var hours = Number(time[0]);
  var minutes = Number(time[1]);
  var seconds = Number(time[2]);
  var timeValue;
  if(hours > 0 && hours <= 12) {
    timeValue = "" + hours;
  } else if(hours > 12) {
    timeValue = "" + (hours - 12);
  } else if(hours == 0) {
    timeValue = "12";
  }
  timeValue += (hours >= 12) ? " PM" : " AM";
  return timeValue;
}
