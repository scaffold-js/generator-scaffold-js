(function () {
	'use strict';

	angular.module ('<%= appSlug %>').component ('register', {
		templateUrl: 'app/components/register/register.view.html',
		controller: function ($scope, $state, accountFactory) {
			angular.extend ($scope, {
				disable: false,

				register: function (event) {
					$scope.disable = true;
					event.preventDefault ();
					accountFactory.create ({
						username: $scope.username,
						password: $scope.password,
						fullName: $scope.fullName,
						nickname: $scope.nickname,
						email: $scope.email
					}).then (function () {
						$scope.disable = false;
						$scope.registrationError = false;
						$state.go ('login');
					}).catch (function () {
						$scope.disable = false;
						$scope.registrationError = true;
					}); 
				}
			});
		}
	}).config (function ($stateProvider) {
		$stateProvider.state ('register', {
			url: '/register',
			template: '<register></register>',
			data: {
				allowed: function (authFactory) {
					return !authFactory.authenticated;
				}
			}
		});
	});
} ());
