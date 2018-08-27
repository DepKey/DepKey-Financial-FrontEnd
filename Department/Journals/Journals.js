app.controller("NewJournalCtrl", function ($scope, $http, $route, $filter, CommonFunctions) {

    $scope.Object = {};
    $scope.Object.JournalMovements = [];
    $scope.Object.JournalDate = new Date(new Date().toLocaleDateString('sv-SE'));
    var Related = 0;
    $scope.SubAccounts = [];
    $scope.SubAccounts.length = 0;
    $scope.Object.SubAccountID = null;
    $scope.BranchID = JSON.parse(localStorage.getItem('LoggedIn')).BranchID;

    //Initial
    //Get Main Accounts
    $scope.ObjectMainAccounts = {};
    $scope.ObjectMainAccounts.IsDeleted = false;
    $scope.ObjectMainAccounts.AccountTypeID = 47;
    $http.post('Handler.ashx?action=SelectAccount&PageNumber=1&PageSize=' + vTotalSizeGlobal,
        $scope.ObjectMainAccounts).then(function (data) {
            $scope.MainAccounts = data.data.Rows;

            //Get Bank Account
            $scope.ObjectBankAccounts = {};
            $scope.ObjectBankAccounts.IsDeleted = false;
            $scope.ObjectBankAccounts.ParentID = 246;
            $http.post('Handler.ashx?action=SelectAccount&PageNumber=1&PageSize=' + vTotalSizeGlobal,
                 $scope.ObjectBankAccounts).then(function (data2) {
                     $scope.BankList = data2.data.Rows;
                     $scope.Object.BankID = $scope.BankList[0];

                     //Get Journal Types
                     $scope.ObjectLookup = {};
                     $scope.ObjectLookup.IsDeleted = false;
                     $scope.ObjectLookup.LookupTypeID = 6;
                     $scope.ObjectLookup.Note = "DropDown";
                     $http.post('Handler.ashx?action=SelectLookup&PageNumber=1&PageSize=' + vTotalSizeGlobal,
                         $scope.ObjectLookup).then(function (data3) {
                             $scope.JournalTypes = data3.data.Rows;

                             if (localStorage.getItem('SaleID') != null) {
                                 //Get Refund Sale
                                 $scope.ObjectSale = {};
                                 $scope.ObjectSale.IsDeleted = false;
                                 $scope.ObjectSale.RefPaid = false;
                                 $scope.ObjectSale.SalesStatusID = 7;
                                 $scope.ObjectSale.ID = localStorage.getItem('SaleID');
                                 $scope.ObjectSale.BranchID = JSON.parse(localStorage.getItem('LoggedIn')).BranchID;
                                 $http.post('Handler.ashx?action=SelectSales&PageNumber=1&PageSize=' + vTotalSizeGlobal + '&BranchID=' + $scope.BranchID,
                                     $scope.ObjectSale).then(function (data4) {
                                         $scope.RefundSale = data4.data.Rows[0];
                                         if (JSON.parse(localStorage.getItem('SaleStatusID')) == 7) {
                                             $scope.Object.JournalTypeID = $filter('filter')($scope.JournalTypes, { ID: 16 })[0];
                                             $scope.Object.RefDescription = $scope.RefundSale.RefDescription;
                                             $scope.FromSales = true;
                                         }
                                         else {
                                             $scope.Object.JournalTypeID = $filter('filter')($scope.JournalTypes, { ID: 10 })[0];
                                             $scope.FromSales = false;
                                         }

                                     });
                             }
                         });
                 });
        });

    $scope.SelectAccount = function (MainAccountID) {
        if (MainAccountID != null) {
            $scope.ObjectAccount = {};
            $scope.ObjectAccount.IsDeleted = false;
            $scope.ObjectAccount.ParentID = MainAccountID;
            $http.post('Handler.ashx?action=SelectAccount&PageNumber=1&PageSize=600', $scope.ObjectAccount).then(
                function (data) {
                    $scope.SubAccounts = data.data.Rows;
                    if ($scope.SubAccounts.length != 0) {
                        $scope.Object.SubAccountID = $scope.SubAccounts[0];
                        $scope.Object.SubAccountNumber = $scope.SubAccounts[0].AccountNumber;
                    }
                    else {
                        $scope.Object.SubAccountID = null;
                    }
                });
            $scope.MainAccounts.forEach(function (item) {
                if (item.ID == MainAccountID) {
                    $scope.Object.MainAccountNumber = item.AccountNumber;
                }
            });
        }
        else {
            $scope.SubAccounts.length = 0;
            $scope.Object.MainAccountNumber = '';
        }
    }

    $scope.SelectAccountNumber = function (SubAccountID) {
        if (SubAccountID != null) {
            $scope.SubAccounts.forEach(function (item) {
                if (item.ID == SubAccountID) {
                    $scope.Object.SubAccountNumber = item.AccountNumber;
                }
            });
        }
        else {
            $scope.Object.SubAccountNumber = '';
        }
    }

    $scope.Add = function () {
        debugger;
        Related++;
        var vDebit;
        var vCredit;
        var vAccountID;
        var vBankID;

        $scope.FormMain.$setSubmitted();
        if ($scope.FormMain.$valid) {
            if ($scope.Object.JournalTypeID.ID != 10) {
                if ($scope.Object.JournalTypeID.ID == 11) {
                    vDebit = $scope.Object.Amount;
                    vCredit = 0;
                    vAccountID = 244;
                }
                else if ($scope.Object.JournalTypeID.ID == 12) {
                    vDebit = 0;
                    vCredit = $scope.Object.Amount;
                    vAccountID = 244;
                }
                else if ($scope.Object.JournalTypeID.ID == 14) {
                    vDebit = $scope.Object.Amount;
                    vCredit = 0;
                    vBankID = $scope.Object.BankID.ID;
                }
                else if ($scope.Object.JournalTypeID.ID == 15) {
                    vDebit = 0;
                    vCredit = $scope.Object.Amount;
                    vBankID = $scope.Object.BankID.ID;
                }
                $scope.Debit = {
                    Debit: vDebit,
                    Credit: vCredit,
                    AccountID: vBankID == null ? vAccountID : vBankID,
                    MovementDescription: $scope.Object.MovementDescription,
                    Related: Related,
                    JournalDate: $scope.Object.JournalDate,
                    IsDeleted: false
                }
                $scope.Object.JournalMovements.push($scope.Debit);
                $scope.Credit = {
                    Debit: vCredit,
                    Credit: vDebit,
                    AccountID: $scope.Object.SubAccountID == null ? $scope.Object.MainAccountID.ID : $scope.Object.SubAccountID.ID,
                    MovementDescription: $scope.Object.MovementDescription,
                    Related: Related,
                    JournalDate: $scope.Object.JournalDate,
                    IsDeleted: false
                }
                $scope.Object.JournalMovements.push($scope.Credit);
            }
            else if ($scope.Object.JournalTypeID.ID == 10) {
                if ($scope.Object.MovType == "Debit") {
                    $scope.Debit = {
                        Debit: $scope.Object.Amount,
                        Credit: 0,
                        AccountID: $scope.Object.SubAccountID == null ? $scope.Object.MainAccountID.ID : $scope.Object.SubAccountID.ID,
                        MovementDescription: $scope.Object.MovementDescription,
                        Related: Related,
                        JournalDate: $scope.Object.JournalDate,
                        IsDeleted: false
                    }
                    $scope.Object.JournalMovements.push($scope.Debit);
                    $scope.Object.MainAccountID = null
                    $scope.Object.SubAccountID = null;
                    $scope.Object.MovementDescription = null;
                    $scope.Object.Amount = null;
                }
                if ($scope.Object.MovType == "Credit") {
                    $scope.Debit = {
                        Debit: 0,
                        Credit: $scope.Object.Amount,
                        AccountID: $scope.Object.SubAccountID == null ? $scope.Object.MainAccountID.ID : $scope.Object.SubAccountID.ID,
                        MovementDescription: $scope.Object.MovementDescription,
                        Related: Related,
                        JournalDate: $scope.Object.JournalDate,
                        IsDeleted: false
                    }
                    $scope.Object.JournalMovements.push($scope.Debit);
                    $scope.Object.MainAccountID = null
                    $scope.Object.SubAccountID = null;
                    $scope.Object.MovementDescription = null;
                    $scope.Object.Amount = null;
                }
            }
            $scope.Object.JournalMovements.forEach(function (item) {
                var vObject = {};
                vObject.ID = item.AccountID;
                $http.post('Handler.ashx?action=SelectAccount&PageNumber=1&PageSize=1', vObject).then(function (data) {
                    item.AccountName = data.data.Rows[0].Name;
                    item.AccountNumber = data.data.Rows[0].AccountNumber;
                });
            });
        }
    };

    $scope.Delete = function (Related, JournalTypeID) {
        if (JournalTypeID == 10) {
            $scope.Object.JournalMovements.forEach(function (item) {
                if (item.Related == Related) {
                    $scope.Object.JournalMovements.splice(item, 1);
                }
            });
        }
        else {
            $scope.Object.JournalMovements.forEach(function (item) {
                if (item.Related == Related) {
                    $scope.Object.JournalMovements.splice(item, 2);
                }
            });
        }
    }

    $scope.Submit = function () {
        if ($scope.Object.JournalTypeID.ID == 16) {
            if (localStorage.getItem('SaleID') == null) {
                $scope.FromSales = true;
                swal("Error!", "Refund from Refund List Only!", "error");
            }

            else {
                $scope.Credit = {
                    Debit: 0,
                    Credit: $scope.Object.Amount,
                    AccountID: $scope.Object.SubAccountID == null ? $scope.Object.MainAccountID.ID : $scope.Object.SubAccountID.ID,
                    MovementDescription: $scope.Object.MovementDescription,
                    SalesID: localStorage.getItem('SaleID'),
                    JournalDate: $scope.Object.JournalDate,
                    IsDeleted: false
                }
                $scope.Object.JournalTypeID = $scope.Object.JournalTypeID.ID;
                $scope.Object.StaffID = JSON.parse(localStorage.getItem('LoggedIn')).ID;
                $scope.Object.BranchID = JSON.parse(localStorage.getItem('LoggedIn')).BranchID;
                $scope.Object.JournalMovements.push($scope.Credit);
                $scope.Object.SalesID = localStorage.getItem('SaleID');
                if ($scope.Object.JournalDate.toString('dd-MMM-yyyy') != new Date().toString('dd-MMM-yyyy')) {
                    $http.post('Handler.ashx?action=InsertJournalHistory', $scope.Object).then(function (data) {
                        swal("Created!", "Waiting approval from administrator!", "success");
                        $scope.Object.JournalMovements = [];
                        CommonFunctions.InsertLog(0, data.data.Rows[0].Identity, 4, 'Insert Journal');
                        localStorage.removeItem('SaleID');
                        $route.reload();
                    });
                }
                else {
                    $http.post('Handler.ashx?action=InsertJournal', $scope.Object).then(function (data) {
                        swal("Done!", "Journal Created Successfully!", "success");
                        CommonFunctions.InsertLog(0, data.data.Rows[0].Identity, 1, 'Insert Journal');
                        localStorage.removeItem('SaleID');
                        $route.reload();
                    });
                }
            }
        }
        else {
            $scope.FromSales = false;
            $scope.calcTotalDebit();
            if ($scope.vDebitSubtractCredit != 0) {
                swal("Error!", "Debti Must Equal Credit!", "error");
            }
            else {
                $scope.Object.JournalTypeID = $scope.Object.JournalTypeID.ID;
                $scope.Object.StaffID = JSON.parse(localStorage.getItem('LoggedIn')).ID;
                $scope.Object.BranchID = JSON.parse(localStorage.getItem('LoggedIn')).BranchID;
                $scope.Object.SalesID = localStorage.getItem('SaleID');

                if ($scope.Object.JournalDate.toString('dd-MMM-yyyy') != new Date().toString('dd-MMM-yyyy')) {

                    $http.post('Handler.ashx?action=InsertJournalHistory', $scope.Object).then(function (data) {
                        swal("Created!", "Waiting approval from administrator!", "success");
                        $scope.Object.JournalMovements = [];
                        CommonFunctions.InsertLog(0, data.data.Rows[0].Identity, 4, 'Insert Journal');
                        localStorage.removeItem('SaleID');
                        $route.reload();
                    });
                }
                else {
                    $http.post('Handler.ashx?action=InsertJournal', $scope.Object).then(function (data) {
                        swal("Done!", "Journal Created Successfully!", "success");
                        CommonFunctions.InsertLog(0, data.data.Rows[0].Identity, 1, 'Insert Journal');
                        localStorage.removeItem('SaleID');
                        $route.reload();
                    });
                }
            }
        }
    }

    $scope.calcTotalDebit = function () {
        var vTotalDebti = 0;
        var vTotalCredit = 0;
        $scope.vDebitSubtractCredit;
        for (var i = 0; i < $scope.Object.JournalMovements.length; i++) {
            vTotalDebti += parseFloat($scope.Object.JournalMovements[i].Debit);
            vTotalCredit += parseFloat($scope.Object.JournalMovements[i].Credit);
        }
        $scope.vDebitSubtractCredit = (vTotalDebti - vTotalCredit);
    }
});

app.controller("JournalsCtrl", function ($scope, $http, $route, CommonFunctions) {
    $scope.AddEditFlag = false;
    $scope.AddEditMovmentFlag = false;
    $scope.ShowOpenEditbtn = false;
    $scope.CurrentPage = 1;
    $scope.PageSize = vPageSizeGlobal;
    $scope.ObjectJournalMovement = {};
    $scope.ObjectSearch = {};
    $scope.ObjectSearch.DateFrom = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.ObjectSearch.DateTo = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.BranchID = JSON.parse(localStorage.getItem('LoggedIn')).BranchID;

    if (localStorage.getItem('CurrentJournalStatus') == 61)
        $scope.Title = "Journal Listing";
    if (localStorage.getItem('CurrentJournalStatus') == 108)
        $scope.Title = "Watting Journal Action";
    if (localStorage.getItem('CurrentJournalStatus') == 122)
        $scope.Title = "Rejected Journal List";

    $scope.ObjectMainAccounts = {};
    $scope.ObjectMainAccounts.IsDeleted = false;
    $http.post('Handler.ashx?action=SelectAccountWithSub&PageNumber=1&PageSize=' + vTotalSizeGlobal,
       $scope.ObjectMainAccounts).then(function (data) {
           $scope.MainAndSubAccounts = data.data.Rows;
       });

    $scope.Select = function (pageNumber) {
        if (localStorage.getItem('CurrentJournalStatus') == 108) {
            $scope.ObjectSearch.ApprovalStatusID = 32;
            $scope.ShowOpenEditbtn = false;
        }
        if (localStorage.getItem('CurrentJournalStatus') == 122) {
            $scope.ObjectSearch.ApprovalStatusID = 34;
            $scope.ShowOpenEditbtn = false;
        }
        if (pageNumber != null)
            $scope.CurrentPage = pageNumber;
        $http.post('Handler.ashx?action=SelectJournal' +
        '&PageNumber=' +
        $scope.CurrentPage +
        '&PageSize=' +
        vPageSizeGlobal + '&BranchID=' + $scope.BranchID,
        $scope.ObjectSearch).then(
        function (data) {
            $scope.List = [];
            if (data.data.Rows.length != 0) {
                $scope.List = data.data.Rows;
                $scope.totalItems = data.data.Rows[0].TotalRows.toString();
                $scope.totalPages = (Math.ceil(data.data.Rows[0].TotalRows / vPageSizeGlobal)).toString();
            }
        });
    }
    $scope.Select();

    $scope.Delete = function (JournalID) {
        $scope.ObjectJournalMovement = {};
        $scope.ObjectJournalMovement.IsDeleted = false;
        $scope.ObjectJournalMovement.JournalID = JournalID;
        $http.post('Handler.ashx?action=SelectMovement&PageNumber=1&PageSize=100', $scope.ObjectJournalMovement).then(function (data) {
            $scope.DeletedList = data.data.Rows;

            $scope.DeletedList.JournalID = $scope.ObjectJournalMovement.JournalID;
            for (var i = 0; i < $scope.DeletedList.length; i++) {
                $scope.DeletedList[i].IsDeleted = true;
            }
            $http.post('Handler.ashx?action=InsertMovementHistory', $scope.DeletedList).then(function (data) {
                CommonFunctions.InsertLog(0, JournalID, 4, 'Insert Movement History with this Journal ID');
                swal("Deleted!", "Waiting approval from administrator", "success");
                $route.reload();
            });
        });
    }

    $scope.Movements = function (ID) {
        $scope.ObjectJournalMovement = {};
        $scope.ObjectJournalMovement.IsDeleted = false;
        $scope.ObjectJournalMovement.JournalID = ID;
        $http.post('Handler.ashx?action=SelectMovement&PageNumber=1&PageSize=100', $scope.ObjectJournalMovement).then(function (data) {
            $scope.MovmentList = data.data.Rows;
            for (var i = 0; i < $scope.List.length; i++) {
                if ($scope.List[i].ID == ID) {
                    if ($scope.List[i].JournalTypeID == 57 || localStorage.getItem('CurrentJournalStatus') == 108 || $scope.List[i].HistoryID != null) {
                        $scope.ShowOpenEditbtn = false;
                    }
                }
            }

            if (localStorage.getItem('CurrentJournalStatus') == 108) {
                $scope.ObjectJournalMovement.ApprovalStatusID = 32;
                $http.post('Handler.ashx?action=SelectMovementHistory&PageNumber=1&PageSize=100', $scope.ObjectJournalMovement).then(function (data) {
                    $scope.NewMovmentList = data.data.Rows;
                });
            }
            if (localStorage.getItem('CurrentJournalStatus') == 122) {
                $scope.ObjectJournalMovement.ApprovalStatusID = 34;
                $http.post('Handler.ashx?action=SelectMovementHistory&PageNumber=1&PageSize=100', $scope.ObjectJournalMovement).then(function (data) {
                    $scope.NewMovmentList = data.data.Rows;
                });
            }
        });
        $('#EditMovementModel').modal("show");
    }

    $scope.AskEdit = function (index) {
        $scope.AddEditMovmentFlag = true;
    }

    $scope.SaveMovmentEdit = function () {
        $scope.calcTotalDebit();
        if ($scope.vDebitSubtractCredit != 0) {
            $scope.AddEditMovmentFlag = true;
            $('#EditMovementModel').modal("show");
            swal("Error!", "Debti Must Equal Credit!", "error");
        }
        else {
            $scope.MovmentList.JournalID = $scope.ObjectJournalMovement.JournalID;
            $http.post('Handler.ashx?action=InsertMovementHistory', $scope.MovmentList).then(function (data) {
                CommonFunctions.InsertLog(0, JournalID, 4, 'Insert Movement History with this journalID');
                swal("Updated!", "Waiting approval from administrator", "success");
                $('#EditMovementModel').modal("hide");
                $route.reload();
            });
        }
    }

    $scope.calcTotalDebit = function () {
        var vTotalDebti = 0;
        var vTotalCredit = 0;
        $scope.vDebitSubtractCredit;
        for (var i = 0; i < $scope.MovmentList.length; i++) {
            vTotalDebti += parseFloat($scope.MovmentList[i].Debit);
            vTotalCredit += parseFloat($scope.MovmentList[i].Credit);
        }
        $scope.vDebitSubtractCredit = (vTotalDebti - vTotalCredit);
    }

    $scope.Approve = function (JournalID) {
        swal({
            title: "Are you sure?",
            text: "Once approved, you will not be able to recover it again!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then(function (Approve) {
            if (Approve) {
                if (localStorage.getItem('CurrentJournalStatus') == 108) {
                    $scope.ObjectJournalMovement.ApprovalStatusID = 32;
                    $scope.ObjectJournalMovement.JournalID = JournalID;
                    $http.post('Handler.ashx?action=SelectMovementHistory&PageNumber=1&PageSize=100', $scope.ObjectJournalMovement).then(function (data) {
                        $scope.NewMovmentList = data.data.Rows;
                        $http.post('Handler.ashx?action=UpdateMovementHistory&ApprovalStatusID=33', $scope.NewMovmentList).then(function (data) {
                            swal("Approved!", {
                                icon: "success",
                            });
                            CommonFunctions.InsertLog(7, JournalID, 4, 'Update Movements for this Journal ID');
                            $route.reload();
                        });
                    });
                }

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

                if (localStorage.getItem('CurrentJournalStatus') == 108) {
                    $scope.ObjectJournalMovement.ApprovalStatusID = 32;
                    $scope.ObjectJournalMovement.JournalID = Object.ID;
                    $http.post('Handler.ashx?action=SelectMovementHistory&PageNumber=1&PageSize=100', $scope.ObjectJournalMovement).then(function (data) {
                        $scope.NewMovmentList = data.data.Rows;
                        $http.post('Handler.ashx?action=UpdateMovementHistory&ApprovalStatusID=34&RejectionReason=' + reason, $scope.NewMovmentList).then(function (data) {
                            swal("Rejected!", {
                                icon: "success",
                            });
                            CommonFunctions.InsertLog(8, Object.ID, 4, 'Update Movements for this Journal ID');
                            $route.reload();
                        });
                    });
                }
            } else {
                swal("Your request canceled");
            }
        });
    };

});

app.controller("OutstandingCtrl", function ($scope, $http, $route, CommonFunctions) {

    $scope.ObjectSearch = {};
    $scope.MainAccounts = [];
    $scope.List = [];

    $scope.ObjectSearch.DateFrom = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.ObjectSearch.DateTo = new Date(new Date().toLocaleDateString('sv-SE'));

    //Initial
    //Get Main Accounts
    $scope.ObjectMainAccounts = {};
    $scope.ObjectMainAccounts.IsDeleted = false;
    $scope.ObjectMainAccounts.AccountTypeID = 47;
    $http.post('Handler.ashx?action=SelectAccount&PageNumber=1&PageSize=' + vTotalSizeGlobal, $scope.ObjectMainAccounts).then(function (data) {
        data.data.Rows.forEach(function (item) {
            if (item.Outstanding != null)
                $scope.MainAccounts.push(item);

        });
        $scope.SubAccounts = [];
    });

    $scope.SelectAccount = function (MainAccountID) {
        $scope.ObjectAccount = {};
        $scope.ObjectAccount.IsDeleted = false;
        $scope.ObjectAccount.ParentID = MainAccountID;
        $scope.ObjectSearch.SubAcc = null;
        $scope.SubAccounts = [];
        $http.post('Handler.ashx?action=SelectAccount&PageNumber=1&PageSize=' + vTotalSizeGlobal, $scope.ObjectAccount).then(
            function (data) {
                $scope.SubAccounts = data.data.Rows;
                $scope.SubAccounts.unshift({ ID: null, Name: 'All' });
                $scope.List = [];
            });
    };

    $scope.Select = function () {

        //Get Journal Types
        $scope.ObjectLookup = {};
        $scope.ObjectLookup.IsDeleted = false;
        $scope.ObjectLookup.LookupTypeID = 6;
        $scope.ObjectLookup.Note = "DropDown";
        $http.post('Handler.ashx?action=SelectLookup&PageNumber=1&PageSize=' + vTotalSizeGlobal,
                $scope.ObjectLookup).then(function (data) {
                    $scope.JournalTypes = [];
                    data.data.Rows.forEach(function (item) {
                        if ((item.ID == 12 && ($scope.ObjectSearch.MainAcc.ID == 34 || $scope.ObjectSearch.MainAcc.ID == 245)) ||
                            (item.ID == 11 && $scope.ObjectSearch.MainAcc.ID != 34 && $scope.ObjectSearch.MainAcc.ID != 245) ||
                            (item.ID == 15 && ($scope.ObjectSearch.MainAcc.ID == 34 || $scope.ObjectSearch.MainAcc.ID == 245)) ||
                            (item.ID == 14 && $scope.ObjectSearch.MainAcc.ID != 34 && $scope.ObjectSearch.MainAcc.ID != 245))
                            $scope.JournalTypes.push(item);
                    });

                    //Get Bank Account
                    $scope.ObjectBankAccounts = {};
                    $scope.ObjectBankAccounts.IsDeleted = false;
                    $scope.ObjectBankAccounts.ParentID = 246;
                    $http.post('Handler.ashx?action=SelectAccount&PageNumber=1&PageSize=' + vTotalSizeGlobal,
                         $scope.ObjectBankAccounts).then(function (data2) {
                             $scope.BankList = data2.data.Rows;

                             $scope.List = [];
                             $scope.FormMain.$setSubmitted;
                             if ($scope.FormMain.$valid) {
                                 $scope.ObjectSearch, AccountID = null;
                                 if ($scope.ObjectSearch.SubAcc != null && $scope.ObjectSearch.SubAcc.ID != null)
                                     $scope.ObjectSearch.AccountID = $scope.ObjectSearch.SubAcc.ID;
                                 else if ($scope.ObjectSearch.MainAcc != null && $scope.ObjectSearch.MainAcc.ID != null && $scope.SubAccounts.length > 0)
                                     $scope.ObjectSearch.AccountID = $scope.ObjectSearch.MainAcc.ID;
                                 if ($scope.ObjectSearch.AccountID != null) {
                                     $http.post('Handler.ashx?action=SelectOutstanding', $scope.ObjectSearch).then(
                                 function (data) {
                                     $scope.TotalDebit = 0;
                                     $scope.TotalCredit = 0
                                     $scope.List = data.data.Rows;
                                     $scope.List.forEach(function (item) {
                                         if (item.Debit != 0)
                                             $scope.TotalDebit += item.Debit;
                                         if (item.Credit != 0)
                                             $scope.TotalCredit += item.Credit;
                                     })

                                     if ($scope.TotalDebit > $scope.TotalCredit) {
                                         $scope.TotalDebitDiff = $scope.TotalDebit - $scope.TotalCredit;
                                         $scope.TotalCreditDiff = 0;
                                     }
                                     else if ($scope.TotalDebit < $scope.TotalCredit) {
                                         $scope.TotalCreditDiff = $scope.TotalCredit - $scope.TotalDebit;
                                         $scope.TotalDebitDiff = 0;
                                     }

                                     $http.post('Handler.ashx?action=SelectAccountDC', $scope.ObjectSearch).then(function (data) {
                                         $scope.OBCredit = data.data.Rows[0].Credit;
                                         $scope.OBDebit = data.data.Rows[0].Debit;

                                         $scope.GBDebit = $scope.TotalDebitDiff + $scope.OBDebit;
                                         $scope.GBCredit = $scope.TotalCreditDiff + $scope.OBCredit;
                                         if ($scope.GBDebit > $scope.GBCredit) {
                                             $scope.GBDebit = $scope.GBDebit - $scope.GBCredit;
                                             $scope.GBCredit = 0;
                                         }
                                         else if ($scope.GBDebit < $scope.GBCredit) {
                                             $scope.GBCredit = $scope.GBCredit - $scope.GBDebit;
                                             $scope.GBDebit = 0;
                                         }

                                         $scope.Debit = 0;
                                         $scope.Credit = 0;
                                         var DebitCount = 0;
                                         var CreditCount = 0;
                                         var Outstanding = [];
                                         var PartialMovement = null;

                                         $scope.TotalDebit = Math.Round(double.Parse($scope.TotalDebit.ToString()), 3);
                                         $scope.TotalCredit = Math.Round(double.Parse($scope.TotalCredit.ToString()), 3);
                                         $scope.TotalDebitDiff = Math.Round(double.Parse($scope.TotalDebitDiff.ToString()), 3);
                                         $scope.TotalCreditDiff = Math.Round(double.Parse($scope.TotalCreditDiff.ToString()), 3);
                                         $scope.GBDebit = Math.Round(double.Parse($scope.GBDebit.ToString()), 3);
                                         $scope.GBCredit = Math.Round(double.Parse($scope.GBCredit.ToString()), 3);

                                     });
                                 });
                                 }
                             }
                         });
                });
    };

    $scope.ClearBank = function () {
        $scope.Object.BankID = null;
    };

    $scope.Object = {};
    $scope.Object.JournalMovements = [];
    $scope.SaveJournal = function () {
        if ($scope.FormJournal.$valid) {
            var vAccountID;
            var vBankID = null;
            if ($scope.Object.JournalTypeID.ID == 11) {
                vDebit = $scope.Object.Amount;
                vCredit = 0;
                vAccountID = 244;
            }
            else if ($scope.Object.JournalTypeID.ID == 12) {
                vDebit = 0;
                vCredit = $scope.Object.Amount;
                vAccountID = 244;
            }
            else if ($scope.Object.JournalTypeID.ID == 14) {
                vDebit = $scope.Object.Amount;
                vCredit = 0;
                vBankID = $scope.Object.BankID.ID;
            }
            else if ($scope.Object.JournalTypeID.ID == 15) {
                vDebit = 0;
                vCredit = $scope.Object.Amount;
                vBankID = $scope.Object.BankID.ID;
            }
            $scope.DebitJournal = {
                Debit: vDebit,
                Credit: vCredit,
                AccountID: vBankID == null ? vAccountID : vBankID,
                MovementDescription: 'Paying an account ' + $scope.ObjectSearch.SubAcc.Name,
                JournalDate: new Date()
            }
            $scope.Object.JournalMovements.push($scope.DebitJournal);
            $scope.CreditJournal = {
                Debit: vCredit,
                Credit: vDebit,
                AccountID: $scope.ObjectSearch.SubAcc.ID,
                MovementDescription: 'Paying an account ' + $scope.ObjectSearch.SubAcc.Name,
                JournalDate: new Date()
            }
            $scope.Object.JournalMovements.push($scope.CreditJournal);

            $scope.Object.JournalTypeID = $scope.Object.JournalTypeID.ID;
            $scope.Object.StaffID = JSON.parse(localStorage.getItem('LoggedIn')).ID;
            $scope.Object.BranchID = JSON.parse(localStorage.getItem('LoggedIn')).BranchID;
            $http.post('Handler.ashx?action=InsertJournal', $scope.Object).then(function (data) {
                swal("Done!", "Journal Created Successfully!", "success");
                CommonFunctions.InsertLog(0, data.data.Rows[0].Identity, 1, 'Insert Journal');
                $scope.FormJournal.$setPristine();
                $scope.FormJournal.$setUntouched();
                $scope.Object.Amount = '';
                $scope.Object.JournalTypeID = null;
                $scope.Object.JournalMovements = [];
                $scope.Select();
            });
        }
    };

    $scope.Debit = 0;
    $scope.Credit = 0;
    var DebitCount = 0;
    var CreditCount = 0;
    var Outstanding = [];
    $scope.AddToOutstanding = function (Movement) {
        if (Outstanding.length != 0) {
            if (Outstanding.indexOf(Movement) > -1) {
                Outstanding.splice(Outstanding.indexOf(Movement), 1);
                if (Movement == PartialMovement) {
                    PartialMovement = null;
                    document.getElementById(Movement.ID).checked = false;
                }
                if (Movement.Debit != 0) {
                    $scope.Debit -= Movement.Debit;
                    DebitCount--;
                }
                if (Movement.Credit != 0) {
                    $scope.Credit -= Movement.Credit;
                    CreditCount--;
                }
            }
            else {
                Outstanding.push(Movement);
                if (Movement.Debit != 0) {
                    $scope.Debit += Movement.Debit;
                    DebitCount++;
                }
                if (Movement.Credit != 0) {
                    $scope.Credit += Movement.Credit;
                    CreditCount++;
                }
            }
        }
        else {
            Outstanding.push(Movement);
            if (Movement.Debit != 0) {
                $scope.Debit += Movement.Debit;
                DebitCount++;
            }
            if (Movement.Credit != 0) {
                $scope.Credit += Movement.Credit;
                CreditCount++;
            }
        }
    };

    var PartialMovement = null;
    $scope.AddToPartial = function (Movement) {
        PartialMovement = Movement;

        if (Outstanding.indexOf(Movement) == -1) {
            Outstanding.push(Movement);
            if (Movement.Debit != 0) {
                $scope.Debit += Movement.Debit;
                DebitCount++;
            }
            if (Movement.Credit != 0) {
                $scope.Credit += Movement.Credit;
                CreditCount++;
            }
        }

        if (Movement.Credit != 0)
            document.getElementById(Movement.ID + 'C').checked = true;
        else if (Movement.Debit != 0)
            document.getElementById(Movement.ID + 'D').checked = true;
    };

    var OutstandingRecord = [];
    var AmountNeedToPay = 0;
    $scope.Pay = function () {
        if ($scope.Debit == 0 || $scope.Credit == 0)
            swal('Error', 'Please select Debit & Credit', 'error');
        else {
            $http.get('Handler.ashx?action=OutStandingSelectMaxOsNumber').then(function (data) {
                var OsNumber = parseInt(data.data.Rows[0].MaxOsNumber) + 1;

                if (PartialMovement != null) {
                    Outstanding.splice(Outstanding.indexOf(PartialMovement), 1);
                    Outstanding.push(PartialMovement);
                }

                if ($scope.Credit > $scope.Debit && (PartialMovement != null || CreditCount == 1)) {
                    AmountNeedToPay = $scope.Debit;
                    Outstanding.forEach(function (item) {
                        if (item.Debit != 0) {
                            OutstandingRecord.push({
                                JournalMovementID: item.ID,
                                StatusID: 0,
                                Amount: item.Debit,
                                OsNumber: OsNumber
                            });
                        }
                        else if (item.Credit != 0) {
                            if ((PartialMovement != null && PartialMovement == item) || CreditCount == 1) {
                                if ($scope.Credit - $scope.Debit > item.Credit) {
                                    OutstandingRecord = [];
                                    swal('Error', 'Incompatible Selection ', 'error');
                                    return;
                                }
                                else {
                                    OutstandingRecord.push({
                                        JournalMovementID: item.ID,
                                        StatusID: 2,
                                        Amount: item.Credit - AmountNeedToPay,
                                        OsNumber: OsNumber
                                    });
                                    if (item.Credit >= AmountNeedToPay)
                                        AmountNeedToPay = 0;
                                    else
                                        AmountNeedToPay -= item.Credit;
                                }
                            }
                            else {
                                if (AmountNeedToPay > item.Credit) {
                                    OutstandingRecord.push({
                                        JournalMovementID: item.ID,
                                        StatusID: 0,
                                        Amount: item.Credit,
                                        OsNumber: OsNumber
                                    });
                                    AmountNeedToPay -= item.Credit;
                                }
                                else {
                                    OutstandingRecord = [];
                                    swal('Error', 'Incompatible Selection ', 'error');
                                    return;
                                }
                            }
                        }
                    });
                }
                else if ($scope.Credit == $scope.Debit) {
                    Outstanding.forEach(function (item) {
                        OutstandingRecord.push({
                            JournalMovementID: item.ID,
                            StatusID: 0,
                            Amount: item.Debit == 0 ? item.Credit : item.Debit,
                            OsNumber: OsNumber
                        });
                    });
                }
                else if ($scope.Credit < $scope.Debit && (PartialMovement != null || DebitCount == 1)) {
                    AmountNeedToPay = $scope.Credit;
                    Outstanding.forEach(function (item) {
                        if (item.Credit != 0) {
                            OutstandingRecord.push({
                                JournalMovementID: item.ID,
                                StatusID: 0,
                                Amount: item.Credit,
                                OsNumber: OsNumber
                            });
                        }
                        else if (item.Debit != 0) {
                            if ((PartialMovement != null && PartialMovement == item) || DebitCount == 1) {
                                if ($scope.Debit - $scope.Credit > $scope.Debit) {
                                    OutstandingRecord = [];
                                    swal('Error', 'Incompatible Selection ', 'error');
                                    return;
                                }
                                else {
                                    OutstandingRecord.push({
                                        JournalMovementID: item.ID,
                                        StatusID: 2,
                                        Amount: item.Debit - AmountNeedToPay,
                                        OsNumber: OsNumber
                                    });
                                    if (item.Debit >= AmountNeedToPay)
                                        AmountNeedToPay = 0;
                                    else
                                        AmountNeedToPay -= item.Debit;
                                }
                            }
                            else {
                                if (AmountNeedToPay > item.Debit) {
                                    OutstandingRecord.push({
                                        JournalMovementID: item.ID,
                                        StatusID: 0,
                                        Amount: item.Debit,
                                        OsNumber: OsNumber
                                    });
                                    AmountNeedToPay -= item.Debit;
                                }
                                else {
                                    OutstandingRecord = [];
                                    swal('Error', 'Incompatible Selection ', 'error');
                                    return;
                                }

                            }
                        }
                    });
                }
                else {
                    swal('Error', 'Please select partial movement', 'error');
                    return;
                }

                var vCount = OutstandingRecord.length;
                OutstandingRecord.forEach(function (item) {
                    $http.post('Handler.ashx?action=InsertOutstanding', item).then(function (data) {
                        vCount--;
                        if (vCount == 0) {
                            $scope.Debit = 0;
                            $scope.Credit = 0;
                            DebitCount = 0;
                            CreditCount = 0;
                            Outstanding = [];
                            OutstandingRecord = [];
                            swal('Paymeny Done', 'success');
                            $scope.Select();
                        }
                        CommonFunctions.InsertLog(0, data.data.Rows[0].Identity, 1, 'Insert Outstanding');
                    });
                });
            });
        }
    };

    $scope.ViewPartialDetails = function (ID) {
        $scope.ObjectJournalMovement = {};
        $scope.ObjectJournalMovement.JournalMovementID = ID;
        $http.post('Handler.ashx?action=SelectOutstandingPartial', $scope.ObjectJournalMovement).then(function (data) {
            $scope.Partial = data.data.Rows;
        });
        $('#PartialModel').modal("show");
    };

});