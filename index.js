'use strict';

let { log } = require('./code/utils.js');

const path = require('path');

function ExpandEnvVars(cmd) {
	for(const name in process.env)
		cmd = cmd.replace(`\$${name}}`, process.env[name]);
	return cmd;
}

module.exports = (pluginContext) => {
	const app    = pluginContext.app;
	const logger = pluginContext.logger;
//	const prefs  = pluginContext.preferences.get();
	const shell  = pluginContext.shell;

	let patterns, providers;

	function startup() {
		//noinspection JSUnresolvedFunction
		require('./code/Loader.js')(pluginContext, __dirname)
			.then((data) => {
				patterns = data.patterns;
				providers = data.providers;
			});
	}

	function search(query, res) {
		//noinspection JSCheckFunctionSignatures
		patterns.map((params, idx, patterns) => {
			let { pattern, cmd, title, desc, icon, re } = params;

			if(!re) {
//				logger.log(`Created RegExp for ${pattern}`);
				re = new RegExp(pattern, 'i');
				patterns[idx].re = re;
			}
			if(re.test(query)) {
				cmd = query.replace(re, ExpandEnvVars(cmd));
				title = query.replace(re, ExpandEnvVars(title));
				desc = query.replace(re, ExpandEnvVars(desc));

//				logger.log(`${query} matched for /${pattern}/i, result: '${cmd}'`);

				res.add({
					id: cmd,
					title: title,
					desc: desc,
					icon: icon,
					payload: { pattern, cmd, title, desc, icon, re },
					group: 'PSL'
				});
			} else {
//				logger.log(`${query} FAILED TO MATCH for /${pattern}/i`);
			}
		});
	}

	function execute(id, payload) {
		shell.openItem(id);
	}

	function renderPreview(id, payload, render) {
//		render('<html><body>Something</body></html>');
	}

	return { startup, search, execute, renderPreview };
};
