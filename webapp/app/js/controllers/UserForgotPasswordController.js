var app = angular.module('readIt');
app.controller('UserForgotPasswordController',['$scope','$location','serviceDetails','$state',function($scope,$location,$serviceDetails,$state){
	$scope.forgot = function(){
		var userDetails= {
			mail : $scope.email
		};
	
		$serviceDetails.forgot(userDetails)
			.success (function(data){
			$state.go('home');
		})
		.error(function(err) {
			$scope.error=err;
		});
	};

	$scope.reset = function(){
		$scope={email:''};
	};
	
}]);
