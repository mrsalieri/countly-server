/*global
    countlyView,
    countlyCommon,
    app,
    countlyMrsalieriPlugin,
    mrsalieriView,
    $,
 */
window.mrsalieriView = countlyView.extend({
    beforeRender: function() {
        return $.when(countlyMrsalieriPlugin.initialize()).then(function() {});
    },

    renderCommon: function() {
        var mrsalieriData = countlyMrsalieriPlugin.getData();

        this.templateData = {
            'page-title': $.i18n.map['mrsalieri.plugin-title'],
            'logo-class': '',
        };

        $(this.el).html(this.template(this.templateData));

        // columns for data table
        var columns = [
            {
                mData: '_id',
                sType: 'string',
                sTitle: $.i18n.map['mrsalieri.date'],
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

        this.dtable = $('#dataTableOne').dataTable($.extend({}, $.fn.dataTable.defaults, {
            aaData: mrsalieriData[0].data,
            aoColumns: columns,
        }));
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
