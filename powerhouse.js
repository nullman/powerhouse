/*==============================================================================
 * powerhouse.js
 *
 * PowerHouse Javascript
 *
 * Author: Kyle W T Sherman
 *
 * Time-stamp: <2012-03-12 00:08:05 (kyle)>
 *============================================================================*/

var version = '0.9.4';
var releaseDate = '2012-03-11';
var buildVersion = 1;
var siteName = 'PowerHouse';
var siteUrl = 'http://powerhouse.nullware.com/';
var buildUrl = siteUrl+'powerhouse.html';
var mouseX = 0;
var mouseY = 0;
var clickableClasses = new Array();
clickableClasses[0] = 'selection';
clickableClasses[1] = 'link';

// set and get cookies
function setCookie(name, value, expireDays)
{
    var expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + expireDays);
    var cookieValue = escape(value)+((expireDays == null) ? "" : "; expires="+expireDate.toUTCString());
    document.cookie = name+"="+cookieValue;
}
window['setCookie'] = setCookie;
function getCookie(name)
{
    var cookies = document.cookie.split(";");
    for (var i=0; i<cookies.length; i++) {
        var x = cookies[i].substr(0, cookies[i].indexOf("="));
        var y = cookies[i].substr(cookies[i].indexOf("=")+1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == name) return unescape(y);
    }
    return null;
}
window['getCookie'] = getCookie;

// encode number to url code
// valid number range is 0-61 (invalid numbers default to 0)
function numToCharCode(num) {
    var code = 0;
    if (num >= 0 && num <= 9) code = num+48;
    if (num >= 10 && num <= 35) code = num+55;
    if (num >= 36 && num <= 61) code = num+61;
    return String.fromCharCode(code);
}
window['numToCharCode'] = numToCharCode;
// decode url code to number
// invalid codes default to 0
function codeToNum(code) {
    var num = 0;
    if (code >= 48 && code <= 57) num = code-48;
    if (code >= 65 && code <= 90) num = code-55;
    if (code >= 97 && code <= 122) num = code-61;
    return num;
}
window['codeToNum'] = codeToNum;

// get data sets (from powerhouse-data.js)
var dataSuperStat = getDataSuperStat();
var dataInnateTalent = getDataInnateTalent();
var dataTalent = getDataTalent();
var dataTravelPower = getDataTravelPower();
var dataPowerSet = getDataPowerSet();
var dataFramework = getDataFramework();
var dataPower = getDataPower();
var dataEnergyUnlockPower = getDataEnergyUnlockPower();
var dataArchetypeGroup = getDataArchetypeGroup();
var dataArchetype = getDataArchetype();
var dataVersionUpdate = getDataVersionUpdate();

// power code lookup
var dataPowerIdFromCode = new Array();
for (var i=0; i<dataPower.length; i++) {
    dataPowerIdFromCode[dataPower[i].code()] = parseInt(i);
}

// power set lookup
var dataPowerIdFromPowerSet = new Array();
for (var i=0; i<dataPower.length; i++) {
    var powerSet = dataPower[i].powerSet;
    if (powerSet != null) {
        if (dataPowerIdFromPowerSet[powerSet] == undefined) {
            dataPowerIdFromPowerSet[powerSet] = new Array();
        }
        dataPowerIdFromPowerSet[powerSet].push(parseInt(i));
    }
}

// power framework lookup
var dataPowerIdFromFramework = new Array();
for (var i=0; i<dataPower.length; i++) {
    var framework = dataPower[i].framework;
    if (framework != null) {
        if (dataPowerIdFromFramework[framework] == undefined) {
            dataPowerIdFromFramework[framework] = new Array();
        }
        dataPowerIdFromFramework[framework].push(parseInt(i));
    }
}

// version update lookup
var dataVersionUpdateLookup = new Array();
var versionUpdateId = 0;
for (var i=1; i<buildVersion; i++) {
    var posUpdate = new Array();
    var update = dataVersionUpdate[versionUpdateId];
    while (update.version == i) {
        posUpdate[update.pos] = update.id;
    }
    dataVersionUpdateLookup[i] = posUpdate;
}

// current power house character info
var phVersion = buildVersion;
var phName = '';
var phArchetype = dataArchetype[1];
var phSuperStat = new Array();
for (var i=1; i<=3; i++) {
    phSuperStat[i] = dataSuperStat[0];
}
var phInnateTalent = Array();
for (var i=1; i<=1; i++) {
    phInnateTalent[i] = dataInnateTalent[0];
}
var phTalent = new Array();
for (var i=1; i<=6; i++) {
    phTalent[i] = dataTalent[0];
}
var phTravelPower = new Array();
for (var i=1; i<=2; i++) {
    phTravelPower[i] = dataTravelPower[0];
}
var phTravelPowerAdvantage = new Array();
for (var i=1; i<=2; i++) {
    phTravelPowerAdvantage[i] = 0;
}
var phPower = new Array();
for (var i=1; i<=14; i++) {
    phPower[i] = dataPower[0];
}
var phPowerAdvantage = new Array();
for (var i=1; i<=14; i++) {
    phPowerAdvantage[i] = 0;
}
var phBuildLink = '';
var phBuildLinkRef = '';
var statFrameworkCount = new Array();
for (var i=1; i<=dataFramework.length; i++) {
    statFrameworkCount[i] = 0;
}
var statPowerSetCount = new Array();
for (var i=0; i<dataPowerSet.length; i++) {
    statPowerSetCount[i] = 0;
}
var statEnergyBuilder = 0;
var statEnergyUnlock = 0;
var statTier4 = 0;
var statAdvantagePoints = 0;
var maxAdvantagePointsTotal = 36;
var maxAdvantagePointsPerPower = 5;
var selectedNum = 0;
var selectedFieldId = null;
var selectedFieldClass = null;
var prevSelectedFramework = 0;

// event functions
function catchEvent(eventObj, event, eventHandler) {
    if (eventObj.addEventListener) {
        eventObj.addEventListener(event, eventHandler, false);
    } else if (eventObj.attachEvent) {
        event = 'on'+event;
        eventObj.attachEvent(event, eventHandler);
    }
}
window['catchEvent'] = catchEvent;
function setupEvents(evnt) {
    // disable enter key in forms
    catchEvent(document, 'keypress', noEnter);
    // mouseX and mouseY
    catchEvent(document, 'mousemove', setMouseXY);
    // change name
    catchEvent(document.getElementById('editName'), 'change', changeName);
    // close popups when main document is clicked, but not when the popup divs are clicked
    catchEvent(document, "mouseup", selectClearMaybe);
}
window['setupEvents'] = setupEvents;
catchEvent(window, 'load', setupEvents);

// disable enter key (used in form fields)
function noEnter(evnt) {
    //return !(window.event && window.event.keyCode == 13);
    var evnt = (evnt) ? evnt : ((event) ? event : null);
    var node = (evnt.target) ? evnt.target : ((evnt.srcElement) ? evnt.srcElement : null);
    if ((evnt.keyCode == 13) && (node.type == 'text')) { changeName(); }
}
window['noEnter'] = noEnter;
// document.onkeypress = noEnter;

// set mouseX and mouseY globals
function setMouseXY(evnt) {
    var x, y;
    try { x = evnt.pageX; y = evnt.pageY; } // firefox
    catch(e) { x = event.x; y = event.y; } // internet explorer
    mouseX = x;
    mouseY = y;
}
window['setMouseXY'] = setMouseXY;

// popup (tool tip)
function popup(text) {
    var x = mouseX;
    var y = mouseY;
    var xoffset = 20;
    var yoffset = 10;
    var margin = 50;
    var tip = document.getElementById('popup');
    var width = (document.documentElement.clientWidth || document.body.clientWidth || document.body.scrollWidth);
    var height = (window.scrollY || document.documentElement.scrollTop || document.body.scrollTop) +
        (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || document.body.scrollHeight);
    tip.innerHTML = text;
    tip.style.display = 'block';
    x += xoffset;
    y += yoffset;
    if (x > width-tip.offsetWidth-margin) x = width-tip.offsetWidth-margin;
    if (y > height-tip.offsetHeight-margin) y = height-tip.offsetHeight-margin;
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    tip.style.left = x+'px';
    tip.style.top = y+'px';
}
window['popup'] = popup;
function popout() {
    var tip = document.getElementById('popup');
    tip.style.display = 'none';
}
window['popout'] = popout;

// hide/show section
function hideSection(id) {
    document.getElementById(id).style.display = 'none';
}
window['hideSection'] = hideSection;
function showSection(id) {
    document.getElementById(id).style.display = '';
}
window['showSection'] = showSection;

// show and position section
// if right is true, then orientation is to the right
// if right is false, then orientation is to the left
function showPositionSection(id, right) {
    var x = mouseX;
    var y = mouseY;
    var xoffset = ((right) ? 20 : -20);
    var yoffset = 10;
    var margin = 50;
    var section = document.getElementById(id);
    var width = (document.documentElement.clientWidth || document.body.clientWidth || document.body.scrollWidth);
    var height = (window.scrollY || document.documentElement.scrollTop || document.body.scrollTop) +
        (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || document.body.scrollHeight);
    showSection(section.id);
    x += xoffset;
    y += yoffset;
    if (!right) x = x-section.offsetWidth;
    if (x > width-section.offsetWidth-margin) x = width-section.offsetWidth-margin;
    if (y > height-section.offsetHeight-margin) y = height-section.offsetHeight-margin;
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    section.style.top = y+'px';
    section.style.left = x+'px';
}
window['showPositionSection'] = showPositionSection;

// name functions
function editName() {
    hideSection('sectionDisplayName');
    showSection('sectionEditName');
    document.getElementById('editName').focus();
}
window['editName'] = editName;
function cancelName() {
    hideSection('sectionEditName');
    showSection('sectionDisplayName');
}
window['cancelName'] = cancelName;
function changeName(evnt) {
    //var evnt = evnt ? evnt : window.event;
    //var target = evnt.target ? evnt.target : evnt.srcElement;
    phName = document.getElementById('editName').value;
    hideSection('sectionEditName');
    document.getElementById('fieldName').firstChild.data = phName;
    showSection('sectionDisplayName');
    changeUpdate();
}
window['changeName'] = changeName;
// enter key also changes name
// function changeNameEnter() {
//     var test = (window.event && window.event.keyCode == 13);
//     if (test) changeName(window.event);
//     return !test;
// }

// clear selections
function selectClear() {
    if (selectedFieldId && selectedFieldClass) {
        var field = document.getElementById(selectedFieldId);
        field.setAttribute('class', selectedFieldClass);
    }
    selectedNum = 0;
    selectedFieldId = null;
    selectedFieldClass = null;
    hideSection('selectionSuperStat');
    hideSection('selectionInnateTalent');
    hideSection('selectionTalent');
    hideSection('selectionTravelPower');
    hideSection('selectionTravelPowerAdvantage');
    hideSection('selectionPower');
    hideSection('selectionPowerAdvantage');
    hideSection('selectionArchetype');
    hideSection('selectionArchetypePower');
    changeUpdate();
}
window['selectClear'] = selectClear;

// clear selections on mouse click outside of div
// note: any clickable items must be in the inner if statement in order to work
function selectClearMaybe(evnt) {
    var node = (evnt.target) ? evnt.target : ((evnt.srcElement) ? evnt.srcElement : null);
    if (!checkParent(node)) selectClear();
    // check if any parent is a selection class
    function checkParent(node) {
        while (node.parentNode) {
            var test = false;
            for (i=0; i<clickableClasses.length; i++) {
                if (node.className == clickableClasses[i]) test = true;
            }
            if (test) return true;
            node = node.parentNode;
        }
        return false;
    }
}
window['selectClearMaybe'] = selectClearMaybe;

// super stat functions
function selectSuperStat(num) {
    var fieldId = 'fieldSuperStat'+num;
    var field = document.getElementById(fieldId);
    if (selectedFieldId == fieldId) {
        selectClear();
    } else {
        selectClear();
        selectedNum = num;
        selectedFieldId = fieldId;
        selectedFieldClass = field.getAttribute('class');
        field.setAttribute('class', 'selectedButton');
        showPositionSection('selectionSuperStat', true);
    }
}
window['selectSuperStat'] = selectSuperStat;
function setSuperStat(id) {
    var num = selectedNum;
    var field = document.getElementById('fieldSuperStat'+num);
    var selectField = document.getElementById('selectSuperStat'+id);
    var oldId = phSuperStat[num].id;
    var oldSelectField = document.getElementById('selectSuperStat'+oldId);
    var swapNum = 0;
    var swapField;
    if (id != oldId) {
        if (id > 0) {
            for (var i=1; i<phSuperStat.length; i++) {
                if (i != num && phSuperStat[i].id == id) {
                    swapNum = i;
                    swapField = document.getElementById('fieldSuperStat'+i);
                }
            }
        }
        phSuperStat[num] = dataSuperStat[id];
        if (id == 0) {
            field.innerHTML = getSuperStatDefault(num);
        } else {
            field.innerHTML = getSuperStatDesc(id, num);
            selectField.setAttribute('class', 'takenButton');
        }
        if (swapNum > 0) {
            phSuperStat[swapNum] = dataSuperStat[oldId];
            if (oldId != 0) {
                swapField.innerHTML = getSuperStatDesc(oldId, swapNum);
            } else {
                swapField.innerHTML = getSuperStatDefault(swapNum);
            }
        } else if (oldId != 0) {
            oldSelectField.setAttribute('class', 'button');
        }
    }
    selectClear();
}
window['setSuperStat'] = setSuperStat;
function getSuperStatDefault(num) {
    if (num == 1) {
        return '<span><img src="img/blank.png" />&nbsp;Primary Super Stat</span>';
    } else {
        return '<span><img src="img/blank.png" />&nbsp;Secondary Super Stat '+(num-1)+'</span>';
    }
}
window['getSuperStatDefault'] = getSuperStatDefault;
function getSuperStatDesc(id, num) {
    return dataSuperStat[id].desc+' <span class="spec">'+((num == 1) ? '(Primary)' : '(Secondary)')+'</span>';
}
window['getSuperStatDesc'] = getSuperStatDesc;

// innate talent functions
function selectInnateTalent(num) {
    var fieldId = 'fieldInnateTalent'+num;
    var field = document.getElementById(fieldId);
    if (selectedFieldId == fieldId) {
        selectClear();
    } else {
        selectClear();
        selectedNum = num;
        selectedFieldId = fieldId;
        selectedFieldClass = field.getAttribute('class');
        field.setAttribute('class', 'selectedButton');
        showPositionSection('selectionInnateTalent', true);
    }
}
window['selectInnateTalent'] = selectInnateTalent;
function setInnateTalent(id) {
    var num = selectedNum;
    var field = document.getElementById('fieldInnateTalent'+num);
    var selectField = document.getElementById('selectInnateTalent'+id);
    var oldId = phInnateTalent[num].id;
    var oldSelectField = document.getElementById('selectInnateTalent'+oldId);
    if (id != oldId) {
        phInnateTalent[num] = dataInnateTalent[id];
        if (id == 0) {
            field.innerHTML = getInnateTalentDefault(num);
        } else {
            field.innerHTML = getInnateTalentDesc(id, num);
            selectField.setAttribute('class', 'takenButton');
        }
        if (oldId != 0) {
            oldSelectField.setAttribute('class', 'selectButton');
        }
    }
    selectClear();
}
window['setInnateTalent'] = setInnateTalent;
function getInnateTalentDefault(num) {
    return '<span><img src="img/blank.png" />&nbsp;Innate Talent</span>';
}
window['getInnateTalentDefault'] = getInnateTalentDefault;
function getInnateTalentDesc(id, num) {
    return '<img src="img/Innate_Talent.png" />&nbsp;'+dataInnateTalent[id].desc +
        ((dataInnateTalent[id].extra != null) ? ' <span class="spec">('+dataInnateTalent[id].extra+')</span>' : '');
}
window['getInnateTalentDesc'] = getInnateTalentDesc;

// talent functions
function selectTalent(num) {
    var fieldId = 'fieldTalent'+num;
    var field = document.getElementById(fieldId);
    if (selectedFieldId == fieldId) {
        selectClear();
    } else {
        selectClear();
        selectedNum = num;
        selectedFieldId = fieldId;
        selectedFieldClass = field.getAttribute('class');
        field.setAttribute('class', 'selectedButton');
        showPositionSection('selectionTalent', true);
    }
}
window['selectTalent'] = selectTalent;
function setTalent(id) {
    var num = selectedNum;
    var field = document.getElementById('fieldTalent'+num);
    var selectField = document.getElementById('selectTalent'+id);
    var oldId = phTalent[num].id;
    var oldSelectField = document.getElementById('selectTalent'+oldId);
    var swapNum = 0;
    var swapField;
    if (id != oldId) {
        if (id > 0) {
            for (var i=1; i<phTalent.length; i++) {
                if (i != num && phTalent[i].id == id) {
                    swapNum = i;
                    swapField = document.getElementById('fieldTalent'+i);
                }
            }
        }
        phTalent[num] = dataTalent[id];
        if (id == 0) {
            field.innerHTML = getTalentDefault(num);
        } else {
            field.innerHTML = getTalentDesc(id);
            selectField.setAttribute('class', 'takenButton');
        }
        if (swapNum > 0) {
            phTalent[swapNum] = dataTalent[oldId];
            if (oldId != 0) {
                swapField.innerHTML = getTalentDesc(oldId);
            } else {
                swapField.innerHTML = getTalentDefault(swapNum);
            }
        } else if (oldId != 0) {
            oldSelectField.setAttribute('class', 'button');
        }
    }
    selectClear();
}
window['setTalent'] = setTalent;
function getTalentDefault(num) {
    return '<span><img src="img/blank.png" />&nbsp;Talent '+num+'</span>';
}
window['getTalentDefault'] = getTalentDefault;
function getTalentDesc(id) {
    return '<img src="img/Talent.png" />&nbsp;'+dataTalent[id].desc +
        ((dataTalent[id].extra != null) ? ' <span class="spec">('+dataTalent[id].extra+')</span>' : '');
}
window['getTalentDesc'] = getTalentDesc;

// travel power functions
function selectTravelPower(num) {
    var fieldId = 'fieldTravelPower'+num;
    var field = document.getElementById(fieldId);
    if (selectedFieldId == fieldId) {
        selectClear();
    } else {
        selectClear();
        selectedNum = num;
        selectedFieldId = fieldId;
        selectedFieldClass = field.getAttribute('class');
        field.setAttribute('class', 'selectedButton');
        showPositionSection('selectionTravelPower', true);
    }
}
window['selectTravelPower'] = selectTravelPower;
function setTravelPower(id) {
    var num = selectedNum;
    var field = document.getElementById('fieldTravelPower'+num);
    var advantageField = document.getElementById('fieldTravelPowerAdvantage'+num);
    var selectField = document.getElementById('selectTravelPower'+id);
    var oldId = phTravelPower[num].id;
    var oldAdvantage = phTravelPowerAdvantage[num];
    var oldSelectField = document.getElementById('selectTravelPower'+oldId);
    var swapNum = 0;
    var swapField;
    var swapAdvantageField;
    if (id != oldId) {
        if (id > 0) {
            for (var i=1; i<phTravelPower.length; i++) {
                if (i != num && phTravelPower[i].id == id) {
                    swapNum = i;
                    swapField = document.getElementById('fieldTravelPower'+i);
                    swapAdvantageField = document.getElementById('fieldTravelPowerAdvantage'+i);
                }
            }
        }
        if (swapNum > 0) {
            phTravelPower[num] = phTravelPower[swapNum];
            phTravelPowerAdvantage[num] = phTravelPowerAdvantage[swapNum];
            field.innerHTML = dataTravelPower[id].desc;
            advantageField.style.display = '';
            setAdvantage(2, num, phTravelPowerAdvantage[num]);
            phTravelPower[swapNum] = dataTravelPower[oldId];
            phTravelPowerAdvantage[swapNum] = oldAdvantage;
            if (oldId != 0) {
                swapField.innerHTML = dataTravelPower[oldId].desc;
                setAdvantage(2, swapNum, phTravelPowerAdvantage[swapNum]);
            } else {
                swapField.innerHTML = getTravelPowerDefault(swapNum);
                swapAdvantageField.style.display = 'none';
                setAdvantage(2, swapNum, 0);
            }
        } else {
            if (phTravelPower[num].id != 0) {
                setAdvantage(2, num, 0);
            }
            phTravelPower[num] = dataTravelPower[id];
            phTravelPowerAdvantage[num] = 0;
            if (id == 0) {
                field.innerHTML = getTravelPowerDefault(num);
                advantageField.style.display = 'none';
            } else {
                field.innerHTML = dataTravelPower[id].desc;
                advantageField.innerHTML = advantageTextSpan(2, num, 0);
                advantageField.style.display = '';
                selectField.setAttribute('class', 'takenButton');
                if (oldId != 0) {
                    oldSelectField.setAttribute('class', 'button');
                }
            }
            if (oldId != 0) {
                oldSelectField.setAttribute('class', 'button');
            }
        }
    }
    selectClear();
}
window['setTravelPower'] = setTravelPower;
function getTravelPowerDefault(num) {
    return '<span><img src="img/blank.png" />&nbsp;Travel Power '+num+'</span>';
}
window['getTravelPowerDefault'] = getTravelPowerDefault;

// power functions
function selectFramework(framework) {
    var selectPowerIds = ['selectPower', 'selectPowerLeft', 'selectPowerRight'];
    for (var i=0; i<selectPowerIds.length; i++) {
        var selectPower = document.getElementById(selectPowerIds[i]);
        var children = selectPower.getElementsByTagName('*');
        while (children.length > 0) {
            selectPower.removeChild(children[0]);
        }
    }
    var selectPower = document.getElementById('selectPower');
    var selectPowerLeft = document.getElementById('selectPowerLeft');
    var selectPowerRight = document.getElementById('selectPowerRight');
    var a = document.createElement('a');
    a.setAttribute('id', 'selectPower0');
    a.setAttribute('onclick', 'setPower(0)');
    a.innerHTML = 'Clear';
    selectPower.appendChild(a);
    var span = document.createElement('span');
    span.innerHTML = ' &nbsp; ';
    selectPower.appendChild(span);
    var a = document.createElement('a');
    a.setAttribute('id', 'selectPowerCancel');
    a.setAttribute('onclick', 'selectClear()');
    a.innerHTML = 'Cancel';
    selectPower.appendChild(a);
    selectPower.appendChild(document.createElement('br'));
    var frameworkPowers = dataPowerIdFromFramework[framework];
    for (var i=0; i<frameworkPowers.length; i++) {
        if (i < frameworkPowers.length/2) selectPower = selectPowerLeft;
        else selectPower = selectPowerRight;
        var powerId = frameworkPowers[i];
        var power = dataPower[powerId];
        var a = document.createElement('a');
        a.setAttribute('id', 'selectPower'+powerId);
        switch(selectPowerAllowed(selectedNum, powerId)) {
        case 0:
            a.setAttribute('class', 'disabledButton');
            break;
        case 1:
            a.setAttribute('onclick', 'setPower('+powerId+')');
            a.setAttribute('class', 'button');
            break;
        case 2:
            a.setAttribute('onclick', 'setPower('+powerId+')');
            a.setAttribute('class', 'takenButton');
            break;
        }
        if (dataPower[powerId].tip != null) {
            var tip = dataPower[powerId].tip;
            a.setAttribute('onmouseover', 'popup(\''+tip+'\')');
            a.setAttribute('onmouseout', 'popout()');
        }
        a.innerHTML = dataPower[powerId].desc;
        selectPower.appendChild(a);
        selectPower.appendChild(document.createElement('br'));
    }
    prevSelectedFramework = framework;
}
window['selectFramework'] = selectFramework;
function selectPower(num) {
    var fieldId = 'fieldPower'+num;
    var field = document.getElementById(fieldId);
    if (selectedFieldId == fieldId) {
        selectClear();
    } else {
        selectClear();
        selectedNum = num;
        selectedFieldId = fieldId;
        selectedFieldClass = field.getAttribute('class');
        field.setAttribute('class', 'selectedButton');
        if (phPower[num].id != 0) {
            selectFramework(phPower[num].framework);
        } else if (prevSelectedFramework != 0) {
            selectFramework(prevSelectedFramework);
        }
        showPositionSection('selectionPower', false);
    }
}
window['selectPower'] = selectPower;
function setPower(id) {
    var num = selectedNum;
    var field = document.getElementById('fieldPower'+num);
    var advantageField = document.getElementById('fieldPowerAdvantage'+num);
    var oldId = phPower[num].id;
    var oldAdvantage = phPowerAdvantage[num];
    var swapNum = 0;
    var swapField;
    var swapAdvantageField;
    if (id != oldId) {
        if (id > 0) {
            for (var i=1; i<phPower.length; i++) {
                if (i != num && phPower[i].id == id) {
                    swapNum = i;
                    swapField = document.getElementById('fieldPower'+i);
                    swapAdvantageField = document.getElementById('fieldPowerAdvantage'+i);
                }
            }
        }
        if (swapNum > 0) {
            phPower[num] = phPower[swapNum];
            phPowerAdvantage[num] = phPowerAdvantage[swapNum];
            field.innerHTML = dataPower[id].desc;
            advantageField.style.display = '';
            setAdvantage(1, num, phPowerAdvantage[num]);
            phPower[swapNum] = dataPower[oldId];
            phPowerAdvantage[swapNum] = oldAdvantage;
            if (oldId != 0) {
                swapField.innerHTML = dataPower[oldId].desc;
                swapAdvantageField.style.display = '';
                setAdvantage(1, swapNum, phPowerAdvantage[swapNum]);
            } else {
                swapField.innerHTML = getPowerDefault(swapNum);
                swapAdvantageField.style.display = 'none';
                setAdvantage(1, swapNum, 0);
            }
        } else {
            if (phPower[num].id != 0) {
                setAdvantage(1, num, 0);
            }
            phPower[num] = dataPower[id];
            phPowerAdvantage[num] = 0;
            if (id == 0) {
                field.innerHTML = getPowerDefault(num);
                advantageField.style.display = 'none';
            } else {
                field.innerHTML = dataPower[id].desc;
                advantageField.innerHTML = advantageTextSpan(1, num, 0);
                advantageField.style.display = '';
            }
        }
    }
    selectClear();
    validatePowers();
}
window['setPower'] = setPower;
function getPowerDefault(num) {
    return '<span><img src="img/blank.png" />&nbsp;Power '+num+'</span>';
}
window['getPowerDefault'] = getPowerDefault;
function selectPowerAllowed(num, id) {
    // returns: 0=no, 1=yes, 2=taken
    var result = 0;
    var power = dataPower[id];
    var oldTier = (num > 0) ? phPower[num].tier : -1;
    var powerCount = 0;
    var powerSetCount = 0;
    var frameworkCount = 0;
    var groupCount = 0;
    var otherCount = 0;
    var energyBuilderId = 0;
    var energyUnlockId = 0;
    var tier4Id = 0;
    for (var i=1; i<phPower.length; i++) {
        var p = phPower[i];
        if (i<num) {
            if (p.tier == -1) {
                // eb counts for framework, but not powerSet or otherCount
                if (p.framework == power.framework) frameworkCount++;
            // } else if (p.tier != 4) {
            //     // tier 4 does not count for powerSet or framework
            } else {
                if (p.powerSet == power.powerSet) powerSetCount++;
                if (p.framework == power.framework) frameworkCount++;
                otherCount++;
            }
            if (p.tier != 4) {
                // all powers except for tier 4's count for power group
                if (dataRequireGroupPower[power.id] != undefined) {
                    var group = dataRequireGroupPower[power.id];
                    for (var j=0; j<dataRequireGroup[group].length; j++) {
                        if (p.framework == dataRequireGroup[group][j]) groupCount++;
                    }
                }
            }
            powerCount++;
        }
        // power types you may only have one of
        if (p.tier == -1) energyBuilderId = p.id;
        if (p.tier == 4) tier4Id = p.id;
        if (dataEnergyUnlockPower[p.id] != undefined) energyUnlockId = p.id;
    }
    switch (power.tier) {
    case -1:
        if (energyBuilderId == 0) result = 1;
        else if (oldTier == -1) result = 2;
        break;
    case 0:
        result = 1;
        break;
    case 1:
        if (frameworkCount >= 1 || groupCount >= 1 || otherCount >= 2) result = 1;
        break;
    case 2:
        //if (frameworkCount >= 3 || groupCount >= 3 || otherCount >= 5) result = 1;
        if (frameworkCount >= 3 || groupCount >= 3 || otherCount >= 4) result = 1;
        break;
    case 3:
        //if (frameworkCount >= 5 || groupCount >= 5 || otherCount >= 8) result = 1;
        if (frameworkCount >= 5 || groupCount >= 5 || otherCount >= 6) result = 1;
        break;
    case 4:
        //if (powerSetCount >= 10) result = 1;
        //if (powerCount >= 12 && tier4Id == 0) result = 1;
        if (tier4Id == 0) result = 1;
        else if (oldTier == 4) result = 2;
        break;
    }
    if (result > 0 && energyUnlockId != 0 && dataEnergyUnlockPower[id] != undefined) {
        if (dataEnergyUnlockPower[phPower[num].id] != undefined) result = 2;
        else result = 0;
    }
    for (var i=1; i<phPower.length; i++) {
        if (phPower[i].id == id && (num != i || result == 1)) result = 2;
    }
    return result;
}
window['selectPowerAllowed'] = selectPowerAllowed;
function validatePower(num, id) {
    var field = document.getElementById('fieldPower'+num);
    if (id == 0 || selectPowerAllowed(num, id) > 0) {
        field.setAttribute('class', 'button');
    } else {
        field.setAttribute('class', 'disabledButton');
    }
}
window['validatePower'] = validatePower;
function validatePowers() {
    for (i=1; i<phPower.length; i++) {
        validatePower(i, phPower[i].id);
    }
}
window['validatePowers'] = validatePowers;

// archetype power functions
function selectArchetypePower(num) {
    var fieldId = 'fieldPower'+num;
    var field = document.getElementById(fieldId);
    if (selectedFieldId == fieldId) {
        selectClear();
    } else {
        selectClear();
        selectedNum = num;
        selectedFieldId = fieldId;
        selectedFieldClass = field.getAttribute('class');
        field.setAttribute('class', 'selectedButton');
        var selectPower = document.getElementById('selectArchetypePower');
        var children = selectPower.getElementsByTagName('*');
        while (children.length > 0) {
            selectPower.removeChild(children[0]);
        }
        var a = document.createElement('a');
        a.setAttribute('id', 'selectPowerCancel');
        a.setAttribute('onclick', 'selectClear()');
        a.innerHTML = 'Cancel';
        selectPower.appendChild(a);
        selectPower.appendChild(document.createElement('br'));
        var archetypePowers = phArchetype.power[num];
        for (var i=1; i<archetypePowers.length; i++) {
            var powerId = archetypePowers[i];
            var power = dataPower[powerId];
            var a = document.createElement('a');
            a.setAttribute('id', 'selectPower'+powerId);
            if (powerId == phPower[num].id) {
                a.setAttribute('class', 'disabledButton');
            } else {
                a.setAttribute('onclick', 'setArchetypePower('+powerId+')');
                a.setAttribute('class', 'button');
            }
            if (dataPower[powerId].tip != null) {
                var tip = dataPower[powerId].tip;
                a.setAttribute('onmouseover', 'popup(\''+tip+'\')');
                a.setAttribute('onmouseout', 'popout()');
            }
            a.innerHTML = dataPower[powerId].desc;
            selectPower.appendChild(a);
            selectPower.appendChild(document.createElement('br'));
        }
        showPositionSection('selectionArchetypePower', true);
    }
}
window['selectArchetypePower'] = selectArchetypePower;
function setArchetypePower(id) {
    var num = selectedNum;
    var field = document.getElementById('fieldPower'+num);
    var advantageField = document.getElementById('fieldPowerAdvantage'+num);
    var oldId = phPower[num].id;
    if (id != oldId) {
        setAdvantage(1, num, 0);
        phPower[num] = dataPower[id];
        phPowerAdvantage[num] = 0;
        field.innerHTML = dataPower[id].desc;
        advantageField.innerHTML = advantageTextSpan(1, num, 0);
        advantageField.style.display = '';
    }
    selectClear();
}
window['setArchetypePower'] = setArchetypePower;

// power advantage functions
function checkAdvantageDependancyId(type, num, id) {
    var result = true;
    var power = (type == 1) ? phPower[num] : phTravelPower[num];
    var mask = (type == 1) ? phPowerAdvantage[num] : phTravelPowerAdvantage[num];
    var dependency = power.advantage[id].dependency;
    if (dependency != null && !power.hasAdvantage(mask, dependency)) result = false;
    return result;
}
window['checkAdvantageDependancyId'] = checkAdvantageDependancyId;
function checkAdvantageDependancyMask(type, num, mask) {
    var result = true;
    var power = (type == 1) ? phPower[num] : phTravelPower[num];
    var advantageList = (type == 1) ? phPower[num].advantage : phTravelPower[num].advantage;
    for (var i=1; i<advantageList.length; i++) {
        var advantage = advantageList[i];
        if (advantage.dependency != null &&
            power.hasAdvantage(mask, advantage.id) &&
            !power.hasAdvantage(mask, advantage.dependency)) result = false;
    }
    return result;
}
window['checkAdvantageDependancyMask'] = checkAdvantageDependancyMask;
function selectTravelPowerAdvantage(num) {
    selectAdvantage(2, num);
}
window['selectTravelPowerAdvantage'] = selectTravelPowerAdvantage;
function selectPowerAdvantage(num) {
    selectAdvantage(1, num);
}
window['selectPowerAdvantage'] = selectPowerAdvantage;
function selectAdvantage(type, num) {
    var formIds = ['formPowerAdvantage', 'formTravelPowerAdvantage'];
    var fieldId = ((type == 1) ? 'fieldPowerAdvantage' : 'fieldTravelPowerAdvantage')+num;
    var field = document.getElementById(fieldId);
    var power = (type == 1) ? phPower[num] : phTravelPower[num];
    var mask = (type == 1) ? phPowerAdvantage[num] : phTravelPowerAdvantage[num];
    if (selectedFieldId == fieldId) {
        selectClear();
    } else {
        selectClear();
        selectedNum = num;
        selectedFieldId = fieldId;
        selectedFieldClass = field.getAttribute('class');
        field.setAttribute('class', 'selectedButtonNote');
        for (var i=0; i<formIds.length; i++) {
            var form = document.getElementById(formIds[i]);
            var children = form.getElementsByTagName('*');
            while (children.length > 0) {
                form.removeChild(children[0]);
            }
        }
        var form = document.getElementById((type == 1) ? 'formPowerAdvantage' : 'formTravelPowerAdvantage');
        var a = document.createElement('a');
        a.setAttribute('id', 'selectAdvantageClear');
        a.setAttribute('onclick', 'selectAdvantageClear('+type+', '+num+')');
        a.innerHTML = 'Clear';
        form.appendChild(a);
        var span = document.createElement('span');
        span.innerHTML = ' &nbsp; ';
        form.appendChild(span);
        var a = document.createElement('a');
        a.setAttribute('id', 'selectAdvantageCancel');
        a.setAttribute('onclick', 'selectAdvantageCancel('+type+', '+num+', '+mask+')');
        a.innerHTML = 'Cancel';
        form.appendChild(a);
        var span = document.createElement('span');
        span.innerHTML = ' &nbsp; ';
        form.appendChild(span);
        var a = document.createElement('a');
        a.setAttribute('id', 'selectAdvantageClose');
        a.setAttribute('onclick', 'selectClear()');
        a.innerHTML = 'Close';
        form.appendChild(a);
        form.appendChild(document.createElement('br'));
        var table = document.createElement('table');
        var advantageList = power.advantage;
        var advantagePoints = power.getPoints(mask);
        for (var i=1; i<advantageList.length; i++) {
            var advantage = advantageList[i];
            var tr = document.createElement('tr');
            table.appendChild(tr);
            var td = document.createElement('td');
            tr.appendChild(td);
            var input = document.createElement('input');
            input.setAttribute('id', 'checkboxAdvantage'+i);
            input.setAttribute('type', 'checkbox');
            input.setAttribute('name', advantage.name);
            input.setAttribute('value', advantage.id);
            var test = Math.pow(2, i);
            if (mask > 0 && (mask & test) == test) {
                input.checked = true;
            }
            if (input.checked || (statAdvantagePoints+advantage.points <= maxAdvantagePointsTotal &&
                                  advantagePoints+advantage.points <= maxAdvantagePointsPerPower &&
                                  checkAdvantageDependancyId(type, num, advantage.id))) {
                input.setAttribute('onclick', 'toggleAdvantage('+type+', '+num+', '+i+')');
            } else {
                input.setAttribute('onclick', 'return false');
            }
            td.appendChild(input);
            var td = document.createElement('td');
            tr.appendChild(td);
            var a = document.createElement('a');
            a.setAttribute('id', 'selectAdvantage'+i);
            if (advantage.tip != null) {
                var tip = advantage.tip;
                a.setAttribute('onmouseover', 'popup(\''+tip+'\')');
                a.setAttribute('onmouseout', 'popout()');
            }
            if (input.checked || (statAdvantagePoints+advantage.points <= maxAdvantagePointsTotal &&
                                  advantagePoints+advantage.points <= maxAdvantagePointsPerPower &&
                                  checkAdvantageDependancyId(type, num, advantage.id))) {
                a.setAttribute('onclick', 'toggleAdvantage('+type+', '+num+', '+i+')');
                a.setAttribute('class', 'selectButton');
            } else {
                a.setAttribute('onclick', 'return false');
                a.setAttribute('class', 'disabledButton');
            }
            a.innerHTML = advantage.desc;
            td.appendChild(a);
            var td = document.createElement('td');
            tr.appendChild(td);
            var span = document.createElement('span');
            span.setAttribute('class', 'note');
            span.innerHTML = ' &nbsp; '+advantage.points;
            td.appendChild(span);
        }
        form.appendChild(table);
        if (type == 1) {
            showPositionSection('selectionPowerAdvantage', false);
        } else {
            showPositionSection('selectionTravelPowerAdvantage', true);
        }
    }
}
window['selectAdvantage'] = selectAdvantage;
function selectAdvantageUpdate(type, num) {
    var field = document.getElementById(((type == 1) ? 'fieldPowerAdvantage' : 'fieldTravelPowerAdvantage')+num);
    var power = (type == 1) ? phPower[num] : phTravelPower[num];
    var mask = (type == 1) ? phPowerAdvantage[num] : phTravelPowerAdvantage[num];
    var advantageList = power.advantage;
    var advantagePoints = power.getPoints(mask);
    for (var i=1; i<advantageList.length; i++) {
        var advantage = advantageList[i];
        var checkboxAdvantage = document.getElementById('checkboxAdvantage'+i);
        var selectAdvantage = document.getElementById('selectAdvantage'+i);
        if (checkboxAdvantage.checked || (statAdvantagePoints+advantage.points <= maxAdvantagePointsTotal &&
                                          advantagePoints+advantage.points <= maxAdvantagePointsPerPower &&
                                          checkAdvantageDependancyId(type, num, advantage.id))) {
            checkboxAdvantage.setAttribute('onclick', 'toggleAdvantage('+type+', '+num+', '+i+')');
            selectAdvantage.setAttribute('onclick', 'toggleAdvantage('+type+', '+num+', '+i+')');
            selectAdvantage.setAttribute('class', 'selectButton');
        } else {
            checkboxAdvantage.setAttribute('onclick', 'return false');
            selectAdvantage.setAttribute('onclick', 'return false');
            selectAdvantage.setAttribute('class', 'disabledButton');
        }
    }
}
window['selectAdvantageUpdate'] = selectAdvantageUpdate;
function selectAdvantageClear(type, num) {
    var mask = 0;
    setAdvantage(type, num, mask);
    var field = document.getElementById(((type == 1) ? 'fieldPowerAdvantage' : 'fieldTravelPowerAdvantage')+num);
    var power = (type == 1) ? phPower[num] : phTravelPower[num];
    var advantageList = power.advantage;
    for (var i=1; i<advantageList.length; i++) {
        var advantage = advantageList[i];
        var checkboxAdvantage = document.getElementById('checkboxAdvantage'+i);
        var selectAdvantage = document.getElementById('selectAdvantage'+i);
        checkboxAdvantage.checked = false;
        if (statAdvantagePoints+advantage.points <= maxAdvantagePointsTotal &&
            checkAdvantageDependancyId(type, num, advantage.id)) {
            selectAdvantage.setAttribute('onclick', 'toggleAdvantage('+type+', '+num+', '+i+')');
            selectAdvantage.setAttribute('class', 'selectButton');
        } else {
            selectAdvantage.setAttribute('onclick', 'return false');
            selectAdvantage.setAttribute('class', 'disabledButton');
        }
    }
    field.innerHTML = advantageTextSpan(type, num, mask);
}
window['selectAdvantageClear'] = selectAdvantageClear;
function selectAdvantageCancel(type, num, mask) {
    var field = document.getElementById(((type == 1) ? 'fieldPowerAdvantage' : 'fieldTravelPowerAdvantage')+num);
    field.innerHTML = advantageTextSpan(type, num, mask);
    setAdvantage(type, num, mask);
    selectClear();
}
window['selectAdvantageCancel'] = selectAdvantageCancel;
function toggleAdvantage(type, num, id) {
    var mask = (type == 1) ? phPowerAdvantage[num] : phTravelPowerAdvantage[num];
    var field = document.getElementById('checkboxAdvantage'+id);
    var power = (type == 1) ? phPower[num] : phTravelPower[num];
    if (power.hasAdvantage(mask, id)) {
        mask = power.delAdvantage(mask, id);
        var advantageList = power.advantage;
        for (var i=1; i<advantageList.length; i++) {
            var advantage = advantageList[i];
            if (advantage.dependency != null && advantage.dependency == id) {
                mask = power.delAdvantage(mask, advantage.id);
                document.getElementById('checkboxAdvantage'+advantage.id).checked = false;
            }
        }
        field.checked = false;
        setAdvantage(type, num, mask);
    } else {
        var advantage = power.advantage[id];
        var advantagePoints = power.getPoints(mask);
        if (statAdvantagePoints+advantage.points <= maxAdvantagePointsTotal &&
            advantagePoints+advantage.points <= maxAdvantagePointsPerPower &&
            checkAdvantageDependancyId(type, num, id)) {
            mask = power.addAdvantage(mask, id);
            field.checked = true;
            setAdvantage(type, num, mask);
        }
    }
    selectAdvantageUpdate(type, num);
}
window['toggleAdvantage'] = toggleAdvantage;
function setAdvantage(type, num, mask) {
    var oldStatAdvantagePoints = statAdvantagePoints;
    var field = document.getElementById(((type == 1) ? 'fieldPowerAdvantage' : 'fieldTravelPowerAdvantage')+num);
    var power = (type == 1) ? phPower[num] : phTravelPower[num];
    var phMask = (type == 1) ? phPowerAdvantage[num] : phTravelPowerAdvantage[num];
    var advantageList = power.getAdvantage(phMask);
    var advantagePoints = power.getPoints(mask);
    for (var i=0; i<advantageList.length; i++) {
        statAdvantagePoints -= advantageList[i].points;
    }
    var advantageList = power.getAdvantage(mask);
    for (var i=0; i<advantageList.length; i++) {
        statAdvantagePoints += advantageList[i].points;
    }
    if (statAdvantagePoints <= maxAdvantagePointsTotal &&
        advantagePoints <= maxAdvantagePointsPerPower &&
        checkAdvantageDependancyMask(type, num, mask)) {
        (type == 1) ? phPowerAdvantage[num] = mask : phTravelPowerAdvantage[num] = mask;
        field.innerHTML = advantageTextSpan(type, num, mask);
    } else {
        statAdvantagePoints = oldStatAdvantagePoints;
    }
}
window['setAdvantage'] = setAdvantage;
function advantageText(type, num, mask) {
    var power = (type == 1) ? phPower[num] : phTravelPower[num];
    var advantageList = power.advantage;
    var result = '';
    if (advantageList.length > 0) {
        if (mask == 0) {
            result = '(advantages)';
        } else {
            for (var i=1; i<advantageList.length; i++) {
                if (power.hasAdvantage(mask, i)) {
                    if (result.length == 0) {
                        result = '('+advantageList[i].desc;
                    } else {
                        result += ', '+advantageList[i].desc;
                    }
                }
            }
            result += ')';
        }
    } else {
        result = '';
    }
    return result;
}
window['advantageText'] = advantageText;
function advantageTextSpan(type, num, mask) {
    return '<span class="advantage">'+advantageText(type, num, mask)+'</span>';
}
window['advantageTextSpan'] = advantageTextSpan;

// archetype functions
function selectArchetype() {
    selectClear();
    showPositionSection('selectionArchetype', true);
}
window['selectArchetype'] = selectArchetype;
function setArchetype(id) {
    var archetype = dataArchetype[id];
    if (id == 1) {
        for (i=1; i<phSuperStat.length; i++) {
            var field = document.getElementById('fieldSuperStat'+i);
            field.setAttribute('onclick', 'selectSuperStat('+i+')');
            field.setAttribute('class', 'button');
        }
        for (i=1; i<phInnateTalent.length; i++) {
            var field = document.getElementById('fieldInnateTalent'+i);
            field.setAttribute('onclick', 'selectInnateTalent('+i+')');
            field.setAttribute('class', 'button');
        }
        for (i=1; i<phPower.length; i++) {
            var field = document.getElementById('fieldPower'+i);
            field.setAttribute('onclick', 'selectPower('+i+')');
            field.setAttribute('class', 'button');
        }
        document.getElementById('fieldTalentNote1').innerHTML = '6&nbsp;';
        document.getElementById('fieldTalentNote2').innerHTML = '9&nbsp;';
        document.getElementById('fieldTalentNote3').innerHTML = '12&nbsp;';
        document.getElementById('fieldTalentNote4').innerHTML = '15&nbsp;';
        document.getElementById('fieldTalentNote5').innerHTML = '18&nbsp;';
        document.getElementById('fieldTalentNote6').innerHTML = '21&nbsp;';
        document.getElementById('fieldPowerNote8').innerHTML = '20&nbsp;';
        document.getElementById('fieldPowerNote9').innerHTML = '23&nbsp;';
        document.getElementById('fieldPowerNote10').innerHTML = '26&nbsp;';
        document.getElementById('fieldPowerNote11').innerHTML = '29&nbsp;';
        document.getElementById('rowPower12').style.display = '';
        document.getElementById('rowPower13').style.display = '';
        document.getElementById('rowPower14').style.display = '';
    } else {
        for (i=1; i<phSuperStat.length; i++) {
            var id = archetype.superStat[i];
            var field = document.getElementById('fieldSuperStat'+i);
            var selectField = document.getElementById('selectSuperStat'+id);
            if (id != phSuperStat[i].id) {
                phSuperStat[i] = dataSuperStat[id];
                field.innerHTML = getSuperStatDesc(id, i);
            }
            field.setAttribute('onclick', 'return false');
            field.setAttribute('class', 'lockedButton');
            selectField.setAttribute('class', 'takenButton');
        }
        for (i=1; i<phInnateTalent.length; i++) {
            var id = archetype.innateTalent;
            var field = document.getElementById('fieldInnateTalent'+i);
            var selectField = document.getElementById('selectInnateTalent'+id);
            if (id != phInnateTalent[i].id) {
                phInnateTalent[i] = dataInnateTalent[id];
                field.innerHTML = getInnateTalentDesc(id, i);
            }
            field.setAttribute('onclick', 'return false');
            field.setAttribute('class', 'lockedButton');
            selectField.setAttribute('class', 'takenButton');
        }
        for (i=1; i<phPower.length; i++) {
            var field = document.getElementById('fieldPower'+i);
            var advantageField = document.getElementById('fieldPowerAdvantage'+i);
            var id = archetype.power[i];
            if (id != undefined) {
                var multiplePowers = false;
                if (id instanceof Array) {
                    multiplePowers = true;
                    var powers = id;
                    var oldId = phPower[i].id;
                    for (j=1; j<powers.length; j++) {
                        if (powers[j] == oldId) id = powers[j];
                    }
                    if (id instanceof Array) id = powers[1];
                }
                if (id != phPower[i].id) {
                    setAdvantage(1, i, 0);
                    phPower[i] = dataPower[id];
                    field.innerHTML = dataPower[id].desc;
                    advantageField.innerHTML = advantageTextSpan(1, i, 0);
                }
                if (multiplePowers) {
                    field.setAttribute('onclick', 'selectArchetypePower('+i+')');
                    field.setAttribute('class', 'button');
                } else {
                    field.setAttribute('onclick', 'return false');
                    field.setAttribute('class', 'lockedButton');
                }
                advantageField.style.display = '';
            } else {
                setAdvantage(1, i, 0);
                phPower[i] = dataPower[0];
                field.innerHTML = getPowerDefault(i);
                advantageField.innerHTML = advantageTextSpan(1, i, 0);
            }
        }
        document.getElementById('fieldTalentNote1').innerHTML = '7&nbsp;';
        document.getElementById('fieldTalentNote2').innerHTML = '12&nbsp;';
        document.getElementById('fieldTalentNote3').innerHTML = '15&nbsp;';
        document.getElementById('fieldTalentNote4').innerHTML = '20&nbsp;';
        document.getElementById('fieldTalentNote5').innerHTML = '25&nbsp;';
        document.getElementById('fieldTalentNote6').innerHTML = '30&nbsp;';
        document.getElementById('fieldPowerNote8').innerHTML = '22&nbsp;';
        document.getElementById('fieldPowerNote9').innerHTML = '27&nbsp;';
        document.getElementById('fieldPowerNote10').innerHTML = '32&nbsp;';
        document.getElementById('fieldPowerNote11').innerHTML = '40&nbsp;';
        document.getElementById('rowPower12').style.display = 'none';
        document.getElementById('rowPower13').style.display = 'none';
        document.getElementById('rowPower14').style.display = 'none';
    }
    phArchetype = archetype;
    document.getElementById('fieldArchetype').innerHTML = archetype.desc;
    selectClear();
}
window['setArchetype'] = setArchetype;

// parse url for parameters
function parseUrlParams(url) {
    var version = buildVersion;
    var data = new Array();
    var parts = url.split('?');
    if (parts[1] != undefined) {
        var params = parts[1].split('&');
        for (var i=0; i<params.length; i++) {
            var pair = params[i].split('=');
            switch (pair[0]) {
            case 'v':
                version = parseInt(pair[1]);
                break;
            case 'n':
                phName = decodeURIComponent(pair[1]);
                document.getElementById('fieldName').firstChild.data = phName;
                break;
            case 'a':
                phArchetype = dataArchetype[parseInt(pair[1])];
                //document.getElementById('fieldArchetype').firstChild.data = phArchetype.name;
                break;
            case 'd':
                data = pair[1];
                break;
            }
        }
    }
    var pos = 0;
    var i = 0;
    var inc = 1;
    while (i < data.length) {
        var codeNum = codeToNum(data.charCodeAt(i));
        switch (pos) {
        case 0:
        case 1:
        case 2:
            // super stats
            selectSuperStat(pos+1);
            //setSuperStat(getVersionUpdateCodeNum(version, pos+1, codeNum));
            setSuperStat(codeNum);
            inc = 1;
            break;
        case 3:
            // innate talent
            selectInnateTalent(pos-2);
            setInnateTalent(codeNum);
            inc = 1;
            break;
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
            // talents
            selectTalent(pos-3);
            setTalent(codeNum);
            inc = 1;
            break;
        case 10:
        case 11:
            // travel powers
            var num = pos-9;
            var mask = codeToNum(data.charCodeAt(i+1)) << 1;
            selectTravelPower(num);
            setTravelPower(codeNum);
            setAdvantage(2, num, mask);
            inc = 2;
            break;
        case 12:
        case 13:
        case 14:
        case 15:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 21:
        case 22:
        case 23:
        case 24:
        case 25:
            // powers
            var num = pos-11;
            var frameworkId = parseInt(codeToNum(data.charCodeAt(i)));
            var powerCode = data.charAt(i)+data.charAt(i+1);
            var id = dataPowerIdFromCode[powerCode];
            var mask = codeToNum(data.charCodeAt(i+2)) << 1;
            selectFramework(frameworkId);
            selectPower(num);
            setPower(id);
            //validatePower(num, id);
            setAdvantage(1, num, mask);
            inc = 3;
            break;
        }
        i+=inc;
        pos++;
    }
    validatePowers();
    if (phArchetype.id > 1) setArchetype(phArchetype.id);
}
window['parseUrlParams'] = parseUrlParams;

// apply version updates to codeNum
function getVersionUpdateCodeNum(version, pos, codeNum) {
    for (var i=version; i<phVersion; i++) {
        var updateLookup = dataVersionUpdateLookup[i];
        if (updateLookup != undefined) {
            var updateId = updateLookup[pos];
            if (updateId != undefined) {
                codeNum = dataVersionUpdate[updateId].getModifiedCodeNum(codeNum);
            }
        }
    }
    return codeNum;
}

// change updates
function changeUpdate() {
    advantagePoints();
    buildLink();
    setTitle();
}
window['changeUpdate'] = changeUpdate;

// update advantage points used
function advantagePoints() {
    var field = document.getElementById('advantagePoints');
    field.innerHTML = statAdvantagePoints+' / '+maxAdvantagePointsTotal;
}
window['advantagePoints'] = advantagePoints;

// // add bookmark
// function addBookmark(name, url) {
//     if (window.sidebar) window.sidebar.addPanel(name, url, '');
//     else if (window.external && ('AddFavorite' in window.external)) window.external.AddFavorite(url, name);
// }
// window['addBookmark'] = addBookmark;

// update build url
var prevBuildLink;
function buildLink() {
    var field = document.getElementById('buildLink');
    //var fieldBookmark = document.getElementById('buildLinkBookmark');
    var fieldRef = document.getElementById('buildLinkRef');
    var base = window.location.href.replace(/\?.*$/, '');
    var link = '?v='+phVersion+'&n='+encodeURIComponent(phName)+'&a='+phArchetype.id+'&d=';
    var params = new Array();
    for (var i=1; i<phSuperStat.length; i++) {
        params.push(phSuperStat[i].code());
    }
    for (var i=1; i<phInnateTalent.length; i++) {
        params.push(phInnateTalent[i].code());
    }
    for (var i=1; i<phTalent.length; i++) {
        params.push(phTalent[i].code());
    }
    for (var i=1; i<phTravelPower.length; i++) {
        params.push(phTravelPower[i].code());
        params.push(numToCharCode(phTravelPowerAdvantage[i] >> 1));
    }
    for (var i=1; i<phPower.length; i++) {
        params.push(phPower[i].code());
        params.push(numToCharCode(phPowerAdvantage[i] >> 1));
    }
    link += params.join('');
    phBuildLink = buildUrl+link;
    //var name = phName;
    //if (name == '') name = 'Hero';
    //name = siteName+': '+name;
    var url = base+link;
    field.href = url;
    //field.innerHTML = name;
    ////fieldBookmark.setAttribute('onclick', 'addBookmark(\''+name+'\',\''+url+'\');');
    fieldRef.innerHTML = url;
    if (prevBuildLink != undefined) setCookie('buildLink', prevBuildLink, 30);
    prevBuildLink = url;
   var restore = document.getElementById('restorePrevBuild');
    if (getCookie('buildLink') == undefined) restore.style.display = 'none';
    else restore.style.display = '';
}
window['buildLink'] = buildLink;

// restore previous build (if saved to cookie)
function restorePrevBuild() {
    var url = getCookie('buildLink');
    if (url != null) window.open(url, '_self');
}
window['restorePrevBuild'] = restorePrevBuild;

// set page title
function setTitle() {
    var title = siteName+': '+phName;
    if (phName == '') title = siteName;
    if (document.title != phName) document.title = title;
}
window['setTitle'] = setTitle;

// generate forum entries
function forumEntry(type, first, second, third) {
    var result = "";
    if (type == 1) {
        result += '<b><span style="color:#f78112">'+first+'</span></b>';
        if (second) {
            result += ' <b><span style="color:#fec530">'+second+'</span></b>';
            if (third) result += ' <b><span style="font-size:small;color:#ce6c10">'+third+'</span></b>';
        }
        result += '<br />';
    } else if (type == 2) {
        result += '[b][color=#f78112]'+first+'[/color][/b]';
        if (second) {
            result += ' [b][color=#fec530]'+second+'[/color][/b]';
            //if (third) result += ' [b][size=85][color=#ce6c10]'+third+'[/color][/size][/b]';
            if (third) result += ' [color=#ce6c10]'+third+'[/color]';
        }
        result += '\n';
    }
    return result;
}
window['forumEntry'] = forumEntry;
function forumAdvantageText(type, num, mask) {
    var result = advantageText(type, num, mask);
    if (result == '(advantages)') result = '';
    return result;
}
window['forumAdvantageText'] = forumAdvantageText;
function forumName(name) {
    var result = name;
    if (result == 'Clear') result = '';
    return result;
}
window['forumAdvantageText'] = forumAdvantageText;

// forum preview
function forumPreview() {
    var forumPreview = document.getElementById('forumPreview');
    var result = new Array();
    result.push('<b><a href="'+siteUrl+'"><span style="color:#f78112">'+siteName+'</span></a></b> &nbsp; ');
    result.push('<b><a href="'+phBuildLink+'"><span style="color:#8dcdff">(Link to this build)</span></a></b><br />');
    result.push('<br />');
    result.push(forumEntry(1, 'Name:', phName));
    result.push('<br />');
    result.push(forumEntry(1, 'Archetype:', phArchetype.name));
    result.push('<br />');
    result.push(forumEntry(1, 'Super Stats:'));
    result.push(forumEntry(1, 'Level 6:', forumName(phSuperStat[1].name), '(Primary)'));
    result.push(forumEntry(1, 'Level 10:', forumName(phSuperStat[2].name), '(Secondary)'));
    result.push(forumEntry(1, 'Level 15:', forumName(phSuperStat[3].name), '(Secondary)'));
    result.push('<br />');
    result.push(forumEntry(1, 'Talents:'));
    result.push(forumEntry(1, 'Level 1:', forumName(phInnateTalent[1].name)));
    if (phArchetype.id > 1) {
        result.push(forumEntry(1, 'Level 7:', forumName(phTalent[1].name)));
        result.push(forumEntry(1, 'Level 12:', forumName(phTalent[2].name)));
        result.push(forumEntry(1, 'Level 15:', forumName(phTalent[3].name)));
        result.push(forumEntry(1, 'Level 20:', forumName(phTalent[4].name)));
        result.push(forumEntry(1, 'Level 25:', forumName(phTalent[5].name)));
        result.push(forumEntry(1, 'Level 30:', forumName(phTalent[6].name)));
        result.push('<br />');
    } else {
        result.push(forumEntry(1, 'Level 6:', forumName(phTalent[1].name)));
        result.push(forumEntry(1, 'Level 9:', forumName(phTalent[2].name)));
        result.push(forumEntry(1, 'Level 12:', forumName(phTalent[3].name)));
        result.push(forumEntry(1, 'Level 15:', forumName(phTalent[4].name)));
        result.push(forumEntry(1, 'Level 18:', forumName(phTalent[5].name)));
        result.push(forumEntry(1, 'Level 21:', forumName(phTalent[6].name)));
        result.push('<br />');
    }
    result.push(forumEntry(1, 'Powers:'));
    result.push(forumEntry(1, 'Level 1:', forumName(phPower[1].name), forumAdvantageText(1, 1, phPowerAdvantage[1])));
    result.push(forumEntry(1, 'Level 1:', forumName(phPower[2].name), forumAdvantageText(1, 2, phPowerAdvantage[2])));
    result.push(forumEntry(1, 'Level 6:', forumName(phPower[3].name), forumAdvantageText(1, 3, phPowerAdvantage[3])));
    result.push(forumEntry(1, 'Level 8:', forumName(phPower[4].name), forumAdvantageText(1, 4, phPowerAdvantage[4])));
    result.push(forumEntry(1, 'Level 11:', forumName(phPower[5].name), forumAdvantageText(1, 5, phPowerAdvantage[5])));
    result.push(forumEntry(1, 'Level 14:', forumName(phPower[6].name), forumAdvantageText(1, 6, phPowerAdvantage[6])));
    result.push(forumEntry(1, 'Level 17:', forumName(phPower[7].name), forumAdvantageText(1, 7, phPowerAdvantage[7])));
    if (phArchetype.id > 1) {
        result.push(forumEntry(1, 'Level 22:', forumName(phPower[8].name), forumAdvantageText(1, 8, phPowerAdvantage[8])));
        result.push(forumEntry(1, 'Level 27:', forumName(phPower[9].name), forumAdvantageText(1, 9, phPowerAdvantage[9])));
        result.push(forumEntry(1, 'Level 32:', forumName(phPower[10].name), forumAdvantageText(1, 10, phPowerAdvantage[10])));
        result.push(forumEntry(1, 'Level 40:', forumName(phPower[11].name), forumAdvantageText(1, 11, phPowerAdvantage[11])));
        result.push('<br />');
    } else {
        result.push(forumEntry(1, 'Level 20:', forumName(phPower[8].name), forumAdvantageText(1, 8, phPowerAdvantage[8])));
        result.push(forumEntry(1, 'Level 23:', forumName(phPower[9].name), forumAdvantageText(1, 9, phPowerAdvantage[9])));
        result.push(forumEntry(1, 'Level 26:', forumName(phPower[10].name), forumAdvantageText(1, 10, phPowerAdvantage[10])));
        result.push(forumEntry(1, 'Level 29:', forumName(phPower[11].name), forumAdvantageText(1, 11, phPowerAdvantage[11])));
        result.push(forumEntry(1, 'Level 32:', forumName(phPower[12].name), forumAdvantageText(1, 12, phPowerAdvantage[12])));
        result.push(forumEntry(1, 'Level 35:', forumName(phPower[13].name), forumAdvantageText(1, 13, phPowerAdvantage[13])));
        result.push(forumEntry(1, 'Level 38:', forumName(phPower[14].name), forumAdvantageText(1, 14, phPowerAdvantage[14])));
        result.push('<br />');
    }
    result.push(forumEntry(1, 'Travel Powers:'));
    result.push(forumEntry(1, 'Level 6:', forumName(phTravelPower[1].name), forumAdvantageText(2, 1, phTravelPowerAdvantage[1])));
    result.push(forumEntry(1, 'Level 35:', forumName(phTravelPower[2].name), forumAdvantageText(2, 2, phTravelPowerAdvantage[2])));
    forumPreview.innerHTML = result.join('');
}
window['forumPreview'] = forumPreview;

// forum export
var forumExportType = 'co';
function setForumExportType(forumType) {
    forumExportType = forumType;
    setCookie('forumType', forumType, 30);
}
window['setForumExportType'] = setForumExportType;
function selectForumExportType(forumType) {
    document.getElementById('exportType_'+forumExportType).setAttribute('class', 'button');
    setForumExportType(forumType);
    document.getElementById('exportType_'+forumExportType).setAttribute('class', 'selectedButton');
    showView('Export');
}
window['selectForumExportType'] = selectForumExportType;
function forumExport() {
    var forumType = getCookie('forumType');
    if (forumType == undefined) forumType = forumExportType;
    setForumExportType(forumType);
    document.getElementById('exportType_'+forumType).setAttribute('class', 'selectedButton');
    var forumText = document.getElementById('forumText');
    var result = new Array();
    if (forumType == 'co') result.push('[font="Comic Sans MS"]');
    result.push('[b][url='+siteUrl+'][color=#f78112]'+siteName+'[/color][/url][/b] ');
    result.push('[b][url='+phBuildLink+'][color=#8dcdff](Link to this build)[/color][/url][/b]\n');
    result.push('\n');
    result.push(forumEntry(2, 'Name:', phName));
    result.push('\n');
    result.push(forumEntry(2, 'Archetype:', phArchetype.name));
    result.push('\n');
    result.push(forumEntry(2, 'Super Stats:'));
    result.push(forumEntry(2, 'Level 6:', forumName(phSuperStat[1].name), '(Primary)'));
    result.push(forumEntry(2, 'Level 10:', forumName(phSuperStat[2].name), '(Secondary)'));
    result.push(forumEntry(2, 'Level 15:', forumName(phSuperStat[3].name), '(Secondary)'));
    result.push('\n');
    result.push(forumEntry(2, 'Talents:'));
    result.push(forumEntry(2, 'Level 1:', forumName(phInnateTalent[1].name)));
    if (phArchetype.id > 1) {
        result.push(forumEntry(2, 'Level 7:', forumName(phTalent[1].name)));
        result.push(forumEntry(2, 'Level 12:', forumName(phTalent[2].name)));
        result.push(forumEntry(2, 'Level 15:', forumName(phTalent[3].name)));
        result.push(forumEntry(2, 'Level 20:', forumName(phTalent[4].name)));
        result.push(forumEntry(2, 'Level 25:', forumName(phTalent[5].name)));
        result.push(forumEntry(2, 'Level 30:', forumName(phTalent[6].name)));
        result.push('\n');
    } else {
        result.push(forumEntry(2, 'Level 6:', forumName(phTalent[1].name)));
        result.push(forumEntry(2, 'Level 9:', forumName(phTalent[2].name)));
        result.push(forumEntry(2, 'Level 12:', forumName(phTalent[3].name)));
        result.push(forumEntry(2, 'Level 15:', forumName(phTalent[4].name)));
        result.push(forumEntry(2, 'Level 18:', forumName(phTalent[5].name)));
        result.push(forumEntry(2, 'Level 21:', forumName(phTalent[6].name)));
        result.push('\n');
    }
    result.push(forumEntry(2, 'Powers:'));
    result.push(forumEntry(2, 'Level 1:', forumName(phPower[1].name), forumAdvantageText(1, 1, phPowerAdvantage[1])));
    result.push(forumEntry(2, 'Level 1:', forumName(phPower[2].name), forumAdvantageText(1, 2, phPowerAdvantage[2])));
    result.push(forumEntry(2, 'Level 6:', forumName(phPower[3].name), forumAdvantageText(1, 3, phPowerAdvantage[3])));
    result.push(forumEntry(2, 'Level 8:', forumName(phPower[4].name), forumAdvantageText(1, 4, phPowerAdvantage[4])));
    result.push(forumEntry(2, 'Level 11:', forumName(phPower[5].name), forumAdvantageText(1, 5, phPowerAdvantage[5])));
    result.push(forumEntry(2, 'Level 14:', forumName(phPower[6].name), forumAdvantageText(1, 6, phPowerAdvantage[6])));
    result.push(forumEntry(2, 'Level 17:', forumName(phPower[7].name), forumAdvantageText(1, 7, phPowerAdvantage[7])));
    if (phArchetype.id > 1) {
        result.push(forumEntry(2, 'Level 22:', forumName(phPower[8].name), forumAdvantageText(1, 8, phPowerAdvantage[8])));
        result.push(forumEntry(2, 'Level 27:', forumName(phPower[9].name), forumAdvantageText(1, 9, phPowerAdvantage[9])));
        result.push(forumEntry(2, 'Level 32:', forumName(phPower[10].name), forumAdvantageText(1, 10, phPowerAdvantage[10])));
        result.push(forumEntry(2, 'Level 40:', forumName(phPower[11].name), forumAdvantageText(1, 11, phPowerAdvantage[11])));
        result.push('\n');
    } else {
        result.push(forumEntry(2, 'Level 20:', forumName(phPower[8].name), forumAdvantageText(1, 8, phPowerAdvantage[8])));
        result.push(forumEntry(2, 'Level 23:', forumName(phPower[9].name), forumAdvantageText(1, 9, phPowerAdvantage[9])));
        result.push(forumEntry(2, 'Level 26:', forumName(phPower[10].name), forumAdvantageText(1, 10, phPowerAdvantage[10])));
        result.push(forumEntry(2, 'Level 29:', forumName(phPower[11].name), forumAdvantageText(1, 11, phPowerAdvantage[11])));
        result.push(forumEntry(2, 'Level 32:', forumName(phPower[12].name), forumAdvantageText(1, 12, phPowerAdvantage[12])));
        result.push(forumEntry(2, 'Level 35:', forumName(phPower[13].name), forumAdvantageText(1, 13, phPowerAdvantage[13])));
        result.push(forumEntry(2, 'Level 38:', forumName(phPower[14].name), forumAdvantageText(1, 14, phPowerAdvantage[14])));
        result.push('\n');
    }
    result.push(forumEntry(2, 'Travel Powers:'));
    result.push(forumEntry(2, 'Level 6:', forumName(phTravelPower[1].name), forumAdvantageText(2, 1, phTravelPowerAdvantage[1])));
    result.push(forumEntry(2, 'Level 35:', forumName(phTravelPower[2].name), forumAdvantageText(2, 2, phTravelPowerAdvantage[2])));
    if (forumType == 'co') result.push('[/font]');
    forumText.innerHTML = result.join('');
}
window['forumExport'] = forumExport;

// show views
function showView(view) {
    var section = document.getElementById('view'+view);
    document.getElementById('viewEdit').style.display = 'none';
    document.getElementById('viewPreview').style.display = 'none';
    document.getElementById('viewExport').style.display = 'none';
    document.getElementById('viewPrint').style.display = 'none';
    document.getElementById('viewHelp').style.display = 'none';
    document.getElementById('viewAbout').style.display = 'none';
    section.style.display = '';
    var showLink = document.getElementById('showView'+view);
    document.getElementById('showViewEdit').href.onclick = '';
    document.getElementById('showViewEdit').setAttribute('class', 'button');
    document.getElementById('showViewPreview').href.onclick = '';
    document.getElementById('showViewPreview').setAttribute('class', 'button');
    document.getElementById('showViewExport').href.onclick = '';
    document.getElementById('showViewExport').setAttribute('class', 'button');
    document.getElementById('showViewPrint').href.onclick = '';
    document.getElementById('showViewPrint').setAttribute('class', 'button');
    document.getElementById('showViewHelp').href.onclick = '';
    document.getElementById('showViewHelp').setAttribute('class', 'button');
    document.getElementById('showViewAbout').href.onclick = '';
    document.getElementById('showViewAbout').setAttribute('class', 'button');
    showLink.setAttribute('class', 'selectedButton');
    showLink.href.onclick = 'return false;';
    if (view == 'Preview') {
        forumPreview();
    }
    if (view == 'Export') {
        forumExport();
    }
}
window['showView'] = showView;

// data dump
function dataDump() {
    var win = window.open('', 'PowerHouse Data Dump');
    win.document.write('<h3><a onclick="document.getElementById(\'super-stat\').scrollIntoView();">Super Stat Data</a></h3>');
    win.document.write('<h3><a onclick="document.getElementById(\'innate-talent\').scrollIntoView();">Innate Talent Data</a></h3>');
    win.document.write('<h3><a onclick="document.getElementById(\'talent\').scrollIntoView();">Talent Data</a></h3>');
    win.document.write('<h3><a onclick="document.getElementById(\'travel-power\').scrollIntoView();">Travel Power Data</a></h3>');
    win.document.write('<h3><a onclick="document.getElementById(\'power-set\').scrollIntoView();">Power Set Data</a></h3>');
    win.document.write('<h3><a onclick="document.getElementById(\'framework\').scrollIntoView();">Framework Data</a></h3>');
    win.document.write('<h3><a onclick="document.getElementById(\'power\').scrollIntoView();">Power Data</a></h3>');
    win.document.write('<h3><a onclick="document.getElementById(\'archetype-group\').scrollIntoView();">Archetype Group Data</a></h3>');
    win.document.write('<h3><a onclick="document.getElementById(\'archetype\').scrollIntoView();">Archetype Data</a></h3>');
    win.document.write('<hr>');
    win.document.write('<h2 id="super-stat">Super Stat Data</h3>');
    for (var i=1; i<dataSuperStat.length; i++) {
        win.document.write('dataSuperStat['+i+'] = '+dataSuperStat[i].toString()+'<br />');
    }
    win.document.write('<hr>');
    win.document.write('<h2 id="innate-talent">Innate Talent Data</h3>');
    for (var i=1; i<dataInnateTalent.length; i++) {
        win.document.write('dataInnateTalent['+i+'] = '+dataInnateTalent[i].toString()+'<br />');
    }
    win.document.write('<hr>');
    win.document.write('<h2 id="talent">Talent Data</h3>');
    for (var i=1; i<dataTalent.length; i++) {
        win.document.write('dataTalent['+i+'] = '+dataTalent[i].toString()+'<br />');
    }
    win.document.write('<hr>');
    win.document.write('<h2 id="travel-power">Travel Power Data</h3>');
    for (var i=1; i<dataTravelPower.length; i++) {
        win.document.write('dataTravelPower['+i+'] = '+dataTravelPower[i].toString()+'<br />');
    }
    win.document.write('<hr>');
    win.document.write('<h2 id="power-set">Power Set Data</h3>');
    for (var i=1; i<dataPowerSet.length; i++) {
        win.document.write('dataPowerSet['+i+'] = '+dataPowerSet[i].toString()+'<br />');
    }
    win.document.write('<hr>');
    win.document.write('<h2 id="framework">Framework Data</h3>');
    for (var i=1; i<dataFramework.length; i++) {
        win.document.write('dataFramework['+i+'] = '+dataFramework[i].toString()+'<br />');
    }
    win.document.write('<hr>');
    win.document.write('<h2 id="power">Power Data</h3>');
    for (var i=1; i<dataPower.length; i++) {
        win.document.write('dataPower['+i+'] = '+dataPower[i].toString()+'<br />');
    }
    win.document.write('<hr>');
    win.document.write('<h2 id="archetype-group">Archetype Group Data</h3>');
    for (var i=1; i<dataArchetypeGroup.length; i++) {
        win.document.write('dataArchetypeGroup['+i+'] = '+dataArchetypeGroup[i].toString()+'<br />');
    }
    win.document.write('<hr>');
    win.document.write('<h2 id="archetype">Archetype Data</h3>');
    for (var i=1; i<dataArchetype.length; i++) {
        win.document.write('dataArchetype['+i+'] = '+dataArchetype[i].toString()+'<br />');
    }
    win.focus();
}

// start
function start() {
    // show edit view
    showView('Edit');

    // setup version
    document.getElementById('version').firstChild.data = 'Version: '+version+' ('+releaseDate+')';

    // setup name
    document.getElementById('fieldName').firstChild.data = phName;
    document.getElementById('sectionDisplayName').style.display = '';
    document.getElementById('editName').value = phName;
    document.getElementById('sectionEditName').style.display = 'none';
    setTitle();

    // setup archetype
    document.getElementById('fieldArchetype').innerHTML = phArchetype.desc;

    // setup super stats
    var selectSuperStat = document.getElementById('selectSuperStat');
    for (var i=0; i<dataSuperStat.length; i++) {
        if (i == 0) {
            var a = document.createElement('a');
            a.setAttribute('id', 'selectSuperStat'+i);
            a.setAttribute('onclick', 'setSuperStat('+i+')');
            a.innerHTML = 'Clear';
            selectSuperStat.appendChild(a);
            var span = document.createElement('span');
            span.innerHTML = ' &nbsp; ';
            selectSuperStat.appendChild(span);
            var a = document.createElement('a');
            a.setAttribute('id', 'selectSuperStatCancel');
            a.setAttribute('onclick', 'selectClear()');
            a.innerHTML = 'Cancel';
            selectSuperStat.appendChild(a);
        } else {
            var a = document.createElement('a');
            a.setAttribute('id', 'selectSuperStat'+i);
            a.setAttribute('onclick', 'setSuperStat('+i+')');
            if (dataSuperStat[i].tip != null) {
                a.setAttribute('onmouseover', 'popup(\''+dataSuperStat[i].tip+'\')');
                a.setAttribute('onmouseout', 'popout()');
            }
            a.innerHTML = dataSuperStat[i].desc;
            selectSuperStat.appendChild(a);
        }
        selectSuperStat.appendChild(document.createElement('br'));
    }
    hideSection('selectionSuperStat');

    // setup innate talents
    var selectInnateTalent = document.getElementById('selectInnateTalent');
    var selectInnateTalentLeft = document.getElementById('selectInnateTalentLeft');
    var selectInnateTalentRight = document.getElementById('selectInnateTalentRight');
    for (var i=0; i<dataInnateTalent.length; i++) {
        if (i == 0) {
            var a = document.createElement('a');
            a.setAttribute('id', 'selectInnateTalent'+i);
            a.setAttribute('onclick', 'setInnateTalent('+i+')');
            a.innerHTML = 'Clear';
            selectInnateTalent.appendChild(a);
            var span = document.createElement('span');
            span.innerHTML = ' &nbsp; ';
            selectInnateTalent.appendChild(span);
            var a = document.createElement('a');
            a.setAttribute('id', 'selectInnateTalentCancel');
            a.setAttribute('onclick', 'selectClear()');
            a.innerHTML = 'Cancel';
            selectInnateTalent.appendChild(a);
        } else {
            if (i <= dataInnateTalent.length/2) selectInnateTalent = selectInnateTalentLeft;
            else selectInnateTalent = selectInnateTalentRight;
            var a = document.createElement('a');
            a.setAttribute('id', 'selectInnateTalent'+i);
            a.setAttribute('onclick', 'setInnateTalent('+i+')');
            if (dataInnateTalent[i].tip != null) {
                a.setAttribute('onmouseover', 'popup(\''+dataInnateTalent[i].tip+'\')');
                a.setAttribute('onmouseout', 'popout()');
            }
            a.innerHTML = '<img src="img/Innate_Talent.png" />&nbsp;' +
                dataInnateTalent[i].desc +
                ((dataInnateTalent[i].extra != null) ?
                 ' <span class="spec">('+dataInnateTalent[i].extra+')</span>' : '');
            selectInnateTalent.appendChild(a);
        }
        selectInnateTalent.appendChild(document.createElement('br'));
    }
    hideSection('selectionInnateTalent');

    // setup talents
    var selectTalent = document.getElementById('selectTalent');
    var selectTalentLeft = document.getElementById('selectTalentLeft');
    var selectTalentRight = document.getElementById('selectTalentRight');
    for (var i=0; i<dataTalent.length; i++) {
        if (i == 0) {
            var a = document.createElement('a');
            a.setAttribute('id', 'selectTalent'+i);
            a.setAttribute('onclick', 'setTalent('+i+')');
            a.innerHTML = 'Clear';
            selectTalent.appendChild(a);
            var span = document.createElement('span');
            span.innerHTML = ' &nbsp; ';
            selectTalent.appendChild(span);
            var a = document.createElement('a');
            a.setAttribute('id', 'selectTalentCancel');
            a.setAttribute('onclick', 'selectClear()');
            a.innerHTML = 'Cancel';
            selectTalent.appendChild(a);
        } else {
            if (i <= dataTalent.length/2) selectTalent = selectTalentLeft;
            else selectTalent = selectTalentRight;
            var a = document.createElement('a');
            a.setAttribute('id', 'selectTalent'+i);
            a.setAttribute('onclick', 'setTalent('+i+')');
            // if (dataTalent[i].tip != null) {
            //     a.setAttribute('onmouseover', 'popup(\''+dataTalent[i].tip+'\')');
            //     a.setAttribute('onmouseout', 'popout()');
            // }
            a.innerHTML = '<img src="img/Talent.png" />&nbsp;'+dataTalent[i].desc +
                ((dataTalent[i].extra != null) ?
                 ' <span class="spec">('+dataTalent[i].extra+')</span>' : '');
            selectTalent.appendChild(a);
        }
        selectTalent.appendChild(document.createElement('br'));
    }
    hideSection('selectionTalent');

    // setup travel powers
    var selectTravelPower = document.getElementById('selectTravelPower');
    var selectTravelPowerLeft = document.getElementById('selectTravelPowerLeft');
    var selectTravelPowerRight = document.getElementById('selectTravelPowerRight');
    for (var i=0; i<dataTravelPower.length; i++) {
        if (i == 0) {
            var a = document.createElement('a');
            a.setAttribute('id', 'selectTravelPower'+i);
            a.setAttribute('onclick', 'setTravelPower('+i+')');
            a.innerHTML = 'Clear';
            selectTravelPower.appendChild(a);
            var span = document.createElement('span');
            span.innerHTML = ' &nbsp; ';
            selectTravelPower.appendChild(span);
            var a = document.createElement('a');
            a.setAttribute('id', 'selectTravelPowerCancel');
            a.setAttribute('onclick', 'selectClear()');
            a.innerHTML = 'Cancel';
            selectTravelPower.appendChild(a);
        } else {
            if (i <= dataTravelPower.length/2) selectTravelPower = selectTravelPowerLeft;
            else selectTravelPower = selectTravelPowerRight;
            var a = document.createElement('a');
            a.setAttribute('id', 'selectTravelPower'+i);
            a.setAttribute('onclick', 'setTravelPower('+i+')');
            if (dataTravelPower[i].tip != null) {
                a.setAttribute('onmouseover', 'popup(\''+dataTravelPower[i].tip+'\')');
                a.setAttribute('onmouseout', 'popout()');
            }
            a.innerHTML = dataTravelPower[i].desc;
            selectTravelPower.appendChild(a);
        }
        selectTravelPower.appendChild(document.createElement('br'));
    }
    hideSection('selectionTravelPower');
    hideSection('selectionTravelPowerAdvantage');

    // setup frameworks
    var selectFramework = document.getElementById('selectFramework');
    var table = document.createElement('table');
    var tr = document.createElement('tr');
    table.appendChild(tr);
    var newRow = Math.floor(dataFramework.length/2);
    for (var i=1; i<dataFramework.length; i++) {
        var td = document.createElement('td');
        tr.appendChild(td);
        var a = document.createElement('a');
        a.setAttribute('id', 'selectFramework'+i);
        a.setAttribute('onclick', 'selectFramework('+i+')');
        if (dataFramework[i].tip != null) {
            a.setAttribute('onmouseover', 'popup(\''+dataFramework[i].tip+'\')');
            a.setAttribute('onmouseout', 'popout()');
        }
        a.innerHTML = dataFramework[i].desc;
        td.appendChild(a);
        if (i == newRow) {
            tr = document.createElement('tr');
            table.appendChild(tr);
        }
    }
    selectFramework.appendChild(table);

    // setup powers
    // powers are setup when a framework is selected with the `selectFramework' function
    hideSection('selectionPower');
    hideSection('selectionPowerAdvantage');

    // setup archetypes
    var selectArchetype = document.getElementById('selectArchetype');
    var selectArchetypeLeft = document.getElementById('selectArchetypeLeft');
    var selectArchetypeRight = document.getElementById('selectArchetypeRight');
    for (var i=0; i<dataArchetype.length; i++) {
        if (i == 0) {
            var a = document.createElement('a');
            a.setAttribute('id', 'selectArchetypeCancel');
            a.setAttribute('onclick', 'selectClear()');
            a.innerHTML = 'Cancel';
            selectArchetype.appendChild(a);
        } else {
            if (i <= dataArchetype.length/2) selectArchetype = selectArchetypeLeft;
            else selectArchetype = selectArchetypeRight;
            var a = document.createElement('a');
            a.setAttribute('id', 'selectArchetype'+i);
            a.setAttribute('onclick', 'setArchetype('+i+')');
            if (dataArchetype[i].tip != null) {
                a.setAttribute('onmouseover', 'popup(\''+dataArchetype[i].tip+'\')');
                a.setAttribute('onmouseout', 'popout()');
            }
            a.innerHTML = dataArchetype[i].desc;
            selectArchetype.appendChild(a);
        }
        selectArchetype.appendChild(document.createElement('br'));
    }
    hideSection('selectionArchetype');
    hideSection('selectionArchetypePower');

    // parse url
    parseUrlParams(window.location.href);

    // change updates
    changeUpdate();
}
window['start'] = start;

window.onload = start;

//==============================================================================
// End of File
//==============================================================================
