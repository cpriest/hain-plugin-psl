# Features
1. ~~Separate definition files~~
2. ~~Move some FilesetProvider functionality into Provider base class or a new sub-class as commonalities reveal themselves~~
3. ~~Sort by recently used alphabetically, then the rest, alphabetically~~
4. Automatic icon identification if unspecified
5. auto-complete Providers
    1. Queryable - Google Suggest (w, w/o preview)
    2. Queryable - API (Github)
    3. ~~Filesystem - Directory / Pattern Matching~~
6. ~~Negative Search Filter (dep -chi)~~


7. My own binding to execute /quit (for dev)



# YAGNI

# Refactoring
1. Separate out Pattern vs Patterns w/ Providers into different classes (Provider Patterns have much more code)
2. Perhaps move PCRE Matching of {string[]} to a utility function
3. More elegant solution to recent items list sorting, seems clunky as-is.
4. Move ExpandVars into Utils
5. Switch to import * from * rather than require?
6. Have MatchlistProvider call this.BuildMatchlist() from it's own constructor, then FilesetProvider won't need it's own constructor just for that.
7. Patterns/Providers add themselves to the Map() rather than via Loader.js
8. Better .id for Patterns than the pattern (possibly cleaned up pattern)...


# Ideas
1. /psl commands
    1. /psl config x.y=z
3. Provider sub-commands (/hide, /clear (hidden), etc.) (/hide stored in localStorage as pref)
4. FilesetProvider sub-commands (/hide (inherited, etc), /rm, ...)
