'use strict';

//noinspection JSUnusedLocalSymbols
const { indent }  = require('./code/utils');

const exec = require('child_process').exec;

module.exports = (pluginContext) => {
	let startTime = Date.now();

	global.psl = Object.assign({},
		pluginContext,
		{
			log          : (...args) => {
				// if(typeof args[0] === 'string') {
				// 	args[0] = `%c${args[0]}`;
				// 	args.splice(1, 0, 'color: blue');
				// }
				pluginContext.logger.log(...args);
			},
			debug        : (...args) => {
				let startOffset = Date.now() - startTime;

				if(typeof args[0] === 'string')
					args[0] = `|+${startOffset}| ${args[0]}`;
				else
					args.splice(0, 0, `|+${startOffset}|`);

				pluginContext.logger.log(...args);
			}
		});


	const ResolveIcon = require('./code/util/IconResolver');

	//noinspection JSUnusedLocalSymbols
	const app = pluginContext.app;
	//noinspection JSUnusedLocalSymbols
	// const logger = pluginContext.logger;
	// const prefs  = pluginContext.preferences.get();
	const shell = pluginContext.shell;

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
					icon   : match.icon.length ? match.icon : ResolveIcon(match.cmd),
					payload: { PatternID: objPattern.id, match },
					group  : 'PSL',
					score  : 1.0,
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
