'use strict';

let { log } = require('./code/utils.js');

const path = require('path');

module.exports = (pluginContext) => {
	const app    = pluginContext.app;
	const logger = pluginContext.logger;
//	const prefs  = pluginContext.preferences.get();
	const shell  = pluginContext.shell;

	let patterns, providers;

	/**
	 * Called when the plugin is first loaded
	 */
	function startup() {
		//noinspection JSUnresolvedFunction
		require('./code/Loader.js')(pluginContext, __dirname)
			.then((data) => {
				patterns = data.patterns;
				providers = data.providers;
			});
	}

	/**
	 * @param {string} query
	 * @param res
	 */
	function search(query, res) {
		for(let objPattern of patterns) {
			if(objPattern.matches(query)) {
				res.add({
					id     : objPattern.cmd,
					title  : objPattern.title,
					desc   : objPattern.desc,
					icon   : objPattern.icon,
//					payload: { pattern, cmd, title, desc, icon, re },
					group  : 'PSL'
				});
			}
		}
	}

	/**
	 * Executes the given cmd that was accepted by the user
	 *
	 * @param {string} cmd
	 * @param {*} payload
	 */
	function execute(cmd, payload) {
		shell.openItem(cmd);
	}

	function renderPreview(id, payload, render) {
//		render('<html><body>Something</body></html>');
	}

	return { startup, search, execute, renderPreview };
};
