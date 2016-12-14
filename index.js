'use strict';

//noinspection JSUnusedLocalSymbols
let { log } = require('./code/utils.js');
const exec = require('child_process').exec;

module.exports = (pluginContext) => {
	//noinspection JSUnusedLocalSymbols
	const app    = pluginContext.app;
	//noinspection JSUnusedLocalSymbols
	const logger = pluginContext.logger;
//	const prefs  = pluginContext.preferences.get();
	const shell  = pluginContext.shell;

	/** @type PatternsMap */
	let Patterns = require('./code/Patterns.js')(pluginContext, __dirname);

	/**
	 * Called when the plugin is first loaded
	 */
	function startup() {
		require('./code/Loader.js')(pluginContext, __dirname);
	}

	/**
	 * @param {string} query
	 * @param res
	 */
	function search(query, res) {
		for(let objPattern of Patterns.values()) {
			for(let match of objPattern.matches(query)) {
				res.add({
					id     : match.cmd,
					title  : match.title,
					desc   : match.desc,
					icon   : match.icon,
					payload: { PatternID: objPattern.id, match },
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
		Patterns.get(payload.PatternID)
			.onExecute(payload.match);

		if(cmd.match(/^[\w\d]+:\/\//))
			shell.openItem(cmd);
		else
			exec(cmd);
	}

	function renderPreview(id, payload, render) {
//		render('<html><body>Something</body></html>');
	}

	return { startup, search, execute, renderPreview };
};
