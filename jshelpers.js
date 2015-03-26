//############################################################################################################################################
//
//  Namespace : Helper
//  Description: Useful methods I made in the past to make my life easier
//  Author:  Robert Kever
//  Dependencies: jQuery 1.7+ required!
//
//############################################################################################################################################

var Helper = {
    ///<summary>Some common helper/shortcut methods for efficiency</summary>
    Kvp: {
        /// <summary>
        /// Controls for maintaining key/value pairs in location.hash or optionaly a kvp string (e.g. key1=value1&key2=value2).
        /// pairs in location.hash but optionally you can pass in a kvp string.
        /// Values that do not have a key will be added to the array pairsObject.noKeys[].
        /// </summary>
        toObject: function(kvp /*optional*/ ) {
            ///<summary>Build an object literal from location.hash.</summary>
            ///<param name="kvp">String of key/value pairs, default grabs location.hash</param>
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
                    hashOrphans.push(unescape(pair[0]));
                    pairsObject.noKeys = hashOrphans;
                } else {
                    pairsObject[pair[0]] = unescape(pair[1]); // we have both a key and value pair
                }
            }

            return pairsObject;
        },

        get: function(key, kvp /*optional*/ ) {
            ///<summary>Returns the value of the key from the pairs (ex: location.hash) string</summary>
            ///<param name="key" type="string">The key to return the value of</param>
            ///<param name="kvp" type="string">String of key/value pairs, default grabs location.hash</param>
            // test
            if (typeof(key) === 'undefined' || key.length < 1) return false;

            // get key/value pairs first
            var pairsObject = (arguments.length === 2) ? this.toObject(kvp) : this.toObject();
            if (pairsObject.length < 1) return false;

            // now return the value matching key, or false if the key does not exist
            return pairsObject[key] || false;
        },

        set: function(obj, kvp /*optional*/ ) {
            ///<summary>Sets the value of the key from the pairs (ex: location.hash) string. Sets location.hash OR
            ///if kvp argument exists, returns the updated kvp string.</summary>
            ///<param name="obj" type="object literal">object literal of key/values to set</param>
            ///<param name="kvp" type="string">String of key/value pairs, default grabs location.hash</param>
            ///<return>Returns true if success or false.  If kvp is passed in, not a location.hash, then on success it will
            ///return the newly set kvp object.</return>
            // test
            if (typeof(obj) !== 'object') return false;

            var pair = this.toObject(kvp) || this.toObject();
            var newObj = $.extend(pair, obj);

            if (kvp) {
                return $.param(newObj);
            } else {
                location.hash = $.param(newObj);
            }

            return true;
        },

        remove: function(key, kvp /*optional*/ ) {
            /// <summary>Removes the key from the pairs (ex: location.hash) string.</summary>
            /// <param name="key" type="object literal">object literal of key/values to set</param>
            /// <param name="kvp" type="string">[optional] String of key/value pairs, default grabs location.hash</param>
            // test
            if (typeof(key) === 'undefined' || key.length < 1) return false;

            // define
            var obj = this.toObject(kvp) || this.toObject();

            // remove item
            delete obj[key];

            // return updated obj
            if (typeof(kvp) != 'undefined') {
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
            for (var key in markers) {
                var regEx = new RegExp('{' + key + '}', 'g');
                string = string.replace(regEx, markers[key]);
            } 
        } else if (arguments.length > 1) { // markers is mixed arguments
            // loop through string
            for (var i = 0, il = arguments.length - 1; i < il; i++) {
                var regEx = new RegExp('\\{' + i + '\\}', 'g');
                string = string.replace(regEx, arguments[i + 1]);
            }
        }

        return string;
    },

    twoDigits: function(n) {
        ///<summary>Takes a single digit number and returns it as a string with pre-pending 0.
        ///Example 1 would be returned as 01.  Useful for date numbers.</summary>
        ///<param name="n">Number</param>
        return (n < 10) ? '' + 0 + n : '' + n;
    },

    pop: function(url, options /*optional*/ ) {
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

    nl2br: function(string) {
        ///<summary>Replaces any /n breaks with html <br />.  Useful for textarea data that is used in non-input dom elements.</summary>
        ///<param name="string">the string to parse</param>
        return string.replace(/\n/g, '<br />');
    },

    selectors: function(selectors /*unlimited arguments*/ ) {
        /// <summary>Build multiple selectors for jQuery.  Serves as a shortcut for jquery selectors by eleminating the use of [ + ', ' + ] between selectors or having to use jQuery.add().add()</summary>
        /// <param name="selectors">Can be an unlimited amount of arguments. Examples: Utils.slctrs(string1, string2, string3, string4)</param>
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

    truncate: function(string, maxChars, replaceWith /*optional*/ ) {
        ///<summary>Takes a string and truncates it if the length is larger than nMaxChars.</summary>
        ///<param name="string">String to truncate</param>
        ///<param name="maxChars">Max number of chars before it's truncated</param>
        ///<param name="replaceWith">String to replace with truncated text. Defaults to '&#8230;'</param>
        // test
        if (!string) return false;
        if (!maxChars || string.length <= maxChars) return string;

        // define
        var maxFit = maxChars - 3;
        var truncateAt = (truncateAt === -1 || truncateAt < maxChars / 2) ? maxFit : string.lastIndexOf(' ', maxFit);
        var replaceString = (arguments.length === 3) ? replaceWith : '&#8230;';

        // return truncated string
        return string.substr(0, truncateAt) + replaceString;
    },

    enterKeypress: function(inputField, buttonToClick, focusInputField) {
        /// <summary>Set "enter" keypress to click button when input field is in focus</summary>
        /// <param name="inputField" type="string">Selector for text input</param>
        /// <param name="buttonToClick" type="string">Selector for button to click</param>
        /// <param name="focusInputField" type="string">Pass in false to avoid the automatic .focus() call</param>
        $(inputField).off('keydown').on('keydown', function(e) {
            if (e.keyCode === 13) {
                e.preventDefault();
                $(buttonToClick).click();
            }
        });

        if ((focusInputField === undefined) || (focusInputField === true)) $(inputField).focus();
    },

    addCommas: function(num) {
        /// <summary>Returns a number with commas. Example 1234567 returns as 1,234,567</summary>
        /// <param name="num">Number to parse</param>
        num += ''; // convert number to string
        var numArray = num.split('.');
        var numA = numArray[0];
        var numB = numArray.length > 1 ? '.' + numArray[1] : '';
        var regEx = /(\d+)(\d{3})/;

        // loop through digits
        while (regEx.test(numA)) {
            numA = numA.replace(regEx, '$1' + ',' + '$2');
        }

        return numA + numB;
    },

    getResponseTimeInSecs: function(startTime, endTime) {
        /// <summary>Returns the response time from a start and end time (such as in XHR call) in seconds.</summary>
        /// <param name="startTime">JS Date</param>
        /// <param name="endTime">JS Date</param>
        return (endTime.getTime() - startTime.getTime()) / 1000;
    },

    unique: function(arr) {
        /// <summary>Returns an array of unique values</summary>
        /// <param name="arr">Array</param>
        var tempArray = {};
        var returnArray = [];
        for (var i = 0, n = arr.length; i < n; ++i) {
            if (!tempArray[arr[i]]) {
                tempArray[arr[i]] = true;
                returnArray.push(arr[i]);
            }
        }
        return returnArray;
    }
};

console.log(Helper.Kvp.toObject('key1=1&key2=2&key3&key4&key5=5'));
