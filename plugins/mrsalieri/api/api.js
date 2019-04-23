const _ = require('underscore'),
    common = require('../../../api/utils/common.js'),
    plugins = require('../../pluginManager.js');

(function() {
    // write api call
    plugins.register('/i/mrsalieri', function(ob) {
        // get request parameters, assumed params were checked for security
        const params = ob.params;
        const mode = params.qstring.mode === 'test' ? '_test' : ''; // to use test collection if necessary, may be removed

        // params validation
        const checkProps = {
            'device_id': { 'required': true, 'type': 'String', 'min-length': 1 },
            'my_metric': { 'required': true, 'type': 'String', 'min-length': 1 },
            'my_metric_count': { 'required': true, type: 'Number' },
        };
        const data = _.pick(params.qstring, Object.keys(checkProps));

        if (data.my_metric_count) {
            data.my_metric_count = common.convertToType(data.my_metric_count);
        }

        if (!(common.validateArgs(data, checkProps))) {
            common.returnMessage(params, 400, 'Invalid parameter');
            return true;
        }

        // add date to data
        const now = new common.moment();
        data.dt = now.utc().unix() * 1000; // may be used in new features
        data.date = now.format('YYYY-MM-DD');

        /* NEEDS WRITE VALIDATION FOR APP_KEY BEFORE DB OPERATION!! */

        // db operations
        common.db.collection(`mrsalieri${mode}`).insert(data, function(err) {
            if (err) {
                common.returnMessage(params, 400, err);
            }
            else {
                common.returnMessage(params, 200, 'Success');
            }
        });

        return true;
    });

    // read api call
    plugins.register('/o/mrsalieri', function(ob) {
        const params = ob.params;
        const mode = params.qstring.mode === 'test' ? '_test' : ''; // to use test collection if necessary, may be removed

        // read permission check
        ob.validateUserForDataReadAPI(params, function() {
            // params validation, date format control should be done for start/end dates 'YYYY-MM-DD'
            const checkProps = {
                'time_int_start': { 'required': true, 'type': 'Number' },
                'time_int_end': { 'required': true, 'type': 'Number' },
                'start_date': { 'required': false, 'type': 'String', 'min-length': 10, 'max-length': 10 },
                'end_date': { 'required': false, 'type': 'String', 'min-length': 10, 'max-length': 10 },
            };
            const data = _.pick(params.qstring, Object.keys(checkProps));

            if (data.time_int_start) {
                data.time_int_start = common.convertToType(data.time_int_start);
            }

            if (data.time_int_end) {
                data.time_int_end = common.convertToType(data.time_int_end);
            }

            if (!(common.validateArgs(data, checkProps))) {
                common.returnMessage(params, 400, 'Invalid parameter');
                return true;
            }

            // db tasks
            const tasks = [];

            // date filter decision
            let startDate = new common.moment().subtract(data.time_int_start, 'days').format('YYYY-MM-DD');
            let endDate = new common.moment().subtract(data.time_int_end, 'days').format('YYYY-MM-DD');

            if (data.start_date && data.end_date) {
                startDate = data.start_date;
                endDate = data.end_date;
            }

            const filter = {
                date: {$gte: startDate, $lte: endDate},
            };

            // prepare db tasks
            tasks.push(new Promise(function(resolve, reject) {
                common.db.collection(`mrsalieri${mode}`).aggregate([
                    {
                        $match: filter,
                    },
                    {
                        $group: {
                            _id: '$date',
                            my_metric_count: { $sum: '$my_metric_count' },
                        }
                    }
                ],
                function(err, response) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(response);
                });
            }));

            // run tasks
            Promise.all(tasks)
                .then(function(values) {
                    const result = [];
                    values.forEach((res) => {
                        result.push({
                            data: res,
                        });
                    });
                    common.returnOutput(params, result);
                })
                .catch(function() {
                    common.returnMessage(params, 400, 'error occured in db tasks');
                });
        });
        return true;
    });
}());
