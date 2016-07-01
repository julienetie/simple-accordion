// var prefix = (function() {
//     var styles = window.getComputedStyle(document.documentElement, ''),
//         pre = (Array.prototype.slice
//             .call(styles)
//             .join('')
//             .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
//         )[1],
//         dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
//     return {
//         dom: dom,
//         lowercase: pre,
//         css: '-' + pre + '-',
//         js: pre[0].toUpperCase() + pre.substr(1)
//     };
// })();


// console.log(prefix);


// var contents = [].slice.call(document.getElementsByClassName('content'));
// var switches = [].slice.call(document.getElementsByClassName('switch'));

// contents.forEach(function(content) {

//     var content
//         // content.style.display = 'none';
//         // content.style.display = 'none';
//     content.style.height = '0';
//     // content.style.position = 'absolute';
//     content.style.overflow = 'hidden';
//     content.style.transition = 'all 0.5s ease';
// });

// switches.forEach(function(switch_) {
//     switch_.addEventListener('click', function() {
//         var content = this.parentNode.children[1];
//         var contentHeight = parseInt(window.getComputedStyle(content, null).getPropertyValue("height"), 10);
//         console.log(contentHeight)
//         if (contentHeight) {
//             this.parentNode.children[1].style.height = 0;
//         } else {
//             var contentBody = this.parentNode.children[1].children[0];
//             var contentBodyHeigtht = window.getComputedStyle(contentBody, null).getPropertyValue("height");
//             this.parentNode.children[1].style.height = contentBodyHeigtht;
//         }
//     })

// });

window.test = document.getElementsByClassName('accordion')[0];
/**
 * "Avoidance" of the use of:
 * new, call, bind, apply,  
 */


(function(window, document, undefined) {
window.sa = function(accordion, options){
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

        if (prop in elem.style)
            return prop;

        for (var len = prefixes.length; len--;) {
            if ((prefixes[len] + upper) in elem.style)
                return (prefixes[len] + upper);
        }
    }

    function randomReference() {
        return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    }

    simpleAccordion.init = function(accordion, options) {
        var $A = simpleAccordion,
            public = {},
            uniqueID = '' + Math.random(Date.now());
            instance = 0;
        if (typeof accordion === 'string') {
            accordion = document.querySelector(accordion);
        } else if (accordion.nodeType !== 1) {
            // console.error('nodeType is incorrect');
        }
        if (options.constructor !== {}.constructor) {
            // console.error('Options should be an object literal');
        }

        $A.options = options;
        $A.accordion = accordion;
        $A.id = randomReference() + uniqueID.substr(uniqueID.length -5, uniqueID.length -1);
        $A.setDefaults();
        $A.getElements();
        $A.setInitialState();
        $A.bindEvents();

        // console.info($A.id, $A.accordion)
        public.destroy = $A.destroy;
        return public;
    }

    simpleAccordion.setDefaults = function() {
        this.defaults.event = this.options.event || 'click';
        this.defaults.dimension = this.options.orientation === 'horizontal' ? 'width' : 'height';
        this.defaults.contentOverflow = this.options.contentOverflow || 'hidden';
        this.defaults.exposure = this.options.exposure || 0;
        this.defaults.dynamicContent = !this.options.dynamicContent || true;
    }

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

        // simpleAccordion.setInitialState();
        // simpleAccordion.bindEvents();
    }

    simpleAccordion.setInitialState = function() {
        var el = this.el;
        for (section in el) {
            // Get contentBody element
            var contentBody = el[section].contentBody;
            // Hide contents overflow
            el[section].content.style.overflow = this.defaults.contentOverflow;
            // Set content sections to zero dimension
            el[section].content.style[this.defaults.dimension] = this.defaults.exposure;
            // Set content transition 
            el[section].content.style[fix('transition')] = 'all 0.5s ease';
            // Get computed dimension immediately if content body is not dynamic
            if (this.defaults.dynamicContent) {
                this.store.contentComputedHeights[section] = parseInt(window.getComputedStyle(contentBody, null).getPropertyValue(this.defaults.dimension), 10);
            }
        }
    }

    simpleAccordion.filterEvents = function(e) {console.log($A.accordion)
            var el = $A.el,
                target = e.target;
            for (section in el) {
                if (el[section].switch === target) {
                    $A.toggleSection(el[section], section);
                }
            }
        }

    simpleAccordion.bindEvents = function() {
        var self = this;
        // Add one event type per accordion element
        this.accordion.addEventListener(this.defaults.event, simpleAccordion.filterEvents, false);
    }

    simpleAccordion.toggleSection = function(section, sectionName) {

        var contentBodyHeight = this.store.contentComputedHeights[sectionName];
        // Get "Content" height
        var contentHeight = parseInt(window.getComputedStyle(section.content, null).getPropertyValue(this.defaults.dimension), 10);

        if (contentHeight) {
            // Section content closed action
            section.content.style.height = 0;
        } else {
            // Section content opened action
            // Get computed dimension if content is dynamic
            if (!this.defaults.dynamicContent) {
                this.store.contentComputedHeights[sectionName] = parseInt(window.getComputedStyle(section.contentBody, null).getPropertyValue(this.defaults.dimension), 10);
            }
            section.content.style.height = contentBodyHeight + 'px';
        }
        console.log(contentHeight)
    }

    simpleAccordion.destroy = function() {
        console.log(simpleAccordion.accordion, simpleAccordion.defaults.event)
        simpleAccordion.accordion.removeEventListener(simpleAccordion.defaults.event, simpleAccordion.filterEvents);
    }

                            // var simpleAccordionINST = 
                                // console.log()
    // window.simpleAccordion = Object.assign({}, simpleAccordion).init;
    return simpleAccordion.init(accordion, options);
}
}(window, document, undefined))
