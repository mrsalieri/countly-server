let request = require('supertest');
const should = require('should');
const common = require('../../api/utils/common.js');
const testUtils = require('../../test/testUtils');
request = request(testUtils.url);

let APP_KEY = '';
let API_KEY_ADMIN = '';
let APP_ID = '';
const DEVICE_ID = '1234567890';

describe('Testing Mrsalieri api', function() {
    /* TEST DATA SHOULD BE CLEARED!! */
    describe('Writing Mrsalieri', function() {
        it('should success', function(done) {
            APP_KEY = testUtils.get('APP_KEY') || APP_KEY;
            API_KEY_ADMIN = testUtils.get('API_KEY_ADMIN') || API_KEY_ADMIN;
            APP_ID = testUtils.get('APP_ID') || APP_ID;
            request
                .get('/i/mrsalieri?device_id=' + DEVICE_ID + '&app_key=' + APP_KEY + '&my_metric=testmetric&my_metric_count=10')
                .expect(200)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    const ob = JSON.parse(res.text);
                    ob.should.have.property('result', 'Success');
                    // setTimeout(done, 300 * testUtils.testScalingFactor);
                    done();
                });
        });
        it('missing device_id', function(done) {
            request
                .get('/i/mrsalieri?app_key=' + APP_KEY + '&my_metric=testmetric&my_metric_count=10')
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    const ob = JSON.parse(res.text);
                    ob.should.have.property('result', 'Invalid parameter');
                    // setTimeout(done, 300 * testUtils.testScalingFactor);
                    done();
                });
        });
        it('missing my_metric', function(done) {
            request
                .get('/i/mrsalieri?device_id=' + DEVICE_ID + '&app_key=' + APP_KEY + '&my_metric_count=10')
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    const ob = JSON.parse(res.text);
                    ob.should.have.property('result', 'Invalid parameter');
                    // setTimeout(done, 300 * testUtils.testScalingFactor);
                    done();
                });
        });
        it('missing my_metric_count', function(done) {
            request
                .get('/i/mrsalieri?device_id=' + DEVICE_ID + '&app_key=' + APP_KEY + '&my_metric=testmetric')
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    const ob = JSON.parse(res.text);
                    ob.should.have.property('result', 'Invalid parameter');
                    // setTimeout(done, 300 * testUtils.testScalingFactor);
                    done();
                });
        });
        it('empty device_id', function(done) {
            request
                .get('/i/mrsalieri?device_id=&app_key=' + APP_KEY + '&my_metric=testmetric&my_metric_count=10')
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    const ob = JSON.parse(res.text);
                    ob.should.have.property('result', 'Invalid parameter');
                    // setTimeout(done, 300 * testUtils.testScalingFactor);
                    done();
                });
        });
        it('empty my_metric', function(done) {
            request
                .get('/i/mrsalieri?device_id=' + DEVICE_ID + '&app_key=' + APP_KEY + '&my_metric=&my_metric_count=10')
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    const ob = JSON.parse(res.text);
                    ob.should.have.property('result', 'Invalid parameter');
                    // setTimeout(done, 300 * testUtils.testScalingFactor);
                    done();
                });
        });
        it('empty my_metric_count', function(done) {
            request
                .get('/i/mrsalieri?device_id=' + DEVICE_ID + '&app_key=' + APP_KEY + '&my_metric=testmetric&my_metric_count=')
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    const ob = JSON.parse(res.text);
                    ob.should.have.property('result', 'Invalid parameter');
                    // setTimeout(done, 300 * testUtils.testScalingFactor);
                    done();
                });
        });
        it('invalid my_metric_count', function(done) {
            request
                .get('/i/mrsalieri?device_id=' + DEVICE_ID + '&app_key=' + APP_KEY + '&my_metric=testmetric&my_metric_count=dsfsd')
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    const ob = JSON.parse(res.text);
                    ob.should.have.property('result', 'Invalid parameter');
                    // setTimeout(done, 300 * testUtils.testScalingFactor);
                    done();
                });
        });
    });

    describe('Reading Mrsalieri', function() {
        it('should success', function(done) {
            const today = new common.moment().format('YYYY-MM-DD');

            request
                .get('/o/mrsalieri?app_id=' + APP_ID + '&start_date=' + today + '&end_date=' + today + '&api_key=' + API_KEY_ADMIN)
                .expect(200)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    const ob = JSON.parse(res.text);
                    (ob.length).should.equal(2);
                    (ob[0].data.length).should.equal(1);
                    (ob[1].data.length).should.equal(1);
                    // setTimeout(done, 300 * testUtils.testScalingFactor);
                    done();
                });
        });
        it('missing api_key', function(done) {
            request
                .get('/o/mrsalieri?app_id=' + APP_ID + '&start_date=2019-03-28&end_date=2019-04-26&api_key=')
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    // setTimeout(done, 300 * testUtils.testScalingFactor);
                    done();
                });
        });
        it('missing app_id', function(done) {
            request
                .get('/o/mrsalieri?app_id=&start_date=2019-03-28&end_date=2019-04-26&api_key=' + API_KEY_ADMIN)
                .expect(401)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    // setTimeout(done, 300 * testUtils.testScalingFactor);
                    done();
                });
        });
        it('invalid start_date', function(done) {
            request
                .get('/o/mrsalieri?app_id=' + APP_ID + '&start_date=2019-3-28&end_date=2019-04-26&api_key=' + API_KEY_ADMIN)
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    // setTimeout(done, 300 * testUtils.testScalingFactor);
                    done();
                });
        });
        it('invalid end_date', function(done) {
            request
                .get('/o/mrsalieri?app_id=' + APP_ID + '&start_date=2019-03-28&end_date=2019-4-26&api_key=' + API_KEY_ADMIN)
                .expect(400)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    // setTimeout(done, 300 * testUtils.testScalingFactor);
                    done();
                });
        });
    });

    describe('Reset app', function() {
        it('should reset data', function(done) {
            const params = {app_id: APP_ID};
            request
                .get('/i/apps/reset?api_key=' + API_KEY_ADMIN + "&args=" + JSON.stringify(params))
                .expect(200)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    const ob = JSON.parse(res.text);
                    ob.should.have.property('result', 'Success');
                    setTimeout(done, 100 * testUtils.testScalingFactor);
                });
        });
        it('should success with 0 data', function(done) {
            const today = new common.moment().format('YYYY-MM-DD');

            request
                .get('/o/mrsalieri?app_id=' + APP_ID + '&start_date=' + today + '&end_date=' + today + '&api_key=' + API_KEY_ADMIN)
                .expect(200)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    const ob = JSON.parse(res.text);
                    (ob.length).should.equal(2);
                    (ob[0].data.length).should.equal(0);
                    (ob[1].data.length).should.equal(0);
                    // setTimeout(done, 300 * testUtils.testScalingFactor);
                    done();
                });
        });
    });
});