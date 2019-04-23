var request = require('supertest');
var should = require('should');
var testUtils = require('../../test/testUtils');
request = request(testUtils.url);

var APP_KEY = '';
var API_KEY_ADMIN = '';
var APP_ID = '';
var DEVICE_ID = '1234567890';

describe('Testing Mrsalieri api', function() {
    /* TEST DATA SHOULD BE CLEARED!! */
    describe('Writing Mrsalieri', function() {
        it('should success', function(done) {
            request
                .get('/i/mrsalieri?mode=test&device_id=' + DEVICE_ID + '&app_key=' + APP_KEY + '&my_metric=testmetric&my_metric_count=10')
                .expect(200)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    var ob = JSON.parse(res.text);
                    ob.should.have.property('result', 'Success');
                    setTimeout(done, 300 * testUtils.testScalingFactor);
                });
        });
        it('missing device_id', function(done) {
            request
                .get('/i/mrsalieri?mode=test&app_key=' + APP_KEY + '&my_metric=testmetric&my_metric_count=10')
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    var ob = JSON.parse(res.text);
                    ob.should.have.property('result', 'Invalid parameter');
                    setTimeout(done, 300 * testUtils.testScalingFactor);
                });
        });
        it('missing my_metric', function(done) {
            request
                .get('/i/mrsalieri?mode=test&device_id=' + DEVICE_ID + '&app_key=' + APP_KEY + '&my_metric_count=10')
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    var ob = JSON.parse(res.text);
                    ob.should.have.property('result', 'Invalid parameter');
                    setTimeout(done, 300 * testUtils.testScalingFactor);
                });
        });
        it('missing my_metric_count', function(done) {
            request
                .get('/i/mrsalieri?mode=test&device_id=' + DEVICE_ID + '&app_key=' + APP_KEY + '&my_metric=testmetric')
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    var ob = JSON.parse(res.text);
                    ob.should.have.property('result', 'Invalid parameter');
                    setTimeout(done, 300 * testUtils.testScalingFactor);
                });
        });
        it('empty device_id', function(done) {
            request
                .get('/i/mrsalieri?mode=test&device_id=&app_key=' + APP_KEY + '&my_metric=testmetric&my_metric_count=10')
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    var ob = JSON.parse(res.text);
                    ob.should.have.property('result', 'Invalid parameter');
                    setTimeout(done, 300 * testUtils.testScalingFactor);
                });
        });
        it('empty my_metric', function(done) {
            request
                .get('/i/mrsalieri?mode=test&device_id=' + DEVICE_ID + '&app_key=' + APP_KEY + '&my_metric=&my_metric_count=10')
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    var ob = JSON.parse(res.text);
                    ob.should.have.property('result', 'Invalid parameter');
                    setTimeout(done, 300 * testUtils.testScalingFactor);
                });
        });
        it('empty my_metric_count', function(done) {
            request
                .get('/i/mrsalieri?mode=test&device_id=' + DEVICE_ID + '&app_key=' + APP_KEY + '&my_metric=testmetric&my_metric_count=')
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    var ob = JSON.parse(res.text);
                    ob.should.have.property('result', 'Invalid parameter');
                    setTimeout(done, 300 * testUtils.testScalingFactor);
                });
        });
        it('invalid my_metric_count', function(done) {
            request
                .get('/i/mrsalieri?mode=test&device_id=' + DEVICE_ID + '&app_key=' + APP_KEY + '&my_metric=testmetric&my_metric_count=dsfsd')
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    var ob = JSON.parse(res.text);
                    ob.should.have.property('result', 'Invalid parameter');
                    setTimeout(done, 300 * testUtils.testScalingFactor);
                });
        });
    });

    describe('Reading Mrsalieri', function() {
        it('should success', function(done) {
            /* TOKEN AND APP_ID SHOULD BE GIVEN TO TEST */
            // request
            //     .get('/o/mrsalieri?mode=test&device_id=' + DEVICE_ID + '&app_key=' + APP_KEY + '&my_metric=testmetric&my_metric_count=10')
            //     .expect(200)
            //     .end(function(err, res) {
            //         if (err) {
            //             return done(err);
            //         }
            //         var ob = JSON.parse(res.text);
            //         ob.should.have.property('result', 'Success');
            //         setTimeout(done, 300 * testUtils.testScalingFactor);
            //     });
        });
        it('missing token', function(done) {
            request
                .get('/o/mrsalieri?mode=test&time_int_start=2&time_int_end=0&app_id=' + APP_ID)
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    setTimeout(done, 300 * testUtils.testScalingFactor);
                });
        });
        it('missing app_id', function(done) {
            /* TOKEN SHOULD BE GIVEN TO TEST */
            // request
            //     .get('/o/mrsalieri?mode=test&time_int_start=2&time_int_end=0')
            //     .expect(401)
            //     .end(function(err, res) {
            //         if (err) {
            //             return done(err);
            //         }
            //         setTimeout(done, 300 * testUtils.testScalingFactor);
            //     });
        });
        it('invalid time_int_start', function(done) {
            /* TOKEN AND APP_ID SHOULD BE GIVEN TO TEST */
            // request
            //     .get('/o/mrsalieri?mode=test&time_int_start=dsfds&time_int_end=0&app_id=' + APP_ID)
            //     .expect(400)
            //     .end(function(err, res) {
            //         if (err) {
            //             return done(err);
            //         }
            //         setTimeout(done, 300 * testUtils.testScalingFactor);
            //     });
        });
        it('invalid time_int_end', function(done) {
            /* TOKEN AND APP_ID SHOULD BE GIVEN TO TEST */
            // request
            //     .get('/o/mrsalieri?mode=test&time_int_start=2&time_int_end=asfsdg&app_id=' + APP_ID)
            //     .expect(400)
            //     .end(function(err, res) {
            //         if (err) {
            //             return done(err);
            //         }
            //         setTimeout(done, 300 * testUtils.testScalingFactor);
            //     });
        });
    });
});
