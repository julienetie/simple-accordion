(function(window, $) {
    /////////////////////////
    /////////////////////////

    var simpleAccordion = function(accordion, options) {
        var simpleAccordion = {},
            $A = simpleAccordion;
        $A.id = '';
        $A.el = {};
        $A.store = {};
        $A.store.contentComputedHeights = {};
        $A.accordion = '';
        $A.sectionNodes = [];
        $A.defaults = {};


        // http://addyosmani.com/polyfillthehtml5gaps/slides/#78
        function fix(prop) {
            var prefixes = ['Moz', 'Khtml', 'Webkit', 'O', 'ms'],
                elem = document.createElement('div'),
                upper = prop.charAt(0).toUpperCase() + prop.slice(1);

            if (prop in elem.style) {
                return prop;
            }

            for (var len = prefixes.length; len--;) {
                if ((prefixes[len] + upper) in elem.style) {
                    return (prefixes[len] + upper);
                }
            }
        }


        function getOptionsViaDataset(accordion, options) {
            var data = accordion.getAttribute('data-simple-accordion'),
                dataArray, optionsFromDataset = {};


            if (!options && accordion.getAttribute('data-simple-accordion')) {
                dataArray = data.replace(/;/ig, ',').split(',');
                dataArray.map(function(pair) {
                    return pair.split(':').map(function(part) {
                        return part.replace(';', '').trim();
                    });
                }).forEach(function(pairAsArray) {
                    optionsFromDataset[pairAsArray[0]] = pairAsArray[1];
                });
            } else {
                console.error('No object or data-simple-accordion options found');
            }
            return optionsFromDataset;
        }


        function randomReference() {
            return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
        }


        simpleAccordion.init = function(accordion, options) {
            var $A = simpleAccordion,
                public = {},
                uniqueID = '' + Math.random(Date.now());

            var isSelectorAString = typeof accordion === 'string',
                isSelectorAnElement = accordion.nodeType === 1,
                isOptionsAnObjectLiteral;
            if (options) {
                isOptionsAnObjectLiteral = options.constructor === {}.constructor;
            } else {
                isOptionsAnObjectLiteral = null;
            }

            accordion = isSelectorAnElement ? accordion : isSelectorAString ? document.querySelector(accordion) : console.error('nodeType is incorrect');

            if (options) {
                if (!isOptionsAnObjectLiteral) {
                    console.error('Options should be an object literal');
                }
            } else {
                options = getOptionsViaDataset(accordion, options);
            }


            $A.options = options;
            $A.accordion = accordion;
            $A.id = randomReference() + uniqueID.substr(uniqueID.length - 5, uniqueID.length - 1);
            $A.setDefaults();
            $A.getElements();
            $A.setInitialState();
            $A.bindEvents(simpleAccordion.filterEvents, simpleAccordion.toggleSection, this);

            // console.info($A.id, $A.accordion)
            public.destroy = $A.destroy;
            return public;
        };


        simpleAccordion.setDefaults = function() {
            this.defaults.dimension = this.options.orientation === 'horizontal' ? 'width' : 'height';
            this.defaults.dynamicContent = !this.options.dynamicContent || true;
            this.defaults.contentBodyVisibility = this.options.contentBodyVisibility || 'visible';
            this.defaults.contentOverflow = this.options.contentOverflow || 'hidden';
            this.defaults.event = this.options.event || 'click';
            this.defaults.exposure = this.options.exposure || 0;
            this.defaults.siblingBehavior = this.options.siblingBehavior || 'immediate';
        };


        simpleAccordion.getElements = function() {
            var el = this.el,
                sectionNodes = this.sectionNodes,
                options = this.options,
                prefix = 'section-',
                id;

            sectionNodes = sectionNodes.slice.call(this.accordion.querySelectorAll(options.section));

            sectionNodes.forEach(function(section, i) {
                id = el[prefix + i] = {};
                id.section = section;
                id.switch = section.querySelector(options.switch);
                id.indicator = section.querySelector(options.indicator);
                id.content = section.querySelector(options.content);
                id.contentBody = el[prefix + i].content.children[0];
                id.close = el[prefix + i].contentBody.querySelector(options.close);
            });
        };


        simpleAccordion.setInitialState = function() {
            var el = this.el,
                section;
            for (section in el) {
                // Get contentBody element
                var contentBody = el[section].contentBody;
                // Hide contents overflow
                el[section].content.style.overflow = this.defaults.contentOverflow;
                // Set content sections to zero dimension
                el[section].content.style[this.defaults.dimension] = this.defaults.exposure;
                // Set content transition 
                el[section].content.style[fix('transition')] = 'all .3s ease';
                // Get computed dimension immediately if content body is not dynamic
                if (this.defaults.dynamicContent) {
                    this.store.contentComputedHeights[section] = parseInt(window.getComputedStyle(contentBody, null).getPropertyValue(this.defaults.dimension), 10);
                }
                el[section].contentBody.style.visibility = this.defaults.contentBodyVisibility;
            }
        };


        simpleAccordion.filterEvents = function(e, toggleSection, $A) {
            var el = $A.el,
                target = e.target,
                currentSection,
                section;

            for (section in el) {
                currentSection = el[section];
                if (currentSection.switch === target) {
                    toggleSection(currentSection, section, $A);
                }
            }
        };


        simpleAccordion.bindEvents = function(filterEvents, toggleSection, $A) {
            this.accordion.addEventListener(this.defaults.event, function(e) {
                filterEvents(e, toggleSection, $A);
            }, false);
        };


        simpleAccordion.toggleSection = function(section, sectionName, $A) {
            var dimension = $A.defaults.dimension,
                contentClosed = parseInt(window.getComputedStyle(section.content, null).getPropertyValue(dimension), 10),
                siblingBehavior = $A.defaults.siblingBehavior;

            // console.log(siblingBehavior.indexOf('preconfine') > -1)

            var preConfine = siblingBehavior.indexOf('pre-confine') >= 0 ? siblingBehavior : null;
            var postConfine = siblingBehavior.indexOf('post-confine') >= 0 ? siblingBehavior : null;

            var siblingBehaviors = new simpleAccordion.SiblingBehavior($A, sectionName);
            var selectedToggled;

            switch (siblingBehavior) {
                case 'immediate':
                    // console.log('DO IMMEDIATE');

                    siblingBehaviors.immediate();
                    break;

                case preConfine:
                    // console.log('DO PRE CLOSE STUFF');
                    siblingBehaviors.preConfine();
                    break;

                case postConfine:
                    var delay = postConfine.replace(/[^\d.]/g, '');
                    if (delay) {
                        selectedToggled = $A.toggleSelected(
                            section,
                            sectionName,
                            contentClosed,
                            dimension,
                            setTimeout,
                            delay
                        );
                    } else {
                        selectedToggled = $A.toggleSelected(
                            section,
                            sectionName,
                            contentClosed,
                            dimension,
                            setTimeout,
                            delay
                        );
                    }

                    siblingBehaviors.postConfine(selectedToggled);
                    break;

                case 'remain':
                    // console.log('SIBLINGS REMAIN OPEN');
                    siblingBehaviors.remain();
                    break;
            }


            // Defualt open triggered section content 
            // if (contentClosed) {
            //     section.content.style.height = 0;
            // } else {
            //     // Get computed dimension if content is dynamic
            //     if (!$A.defaults.dynamicContent) {
            //         $A.store.contentComputedHeights[sectionName] = parseInt(window.getComputedStyle(section.contentBody, null).getPropertyValue($A.defaults.dimension), 10);
            //     }
            //     section.content.style.height = contentBodyDimension + 'px';
            // }

        };

        simpleAccordion.toggleSelected = function(section, sectionName, contentClosed, dimension, timimgFn, delay) {
            var self = this;
            return new Promise(function(resolve) {
                timimgFn(function() {
                    var contentBodyDimension = self.store.contentComputedHeights[sectionName]
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
                        resolve('FINISHED');
                        transitionEnd(this).unbindEvent();
                    });
                }, delay);
            });
        }

        simpleAccordion.SiblingBehavior = function($A, currentSectionName) {
            var section;
            this.$A = $A;
            this.el = $A.el;
            this.currentSectionName = currentSectionName;
            this.siblingSectionNames = [];

            // Get sibling sections
            for (section in this.el) {
                if (section !== currentSectionName) {
                    this.siblingSectionNames.push(section);
                }
            }

        }

        simpleAccordion.SiblingBehavior.prototype.immediate = function() {
            // console.log('immediate', this.siblingSectionNames, this.$A);
        };

        simpleAccordion.SiblingBehavior.prototype.preConfine = function() {
            // console.log('preConfine', this.siblingSectionNames);
        };

        simpleAccordion.SiblingBehavior.prototype.postConfine = function(selectedToggled) {
            // console.log('postConfine', this.siblingSectionNames);
            selectedToggled.then(function(results) {
                console.log(results + ' ' + ' in postConfine');
            });
        };

        simpleAccordion.SiblingBehavior.prototype.remain = function() {
            // console.log('remain', this.siblingSectionNames);
        };


        window.sa = simpleAccordion.siblingBehavior;

        simpleAccordion.destroy = function() {
            simpleAccordion.accordion.removeEventListener(simpleAccordion.defaults.event, simpleAccordion.filterEvents);
        };

        return simpleAccordion.init(accordion, options);
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
