# introduction

`named-logs-console` is an implementation of [named-logs facade](https://github.com/wighawag/named-logs) that redirect all call to console, preserving file/line.

It support namespace filtering like [debug](https://github.com/visionmedia/debug/) as well as log levels

By default the log level is 2 (warn)

# install

```bash
npm install named-logs named-logs-console
```

or for web page, depending of your bundlerm instead of installing/importng `named-logs-console` you might be better of simply injecting the following in your html page (in the head) :

```
<script>
"use strict";var noop=function(){},W="undefined"!=typeof window?window:globalThis,oldConsole=W.console,disabledRegexps=[],enabledRegexps=[];function bindCall(e,l,a,o,r){if(l.enabled&&(l.level>=o||factory.level>=o)){if(a>=o||factory.traceLevel>=o){if(factory.labelVisible){var t="string"==typeof factory.labelVisible?"".concat(factory.labelVisible).concat(l.namespace):l.namespace;return l.decoration?oldConsole.trace.bind(oldConsole,"%c".concat(t),l.decoration):oldConsole.trace.bind(oldConsole,t)}return oldConsole.trace.bind(oldConsole)}if(r&&factory.labelVisible){t="string"==typeof factory.labelVisible?"".concat(factory.labelVisible).concat(l.namespace):l.namespace;return l.decoration?e.bind(oldConsole,"%c".concat(t),l.decoration):e.bind(oldConsole,t)}return e.bind(oldConsole)}return noop}var loggers={};function write(e){process.stdout.write(e)}var factory=function(e,l){var a=loggers[e];if(a)return a;var o=factory.level,r=factory.traceLevel;return a=loggers[e]={namespace:e,decoration:null==l?void 0:l.decoration,get assert(){return bindCall(oldConsole.assert,a,r,1,!1)},get error(){return bindCall(oldConsole.error,a,r,1,!0)},get warn(){return bindCall(oldConsole.warn,a,r,2,!0)},get info(){return bindCall(oldConsole.info,a,r,3,!0)},get write(){return"undefined"!=typeof process?bindCall(write,a,r,3,!1):bindCall(oldConsole.info,a,r,3,!1)},get log(){return bindCall(oldConsole.log,a,r,4,!0)},get debug(){return bindCall(oldConsole.debug,a,r,5,!0)},get trace(){return bindCall(oldConsole.trace,a,r,6,!0)},get dir(){return bindCall(oldConsole.dir,a,r,5,!1)},get table(){return bindCall(oldConsole.table||oldConsole.debug,a,r,5,!1)},get time(){return bindCall(oldConsole.time||oldConsole.debug,a,r,5,!1)},get timeEnd(){return bindCall(oldConsole.timeEnd||oldConsole.debug,a,r,5,!1)},get timeLog(){return bindCall(oldConsole.timeLog||oldConsole.debug,a,r,5,!1)},get level(){return o},set level(e){o=e},get traceLevel(){return r},set traceLevel(e){r=e},enabled:enabled(e,{disabledRegexps:disabledRegexps,enabledRegexps:enabledRegexps})}},logLevels={error:1,warn:2,info:3,log:4,debug:5,trace:6};function enabled(e,l){var a,o,r=l.disabledRegexps,t=l.enabledRegexps;if("*"===e[e.length-1])return!0;for(a=0,o=r.length;a<o;a++)if(r[a].test(e))return!1;for(a=0,o=t.length;a<o;a++)if(t[a].test(e))return!0;return!1}function processNamespaces(e,l,a){for(var o=l.disabledRegexps,r=l.enabledRegexps,t=("string"==typeof e?e:"").split(/[\s,]+/),n=t.length,s=0;s<n;s++)t[s]&&("-"===(e=t[s].replace(/\*/g,".*?"))[0]?o.push(new RegExp("^"+e.substr(1)+"$")):r.push(new RegExp("^"+e+"$")));for(var i=0,d=Object.keys(loggers);i<d.length;i++){var c=d[i];a(c,enabled(c,{disabledRegexps:o,enabledRegexps:r}))}}if(factory.level=2,factory.traceLevel=0,factory.setTraceLevelFor=function(e,l){processNamespaces(e||"*",{disabledRegexps:[],enabledRegexps:[]},function(e,a){a&&(loggers[e].traceLevel=l)})},factory.disable=function(){disabledRegexps.splice(0,disabledRegexps.length),enabledRegexps.splice(0,enabledRegexps.length);for(var e=0,l=Object.keys(loggers);e<l.length;e++){var a=l[e];loggers[a].enabled=!1}try{localStorage.removeItem("debug")}catch(e){}},factory.enable=function(e){disabledRegexps.splice(0,disabledRegexps.length),enabledRegexps.splice(0,enabledRegexps.length),processNamespaces(e=""===e?"*":e||"*",{disabledRegexps:disabledRegexps,enabledRegexps:enabledRegexps},function(e,l){return loggers[e].enabled=l});try{localStorage.setItem("debug",e)}catch(e){}},"undefined"!=typeof localStorage)try{var str=localStorage.getItem("debug");str&&""!==str&&factory.enable(str)}catch(e){}else if("undefined"!=typeof process){(val=process.env.NAMED_LOGS)?factory.enable(val):factory.disable(),(val=process.env.NAMED_LOGS_LEVEL)&&(factory.level=logLevels[val]||parseInt(val)||factory.level),(val=process.env.NAMED_LOGS_TRACE_LEVEL)&&(factory.traceLevel=logLevels[val]||parseInt(val)||factory.level),(val=process.env.NAMED_LOGS_LABEL)&&(factory.labelVisible=!0)}for(var vars=W.location?W.location.search.slice(1).split("&"):[],_i=0,vars_1=vars;_i<vars_1.length;_i++){var variable=vars_1[_i];if(variable.startsWith("debug="))""===(val=variable.slice(6))?factory.disable():factory.enable(val);else if(variable.startsWith("debugLevel=")){var val=variable.slice(11);factory.level=logLevels[val]||parseInt(val)||factory.level}else if(variable.startsWith("traceLevel=")){val=variable.slice(11);factory.traceLevel=logLevels[val]||parseInt(val)||factory.level}else if(variable.startsWith("debugLabel")){val=variable.slice(11);factory.labelVisible=val||!0}}globalThis._logFactory=factory;
</script>
```

Note that you still need to install and import `named-logs` if you intent to use to emit logs from your application. (if you only intent to see logs from extermal libraries, you do not need anything)

# use

in your index.js :

```js
import {hookup} from 'named-logs-console';
hookup();
```

This will be default log all `named-logs` call

On a web page,

if the query string contains `debug=<namespace>` it will enable only the namespaces listed there (separated per commas)

if the query string contains `debugLevel=<logLevel>` it will set the global log level to the one specified.

if the query string contains `traceLevel=<traceLevel>` it will set the transform any log with level lower or equal as trace (console.trace)

For logging inside the app you can import `named-logs`
This will allow you to extract that code into the library without importing the overhead of `named-logs-console`

```js
import {logs} from 'named-logs';
const console = logs('app:test');

console.log('whatever you want');
console.error('an error occured');
```

But you can still access named logs via `named-logs-console` even one created by libraries and disable them programmatically for example:

```js
import {logs} from 'named-logs-console';
logs('myLibrary').enabled = false;
```

You can also set global settings

```js
import {logs} from 'named-logs-console';
logs.level = 0; // desactivate all
```
