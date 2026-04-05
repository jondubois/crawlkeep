import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Convert milliseconds to duration object
 * @param {Number} milliseconds - The duration in milliseconds.
 * @returns {Object} - An object containing the duration in years, months, weeks, days, hours, minutes, and seconds.
 */
export function convertMillisecondsToDuration(milliseconds) {
  param_validator.validateNumber(milliseconds);

  const millisecondsInASecond = 1000;
  const millisecondsInAMinute = 60 * millisecondsInASecond;
  const millisecondsInAnHour = 60 * millisecondsInAMinute;
  const millisecondsInADay = 24 * millisecondsInAnHour;
  const millisecondsInAWeek = 7 * millisecondsInADay;
  // Approximate number of milliseconds in a month
  const millisecondsInAMonth = 30 * millisecondsInADay;
  const millisecondsInAYear = 12 * millisecondsInAMonth;

  const years = Math.floor(milliseconds / millisecondsInAYear);
  milliseconds %= millisecondsInAYear;

  const months = Math.floor(milliseconds / millisecondsInAMonth);
  milliseconds %= millisecondsInAMonth;

  const weeks = Math.floor(milliseconds / millisecondsInAWeek);
  milliseconds %= millisecondsInAWeek;

  const days = Math.floor(milliseconds / millisecondsInADay);
  milliseconds %= millisecondsInADay;

  const hours = Math.floor(milliseconds / millisecondsInAnHour);
  milliseconds %= millisecondsInAnHour;

  const minutes = Math.floor(milliseconds / millisecondsInAMinute);
  milliseconds %= millisecondsInAMinute;

  const seconds = Math.floor(milliseconds / millisecondsInASecond);

  return { years, months, weeks, days, hours, minutes, seconds };
}

export function determineLastTwoUnitsToDisplay(duration) {
  const { years, months, weeks, days, hours, minutes, seconds } = duration;

  if (years > 0) {
    return `${years} years ${months} months`;
  } else if (months > 0) {
    return `${months} months ${weeks} weeks`;
  } else if (weeks > 0) {
    return `${weeks} weeks ${days} days`;
  } else if (days > 0) {
    return `${days} days ${hours} hours`;
  } else if (hours > 0) {
    return `${hours} hours ${minutes} minutes`;
  } else if (minutes > 0) {
    return `${minutes} minutes ${seconds} seconds`;
  } else {
    return `${seconds} seconds`;
  }
}

// // usage
// const input = {
//   electronics_engineering: {
//     xp_in_ms: 78804000000,
//     xp_in_pc: 67,
//   },
//   executive_director: {
//     xp_in_ms: 39402000000,
//     xp_in_pc: 33,
//   },
// };

// for (const key in input) {
//   const duration = convertMillisecondsToDuration(input[key].xp_in_ms);
//   const display_duration = determineLastTwoUnitsToDisplay(duration);
//   console.log(`${key}: ${display_duration}`);
// }
