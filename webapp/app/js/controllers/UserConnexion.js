var app = angular.module('readIt');
app.controller('ConnexionUserController',['$scope','$location','serviceDetails',function($scope,$location,$serviceDetails){
	$scope.connexion=function(){
		var userDetails= {
			mail : $scope.user.email,
			password : $scope.user.password
		};
	
	$serviceDetails.login(userDetails)
			.success (function(data){
		if (data === "OK") {

			$location.path("/");
			$scope.error = false;
		} else {
			$location.path("/login");
			$scope.erreur=data;
			$scope.error = true;
		}
			})
			.error(function(data, status) {
				alert('Repos error'+status+' - '+data);
			});	
	}	
	$scope.reset=function(){
		$scope.user={email:'',password:''};
	}
	
}]);
