(function () {
	'use strict';

	beforeEach (module ('<%= appSlug %>'));

	beforeEach (function () {
		inject (function ($rootScope, $state, $compile, $httpBackend, $templateCache) {
			this.$rootScope = $rootScope;
			this.$state = $state;
			this.$compile = $compile;
			this.$httpBackend = $httpBackend;
			this.$templateCache = $templateCache;

			$httpBackend.whenGET (/assets\/locale\/locale-.*\.json/).respond (200, {});
		});
	});

	describe ('app.module', function () {
		it ('should default to home state', function () {
			window.location = window.location + '#/invalid_locaiton';
			this.$rootScope.$digest ();
			expect (this.$state.current.name).toBe ('home');
		});
	});
} ());