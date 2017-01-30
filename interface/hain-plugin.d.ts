// Type definitions for hain-plugin pluginContext v0.6
// Project: appetizermonster/hain
// Definitions by: Clint Priest <https://github.com/cpriest>

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
		readText(): void;			// Read the clipboard in text format
		writeText(): void;			// Write to the clipboard in text format
		readHTML(): void;			// Read the clipboard in HTML format
		writeHTML(): void;			// Write to the clipboard in HTML format
		clear(): void;				// Clear the clipboard of contents
	}

	/**
	 * @since v0.5
	 */
	class Toaster {
		enqueue(): void;			// You can enqueue your notifications by using this function.
	}

	/**
	 * @since v0.5
	 */
	class Shell {
		showItemInFolder(): void;	// Show the given file in a file manager.
		openItem(): void;			// Open the given file in the desktop’s default manner.
		openExternal(): void;		// Open the given external protocol URL in the desktop’s default manner.
	}

	/**
	 * @since v0.5
	 */
	class Logger {
		log(): void;				// Logs your messages.
	}

	/**
	 * @since v0.5
	 */
	class MatchUtil {
		fuzzy(): void;					//
		fwdfuzzy(): void;				//
		head(): void;					//
		makeStringBoldHtml(): void;		//
	}

	/**
	 * @since v0.5
	 */
	class Preferences {
	}

	/**
	 * @since v0.5
	 */
	class PluginLocalStorage /*extends NodePersist */{

	}

	/**
	 * @since v0.6
	 */
	class Indexer {

	}
}
