(function () {
	'use strict';

	const spawn = require ('child_process').spawn,
		path = require ('path'),
		helpers = require ('yeoman-test'),
		temp = require ('temp'),
		testDir = 'oldschool_test',
		prompts = {
			cfgName: 'test-app',
			cfgDescription: 'test-description',
			cfgHomepage: 'test-homepage',
			cfgBugs: 'test-issues',
			cfgLicense: 'MIT',
			cfgContribName: 'test-name',
			cfgContribEmail: 'test-email',
			cfgContribUrl: 'test-url',
			cfgRepository: 'test-repository',
			cfgFramework: 'AngularJS'
		};


	function create () {
		return new Promise ((resolve, reject) => {
			console.info ('Creating test directory');
			temp.mkdir (testDir, (e, dir) => {
				if (e) {
					reject (e);
				} else {
					console.info (`Test directory created: ${ dir }`);
					process.chdir (dir);

					console.info ('Generating app');
					helpers.run (path.join ( __dirname, '../../app')).withPrompts (prompts).inDir (dir).on ('end', () => {
						var p;

						console.info ('Running npm install');
						p = spawn ('npm', [ 'install' ]).on ('close', (code) => {
							if (code) {
								reject (`failed to install npm modules: ${ code }`);
							} else {
								console.info ('Running bower install');
								p = spawn ('bower', [ 'install' ]).on ('close', (code) => {
									if (code) {
										reject (`failed to install bower modules: ${ code }`);
									} else {
										console.info ('Running gulp ci');
										p = spawn ('gulp', [ 'ci', 'build' ]).on ('close', (code) => {
											if (code) {
												reject (`gulp failed: ${ code }`);
											} else {
												resolve ();
											}
										});
										p.stdout.pipe (process.stdout);
										p.stderr.pipe (process.stderr);
									}
								});
								p.stdout.pipe (process.stdout);
								p.stderr.pipe (process.stderr);
							}
						});
						p.stdout.pipe (process.stdout);
						p.stderr.pipe (process.stderr);
					}).on ('error', (e) => {
						reject ('failed to generate: ' + e);
					});
				}
			});
		});
	}

	temp.track ();
	create ().then (() => {
		process.exit (0);
	}, (e) => {
		console.error (e);
		process.exit (1);
	});
} ());
