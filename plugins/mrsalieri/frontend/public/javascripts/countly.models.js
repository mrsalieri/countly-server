/*global countlyCommon,jQuery*/
(function(countlyMrsalieriPlugin, $) {
    var _data = {};

    countlyMrsalieriPlugin.initialize = function() {
        //returning promise
        return $.ajax({
            type: 'GET',
            url: countlyCommon.API_URL + '/o/mrsalieri',
            data: {
                app_id: countlyCommon.ACTIVE_APP_ID,
                time_int_start: 2, // test params
                time_int_end: 0, // test params
            },
            success: function(json) {
                _data = json;
            }
        });
    };

    countlyMrsalieriPlugin.getData = function() {
        return _data;
    };

}(window.countlyMrsalieriPlugin = window.countlyMrsalieriPlugin || {}, jQuery));
