'use strict';

//noinspection JSUnusedLocalSymbols
const { indent }  = require('./code/utils');

const exec = require('child_process').exec;

module.exports = (pluginContext) => {
	let startTime = Date.now();

	/** @type hain.PluginContext */
	global.psl = Object.assign({},
		pluginContext,
		{
			log          : (...args) => {
				// if(typeof args[0] === 'string') {
				// 	args[0] = `%c${args[0]}`;
				// 	args.splice(1, 0, 'color: blue');
				// }
				psl.logger.log(...args);
			},
			debug        : (...args) => {
				let startOffset = Date.now() - startTime;

				if(typeof args[0] === 'string')
					args[0] = `|+${startOffset}| ${args[0]}`;
				else
					args.splice(0, 0, `|+${startOffset}|`);

				psl.logger.log(...args);
			}
		});

	const ResolveIcon = require('./code/util/IconResolver');

	/** @type Map */
	let Patterns = require('./code/Patterns.js');

	/**
	 * Called when the plugin is first loaded
	 */
	function startup() {
		require('./code/Loader.js');

		psl.indexer.set('psl', (query) => {
			let results = [ ];
			for(let objPattern of Patterns.values()) {
				for(let match of objPattern.matches(query)) {
					results.push({
						id     : match.cmd,
						primaryText  : match.title,
						secondaryText   : match.desc,
						icon   : match.icon.length ? match.icon : ResolveIcon(match.cmd),
						group  : 'PSL Pattern',
						// score  : 1.0,
					});
				}
			}
			return results;
		});
	}

	/**
	 * @param {string} query
	 * @param res
	 */
	function search(query, res) {
	}

	/**
	 * Executes the given cmd that was accepted by the user
	 *
	 * @param {string} cmd
	 * @param {*} payload
	 */
	function execute(cmd, payload) {
		if(cmd.match(/^[\w\d]+:\/\//))
			psl.shell.openItem(cmd);
		else
			exec(cmd);
	}

	function renderPreview(id, payload, render) {
//		render('<html><body>Something</body></html>');
	}

	return { startup, search, execute, renderPreview };
};
