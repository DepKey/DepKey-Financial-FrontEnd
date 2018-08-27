app.controller("NewSaleCtrl", function ($scope, $http, $route, $rootScope, $filter, $location, CommonFunctions) {

    $scope.FareTitle = 'Fare';

    $scope.NotForBSP = false;
    $scope.selectedPayementMethod = false;
    $scope.hideForm = false;
    $scope.NotMiscellaneous = true;
    $scope.RecievableAccSelected = true;
    $scope.DisableCredit = true;

    $scope.Details = false;
    $scope.Message = false;
    $scope.Updated = false;
    $scope.New = false;
    $scope.ObjectSalesPrint = {};
    $scope.CurrentPage = 1;
    $scope.PageSize = vPageSizeSales;
    $scope.RecievableMainAccountList = [];
    $scope.ObjectSales = {};

    $scope.Object = {};
    $scope.SalesTypeListTransfer = [];
    $scope.Object.Fare = 0;
    $scope.Object.Tax = 0;
    $scope.Object.SalesAmount = 0;

    $scope.Object.profit = $scope.Object.SalesAmount - $scope.Object.TotalCost;
    $scope.Object.TotalCost = $scope.Object.Fare + $scope.Object.Tax;

    $scope.Object.JournalDate = new Date();

    $scope.PageTitle = 'Make a new Sale';

    $scope.BranchID = JSON.parse(localStorage.getItem('LoggedIn')).BranchID;

    //Intial
    $scope.ObjectStaffList = {};
    $scope.ObjectStaffList.IsDeleted = false;
    $http.post(vHostURL + 'Handler.ashx?action=SelectStaff&PageNumber=1&PageSize=' + vTotalSizeGlobal, $scope.ObjectStaffList).then(function (data) {
        $scope.StaffList = data.data.Rows;

        $scope.ObjectSalesType = {};
        $scope.ObjectSalesType.IsDeleted = false;
        $scope.ObjectSalesType.LookupTypeID = 2;
        //this parmter to exclude refunded types
        $scope.ObjectSalesType.Note = 'Note';
        $http.post(vHostURL + 'Handler.ashx?action=SelectLookup&PageNumber=1&PageSize=' + vTotalSizeGlobal, $scope.ObjectSalesType).then(function (data) {
            $scope.SalesTypeList = data.data.Rows;

            $scope.ObjectPaymentMethods = {};
            $scope.ObjectPaymentMethods.IsDeleted = false;
            $scope.ObjectPaymentMethods.LookupTypeID = 3;
            $http.post(vHostURL + 'Handler.ashx?action=SelectLookup&PageNumber=1&PageSize=' + vTotalSizeGlobal, $scope.ObjectPaymentMethods).then(function (data) {
                $scope.PaymentMethodsList = data.data.Rows;

                $scope.ObjectAirLines = {};
                $scope.ObjectAirLines.IsDeleted = false;
                $http.post(vHostURL + 'Handler.ashx?action=SelectAirline&PageNumber=1&PageSize=' + vTotalSizeGlobal, $scope.ObjectAirLines).then(function (data) {
                    $scope.AirlinesList = data.data.Rows;
                    if (localStorage.getItem('SaleID') != null) {
                        $scope.PageTitle = 'Sale Details';
                        $scope.ObjectSales.ID = localStorage.getItem('SaleID');

                        $http.post(vHostURL + 'Handler.ashx?action=SelectSales&PageNumber=1&PageSize=1&BranchID=' + $scope.BranchID, $scope.ObjectSales).then(function (data) {
                            if (data.data.Rows[0].ParentID != null) {
                                $scope.ObjectSales = {}
                                $scope.ObjectSales.ID = data.data.Rows[0].ParentID
                                $http.post(vHostURL + 'Handler.ashx?action=SelectSales&PageNumber=1&PageSize=1&BranchID=' + $scope.BranchID, $scope.ObjectSales).then(function (data) {
                                    $scope.totalAmountBalance = false;
                                    $scope.Object.Fare = data.data.Rows[0].Fare;
                                    $scope.Object.Tax = data.data.Rows[0].Tax;
                                    $scope.Object.TotalCost = data.data.Rows[0].TotalCost;
                                    $scope.Object.SalesAmount = data.data.Rows[0].SalesAmount;
                                    $scope.Object.profit = data.data.Rows[0].profit;
                                    $scope.Object.Cash = data.data.Rows[0].Cash;
                                    $scope.Object.Credit = data.data.Rows[0].Credit;
                                    $scope.Object.Card = data.data.Rows[0].Card;
                                    $scope.Object.Complementary = data.data.Rows[0].Complementary;
                                    $scope.Object.Visa = data.data.Rows[0].Visa;
                                    $scope.Object.Advance = data.data.Rows[0].Advance;
                                    $scope.Object.Commision = data.data.Rows[0].Commision;
                                });
                            }
                            $scope.Object = data.data.Rows[0];
                            if ($scope.Object.Commision != null && $scope.Object.Commision > 0) 
                                $scope.CommisionAmount = 'Commision ' + (($scope.Object.Fare * $scope.Object.Commision) / 100) + ' kwd';
                            if ($rootScope.UserPermissions.indexOf('75') > -1 && $scope.Object.HistoryID == null && $scope.Object.SalesStatusID == 5) {
                                $scope.Details = false;
                                $scope.Updated = true;
                                $scope.New = false;
                            }
                            else {
                                $scope.Details = true;
                                $scope.Updated = false;
                                $scope.New = false;
                            }

                            var vDate = $scope.Object.CreationDate.split('/')
                            $scope.Object.JournalDate = new Date(vDate[1] + '/' + vDate[0] + '/' + vDate[2]);

                            $scope.Object.MainAccountName = $scope.Object.AccountName;
                            $scope.loadSubAccounts($scope.Object.AccountID);
                            var index = $scope.StaffList.findIndex(x => x.ID == $scope.Object.CreatedStaffID);
                            $scope.Object.CreatedStaff = $scope.StaffList[index];

                            var typeindex = $scope.SalesTypeList.findIndex(x => x.ID == $scope.Object.SalesTypeID);
                            $scope.Object.SalesType = $scope.SalesTypeList[typeindex];
                            $scope.Object.SalesTypeID = $scope.Object.SalesType.ID;
                            if (($scope.Object.SalesTypeID == 25 || $scope.Object.SalesTypeID == 27 || $scope.Object.SalesTypeID == 49) && $scope.Object.RefPaid == null) {
                                $scope.Object.TicketNumber = parseInt($scope.Object.TicketNumber);
                            }

                            $scope.loadVendor($scope.Object.SalesType.ID);

                            index = $scope.AirlinesList.findIndex(x => x.ID == $scope.Object.AirlineID);
                            $scope.Object.Airline = $scope.AirlinesList[index];

                            index = $scope.PaymentMethodsList.findIndex(x => x.ID == $scope.Object.PaymentMethodID);
                            $scope.Object.PaymentMethod = $scope.PaymentMethodsList[index];

                            $scope.loadRealtedItems($scope.Object.PaymentMethod.ID, true);
                            $scope.loadMainReciavableAccounts();

                            if ($scope.Object.SalesStatusID == 4) {
                                $scope.ObjectSalesType = {};
                                $scope.ObjectSalesType.IsDeleted = false;
                                $scope.ObjectSalesType.LookupTypeID = 2;
                                $scope.ObjectSalesType.Note = 'Note';
                                $http.post(vHostURL + 'Handler.ashx?action=SelectLookup&PageNumber=1&PageSize=' + vTotalSizeGlobal, $scope.ObjectSalesType).then(function (data) {
                                    data.data.Rows.forEach(function (item) {
                                        if (item.ID == 25 || item.ID == 27 || item.ID == 49)
                                            $scope.SalesTypeListTransfer.push(item);
                                    });
                                });
                            }
                            if (localStorage.getItem('SaleType') == 'History') {
                                $scope.UpdatedObject = null;
                                $scope.UpdatedObjectSearch = {};
                                $scope.UpdatedObjectSearch.ID = $scope.Object.HistoryID;
                                $http.post(vHostURL + 'Handler.ashx?action=SelectSalesHistory&PageNumber=1&PageSize=1&BranchID=' + $scope.BranchID, $scope.UpdatedObjectSearch).then(function (data) {
                                    $scope.UpdatedObject = data.data.Rows[0];
                                    $scope.UpdatedObject.CreationDate = $scope.UpdatedObject.CreationDate.toString('yyyy-MM-dd');
                                    if ($scope.UpdatedObject != null && ($scope.UpdatedObject.PaymentMethodID == 18 || $scope.UpdatedObject.PaymentMethodID == 20 || $scope.UpdatedObject.PaymentMethodID == 24)) {
                                        $scope.loadBankAccountForVisaAndCard(true);
                                    }
                                });
                            }
                        });
                    }
                });
            });
        });
    });

    $scope.setTotalAdvance = function () {

        $scope.ObjectPaymentMethodAcc = {};
        $scope.ObjectPaymentMethodAcc.PaymentMethodID = 21;

        $http.post(vHostURL + 'Handler.ashx?action=SelectSalesMappingAccountPaymentMethod', $scope.ObjectPaymentMethodAcc).then(function (data) {
            $scope.ObjectPaymentMethodAcc = {};
            $scope.ObjectPaymentMethodAcc = data.data.Rows[0];
            $scope.AdvanceAccountID = $scope.ObjectPaymentMethodAcc.AccountID;

            $scope.ObjectTotalAdvanceccount = {
            };
            $scope.ObjectTotalAdvanceccount.IsDeleted = false;
            $scope.ObjectTotalAdvanceccount.ID = $scope.AdvanceAccountID;

            $http.post(vHostURL + 'Handler.ashx?action=SelectAccount&PageNumber=1&PageSize=100', $scope.ObjectTotalAdvanceccount).then(function (data) {
                $scope.ObjectTotalAdvanceccount = {};
                $scope.ObjectTotalAdvanceccount = data.data.Rows[0];

                $scope.TotalAdvanceAccountDepit = $scope.ObjectTotalAdvanceccount.Credit - $scope.ObjectTotalAdvanceccount.Debit;
                if ($scope.TotalAdvanceAccountDepit < 0)
                    $scope.TotalAdvanceAccountDepit = 0;
            });
        });
    };

    $scope.loadVendor = function (SalesTypeID) {
        $scope.Object.SalesTypeID = $scope.Object.SalesType.ID;
        if (SalesTypeID != 25) {
            $scope.NotForBSP = true;
        }
        else {
            $scope.NotForBSP = false;
        }

        var targetItem = $scope.SalesTypeList.filter(function (item) {
            return item.ID === SalesTypeID;
        })[0];
        var MainAccount = targetItem.Note.split("-");
        $scope.Object.MainAccountName = MainAccount[1];
        $scope.Object.AccountID = parseInt(MainAccount[0]);
        $scope.loadSubAccounts(MainAccount[0]);
    };

    $scope.loadSubAccounts = function (MainAccountID) {
        $scope.ObjectSubAccounts = {};
        $scope.ObjectSubAccounts.IsDeleted = false;
        $scope.ObjectSubAccounts.ParentID = parseInt(MainAccountID);
        $http.post(vHostURL + 'Handler.ashx?action=SelectAccount&PageNumber=1&PageSize=100', $scope.ObjectSubAccounts).then(function (data) {
            $scope.SubAccountsList = data.data.Rows;
            var targetSubAcc = $scope.SubAccountsList.filter(function (item) {
                return item.ID === $scope.Object.SubAccountID;
            })[0];
            $scope.Object.SubAccount = targetSubAcc;
        });
    };

    $scope.loadRealtedItems = function (paymentMethodID, intial) {
        $scope.Object.RecievableMainAccount = {};
        $scope.Object.CreditAccount = {};
        $scope.recievableSubaccountsDisabled = true;
        $scope.RecievableAccSelected = true;
        $scope.selectedPayementMethod = true;
        $scope.Object.PaymentMethodID = paymentMethodID;
        if (paymentMethodID == 24 || paymentMethodID == 21) {
            $scope.setTotalAdvance();
        }
        if (paymentMethodID == 24) {
            $scope.NotMiscellaneous = false;
        }
        else {
            $scope.NotMiscellaneous = true;
            $scope.DisableCredit = true;
        }
        if (!intial)
            $scope.fillAmount();
        $scope.checkAdvanceBalanceEqualityForSalesAmountAndPaymentMerthods();

        if (paymentMethodID == 19 || paymentMethodID == 24) {
            $scope.loadMainReciavableAccounts();
        }
        if (paymentMethodID == 18 || paymentMethodID == 20 || paymentMethodID == 24) {
            $scope.loadBankAccountForVisaAndCard();
        }
    };

    $scope.loadMainReciavableAccounts = function () {
        $scope.recievableSubaccountsDisabled = true;
        $scope.ObjectRecievableMainAccounts = {};
        $scope.ObjectRecievableMainAccounts.IsDeleted = false;
        $scope.ObjectRecievableMainAccounts.AccountNumber = '1131';

        $http.post(vHostURL + 'Handler.ashx?action=SelectAccount&PageNumber=1&PageSize=100', $scope.ObjectRecievableMainAccounts).then(function (data) {

            $scope.RecievableMainAccountList = data.data.Rows;
            if ($scope.Object.RecievableMainAccountID != null) {
                var recievableindex = $scope.RecievableMainAccountList.findIndex(x => x.ID == $scope.Object.RecievableMainAccountID);
                $scope.Object.RecievableMainAccount = $scope.RecievableMainAccountList[recievableindex];
                $scope.loadRecievableSubAccounts($scope.Object.RecievableMainAccount.ID);
            }
        });
    };

    $scope.loadRecievableSubAccounts = function (recievableMainAccountID) {
        $scope.Object.RecievableMainAccountID = recievableMainAccountID;
        $scope.DisableCredit = false;
        $scope.recievableSubaccountsDisabled = false;
        if ($scope.Object.PaymentMethodID == 24) {
            $scope.RecievableAccSelected = false;
        }

        $scope.ObjectRecievableSubAccounts = {};
        $scope.ObjectRecievableSubAccounts.IsDeleted = false;
        $scope.ObjectRecievableSubAccounts.ParentID = recievableMainAccountID;
        $http.post(vHostURL + 'Handler.ashx?action=SelectAccount&PageNumber=1&PageSize=100', $scope.ObjectRecievableSubAccounts).then(function (data) {
            $scope.RecievableSubAccountList = data.data.Rows;
            if ($scope.Object.CreditAccountID != null) {
                var subindex = $scope.RecievableSubAccountList.findIndex(x => x.ID == $scope.Object.CreditAccountID);
                $scope.Object.CreditAccount = $scope.RecievableSubAccountList[subindex];
            }
        });
    };

    $scope.loadBankAccountForVisaAndCard = function (forUpdatedObject) {
        $scope.ObjectVisaAndCardAccount = {
        };
        $scope.ObjectVisaAndCardAccount.IsDeleted = false;
        $scope.ObjectVisaAndCardAccount.AccountNumber = '112102';

        $http.post(vHostURL + 'Handler.ashx?action=SelectAccount&PageNumber=1&PageSize=100', $scope.ObjectVisaAndCardAccount).then(function (data) {
            $scope.BankAccountsList = data.data.Rows;
            if (forUpdatedObject)
                $scope.UpdatedObject.BankAccountID = $scope.BankAccountsList[0].ID;
            else
                $scope.Object.BankAccountID = $scope.BankAccountsList[0].ID;
        });
    };

    $scope.calculatePayment = function () {
        if ($scope.Object.Commision != null && $scope.Object.Commision != 0) {
            $scope.CommisionAmount = 'Commision ' + (($scope.Object.Fare * $scope.Object.Commision) / 100) + ' kwd';
            $scope.Object.TotalCost = $scope.Object.Fare - (($scope.Object.Fare * $scope.Object.Commision) / 100) + $scope.Object.Tax;
        }
        else
            $scope.Object.TotalCost = $scope.Object.Fare + $scope.Object.Tax;
        $scope.Object.Profit = $scope.Object.SalesAmount - $scope.Object.TotalCost;
        $scope.setProfitColor();
        $scope.fillAmount();
        $scope.checkAdvanceBalanceEqualityForSalesAmountAndPaymentMerthods();
    };

    $scope.setProfitColor = function () {

        if ($scope.Object.Profit > 0) {
            $scope.profitStyle = {
                'background-color': '#06a506', 'color': 'white'
            };
            //    angular.element('#Profit').css({ backgroundColor: '#06a506', textAlign: 'center', color: 'white' });
        } else if ($scope.Object.Profit < 0) {
            $scope.profitStyle = {
                'background-color': 'red', 'color': 'white'
            };
        } else if ($scope.Object.Profit == 0) {
            $scope.profitStyle = {
                'background-color': '#ffd400', 'color': 'black'
            };
        }
    };

    $scope.fillAmount = function () {
        // reset amount placeholders
        $scope.resetPlaceholders();

        switch ($scope.Object.PaymentMethodID) {
            case 17:
                $scope.Object.Cash = $scope.Object.SalesAmount;
                break;
            case 18:
                $scope.Object.Card = $scope.Object.SalesAmount;
                break;
            case 19:
                $scope.Object.Credit = $scope.Object.SalesAmount;
                break;
            case 20:
                $scope.Object.Visa = $scope.Object.SalesAmount;
                break;
            case 23:
                $scope.Object.Complementary = $scope.Object.SalesAmount;
                break;
            case 21:
                $scope.Object.Advance = $scope.Object.SalesAmount;
                break;
            case 24:
                $scope.resetPlaceholders();
        }
    };

    $scope.resetPlaceholders = function () {
        $scope.Object.Cash = 0;
        $scope.Object.Credit = 0;
        $scope.Object.Card = 0;
        $scope.Object.Visa = 0;
        $scope.Object.Complementary = 0;
        $scope.Object.Advance = 0;
    };

    $scope.resetPlaceholdersForInitial = function () {
        if (localStorage.getItem('SaleID') == null) {
            $scope.Object.Cash = 0;
            $scope.Object.Credit = 0;
            $scope.Object.Card = 0;
            $scope.Object.Visa = 0;
            $scope.Object.Complementary = 0;
            $scope.Object.Advance = 0;
        }
    };

    $scope.checkAdvanceBalanceEqualityForSalesAmountAndPaymentMerthods = function () {
        var paymentMethodsTotal = $scope.Object.Cash + $scope.Object.Credit + $scope.Object.Card + $scope.Object.Visa +
                                    $scope.Object.Complementary + $scope.Object.Advance;



        if ($scope.Object.PaymentMethodID == 24 && $scope.Object.Advance >= 0) {

            if ($scope.Object.PaymentMethodID == 24 && $scope.Object.Advance > $scope.TotalAdvanceAccountDepit) {

                //    swal("Error!", "Not enough Balance From Advance Account!", "error");
                $scope.checkAdvanceBalance = true;
                $scope.disableSave = true;
            }
        }

        if ($scope.Object.PaymentMethodID == 24 && $scope.Object.SalesAmount != paymentMethodsTotal) {

            //   swal("Error!", "Sales amount must equal the sales amount!", "error");
            $scope.totalAmountBalance = true;
            $scope.disableSave = true;

        }
        else {

            if ($scope.Object.PaymentMethodID == 24 && $scope.Object.Advance > $scope.TotalAdvanceAccountDepit) {
                //  swal("Error!", "Not enough Balance From Advance Account!", "error");
                $scope.checkAdvanceBalance = true;
                $scope.disableSave = true;
            }

            else {

                $scope.checkAdvanceBalance = false;
                $scope.disableSave = false;
            }
        }

        if ($scope.Object.PaymentMethodID == 21 && $scope.Object.SalesAmount > $scope.TotalAdvanceAccountDepit) {
            //   swal("Error!", "Not enough Balance From Advance Account!", "error");
            $scope.checkAdvanceBalance = true;
            $scope.disableSave = true;
        }

        else if ($scope.Object.PaymentMethodID == 24 && $scope.Object.Advance > $scope.TotalAdvanceAccountDepit) {
            //  swal("Error!", "Not enough Balance From Advance Account!", "error");
            $scope.checkAdvanceBalance = true;
            $scope.disableSave = true;
        }
        else {
            $scope.checkAdvanceBalance = false;
            $scope.disableSave = false;
        }

        if ($scope.Object.SalesAmount == paymentMethodsTotal && !$scope.checkAdvanceBalance) {
            $scope.disableSave = false;
            $scope.totalAmountBalance = false;
        } else {
            //  swal("Error!", "Sales amount must equal the sales amount!", "error");
            $scope.totalAmountBalance = true;
            $scope.disableSave = true;
        }
    };

    $scope.Submit = function () {
        if (localStorage.getItem('SaleID') != null) {
            $scope.FormMain.$setSubmitted();
            if ($scope.FormMain.$valid) {
                if (($scope.SalesTypeID == 24 || $scope.SalesTypeID == 27)
                    && ($scope.Object.TicketNumber.length < 10 || $scope.Object.TicketNumber.length > 10 || angular.isNumber($scope.Object.TicketNumber))) {
                    swal("Alert!", "Ticket Number must be 10 digits numbers!", "error");
                    return;
                }
                $scope.Object.AccountantStaffID = JSON.parse(localStorage.getItem('LoggedIn')).ID;
                $scope.Object.BranchID = JSON.parse(localStorage.getItem('LoggedIn')).BranchID;
                $scope.Object.CreatedStaffID = $scope.Object.CreatedStaff.ID;
                if ($scope.Object.Airline != undefined && $scope.Object.Airline != null) {
                    $scope.Object.AirlineID = $scope.Object.Airline.ID;
                }
                if ($scope.Object.SubAccount != undefined && $scope.Object.SubAccount != null) {
                    $scope.Object.SubAccountID = $scope.Object.SubAccount.ID;
                }
                if ($scope.Object.CreditAccount != undefined && $scope.Object.CreditAccount != null) {
                    $scope.Object.CreditAccountID = $scope.Object.CreditAccount.ID;
                }
                if ($scope.Object.RecievableMainAccount != undefined && $scope.Object.RecievableMainAccount != null) {
                    $scope.Object.RecievableMainAccountID = $scope.Object.RecievableMainAccount.ID;
                }
                $scope.Object.SalesStatusID = 95;
                $scope.Object.CreationDate = $scope.Object.JournalDate.toString('yyyy-MM-dd');
                $scope.Object.HistoryCreatedStaffID = JSON.parse(localStorage.getItem('LoggedIn')).ID;
                $http.post(vHostURL + 'Handler.ashx?action=InsertSalesHistory', $scope.Object).then(function (data) {
                    CommonFunctions.InsertLog(9, $scope.Object.ID, 2, 'Pending Edit');
                    swal("Updated!", "Waiting approval from administrator!", "success");
                    localStorage.removeItem('SaleID');
                    localStorage.removeItem('CurrentSalesStatus');
                    localStorage.setItem('CurrentSalesStatus', 5);
                    $location.path("/SalesListing");
                });
            }
        }
        else {
            $scope.FormMain.$setSubmitted();
            if ($scope.FormMain.$valid) {
                if (($scope.Object.SalesTypeID == 25 || $scope.Object.SalesTypeID == 49 || $scope.Object.SalesTypeID == 27)
                    && $scope.Object.RefPaid == null
                 && ($scope.Object.TicketNumber.length < 10 || $scope.Object.TicketNumber.length > 10 || angular.isNumber($scope.Object.TicketNumber))) {
                    swal("Alert!", "Ticket Number must be 10 digits numbers!", "error");
                    return;
                }
                $scope.Object.AccountantStaffID = JSON.parse(localStorage.getItem('LoggedIn')).ID;
                $scope.Object.BranchID = JSON.parse(localStorage.getItem('LoggedIn')).BranchID;
                $scope.Object.CreatedStaffID = $scope.Object.CreatedStaff.ID;
                if ($scope.Object.Airline != undefined && $scope.Object.Airline != null) {
                    $scope.Object.AirlineID = $scope.Object.Airline.ID;
                }
                if ($scope.Object.SubAccount != undefined && $scope.Object.SubAccount != null) {
                    $scope.Object.SubAccountID = $scope.Object.SubAccount.ID;
                }
                if ($scope.Object.CreditAccount != undefined && $scope.Object.CreditAccount != null) {
                    $scope.Object.CreditAccountID = $scope.Object.CreditAccount.ID;
                }
                if ($scope.Object.RecievableMainAccount != undefined && $scope.Object.RecievableMainAccount != null) {
                    $scope.Object.RecievableMainAccountID = $scope.Object.RecievableMainAccount.ID;
                }
                $http.post(vHostURL + 'Handler.ashx?action=InsertSales', $scope.Object).then(function (data) {
                    var existingTicket = data.data.TicketExist;
                    if (existingTicket == undefined || existingTicket == null) {
                        swal("Done!", "Sale Created Successfully!", "success");
                        $scope.InvoiceNumberPNR = parseInt(data.data.Rows[0].InvoiceNumberPNR);
                        CommonFunctions.InsertLog(0, data.data.Rows[0].Identity, 0, 'Insert Sales');
                        //$scope.hideForm = true;
                        localStorage.removeItem('CurrentSalesStatus');
                        localStorage.setItem('CurrentSalesStatus', 5);
                        $location.path("/SalesListing");
                    }
                    else {
                        swal("Ticket Number Issue", "This Ticket Already Exist!", "error");
                    }
                    localStorage.removeItem('SaleID');
                });
            }
        }
    };

    $scope.Reset = function () {
        $route.reload();
    };

    $scope.new = function () {
        $scope.hideForm = false;
        $route.reload();
    };

    $scope.newOnSameInvoice = function () {
        $scope.selectedPayementMethod = false;
        $scope.NotForBSP = true;
        $scope.hideForm = false;
        $scope.NotMiscellaneous = true;
        $scope.DisableCredit = true;
        $scope.Object = {
        };
        $scope.Object.InvoiceNumberPNR = $scope.InvoiceNumberPNR;
        $scope.Object.Fare = 0;
        $scope.Object.Tax = 0;
        $scope.Object.TotalCost = $scope.Object.Fare + $scope.Object.Tax;
        $scope.Object.SalesAmount = 0;
        $scope.Object.profit = $scope.Object.SalesAmount - $scope.Object.TotalCost;
        $scope.Object.JournalDate = new Date();
    };

    //Buttons
    $scope.Void = function (ID) {
        $scope.ObjectSelectSale = {};
        $scope.ObjectSelectSale.IsDeleted = false;
        $scope.ObjectSelectSale.ID = ID;
        $http.post(vHostURL + 'Handler.ashx?action=SelectSales&PageNumber=1&PageSize=100&BranchID=' + $scope.BranchID, $scope.ObjectSelectSale).then(function (data) {
            $scope.SlesObject = data.data.Rows[0];
            $('#VoidModel').modal("show");
        });
    };
    $scope.SaveVoid = function () {
        $scope.SlesObject.SalesAmount = $scope.NewObject.SalesAmount;
        $scope.SlesObject.SalesStatusID = 87; //Pending Void 
        $scope.SlesObject.HistoryCreatedStaffID = JSON.parse(localStorage.getItem('LoggedIn')).ID;
        $http.post(vHostURL + 'Handler.ashx?action=InsertSalesHistory', $scope.SlesObject).then(function (data) {
            CommonFunctions.InsertLog(9, $scope.SlesObject.ID, 0, 'Pending Void ');
            swal("Voided!", "Waiting approval from administrator", "success");
            $('#VoidModel').modal("hide");
            $scope.Select();
        });
    };
    $scope.Refund = function (ID) {
        $scope.ObjectSelectSale = {};
        $scope.ObjectSelectSale.IsDeleted = false;
        $scope.ObjectSelectSale.ID = ID;
        $http.post(vHostURL + 'Handler.ashx?action=SelectSales&PageNumber=1&PageSize=100&BranchID=' + $scope.BranchID, $scope.ObjectSelectSale).then(function (data) {
            $scope.SlesObject = data.data.Rows[0];
            $('#RefundModel').modal("show");
        });
    };
    $scope.SaveRefund = function () {
        $scope.SlesObject.CreatedStaffID = $scope.Object.CreatedStaff.ID;
        $scope.SlesObject.SalesStatusID = 7; // refunded
        $scope.SlesObject.RefAmountFromProvider = $scope.Object.RefSalesAmount;
        $scope.SlesObject.RefDescription = $scope.Object.RefDescription;
        $http.post(vHostURL + 'Handler.ashx?action=InsertSalesAfterRefund', $scope.SlesObject).then(function (data) {
            CommonFunctions.InsertLog(9, $scope.SlesObject.ID, 0, 'Refund');
            swal("Refunded!", "Please complete refunding process from Refund Sales!", "success");
            $('#RefundModel').modal("hide");
            $scope.Select();
        });
    };
    $scope.Delete = function (Object) {
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover it again!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then(function (willDelete) {
            if (willDelete) {
                Object.SalesStatusID = 94;
                Object.HistoryCreatedStaffID = JSON.parse(localStorage.getItem('LoggedIn')).ID;
                $http.post(vHostURL + 'Handler.ashx?action=InsertSalesHistory', Object).then(function (data) {
                    CommonFunctions.InsertLog(9, Object.ID, 2, 'Pending Delete');
                    swal("Done! Your select has been deleted", {
                        icon: "success",
                    });
                    $scope.Select();
                });
            } else {
                swal("Your select still exist");
            }
        });
    };
    $scope.PrintInvoice = function (obj) {
        $scope.PrintSale = obj;
        $scope.TotalPrintCash = 0;
        $scope.TotalPrintCard = 0;
        $scope.TotalPrintCredit = 0;
        $scope.TotalPrintVisa = 0;
        $scope.TotalPrintAdvance = 0;
        $scope.TotalPrintComplementary = 0;
        $scope.TotalSalesAmount = 0;

        $scope.ObjectSalesPrint.SalesStatusID = localStorage.getItem('CurrentSalesStatus');
        $scope.ObjectSalesPrint.InvoiceNumberPNR = obj.InvoiceNumberPNR;
        $http.post(vHostURL + 'Handler.ashx?action=SelectSales&PageNumber=' + $scope.CurrentPage + '&PageSize=' + vPageSizeSales + '&BranchID=' + $scope.BranchID, $scope.ObjectSalesPrint).then(function (data) {
            $scope.PrintList = [];
            if (data.data.Rows.length != 0) {
                $scope.PrintList = data.data.Rows;
                $scope.PrintList.forEach(function (item) {
                    if (item.Cash != 0)
                        $scope.TotalPrintCash += item.Cash;
                    if (item.Card != 0)
                        $scope.TotalPrintCard += item.Card;
                    if (item.Visa != 0)
                        $scope.TotalPrintVisa += item.Visa;
                    if (item.Credit != 0)
                        $scope.TotalPrintCredit += item.Credit;
                    if (item.Complementary != 0)
                        $scope.TotalPrintComplementary += item.Complementary;
                    if (item.Advance != 0)
                        $scope.TotalPrintAdvance += item.Advance;
                    if (item.SalesAmount != 0)
                        $scope.TotalSalesAmount += item.SalesAmount;
                });
                CommonFunctions.InsertLog(6, data.data.Rows[0].Identity, 5, 'Print Invoic');
            }
            setTimeout(function () { window.print(); }, 1000);
        });

        //$scope.PrintList = $filter('filter')($scope.List, { InvoiceNumberPNR: obj.InvoiceNumberPNR });

    };
    $scope.Approve = function (UpdatedObject) {
        swal({
            title: "Are you sure?",
            text: "Once approved, you will not be able to recover it again!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then(function (Approve) {
            if (Approve) {
                UpdatedObject.ApproveStatusID = 33;
                $http.post(vHostURL + 'Handler.ashx?action=UpdateSalesHistory', UpdatedObject).then(function (data) {
                    swal("Approved!", {
                        icon: "success",
                    });
                    var SalesStatus;
                    if (UpdatedObject.SalesStatusID == 95)
                        SalesStatus = 'Edit';
                    if (UpdatedObject.SalesStatusID == 87)
                        SalesStatus = 'Void';
                    CommonFunctions.InsertLog(7, UpdatedObject.ID, 0, 'Approve ' + SalesStatus);
                    $location.path("/SalesListing");
                });
            } else {
                swal("Your request canceled");
            }
        });
    };
    $scope.Reject = function (UpdatedObject) {
        swal({
            text: 'Please enter reject reason',
            content: "input",
            button: {
                text: "Reject",
                closeModal: false,
            }
        })
        .then(function (reason) {
            if (reason) {
                UpdatedObject.ApproveStatusID = 34;
                UpdatedObject.RejectionReason = reason;
                $http.post(vHostURL + 'Handler.ashx?action=UpdateSalesHistory', UpdatedObject).then(function (data) {
                    swal("Rejected!", {
                        icon: "success"
                    });
                    var SalesStatus;
                    if (UpdatedObject.SalesStatusID == 95)//Edit
                        SalesStatus = 'Edit';
                    if (UpdatedObject.SalesStatusID == 87)//Void
                        SalesStatus = 'Void';
                    CommonFunctions.InsertLog(8, UpdatedObject.ID, 0, 'Reject ' + SalesStatus);
                    $location.path("/SalesListing");
                });
            } else {
                swal("Your request canceled");
            }
        });
    };
    $scope.TransferObject = {};
    $scope.Transfer = function (Obj) {
        $scope.Message = false;
        if ($scope.TransferObject.SalesType.ID == 25 || $scope.TransferObject.SubAccount != null) {

            if ($scope.TransferObject.SubAccount != null && $scope.TransferObject.SubAccount.ID != null)
                $scope.Object.SubAccountID = $scope.TransferObject.SubAccount.ID;
            if ($scope.TransferObject.SalesType != null && $scope.TransferObject.SalesType.ID != null)
                $scope.Object.SalesTypeID = $scope.TransferObject.SalesType.ID;
            $scope.Object.AccountantStaffID = JSON.parse(localStorage.getItem('LoggedIn')).ID;
            $scope.Object.BankAccountID = 5;
            $http.post(vHostURL + 'Handler.ashx?action=TransferSales', $scope.Object).then(function (data) {
                CommonFunctions.InsertLog(4, $scope.Object.ID, 0, 'Transfer Sales');
                localStorage.setItem('CurrentSalesStatus', 5);
                $location.path("/SalesListing");
            });
        }
        else {
            if ($scope.TransferObject.SalesType == null) {
                $scope.Message = true;
                $scope.MessageValue = 'Please Select Sales Type';
            }
            else if ($scope.TransferObject.SubAccount == null && $scope.TransferObject.SalesType.ID != 25) {
                $scope.Message = true;
                $scope.MessageValue = 'Please Select Vendor';
            }
        }
    };
    $scope.loadVendorTransfer = function (salesTypeID) {
        $scope.TransferObject.SubAccount = null;
        if (salesTypeID != 25) {
            $scope.NotForBSP = true;
            $scope.ObjectSubAccounts = {};
            $scope.ObjectSubAccounts.IsDeleted = false;
            var targetItem = $scope.SalesTypeList.filter(function (item) {
                return item.ID === salesTypeID;
            })[0];
            var MainAccount = targetItem.Note.split("-");
            $scope.ObjectSubAccounts.ParentID = parseInt(MainAccount[0]);
            $http.post(vHostURL + 'Handler.ashx?action=SelectAccount&PageNumber=1&PageSize=100', $scope.ObjectSubAccounts).then(function (data) {
                $scope.SubAccountsList = [];
                $scope.SubAccountsList = data.data.Rows;
            });
        } else {
            $scope.NotForBSP = false;
        }
    }
});

app.controller("SalesCtrl", function ($scope, $http, $location, $filter, $route, CommonFunctions) {

    $scope.Object = {};
    $scope.ObjectSales = {};
    $scope.ObjectSalesPrint = {};

    $scope.List = [];
    $scope.SalesTypeList = [];

    $scope.Object.JournalDate = new Date().toLocaleDateString();
    $scope.ObjectSales.DateFrom = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.ObjectSales.DateTo = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.BranchID = JSON.parse(localStorage.getItem('LoggedIn')).BranchID;

    $scope.ShowInvoice = false;
    $scope.NotForBSP = false;
    $scope.CurrentPage = 1;
    $scope.PageSize = vPageSizeSales;

    if (localStorage.getItem('CurrentSalesStatus') == 4)
        $scope.Title = "Online Sales";
    else if (localStorage.getItem('CurrentSalesStatus') == 5)
        $scope.Title = "Sales Listing";
    else if (localStorage.getItem('CurrentSalesStatus') == 7)
        $scope.Title = "Refund Sales";
    else if (localStorage.getItem('CurrentSalesStatus') == 6)
        $scope.Title = "Void Sales";
    else if (localStorage.getItem('CurrentSalesStatus') == 0)
        $scope.Title = "Waiting Actions";
    else if (localStorage.getItem('CurrentSalesStatus') == 1)
        $scope.Title = "Rejected Requests";

    $scope.ObjectStaffList = {};
    $scope.ObjectStaffList.IsDeleted = false;
    $http.post(vHostURL + 'Handler.ashx?action=SelectStaff&PageNumber=1&PageSize=' + vTotalSizeGlobal, $scope.ObjectStaffList).then(function (data) {
        $scope.StaffList = data.data.Rows;

        $scope.ObjectSalesType = {};
        $scope.ObjectSalesType.IsDeleted = false;
        $scope.ObjectSalesType.LookupTypeID = 2;
        $scope.ObjectSalesType.Note = 'Note';
        $http.post(vHostURL + 'Handler.ashx?action=SelectLookup&PageNumber=1&PageSize=' + vTotalSizeGlobal, $scope.ObjectSalesType).then(function (data) {
            data.data.Rows.forEach(function (item) {
                if (item.ID == 25 || item.ID == 27 || item.ID == 49)
                    $scope.SalesTypeList.push(item);
            });
            $scope.Select();
        });
    });

    $scope.loadVendor = function (salesTypeID) {
        $scope.TransferObject.SubAccount = null;
        if (salesTypeID != 25) {
            $scope.NotForBSP = true;
            $scope.ObjectSubAccounts = {};
            $scope.ObjectSubAccounts.IsDeleted = false;
            var targetItem = $scope.SalesTypeList.filter(function (item) {
                return item.ID === salesTypeID;
            })[0];
            var MainAccount = targetItem.Note.split("-");
            $scope.ObjectSubAccounts.ParentID = parseInt(MainAccount[0]);
            $http.post(vHostURL + 'Handler.ashx?action=SelectAccount&PageNumber=1&PageSize=100', $scope.ObjectSubAccounts).then(function (data) {
                $scope.SubAccountsList = [];
                $scope.SubAccountsList = data.data.Rows;
            });
        } else {
            $scope.NotForBSP = false;
        }
    }

    $scope.Select = function (pageNumber) {
        if (pageNumber != null)
            $scope.CurrentPage = pageNumber;
        $scope.ObjectSales.IsDeleted = 0;

        if (localStorage.getItem('CurrentSalesStatus') == 0) {
            $scope.ObjectSales.ApproveStatusID = 32;
            $http.post(vHostURL + 'Handler.ashx?action=SelectSalesHistory&PageNumber=' + $scope.CurrentPage + '&PageSize=' + vPageSizeSales + '&BranchID=' + $scope.BranchID, $scope.ObjectSales).then(function (data) {
                $scope.List = [];
                if (data.data.Rows.length != 0) {
                    $scope.List = data.data.Rows;
                    $scope.totalItems = data.data.Rows[0].TotalRows.toString();
                    $scope.totalPages = (Math.ceil(data.data.Rows[0].TotalRows / vPageSizeSales)).toString();
                }
            });
        }
        else if (localStorage.getItem('CurrentSalesStatus') == 1) {
            $scope.ObjectSales.HistoryCreatedStaffID = JSON.parse(localStorage.getItem('LoggedIn')).ID;
            $scope.ObjectSales.ApproveStatusID = 34;
            $http.post(vHostURL + 'Handler.ashx?action=SelectSalesHistory&PageNumber=' + $scope.CurrentPage + '&PageSize=' + vPageSizeSales + '&BranchID=' + $scope.BranchID, $scope.ObjectSales).then(function (data) {
                $scope.List = [];
                if (data.data.Rows.length != 0) {
                    $scope.List = data.data.Rows;
                    console.log($scope.List);
                    $scope.totalItems = data.data.Rows[0].TotalRows.toString();
                    $scope.totalPages = (Math.ceil(data.data.Rows[0].TotalRows / vPageSizeSales)).toString();
                }
            });
        }
        else {
            if ($scope.ObjectSales.Paid == 2)
                $scope.ObjectSales.RefPaid = true;
            else if ($scope.ObjectSales.Paid == 3)
                $scope.ObjectSales.RefPaid = false;
            else if ($scope.ObjectSales.Paid == 1)
                delete $scope.ObjectSales.RefPaid;
            $scope.ObjectSales.SalesStatusID = localStorage.getItem('CurrentSalesStatus');
            $http.post(vHostURL + 'Handler.ashx?action=SelectSales&PageNumber=' + $scope.CurrentPage + '&PageSize=' + vPageSizeSales + '&BranchID=' + $scope.BranchID, $scope.ObjectSales).then(function (data) {
                $scope.List = [];
                if (data.data.Rows.length != 0) {
                    $scope.List = data.data.Rows;
                    $scope.totalItems = data.data.Rows[0].TotalRows.toString();
                    $scope.totalPages = (Math.ceil(data.data.Rows[0].TotalRows / vPageSizeSales)).toString();
                    console.log($scope.List);
                }
            });
        }
    };

    $scope.Void = function (ID) {
        $scope.ObjectSelectSale = {};
        $scope.ObjectSelectSale.IsDeleted = false;
        $scope.ObjectSelectSale.ID = ID;
        $http.post(vHostURL + 'Handler.ashx?action=SelectSales&PageNumber=1&PageSize=100&BranchID=' + $scope.BranchID, $scope.ObjectSelectSale).then(function (data) {
            $scope.SlesObject = data.data.Rows[0];
            $('#VoidModel').modal("show");
        });
    };

    $scope.SaveVoid = function () {
        $scope.SlesObject.SalesAmount = $scope.NewObject.SalesAmount;
        $scope.SlesObject.SalesStatusID = 87; //Pending Void 
        $scope.SlesObject.HistoryCreatedStaffID = JSON.parse(localStorage.getItem('LoggedIn')).ID;
        $http.post(vHostURL + 'Handler.ashx?action=InsertSalesHistory', $scope.SlesObject).then(function (data) {
            CommonFunctions.InsertLog(9, $scope.SlesObject.ID, 0, 'Pending Void ');
            swal("Voided!", "Waiting approval from administrator", "success");
            $('#VoidModel').modal("hide");
            $scope.Select();
        });
    };

    $scope.Refund = function (ID) {
        $scope.ObjectSelectSale = {};
        $scope.ObjectSelectSale.IsDeleted = false;
        $scope.ObjectSelectSale.ID = ID;
        $http.post(vHostURL + 'Handler.ashx?action=SelectSales&PageNumber=1&PageSize=100&BranchID=' + $scope.BranchID, $scope.ObjectSelectSale).then(function (data) {
            $scope.SlesObject = data.data.Rows[0];
            $('#RefundModel').modal("show");
        });
    };

    $scope.SaveRefund = function () {
        $scope.SlesObject.CreatedStaffID = $scope.Object.CreatedStaff.ID;
        $scope.SlesObject.SalesStatusID = 7; // refunded
        $scope.SlesObject.RefAmountFromProvider = $scope.Object.RefSalesAmount;
        $scope.SlesObject.RefDescription = $scope.Object.RefDescription;
        $http.post(vHostURL + 'Handler.ashx?action=InsertSalesAfterRefund', $scope.SlesObject).then(function (data) {
            CommonFunctions.InsertLog(9, $scope.SlesObject.ID, 0, 'Refund');
            swal("Refunded!", "Please complete refunding process from Refund Sales!", "success");
            $('#RefundModel').modal("hide");
            $scope.Select();
        });
    };

    $scope.AddToInvoice = function (ID) {
        $scope.SaleToInvoice = ID;
        $('#AddToInvoiceModel').modal("show");
    };

    $scope.SaveAddToInvoice = function () {
        if ($scope.AddToInvoiceForm.$valid) {
            $scope.Object.SaleID = $scope.SaleToInvoice;
            $scope.Object.InvoiceNumber = $scope.AddToThisInvoiceNumber;
            $http.post(vHostURL + 'Handler.ashx?action=InsertSalesGroup', $scope.Object).then(function (data) {
                swal("Done!", "Sale added successfully to invoice number " + $scope.AddToThisInvoiceNumber.toString(), "success");
                $('#AddToInvoiceModel').modal("hide");
            });
        }
    };

    $scope.Delete = function (Object) {
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover it again!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then(function (willDelete) {
            if (willDelete) {
                Object.SalesStatusID = 94;
                Object.HistoryCreatedStaffID = JSON.parse(localStorage.getItem('LoggedIn')).ID;
                $http.post(vHostURL + 'Handler.ashx?action=InsertSalesHistory', Object).then(function (data) {
                    CommonFunctions.InsertLog(9, Object.ID, 2, 'Pending Delete');
                    swal("Done! Your ticket waiting approval to Delete", {
                        icon: "success",
                    });
                    $scope.Select();
                });
            } else {
                swal("Your select still exist");
            }
        });
    };

    $scope.DeleteHistory = function (id) {
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover it again!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then(function (willDelete) {
            if (willDelete) {
                $http.post(vHostURL + 'Handler.ashx?action=DeleteSalesHistory&ID=' + id).then(function (data) {
                    CommonFunctions.InsertLog(2, id, 2, 'Delete Sales History');
                    swal("Done! Your select has been deleted", {
                        icon: "success",
                    });
                    $scope.Select();
                });
            } else {
                swal("Your select still exist");
            }
        });
    };

    $scope.Approve = function (Object) {
        swal({
            title: "Are you sure?",
            text: "Once approved, you will not be able to recover it again!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then(function (Approve) {
            if (Approve) {
                Object.ApproveStatusID = 33;
                //Object.SalesStatusID = 5; //Transfered
                var SalesStatus;
                if (Object.SalesStatusID == 95)
                    SalesStatus = 'Edit';
                if (Object.SalesStatusID == 87)
                    SalesStatus = 'Void';
                if (Object.SalesStatusID == 117)
                    SalesStatus = 'Revent Void';
                $http.post(vHostURL + 'Handler.ashx?action=UpdateSalesHistory', Object).then(function (data) {
                    swal("Approved!", {
                        icon: "success",
                    });
                    CommonFunctions.InsertLog(7, Object.ID, 0, 'Approve ' + SalesStatus);
                    $scope.Select();
                });
            } else {
                swal("Your request canceled");
            }
        });
    };

    $scope.Reject = function (Object) {
        swal({
            text: 'Please enter reject reason',
            content: "input",
            button: {
                text: "Reject",
                closeModal: false,
            }
        })
        .then(function (reason) {
            if (reason) {
                Object.ApproveStatusID = 34;
                Object.RejectionReason = reason;
                var SalesStatus;
                if (Object.SalesStatusID == 95)//Edit
                    SalesStatus = 'Edit';
                if (Object.SalesStatusID == 87)//Void
                    SalesStatus = 'Void';
                $http.post(vHostURL + 'Handler.ashx?action=UpdateSalesHistory', Object).then(function (data) {
                    swal("Rejected!", {
                        icon: "success"
                    });
                    CommonFunctions.InsertLog(8, Object.ID, 0, 'Reject ' + SalesStatus);
                    $scope.Select();
                });
            } else {
                swal("Your request canceled");
            }
        });
    };

    $scope.PrintInvoice = function (obj) {
        $scope.PrintSale = obj;
        $scope.TotalPrintCash = 0;
        $scope.TotalPrintCard = 0;
        $scope.TotalPrintCredit = 0;
        $scope.TotalPrintVisa = 0;
        $scope.TotalPrintAdvance = 0;
        $scope.TotalPrintComplementary = 0;
        $scope.TotalSalesAmount = 0;

        $scope.ObjectSalesPrint.SalesStatusID = localStorage.getItem('CurrentSalesStatus');
        $scope.ObjectSalesPrint.InvoiceNumberPNR = obj.InvoiceNumberPNR;
        $http.post(vHostURL + 'Handler.ashx?action=SelectSales&PageNumber=' + $scope.CurrentPage + '&PageSize=' + vPageSizeSales + '&BranchID=' + $scope.BranchID, $scope.ObjectSalesPrint).then(function (data) {
            $scope.PrintList = [];
            if (data.data.Rows.length != 0) {
                $scope.PrintList = data.data.Rows;
                $scope.PrintList.forEach(function (item) {
                    if (item.Cash != 0)
                        $scope.TotalPrintCash += item.Cash;
                    if (item.Card != 0)
                        $scope.TotalPrintCard += item.Card;
                    if (item.Visa != 0)
                        $scope.TotalPrintVisa += item.Visa;
                    if (item.Credit != 0)
                        $scope.TotalPrintCredit += item.Credit;
                    if (item.Complementary != 0)
                        $scope.TotalPrintComplementary += item.Complementary;
                    if (item.Advance != 0)
                        $scope.TotalPrintAdvance += item.Advance;
                    if (item.SalesAmount != 0)
                        $scope.TotalSalesAmount += item.SalesAmount;
                });
                CommonFunctions.InsertLog(6, data.data.Rows[0].ID, 0, 'Print Invoice');
            }
            setTimeout(function () { window.print(); }, 1000);
        });

        //$scope.PrintList = $filter('filter')($scope.List, { InvoiceNumberPNR: obj.InvoiceNumberPNR });

    };

    $scope.Update = function (ID) {
        localStorage.setItem('SaleID', ID);
        localStorage.removeItem('SaleType');
        $location.path("/NewSale");
    };

    $scope.Details = function (ID, type) {
        localStorage.setItem('SaleID', ID);
        localStorage.setItem('SaleType', type);
        $location.path("/NewSale");
    };

    $scope.Pay = function (ID, Status) {
        localStorage.setItem('SaleID', ID);
        localStorage.setItem('SaleStatusID', Status);
        $location.path("/NewJournal");
    }

    $scope.Revert = function (ID) {
        swal({
            title: "Are you sure?",
            text: "Once approved, you will not be able to recover it again!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
       .then(function (Approve) {
           if (Approve) {
               $scope.ObjectSelectSale = {};
               $scope.ObjectSelectSale.IsDeleted = false;
               $scope.ObjectSelectSale.ID = ID;
               $http.post(vHostURL + 'Handler.ashx?action=SelectSales&PageNumber=1&PageSize=100&BranchID=' + $scope.BranchID, $scope.ObjectSelectSale).then(function (data) {
                   $scope.SlesObject = data.data.Rows[0];

                   $scope.SlesObject.SalesStatusID = 117 // Pending Revert 
                   $scope.SlesObject.RefAmountFromProvider = 0;
                   $scope.SlesObject.RefAmountToCustomer = 0;
                   $scope.SlesObject.SalesAmount = $scope.SlesObject.OriginalSalesAmount;
                   $scope.SlesObject.OriginalSalesAmount = 0;
                   $scope.SlesObject.HistoryCreatedStaffID = JSON.parse(localStorage.getItem('LoggedIn')).ID;
                   $http.post(vHostURL + 'Handler.ashx?action=InsertSalesHistory', $scope.SlesObject).then(function (data) {
                       CommonFunctions.InsertLog(9, $scope.SlesObject.ID, 2, 'Pending Revert');
                       swal("Revert!", "Waiting approval from administrator!", "success");
                       $route.reload();
                   });
               });
           } else {
               swal("Your request canceled");
           }
       });
    }

    $scope.MessageValue = 'Please select the vendor first';
    $scope.Message = false;
    $scope.OpenFile = function () {
        $('#fileID').trigger('click');
    };

    $scope.TransferObject = {};
    $scope.SalesSelected = [];
    $scope.AddRemoveSales = function (Obj) {
        if ($scope.SalesSelected.indexOf(Obj) > -1)
            $scope.SalesSelected.splice($scope.SalesSelected.indexOf(Obj), 1);
        else
            $scope.SalesSelected.push(Obj);
    };
    $scope.Transfer = function (Obj) {
        $scope.Message = false;
        if (Obj != null) {
            $scope.Loading = true;
            ExcelToJSON(Obj.files[0]);
            $scope.AllOnlineSales = [];
            $scope.NotMatched = [];
            $scope.AllOnlineSalesObject = {};
            $scope.AllOnlineSalesObject.SalesStatusID = 4;
            $http.post(vHostURL + 'Handler.ashx?action=SelectSales&PageNumber=1&PageSize=' + vUnlimited + '&BranchID=' + $scope.BranchID, $scope.AllOnlineSalesObject).then(function (data) {
                $scope.AllOnlineSales = data.data.Rows;
                var iCount = 0;
                setTimeout(function () {
                    ExcelSheet.forEach(function (itemSheet) {
                        var vFound = false;
                        $scope.AllOnlineSales.forEach(function (itemOnline) {
                            if (itemSheet.TK == itemOnline.TicketNumber) {
                                iCount++;
                                vFound = true;
                                Obj = itemOnline;
                                if ($scope.TransferObject.SubAccount != null && $scope.TransferObject.SubAccount.ID != null)
                                    Obj.SubAccountID = $scope.TransferObject.SubAccount.ID;
                                if ($scope.TransferObject.SalesType != null && $scope.TransferObject.SalesType.ID != null)
                                    Obj.SalesTypeID = $scope.TransferObject.SalesType.ID;
                                Obj.AccountantStaffID = JSON.parse(localStorage.getItem('LoggedIn')).ID;
                                Obj.BankAccountID = 5;
                                Obj.Fare = parseFloat(itemSheet.Fare) * parseFloat(itemSheet.Rate);
                                Obj.Tax = parseFloat(itemSheet.Tax) * parseFloat(itemSheet.Rate);
                                Obj.TotalCost = Obj.Tax + Obj.Fare;
                                $http.post(vHostURL + 'Handler.ashx?action=TransferSales', Obj);
                                CommonFunctions.InsertLog(4, Obj.ID, 0, 'Transfer Sales');
                                return false;
                            }
                        });
                        if (vFound == false)
                            $scope.NotMatched.push(itemSheet.TK);
                    });
                    $scope.Select();
                    swal('Done', iCount + ' Matched - ' + $scope.NotMatched.length + ' Not Matched \n\r ' + 'Not Matched List: ' + $scope.NotMatched, 'success');
                    $scope.Loading = false;
                }, TimerGetOnlineSales);
            });
        }
        else {
            if (($scope.TransferObject.SalesType.ID == 25 || $scope.TransferObject.SubAccount != null) && $scope.SalesSelected.length > 0) {
                $scope.SalesSelected.forEach(function (item) {
                    if ($scope.TransferObject.SubAccount != null && $scope.TransferObject.SubAccount.ID != null)
                        item.SubAccountID = $scope.TransferObject.SubAccount.ID;
                    if ($scope.TransferObject.SalesType != null && $scope.TransferObject.SalesType.ID != null)
                        item.SalesTypeID = $scope.TransferObject.SalesType.ID;
                    item.AccountantStaffID = JSON.parse(localStorage.getItem('LoggedIn')).ID;
                    item.BankAccountID = 5;
                    $http.post(vHostURL + 'Handler.ashx?action=TransferSales', item).then(function (data) {
                        CommonFunctions.InsertLog(4, item.ID, 0, 'Transfer Sales');
                        $scope.StaffList = data.data.Rows;
                    });
                });
                $scope.Select();
                $scope.SalesSelected = [];
                if ($scope.TransferObject.SubAccount != null)
                    $scope.TransferObject.SubAccount = null;
                $scope.TransferObject.SalesType = null;
            }
            else {
                if ($scope.TransferObject.SalesType == null) {
                    $scope.Message = true;
                    $scope.MessageValue = 'Please Select Sales Type';
                }
                else if ($scope.TransferObject.SubAccount == null && $scope.TransferObject.SalesType.ID != 25) {
                    $scope.Message = true;
                    $scope.MessageValue = 'Please Select Vendor';
                }
            }
        }
    };
});

app.controller("InvoiceGroupCtrl", function ($scope, $http, $location, $filter, $route, CommonFunctions, $routeParams) {

    $scope.List = [];

    $scope.CurrentPage = 1;
    $scope.PageSize = vTotalSizeGlobal;

    $scope.Select = function (pageNumber) {
        $http.post(vHostURL + 'Handler.ashx?action=SelectSalesGroup', $scope.ObjectSearch).then(function (data) {
            $scope.List = [];
            if (data.data.Rows.length != 0)
                $scope.List = data.data.Rows;
        });
    };

    $scope.Delete = function (SaleID, InvoiceNumber) {
        var Object = {};
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover it again!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then(function (willDelete) {
            if (willDelete) {
                Object.SaleID = SaleID;
                Object.InvoiceNumber = InvoiceNumber;
                $http.post(vHostURL + 'Handler.ashx?action=DeleteSalesGroup', Object).then(function (data) {
                    CommonFunctions.InsertLog(10, SaleID, 2, 'Delete Sale From Group Invoice');
                    swal("Done! Your select has been deleted", {
                        icon: "success",
                    });
                    $scope.Select();
                });
            } else {
                swal("Your select still exist");
            }
        });
    };

    $scope.PrintInvoice = function () {

        $scope.TotalPrintCash = 0;
        $scope.TotalPrintCard = 0;
        $scope.TotalPrintCredit = 0;
        $scope.TotalPrintVisa = 0;
        $scope.TotalPrintAdvance = 0;
        $scope.TotalPrintComplementary = 0;
        $scope.TotalSalesAmount = 0;

        $scope.InvoiceNumberPNR = '';

        $scope.List.forEach(function (item) {
            if (item.Cash != 0)
                $scope.TotalPrintCash += item.Cash;
            if (item.Card != 0)
                $scope.TotalPrintCard += item.Card;
            if (item.Visa != 0)
                $scope.TotalPrintVisa += item.Visa;
            if (item.Credit != 0)
                $scope.TotalPrintCredit += item.Credit;
            if (item.Complementary != 0)
                $scope.TotalPrintComplementary += item.Complementary;
            if (item.Advance != 0)
                $scope.TotalPrintAdvance += item.Advance;
            if (item.SalesAmount != 0)
                $scope.TotalSalesAmount += item.SalesAmount;
        });
        $scope.InvoiceNumberGroup = $scope.List[0].InvoiceNumberGroup;
        CommonFunctions.InsertLog(6, null, 0, 'Print Group Invoice');

        setTimeout(function () { window.print(); }, 1000);
    };

    $scope.ObjectSearch = {};
    if ($routeParams.invoiceNumber != null) {
        $scope.ObjectSearch.InvoiceNumber = $routeParams.invoiceNumber;
        $scope.Select();
        $("html, body").animate({ scrollTop: 0 }, 600);
    }
});

app.controller("NewInvoiceGroupCtrl", function ($scope, $http, $location, $filter, $route, CommonFunctions, $rootScope) {

    $scope.Object = {};
    $scope.ObjectSales = {};

    $scope.List = [];
    $scope.SalesSelected = [];
    var SalesSelectedIDs = []

    $scope.ObjectSales.DateFrom = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.ObjectSales.DateTo = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.BranchID = JSON.parse(localStorage.getItem('LoggedIn')).BranchID;

    $scope.CurrentPage = 1;
    $scope.PageSize = vTotalSizeGlobal;

    $scope.Select = function (pageNumber) {
        if (pageNumber != null)
            $scope.CurrentPage = pageNumber;
        $scope.ObjectSales.IsDeleted = 0;
        $scope.ObjectSales.SalesStatusID = localStorage.getItem('CurrentSalesStatus');
        if ($scope.ObjectSales.Airline != null)
            $scope.ObjectSales.AirlineID = $scope.ObjectSales.Airline.ID;
        $http.post(vHostURL + 'Handler.ashx?action=SelectSales&PageNumber=1&PageSize=' + vTotalSizeGlobal + '&BranchID=' + $scope.BranchID, $scope.ObjectSales).then(function (data) {
            $scope.List = [];
            if (data.data.Rows.length != 0)
                $scope.List = data.data.Rows;
        });
    };

    $scope.AddRemoveSales = function (Obj) {
        if ($scope.SalesSelected.indexOf(Obj) > -1) {
            $scope.SalesSelected.splice($scope.SalesSelected.indexOf(Obj), 1);
            SalesSelectedIDs.splice(SalesSelectedIDs.indexOf(Obj.ID), 1);
            document.getElementById(Obj.ID).checked = false;
        }
        else {
            $scope.SalesSelected.push(Obj);
            SalesSelectedIDs.push(Obj.ID);
        }
    };

    $scope.Submit = function () {
        $http.post(vHostURL + 'Handler.ashx?action=InsertSalesGroupByID', SalesSelectedIDs).then(function (data) {
            SalesSelectedIDs.forEach(function (item) {
                CommonFunctions.InsertLog(10, item, 0, 'Add Sale To Group Invoice');
            });
            swal("Generated Invoice Is", data.data.InvoiceNumber.toString(), "success");
            $location.path("/InvoiceGroup/" + data.data.InvoiceNumber.toString());
            $rootScope.CurrentRoute = '/InvoiceGroup';
        });
    };

    $scope.ObjectAirLines = {};
    $scope.ObjectAirLines.IsDeleted = false;
    $http.post(vHostURL + 'Handler.ashx?action=SelectAirline&PageNumber=1&PageSize=' + vTotalSizeGlobal, $scope.ObjectAirLines).then(function (data) {
        $scope.AirlinesList = data.data.Rows;
        $scope.Select();
    });
});