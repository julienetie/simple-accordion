(function(window, $) {
    'use strict';
    /////////////////////////
    /////////////////////////

    var simpleAccordion = function(accordion, options) {
        var $A = {};

        $A.el = {};
        $A.store = {};
        $A.store.contentComputedHeights = {};
        $A.sectionNodes = [];
        $A.defaults = {};


        /**
         * Adds vendor prefix for CSS properties.
         * @See {@Link http://addyosmani.com/polyfillthehtml5gaps/slides/#78}
         * @param  {HTMLElement} 
         * @return {String}      Vendor prefix
         */
        function fixCSSProperty(property) {
            // Upper case first vendor prefixes.
            var prefixes = ['Moz', 'Khtml', 'Webkit', 'O', 'ms'];
            var prefixesLength = prefixes.length;
            var el = document.createElement('div');
            var elStyle = el.style;
            var upperCaseFirstProperty = property.charAt(0).toUpperCase() + property.slice(1);

            // Use standard property if supported.
            if (property in elStyle) return property;

            // Use prefixed property if supported.
            for (prefixesLength; prefixesLength--;) {
                if ((prefixes[prefixesLength] + upperCaseFirstProperty) in elStyle) {
                    return (prefixes[prefixesLength] + upperCaseFirstProperty);
                }
            }
        }


        /**
         * Retrieve options supplied via the data-simple-accordion attribute.
         * Options from data-simple-accordion are declaired similarly to CSS
         * properties and values. Some options may not be declaired using 
         * data-simple-accordion. Check the documentation for more information.
         * @param  {String} accordion   The accordion element
         * @param  {Undefined} options  The presumably undefined options
         * @return {Object}             data-simple-accordion data as an object
         */
        function getOptionsViaDataset(accordion, options) {
            var dataSimpleAccordion = accordion.getAttribute('data-simple-accordion');
            var optionsFromDataset = {};
            var dataArray;

            // For each array value (as key value pair string), convert each to array.
            function keyValuePairsToArray(pair) {
                return pair.split(':').map(function(part) {
                    return part.replace(';', '').trim();
                });
            }

            // Assing optionsFromDataset from 2D array with first keys as property names assgined to 2nd key values.
            function assignToObject(pairAsArray) {
                optionsFromDataset[pairAsArray[0]] = pairAsArray[1];
            };

            // Ensures there are no options and that the dataset was retrieved.
            if (!options && dataSimpleAccordion) {

                // Convert all semi-colons to commas, then split into an array. 
                dataArray = dataSimpleAccordion.replace(/;/ig, ',').split(',');
                dataArray
                    .map(keyValuePairsToArray)
                    .forEach(assignToObject);
            } else {
                console.error('No object or data-simple-accordion options found');
            }
            return optionsFromDataset;
        }


        /**
         * A component of a unqiue identifier for the simpleAccordion instance. 
         * @return {String}     Alpha characters
         */
        function randomReference() {
            return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
        }


        /**
         * Reduces overclicking/ touching by throttling the callback to be 
         * delayed until the set delay. 
         * @param  {Function}   callback  handler
         * @param  {Number}     delay    delay in milliseconds
         * @return {Function}            Throttle inner function without wait
         */
        function throttle(callback, delay) {
            var wait = false;
            return function() {
                if (!wait) {
                    callback.call();
                    wait = true;
                    setTimeout(function() {
                        wait = false;
                    }, delay);
                }
            }
        }


        $A.init = function(accordion, options) {
            var publicMethods = {};
            var uniqueID = '' + Math.random(Date.now());
            var isSelectorAString = typeof accordion === 'string';
            var isSelectorAnElement = accordion.nodeType === 1;
            var optionsIsOfTypeObject;
            var accordioElement;
            var optionsAsObject;

            if (options) {
                optionsIsOfTypeObject = options.constructor === {}.constructor;
                optionsAsObject = options;
            } else {
                optionsIsOfTypeObject = false;
            }

            accordioElement = isSelectorAnElement ? accordion : isSelectorAString ? document.querySelector(accordion) : console.error('nodeType is incorrect');

            if (optionsIsOfTypeObject) {
                if (!optionsIsOfTypeObject) console.error('Options should be an object literal');
                return;
            } else {
                optionsAsObject = getOptionsViaDataset(accordioElement, options);
            }

            $A.options = optionsAsObject;
            $A.accordion = accordioElement;
            $A.id = randomReference() + uniqueID.substr(uniqueID.length - 5, uniqueID.length - 1);
            $A.setDefaults();
            $A.getElements();
            $A.setInitialState();
            $A.bindEvents($A.filterEvents, $A.toggleSection, this);

            publicMethods.destroy = $A.destroy;
            return publicMethods;
        };


        $A.setDefaults = function() {
            this.defaults.dimension = this.options.orientation === 'horizontal' ? 'width' : 'height';
            this.defaults.dynamicContent = !this.options.dynamicContent || true;
            this.defaults.contentBodyVisibility = this.options.contentBodyVisibility || 'visible';
            this.defaults.contentOverflow = this.options.contentOverflow || 'hidden';
            this.defaults.event = this.options.event || 'click';
            this.defaults.exposure = this.options.exposure || 0;
            this.defaults.siblingBehavior = this.options.siblingBehavior || 'immediate';
            this.defaults.throttleDelay = this.options.throttleDelay || 300;
            this.defaults.delayTimingFn = this.options.delayTimingFn || 'animationFrame'; // 'setTimeout'
        };


        $A.getElements = function() {
            var el = this.el;
            var sectionNodes = this.sectionNodes;
            var options = this.options;
            var prefix = 'section-';
            var id;

            sectionNodes = sectionNodes.slice.call(this.accordion.querySelectorAll(options.section));

            sectionNodes.forEach(function(section, i) {
                id = el[prefix + i] = {};
                id.section = section;
                id.trigger = section.querySelector(options.trigger);
                id.indicator = section.querySelector(options.indicator);
                id.content = section.querySelector(options.content);
                id.contentBody = el[prefix + i].content.children[0];
                id.close = el[prefix + i].contentBody.querySelector(options.close);
            });
        };


        $A.setInitialState = function() {
            var el = this.el;
            var section;
            var contentBody;
            var elSection;
            var defaults = this.defaults;

            for (section in el) {
                elSection = el[section];
                // Get contentBody element
                contentBody = elSection.contentBody;
                // Hide contents overflow
                elSection.content.style.overflow = defaults.contentOverflow;
                // Set content sections to zero dimension
                elSection.content.style[defaults.dimension] = defaults.exposure;
                // Set content transition 
                elSection.content.style[fixCSSProperty('transition')] = 'all .3s ease';
                // Get computed dimension immediately if content body is not dynamic
                if (defaults.dynamicContent) {
                    this.store.contentComputedHeights[section] = parseInt(window.getComputedStyle(contentBody, null).getPropertyValue(defaults.dimension), 10);
                }
                // Set content body visibility 
                elSection.contentBody.style.visibility = defaults.contentBodyVisibility;
            }
        };


        $A.filterEvents = function(e, toggleSection, $A) {
            var el = $A.el;
            var target = e.target;
            var currentSection;
            var section;

            for (section in el) {
                currentSection = el[section];
                if (currentSection.trigger === target) toggleSection(currentSection, section, $A);
            }
        };


        $A.bindEvents = function(filterEvents, toggleSection, $A) {
            var prevent = false;

            this.accordion.addEventListener(this.defaults.event, function(e) {
                if (prevent) return;

                prevent = true;

                filterEvents(e, toggleSection, $A);

                setTimeout(function() {
                    prevent = false;
                }, $A.defaults.throttleDelay);

            }, false);
        };


        $A.toggleSection = function(section, sectionName, $A) {
            var dimension = $A.defaults.dimension;
            var contentClosed = parseInt(window.getComputedStyle(section.content, null).getPropertyValue(dimension), 10);
            var siblingBehavior = $A.defaults.siblingBehavior;
            var nonNumeric = /[^\d.]/g;
            var preConfine = siblingBehavior.indexOf('pre-confine') >= 0 ? siblingBehavior : null;
            var postConfine = siblingBehavior.indexOf('post-confine') >= 0 ? siblingBehavior : null;
            var selectedToggled;
            var delay;
            var siblingsToggle

            switch (siblingBehavior) {
                case 'immediate':
                    {
                        // console.log('DO IMMEDIATE');
                        // siblingBehaviors.immediate();
                        break;
                    }
                case preConfine:
                    {
                        // var delay = preConfine.replace(nonNumeric, '');
                        // siblingsToggled = $A.preConfine();
                        break;
                    }
                case postConfine:
                    {
                        delay = postConfine.replace(nonNumeric, '');

                        selectedToggled = $A.toggleSelected(
                            section,
                            sectionName,
                            contentClosed,
                            dimension,
                            delay
                        );

                        $A.SiblingBehavior.postConfine(selectedToggled, dimension, delay, sectionName);
                        break;
                    }
                case 'remain':
                    {
                        // console.log('SIBLINGS REMAIN OPEN');
                        siblingBehaviors.remain();
                        break;
                    }
            }
        };

        $A.toggleSelected = function(section, sectionName, contentClosed, dimension) {
            var self = this;
            var contentBodyDimension;

            return new Promise(function(resolve) {
                contentBodyDimension = self.store.contentComputedHeights[sectionName];

                if (contentClosed) {
                    section.content.style[dimension] = 0;
                } else {
                    // Get computed dimension if content is dynamic
                    if (self.defaults.dynamicContent) {
                        self.store.contentComputedHeights[sectionName] = parseInt(window.getComputedStyle(section.contentBody, null).getPropertyValue(self.defaults.dimension), 10);
                    }
                    section.content.style[dimension] = contentBodyDimension + 'px';
                }
                transitionEnd(section.content).bindEvent(function() {
                    transitionEnd(this).unbindEvent();
                    resolve();
                });

            });
        }

        $A.SiblingBehavior = {};

        // $A.SiblingBehavior.prototype.immediate = function() {
        //     // console.log('immediate', this.siblingSectionNames, this.$A);
        // };

        // $A.SiblingBehavior.prototype.preConfine = function(selectedToggled, dimension) {
        //     var self = this;
        //     selectedToggled.then(function(results) {
        //         self.siblingSections.forEach(function(siblingSection) {
        //             clearTimeout(results);
        //             siblingSection.content.style[dimension] = 0;
        //         })
        //     });
        // };

        /**
         * Post Confine begins from the first click not pending till the delay.
         * @param  {[type]} selectedToggled    [description]
         * @param  {[type]} dimension          [description]
         * @param  {[type]} delay              [description]
         * @param  {[type]} currentSectionName [description]
         * @return {[type]}                    [description]
         */
        $A.SiblingBehavior.postConfine = function(selectedToggled, dimension, delay, currentSectionName) {
            var self = this;
            var timimgFn = delay ? setTimeout : setImmediate;
            var timingID;
            var section;
            var el = $A.el;

            this.el = el;
            this.$A = $A;
            this.siblingSections = [];

            // Get sibling sections
            for (section in el) {
                if (section !== currentSectionName) {
                    this.siblingSections.push(el[section]);
                }
            }

            selectedToggled.then(function(results) {
                timingID = timimgFn(function() {

                    self.siblingSections.forEach(function(siblingSection) {
                        siblingSection.content.style[dimension] = 0;

                    });
                }, delay);
            }).catch(function(e) {
                console.log('error', e);
            });
        };

        // $A.SiblingBehavior.prototype.remain = function() {
        //     // console.log('remain', this.siblingSectionNames);
        // };
        // 

        $A.childrenBehavior = {};

        $A.destroy = function() {
            $A.accordion.removeEventListener($A.defaults.event, $A.filterEvents);
        };

        return $A.init(accordion, options);
    };

    //////////////////////////////////////
    //////////////////////////////////////
    /**
     * jQuery wrapper 
     */
    $.fn.simpleAccordion = function(options) {
        this.each(function() {
            simpleAccordion(this, options);
        });

        return this;
    }

    //////////////////////////////////////
    //////////////////////////////////////

    // Node.js/ CommonJS
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = exports = simpleAccordion;
    }

    // AMD
    else if (typeof define === 'function' && define.amd) {
        define(function() {
            return simpleAccordion;
        });
    }

    // Default to window as global
    else if (typeof window === 'object') {
        window.simpleAccordion = simpleAccordion;
    }
    /* global -module, -exports, -define */

}(typeof window === "undefined" ? {} : window, jQuery));
