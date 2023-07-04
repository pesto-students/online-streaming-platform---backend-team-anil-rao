exports.datefunction = function () {
  today = Date.now();

  // console.log("today: ", today);

  var date = new Date(today);
  var hour = date.getHours();

  // console.log("hour: ", hour);
  hour = (hour < 10 ? "0" : "") + hour;

  var min = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;

  var sec = date.getSeconds();
  sec = (sec < 10 ? "0" : "") + sec;

  var year = date.getFullYear();

  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;

  var day = date.getDate();
  day = (day < 10 ? "0" : "") + day;

  var dateis = year + "" + month + "" + day + "" + hour + "" + min + "" + sec;

  // console.log("dateis: ", dateis);

  return dateis;
}; // end of datefunction

//human readable date

exports.humanReadableFunction = function (cDate) {
  cDate = String(cDate);
  year = cDate.substring(0, 4);
  month = cDate.substring(4, 6);
  date = cDate.substring(6, 8);
  humanReadable = date + "-" + month + "-" + year;

  return humanReadable;
};

exports.humanReadableTimeFunction = function (cDate) {
  cDate = String(cDate);
  year = cDate.substring(0, 4);
  month = cDate.substring(4, 6);
  date = cDate.substring(6, 8);
  hours = cDate.substring(8, 10);
  mins = cDate.substring(10, 12);
  humanReadableTime =
    hours + ":" + mins + " " + date + "-" + month + "-" + year;

  return humanReadableTime;
};

exports.timefunction = function () {
  today = Date.now();

  var date = new Date(today);

  var hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;

  var min = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;

  var dateis = hour + "" + min;

  return dateis;
}; // end of datefunction
