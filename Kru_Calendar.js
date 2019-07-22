//=============================================================================
// Calendar
// Version: 1.0.0
//=============================================================================
/*:
 * @plugindesc Calendar system
 *
 * @author Krues8dr
 *
 * @help
 * ============================================================================
 * Information
 * ============================================================================
 * Creates a custom calendaring system, with month names etc. Can be paired with
 * SRD_GoldWindow_Customizer to show the month and day in the gold menu.
 *
 * This plugin also allows events to happen as the days pass. Make sure to call
 * KruPassDays(1) on rest/sleep/inn events to track the passage of time.
 *
 * Usage:
 *
 * KruShowDate(format, date) will display the current in-game date. Both
 * parameters are optional.
 *
 * Format: a string to specify a custom date format. Can include any of the
 * following special metacharacters:
 *
 * %M - the month
 * %d - the day
 * %Y - the year
 * %N - the total number of in-game days elapsed since the beginning of the game
 *
 * Defaults to the Format parameter.
 *
 * Date: a number representing the days since the beginning of the game.
 * Defaults to the Variable parameter.
 *
 *
 * KruPassDays(N) adds N days to the current day count (as specified in the
 * Variable parameter).
 *
 *
 * To add new events you can use KruAddUpcomingEvent and KruAddEvent:
 *
 * // Create an upcoming event to show a message one day from now.
 * KruAddUpcomingEvent('Day Two', 1, '$gameMessage.add("Day Two!")');
 *
 * // Create a repeating event to show a message on the first day of the week.
 * KruAddEvent('Weekly Message', 1, '$gameMessage.add("Week!")', 'weekly');
 *
 * // Create a repeating event that only happens three times.
 * KruAddEvent('Weekly Message', 1, '$gameMessage.add("Week!")', 'weekly', 3);
 *
 * @param Variable
 * @info Variable to use to store days that have passed.
 * @type variable
 *
 * @param Months
 * @info List of months.
 * @type struct<Month>[]
 * @default ["{\"Name\":\"Bloom\",\"Days\":\"90\"}","{\"Name\":\"Summer\",\"Days\":\"90\"}","{\"Name\":\"Harvest\",\"Days\":\"90\"}","{\"Name\":\"Winter\",\"Days\":\"90\"}"]
 *
 * @param OffsetDays
 * @text Start Days
 * @info Number of days of offset the start date.
 * @type number
 * @default 128
 *
 * @param OffsetYears
 * @text Start Year
 * @info Number of Years to offset the start date.
 * @type number
 * @default 320
 *
 * @param Format
 * @text Default Format
 * @info Use the following codes: %M (Month) %d (day) %Y (Year) %N (days count)
 * @type text
 * @default %M %d %Y
 */
/*~struct~Month:
 * @param Name
 * @type text
 *
 * @param Days
 * @text Days in Month
 * @type number
 */

var Imported = Imported || {};
Imported.Kru_Calendar = "1.0.0";

var Kru = Kru || {};
Kru.Cal = {};

Kru.Cal.params = PluginManager.parameters('Kru_Calendar');
Kru.Cal.params.OffsetDays = parseInt(Kru.Cal.params.OffsetDays);
Kru.Cal.params.OffsetYears = parseInt(Kru.Cal.params.OffsetYears);
Kru.Cal.params.Variable = parseInt(Kru.Cal.params.Variable);
Kru.Cal.params.DaysInYear = 0;
Kru.Cal.params.Months = JSON.parse(Kru.Cal.params.Months);

for(let i = 0; i < Kru.Cal.params.Months.length; i++) {
  Kru.Cal.params.Months[i] = JSON.parse(Kru.Cal.params.Months[i]);
  Kru.Cal.params.DaysInYear += Kru.Cal.params.Months[i].Days;
  Kru.Cal.params.Months[i].Days = parseInt(Kru.Cal.params.Months[i].Days);
}

function KruShowDate(fmt, days) {
  let text = fmt || Kru.Cal.params['Format'];

  days = days ||
    ($gameVariables._data[Kru.Cal.params.Variable] + Kru.Cal.params.OffsetDays);

  let year = Math.floor(days / Kru.Cal.params.DaysInYear)
    + Kru.Cal.params['OffsetYears'];

  let monthDay = Kru.Cal.dateToMonthDay(days);
  let month = monthDay[0];
  let day = monthDay[1];

  text = text.replace('%Y', year)
    .replace('%M', month.Name)
    .replace('%d', day)
    .replace('%N', days);

  return text;
}

Kru.Cal.dateToMonthDay = function(days) {
  let day = days % Kru.Cal.params.DaysInYear;

  for(let i = 0; i < Kru.Cal.params.Months.length; i++) {
    month = Kru.Cal.params.Months[i];

    if(day - month.Days < 0) {
      break;
    }
    else {
      day -= month.Days;
    }
  }

  return [month, day];
}

function KruPassDays(days) {
  $gameVariables._data[Kru.Cal.params.Variable] += parseInt(days);

  $gameSystem.kruHandleEvents();
}

/* Events system */

Kru.Cal.Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
  Kru.Cal.Game_System_initialize.call(this);

  this._kruEvents = this._kruEvents || {};
};

Game_System.prototype.kruHandleEvents = function() {
  let today = $gameVariables._data[Kru.Cal.params.Variable];

  let names = Object.keys(this._kruEvents);

  let monthDay = Kru.Cal.dateToMonthDay(today);
  let month = monthDay[0];
  let day = monthDay[1];

  for(let i = 0; i < names.length; i++) {
    let name = names[i];
    let event = this._kruEvents[name];
      if(
        (event.repeat == 'yearly' &&
          today % $gameVariables._data[Kru.Cal.params.DaysInYear] === event.date) ||
        (event.repeat == 'monthly' &&
          day === event.date) ||
        (event.repeat == 'weekly' &&
          today % 7 === event.date) ||
        (event.repeat == 'daily') ||
        (!event.repeat && event.date <= today)

      ) {
        eval(event.script);

        // If we're only repeating a set number of times.
        if(event.times) {
          this._kruEvents[name].times--;
        }
        if(event.times === 0) {
          delete this._kruEvents[name];
        }
      }

  }
}

Game_System.prototype.addEvent = function(name, event) {
  this._kruEvents[name] = event;
}

Game_System.prototype.removeEvent = function(name) {
  delete this._kruEvents[name];
}

function KruAddEvent(name, date, script, repeat, times) {
  if(!repeat && !times) {
    times = 1;
  }
  $gameSystem.addEvent(name, {
    date: date,
    script: script,
    repeat: repeat,
    times: times
  });
}

function KruAddUpcomingEvent(name, daysFromNow, script) {
  let date = $gameVariables._data[Kru.Cal.params.Variable] + daysFromNow;
  KruAddEvent(name, date, script);
}

function KruRemoveEvent(name) {
  $gameSystem.removeEvent(name);
}

