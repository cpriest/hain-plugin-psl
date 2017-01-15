'use strict';
const fs   = require("fs");
const path = require('path');

let ResolvedFileCache = { };

module.exports = (() => {

	/**
	 * Finds an icon for the given url from the favicon for the url (via request)
	 *
	 * @param {string} url
	 * @returns {string}
	 */
	function ResolveIconUrl(url) {
		log(`resolving $\{url} as url...`);
		return '';
	}

	function IconPathEncode(path) {
		if(!path)
			return '';
		return `icon://${new Buffer(path).toString('base64')}`;
	}

	/**
	 * Finds an icon for the given param,
	 *    If param is a URI it will attempt to locate the favicon for the URI (via request)
	 *    Otherwise it will attempt to resolve the icon as a file/executable via PATH environment
	 *
	 * @param {string} param
	 * @returns {string|boolean}    Icon Path or false upon failure
	 */
	function ResolveIcon(param) {
		if(/^https?:\/\//.test(param))
			return ResolveIconUrl(param);

		let FirstParam = '';

		if(['"', "'"].indexOf(param.substr(0, 1)) !== -1)
			FirstParam = param.replace(/^(('|")[^'"]+('|").+$)/, '$1');
		else
			FirstParam = param.split(' ')[0];

		if(ResolvedFileCache[FirstParam]) {
			if(fs.existsSync(ResolvedFileCache[FirstParam]))
				return IconPathEncode(ResolvedFileCache[FirstParam]);
			ResolvedFileCache[FirstParam] = undefined;
		}

		//noinspection JSUnresolvedVariable
		let PossiblePaths = [FirstParam]
			.concat(
				(process.env.PATH || '')
					.replace(/["]+/g, '')
					.split(path.delimiter)
					.map((dir) =>
						path.join(dir, FirstParam)
					),
				(process.env.PATH || '')
					.replace(/["]+/g, '')
					.split(path.delimiter)
					.map(
						(dir) =>
							(process.env.PATHEXT || '')
								.split(path.delimiter)
								.map(ext => path.join(dir, FirstParam + ext))
					).reduce( (a, b) => a.concat(b))
			);

		return IconPathEncode(
			PossiblePaths.find( path => {
				if(fs.existsSync(path)) {
					ResolvedFileCache[FirstParam] = path;
					return true;
				}
				return false;
			}) || ''
		);
	}

	return ResolveIcon;
})();
