app.controller("LookupTypeCtrl", function ($scope, $http, CommonFunctions) {
    $scope.Object = {};
    $scope.ObjectSearch = {};
    $scope.PageNumber = 1;
    $scope.AddEditFlag = 1;
    $scope.CurrentPage = 1;
    $scope.PageSize = vPageSizeGlobal;

    $scope.List = [];

    $scope.Select = function (pageNumber) {
        if ($scope.ObjectSearch.IsDeleted == null)
            $scope.ObjectSearch.IsDeleted = 0;

        if (pageNumber != null)
            $scope.CurrentPage = pageNumber;
        $http.post('Handler.ashx?action=SelectLookupType' +
            '&PageNumber=' +
            $scope.CurrentPage +
            '&PageSize=' +
            vPageSizeGlobal,
            $scope.ObjectSearch).then(
            function (data) {
                $scope.List = [];
                if (data.data.Rows.length != 0) {
                    $scope.List = data.data.Rows;
                    $scope.totalItems = data.data.Rows[0].TotalRows.toString();
                    $scope.totalPages = (Math.ceil(data.data.Rows[0].TotalRows / vPageSizeGlobal)).toString();
                }
            });
    };

    $scope.Delete = function (id) {
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover it again!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                $http.get('Handler.ashx?action=DeleteLookupType&ID=' + id).then(function (data) {

                    swal("Done! Your select has been deleted", {
                        icon: "success",
                    });
                    CommonFunctions.InsertLog(2, id, 9, 'Delete Lookup Type');
                    $scope.Select();
                });
            } else {
                swal("Your select still exist");
            }
        });
    };

    $scope.Update = function (id) {
        $scope.Object = {};
        $scope.Object.ID = id;
        $scope.AddEditFlag = 2;
        $http.post('Handler.ashx?action=SelectLookupType' + '&PageNumber=1' + '&PageSize=1', $scope.Object).then(
            function (data) {
                $scope.Object = data.data.Rows[0];
            });
    };

    $scope.Reset = function (id) {
        $scope.Object = {};
        $scope.AddEditFlag = 1;
        $scope.FormMain.$setPristine();
        $scope.FormMain.$setUntouched();
    };

    $scope.Submit = function () {
        $scope.FormMain.$setSubmitted();
        if ($scope.FormMain.$valid) {
            var vService;
            var vAction;
            var vID = 0;
            if ($scope.AddEditFlag == 1) {
                vService = 'Insert';
                vAction = 0;
            }
            else {
                vService = 'Update';
                vAction = 1;
                vID = $scope.Object.ID;
            }
            $http.post('Handler.ashx?action=' + vService + 'LookupType', $scope.Object).then(function (data) {
                $scope.Object = {};
                $scope.AddEditFlag = 1;
                $scope.Select();
                $scope.FormMain.$setPristine();
                $scope.FormMain.$setUntouched();
                if (vID == 0)
                    vID = data.data.Rows[0].Identity;
                CommonFunctions.InsertLog(vAction, vID, 9, vService + ' Lookup Type');
            });
        }
    };

    $scope.Select();
});

app.controller("LookupCtrl", function ($scope, $http, CommonFunctions) {
    $scope.Object = {};
    $scope.ObjectSearch = {};
    $scope.PageNumber = 1;
    $scope.AddEditFlag = 1;
    $scope.CurrentPage = 1;
    $scope.PageSize = vPageSizeGlobal;
    $scope.List = [];

    $scope.Select = function (pageNumber) {
        if ($scope.ObjectSearch.IsDeleted == null)
            $scope.ObjectSearch.IsDeleted = 0;

        if ($scope.ObjectSearch.LookupType != null)
            $scope.ObjectSearch.LookupTypeID = $scope.ObjectSearch.LookupType.ID;

        if (pageNumber != null)
            $scope.CurrentPage = pageNumber;
        $http.post('Handler.ashx?action=SelectLookup' +
            '&PageNumber=' +
            $scope.CurrentPage +
            '&PageSize=' +
            vPageSizeGlobal,
            $scope.ObjectSearch).then(
            function (data) {
                $scope.List = [];
                if (data.data.Rows.length != 0) {
                    $scope.List = data.data.Rows;
                    $scope.totalItems = data.data.Rows[0].TotalRows.toString();
                    $scope.totalPages = (Math.ceil(data.data.Rows[0].TotalRows / vPageSizeGlobal)).toString();
                }
            });
    };

    $scope.Delete = function (id) {
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover it again!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                $http.get('Handler.ashx?action=DeleteLookup&ID=' + id).then(function (data) {

                    swal("Done! Your select has been deleted", {
                        icon: "success",
                    });
                    CommonFunctions.InsertLog(2, id, 6, 'Delete Lookup');
                    $scope.Select();
                });
            } else {
                swal("Your select still exist");
            }
        });
    };

    $scope.Update = function (id) {
        $scope.Object = {};
        $scope.Object.ID = id;
        $scope.AddEditFlag = 2;
        $http.post('Handler.ashx?action=SelectLookup' + '&PageNumber=1' + '&PageSize=1', $scope.Object).then(
            function (data) {
                $scope.Object = data.data.Rows[0];
                var index = $scope.LookupTypes.findIndex(x => x.ID == $scope.Object.LookupTypeID);
                $scope.Object.LookupType = $scope.LookupTypes[index];
            });
    };

    $scope.Reset = function (id) {
        $scope.Object = {};
        $scope.AddEditFlag = 1;
        $scope.FormMain.$setPristine();
        $scope.FormMain.$setUntouched();
    };

    $scope.Submit = function () {
        $scope.FormMain.$setSubmitted();
        if ($scope.FormMain.$valid) {
            var vService;
            var vAction;
            var vID = 0;
            if ($scope.AddEditFlag == 1) {
                vService = 'Insert';
                vAction = 0;
            }
            else {
                vService = 'Update';
                vAction = 1;
                vID = $scope.Object.ID;
            }
            $scope.Object.LookupTypeID = $scope.Object.LookupType.ID;
            $http.post('Handler.ashx?action=' + vService + 'Lookup', $scope.Object).then(function (data) {
                $scope.Object = {};
                $scope.AddEditFlag = 1;
                $scope.Select();
                $scope.FormMain.$setPristine();
                $scope.FormMain.$setUntouched();
                if (vID == 0)
                    vID = data.data.Rows[0].Identity;
                CommonFunctions.InsertLog(vAction, vID, 6, vService + ' Lookup');
            });
        }
    };

    $scope.ObjectLookupType = {};
    $scope.ObjectLookupType.IsDeleted = false;
    $http.post('Handler.ashx?action=SelectLookupType&PageNumber=1&PageSize=' + vTotalSizeGlobal, $scope.ObjectLookupType).then(function (data) {
        $scope.LookupTypes = data.data.Rows;
        $scope.Object.LookupTypeID = $scope.LookupTypes[0].ID;
        $scope.ObjectSearch.LookupTypeID = $scope.LookupTypes[0].ID;
        $scope.Select();
    });
});

app.controller("StaffCtrl", function ($scope, $http, $route, CommonFunctions) {
    $scope.Object = {};
    $scope.Object.UserPagesList = [];
    $scope.Object.UserPermissionsList = [];
    $scope.ObjectSearch = {};
    $scope.PageNumber = 1;
    $scope.AddEditFlag = 1;
    $scope.CurrentPage = 1;
    $scope.PageSize = vPageSizeGlobal;

    $scope.List = [];

    $scope.Select = function (pageNumber) {
        if ($scope.ObjectSearch.IsDeleted == null)
            $scope.ObjectSearch.IsDeleted = 0;

        if (pageNumber != null)
            $scope.CurrentPage = pageNumber;
        $http.post('Handler.ashx?action=SelectStaff' +
            '&PageNumber=' +
            $scope.CurrentPage +
            '&PageSize=' +
            vPageSizeGlobal,
            $scope.ObjectSearch).then(
            function (data) {
                $scope.List = [];
                if (data.data.Rows.length != 0) {
                    $scope.List = data.data.Rows;
                    $scope.totalItems = data.data.Rows[0].TotalRows.toString();
                    $scope.totalPages = (Math.ceil(data.data.Rows[0].TotalRows / vPageSizeGlobal)).toString();
                }
            });
    };

    $scope.Delete = function (id) {
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover it again!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                $http.get('Handler.ashx?action=DeleteStaff&ID=' + id).then(function (data) {

                    swal("Done! Your select has been deleted", {
                        icon: "success",
                    });
                    CommonFunctions.InsertLog(2, id, 7, 'Delete Staff');
                    $scope.Select();
                });
            } else {
                swal("Your select still exist");
            }
        });
    };

    $scope.Update = function (id) {
        $scope.Object = {};
        $scope.Object.ID = id;
        $scope.AddEditFlag = 2;
        $http.post('Handler.ashx?action=SelectStaff' + '&PageNumber=1' + '&PageSize=1', $scope.Object).then(
            function (data) {
                $scope.Object = data.data.Rows[0];
                if ($scope.Object.UserPages != null)
                    $scope.Object.UserPagesList = JSON.parse("[" + $scope.Object.UserPages + "]");
                else
                    $scope.Object.UserPagesList = [];
                if ($scope.Object.UserPermissions != null)
                    $scope.Object.UserPermissionsList = JSON.parse("[" + $scope.Object.UserPermissions + "]");
                else
                    $scope.Object.UserPermissionsList = [];

                var index = $scope.Branchs.findIndex(x => x.ID == $scope.Object.BranchID);
                $scope.Object.Branch = $scope.Branchs[index];

                var roleIndex = $scope.Roles.findIndex(x => x.ID == $scope.Object.RoleID);
                $scope.Object.Role = $scope.Roles[roleIndex];
            });
    };

    $scope.Submit = function () {
        debugger;
        $scope.FormMain.$setSubmitted();
        if ($scope.FormMain.$valid) {
            var vService;
            var vAction;
            var vID = 0;
            if ($scope.AddEditFlag == 1) {
                vService = 'Insert';
                vAction = 0;
            }
            else {
                vService = 'Update';
                vAction = 1;
                vID = $scope.Object.ID;
            }
            if ($scope.Object.Branch != null)
                $scope.Object.BranchID = $scope.Object.Branch.ID;

            if ($scope.Object.Role != null)
                $scope.Object.RoleID = $scope.Object.Role.ID;


            $http.post('Handler.ashx?action=' + vService + 'Staff', $scope.Object).then(function (data) {
                if (vID == 0)
                    vID = data.data.Rows[0].Identity;
                CommonFunctions.InsertLog(vAction, vID, 7, vService + ' Staff');
                $route.reload();
            });
        }
    };

    $scope.AddRemovePages = function (id) {
        if ($scope.Object.UserPagesList.indexOf(id) > -1)
            $scope.Object.UserPagesList.splice($scope.Object.UserPagesList.indexOf(id), 1);
        else
            $scope.Object.UserPagesList.push(id);
    };

    $scope.AddRemovePermissions = function (id) {
        if ($scope.Object.UserPermissionsList.indexOf(id) > -1)
            $scope.Object.UserPermissionsList.splice($scope.Object.UserPermissionsList.indexOf(id), 1);
        else
            $scope.Object.UserPermissionsList.push(id);
    };

    $scope.ObjectBranchs = {};
    $scope.ObjectBranchs.IsDeleted = false;
    $http.post('Handler.ashx?action=SelectBranch&PageNumber=1&PageSize=' + vTotalSizeGlobal, $scope.ObjectBranchs).then(function (data) {
        $scope.Branchs = data.data.Rows;
        $scope.Object.BranchID = $scope.Branchs[0].ID;

        $scope.ObjectRoles = {};
        $scope.ObjectRoles.IsDeleted = false;
        $scope.ObjectRoles.LookupTypeID = 5;
        $http.post('Handler.ashx?action=SelectLookup&PageNumber=1&PageSize=' + vTotalSizeGlobal,
            $scope.ObjectRoles).then(function (data) {
                $scope.Roles = data.data.Rows;
                $scope.Object.RoleID = $scope.Roles[0].ID;

                $scope.ObjectPages = {};
                $scope.ObjectPages.IsDeleted = false;
                $scope.ObjectPages.LookupTypeID = 43;
                $http.post('Handler.ashx?action=SelectLookup&PageNumber=1&PageSize=' + vTotalSizeGlobal,
                    $scope.ObjectPages).then(function (data) {
                        $scope.Pages = data.data.Rows;

                        $scope.ObjectPermissions = {};
                        $scope.ObjectPermissions.IsDeleted = false;
                        $scope.ObjectPermissions.LookupTypeID = 44;
                        $http.post('Handler.ashx?action=SelectLookup&PageNumber=1&PageSize=' + vTotalSizeGlobal,
                            $scope.ObjectPermissions).then(function (data) {
                                $scope.Permissions = data.data.Rows;
                                $scope.Select();
                            });
                    });
            });
    });
});

app.controller("AccountsCtrl", function ($scope, $http, CommonFunctions) {
    $scope.Object = {};
    $scope.ObjectSearch = {};
    $scope.PageNumber = 1;
    $scope.AddEditFlag = 1;
    $scope.CurrentPage = 1;
    $scope.PageSize = vPageSizeGlobal;
    $scope.List = [];

    $scope.Select = function (pageNumber) {

        if ($scope.ObjectSearch.IsDeleted == null)
            $scope.ObjectSearch.IsDeleted = 0;


        if ($scope.ObjectSearch.Parent != null)
            $scope.ObjectSearch.ParentID = $scope.ObjectSearch.Parent.ID;

        if (pageNumber != null)
            $scope.CurrentPage = pageNumber;
        $http.post('Handler.ashx?action=SelectAccount' +
            '&PageNumber=' +
            $scope.CurrentPage +
            '&PageSize=' +
            vPageSizeGlobal,
            $scope.ObjectSearch).then(
            function (data) {
                $scope.List = [];
                if (data.data.Rows.length != 0) {
                    $scope.List = data.data.Rows;
                    $scope.totalItems = data.data.Rows[0].TotalRows.toString();
                    $scope.totalPages = (Math.ceil(data.data.Rows[0].TotalRows / vPageSizeGlobal)).toString();
                }
            });
    };

    $scope.Delete = function (id) {
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover it again!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                $http.get('Handler.ashx?action=DeleteAccount&ID=' + id).then(function (data) {

                    swal("Done! Your select has been deleted", {
                        icon: "success",
                    });
                    CommonFunctions.InsertLog(2, id, 8, 'Delete Account');
                    $scope.Select();
                });
            } else {
                swal("Your select still exist");
            }
        });
    };

    $scope.Update = function (id) {
        $scope.Object = {};
        $scope.Object.ID = id;
        $scope.AddEditFlag = 2;
        $http.post('Handler.ashx?action=SelectAccount' + '&PageNumber=1' + '&PageSize=1', $scope.Object).then(
            function (data) {
                $scope.Object = data.data.Rows[0];


                if ($scope.Object.AccountTypeID != null) {

                    var index = $scope.AccountTypes.findIndex(x => x.ID == $scope.Object.AccountTypeID);
                    $scope.Object.AccountType = $scope.AccountTypes[index];
                }

                if ($scope.Object.ParentID != null) {
                    var parentindex = $scope.MainAccounts.findIndex(x => x.ID == $scope.Object.ParentID);
                    $scope.Object.Parent = $scope.MainAccounts[parentindex];
                }

            });
    };

    $scope.Reset = function (id) {
        $scope.Object = {};
        $scope.Object.LookupTypeID = $scope.LookupTypes[0].ID;
        $scope.AddEditFlag = 1;
        $scope.FormMain.$setPristine();
        $scope.FormMain.$setUntouched();
    };

    $scope.Submit = function () {
        $scope.FormMain.$setSubmitted();
        if ($scope.FormMain.$valid) {
            var vService;
            var vAction;
            var vID = 0;
            if ($scope.AddEditFlag == 1) {
                vService = 'Insert';
                vAction = 0;
            }
            else {
                vService = 'Update';
                vAction = 1;
                vID = $scope.Object.ID;
            }
            if ($scope.Object.Parent != null)
                $scope.Object.ParentID = $scope.Object.Parent.ID;
            if ($scope.Object.AccountType != null)
                $scope.Object.AccountTypeID = $scope.Object.AccountType.ID;
            if ($scope.Object.Branch != null)
                $scope.Object.BranchID = $scope.Object.Branch.ID;
            $scope.Object.StaffID = JSON.parse(localStorage.getItem('LoggedIn')).ID;
            $http.post('Handler.ashx?action=' + vService + 'Account', $scope.Object).then(function (data) {
                $scope.Object = {};
                $scope.AddEditFlag = 1;
                $scope.Select();
                $scope.FormMain.$setPristine();
                $scope.FormMain.$setUntouched();
                if (vID == 0)
                    vID = data.data.Rows[0].Identity;
                CommonFunctions.InsertLog(vAction, vID, 8, vService + ' Account');
            });
        }
    };

    $scope.loadParentAccount = function (AccountType) {
        $scope.ParentList = null;
        $scope.Object.AccountNumber = '';
        $scope.ObjectAccounts = {};
        $scope.ObjectAccounts.IsDeleted = false;
        $scope.ObjectAccounts.AccountTypeID = (parseInt(AccountType.ID) - 1);
        $http.post('Handler.ashx?action=SelectAccount&PageNumber=1&PageSize=' + vTotalSizeGlobal,
            $scope.ObjectAccounts).then(function (data) {
                $scope.ParentList = data.data.Rows;
            });
    }

    $scope.SetAccountNumber = function (ID, ParentID, AccountNumber) {
        $scope.ObjectMainAccounts = {};
        $scope.ObjectMainAccounts.IsDeleted = false;
        $scope.ObjectMainAccounts.ParentID = ID;
        $http.post('Handler.ashx?action=SelectAccount&PageNumber=1&PageSize=600', $scope.ObjectMainAccounts).then(
               function (data) {
                   $scope.SubAccounts = data.data.Rows;
                   if ($scope.SubAccounts.length != 0) {
                       $scope.Object.AccountNumber = '';
                       $scope.ObjectMainAccounts = {};
                       $scope.ObjectMainAccounts.IsDeleted = false;
                       $scope.ObjectMainAccounts.ParentID = ID;
                       $scope.ObjectMainAccounts.Description = 'getMaxAccoutNumber';
                       $http.post('Handler.ashx?action=SelectAccount&PageNumber=1&PageSize=' + vTotalSizeGlobal,
                           $scope.ObjectMainAccounts).then(function (data) {
                               var numb = data.data.Rows[0].Column1.match(/\d/g);
                               numb = numb.join("");
                               var newnum = parseInt(numb) + 1;
                               newnum = newnum.pad(numb.length);
                               $scope.Object.AccountNumber = data.data.Rows[0].Column1.replace(numb, newnum)
                           });
                   }
                   else {
                       $scope.Object.AccountNumber = '';
                       $scope.ObjectMainAccounts = {};
                       $scope.ObjectMainAccounts.IsDeleted = false;
                       if (ParentID != null)
                           $scope.ObjectMainAccounts.ID = ParentID;
                       $scope.ObjectMainAccounts.ParentID = ParentID;
                       $scope.ObjectMainAccounts.Description = 'getMaxAccoutNumber';
                       $http.post('Handler.ashx?action=SelectAccount&PageNumber=1&PageSize=' + vTotalSizeGlobal,
                           $scope.ObjectMainAccounts).then(function (data) {
                               if (data.data.Rows[0].Column1 == null)
                                   $scope.Object.AccountNumber = parseInt(AccountNumber) + 1;
                               else
                                   $scope.Object.AccountNumber = parseInt(data.data.Rows[0].Column1) + 1;
                           });
                   }
               });
    }

    $http.post('Handler.ashx?action=SelectStaff&PageNumber=1&PageSize=' + vTotalSizeGlobal).then(function (data) {
        $scope.Staff = data.data.Rows;
        $scope.Object.StaffID = JSON.parse(localStorage.getItem('LoggedIn')).ID;

        $scope.ObjectAccountType = {};
        $scope.ObjectAccountType.IsDeleted = false;
        $scope.ObjectAccountType.LookupTypeID = 33;
        $http.post('Handler.ashx?action=SelectLookup&PageNumber=1&PageSize=' + vTotalSizeGlobal,
            $scope.ObjectAccountType).then(function (data) {
                $scope.AccountTypes = data.data.Rows;
                $scope.Object.AccountTypeID = data.data.Rows[0].ID;

                $scope.ObjectMainAccounts = {};
                $scope.ObjectMainAccounts.IsDeleted = false;
                $scope.ObjectMainAccounts.AccountTypeID = 47;
                $http.post('Handler.ashx?action=SelectAccount&PageNumber=1&PageSize=' + vTotalSizeGlobal,
                    $scope.ObjectMainAccounts).then(function (data) {
                        $scope.MainAccounts = data.data.Rows;

                        $http.post('Handler.ashx?action=SelectBranch&PageNumber=1&PageSize=' + vTotalSizeGlobal).then(function (data) {
                            $scope.Branchs = data.data.Rows;

                            $scope.Select();
                        });
                    });
            });
    });
});

app.controller("LogCtrl", function ($scope, $http, CommonFunctions) {

    $scope.ObjectSearch = {};
    $scope.PageNumber = 1;
    $scope.CurrentPage = 1;
    $scope.PageSize = 30;
    $scope.List = [];

    $scope.ObjectSearch.DateFrom = new Date(new Date().toLocaleDateString('sv-SE'));
    $scope.ObjectSearch.DateTo = new Date(new Date().toLocaleDateString('sv-SE'));

    $scope.Select = function (pageNumber) {

        if (pageNumber != null)
            $scope.CurrentPage = pageNumber;

        if ($scope.ObjectSearch.Staff != null)
            $scope.ObjectSearch.StaffID = $scope.ObjectSearch.Staff.ID;

        $http.post('Handler.ashx?action=SelectLog' +
            '&PageNumber=' +
            $scope.CurrentPage +
            '&PageSize=' +
            30,
            $scope.ObjectSearch).then(
            function (data) {
                $scope.List = [];
                if (data.data.Rows.length != 0) {
                    $scope.List = data.data.Rows;
                    $scope.totalItems = data.data.Rows[0].TotalRows.toString();
                    $scope.totalPages = (Math.ceil(data.data.Rows[0].TotalRows / vPageSizeGlobal)).toString();
                }
            });
    };

    //Intial
    $scope.ObjectStaffList = {};
    $scope.ObjectStaffList.IsDeleted = false;
    $http.post('Handler.ashx?action=SelectStaff&PageNumber=1&PageSize=' + vTotalSizeGlobal, $scope.ObjectStaffList).then(function (data) {
        $scope.StaffList = data.data.Rows;
        $scope.StaffList.unshift({ ID: null, Name: 'All' });

        $scope.Select();
    });
});