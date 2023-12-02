/**
 *
 * https://gist.github.com/davidrleonard/259fe449b1ec13bf7d87cde567ca0fde
 *
 * Implements all the behaviors of moment.fromNow(). Pass a
 * valid JavaScript Date object and the method will return the
 * time that has passed since that date in a human-readable
 * format. Passes the moment test suite for `fromNow()`.
 * See: https://momentjs.com/docs/#/displaying/fromnow/
 *
 * @example
 *
 *     var pastDate = new Date('2017-10-01T02:30');
 *     var message = fromNow(pastDate);
 *     //=> '2 days ago'
 *
 */
export function fromNow(date: Date): string {
  var seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  var years = Math.floor(seconds / 31536000);
  var months = Math.floor(seconds / 2592000);
  var days = Math.floor(seconds / 86400);

  if (days > 548) {
    return years + " years ago";
  }
  if (days >= 320 && days <= 547) {
    return "a year ago";
  }
  if (days >= 45 && days <= 319) {
    return months + " months ago";
  }
  if (days >= 26 && days <= 45) {
    return "a month ago";
  }

  // rounds down
  var hours = Math.floor(seconds / 3600);

  if (hours >= 48 && days <= 25) {
    return days + " days ago";
  }
  if (hours >= 22 && hours <= 48) {
    return "a day ago";
  }

  // rounds down
  var minutes = Math.floor(seconds / 60);

  if (minutes >= 120) {
    return hours + " hours ago";
  }
  if (minutes >= 45) {
    return "an hour ago";
  }
  if (seconds >= 120) {
    return minutes + " minutes ago";
  }
  if (seconds >= 45) {
    return "a minute ago";
  }
  if (seconds >= 0) {
    return "a few seconds ago";
  }

  return "";
}
