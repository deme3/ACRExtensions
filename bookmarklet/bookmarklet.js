javascript: (function () {

var w = null;
var kDoc = null;
var kObj = null;

if (typeof window.KindleReaderContextMenu !== 'undefined') {
    w = window;
} else if (window.length) {
    for (var i=0;i<window.length;i++) {
        if (typeof window[i].KindleReaderContextMenu !== 'undefined') {
            w = window[i];
            break;
        }
    }
}

if (typeof w === 'object') {
    kObj = w.KindleReaderContextMenu;
    kDoc = w.document;

    if (typeof kObj.ACRExtensions === 'undefined') {
        kObj.ACRExtensions = true;
        var oldMethod = kObj.show;
        var oldHideMethod = kObj.hide;


        var listStyleExtra = document.createElement("style");
        listStyleExtra.type = "text/css";
        kDoc.head.appendChild(listStyleExtra);
        listStyleExtra.sheet.insertRule("#dictionary-widget-ext a {text-decoration: none; color: black;}");
        listStyleExtra.sheet.insertRule("#dictionary-widget-ext a:hover {text-decoration:underline;}");
        listStyleExtra.sheet.insertRule("#dictionary-widget-ext kbd {color: #039; font-family: serif,arial; font-size: 10pt;}");
        kObj.hide = function () {
            var res = oldHideMethod.apply(kObj, arguments);
            $("#dictionary-widget-ext", kDoc).remove();
            return res;
        };
        kObj.show = function () {
            var res = oldMethod.apply(kObj, arguments);
            var txtDoc = null;
            var r = null;

            if (typeof (arguments[3]) !== 'undefined' && typeof (arguments[3]['start']) !== 'undefined') {
                var sId = arguments[3]['start'];
                var eId = arguments[3]['end'];

                $('iframe', kDoc).each(function (j, textIframe) {
                    var textIFrameDoc = $(textIframe).contents().get(0);
                    if ($('#'+sId, textIFrameDoc).get(0) && $('#'+eId, textIFrameDoc).get(0)) {
                        txtDoc = textIFrameDoc;
                        return false;
                    }
                });

                if (txtDoc) {
                    r = txtDoc.createRange();
                    r.setStartBefore($('#'+sId, txtDoc).get(0));
                    r.setEndAfter($('#'+eId, txtDoc).get(0));
                }
            }

            $('#ACRExtensions_copyB_sep', kDoc).remove();
            $('#ACRExtensions_copyB', kDoc).remove();
            var sepEl = $('<div id="ACRExtensions_copyB_sep" class="kindle_menu_separator"></div>');
            var copyB = $('<div id="ACRExtensions_copyB" class="kindle_menu_button button_enabled ui-corner-left">Copy</div>');
            $('#kindle_menu_border', kDoc).append(sepEl).append(copyB);
            setTimeout(function(){
                sepEl.show();
                copyB.removeClass('button_hidden');
            }, 1);
            $('#ACRExtensions_copyB', kDoc).click(function (evt) {
                if (r) {
                    var newW = window.open('', 'ACRExtensions', "height=400,width=400,location=0,menubar=0,scrollbars=1,toolbar=0");
                    newW.document.body.appendChild(r.cloneContents());
                }
            });

            if (r) {
                /*
                <div class="ui-dialog ui-widget ui-widget-content ui-corner-all kindle_menu"
                style="display: block; z-index: 1002; outline: 0px; top: 522px; left: 388px; bottom: auto;
                height: 64px; width: auto;">
                <div class="ui-dialog-content ui-widget-content" style="display:block; width:auto; min-height: 0px; height: auto">This is content</div></div>
                */
                /* r = selected text
                // here we open the dictionary in-page pop-up*/
                $("#dictionary-widget-ext", kDoc).remove();
                var mainDialog = $(".ui-dialog.kindle_menu[role=dialog]", kDoc);
                var selectedWords = r.cloneContents().children;
                var targetPosition = mainDialog.position();

                var dictionaryUIWidget = document.createElement("div");
                dictionaryUIWidget.id = "dictionary-widget-ext";
                dictionaryUIWidget.className = "ui-dialog ui-widget ui-widget-content ui-corner-all kindle_menu";
                var topPosition = targetPosition.top - 320;
                if(topPosition < 0)
                    topPosition = targetPosition.top + 32;
                dictionaryUIWidget.style = "display: block; z-index: 1002; outline: 0px; max-height: 310px; top: " + topPosition + "px; left: " + (targetPosition.left) + "px; max-width:" + mainDialog.width() + "px";
                var dictionaryUIWidgetContent = document.createElement("div");
                dictionaryUIWidgetContent.className = "ui-dialog-content ui-widget-content";
                dictionaryUIWidgetContent.style = "display: block; width: auto; min-height: 0px; max-height: 310px; overflow-y: auto; height: auto";

                selectedWords = selectedWords[0]; /*TODO: add support for multiple words*/
                $.get("https://cors-anywhere.herokuapp.com/pocket.dict.cc/?s=" + selectedWords.innerText, (data) => {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(data, "text/html");
                    var definitions = doc.querySelectorAll("dt, dt + dd");
                    console.log(doc, definitions);
                    var list = document.createElement("ul");
                    list.style = "background-color:#eee;padding:6px 14px;list-style-type:none;";
                    dictionaryUIWidgetContent.innerText = "";
                    for(var x = 0; x < definitions.length; x++) {
                        if(definitions[x].tagName == "DD") {
                            list.children[list.children.length-1].appendChild(definitions[x]);
                        } else {
                            var listElement = document.createElement("li");
                            listElement.appendChild(definitions[x]);
                            list.appendChild(listElement);
                        }
                    }
                    var allLinks = list.getElementsByTagName("a");
                    for(var x = 0; x < allLinks.length; x++) {
                        allLinks[x].href = "http://pocket.dict.cc/" + new URL(allLinks[x].href).search;
                        allLinks[x].target = "_blank";
                    }
                    dictionaryUIWidgetContent.appendChild(list);
                });
                dictionaryUIWidgetContent.innerText = "Loading...";
                dictionaryUIWidget.appendChild(dictionaryUIWidgetContent);
                mainDialog[0].insertAdjacentElement("beforebegin", dictionaryUIWidget);
            }

            return res;
        };

        alert('ACRExtensions is now active.');
    } else {
        alert('ACRExtensions is already active.');
    }
} else {
    alert('Error: ACRExtensions is not active. Te Amazon Cloud Reader window could not be found.');
}
})();

