(function accountFactoryTests () {
	'use strict';

	describe ('account factory', function () {
		beforeEach (function beforeEach () {
			inject (function inject (accountFactory) {
				this.accountFactory = accountFactory;
			});
		});

		describe ('test', function test () {
			it ('should indicate available', function indicateAvailable () {
				this.$httpBackend.expectGET ('account/?username=test').respond (404);
				this.accountFactory.available ('test');
				this.$httpBackend.flush ();
			});

			it ('should indicate unavailable', function indicateUnavalable () {
				this.$httpBackend.expectGET ('account/?email=test').respond (200);
				this.accountFactory.available (null, 'test');
				this.$httpBackend.flush ();
			});
		});

		it ('should create account', function createAccount () {
			this.$httpBackend.expectPOST ('account/').respond (200);
			this.accountFactory.create ({});
			this.$httpBackend.flush ();
		});

		it ('should load account', function createAccount () {
			this.$httpBackend.expectGET ('account/test').respond (200, this.account);
			this.accountFactory.get ('test');
			this.$httpBackend.flush ();
			expect (this.accountFactory.user.username).toBe ('test');
		});

		it ('should redirect if no email', function createAccount () {
			var account = Object.assign ({}, this.account);

			this.authenticate (200);
			Reflect.deleteProperty (account, 'email');
			this.$httpBackend.expectGET ('account/test').respond (200, account);
			this.accountFactory.get ('test');
			this.$httpBackend.flush ();
			this.$rootScope.$digest ();
			expect (this.$state.current.name).toBe ('account');
		});

		describe ('query', function test () {
			it ('should search accounts', function createAccount () {
				this.$httpBackend.expectGET ('account/?username=test').respond (200, [ this.account ]);
				this.accountFactory.query ({
					username: 'test'
				});
				this.$httpBackend.flush ();
			});
		});

		describe ('update', function test () {
			it ('should update account', function createAccount () {
				this.$httpBackend.expectGET ('account/test').respond (200, this.account);
				this.accountFactory.get ('test');
				this.$httpBackend.flush ();
				this.$httpBackend.expectPOST ('account/test').respond (200, this.account);
				this.accountFactory.user.$update ();
				this.$httpBackend.flush ();
			});

			it ('should update account password', function createAccount () {
				this.$httpBackend.expectGET ('account/test').respond (200, this.account);
				this.accountFactory.get ('test');
				this.$httpBackend.flush ();
				this.$httpBackend.expectPOST ('account/test').respond (200, this.account);
				this.accountFactory.user.password = 'test';
				this.accountFactory.user.$update ();
				this.$httpBackend.flush ();
			});
		});

		describe ('revalidate', function test () {
			it ('should send new validation email', function revalidate () {
				this.$httpBackend.expectPOST ('account/validate').respond (200);
				this.accountFactory.resendValidation ();
				this.$httpBackend.flush ();
			});
		});
	});
} ());

