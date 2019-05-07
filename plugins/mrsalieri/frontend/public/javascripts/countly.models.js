/*global countlyCommon,jQuery, moment*/
(function(countlyMrsalieriPlugin, $) {
    var _data = {};

    countlyMrsalieriPlugin.initialize = function() {
        return countlyMrsalieriPlugin.refreshData();
    };

    countlyMrsalieriPlugin.refreshData = function() {
        // 2019 month false
        // Apr day false
        // 24 yesterday false
        // Today hour false
        // 7days 7days true
        // 30days 30days true
        // 60days 60days true
        // calendar multi day Array [ 1551484800000, 1556150400000 ] true
        // calendar single day [ 1555977600000, 1555977600000 ] false

        var periodObj = countlyCommon.getPeriodObj();
        var period = countlyCommon.getPeriod();

        var rangeAry = []; // date list data that being searched
        var agg = 'day';

        if (['yesterday', 'hour'].includes(period)) { // today & yesterday
            rangeAry = [periodObj.activePeriod];
        }
        else if (period === 'month') { // year
            agg = 'month'; // aggregate in terms of months

            // fill the range array with starting days of months
            var year = moment().format('YYYY');
            for (var x = 1; x <= 12; x += 1) {
                rangeAry.push(year + '.' + x + '.1');
            }
        }
        else if (period === 'day') { // month
            var startDateOfMonth = moment().startOf('month');
            var endDateOfMonth = moment().endOf('month');

            // fill the range array with days of the month
            for (var date = startDateOfMonth; date <= endDateOfMonth; date = date.add(1, 'days')) {
                rangeAry.push(date.format('YYYY-M-D'));
            }
        }
        else if (Array.isArray(period) && periodObj.numberOfDays === 1) { // calendar single day
            rangeAry = [moment(period[0]).format('YYYY-M-D')];
        }
        else { // remaining options
            rangeAry = Array.isArray(periodObj.currentPeriodArr) ? periodObj.currentPeriodArr : [];
        }

        var startDate = rangeAry.length > 0 ? rangeAry[0] : null;
        var endDate = rangeAry.length > 0 ? rangeAry[rangeAry.length - 1] : null;

        //returning promise
        return $.ajax({
            type: 'GET',
            url: countlyCommon.API_URL + '/o/mrsalieri',
            data: {
                app_id: countlyCommon.ACTIVE_APP_ID,
                start_date: moment(startDate, ['YYYY-M-D', 'YYYY-M']).format('YYYY-MM-DD'),
                end_date: moment(endDate, ['YYYY-M-D', 'YYYY-M']).format('YYYY-MM-DD'),
                agg: agg,
            },
            success: function(response) {
                _data = {
                    data: response,
                    rangeAry: rangeAry
                };
            }
        });
    };

    countlyMrsalieriPlugin.getData = function() {
        return _data;
    };

}(window.countlyMrsalieriPlugin = window.countlyMrsalieriPlugin || {}, jQuery));