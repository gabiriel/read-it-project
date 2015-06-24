var app = angular.module('readIt');
app.controller('UserForgotPasswordController',['$scope','$location','serviceDetails',function($scope,$location,$serviceDetails){
	$scope.forgot = function(){
		var userDetails= {
			mail : $scope.email
		};
	
		$serviceDetails.forgot(userDetails).success (function(data){
			if (data === "OK") {
				$location.path("/");
				$scope.error = false;
			} else {
				$location.path("/forgotpassword");
				$scope.erreur=data;
				$scope.error = true;
			}
		})
		.error(function(data, status) {
			alert('Repos error'+status+' - '+data);
		});
	};

	$scope.reset = function(){
		$scope={email:''};
	};
	
}]);
