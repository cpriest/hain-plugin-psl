'use strict';

//noinspection JSUnusedLocalSymbols
import { indent } from 'utils';

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

	// console.log(pluginContext);
	// console.log(pluginContext.localStorage.__proto__);

	const ResolveIcon = require('./code/util/IconResolver');

	//noinspection JSUnusedLocalSymbols
	const app = pluginContext.app;
	//noinspection JSUnusedLocalSymbols
	// const logger = pluginContext.logger;
	// const prefs  = pluginContext.preferences.get();
	const shell = pluginContext.shell;

	/** @type PatternsMap */
	let Patterns = require('./code/Patterns.js')(pluginContext, __dirname);

	class PSL_Plugin {
		startup() {
			require('./code/Loader.js')(pluginContext, __dirname);

			psl.indexer.set('psl', (query) => {
				let results = [ ];
				for(let objPattern of Patterns.values()) {
					for(let match of objPattern.matches(query)) {
						results.push({
							id           : match.cmd,
							primaryText  : match.title,
							secondaryText: match.desc,
							icon         : match.icon.length ? match.icon : ResolveIcon(match.cmd),
							group        : 'PSL Pattern',
							// score  : 1.0,
						});
					}
				}
				return results;
			});
		}

		search(query, res) {
			res.add({
				title  : '',
				payload: '',
			})
		}

		execute(id, payload) {
			if(id.match(/^[\w\d]+:\/\//))
				shell.openItem(id);
			else
				exec(id);
		}

		renderPreview(id, payload, render) {
			// render('<html><body>Something</body></html>');
		}
	}

	return new PSL_Plugin();
};
