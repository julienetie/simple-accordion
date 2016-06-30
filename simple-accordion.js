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

(function(window, document, undefined) {

    function simpleAccordion(accordion, options){
        if(accordion.nodeType !== 1){
            console.error('nodeType is incorrect');
        }
        if(options.constructor !== {}.constructor){
            console.error('Options should be an object literal');
        }
        console.log(accordion, options);
    }


    window.simpleAccordion = simpleAccordion;
}(window, document, undefined))
