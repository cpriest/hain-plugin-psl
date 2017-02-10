'use strict';
const fs      = require("fs");
const path    = require('path');
const favicon = require('favicon');

let ResolvedFileCache    = require('./StorageObject')('ResolvedFileCache');
let ResolvedUrlIconCache = require('./StorageObject')('ResolvedUrlCache');

const OneHourMS   = 1000 * 60 * 60;
const OneDayMS    = OneHourMS * 24;
const SevenDaysMS = OneDayMS * 7;

module.exports = (() => {

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

		return ResolveFilepathIcon(param);
	}

	/**
	 * Wrapper for clarity of functionality
	 *
	 * @param {int} max        The maximum number of seconds to return
	 * @returns {number}    A random number between 0 and ${max}
	 */
	function GetRandomSeconds(max) {
		return Math.floor(Math.random() * max);
	}

	/**
	 * Finds an icon for the given url from the favicon for the url (via request)
	 *
	 * @param {string} url
	 * @returns {string}
	 */
	function ResolveIconUrl(url) {
		if(!ResolvedUrlIconCache[url] || Date.now() - SevenDaysMS > ResolvedUrlIconCache[url].fetched) {
			favicon(url, (err, icon_url) => {
				ResolvedUrlIconCache[url] = {
					icon_url: icon_url || '#fa fa-globe',
					fetched : !err && icon_url
						? Date.now() + GetRandomSeconds(300)		// If fetched, cache for Seven Days + random 5 minutes (to not stampede the server on refresh)
						: Date.now() - (SevenDaysMS + OneDayMS),	// If failed, try again in one day
				};

				if(err || !icon_url) {
//					psl.log(`Failed to fetch icon for ${url}, err=${err}, icon_url=${icon_url}`);
				}
				else {
					psl.log(`Fetched Favicon: ${icon_url} for ${url}`);
				}
			});
		}

		if(ResolvedUrlIconCache[url])
			return ResolvedUrlIconCache[url].icon_url;
		return '#fa fa-refresh fa-spin';
	}

	function IconPathEncode(path) {
		if(!path)
			return '';
		return `icon://${new Buffer(path).toString('base64')}`;
	}

	function ResolveFilepathIcon(param) {
		let FirstParam = '';

		if(['"', "'"].indexOf(param.substr(0, 1)) !== -1)
			FirstParam = param.replace(/^(['"][^'"]+['"].+$)/, '$1');
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
					)
					.reduce((a, b) => a.concat(b))
			);

		return IconPathEncode(
			PossiblePaths.find(path => {
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
