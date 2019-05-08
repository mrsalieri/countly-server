const _ = require('underscore'),
    common = require('../../../api/utils/common.js'),
    plugins = require('../../pluginManager.js');

(function() {
    // write api call
    plugins.register('/i/mrsalieri', function(ob) {
        // get request parameters, assumed params were checked for security
        const params = ob.params;

        // params validation
        const checkProps = {
            device_id: { required: true, type: 'String', 'min-length': 1 },
            my_metric: { required: true, type: 'String', 'min-length': 1 },
            my_metric_count: { required: true, type: 'Number' },
        };
        const data = _.pick(params.qstring, Object.keys(checkProps));

        if (data.my_metric_count) {
            data.my_metric_count = common.convertToType(data.my_metric_count);
        }

        if (!(common.validateArgs(data, checkProps))) {
            common.returnMessage(params, 400, 'Invalid parameter');
            return true;
        }

        // add date to data. TIMEZONE PROBLEM WITH CLIENT
        const now = new common.moment();
        data.dt = now.utc().unix() * 1000; // may be used in new features
        data.date = now.format('YYYY-MM-DD');

        /* NEEDS WRITE VALIDATION FOR APP_KEY BEFORE DB OPERATION!! */
        common.db.collection('apps').findOne({'key': params.qstring.app_key + ""}, (error, response) => {
            if (!response) {
                common.returnMessage(params, 400, 'App does not exist');
                return false;
            }

            data.app_id = response._id.toString();

            // db operations
            common.db.collection('mrsalieri').insert(data, function(err) {
                if (err) {
                    common.returnMessage(params, 400, err);
                }
                else {
                    common.returnMessage(params, 200, 'Success');
                }
            });
        });

        return true;
    });

    // read api call
    plugins.register('/o/mrsalieri', function(ob) {
        const params = ob.params;

        // read permission check
        ob.validateUserForDataReadAPI(params, function() {
            // params validation, date format control should be done for start/end dates 'YYYY-MM-DD'
            const checkProps = {
                app_id: { required: true, type: 'String' },
                time_int_start: { required: false, type: 'Number' },
                time_int_end: { required: false, type: 'Number' },
                agg: { required: false, type: 'String' },
                start_date: { required: false, type: 'String', 'min-length': 10, 'max-length': 10 },
                end_date: { required: false, type: 'String', 'min-length': 10, 'max-length': 10 },
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
                app_id: data.app_id,
                date: {$gte: startDate, $lte: endDate},
            };

            const aggParam = data.agg === 'month' ? { $substrCP: [ '$date', 0, 7 ] } : '$date';

            // prepare db tasks
            // table data
            tasks.push(new Promise(function(resolve, reject) {
                common.db.collection('mrsalieri').aggregate([
                    {
                        $match: filter,
                    },
                    {
                        $group: {
                            _id: aggParam,
                            my_metric_count: { $sum: '$my_metric_count' },
                        },
                    },
                    {
                        $sort: {
                            _id: 1,
                            my_metric_count: -1,
                        },
                    },
                ],
                function(err, response) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(response);
                });
            }));

            // metric summary data
            tasks.push(new Promise(function(resolve, reject) {
                common.db.collection('mrsalieri').aggregate([
                    {
                        $match: filter,
                    },
                    {
                        $group: {
                            _id: '$my_metric',
                            my_metric_count: { $sum: '$my_metric_count' },
                        },
                    },
                    {
                        $sort: {
                            my_metric_count: -1,
                            id: 1,
                        },
                    },
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

    /**
    * remove app related mrsalieri records
    * @param {string} appId  - app id
    */
    function removeDataForApp(appId) {
        common.db.collection('mrsalieri').remove({app_id: {$all: [appId]}}, function() {});
    }

    plugins.register('/i/apps/delete', function(ob) {
        const appId = ob.appId;
        removeDataForApp(appId);
    });

    plugins.register('/i/apps/clear_all', function(ob) {
        const appId = ob.appId;
        removeDataForApp(appId);
    });

    plugins.register('/i/apps/reset', function(ob) {
        const appId = ob.appId;
        removeDataForApp(appId);
    });
}());