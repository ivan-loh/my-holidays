'use strict';

const _       = require('lodash');
const moment  = require('moment');
const dataset = require('./data.json');


const MyHolidays = function(year) {

  const index = year || moment().format('YYYY');

  this.holidays = dataset[index];
  this.holidays.forEach( holiday => { holiday.date = moment(holiday.date, 'YYYYMMDD').toDate(); });

};

MyHolidays.prototype.check = function (date) {

  const mh = this;
  const checkDate = moment(date).toDate();

  return _.find(mh.holidays, {date:checkDate});
};

MyHolidays.prototype.list = function () {
  return _.clone(this.holidays);
};


module.exports = MyHolidays;
