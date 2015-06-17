module = angular.module('connexionApp',[]);
module.controller('ConnexionUserController',function($scope,$http){
	$scope.connexion=function(){
	
	$http.post('/connexion',$scope.user)
			.success (function(data){
					if(data=='Email invalide'){
						alert(data+" - email n'existe pas");

					}else {
						if(data[0].password==$scope.user.password)
						alert('OK');
						else 
						alert('Worst password');

					}
			})
			.error(function(data, status) {
				alert('Repos error'+status+' - '+data);
			});	
	}	
	$scope.reset=function(){
		$scope.user={email:'',password:''};
	}
	
});
