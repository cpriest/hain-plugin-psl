'use strict';
require('json5/lib/require');
const Glob = require("glob").Glob;

let { log, indent } = require('./utils.js');


module.exports = (pluginContext, PluginDir) => {
	// Patterns from definition files, collected here and return
	let patterns  = [];
	let providers = new Map();

	/**
	 * @param {string} globPattern    A glob pattern of files to match
	 * @returns {Promise}
	 */
	function LoadDefinitionFiles(globPattern) {
		return new Promise((fulfill, reject) => {
			(new Glob(globPattern, (err, matches) => {
				for(let filepath of matches) {
					try {
						ParseDefinition(require(filepath));
					} catch(e) {
						log('While processing definition file: %s', filepath);
						log(indent(e.stack));
					}
				}
			})).on('end', (/** string[] */ files) => {
				log(`Finished loading ${patterns.length} patterns and ${providers.size} providers from ${files.length} definition files.`);
				fulfill({ patterns, providers });
			});
		});
	}

	/**
	 * @param {Definition} def
	 */
	function ParseDefinition(def) {
		patterns = patterns.concat(def.patterns || []);

		for(let name of Object.keys(def.providers || { })) {
			let pDef = def.providers[name],
				ProviderClass;

			pDef.name = name;

			try {
				ProviderClass = require('./providers/' + pDef.type);

				providers.set(name, new ProviderClass(pDef));
			} catch(e) {
				if(e.code === 'MODULE_NOT_FOUND')
					e.message = `Unable to find provider module named '${pDef.type}' specified as type parameter for @${name} provider`;
				throw e;
			}
		}
	}

	return LoadDefinitionFiles(PluginDir + '/defs/*.json*');
};
