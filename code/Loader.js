'use strict';

require('json5/lib/require');
const Glob = require("glob").Glob;

//noinspection JSUnusedLocalSymbols
let { log, indent } = require('./utils.js');

module.exports = (pluginContext, PluginDir) => {
	/** @type ProvidersMap */
	const Providers = require('./providers/Providers')(pluginContext, PluginDir);
	const Pattern = require("./Pattern.js")(pluginContext, PluginDir);

	// Patterns from definition files, collected here and return
	let patterns  = [];

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
						log(`While processing definition file: ${filepath}`);
						log(indent(e.stack));
					}
				}
			})).on('end', (/** string[] */ files) => {
				log(`Finished loading ${patterns.length} patterns and ${Providers.size} providers from ${files.length} definition files.`);
				fulfill({ patterns });
			});
		});
	}

	/**
	 * @param {Definition} def
	 */
	function ParseDefinition(def) {
		for(let pDef of def.patterns || []) {
			patterns.push(new Pattern(pDef));
		}

		for(let name of Object.keys(def.providers || { })) {
			let pDef = def.providers[name],
				ProviderClass;

			pDef.name = name;

			try {
				ProviderClass = require('./providers/' + pDef.type)(pluginContext, PluginDir);

				Providers.set(name, new ProviderClass(pDef));
			} catch(e) {
				if(e.code === 'MODULE_NOT_FOUND')
					e.message = `Unable to find provider module named '${pDef.type}' specified as type parameter for @${name} provider`;
				throw e;
			}
		}
	}

	return LoadDefinitionFiles(PluginDir + '/defs/*.json*');
};
