const variables = {
    "x": { "id": 0, "desc": "horizontal displacement", "si_unit": "m", "units": { "km": 1000 } },
    "F": { "id": 1, "desc": "force", "si_unit": "N", "units": { "lb": 4.44 } },
    "m": { "id": 2, "desc": "mass", "si_unit": "kg", "units": {} },
    "a": { "id": 3, "desc": "acceleration", "si_unit": "m/s^2", "units": {"km/h^2": 1000} },
    "A": { "id": 4, "desc": "cross-sectional area", "si_unit": "m^s", "units": {} }
};

const formulae = {
    "F=ma": { "id": 0, "eval_notation": "F=m*a", "desc": "Newton's first law", "likes": 2, "dislikes": 1, "verified": true, "variables": ["F", "m", "a"]},
    "P=F/A": { "id": 1, "eval_notation": "P=F/A", "desc": "", "likes": 0, "dislikes": 0, "verified": true, "variables": ["F", "m", "a"] },
    "E=mc^2": { "id": 2, "eval_notation": "E=m*c^2", "desc": "", "likes": 2, "dislikes": 0, "verified": false, "variables": ["F", "m", "a"] }
};

const subscripts = ["", "_1", "_2", "_i", "_f", "_1i", "_1f", "_2i", "_2f"];

var addValues = true;

const numberSearchEntries = 20;

// {"v": {"_i": {"value": 2.0, "unit": "km/h"}}}
// {"v": ["_i", "_f"]}
var variablesWithValues = {};

const constVarBlock = document.querySelector("#surelyjswillfindthis");

for ([key, val] of Object.entries(variables).slice(0, Math.min(numberSearchEntries, Object.keys(variables).length))) {
    var variableBlock = document.createElement("div");
    variableBlock.className = "variable";
    variableBlock.id = key;
    variableBlock.innerHTML = `${key} <span style='color: gray'>${val.desc}</span><button type='button' onclick='addVariable("${key}", this)'>add</button>`;
    constVarBlock.appendChild(variableBlock);
}

function checkAllFilled(){
    const elements = document.querySelectorAll('.valuesspecific');
    for (const element of elements) {
        var inputField = element.querySelector("input").value == "";
        var isUnknown = element.nextElementSibling.checked;
        if (addValues && inputField && (!isUnknown)) {
            console.log("tf");
            return false;
        }
    }
    return true;
}

function formByVarGroupFunc(e){
    e.preventDefault();
    var varForm = document.querySelector("#variableForm");
    var jsFind = document.querySelector("#surelyjswillfindthis");
    var emptyError = document.querySelector("#variableError");
    console.log(checkAllFilled());
    if (!checkAllFilled()){
        console.log("tfagain");
        emptyError.innerHTML = "Error. Some variables' values are not entered. Mark a variable unknown or fill in all fields.";
        emptyError.style.color = "red";
    } else {
        findFomulaeByVar();
    }
}

function addValuesFunc(theThis){
    if (theThis.checked) {
        addValues = true;
        actuallyAddValues();
    } else {
        addValues = false;
        actuallyUnaddValues();
    }
}

function actuallyAddValues(){
    const elements = document.querySelectorAll('.valuesspecific');
    elements.forEach(element => {
        element.style.display = 'inline';
        element.querySelector("input").required = true;
    });
}

function actuallyUnaddValues(){
    const elements = document.querySelectorAll('.valuesspecific');
    elements.forEach(element => {
        element.style.display = 'none';
        element.querySelector("input").required = false;
    });
}

function likeFormula(formula, theThis){
    formulae[formula].likes += 1;
    theThis.disabled = true;
    theThis.nextSibling.disabled = true;
}

function dislikeFormula(formula, theThis){
    formulae[formula].dislikes += 1;
    theThis.disabled = true;
    theThis.previousSibling.disabled = true;
    // on mod page, pull formulae, well, on the mod page.
}

function getSelectedVariableWithSubs(){
    var result = [];
    for (variable in variablesWithValues) {
        for (sub of Object.keys(variablesWithValues[variable])) {
            result.push(`${variable}${sub}`);
        }
    }
    
    return result;
}

function addVariableOption(variable, theThis, is_subs = 0) {
    if (is_subs) {
        allSelects = document.querySelectorAll(`.${variable}sub`);
        variablesWithValues[variable] = {};
        for (select of allSelects) {
            var selectNextSibling = select.nextSibling;
            var unitSelect = selectNextSibling.querySelector(`.${variable}unit`);
            variablesWithValues[variable][select.options[select.selectedIndex].text] = {
                "value": selectNextSibling.querySelector(`.${variable}value`).value,
                "unit": unitSelect.options[unitSelect.selectedIndex].text
            }
        }
        disableOtherSelects(variable);
    } else {
        var thisParentElement = theThis.parentElement.parentElement;
        var thisParentSelect = thisParentElement.querySelector("select");
        var unitSelect = theThis.parentElement.querySelector("select");
        if (!(variable in variablesWithValues)){
            variablesWithValues[variable] = {};
        }
        variablesWithValues[variable][thisParentSelect.options[thisParentSelect.selectedIndex].text] = {
            "value": theThis.parentElement.querySelector(`.${variable}value`).value,
            "unit": unitSelect.options[unitSelect.selectedIndex].text
        }
        // disableOtherSelects(variable);
    }
}

// actually, fu chatgpt.
function disableOtherSelects(variable) {
    var allSubscripts = [];
    var selects = document.querySelectorAll(`#${variable} > select`);
    for (select of selects) {
        allSubscripts.push(select.options[select.selectedIndex].text);
    }

    for (select of selects) {
        var options = select.options;
        for (option of options) {
            if (allSubscripts.includes(option.text) && options[select.selectedIndex].text != option.text){
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        }
    }
}

function constructSelect(variable) {
    var optionsHTML = ``;

    for (sub of subscripts) {
        if (variable in variablesWithValues && Object.keys(variablesWithValues[variable]).includes(sub)) {
            optionsHTML += `<option disabled>${sub}</option>\n`;
        } else {
            optionsHTML += `<option>${sub}</option>\n`;
        }
    }

    return optionsHTML;
}

function replaceNumbers(theInput){
    theInput.value = theInput.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
}

function variableValueGroupFunc(variable, theInput){
    var emptyError = document.querySelector("#variableError");
    emptyError.innerHTML = "";
    replaceNumbers(theInput);
    addVariableOption(variable, theInput);
}

function variableOptionHTML(variable, optionsHTML, unitOptions, container, idId=false) {
    if (!idId) {
        if (!(variable in variablesWithValues)) {
            var unkCheckId = `0${variable}unk`;
        } else {
            var unkCheckId = `${Object.keys(variablesWithValues[variable]).length}${variable}unk}`
        }
    } else {
        var unkCheckId = `${idId}${variable}unk`
    }
    
    container.insertAdjacentHTML('beforeend', `
    <br>
    <select class="${variable}sub" onchange="addVariableOption('${variable}', this, 1)">
        ${optionsHTML}
    </select><span class="valuesspecific" style="display: none;"> <!--only display when addvalues is checked-->
        <input ${addValues ? "required" : ""} type="text" name="" class="${variable}value" oninput="variableValueGroupFunc('${variable}', this)">
        <select class="${variable}unit" onchange="addVariableOption('${variable}', this, 0)">
            ${unitOptions}
        </select>
    </span><input type="checkbox" id="${unkCheckId}" name="" onchange="deselectOtherUnknowns('${unkCheckId}')"> <label for="${unkCheckId}">Mark variable unknown</label>`);
}

function selectOptionHTML(sub){
    var optionsHTML = ``;

    for (subscript of subscripts) {
        if (subscript == sub) {
            optionsHTML += `<option selected>${subscript}</option>\n`;
        } else {
            optionsHTML += `<option>${subscript}</option>\n`;
        }
    }

    return optionsHTML;
}

function addVariable(variable, theThis) {
    console.log(variablesWithValues);
    document.querySelector("#formulaebyvar").disabled = false;
    var optionsHTML = constructSelect(variable);
    var unitOptions = "";

    const container = document.getElementById(variable);

    if (Object.keys(variablesWithValues).includes(variable) && document.querySelectorAll(`.${variable}sub`).length == 0){
        for (let i = 0; i < Object.keys(variablesWithValues[variable]).length; i++) {
            unitOptions = "";
            unitOptions += `<option>${variables[variable].si_unit}</option>`
            for (unit of Object.keys(variables[variable].units)) {
                unitOptions += `<option>${unit}</option>`;
            }
            console.log(variablesWithValues);
            optionsHTML = selectOptionHTML(Object.keys(variablesWithValues[variable])[i]);
            console.log(variablesWithValues);
            variableOptionHTML(variable, optionsHTML, unitOptions, container, i);
        }
    }

    if ((variable in variablesWithValues && Object.keys(variablesWithValues[variable]).length != subscripts.length) || !(variable in variablesWithValues)) {
        optionsHTML = constructSelect(variable);
        unitOptions += `<option>${variables[variable].si_unit}</option>`
        for (unit of Object.keys(variables[variable].units)) {
            unitOptions += `<option>${unit}</option>`;
        }

        variableOptionHTML(variable, optionsHTML, unitOptions, container);
    }
    
    addVariableOption(variable, null, 1);

    if (addValues){
        actuallyAddValues();
    } else {
        actuallyUnaddValues();
    }

    if (Object.keys(variablesWithValues[variable]).length == subscripts.length){
        theThis.disabled = true;
    }
}

function searchDictByKey(query, dictionary) {
    query = query.toLowerCase(); // Convert the query to lowercase for case-insensitive search
    const results = [];
    for (const key in dictionary) {
        const entry = dictionary[key];
        if (key.toLowerCase().includes(query[0])) {
            results.push({ key, ...entry });
        }
    }
    return results;
}

function searchDictByDesc(query, dictionary) {
    query = query.toLowerCase(); // Convert the query to lowercase for case-insensitive search
    const results = [];
    for (const key in dictionary) {
        const entry = dictionary[key];
        if (query.length > 1 && entry.desc.toLowerCase().includes(query)) {
            results.push({ key, ...entry });
        }
    }
    return results;
}

function findVariables() {
    var emptyError = document.querySelector("#variableError");
    emptyError.innerHTML = "";

    var searchBar = document.querySelector("#variablesearch");
    var variablesResultsKey = searchDictByKey(searchBar.value, variables);
    var variablesResultsDesc = searchDictByDesc(searchBar.value, variables);
    var resultsBlock = document.querySelector("#surelyjswillfindthis");
    resultsBlock.innerHTML = "";
    if (Object.keys(variablesResultsKey).length === 0) {
        for ([key, val] of Object.entries(variablesResultsDesc).slice(0, Math.min(numberSearchEntries, variablesResultsDesc.length))) {
            var variableBlock = document.createElement("div");
            variableBlock.className = "variable";
            variableBlock.id = val.key;
            variableBlock.innerHTML = `${val.key} <span style='color: gray'>${val.desc}</span><button type='button' onclick='addVariable("${val.key}", this)'>add</button>`;
            resultsBlock.appendChild(variableBlock);
        }
    } else {
        for ([key, val] of Object.entries(variablesResultsKey).slice(0, Math.min(numberSearchEntries, variablesResultsKey.length))) {
            var variableBlock = document.createElement("div");
            variableBlock.className = "variable";
            variableBlock.id = val.key;
            variableBlock.innerHTML += `${val.key} <span style='color: gray'>(${val.desc})</span><button type='button' onclick='addVariable("${val.key}", this)'>add</button>`;
            resultsBlock.appendChild(variableBlock);
        }

        for ([key, val] of Object.entries(variablesResultsDesc).slice(0, Math.min(numberSearchEntries, variablesResultsDesc.length))) {
            var variableBlock = document.createElement("div");
            variableBlock.className = "variable";
            variableBlock.id = val.key;
            variableBlock.innerHTML += `<span style='color: gray'>${val.key} (${val.desc})</span><button type='button' onclick='addVariable("${val.key}", this)'>add</button>`;
            resultsBlock.appendChild(variableBlock);
        }
    }
}

function findFormulae() {
    var searchBar = document.querySelector("#formulasearch");
    var formulaeResultsKey = searchDictByKey(searchBar.value, variables);
    var formulaeResultsDesc = searchDictByDesc(searchBar.value, variables);
    var resultsBlock = document.querySelector("#formulaeresults");
    resultsBlock.innerHTML = "";
    
}

// tq chatgpt. again.
// function sortByMatchingElements(arr1, arr2) {
//     console.log(arr1);
//     console.log(arr2);
//     const filteredArr2 = arr2.filter(item => arr1.some(el => item.includes(el)));
//     const sortedArr2 = filteredArr2.sort((a, b) => {
//         const countA = arr1.filter(el => a.includes(el)).length;
//         const countB = arr1.filter(el => b.includes(el)).length;
//         return countB - countA;
//     });
  
//     const containsAllArr1 = sortedArr2.find(item => arr1.every(el => item.includes(el)));

//     console.log(containsAllArr1);

//     if (containsAllArr1) {
//         return [sortedArr2.slice(1), containsAllArr1];
//     } else {
//         return [sortedArr2, false];
//     }
    
// }

function sortByMatchingElements(arr1, arr2) {
    const keys = Object.keys(arr2);
    const filteredKeys = keys.filter(key => arr1.some(el => arr2[key].variables.includes(el)));
    const sortedKeys = filteredKeys.sort((a, b) => {
        const countA = arr1.filter(el => arr2[a].variables.includes(el)).length;
        const countB = arr1.filter(el => arr2[b].variables.includes(el)).length;
        return countB - countA;
    });
  
    const containsAllArr1 = sortedKeys.find(key => arr1.every(el => arr2[key].variables.includes(el)));
    if (containsAllArr1) {
        console.log(containsAllArr1, arr2[containsAllArr1]);
        return [sortedKeys.slice(1), containsAllArr1];
    } else {
        return [sortedKeys, false];
    }
}

function withUnused(arr1, obj) {
    return Object.keys(obj).filter(key => {
    const thingToSortBy = obj[key].thingtosortby;
    const arr1Set = new Set(arr1);
    const thingToSortBySet = new Set(thingToSortBy);

    // Check if all elements of arr1 are in thingToSortBy
    if (arr1.every(el => thingToSortBySet.has(el))) {
        return true;
    }

    // Check if thingToSortBy is a subset of arr1
    if (thingToSortBy.every(el => arr1Set.has(el))) {
        return true;
    }

    return false;
    });
}

function exactMatches(arr1, obj) {
    return Object.keys(obj).filter(key => {
        const thingToSortBy = obj[key].thingtosortby;
        return JSON.stringify(thingToSortBy) === JSON.stringify(arr1);
    });
}

function oneExtra(arr1, obj) {
    return Object.keys(obj).filter(key => {
        const thingToSortBy = obj[key].thingtosortby;
        if (thingToSortBy.length !== arr1.length + 1) return false;
            const arr1Set = new Set(arr1);
            const extraElement = thingToSortBy.find(el => !arr1Set.has(el));
            return arr1Set.size === arr1.length && extraElement;
        }
    );
}

function getFormulaeVariables(){
    var res = [];
    for (key in formulae) {
        res.push(formulae[key].variables);
    }
    return res;
}

function findFomulaeByVar() {
    var resultsBlock = document.querySelector("#formulaeresults");
    resultsBlock.innerHTML = "";

    // var sortedFormulae = sortByMatchingElements(getSelectedVariableWithSubs(), formulae);
    // var exactFormulaMatch = sortedFormulae[1];
    // var sortedFormulae = sortedFormulae[0];

    // console.log(exactFormulaMatch);
    // console.log(sortedFormulae);

    // if (exactFormulaMatch){
    //     var exactFormulaBlock = document.createElement("div");
    //     var exactFormulaObject = formulae[exactFormulaMatch];
    //     if (Boolean(exactFormulaObject.desc)) {
    //         exactFormulaBlock.innerHTML = `${exactFormulaMatch} <span style='color: gray'> (${exactFormulaObject.desc})</span> <button onclick="likeFormula('${exactFormulaMatch}', this)">like</button><button onclick="dislikeFormula('${exactFormulaMatch}', this)">dislike</button>`;
    //     } else {
    //         exactFormulaBlock.innerHTML = `${exactFormulaMatch} <button onclick="likeFormula('${exactFormulaMatch}', this)">like</button><button onclick="dislikeFormula('${exactFormulaMatch}', this)">dislike</button>`;
    //     }
    //     resultsBlock.appendChild(exactFormulaBlock);
    //     for (key of sortedFormulae) {
    //         var formulaBlock = document.createElement("div");
    //         formulaBlock.className = "formula";
    //         if (Boolean(formulae[key].desc)) {
    //             formulaBlock.innerHTML = `<span style='color: gray'>${key} (${formulae[key].desc})</span> <button onclick="likeFormula('${exactFormulaMatch}', this)">like</button><button onclick="dislikeFormula('${exactFormulaMatch}', this)">dislike</button>`;
    //         } else {
    //             formulaBlock.innerHTML = `<span style='color: gray'>${key}</span> <button onclick="likeFormula('${exactFormulaMatch}', this)">like</button><button onclick="dislikeFormula('${exactFormulaMatch}', this)">dislike</button>`;
    //         }
    
    //         resultsBlock.appendChild(formulaBlock);
    //     }
    // } else if (!exactFormulaMatch && sortedFormulae.length == 0) {
    //     resultsBlock.innerHTML += "No formulae found. Please remember that Formula Finder is a community project, and formulae are constantly being added.";
    // } else {
    //     resultsBlock.innerHTML += "No exact matches were found. Please remember that Formula Finder is a community project, and formulae are constantly being added. Perhaps one of these will work? ";
    //     if (addValues){
    //         resultsBlock.innerHTML += "You may need to provide additional numbers for calculation to use these formulae."
    //     }

    //     for (key of sortedFormulae) {
    //         var formulaBlock = document.createElement("div");
    //         formulaBlock.className = "formula";
    //         if (Boolean(formulae[key].desc)) {
    //             formulaBlock.innerHTML = `${key}<span style='color: gray'>(${formulae[key].desc})</span><button onclick="likeFormula('${key}', this)"n>like</button><button onclick="dislikeFormula('${key}', this)">dislike</button>`;
    //         } else {
    //             formulaBlock.innerHTML = `${key} <button onclick="likeFormula('${key}', this)"n>like</button><button onclick="dislikeFormula('${key}', this)">dislike</button>`;
    //         }
    
    //         resultsBlock.appendChild(formulaBlock);
    //     }
    // }
    
}
