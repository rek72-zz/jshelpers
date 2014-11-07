//############################################################################################################################################
//
//  Namespace : Helper
//  Description: Useful methods I made to make life easier
//  Author:  rek72
//  Dependencies: jQuery 1.7+ required!
//
//############################################################################################################################################

var Helper = {
    ///<summary>Some common helper/shortcut methods for efficiency</summary>
	Kvp: {
		/// <summary>
		/// Controls for maintaining key/value pairs in location.hash or optionaly. It's main purpose is for managing the key/value
		/// pairs in location.hash but optionally you can pass in a kvp string.
		/// value that does not have a key (that follows the main navigation value) will be added to the array pairsObject.noKeys[].
		/// </summary>
		/// <param name=kv
		toObject: function (kvp/*optional*/) {
			///<summary>Build an object literal from location.hash.</summary>
			///<param name="kvp">String of key/value pairs, default grabs location.hash</param>
			// define
			var h = kvp || location.hash;
			var pairs = h.replace('#', '');
			var pairsArray = pairs.split('&');
			var pairsObject = {};
			var hashOrphans = []; // hash values without keys that is NOT the main (first in string) hash value

			// parse through the array to build the object
			for (var i = 0, il = pairsArray.length; i < il; i++) {
				var pair = pairsArray[i].split('=');
				if (pair.length !== 2) {
					if (pair.length === 0) continue; // get out of here if for some reason there is no value
					if (i === 0) { // this will be the main (first in string) hash value with no key (typically the navigation as other app params will most likely contain keys
						pairsObject.noKeyHash = unescape(pair[0]);
					} else { // this is NOT the main (first in string) hash value and does not have a key (orphaned). Not sure why we'd be here, an edge case for sure, but here you go. 
						hashOrphans.push(unescape(pair[0]));
						pairsObject.noKeys = hashOrphans;
					}
				} else {
					pairsObject[pair[0]] = unescape(pair[1]); // we have both a key and value pair
				}
			}

			return pairsObject;
		},

        get: function (key, kvp/*optional*/) {
            ///<summary>Returns the value of the key from the pairs (ex: location.hash) string</summary>
            ///<param name="key" type="string">the key to return the value of</param>
            ///<param name="kvp" type="string">String of key/value pairs, default grabs location.hash</param>
            // test
            if (typeof (key) === 'undefined' || key.length < 1) return false;

            // get key/value pairs first
            var pairsObject = (arguments.length === 2) ? this.toObject(kvp) : this.toObject();
            if (pairsObject.length < 1) return false;

            // now return the value matching key, or false if the key does not exist
            return (pairsObject[key] === undefined) ? false : pairsObject[key];
        },

        set: function (obj, kvp/*optional*/) {
            ///<summary>Sets the value of the key from the pairs (ex: location.hash) string. Sets location.hash OR
            ///if kvp argument exists, returns the updated kvp string.</summary>
            ///<param name="obj" type="object literal">object literal of key/values to set</param>
            ///<param name="kvp" type="string">String of key/value pairs, default grabs location.hash</param>
            // test
            if (typeof (obj) !== 'object') return false;

            // define
            var pair = this.toObject(kvp) || this.toObject();
            var newObj = $.extend(pair, obj);

            if (kvp) {
                return $.param(newObj);
            } else {
                location.hash = $.param(newObj);
            }
        },

        remove: function (key, kvp/*optional*/) {
            /// <summary>Removes the key from the pairs (ex: location.hash) string.</summary>
            /// <param name="key" type="object literal">object literal of key/values to set</param>
            /// <param name="kvp" type="string">[optional] String of key/value pairs, default grabs location.hash</param>
            // test
            if (typeof (key) === 'undefined' || key.length < 1) return false;

            // define
            var obj = this.toObject(kvp) || this.toObject();

            // remove item
            delete obj[key];

            // return updated obj
            if (typeof (kvp) != 'undefined') {
                return $.param(obj); // return updated key/value pairs
            } else {
                location.hash = $.param(obj); // update hash
            }

            // done
            return true;
        }
    },

    stringFormat: function (string, markers) {
        ///<summary>Substitute values into a string in place of markers (object literal OR mixed arguments).
        ///Example with Object Literal: stringFormat("The big {color} fox {action} over the fence", {color: 'red', action: 'jumped'});
        ///Example with mixed arguments (as in C# String.Format): stringFormat("The big {0} fox {1} over the fence", 'red', 'jumped');</summary>
        ///<param name="string" type="string">String to parse.</param>
        ///<param name="markers" type="Object Literal OR multiple arguments">Object Literal: key values to replace in a string. OR
        /// Mixed Arguments: Used just like in C# String.Format, unlimited arguments looking for iterating markers ({0}, {1}, {2}, etc.)</param>
        // test
        if (arguments.length < 2 || string === '') return false;

        // object or unlimited arguments
        if (typeof (markers) === 'object') { // markers is an Object Literal
            // loop through string
            $.each(markers, function (key, value) {
                var regEx = new RegExp('{' + key + '}', 'g');
                string = string.replace(regEx, value);
            });
        } else if (arguments.length > 1) { // markers is mixed arguments
            // loop through string
            for (var i = 0, il = arguments.length - 1; i < il; i++) {
                var regEx = new RegExp('\\{' + i + '\\}', 'g');
                string = string.replace(regEx, arguments[i + 1]);
            }
        }

        return string;
    },

    debug: false, // boolean for Helper.log()

    log: function (message) {
        ///<summary>Debug logging for IE
        ///Useful for debugging in production since IE doesn't support console object.  Allows you to put logs in code without worrying about output until Helper.debug=true (which could be set via url query string for debugging in production)</summary>
        ///<param name="message" type="string">message to be logged</param>
        // test
        if (!Helper.debug) return false;

        // define
        var msg = message || 'undefined';

        // log with console or make a console (for sink'n ie)
        if (!window.console) {
            var id = 'stinkin_IE_console_logger';
            if (typeof (msg) === 'object') msg = '[OBJECT]: ' + $.param(msg);
            msg = '> ' + msg + '<br />';

            if ($('#' + id).length > 0) {
                $('#' + id).append(msg);
            } else {
                $('body').append($('<div id="' + id + '" />').html('<h3 style="color: #ff9900; font-size: 1.2em">Stink\'n IE Console Logger</h3><br />' + msg));
            }
        } else {
            return console.log(msg);
        }

        return true;
    },

    twoDigits: function (n) {
        ///<summary>Takes a single digit number and returns it as a string with pre-pending 0.
        ///Example 1 would be returned as 01.  Useful for date numbers.</summary>
        ///<param name="n">Number</param>
        return (n < 10) ? '' + 0 + n :'' + n;
    },

    pop: function (url, options/*optional*/) {
        ///<summary> Popout window. Example: pop("http://google.com", {windowName: "googleWindow", toolbar: "yes", resizeable: "yes"});</summary>
        ///<param name="url">URL to open</param>
        ///<param name="options">Object literal settings</param>
        // test
        if (!arguments[0].length > 0) return false;

        // define
        var empty = {};
        var defaults = { // defaults
            windowName: 'popWindow',
            toolbar: 'no',
            menubar: 'no',
            resizable: 'yes',
            scrollbars: 'yes',
            width: '790',
            height: '600',
            center: true
        };

        // now extend options, if any, with defaults
        var s = $.extend(empty, defaults, options);

        // setup for centering window if not set to false
        var centerWindow = '';
        if (s.center) {
            var left = (screen.width - s.width) / 2;
            var top = (screen.height - s.height) / 2;
            centerWindow = ',top=' + top + ',left=' + left;
        }

        // open window with settings
        return window.open(url, s.windowName, 'toolbar=' + s.toolbar + ',menubar=' + s.menubar + ',resizable=' + s.resizable + ',scrollbars=' + s.scrollbars + ',width=' + s.width + ',height=' + s.height + centerWindow);
    },

    nl2br: function (string) {
        ///<summary>Replaces any /n breaks with html <br />.  Useful for textarea data that is used in non-input dom elements.</summary>
        ///<param name="string">the string to parse</param>
        return string.replace(/\n/g, '<br />');
    },

    selectors: function (selectors/*unlimited arguments*/) {
        /// <summary>Build multiple selectors for jQuery.  Serves as a shortcut for jquery selectors by eleminating the use of [ + ', ' + ] between selectors or having to use jQuery.add().add()</summary>
        /// <param name="selectors">Can be an unlimited amount of arguments. Examples: Utils.slctrs(string1, string2, string3, string4)</param>
        // define
        var selectorsString = '';

        // loop through args or array
		var looper = (typeof(selectors) === 'string') ? arguments : selectors; // set looper as the selector, if an array, otherwise use keyword arguments
		for (var i = 0, il = looper.length; i < il; i++) {
			var separator = (i > 0) ? ', ' : '';
			selectorsString = selectorsString + separator + looper[i];
		}

        // return string
        return selectorsString;
    },

    truncate: function (string, maxChars, replaceWith/*optional*/) {
        ///<summary>Takes a string and truncates it if the length is larger than nMaxChars.</summary>
        ///<param name="string">String to truncate</param>
        ///<param name="maxChars">Max number of chars before it's truncated</param>
        ///<param name="replaceWith">string to replace with truncated text. Defaults to '&#8230;'</param>
        // test
        if (!string) return false;
        if (!maxChars || string.length <= maxChars) return string;

        // define
        var maxFit = maxChars - 3;
        var truncateAt =(truncateAt === -1 || truncateAt < maxChars / 2) ? maxFit : string.lastIndexOf(' ', maxFit);
		var replaceString = (arguments.length === 3) ? replaceWith : '&#8230;';

        // return truncated string
        return string.substr(0, truncateAt) + replaceString;
    },

    enterKeypress: function (inputField, buttonToClick, focusInputField) {
        /// <summary>Set "enter" keypress to click button when input field is in focus</summary>
        /// <param name="inputField" type="string">selector for text input</param>
        /// <param name="buttonToClick" type="string">selector for button to click</param>
        /// <param name="focusInputField" type="string">pass in false to avoid the automatic .focus() call</param>
        ///
        $(inputField).unbind('keydown').keydown(function (e) {
            if (e.keyCode === 13) {
                e.preventDefault();
                $(buttonToClick).click();
            }
        });

        if ((focusInputField === undefined) || (focusInputField === true)) $(inputField).focus();
    },

    isNumber: function (num) {
        /// <summary>Returns boolean with whether a string is a valid as an number</summary>
        /// <param name="num">string</param>
        return !isNaN(parseFloat(num)) && isFinite(num);
    },

    addCommas: function (num) {
        /// <summary>Returns a number with commas. Example 1234567 returns as 1,234,567</summary>
        /// <param name="num">number to parse</param>
        // define
        num += '';
        var numArray = num.split('.');
        var numA = numArray[0];
        var numB = numArray.length > 1 ? '.' + numArray[1] : '';
        var regEx = /(\d+)(\d{3})/;

        // loop through digits
        while (regEx.test(numA)) {
            numA = numA.replace(regEx, '$1' + ',' + '$2');
        }

        return numA + numB;
    }

    getResponseTimeInSecs: function (startTime, endTime) {
        /// <summary>Returns the response time from a start and end time (such as in XHR call) in seconds.</summary>
        /// <param name="startTime">js Date</param>
        /// <param name="endTime">js Date</param>
        return (endTime.getTime() - startTime.getTime()) / 1000;
    },

    unique: function (array) {
        /// <summary>Returns an array of unique values</summary>
        var tempArray = {};
		var returnArray = [];
        for (var i = 0, n = array.length; i < n; ++i) {
            if (!tempArray[array[i]]) { 
				tempArray[array[i]] = true;
				returnArray.push(array[i]);
			}
        }
        return returnArray;
    }
};
