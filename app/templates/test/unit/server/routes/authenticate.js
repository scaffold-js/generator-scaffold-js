'use strict';

const chai = require ('chai'),
	expect = chai.expect,
	dirtyChai = require ('dirty-chai'),
	chaiAsPromised = require ('chai-as-promised'),
	sinon = require ('sinon'),
	hapi = require ('hapi'),
	mocks = require ('../../helpers/mocks'),
	mockery = require ('mockery'),
	creds = require ('../../helpers/creds'),
	failed = require ('../../helpers/authFailed');

chai.use (chaiAsPromised);
chai.use (dirtyChai);

describe ('authentication route', () => {
	var server,
		users = {
			findOne: () => Promise.resolve (true),
			updateOne: () => Promise.resolve (true),
			insertOne: () => 'test'
		},
		jwt = {
			sign () {
			},
			verify (token, key, options, callback) {
				callback (false, {
					_id: 'id'
				});
			}
		},
		sandbox = sinon.sandbox.create ();

	before (() => {
		mocks.mongo ({ users });
		mockery.registerMock ('jsonwebtoken', jwt);
	});

	beforeEach (() => {
		server = new hapi.Server ();
		server.connection ();
		return expect (server.register ([ require ('hapi-mongodb'), require ('vision'), require ('hapi-accept-language'), failed ]).then (() => {
			server.method ('audit', () => {});
			server.auth.strategy ('jwt', 'failed');<% if (socialLogins.length) { for (var i = 0; i < socialLogins.length; i++) { %>
			server.auth.strategy ('<%= socialLogins [i].name %>', 'failed');<% }} %>
			server.route (require ('../../../../src/server/routes/authenticate'));
		})).to.be.fulfilled ();
	});

	afterEach (() => {
		sandbox.restore ();
	});

	after (() => {
		mocks.disable ();
	});

	describe ('internal', () => {
		it ('should authenticate valid user', done => {
			server.inject ({ method: 'POST', url: '/authenticate', payload: { username: 'admin', password: 'admin' }, credentials: creds.user }).then (response => {
				try {
					expect (response.statusCode).to.equal (200);
					done ();
				} catch (err) {
					done (err);
				}
			});
		});

		it ('should authenticate valid user with remember', done => {
			server.inject ({ method: 'POST', url: '/authenticate', payload: { username: 'admin', password: 'admin', rememberMe: true }, credentials: creds.user }).then (response => {
				try {
					expect (response.statusCode).to.equal (200);
					done ();
				} catch (err) {
					done (err);
				}
			});
		});

		describe ('forgot replace', () => {
			it ('should update password', done => {
				server.inject ({ method: 'POST', url: '/authenticate/forgot', payload: { token: 'token', password: 'ABcd02$$' } }).then (response => {
					try {
						expect (response.statusCode).to.equal (200);
						done ();
					} catch (err) {
						done (err);
					}
				});
			});

			it ('should handle invalid token', done => {
				sandbox.stub (jwt, 'verify', (token, key, options, callback) => {
					callback (true);
				});

				server.inject ({ method: 'POST', url: '/authenticate/forgot', payload: { token: 'token', password: 'ABcd02$$' } }).then (response => {
					try {
						expect (response.statusCode).to.equal (401);
						done ();
					} catch (err) {
						done (err);
					}
				});
			});

			it ('should handle update failure', done => {
				sandbox.stub (users, 'updateOne', () => Promise.reject ());

				server.inject ({ method: 'POST', url: '/authenticate/forgot', payload: { token: 'token', password: 'ABcd02$$' } }).then (response => {
					try {
						expect (response.statusCode).to.equal (401);
						done ();
					} catch (err) {
						done (err);
					}
				});
			});
		});

		describe ('forgot email', () => {
			it ('should send forgot password email', done => {
				server.plugins ['hapi-mailer'] = {
					send: (options, callback) => {
						callback ();
					}
				};

				server.inject ({ method: 'POST', url: '/authenticate/forgot', payload: { email: 'user@localhost' }, headers: { 'Accept-Language': 'en' } }).then (response => {
					try {
						expect (response.statusCode).to.equal (200);
						done ();
					} catch (err) {
						done (err);
					}
				});
			});

			it ('should ignore forgot password if email fails', done => {
				server.plugins ['hapi-mailer'] = {
					send: (options, callback) => {
						callback ('err');
					}
				};

				server.inject ({ method: 'POST', url: '/authenticate/forgot', payload: { email: 'user@localhost' }, headers: { 'Accept-Language': 'es' } }).then (response => {
					try {
						expect (response.statusCode).to.equal (200);
						done ();
					} catch (err) {
						done (err);
					}
				});
			});

			it ('should ignore forgot password if no user', done => {
				sandbox.stub (users, 'findOne', () => Promise.resolve (null));

				server.inject ({ method: 'POST', url: '/authenticate/forgot', payload: { email: 'user@localhost' } }).then (response => {
					try {
						expect (response.statusCode).to.equal (200);
						done ();
					} catch (err) {
						done (err);
					}
				});
			});

			it ('should ignore forgot password on db error', done => {
				sandbox.stub (users, 'findOne', () => Promise.reject ('err'));

				server.inject ({ method: 'POST', url: '/authenticate/forgot', payload: { email: 'user@localhost' } }).then (response => {
					try {
						expect (response.statusCode).to.equal (200);
						done ();
					} catch (err) {
						done (err);
					}
				});
			});
		});

		it ('should refresh token', done => {
			server.inject ({ method: 'GET', url: '/authenticate', credentials: { _id: '1' } }).then (response => {
				try {
					expect (response.statusCode).to.equal (200);
					done ();
				} catch (err) {
					done (err);
				}
			});
		});

		it ('should refresh token with remember', done => {
			server.inject ({ method: 'GET', url: '/authenticate', credentials: { _id: '1', remember: true } }).then (response => {
				try {
					expect (response.statusCode).to.equal (200);
					done ();
				} catch (err) {
					done (err);
				}
			});
		});

		it ('should fail to authenticate invalid user', done => {
			sandbox.stub (users, 'findOne', () => Promise.resolve (null));

			server.inject ({ method: 'POST', url: '/authenticate', payload: { username: 'fake', password: 'fake' }, credentials: creds.user }).then (response => {
				try {
					expect (response.statusCode).to.equal (401);
					done ();
				} catch (err) {
					done (err);
				}
			});
		});

		it ('should fail to authenticate on db error', done => {
			sandbox.stub (users, 'findOne', () => Promise.reject ('err'));

			server.inject ({ method: 'POST', url: '/authenticate', payload: { username: 'fake', password: 'fake' }, credentials: creds.user }).then (response => {
				try {
					expect (response.statusCode).to.equal (401);
					done ();
				} catch (err) {
					done (err);
				}
			});
		});
	});<% if (socialLogins.length) { %>

	describe ('social', () => {<% for (var i = 0; i < socialLogins.length; i++) { %>
		describe ('<%= socialLogins [i].name %>', () => {
			it ('should authenticate <%= socialLogins [i].name %> user', done => {
				sandbox.stub (users, 'findOne', () => Promise.resolve (null));

				server.views ({
					engines: {
						html: require ('handlebars')
					},
					relativeTo: __dirname,
					path: '../../../../src/server/views'
				});

				server.inject ({ method: 'GET', url: '/authenticate/<%= socialLogins [i].name %>', credentials: creds.user }).then (response => {
					try {
						expect (response.statusCode).to.equal (200);
						done ();
					} catch (e) {
						done (e);
					}
				}).catch (e => {
					done (e);
				});
			});

			it ('should reauthenticate <%= socialLogins [i].name %> user', done => {
				server.views ({
					engines: {
						html: require ('handlebars')
					},
					relativeTo: __dirname,
					path: '../../../../src/server/views'
				});
				server.inject ({ method: 'GET', url: '/authenticate/<%= socialLogins [i].name %>', credentials: creds.user }).then (response => {
					try {
						expect (response.statusCode).to.equal (200);
						done ();
					} catch (e) {
						done (e);
					}
				}).catch (e => {
					done (e);
				});
			});

			it ('should fail to authenticate <%= socialLogins [i].name %> user', done => {
				server.inject ({ method: 'GET', url: '/authenticate/<%= socialLogins [i].name %>' }).then (response => {
					try {
						expect (response.statusCode).to.equal (401);
						done ();
					} catch (e) {
						done (e);
					}
				}).catch (e => {
					done (e);
				});
			});

			it ('should handle view failure', done => {
				server.inject ({ method: 'GET', url: '/authenticate/<%= socialLogins [i].name %>', credentials: creds.user }).then (response => {
					try {
						expect (response.statusCode).to.equal (401);
						done ();
					} catch (e) {
						done (e);
					}
				}).catch (e => {
					done (e);
				});
			});
		});<% if (i !== socialLogins.length - 1) { %>
<% } %><% } %>
	});<% } %>
});
