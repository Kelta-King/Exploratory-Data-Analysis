let errorAlert = (value) => {

    if(value.includes("Error:")){
        error = value.split(":");
        alert(error[1]);
        endLoader("Load Exception");
        return true;
    }

    return false;

}

let startLoader = (process_name = "Unknown") => {

    console.log(process_name + " Started...");
    document.querySelector("#loader").style.display = "block";

}

let endLoader = (process_name = "Unknown") => {

    console.log(process_name + " Ended");
    document.querySelector("#loader").style.display = "none";

}


let setPath = () => {

    let path = document.getElementById("path").value;
    
    if(path == ""){
        alert("Please provide path");
        return false;
    }

    if(path[path.length-1] == "\\"){
        alert("Provide the file name please");
        return false;
    }
    
    startLoader("Set Path");
    let str = JSON.stringify(path);
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){

        if(this.readyState == 4 && this.status == 200){

            if(errorAlert(this.responseText)){
                return false;
            }

            endLoader("Set Path");
            let val = this.responseText;
            document.getElementById("pathResponse").innerHTML = val;
            loadAllVariables();

        }

    }
    xhttp.open("GET", "setPath?path="+str, true);
    xhttp.send();

}


let loadAllVariables = () =>{

    let perdiv = document.getElementById("columnsVars");

    while (perdiv.hasChildNodes()) {
        perdiv.removeChild(perdiv.firstChild);
    }

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){

        if(this.readyState == 4 && this.status == 200){

            if(errorAlert(this.responseText)){
                return false;
            }

            let val = JSON.parse(this.responseText);

            for (const [key, value] of Object.entries(val)) {
                
                let option = document.createElement("OPTION");
                option.value = value;
                option.innerText = value;
                perdiv.appendChild(option);

            }

        }

    }
    xhttp.open("GET", "getColumnNames", true);
    xhttp.send();

}


let addVar = () => {
    
    let varData = document.getElementById("varData").value;
    let lists = document.querySelectorAll('#columnsVars option');
    
    for (const [key, value] of Object.entries(lists)) {
        
        if(varData == value.innerText){
            
            let elements = document.getElementsByClassName("varElements");
            
            for(let i=0; i<elements.length; i++){
                if(varData.trim() == elements[i].innerText.trim()){
                    return false;
                }
            }
                        
            let span = document.createElement("SPAN");
            id = key;
            span.setAttribute("ID", id);
            span.className = "w3-padding w3-theme w3-round w3-margin-right varElements";
            span.innerText = varData;
            span.innerHTML += " <i class='fa fa-remove kel-hover w3-large' onclick='removeElement(this)'></i>"

            document.getElementById("selectedVars").appendChild(span);
        }

    }

}

let removeElement = (val) => { 
    val.parentNode.remove();
}

let selectDependentVars = () => {

    let elements = document.getElementsByClassName("varElements");
    let dependVars = [];       
    
    for(let i=0; i<elements.length; i++){
        let value = elements[i].innerText.trim();
        dependVars.push(value);
    }
    console.log(dependVars);
    
    let str = JSON.stringify(dependVars);
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){

        if(this.readyState == 4 && this.status == 200){

            if(errorAlert(this.responseText)){
                return false;
            }

            let val = this.responseText;
            document.getElementById("dependentVarResponse").innerHTML = val;
            getInputFields();

        }

    }
    xhttp.open("GET", "setDependentVariables?names="+str, true);
    xhttp.send();

}

let getInputFields = () => {

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){

        if(this.readyState == 4 && this.status == 200){

            if(errorAlert(this.responseText)){
                return false;
            }

            let indipendentVariables = JSON.parse(this.responseText);
            let inputFields = document.getElementById('inputFields');

            while(inputFields.hasChildNodes()) {
                inputFields.removeChild(inputFields.firstChild);
            }

            for (const [key, variable] of Object.entries(indipendentVariables)) {
                
                if(variable['type'] == 'categorical'){

                    let pDiv = document.createElement('DIV');
                    pDiv.setAttribute('class', 'w3-row-padding');

                    let cDiv1 = document.createElement('DIV');
                    let cDiv2 = document.createElement('DIV');

                    cDiv1.setAttribute('class', 'w3-col l4 m6 s6');
                    let label = document.createElement("LABEL");
                    label.setAttribute('for', key);
                    label.innerText = key;

                    let select = document.createElement("SELECT");
                    select.setAttribute('class', 'w3-input w3-border fieldInput');
                    select.setAttribute('id', key);

                    variable['classes'].forEach(value => {
                        
                        let op = document.createElement("OPTION");
                        op.value = value;
                        op.innerText = value;
                        select.appendChild(op);

                    });

                    cDiv2.setAttribute('class', 'w3-col l8 m6 s6');
                    ccDiv = document.createElement("DIV");
                    ccDiv.setAttribute('class', 'w3-center w3-text-red w3-padding-16 w3-large');
                    ccDiv.innerHTML = 'Select values';

                    cDiv2.appendChild(ccDiv);
                    cDiv1.appendChild(label);
                    cDiv1.appendChild(select);
                    
                    pDiv.appendChild(cDiv1);
                    pDiv.appendChild(cDiv2);

                    inputFields.appendChild(pDiv);
                    let hr = document.createElement("HR");

                    inputFields.appendChild(hr);
                    
                }
                else if(variable['type'] == 'numerical'){

                    let pDiv = document.createElement('DIV');
                    pDiv.setAttribute('class', 'w3-row-padding');

                    let cDiv1 = document.createElement('DIV');
                    let cDiv2 = document.createElement('DIV');

                    cDiv1.setAttribute('class', 'w3-col l4 m6 s6');
                    let label = document.createElement("LABEL");
                    label.setAttribute('for', key);
                    label.innerText = key;

                    let input = document.createElement("INPUT");
                    input.setAttribute('type', 'number');
                    input.setAttribute('min', parseFloat(variable['min']));
                    input.setAttribute('max', parseFloat(variable['max']));
                    input.setAttribute('value', parseFloat(variable['min']));
                    input.setAttribute('step', 'any');
                    input.setAttribute('class', 'w3-input w3-border fieldInput');
                    input.setAttribute('id', key);
                    input.setAttribute('placeholder', key+'...');

                    cDiv2.setAttribute('class', 'w3-col l8 m6 s6');
                    ccDiv = document.createElement("DIV");
                    ccDiv.setAttribute('class', 'w3-center w3-text-red w3-padding-16 w3-large');
                    ccDiv.innerHTML = 'Values: Min:' + variable['min'] + " and Max:" + variable['max'];

                    cDiv2.appendChild(ccDiv);
                    cDiv1.appendChild(label);
                    cDiv1.appendChild(input);
                    
                    pDiv.appendChild(cDiv1);
                    pDiv.appendChild(cDiv2);

                    inputFields.appendChild(pDiv);
                    let hr = document.createElement("HR");

                    inputFields.appendChild(hr);

                }
                else{
                    alert("Something went wrong");
                    return false;
                }
                
            }

            let center = document.createElement("CENTER");
            let predictButton = document.createElement("BUTTON");
            predictButton.innerText = "Predict";
            predictButton.setAttribute("class", "w3-button w3-margin kel-hover w3-round w3-theme");
            predictButton.onclick = function(){
                prediction();
            }

            center.appendChild(predictButton);
            inputFields.appendChild(center);

        }

    }
    xhttp.open("GET", "getInputFields", true);
    xhttp.send();    

}

let prediction = () => {

    startLoader("Prediction");
    // Add alert before prediction about select path or dependent varible etc.
    
    let inputFields = document.getElementsByClassName('fieldInput');
    let variableValues = [];
    let obj = {};
    let modelAlgo = document.getElementById('modelAlgos').value;

    obj['algo'] = modelAlgo;

    for( const[key, element] of Object.entries(inputFields)){
        
        let x = element.value;
        if(element.tagName == "INPUT"){
            x = parseFloat(x);
        }
        
        if(x < element.min || x > element.max){
            alert(element.id + '\'s value must be in given range');
            element.focus();
            endLoader("Prediction");
            return false;
        }
        variableValues.push(x);

    }

    obj['varValues'] = variableValues;
    obj = JSON.stringify(obj);

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){

        if(this.readyState == 4 && this.status == 200){
            
            if(errorAlert(this.responseText)){
                endLoader("Prediction");
                return false;
            }

            let predictionArea = document.getElementById('prediction');

            while (predictionArea.hasChildNodes()) {
                predictionArea.removeChild(predictionArea.firstChild);
            }

            endLoader("Prediction");

            let div = document.createElement("DIV");
            div.setAttribute('class', 'w3-padding w3-round w3-border w3-margin');
            div.innerText = "Prediction: "+this.responseText;
            predictionArea.appendChild(div);

        }

    }
    xhttp.open("GET", "predictOutput?vars="+obj, true);
    xhttp.send();

}