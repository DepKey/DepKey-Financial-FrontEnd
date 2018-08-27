app.controller("DashboardCtrl", function ($scope, $http) {

    function init_chart_doughnut() {

        if (typeof (Chart) === 'undefined') { return; }

        $scope.StaffAchievements = [];
        var vLabels = [];
        var vData = [];
        var vColor = [
                                'blue',
                                'green',
                                'purple',
                                'aero',
                                'red'
        ];

        $http.post('Handler.ashx?action=DashboardGetStaffAchievements').then(function (data) {
            $scope.StaffAchievements = data.data.Rows;
            var vTopCount = 0;
            $scope.StaffAchievements.forEach(function (item, index) {
                vTopCount += item.StaffCount;
                vLabels.push(item.Name);
                vData.push(item.Progress)
                item.Color = vColor[index];
            });
            $scope.StaffAchievements.push({ 'Progress': ((data.data.Rows[0].TotalAmount - vTopCount) * 100 / data.data.Rows[0].TotalAmount).toFixed(1), 'Name': 'Others', 'Color': 'red' });
            vLabels.push('Others');
            vData.push(((data.data.Rows[0].TotalAmount - vTopCount) * 100 / data.data.Rows[0].TotalAmount).toFixed(1));

            var chart_doughnut_settings = {
                type: 'doughnut',
                tooltipFillColor: "rgba(51, 51, 51, 0.55)",
                data: {
                    labels: vLabels,
                    datasets: [{
                        data: vData,
                        backgroundColor: [
                                "#3498DB",
                                "#26B99A",
                                "#9B59B6",
                                "#BDC3C7",
                                "#E74C3C"
                        ],
                        hoverBackgroundColor: [
                            "#49A9EA",
                            "#36CAAB",
                            "#B370CF",
                            "#CFD4D8",
                            "#E95E4F"
                        ]
                    }]
                },
                options: {
                    legend: false,
                    responsive: false
                }
            }

            $('.canvasDoughnut').each(function () {

                var chart_element = $(this);
                var chart_doughnut = new Chart(chart_element, chart_doughnut_settings);

            });
        });
    }
    function init_gauge() {

        if (typeof (Gauge) === 'undefined') { return; }
        var chart_gauge_settings = {
            lines: 12,
            angle: 0,
            lineWidth: 0.4,
            pointer: {
                length: 0.75,
                strokeWidth: 0.042,
                color: '#1D212A'
            },
            limitMax: 'false',
            colorStart: '#1ABC9C',
            colorStop: '#1ABC9C',
            strokeColor: '#F0F3F3',
            generateGradient: true
        };
        if ($('#chart_gauge_01').length) {

            var chart_gauge_01_elem = document.getElementById('chart_gauge_01');
            var chart_gauge_01 = new Gauge(chart_gauge_01_elem).setOptions(chart_gauge_settings);

        }
        if ($('#gauge-text').length) {

            chart_gauge_01.maxValue = 100;
            chart_gauge_01.animationSpeed = 32;
            chart_gauge_01.set($scope.SalesCounts.Completed);
            chart_gauge_01.setTextField(document.getElementById("gauge-text"));

        }
    }
    function init_flot_chart() {

        if (typeof ($.plot) === 'undefined') { return; }

        var arr_data1 = [];
        var arr_data2 = [];
        $http.post('Handler.ashx?action=DashboardGetSalesStatistics').then(function (data) {
            $scope.SalesStatistics = data.data.Rows;
            arr_data1 = [
               [gd($scope.SalesStatistics[7].Year, $scope.SalesStatistics[7].Month, $scope.SalesStatistics[7].Day), $scope.SalesStatistics[0].Count],
               [gd($scope.SalesStatistics[8].Year, $scope.SalesStatistics[8].Month, $scope.SalesStatistics[8].Day), $scope.SalesStatistics[1].Count],
               [gd($scope.SalesStatistics[9].Year, $scope.SalesStatistics[9].Month, $scope.SalesStatistics[9].Day), $scope.SalesStatistics[2].Count],
               [gd($scope.SalesStatistics[10].Year, $scope.SalesStatistics[10].Month, $scope.SalesStatistics[10].Day), $scope.SalesStatistics[3].Count],
               [gd($scope.SalesStatistics[11].Year, $scope.SalesStatistics[11].Month, $scope.SalesStatistics[11].Day), $scope.SalesStatistics[4].Count],
               [gd($scope.SalesStatistics[12].Year, $scope.SalesStatistics[12].Month, $scope.SalesStatistics[12].Day), $scope.SalesStatistics[5].Count],
               [gd($scope.SalesStatistics[13].Year, $scope.SalesStatistics[13].Month, $scope.SalesStatistics[13].Day), $scope.SalesStatistics[6].Count]
            ];
            arr_data2 = [
               [gd($scope.SalesStatistics[7].Year, $scope.SalesStatistics[7].Month, $scope.SalesStatistics[7].Day), $scope.SalesStatistics[7].Count],
               [gd($scope.SalesStatistics[8].Year, $scope.SalesStatistics[8].Month, $scope.SalesStatistics[8].Day), $scope.SalesStatistics[8].Count],
               [gd($scope.SalesStatistics[9].Year, $scope.SalesStatistics[9].Month, $scope.SalesStatistics[9].Day), $scope.SalesStatistics[9].Count],
               [gd($scope.SalesStatistics[10].Year, $scope.SalesStatistics[10].Month, $scope.SalesStatistics[10].Day), $scope.SalesStatistics[10].Count],
               [gd($scope.SalesStatistics[11].Year, $scope.SalesStatistics[11].Month, $scope.SalesStatistics[11].Day), $scope.SalesStatistics[11].Count],
               [gd($scope.SalesStatistics[12].Year, $scope.SalesStatistics[12].Month, $scope.SalesStatistics[12].Day), $scope.SalesStatistics[12].Count],
               [gd($scope.SalesStatistics[13].Year, $scope.SalesStatistics[13].Month, $scope.SalesStatistics[13].Day), $scope.SalesStatistics[13].Count]
            ];

            var chart_plot_01_settings = {
                series: {
                    lines: {
                        show: false,
                        fill: true
                    },
                    splines: {
                        show: true,
                        tension: 0.4,
                        lineWidth: 1,
                        fill: 0.4
                    },
                    points: {
                        radius: 0,
                        show: true
                    },
                    shadowSize: 2
                },
                grid: {
                    verticalLines: true,
                    hoverable: true,
                    clickable: true,
                    tickColor: "#d5d5d5",
                    borderWidth: 1,
                    color: '#fff'
                },
                colors: ["rgba(38, 185, 154, 0.38)", "rgba(3, 88, 106, 0.38)"],
                xaxis: {
                    tickColor: "rgba(51, 51, 51, 0.06)",
                    mode: "time",
                    tickSize: [1, "day"],
                    //tickLength: 10,
                    axisLabel: "Date",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 10
                },
                yaxis: {
                    ticks: 8,
                    tickColor: "rgba(51, 51, 51, 0.06)",
                },
                tooltip: false
            }

            if ($("#chart_plot_01").length) {
                console.log('Plot1');

                $.plot($("#chart_plot_01"), [arr_data1, arr_data2], chart_plot_01_settings);
            }
        });

    }
    function init_graph_bar() {
        if ($('#graph_bar').length) {

            var vData = [];
            $http.post('Handler.ashx?action=DashboardGetProfit').then(function (data) {
                vData.push({ Key: 'Fare', Value: data.data.Rows[0].Fare });
                vData.push({ Key: 'Tax', Value: data.data.Rows[0].TAX });
                vData.push({ Key: 'Cost', Value: data.data.Rows[0].TotalCost });
                vData.push({ Key: 'Sales', Value: data.data.Rows[0].SalesAmount });
                vData.push({ Key: 'Profit', Value: data.data.Rows[0].Profit });

                Morris.Bar({
                    element: 'graph_bar',
                    data: vData,
                    xkey: 'Key',
                    ykeys: ['Value'],
                    labels: ['Amount'],
                    barRatio: 0.4,
                    barColors: ['#26B99A', 'red'],
                    xLabelAngle: 35,
                    hideHover: 'auto',
                    resize: true
                });
            });
        }
    }

    $scope.SalesCounts = {};
    $http.post('Handler.ashx?action=DashboardGetSalesCounts').then(function (data) {
        $scope.SalesCounts = data.data.Rows[0];
        init_gauge();
    });

    init_flot_chart();
    init_graph_bar();
    init_chart_doughnut();

});