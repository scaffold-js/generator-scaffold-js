(function () {
	'use strict';

	angular.module ('<%= appSlug %>', [
		'ngAria',
		'ngCookies',
		'pascalprecht.translate',
		'ui.router'
	]).config (function ($urlRouterProvider) {
		$urlRouterProvider.otherwise ('/');
	}).config (function ($translateProvider) {
		$translateProvider.useLocalStorage ();
		$translateProvider.useStaticFilesLoader ({
			prefix: 'assets/locale/locale-',
			suffix: '.json'
		}).preferredLanguage ('en');
	});
} ());
