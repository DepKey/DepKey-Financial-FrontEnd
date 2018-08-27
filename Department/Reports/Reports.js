app.controller("JournalReportCtrl", function ($scope, $http, $filter) {
    $scope.ObjectSearch = {};
    $scope.ObjectSearch.IsDeleted = 0;
    $scope.ObjectSearch.DateFrom = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.ObjectSearch.DateTo = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.List = [];

    //Initial
    //Get Main Accounts
    $scope.ObjectMainAccounts = {};
    $scope.ObjectMainAccounts.IsDeleted = false;
    $scope.ObjectMainAccounts.AccountTypeID = 47;
    $http.post(vHostURL + 'Handler.ashx?action=SelectAccount&PageNumber=1&PageSize=' + vTotalSizeGlobal,
        $scope.ObjectMainAccounts).then(function (data) {
            $scope.MainAccounts = data.data.Rows;
            $scope.MainAccounts.unshift({ID : null ,Name: 'All'});
            $scope.SubAccounts = [];
            $scope.Select();
        });

    $scope.SelectAccount = function (MainAccountID) {
        $scope.ObjectAccount = {};
        $scope.ObjectAccount.IsDeleted = false;
        $scope.ObjectAccount.ParentID = MainAccountID;
        $scope.ObjectSearch.SubAcc = null;
        $scope.SubAccounts = [];
        $http.post(vHostURL + 'Handler.ashx?action=SelectAccount&PageNumber=1&PageSize=' + vTotalSizeGlobal, $scope.ObjectAccount).then(
            function (data) {
                $scope.SubAccounts = data.data.Rows;
                $scope.SubAccounts.unshift({ ID: null, Name: 'All' });
                $scope.Select();
            });
    };

    $scope.Select = function () {
        $scope.TotalDebit = 0;
        $scope.TotalCredit = 0;
        $scope.Total = 0;
        $scope.ObjectSearch.AccountID = null;
        $scope.colspanValue = 3;
        if ($scope.ObjectSearch.SubAcc != null && $scope.ObjectSearch.SubAcc.ID != null) {
            $scope.ObjectSearch.AccountID = $scope.ObjectSearch.SubAcc.ID;
            $scope.colspanValue = 2;
        }
        else if ($scope.ObjectSearch.MainAcc != null && $scope.ObjectSearch.MainAcc.ID != null)
        {
            $scope.ObjectSearch.AccountID = $scope.ObjectSearch.MainAcc.ID;
            if($scope.SubAccounts.length > 0)
                $scope.colspanValue = 3;
            else
                $scope.colspanValue = 2;

        }

        if ($scope.ObjectSearch.AccountID != null)
        {
            $scope.ObjectAccountReport = {};
            $scope.ObjectAccountReport.ID = $scope.ObjectSearch.AccountID;
            $http.post(vHostURL + 'Handler.ashx?action=SelectAccount&PageNumber=1&PageSize=1', $scope.ObjectAccountReport).then(
            function (data) {
                $scope.Account = data.data.Rows[0].Name;
            });
        }
        else
        $scope.Account = 'All Accounts';

        $http.post(vHostURL + 'Handler.ashx?action=SelectMovement', $scope.ObjectSearch).then(
            function (data) {
                $scope.List = [];
                if (data.data.Rows.length != 0) {
                    $scope.List = data.data.Rows;
                    $scope.List.forEach(function (item) {
                        if (item.Debit != 0)
                            $scope.TotalDebit += item.Debit;
                        if (item.Credit != 0)
                            $scope.TotalCredit += item.Credit;
                    });
    
                }
                if ($scope.ObjectSearch.AccountID != null) {
                    $http.post(vHostURL + 'Handler.ashx?action=SelectAccountDC',$scope.ObjectSearch).then(
                        function (data) {
                            $scope.Credit = data.data.Rows[0].Credit;
                            $scope.Debit = data.data.Rows[0].Debit;
                            $scope.TotalCredit = $scope.TotalCredit + $scope.Credit;
                            $scope.TotalDebit = $scope.TotalDebit + $scope.Debit;
                            $scope.Total = $scope.TotalCredit - $scope.TotalDebit;
                            if ($scope.Total < 0) {
                                $scope.Total = Math.abs($scope.Total);
                                $scope.TotalTitle = "Total Depit";

                            }
                            else
                                $scope.TotalTitle = "Total Credit";
                        });

                }
            });
    };

    $scope.Print = function () {
        PrintElem('divPrint');
    };
});

app.controller("AirlineReportCtrl", function ($scope, $http) {

    $scope.TotalTax = 0;
    $scope.TotalFare = 0;
    $scope.TotalCost = 0;
    $scope.TotalSalesAmount = 0;
    $scope.TotalProfit = 0;

    $scope.ObjectSearch = {};
    $scope.ObjectSearch.IsDeleted = 0;
    $scope.ObjectSearch.DateFrom = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.ObjectSearch.DateTo = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.List = [];

    $scope.ObjectStaffList = {};
    $scope.ObjectStaffList.IsDeleted = false;
    $http.post(vHostURL + 'Handler.ashx?action=SelectStaff&PageNumber=1&PageSize=100', $scope.ObjectStaffList).then(function (data) {
        $scope.StaffList = data.data.Rows;
        $scope.StaffList.unshift({ ID: null, Name: 'All' });
        $scope.ObjectAirLines = {};
        $scope.ObjectAirLines.IsDeleted = false;
        $http.post(vHostURL + 'Handler.ashx?action=SelectAirline&PageNumber=1&PageSize=1000', $scope.ObjectAirLines).then(function (data) {
            $scope.AirlinesList = data.data.Rows;
            $scope.AirlinesList.unshift({ ID: null, Name: 'All' });
        });

    });



    $scope.Search = function () {
        $scope.TotalTax = 0;
        $scope.TotalFare = 0;
        $scope.TotalCost = 0;
        $scope.TotalSalesAmount = 0;
        $scope.TotalProfit = 0;
        if ($scope.ObjectSearch.Staff != undefined && $scope.ObjectSearch.Staff != null) {
            $scope.ObjectSearch.CreatedStaffID = $scope.ObjectSearch.Staff.ID;

        }
        if ($scope.ObjectSearch.Airline != undefined && $scope.ObjectSearch.Airline != null) {
            $scope.ObjectSearch.AirlineID = $scope.ObjectSearch.Airline.ID;

        }
        $http.post(vHostURL + 'Handler.ashx?action=SelectSalesForAirlineReport', $scope.ObjectSearch).then(
            function (data) {
                $scope.List = [];
                if (data.data.Rows.length != 0) {
                    $scope.List = data.data.Rows;
                    $scope.List.forEach(function (item) {
                        if (item.Tax != 0)
                            $scope.TotalTax += item.Tax;
                        if (item.Fare != 0)
                            $scope.TotalFare += item.Fare;
                        if (item.TotalCost != 0)
                            $scope.TotalCost += item.TotalCost;
                        if (item.Profit != 0)
                            $scope.TotalProfit += item.Profit;
                        if (item.SalesAmount != 0)
                            $scope.TotalSalesAmount += item.SalesAmount;
                    });
                }
            });
    };

    $scope.Search();

    $scope.Print = function () {
        PrintElem('divPrint');
    };
});

app.controller("TotalAirlineReportCtrl", function ($scope, $http) {

    $scope.TotalTax = 0;
    $scope.TotalFare = 0;
    $scope.TotalCost = 0;
    $scope.TotalSalesAmount = 0;
    $scope.TotalProfit = 0;
    $scope.TotalCommision = 0;

    $scope.ObjectSearch = {};
    $scope.ObjectSearch.IsDeleted = 0;
    $scope.ObjectSearch.DateFrom = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.ObjectSearch.DateTo = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.List = [];

    $scope.Search = function () {
        $scope.TotalTax = 0;
        $scope.TotalFare = 0;
        $scope.TotalCost = 0;
        $scope.TotalSalesAmount = 0;
        $scope.TotalProfit = 0;
        $http.post(vHostURL + 'Handler.ashx?action=SelectSalesForTotalAirlineReport', $scope.ObjectSearch).then(
            function (data) {
                $scope.List = [];
                if (data.data.Rows.length != 0) {
                    $scope.List = data.data.Rows;
                    $scope.List.forEach(function (item) {
                        if (item.AirlineTax != 0)
                            $scope.TotalTax += item.AirlineTax;
                        if (item.AirlineFare != 0)
                            $scope.TotalFare += item.AirlineFare;
                        if (item.AirlineCost != 0)
                            $scope.TotalCost += item.AirlineCost;
                        if (item.AirlineProfit != 0)
                            $scope.TotalProfit += item.AirlineProfit;
                        if (item.SalesAmount != 0)
                            $scope.TotalSalesAmount += item.AirlineSalesAmount;
                        if (item.AirlineCommision != 0)
                            $scope.TotalCommision += item.AirlineCommision;
                    });
                }
            });
    };
    $scope.Print = function () {
        PrintElem('divPrint');
    };
    $scope.Search();
});

app.controller("ExpensesReportCtrl", function ($scope, $http) {

    $scope.TotalDebit = 0;
    $scope.TotalCredit = 0;
    $scope.TotalProfit = 0;

    $scope.ObjectSearch = {};
    $scope.ObjectSearch.IsDeleted = 0;
    $scope.ObjectSearch.DateFrom = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.ObjectSearch.DateTo = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.List = [];

    $scope.Search = function () {
        $scope.TotalDebit = 0;
        $scope.TotalCredit = 0;
        $scope.TotalProfit = 0;

        $http.post(vHostURL + 'Handler.ashx?action=SelectSalesForExpesesReport', $scope.ObjectSearch).then(
            function (data) {
                $scope.List = [];
                if (data.data.Rows.length != 0) {
                    $scope.List = data.data.Rows;
                    $scope.List.forEach(function (item) {
                        if (item.Debit != 0)
                            $scope.TotalDebit += item.Debit;
                        if (item.Credit != 0)
                            $scope.TotalCredit += item.Credit;
                      
                    });
                    $scope.TotalProfit = $scope.TotalCredit - $scope.TotalDebit;
                }
            });
    };
    $scope.Print = function () {
        PrintElem('divPrint');
    };
    $scope.Search();
});

app.controller("IncomeReportCtrl", function ($scope, $http) {

    $scope.TotalDebit = 0;
    $scope.TotalCredit = 0;
    $scope.TotalProfit = 0;

    $scope.ObjectSearch = {};
    $scope.ObjectSearch.IsDeleted = 0;
    $scope.ObjectSearch.DateFrom = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.ObjectSearch.DateTo = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.List = [];

    $scope.Search = function () {
        $scope.TotalDebit = 0;
        $scope.TotalCredit = 0;
        $scope.TotalProfit = 0;

        $http.post(vHostURL + 'Handler.ashx?action=SelectSalesForIncomeReport', $scope.ObjectSearch).then(
            function (data) {
                $scope.List = [];
                if (data.data.Rows.length != 0) {
                    $scope.List = data.data.Rows;
                    $scope.List.forEach(function (item) {
                        if (item.Debit != 0)
                            $scope.TotalDebit += item.Debit;
                        if (item.Credit != 0)
                            $scope.TotalCredit += item.Credit;

                    });
                    $scope.TotalProfit = $scope.TotalCredit - $scope.TotalDebit;
                }
            });
    };
    $scope.Print = function () {
        PrintElem('divPrint');
    };
    $scope.Search();
});

app.controller("ProfitReportCtrl", function ($scope, $http, $filter) {

    $scope.ObjectSearch = {};
    $scope.ObjectSearch.IsDeleted = 0;
    $scope.ObjectSearch.DateFrom = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.ObjectSearch.DateTo = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.List = [];

    $scope.ExpensesDebit = 0;
    $scope.ExpensesCredit = 0;
    $scope.ExpensesProfit = 0;
    $scope.IncomeDebit = 0;
    $scope.IncomeCredit = 0;
    $scope.IncomeProfit = 0;
    $scope.NetProfit = 0;

    $scope.Search = function () {

        $http.post(vHostURL + 'Handler.ashx?action=SelectSalesForProfitReport', $scope.ObjectSearch).then(
            function (data) {
                $scope.Reset();
                if (data.data.Rows.length != 0) {
                    $scope.List = data.data.Rows;
                    $scope.IncomeList = $filter('filter')($scope.List, { Status: 1 });
                    $scope.ExpensesList = $filter('filter')($scope.List, { Status: 0 });
                    if ($scope.IncomeList.length > 0)
                    {
                        $scope.IncomeList.forEach(function (item) {
                            if (item.Debit != 0)
                                $scope.IncomeDebit += item.Debit;
                            if (item.Credit != 0)
                                $scope.IncomeCredit += item.Credit;

                        });
                        $scope.IncomeProfit = $scope.IncomeCredit - $scope.IncomeDebit;
                        if ($scope.IncomeProfit < 0)
                            $scope.IncomeProfit = Math.abs($scope.IncomeProfit);
                    }
                    if ($scope.ExpensesList.length > 0) {
                        $scope.ExpensesList.forEach(function (item) {
                            if (item.Debit != 0)
                                $scope.ExpensesDebit += item.Debit;
                            if (item.Credit != 0)
                                $scope.ExpensesCredit += item.Credit;

                        });
                        $scope.ExpensesProfit = $scope.ExpensesCredit - $scope.ExpensesDebit;
                        if ($scope.ExpensesProfit < 0)
                            $scope.ExpensesProfit = Math.abs($scope.ExpensesProfit);
                    }
                    $scope.NetProfit = $scope.IncomeProfit - $scope.ExpensesProfit;
                    if ($scope.NetProfit > 0)
                        $scope.TotalTitle = 'Profit';
                    else
                        $scope.TotalTitle = 'Loss';
                }
            });
    };
    $scope.Print = function () {
        PrintElem('divPrint');
    };
    $scope.Search();
    $scope.Reset = function () {
        $scope.ExpensesDebit = 0;
        $scope.ExpensesCredit = 0;
        $scope.ExpensesProfit = 0;
        $scope.IncomeDebit = 0;
        $scope.IncomeCredit = 0;
        $scope.IncomeProfit = 0;
        $scope.NetProfit = 0;
        $scope.List = [];
        $scope.IncomeList = [];
        $scope.ExpensesList = [];
    };
});

app.controller("DailySalesReportCtrl", function ($scope, $http, $filter) {


    $scope.ObjectSearch = {};
    $scope.ObjectSearch.IsDeleted = 0;
    $scope.ObjectSearch.DateFrom = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.ObjectSearch.DateTo = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.List = [];

    $scope.ObjectStaffList = {};
    $scope.ObjectStaffList.IsDeleted = false;
    $http.post(vHostURL + 'Handler.ashx?action=SelectStaff&PageNumber=1&PageSize=' + vTotalSizeGlobal, $scope.ObjectStaffList).then(function (data) {
        $scope.StaffList = data.data.Rows;
        $scope.StaffList.unshift({ ID: null, Name: 'All' });
        $scope.ObjectAirLines = {};
        $scope.ObjectAirLines.IsDeleted = false;
        $http.post(vHostURL + 'Handler.ashx?action=SelectAirline&PageNumber=1&PageSize=' + vTotalSizeGlobal, $scope.ObjectAirLines).then(function (data) {
            $scope.AirlinesList = data.data.Rows;
            $scope.AirlinesList.unshift({ ID: null, Name: 'All' });
            $scope.ObjectSalesType = {};
            $scope.ObjectSalesType.IsDeleted = false;
            $scope.ObjectSalesType.LookupTypeID = 2;
            //this parmter to exclude refunded types
            $scope.ObjectSalesType.Note = 'Note';
            $http.post(vHostURL + 'Handler.ashx?action=SelectLookup&PageNumber=1&PageSize=' + vTotalSizeGlobal, $scope.ObjectSalesType).then(function (data) {
                $scope.SalesTypeList = data.data.Rows;
                $scope.SalesTypeList.unshift({ ID: null, Title: 'All' });
            });
        });

    });

    $scope.Search = function () {
        if ($scope.ObjectSearch.Staff != undefined && $scope.ObjectSearch.Staff != null) {
            $scope.ObjectSearch.CreatedStaffID = $scope.ObjectSearch.Staff.ID;

        }

        if ($scope.ObjectSearch.Airline != undefined && $scope.ObjectSearch.Airline != null) {
            $scope.ObjectSearch.AirlineID = $scope.ObjectSearch.Airline.ID;

        }

        if ($scope.ObjectSearch.SalesType != undefined && $scope.ObjectSearch.SalesType != null) {
            $scope.ObjectSearch.SalesTypeID = $scope.ObjectSearch.SalesType.ID;

        }

        $http.post(vHostURL + 'Handler.ashx?action=SelectSalesForDailySalesReport', $scope.ObjectSearch).then(
            function (data) {
                $scope.List = [];
                if (data.data.Rows.length != 0) {
                    $scope.List = data.data.Rows;
                    $scope.List.forEach(function (item) {
                        if (item.PaxName.indexOf('/') > -1)
                        {
                            var paxName = item.PaxName;
                            var arry = paxName.split('/');
                            item.PaxName = arry[0] + ' ' + arry[1];
                        }
                    });
                }
            });
    };

    $scope.Search();

    $scope.Print = function () {
        PrintElem('divPrint');
    };
});

app.controller("StaffTotalSalesReportCtrl", function ($scope, $http) {



    $scope.ObjectSearch = {};
    $scope.ObjectSearch.IsDeleted = 0;
    $scope.ObjectSearch.DateFrom = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.ObjectSearch.DateTo = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.List = [];

    $scope.ObjectStaffList = {};
    $scope.ObjectStaffList.IsDeleted = false;
    $http.post(vHostURL + 'Handler.ashx?action=SelectStaff&PageNumber=1&PageSize=100', $scope.ObjectStaffList).then(function (data) {
        $scope.StaffList = data.data.Rows;
        $scope.StaffList.unshift({ ID: null, Name: 'All' });
    });



    $scope.Search = function () {
        if ($scope.ObjectSearch.Staff != undefined && $scope.ObjectSearch.Staff != null) {
            $scope.ObjectSearch.CreatedStaffID = $scope.ObjectSearch.Staff.ID;

        }
        $http.post(vHostURL + 'Handler.ashx?action=SelectSalesForStaffTotalSalesReport', $scope.ObjectSearch).then(
            function (data) {
                $scope.List = [];
                if (data.data.Rows.length != 0) {
                    $scope.List = data.data.Rows;
                    $scope.List.forEach(function (item) {
                        var netRefund = Math.abs(item.RefundCost - item.RefundSales);
                        item.ProfitWithRefund = netRefund - Math.abs(item.Profit);
                    });
                }
            });
    };

    $scope.Search();

    $scope.Print = function () {
        PrintElem('divPrint');
    };
});

app.controller("TrailBalanceReportCtrl", function ($scope, $http) {



    $scope.ObjectSearch = {};
    $scope.ObjectSearch.IsDeleted = 0;
    $scope.ObjectSearch.DateFrom = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.ObjectSearch.DateTo = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.List = [];

    $scope.Search = function () {
        $http.post(vHostURL + 'Handler.ashx?action=SelectAccountsForTrialBalanceReport', $scope.ObjectSearch).then(
            function (data) {
                $scope.List = [];
                if (data.data.Rows.length != 0) {
                    $scope.List = data.data.Rows;
                    $scope.List.forEach(function (item) {
                        var gross = (item.BeginningCredit + item.Credit) - (item.BeginningDebit + item.Debit);
                        if (gross > 0) {
                            item.GrossCredit = gross;
                            item.GrossDebit = 0;
                        }
                        else {
                            item.GrossCredit = 0;
                            item.GrossDebit = Math.abs(gross);
                        }
                    });
                }
            });
    };

    $scope.Search();

    $scope.Print = function () {
        PrintElem('divPrint');
    };
});

app.controller("SalesPerBNRReportCtrl", function ($scope, $http) {

    $scope.TotalTax = 0;
    $scope.TotalFare = 0;
    $scope.TotalCost = 0;
    $scope.TotalSalesAmount = 0;
    $scope.TotalProfit = 0;
    $scope.TotalCommision = 0;

    $scope.ObjectSalesType = {};
    $scope.ObjectSalesType.IsDeleted = false;
    $scope.ObjectSalesType.LookupTypeID = 2;
    //this parmter to exclude refunded types
    $scope.ObjectSalesType.Note = 'Note';
    $http.post(vHostURL + 'Handler.ashx?action=SelectLookup&PageNumber=1&PageSize=' + vTotalSizeGlobal, $scope.ObjectSalesType).then(function (data) {
        $scope.SalesTypeList = data.data.Rows;
        $scope.SalesTypeList.unshift({ ID: null, Title: 'All' });
    });

    $scope.ObjectSearch = {};
    $scope.ObjectSearch.IsDeleted = 0;
    $scope.ObjectSearch.DateFrom = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.ObjectSearch.DateTo = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.List = [];

    $scope.Search = function () {
        $scope.TotalTax = 0;
        $scope.TotalFare = 0;
        $scope.TotalCost = 0;
        $scope.TotalSalesAmount = 0;
        $scope.TotalProfit = 0;
        if ($scope.ObjectSearch.SalesType != undefined && $scope.ObjectSearch.SalesType != null) {
            $scope.ObjectSearch.SalesTypeID = $scope.ObjectSearch.SalesType.ID;

        }
        $http.post(vHostURL + 'Handler.ashx?action=SelectSalesPerPNRReport', $scope.ObjectSearch).then(
            function (data) {
                $scope.List = [];
                if (data.data.Rows.length != 0) {
                    $scope.List = data.data.Rows;
                    $scope.List.forEach(function (item) {
                        if (item.PNRTax != 0)
                            $scope.TotalTax += item.PNRTax;
                        if (item.PNRFare != 0)
                            $scope.TotalFare += item.PNRFare;
                        if (item.PNRCost != 0)
                            $scope.TotalCost += item.PNRCost;
                        if (item.PNRProfit != 0)
                            $scope.TotalProfit += item.PNRProfit;
                        if (item.PNRSalesAmount != 0)
                            $scope.TotalSalesAmount += item.PNRSalesAmount;
                    });
                }
            });
    };
    $scope.Print = function () {
        PrintElem('divPrint');
    };
    $scope.Search();
});

app.controller("SalesReportCtrl", function ($scope, $http, $filter) {


    $scope.ObjectSearch = {};
    $scope.colspanValue = 6;
    $scope.ObjectSearch.IsDeleted = 0;
    $scope.ObjectSearch.DateFrom = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.ObjectSearch.DateTo = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.List = [];
    $scope.MainAccounts = [];
    //Initial
    //Get Main Accounts
    $scope.ObjectMainAccounts = {};
    $scope.ObjectMainAccounts.IsDeleted = false;
    $scope.ObjectMainAccounts.AccountTypeID = 47;
    $http.post(vHostURL + 'Handler.ashx?action=SelectAccount&PageNumber=1&PageSize=' + vTotalSizeGlobal,
        $scope.ObjectMainAccounts).then(function (data) {
            $scope.AllMainAcc = data.data.Rows;
            $scope.AllMainAcc.forEach(function (item) {
                if (item.Name.indexOf('Hotel And  Tour') > -1 || item.Name.indexOf('Receivable') > -1 || item.Name.indexOf('Airline Payable') > -1 || item.Name.indexOf('Billing') > -1) {
                    $scope.MainAccounts.push(item);
                }
            });
            $scope.MainAccounts.unshift({ ID: null, Name: 'All' });
            $scope.SubAccounts = [];
            $scope.Search();
        });

    $scope.SelectAccount = function (MainAccountID) {
        $scope.ObjectAccount = {};
        $scope.ObjectAccount.IsDeleted = false;
        $scope.ObjectAccount.ParentID = MainAccountID;
        $scope.ObjectSearch.SubAcc = null;
        $scope.ObjectSearch.SubAccountID = null;
        $scope.SubAccounts = [];
        $http.post(vHostURL + 'Handler.ashx?action=SelectAccount&PageNumber=1&PageSize=' + vTotalSizeGlobal, $scope.ObjectAccount).then(
            function (data) {
                $scope.SubAccounts = data.data.Rows;
                $scope.SubAccounts.unshift({ ID: null, Name: 'All' });
                $scope.Search();
            });
    };

    $scope.ObjectStaffList = {};
    $scope.ObjectStaffList.IsDeleted = false;
    $http.post(vHostURL + 'Handler.ashx?action=SelectStaff&PageNumber=1&PageSize=' + vTotalSizeGlobal, $scope.ObjectStaffList).then(function (data) {
        $scope.StaffList = data.data.Rows;
        $scope.StaffList.unshift({ ID: null, Name: 'All' });
        $scope.ObjectAirLines = {};
        $scope.ObjectAirLines.IsDeleted = false;
        $http.post(vHostURL + 'Handler.ashx?action=SelectAirline&PageNumber=1&PageSize=' + vTotalSizeGlobal, $scope.ObjectAirLines).then(function (data) {
            $scope.AirlinesList = data.data.Rows;
            $scope.AirlinesList.unshift({ ID: null, Name: 'All' });
            $scope.ObjectSalesType = {};
            $scope.ObjectSalesType.IsDeleted = false;
            $scope.ObjectSalesType.LookupTypeID = 2;
            //this parmter to exclude refunded types
            $scope.ObjectSalesType.Note = 'Note';
            $http.post(vHostURL + 'Handler.ashx?action=SelectLookup&PageNumber=1&PageSize=' + vTotalSizeGlobal, $scope.ObjectSalesType).then(function (data) {
                $scope.SalesTypeList = data.data.Rows;
                $scope.SalesTypeList.unshift({ ID: null, Title: 'All' });
            });
        });

    });

    $scope.Search = function () {
        
        if ($scope.ObjectSearch.Staff != undefined && $scope.ObjectSearch.Staff != null) {
            $scope.ObjectSearch.CreatedStaffID = $scope.ObjectSearch.Staff.ID;

        }

        if ($scope.ObjectSearch.Airline != undefined && $scope.ObjectSearch.Airline != null) {
            $scope.ObjectSearch.AirlineID = $scope.ObjectSearch.Airline.ID;

        }

        if ($scope.ObjectSearch.SalesType != undefined && $scope.ObjectSearch.SalesType != null) {
            $scope.ObjectSearch.SalesTypeID = $scope.ObjectSearch.SalesType.ID;

        }

        if ($scope.ObjectSearch.MainAcc != undefined && $scope.ObjectSearch.MainAcc != null) {
            $scope.ObjectSearch.AccountID = $scope.ObjectSearch.MainAcc.ID;

        }

        if ($scope.ObjectSearch.SubAcc != undefined && $scope.ObjectSearch.SubAcc != null) {
            $scope.ObjectSearch.SubAccountID = $scope.ObjectSearch.SubAcc.ID;
            if ($scope.ObjectSearch.SubAcc.ID != null)
                $scope.colspanValue = 5;
            else
                $scope.colspanValue = 6;
        }

        $http.post(vHostURL + 'Handler.ashx?action=SelectSalesForSalesReport', $scope.ObjectSearch).then(
            function (data) {
                $scope.List = [];
                if (data.data.Rows.length != 0) {
                    $scope.List = data.data.Rows;
                    $scope.List.forEach(function (item) {
                        if (item.PaxName.indexOf('/') > -1) {
                            var paxName = item.PaxName;
                            var arry = paxName.split('/');
                            item.PaxName = arry[0] + ' ' + arry[1];
                        }
                    });
                }
            });
    };

    $scope.Search();

    $scope.Print = function () {
        PrintElem('divPrint');
    };
});