/*global
    countlyView,
    countlyCommon,
    countlyGlobal,
    app,
    countlyMrsalieriPlugin,
    mrsalieriView,
    $,
    moment,
    CountlyHelpers,
    Handlebars
 */
window.mrsalieriView = countlyView.extend({
    bucket: '',
    overrideBucket: false,
    tableData: [],
    summaryData: {},
    timeChartData: [],

    beforeRender: function() {
        var self = this;
        return $.when($.get(countlyGlobal.path + '/mrsalieri/templates/mrsalieri.html', function(src) {
            //precompiled our template
            self.template = Handlebars.compile(src);
        }), countlyMrsalieriPlugin.initialize()).then(function() {});
    },

    // format data for dashboard summary
    getSummaryData: function(data) {
        // data generation for dashboard summary
        var summary = data.map(function(val) {
            var obj = {};
            obj.name = val._id;
            obj.count = val.my_metric_count;
            return obj;
        }).sort(function(a, b) { // sort desc
            return b.count - a.count;
        }).filter(function(val, key) { // select top 3
            return key <= 2;
        });

        // calculate percentages
        var totalCount = summary.reduce(function(acc, cur) {
            return acc + cur.count;
        }, 0);
        var lastElPctg = 100;

        for (var x = 0; x < summary.length; x += 1) {
            if (x === summary.length - 1) {
                summary[x].percent = lastElPctg; // to maintain 100 total
            }
            else {
                summary[x].percent = Math.round(summary[x].count * 100 / totalCount);
                lastElPctg = lastElPctg - summary[x].percent;
            }
            summary[x].color = countlyCommon.GRAPH_COLORS[x];
            delete summary[x].count;
        }

        return summary;
    },

    refreshData: function() {
        var periodObj = countlyCommon.getPeriodObj();
        var period = countlyCommon.getPeriod();

        var data = countlyMrsalieriPlugin.getData();

        // disabling hour mode of time graph
        this.bucket = null;
        this.overrideBucket = false;

        if (['yesterday', 'hour'].includes(period) || periodObj.numberOfDays === 1) {
            this.bucket = 'daily';
            this.overrideBucket = true;
        }

        var mainData = data.data[0].data;
        var rangeAry = data.rangeAry; // used in creating COMPLETE tick data for time graph

        // formatting data for time graph
        var timeChartDataObj = mainData.reduce(function(acc, cur) {
            var key = cur._id.length === 7 ? cur._id + '-01' : cur._id;
            acc[key] = cur.my_metric_count;
            return acc;
        }, {});

        // creates time graph data with no-data days
        this.timeChartData = rangeAry.map(function(val, key) {
            var formattedTime = moment(val, ['YYYY-M-D', 'YYYY-M']).format('YYYY-MM-DD');

            if (timeChartDataObj[formattedTime]) {
                return [key + 1, timeChartDataObj[formattedTime]];
            }
            return [key + 1, 0];
        });

        // creates table data
        this.tableData = mainData.map(function(val) {
            var obj = {};

            // format check for monthly aggregation, selected for table sort
            var formatAry = [6, 7].includes(val._id.length) ? ['YYYY-M', 'MMM'] : ['YYYY-M-D', 'D MMM'];

            obj._id = moment(val._id, formatAry[0]).format(formatAry[1]);
            obj.my_metric_count = val.my_metric_count;

            return obj;
        });

        // get summary data
        this.summaryData.metrics = this.getSummaryData(data.data[1].data);
        this.summaryData.dates = this.getSummaryData(this.tableData);
    },

    renderCommon: function(isRefresh) {
        this.refreshData();

        this.templateData = {
            'page-title': $.i18n.map['mrsalieri.plugin-title'],
            bars: [
                {
                    title: $.i18n.map['mrsalieri.top-metrics'],
                    data: this.summaryData.metrics,
                    help: 'mrsalieri.help-top-metrics',
                },
                {
                    title: $.i18n.map['mrsalieri.top-dates'],
                    data: this.summaryData.dates,
                    help: 'mrsalieri.help-top-dates',
                },
            ],
        };

        if (!isRefresh) {
            var template = this.template(this.templateData);
            $(this.el).html(template);

            // columns for data table
            var columns = [
                {
                    mData: '_id',
                    sType: 'customDate',
                    sTitle: $.i18n.map['common.date'],
                    sWidth: '50%',
                },
                {
                    mData: 'my_metric_count',
                    sType: 'numeric',
                    sWidth: '50%',
                    sTitle: $.i18n.map['mrsalieri.count'],
                    mRender: function(d) {
                        return countlyCommon.formatNumber(d);
                    },
                },
            ];
            this.dtable = $('.d-table').dataTable($.extend({}, $.fn.dataTable.defaults, {
                aaData: this.tableData,
                aoColumns: columns,
            }));
            $('.d-table').stickyTableHeaders();

            // console.log(Object.keys(this.dtable));

            countlyCommon.drawTimeGraph([{
                data: this.timeChartData,
                label: $.i18n.map['mrsalieri.count'],
                color: '#333933'
            }], '#dashboard-graph', this.bucket, this.overrideBucket);
        }
    },

    //refreshing out charts and tables
    refresh: function() {
        var self = this;

        // get updated data
        $.when(countlyMrsalieriPlugin.refreshData()).then(function() {
            if (app.activeView !== self) {
                return false;
            }
            self.renderCommon(true);

            // summary dashboard refresh
            var newPage = $('<div>' + self.template(self.templateData) + '</div>');
            $('.dashboard-summary').replaceWith(newPage.find('.dashboard-summary'));

            // refresh time graph
            countlyCommon.drawTimeGraph([{
                data: self.timeChartData,
                label: $.i18n.map['mrsalieri.count'],
                color: '#333933'
            }], '#dashboard-graph', self.bucket, self.overrideBucket);

            // refresh table data
            CountlyHelpers.refreshTable(self.dtable, self.tableData);
        });
    },
});

//register views
app.mrsalieriView = new mrsalieriView();

app.route('/mrsalieri', 'mrsalieri', function() {
    this.renderWhenReady(this.mrsalieriView);
});

$(document).ready(function() {
    // add the plugin link to sidebar
    var menu = '<a href="#/mrsalieri" class="item">' +
        '<div class="logo fa fa-line-chart"></div>' +
        '<div class="text" data-localize="mrsalieri.plugin-title"></div>' +
    '</a>';

    if ($('.sidebar-menu #management-menu').length) {
        $('.sidebar-menu #management-menu').before(menu);
    }
    else {
        $('.sidebar-menu').append(menu);
    }
});
