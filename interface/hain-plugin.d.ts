// Type definitions for hain-plugin pluginContext v0.6
// Project: appetizermonster/hain
// Definitions by: Clint Priest <https://github.com/cpriest>

type milliseconds = number;

/**
 * @see https://github.com/simonlast/node-persist
 */
declare namespace NodePersist {

	interface InitOptions {
		dir?: string;
		stringify?: (toSerialize: any) => string;
		parse?: (serialized: string) => any;
		encoding?: string;
		logging?: boolean | Function;
		continuous?: boolean;
		interval?: milliseconds | boolean;
		ttl?: milliseconds | boolean;
	}

	interface LocalStorage {
		init(options?: InitOptions, callback?: Function): Promise<any>;

		initSync(options?: InitOptions): void;

		getItem(key: string, callback?: (err: any, value: any) => any): Promise<any>;

		getItemSync(key: string): any;

		setItem(key: string, value: any, callback?: (err: any) => any): Promise<any>;

		setItemSync(key: string, value: any): void;

		removeItem(key: string, callback?: (err: any) => any): Promise<any>;

		removeItemSync(key: string): void;

		clear(callback?: (err: any) => any): Promise<any>;

		clearSync(): void;

		values(): Array<any>;

		valuesWithKeyMatch(match: string): Array<any>;

		keys(): Array<string>;

		length(): number;

		forEach(callback: (key: string, value: any) => void): void;

		persist(callback?: (err: any) => any): Promise<any>;

		persistSync(): void;

		persistKey(key: string, callback?: (err: any) => any): Promise<any>;

		persistKeySync(key: string): void;
	}
}

declare namespace hain {

	/**
	 * These are the functions your plugin can/must implement
	 */
	interface Plugin {

	}

	/**
	 * The main pluginContext parameter your plugin is initialized with
	 * @since v0.5
	 */
	interface PluginContext {
		/** Directory of hain managed plugins */
		MAIN_PLUGIN_REPO: string;

		/** Directory of development plugins (local / manually installed) */
		DEV_PLUGIN_REPO: string;

		/** Current version of the API that is available */
		CURRENT_API_VERSION: string;

		/** Array of API versions that are still compatible with current version */
		COMPATIBLE_API_VERSIONS: string[];

		/** Access to application functions */
		app: App;

		/** Access to clipboard functions */
		clipboard: Clipboard;

		/** Access to toast functionality */
		toast: Toaster;

		/** Access to shell functionality */
		shell: Shell;

		/** Access to logging functionality */
		logger: Logger;

		/** Access to matching utility functions */
		matchUtil: MatchUtil;

		/** Access to hain global preferences */
		globalPreferences: Preferences;

		/** Access to plugin local storage */
		localStorage: PluginLocalStorage;

		/** Access to hain plugin indexer */
		indexer: Indexer;
	}

	/**
	 * @since v0.5
	 */
	interface App {
		/**
		 * Restarts hain
		 */
		restart(): void;

		/**
		 * Quits hain
		 */
		quit(): void;

		/**
		 * Open the window with a new query
		 *
		 * @param query - Query text (optional)
		 */
		open(query?: string): void;

		/**
		 * Close the window
		 *
		 * @param dontRestoreFocus - If true, Hain doesn’t restore focus to previous window (default is false)
		 */
		close(dontRestoreFocus?: boolean): void;

		/**
		 * Change query (similar to `redirect` property in `SearchResult`)
		 *
		 * @param query Change query
		 */
		setQuery(query: string): void;

		/**
		 * Open preferences window
		 *
		 * @param pluginId    - Open preferences, optionally to a given plugin section.
		 */
		openPreferences(pluginId?: string): void;

		/**
		 * Reloads the plugins
		 */
		reloadPlugins(): void;

		/**
		 * ????
		 */
		setSelectionIndex(): void;
	}

	/**
	 * @since v0.5
	 * @see http://electron.atom.io/docs/api/clipboard/
	 */
	interface Clipboard {
		/**
		 * Read the clipboard in text format
		 *
		 * @param type The clipboard type to read
		 */
		readText(type?: string): Promise<string>;

		/**
		 * Write to the clipboard in text format
		 *
		 * @param text The content to place on the clipboard
		 * @param type The clipboard type to write
		 */
		writeText(text: string, type?: string): void;

		/**
		 * Read the clipboard in HTML format
		 *
		 * @param type The clipboard type to read
		 */
		readHTML(type?: string): Promise<string>;

		/**
		 * Write to the clipboard in HTML format
		 *
		 * @param html The html content to place on the clipboard
		 * @param type The clipboard type to clear
		 */
		writeHTML(html: string, type?: string): void;

		/**
		 * Clear the clipboard of contents
		 *
		 * @param type The clipboard type to clear
		 */
		clear(type: string): void;
	}

	/**
	 * @since v0.5
	 *
	 * You can show notifications to user by using Toast.
	 *
	 * @note Enqueued notifications are processed in order and will not be processed while the window isn’t visible.
	 */
	interface Toaster {
		/**
		 * You can enqueue your notifications by using this function.
		 *
		 * @param message    Notification message
		 * @param duration    Duration to display message, default is 2000ms
		 */
		enqueue(message: string, duration?: milliseconds): void;
	}

	/**
	 * @since v0.5
	 */
	interface Shell {
		/**
		 * Show the given file in a file manager.
		 *
		 * @param fullPath    The full path to the item to be shown
		 */
		showItemInFolder(fullPath: string): void;

		/**
		 * Open the given file in the operating systems' default manner.
		 *
		 * @param fullPath    The full path to the item to be shown
		 */
		openItem(fullPath: string): void;

		/**
		 * Open the given external protocol URL in the desktop’s default manner.
		 *
		 * @param fullPath    The full path to the item to be opened
		 */
		openExternal(fullPath: string): void;
	}

	/**
	 * @since v0.5
	 */
	interface Logger {
		/**
		 * Logs your messages to the console.
		 *
		 * @param message    The message to be shown (compatible with Chrome console.log)
		 * @param args        Additional arguments to be shown
		 */
		log(message: string, ...args: any[]): void;
	}

	/**
	 * @since v0.5
	 */
	interface MatchUtil {
		/**
		 *
		 */
		fuzzy(): void;

		/**
		 *
		 */
		fwdfuzzy(): void;

		/**
		 *
		 */
		head(): void;

		/**
		 *
		 */
		makeStringBoldHtml(): void;
	}

	/**
	 * @since v0.5
	 */
	interface Preferences {
		/**
		 * Returns raw preferences object if path is undefined, otherwise it returns the value at path of object,
		 *
		 * @param path    See path rules at
		 *                    @see https://lodash.com/docs#get
		 */
		get(path?: string): any;

		/**
		 * Add a listener to PreferencesObject.
		 *
		 * @param eventName    The `update` event is emitted when plugin preferences have changed
		 * @param listener    The call back to be used.
		 */
		on(eventName: string, listener: (pref: string) => void): void;
	}

	/**
	 * @since v0.5
	 */
	interface PluginLocalStorage extends NodePersist.LocalStorage {

	}



	/**
	 * You can use this interface for adding or removing {SearchResult} entries.  This interface
	 * 	is always provided as the second argument to Plugin.search().
	 *
	 * @since v0.5
	 *
	 * @example
	 * <pre>
	 *	function search(query, res) {
	 *	    res.add({
	 *	        id: 'temp',
	 *	        title: 'Fetching...',
	 *	        desc: 'Please wait a second'
	 *	    });
	 *	    setTimeout(() => res.remove('temp'), 1000);
	 *	}
	 * </pre>
	 */
	interface ResponseObject {
		/**
		 * Add a {SearchResult} to the result-set
		 *
		 * @param result	The result to be added to the list of searchable values
		 */
		add(result: SearchResult|SearchResult[]): void;

		/**
		 * You can remove a {SearchResult} from the result-set that you previously added
		 * @param id
		 */
		remove(id: string): void;
	}

	/**
	 * IndexedResult is used as a return value for Indexer
	 */
	interface IndexedResult {
		/**
		 * An identifier (recommended tobe unique), used as argument to execute(), default is `undefined`
		 */
		id?: any;

		/**
		 * Extra information, used as second argument to execute(), default is `undefined`
		 */
		payload?: any;

		/**
		 * Title text for item.
		 * @see <a href="http://appetizermonster.github.io/hain/docs/text-format/">Text Format</a>
		 */
		primaryText: string;

		/**
		 * Description text for item.
		 * @see <a href="http://appetizermonster.github.io/hain/docs/text-format/">Text Format</a>
		 */
		secondaryText: string;

		/**
		 * Icon URL, default is `icon` of <a href="http://appetizermonster.github.io/hain/docs/preferences-json-format/">package.json</a>.
		 * @see <a href="http://appetizermonster.github.io/hain/docs/icon-url-format/">Icon URL Format</a>
		 */
		icon?: string;

		/**
		 * Redirection query, default is undefined
		 */
		redirect?: string;

		/**
		 * Result grouping name, default is `group` of
		 *        <a href="http://appetizermonster.github.io/hain/docs/preferences-json-format/">package.json</a>
		 **/
		group?: string;

		/**
		 * Whether it has HTML Preview, default is false; used with render().
		 */
		preview?: boolean;
	}

	/**
	 * @since v0.6
	 */
	interface Indexer {
		/**
		 * Adds a set of results to the built-in indexer to be searchable, execute() is called with the id and payload provided.
		 *
		 * @param key       A unique ID which you can later use to remove or modify this addition
		 * @param value        The entry or entries to be added
		 */
		set(key: string, value: IndexedResult | IndexedResult[]): void;

		/**
		 * Adds a synchronous callback function to the built-in indexer, should return dynamic values to be used with the indexer
		 *
		 * @param key       A unique ID which you can later use to remove or modify this addition
		 * @param callback    The callback function, this will be called synchronously
		 */
		set(key: string, callback: (query: string) => IndexedResult | IndexedResult[]): void;

		/**
		 * Removes the set of results added with the given key
		 *
		 * @param key       A unique ID which you can later use to remove or modify this addition
		 */
		remove(key: string): void;

	}
}
