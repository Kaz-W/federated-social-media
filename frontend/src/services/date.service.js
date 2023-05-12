import { format } from 'date-fns';

export default class FormatDate {
  static format(btime, mtime) {
    return this.formatNow(btime, mtime, new Date());
  }

  static formatNow(btime, mtime, now) {

    if (!isValid(btime) || !isValid(mtime)) {
      return '[db-outdated]';
    }

    const edited = mtime.getTime() !== btime.getTime();
    const time = edited ? mtime : btime;

    let dateMessage = format(time, 'do LLL y'); // 1st Jan 2021

    if (sameDay(time, now)) {
      dateMessage = `${format(time, 'hbbb')} Today`; // 1pm Today
    } else if (sameMonth(time, now)) {
      dateMessage = format(time, `hbbb do LLL`); // 1pm 1st Jan
    }

    if (edited) dateMessage += ' (edited)'; // 1pm 1st Jan (edited)

    return dateMessage;
  }

  /**
   * For formatting a given date with only month and date - used for profile birthdays
   */
  static formatBirthday (createdTime) {
    if (!isValid(createdTime)) {
      return '[Unknown]';
    }
    return format(createdTime, 'do LLL'); // 1st Jan
  }
}

function sameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function sameMonth(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
}

function isValid(d1) {
  return d1 instanceof Date && !isNaN(d1);
}
