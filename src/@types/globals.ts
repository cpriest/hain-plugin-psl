'use strict';

declare class psl extends hain.PluginContext {
	static log(msg:string, ...args:any[]): void;
}

declare type PromiseResolver<T> = (value?: T|PromiseLike<T>) => void;
