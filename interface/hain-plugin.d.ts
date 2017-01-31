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

	class NodePersist {
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
	class App {
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
		 * @param pluginId	- Open preferences, optionally to a given plugin section.
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
	class Clipboard {
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
	class Toaster {
		/**
		 * You can enqueue your notifications by using this function.
		 *
		 * @param message	Notification message
		 * @param duration	Duration to display message, default is 2000ms
		 */
		enqueue(message: string, duration?: milliseconds): void;
	}

	/**
	 * @since v0.5
	 */
	class Shell {
		/**
		 * Show the given file in a file manager.
		 *
		 * @param fullPath	The full path to the item to be shown
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
	class Logger {
		/**
		 * Logs your messages to the console.
		 *
		 * @param message	The message to be shown (compatible with Chrome console.log)
		 * @param args		Additional arguments to be shown
		 */
		log(message: string, ...args: any[]): void;
	}

	/**
	 * @since v0.5
	 */
	class MatchUtil {
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
	class Preferences {
	}

	/**
	 * @since v0.5
	 */
	class PluginLocalStorage extends NodePersist.NodePersist {

	}

	/**
	 * @since v0.6
	 */
	class Indexer {

	}
}
