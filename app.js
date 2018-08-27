var app = angular.module("myApp", ["ngRoute", "ui.bootstrap", "ngSanitize", "ui.select", "angular.filter"]);

//Constant
var vHostURL = 'http://5.79.102.57:8085/';
var vPageSizeGlobal = 5;
var vPageSizeSales = 20;
var vTotalSizeGlobal = 1000;
var vUnlimited = 1000000;
var TimerGetOnlineSales = 5000;
var ExcelSheet = [];

//Codes
var Administrator = 51;
var LookupType = 58;
var Lookup = 59;
var NewJournal = 60;
var Journals = 61;
var NewSale = 62;
var OnlineSales = 63;
var SalesListing = 64;
var RefundSales = 65;
var VoidSales = 66;
var JournalReport = 67;
var AirlineReport = 68;
var TotalAirlineReport = 89;
var DailySalesReport = 90;
var SalesReport = 120;
var Staff = 86;
var Accounts = 88;
var WaitingActions = 91;
var ExpensesReport = 92;
var IncomeReport = 96;
var ProfitReport = 97;
var WattingJournalAction = 108;
var RejectedJournalRequests = 122;
var StaffTotalSalesReport = 110;
var TrailBalanceReport = 111;
var SalesPerBNRReport = 113;
var InvoiceGroup = 116;
var NewInvoiceGroup = 121;

var timeout;
document.onmousemove = function () {
    clearTimeout(timeout);
    timeout = setTimeout(function () {
        removeLocalStorage();
        window.location = "/index.html";
    }, 180000);
}

function removeLocalStorage() {
    localStorage.removeItem('LoggedIn');
    localStorage.removeItem('SaleID');
    localStorage.removeItem('CurrentSalesStatus');
    localStorage.removeItem('CurrentJournalStatus');
    localStorage.removeItem('SaleID');
}

function v404() {
    removeLocalStorage();
    window.location = "/error.html";
    return false;
};

app.service('CommonFunctions', function ($http) {
    this.InsertLog = function (vAction, vRelatedID, vType, vDetails) {
        var ObjectLog = {};
        ObjectLog.Action = vAction;
        ObjectLog.RelatedID = vRelatedID;
        ObjectLog.StaffID = JSON.parse(localStorage.getItem('LoggedIn')).ID;
        ObjectLog.Type = vType;
        ObjectLog.Details = vDetails;
        $http.post(vHostURL + 'Handler.ashx?action=InsertLog', ObjectLog);
    };
});

function PrintElem(elem) {
    var divToPrint = document.getElementById(elem);
    newWin = window.open("");
    newWin.document.write(divToPrint.outerHTML);
    newWin.print();
    newWin.close();
}

function ExcelToJSON(file) {
    // Create A File Reader HTML5
    var fileReader = new FileReader();

    // Ready The Event For When A File Gets Selected
    fileReader.onload = function (e) {
        var buffer = new Uint8Array(fileReader.result);

        $.ig.excel.Workbook.load(buffer, function (workbook) {
            var column, row, newRow, cellValue, columnIndex, i,
                worksheet = workbook.worksheets(0),
                columnsNumber = 0,
                gridColumns = [],
                data = [],
                worksheetRowsCount;

            // Both the columns and rows in the worksheet are lazily created and because of this most of the time worksheet.columns().count() will return 0
            // So to get the number of columns we read the values in the first row and count. When value is null we stop counting columns:
            while (worksheet.rows(0).getCellValue(columnsNumber)) {
                columnsNumber++;
            }

            // Iterating through cells in first row and use the cell text as key and header text for the grid columns
            for (columnIndex = 0; columnIndex < columnsNumber; columnIndex++) {
                column = worksheet.rows(0).getCellText(columnIndex);
                gridColumns.push({ headerText: column, key: column });
            }

            // We start iterating from 1, because we already read the first row to build the gridColumns array above
            // We use each cell value and add it to json array, which will be used as dataSource for the grid
            for (i = 1, worksheetRowsCount = worksheet.rows().count() ; i < worksheetRowsCount; i++) {
                newRow = {};
                row = worksheet.rows(i);

                for (columnIndex = 0; columnIndex < columnsNumber; columnIndex++) {
                    cellValue = row.getCellText(columnIndex);
                    newRow[gridColumns[columnIndex].key] = cellValue;
                }

                data.push(newRow);
            }

            ExcelSheet = data;

        }, function (error) {
            $("#result").text("The excel file is corrupted.");
            $("#result").show(1000);
        });
    };

    if (file.type === "application/vnd.ms-excel" || file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || (file.type === "" && (file.name.endsWith("xls") || file.name.endsWith("xlsx")))) {
        fileReader.readAsArrayBuffer(file);
    }
};

Number.prototype.pad = function (size) {
    var s = String(this);
    while (s.length < (size || 2)) { s = "0" + s; }
    return s;
}

app.controller("HomeCtrl", function ($scope, $rootScope, $location, $http, $route) {

    $scope.Name = JSON.parse(localStorage.getItem('LoggedIn')).Name;
    $scope.RoleID = JSON.parse(localStorage.getItem('LoggedIn')).RoleID;
    $scope.BranchID = JSON.parse(localStorage.getItem('LoggedIn')).BranchID;
    $rootScope.CurrentRoute = $location.path();

    $scope.Logout = function () {
        removeLocalStorage();
        window.location = "/login.html";
    };

    $scope.SwichBranch = function (BranchID) {
        var LoggedIn = JSON.parse(localStorage.LoggedIn);
        localStorage.removeItem('LoggedIn');
        LoggedIn.BranchID = BranchID;
        localStorage.setItem("LoggedIn", JSON.stringify(LoggedIn));
        $scope.BranchID = JSON.parse(localStorage.getItem('LoggedIn')).BranchID;
        $route.reload();
    }

    $scope.ChangeRoute = function (type, number) {
        if (number != null && number < 10)
            localStorage.setItem('CurrentSalesStatus', number);
        else if (number != null && number > 10)
            localStorage.setItem('CurrentJournalStatus', number);
        if (type != null)
            $location.path("/" + type);
        localStorage.removeItem('SaleID');
        localStorage.removeItem('SaleID');
        $rootScope.CurrentRoute = $location.path();
    };

    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages != null)
        $scope.UserPages = JSON.parse(localStorage.getItem('LoggedIn')).UserPages.toString().split(',');
    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPermissions != null)
        $rootScope.UserPermissions = JSON.parse(localStorage.getItem('LoggedIn')).UserPermissions.toString().split(',');

    $rootScope.Notifications = 0;
    $rootScope.NotificationsSalesCount = 0;
    $rootScope.NotificationsJournalCount = 0;
    $rootScope.NotificationsList = [];
    $scope.NotificationObject = {};
    $scope.NotificationObject.IsSeen = 0;
    $http.post(vHostURL + 'Handler.ashx?action=SelectNotification', $scope.NotificationObject).then(function (data) {
        $rootScope.NotificationsList = data.data.Rows;
        $http.post(vHostURL + 'Handler.ashx?action=CountNotification', $scope.NotificationObject).then(function (data) {
            $rootScope.Notifications = data.data.Rows[0].NotificationsCount;
            $rootScope.NotificationsSalesCount = data.data.Rows[0].NotificationsSalesCount;
            $rootScope.NotificationsJournalCount = data.data.Rows[0].NotificationsJournalCount;
        });
    });

    $scope.GetNotification = function () {
        $rootScope.NotificationsSalesCount = 0;
        $rootScope.NotificationsJournalCount = 0;
        $rootScope.NotificationsList = [];
        $scope.NotificationObject = {};
        $scope.NotificationObject.IsSeen = 0;
        $http.post(vHostURL + 'Handler.ashx?action=SelectNotification', $scope.NotificationObject).then(function (data) {
            $rootScope.NotificationsList = data.data.Rows;
            $http.post(vHostURL + 'Handler.ashx?action=CountNotification', $scope.NotificationObject).then(function (data) {
                $rootScope.NotificationsSalesCount = data.data.Rows[0].NotificationsSalesCount;
                $rootScope.NotificationsJournalCount = data.data.Rows[0].NotificationsJournalCount;
            });
        });
    }
    $.connection.hub.url = vHostURL;
    $scope.hub = $.connection.salesHub;

    $scope.initPushNotifications = function () {
        $scope.hub.client.NotificationCountDown = function (message) {
            $scope.$apply(function () {
                $rootScope.Notifications--;
            });
        };
        $scope.hub.client.NotificationFired = function (message) {
            $scope.$apply(function () {
                $rootScope.Notifications++;
                $rootScope.NotificationsList.push(message);
            });
        };
        $.connection.hub.start();
    };

    $scope.initPushNotifications();
});

app.directive('accessibleForm', function () {
    return {
        restrict: 'A',
        link: function (scope, elem) {

            // set up event handler on the form element
            elem.on('submit', function () {

                // find the first invalid element
                var firstInvalid = elem[0].querySelector('.ng-invalid');

                // if we find one, set focus
                if (firstInvalid) {
                    firstInvalid.focus();
                }
            });
        }
    };
});

app.directive('loading', ['$http', function ($http) {
    return {
        restrict: 'A',
        template: '<div class="loading-spiner"><img width="60px" src="/Template/images/loading-animated.gif" /> </div>',
        link: function (scope, elm, attrs) {
            scope.isLoading = function () {
                return $http.pendingRequests.length > 0;
            };

            scope.$watch(scope.isLoading, function (v) {
                if (v) {
                    elm.show();
                } else {
                    elm.hide();
                }
            });
        }
    };
}]);

app.directive('numbersOnly', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^0-9.]/g, '');

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});

app.config(function ($routeProvider, $locationProvider) {
    if (localStorage.getItem('LoggedIn') == null || JSON.parse(localStorage.getItem('LoggedIn')).UserPages == null)
        window.location = "/login.html";

    $routeProvider
        //.when("/", {
        //    templateUrl: "Department/Dashboard.html",
        //    controller: "HomeCtrl"
        //})
        .when("/", {
            templateUrl: "Department/Dashboard/Dashboard.html",
            controller: "DashboardCtrl"
        })
        .when("/LookupType", {
            templateUrl: "Department/Admin/LookupType.html",
            controller: "LookupTypeCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(LookupType) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/Lookup", {
            templateUrl: "Department/Admin/Lookup.html",
            controller: "LookupCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(Lookup) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/Staff", {
            templateUrl: "Department/Admin/Staff.html",
            controller: "StaffCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(Staff) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/Accounts", {
            templateUrl: "Department/Admin/Accounts.html",
            controller: "AccountsCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(Accounts) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/NewJournal", {
            templateUrl: "Department/Journals/New.html",
            controller: "NewJournalCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(NewJournal) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/Journals", {
            templateUrl: "Department/Journals/List.html",
            controller: "JournalsCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(Journals) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/WattingJournalAction", {
            templateUrl: "Department/Journals/List.html",
            controller: "JournalsCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(WattingJournalAction) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/RejectedJournalRequests", {
            templateUrl: "Department/Journals/List.html",
            controller: "JournalsCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(RejectedJournalRequests) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/NewSale", {
            templateUrl: "Department/Sales/New.html",
            controller: "NewSaleCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(NewSale) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/OnlineSales", {
            templateUrl: "Department/Sales/List.html",
            controller: "SalesCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(OnlineSales) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/SalesListing", {
            templateUrl: "Department/Sales/List.html",
            controller: "SalesCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(SalesListing) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/RefundSales", {
            templateUrl: "Department/Sales/List.html",
            controller: "SalesCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(RefundSales) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/VoidSales", {
            templateUrl: "Department/Sales/List.html",
            controller: "SalesCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(VoidSales) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/InvoiceGroup/:invoiceNumber?", {
            templateUrl: "Department/Sales/InvoiceGroup.html",
            controller: "InvoiceGroupCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(InvoiceGroup) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/NewInvoiceGroup", {
            templateUrl: "Department/Sales/NewInvoiceGroup.html",
            controller: "NewInvoiceGroupCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(NewInvoiceGroup) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/WaitingActions", {
            templateUrl: "Department/Sales/List.html",
            controller: "SalesCtrl"
        })
        .when("/RejectedRequests", {
            templateUrl: "Department/Sales/List.html",
            controller: "SalesCtrl"
        })
        .when("/JournalReport", {
            templateUrl: "Department/Reports/JournalReport.html",
            controller: "JournalReportCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(JournalReport) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/AirlineReport", {
            templateUrl: "Department/Reports/AirlineReport.html",
            controller: "AirlineReportCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(AirlineReport) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/DailySalesReport", {
            templateUrl: "Department/Reports/DailySalesReport.html",
            controller: "DailySalesReportCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(DailySalesReport) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/SalesReport", {
            templateUrl: "Department/Reports/SalesReport.html",
            controller: "SalesReportCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(SalesReport) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/TotalAirlineReport", {
            templateUrl: "Department/Reports/TotalAirlineReport.html",
            controller: "TotalAirlineReportCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(TotalAirlineReport) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/ExpensesReport", {
            templateUrl: "Department/Reports/ExpensesReport.html",
            controller: "ExpensesReportCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(ExpensesReport) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/IncomeReport", {
            templateUrl: "Department/Reports/IncomeReport.html",
            controller: "IncomeReportCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(IncomeReport) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/ProfitReport", {
            templateUrl: "Department/Reports/ProfitReport.html",
            controller: "ProfitReportCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(ProfitReport) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/Outstanding", {
            templateUrl: "Department/Journals/Outstanding.html",
            controller: "OutstandingCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(ProfitReport) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/StaffTotalSalesReport", {
            templateUrl: "Department/Reports/StaffTotalSalesReport.html",
            controller: "StaffTotalSalesReportCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(StaffTotalSalesReport) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/TrailBalanceReport", {
            templateUrl: "Department/Reports/TrailBalanceReport.html",
            controller: "TrailBalanceReportCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(TrailBalanceReport) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/SalesPerBNRReport", {
            templateUrl: "Department/Reports/SalesPerBNRReport.html",
            controller: "SalesPerBNRReportCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(SalesPerBNRReport) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .when("/Log", {
            templateUrl: "Department/Admin/Log.html",
            controller: "LogCtrl",
            resolve: {
                resolvedVal: function () {
                    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPages.indexOf(TrailBalanceReport) > -1)
                        return true;
                    else
                        v404();
                }
            }
        })
        .otherwise({
            templateUrl: "error.html"
        });

    $locationProvider.hashPrefix('');
    $locationProvider.html5Mode(true);
});

app.run(function ($rootScope, $location, $) {

    $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

    if (JSON.parse(localStorage.getItem('LoggedIn')).UserPermissions != null)
        $rootScope.UserPermissions = JSON.parse(localStorage.getItem('LoggedIn')).UserPermissions.toString().split(',');

    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        var currentURL = $location.path();
        $rootScope.styleMenu = {

        };
        if (currentURL.indexOf('Report') > -1) {
            $rootScope.IsSalesReportRoute = true;
            $rootScope.CurrentRoute = 'fake';
            $rootScope.styleMenu = {
                'display': 'none !important'
            };
        }
        else {
            $rootScope.IsSalesReportRoute = false;
            $rootScope.styleMenu = {
                'display': 'block !important'
            };
        }
    });

});

app.filter('propsFilter', function () {
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            var keys = Object.keys(props);

            items.forEach(function (item) {
                var itemMatches = false;

                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
});

app.filter('sumByKey', function () {
    return function (data, key) {
        if (typeof (data) === 'undefined' || typeof (key) === 'undefined') {
            return 0;
        }
        var sum = 0;
        for (var i = data.length - 1; i >= 0; i--) {
            sum += parseFloat(data[i][key]);
        }
        return parseFloat(sum.toFixed(3));
    };
});

app.filter('RoundByKey', function () {
    return function (data, key) {
        if (typeof (data) === 'undefined' || typeof (key) === 'undefined') {
            return 0;
        }
        var sum = 0;
        sum += parseFloat(data);

        return parseFloat(sum.toFixed(3));
    };
});