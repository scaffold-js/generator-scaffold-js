(function () {
	'use strict';

	const os = require ('os'),
		metricsModel = require ('../models/metrics');

	module.exports = [{
		method: 'GET',
		path: '/metrics',
		config: {
			auth: {
				strategy: 'jwt',
				scope: [ 'ROLE_ADMIN' ]
			},
			description: 'Retrieve System Metrics',
			notes: 'Retrieves the system metrics for the operating system, process, web sever and database.',
			tags: [ 'api', 'metrics' ],
			plugins: {
				'hapi-swaggered': {
					responses: {
						200: {
							description: 'Success',
							schema: metricsModel.metrics
						},
						403: { description: 'Forbidden' },
						500: { description: 'Internal Server Error' }
					}
				}
			},
			handler: (request, reply) => {
				var interfaces = [],
					osLoad = os.loadavg (),
					osNetworkInterfaces = os.networkInterfaces ();
					
				request.server.methods.audit ('access', { id: request.auth.credentials._id, username: request.auth.credentials.username}, 'success', 'metrics', {});

				for (let name in osNetworkInterfaces) {
					/* istanbul ignore else: else on hasOwnProperty is untestable */
					if (osNetworkInterfaces.hasOwnProperty (name)) {
						interfaces.push ({
							name: name,
							addresses: osNetworkInterfaces [name]
						});
					}
				}

				reply ({
					os: {
						arch: os.arch (),
						cpus: os.cpus (),
						memory: {
							free: os.freemem (),
							total: os.totalmem ()
						},
						hostname: os.hostname (),
						load: {
							'1': osLoad [0],
							'5': osLoad [1],
							'15': osLoad [2]
						},
						networkInterfaces: interfaces,
						platform: os.platform (),
						release: os.release (),
						tempdir: os.tmpdir (),
						uptime: os.uptime()
					}
				});
			}
		}
	}];
} ());
