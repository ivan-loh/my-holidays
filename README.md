# my-holidays
Malaysian Holidays Calendar

### Sample

List all holidays

```js
const MyHolidays = require('my-holidays');
const holiday    = new MyHolidays(2018);
const result     = holidays.list()
```

Check date for holiday

```js
const MyHolidays = require('my-holidays');
const holiday   = new MyHolidays(2018);
const result    = holidays.check("20180101")
```

```json
{ date: 2017-12-31T16:00:00.000Z,
  name: 'New Year\'s Day',
  includes: [ 'National' ],
  excludes: [ 'Johor', 'Kedah', 'Kelantan', 'Perlis', 'Terengganu' ] }
```
### source
- [officeholidays](https://www.officeholidays.com/countries/malaysia/)
- [publicholidays](https://publicholidays.com.my/2018-dates/)