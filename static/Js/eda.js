
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

    let perdiv = document.getElementById("varData");

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
            
            let option = document.createElement('OPTION');
            option.value = '';
            option.selected = true;
            option.disabled = true;
            option.innerText = "Select dependent variable";
            perdiv.appendChild(option);

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

let selectDependentVariable = () => {

    let dependVars = document.getElementById('varData').value;
    if(dependVars == ""){
        alert("Please select dependent variable");
        return false;
    }

    dependVars = [dependVars];
    
    let str = JSON.stringify(dependVars);
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){

        if(this.readyState == 4 && this.status == 200){

            if(errorAlert(this.responseText)){
                return false;
            }

            let val = this.responseText;
            document.getElementById("dependentVarResponse").innerHTML = val;
        }

    }
    xhttp.open("GET", "setDependentVariables?names="+str, true);
    xhttp.send();

}

let getColumnNames = () => {

    let gcn = document.getElementById("getColumnNames");

    if(gcn.checked == true){
     
        let xhttp = new XMLHttpRequest();
        startLoader("Load Column names");
        let colArea = document.querySelector("#columnNames");
        colArea.style.display = "block";
        
        xhttp.onreadystatechange = function(){
            
            if(this.status == 200 && this.readyState == 4){

                if(errorAlert(this.responseText)){
                    return false;
                }

                let val = JSON.parse(this.responseText);
                let table = document.querySelector("#columnNamesTable");
                
                while (table.hasChildNodes()) {
                    table.removeChild(table.firstChild);
                }

                let tr = document.createElement("TR");
                let td1 = document.createElement("TD");
                let td2 = document.createElement("TD");
                
                tr.setAttribute("class", "w3-theme");
                td1.innerText = "No.";
                td2.innerText = "Name";
                tr.appendChild(td1);
                tr.appendChild(td2);
                table.appendChild(tr);

                val.forEach((element, key) => {

                    let tr = document.createElement("TR");
                    let td1 = document.createElement("TD");
                    let td2 = document.createElement("TD");
                    
                    td1.innerText = key+1;
                    td2.innerText = element;

                    tr.appendChild(td1);
                    tr.appendChild(td2);
                    table.appendChild(tr);

                });
                endLoader("Load Column names");               
            }

        }
        xhttp.open("GET", "getColumnNames", true);
        xhttp.send();
    }
    else{
        let colArea = document.querySelector("#columnNames");
        colArea.style.display = "none";
    }
}

let rowsSee = () => {

    let rowGiver = document.getElementById('rowsInputField');
    let check = document.getElementById('check');
            
    if(rowGiver.style.display == "none" && check.checked == true){
        rowGiver.style.display = "block";
    }
    else{
        document.getElementById("table_rows").style.display = "none";
        rowGiver.style.display = "none";
        document.getElementById("rowVal").value = "";
        let table = document.getElementById('tableDatasets');
        while (table.hasChildNodes()) {
            table.removeChild(table.firstChild);
        }
    }

}

let load = () => {

    let n = document.getElementById('rowVal').value;
    document.getElementById("table_rows").style.display = "block";
    startLoader("Load DataSet");
    if(n == ""){
        document.getElementById('rowVal').focus();
        endLoader("Load DataSet");
        alert("mention the row value");
        return false;
    }

    if(document.querySelector('#loader').style.display == "block"){

        let table = document.getElementById('tableDatasets');
        // Remove every existing childs
        while (table.hasChildNodes()) {
            table.removeChild(table.firstChild);
        }

        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(){
            
            if(this.status == 200 && this.readyState == 4){

                if(errorAlert(this.responseText)){
                    return false;
                }

                // Json to object
                let val = JSON.parse(this.responseText);
                // titles will hold the column names in array
                let titles = [];
                // Total rows count provided from server, will be updated later
                let n = 0;

                let trHead = document.createElement("TR");
                trHead.className = "w3-theme";

                for (const [key, value] of Object.entries(val)) {
                    titles.push(key);
                    n = Object.keys(value).length;
                    let tdH = document.createElement("TD");
                    tdH.innerText = key;
                    trHead.appendChild(tdH);
                }

                table.appendChild(trHead);

                // Iteration for rows
                for(let i=0 ; i<n; i++){

                    // Making the row for one entry
                    let tr = document.createElement("TR");
                    
                    // Iteration for columns
                    titles.forEach(title => {
                        let td = document.createElement("TD");
                        td.innerText = val[title][i];
                        tr.appendChild(td);
                    });
                    // Appending row to the table
                    table.appendChild(tr);

                }

                endLoader("Load dataset");

            }

        }
        xhttp.open("GET", "getRows?count="+n, true);
        xhttp.send();
    }
}

let dimensionSee = () => {

    let dC = document.getElementById("dimensionC");

    if(dC.checked == true){
     
        let xhttp = new XMLHttpRequest();
        startLoader("Load DataSet");
        let dimArea = document.querySelector("#dimensionView");
        dimArea.style.display = "block";
        
        xhttp.onreadystatechange = function(){
            
            if(this.status == 200 && this.readyState == 4){
                
                if(errorAlert(this.responseText)){
                    return false;
                }

                let val = JSON.parse(this.responseText);
                dimArea.innerHTML = `<b>Shape: ${val[0]} </b><br><br>Rows Count: <b> ${val[1]} </b><br>Columns Count: <b> ${val[2]} </b>`;
                endLoader("Load Dataset");               
            }

        }
        xhttp.open("GET", "getDimension", true);
        xhttp.send();
    }
    else{
        let dimArea = document.querySelector("#dimensionView");
        dimArea.style.display = "none";
    }
}

let autocomplete = (input, arr) => {
    let currentFocus;
    
    input.addEventListener("input", function(e) {
        
        let a, b, i, val = this.value;
        closeAllLists();
        
        if(!val){ 
            return false;
        }

        currentFocus = -1;
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        
        this.parentNode.appendChild(a);
        
        for (i=0;i<arr.length; i++) {
          
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            
                b = document.createElement("DIV");
                
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                
                b.addEventListener("click", function(e) {
                    
                    input.value = this.getElementsByTagName("input")[0].value;
                    
                    closeAllLists();
                });
                
                a.appendChild(b);
            }
        }
    });
    
    input.addEventListener("keydown", function(e) {
        
        let x = document.getElementById(this.id + "autocomplete-list");
        
        if(x){
            x = x.getElementsByTagName("div");
        }

        if(e.keyCode == 40) {
            currentFocus++;
            addActive(x);
        } 
        else if(e.keyCode == 38){
          currentFocus--;
          addActive(x);
        } 
        else if(e.keyCode == 13){
            e.preventDefault();
            if(currentFocus > -1){
                if(x){
                    x[currentFocus].click();
                }
            }
        }

    });

    function addActive(x) {
      
        if(!x){
            return false;
        }

        removeActive(x);
        
        if(currentFocus >= x.length){
            currentFocus = 0;
        }

        if(currentFocus < 0){
            currentFocus = (x.length - 1);
        }
        
        x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x) {
      
        for (let i=0; i<x.length;i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
      
        var x = document.getElementsByClassName("autocomplete-items");
        for (let i = 0; i < x.length; i++) {
            
            if (elmnt != x[i] && elmnt != input) {
                x[i].parentNode.removeChild(x[i]);
            }

        }
    }
    
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

let columnsDataset = () => {

    let sC = document.getElementById("selectColumns");

    if(sC.checked == true){
    
        let columns = [];
        let xhttp = new XMLHttpRequest();
        startLoader("Load Columns");
        let colArea = document.querySelector("#columnShows");
        colArea.style.display = "block";
        
        xhttp.onreadystatechange = function(){
            
            if(this.status == 200 && this.readyState == 4){

                if(errorAlert(this.responseText)){
                    return false;
                }

                let val = JSON.parse(this.responseText);
                
                columns = val;
                autocomplete(document.getElementById("columnName"), columns);
                endLoader("Load Columns");
                startSelectedColumns(columns);

            }

        }
        xhttp.open("GET", "getColumnNames", true);
        xhttp.send();

    }
    else{
        
        let colArea = document.querySelector("#columnShows");
        colArea.style.display = "none";
        
        let colData = document.getElementById("columnDatas");
        while(colData.hasChildNodes()) {
            colData.removeChild(colData.firstChild);
        }
        
        let colTags = document.getElementById("columnTags");
        while(colTags.hasChildNodes()) {
            colTags.removeChild(colTags.firstChild);
        }

        document.getElementById("columnName").value = '';
        document.getElementById("showColumns").remove();
        let showColumns = document.createElement("BUTTON");
        showColumns.setAttribute("class", "w3-button w3-theme kel-hover w3-round");
        showColumns.setAttribute("id", "showColumns");
        showColumns.innerText = "Show Columns";
        
        document.getElementById('showColMar').appendChild(showColumns);

        document.getElementById("plusColumn").remove();
        let plusColumn = document.createElement("SPAN");
        plusColumn.setAttribute("class", "w3-theme w3-round w3-padding w3-hover-green kel-hover");
        plusColumn.setAttribute("id", "plusColumn");
        plusColumn.innerHTML = " <i class='fa fa-plus'></i> ";
        
        document.getElementById('addBtnArea').appendChild(plusColumn);

    }
}

let startSelectedColumns = (columns) => {
    
    selectedColumns = [];

    document.querySelector("#plusColumn").addEventListener("click", function(event){
        
        let name = document.getElementById('columnName').value;
        document.getElementById("columnName").value = "";
        let area = document.getElementById('columnTags');
        let contains = false;
        let repeat = false;
        for(let i=0; i<columns.length; i++){
            if(name == columns[i]){
                //It contains that column name
                contains = true;
                break;
            }
            else{
                contains = false;
            }
        }

        if(!contains){
            //incorrect column name selected
            alert("Write correct column names");
            return false;
        }

        for(let i=0; i<selectedColumns.length; i++){
            if(name == selectedColumns[i]){
                //It contains that column name already
                repeat = true;
                break;
            }
            else{
                repeat = false;
            }
        }

        if(repeat){
            return false;
        }
        
        //Everything is checked
        selectedColumns.push(name);
        
        let button = document.createElement("BUTTON");
        let span = document.createElement("SPAN");
        span.innerText = name;
        let i = document.createElement("I");
        i.setAttribute("class", "fa fa-times w3-margin-left");

        i.addEventListener("click", function(event){
            
            let id = name+"Col";
            
            document.getElementById(id).remove();
            for (var i = 0; i < selectedColumns.length; i++) { 
                if (selectedColumns[i] === name) {
                    let spliced = selectedColumns.splice(i, 1);
                }
            }
            
        });

        button.appendChild(span);
        button.appendChild(i);

        button.setAttribute("class", "w3-padding w3-theme w3-round w3-button w3-hover-theme w3-margin-right w3-margin-top");
        button.setAttribute("id", name+"Col");
        
        area.appendChild(button);
        console.log(selectedColumns);
    });

    document.getElementById("showColumns").addEventListener("click", function(event){
        console.log(selectedColumns);
        showColumns(selectedColumns);
        //console.log(selectedColumns);
    });

}

let showColumns = (selectedColumns) => {

    if(selectedColumns.length == 0){
        //alert("Select column names");
        document.getElementById("columnName").focus();
        console.log("here");
        return false;
    }
    else{
        console.log("Yoman");
        let colData = document.getElementById("columnDatas");
        while(colData.hasChildNodes()) {
            colData.removeChild(colData.firstChild);
        }

        selectedColumns = JSON.stringify(selectedColumns);
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(){

            if(this.status == 200 && this.readyState == 4){

                if(errorAlert(this.responseText)){
                    return false;
                }

                let val = JSON.parse(this.responseText);
                let head1 = document.createElement("TABLE");
                head1.setAttribute("class", "w3-table-all");
                let titles = [];
                
                //below tr is for the head
                let tr = document.createElement("TR");
                tr.setAttribute("class", "w3-theme");
                let td = document.createElement("TD");
                td.innerText = "No.";
                tr.appendChild(td);

                for(const [key, value] of Object.entries(val)) {
                    
                    titles.push(key);
                    let td = document.createElement("TD");
                    td.innerText = key;
                    tr.appendChild(td);

                }
                
                head1.appendChild(tr);

                let i = 0;
                while(i < Object.keys(val[titles[0]]).length){

                    let tr = document.createElement("TR");
                    let td1 = document.createElement("TD");
                    td1.innerText = i;
                    tr.appendChild(td1);
                        
                    titles.forEach(title => {
                        
                        let td2 = document.createElement("TD");
                        td2.innerText = val[title][i];
                        tr.appendChild(td2);

                    });

                    head1.appendChild(tr);
                    i++;

                }
                
                document.getElementById("columnDatas").appendChild(head1);

            }

        }
        xhttp.open("GET", "getSelectedColumns?cols="+selectedColumns,true);
        xhttp.send();
    }
}

let showDynamicScatterPlot = () => {

    let sP = document.getElementById("dynamicScatterPlotcheck");

    if(sP.checked == true){
     
        let xhttp = new XMLHttpRequest();
        startLoader("Load Scatter plot");
        
        let downArea = document.querySelector("#downArea");
        let dynamicImage = document.querySelector("#dynamicScatterPlotShow");
        while(dynamicImage.hasChildNodes()) {
            dynamicImage.removeChild(dynamicImage.firstChild);
        }

        xhttp.onreadystatechange = function(){
            
            if(this.status == 200 && this.readyState == 4){
                
                if(errorAlert(this.responseText)){
                    return false;
                }

                let val = JSON.parse(this.responseText);
                
                let op1 = document.createElement("SELECT");
                let op2 = document.createElement("SELECT");

                let label1 = document.createElement("LABEL");
                let label2 = document.createElement("LABEL");

                label1.innerText = "X-Axis";
                label2.innerText = "Y-Axis";

                op1.setAttribute("class", "w3-input w3-border");
                op1.setAttribute("id", "op1");

                op2.setAttribute("class", "w3-input w3-border");
                op2.setAttribute("id", "op2");

                label1.setAttribute('for', 'op1');
                label2.setAttribute('for', 'op2');

                val.forEach(element => {

                    let o1 = document.createElement("OPTION");
                    o1.innerText = element;
                    o1.value = element;
                    op1.appendChild(o1);

                    let o2 = document.createElement("OPTION");
                    o2.innerText = element;
                    o2.value = element;
                    op2.appendChild(o2);

                });

                document.getElementById('xValue').appendChild(label1);
                document.getElementById('xValue').appendChild(op1);
                
                document.getElementById('yValue').appendChild(label2);
                document.getElementById('yValue').appendChild(op2);

                downArea.style.display = "block";
        
                endLoader("Load Scatter plot");
            }

        }
        xhttp.open("GET", "getNumericalIndipendentColumns", true);
        xhttp.send();
    }
    else{
        let plotArea = document.querySelector("#dynamicScatterPlotShow");
        plotArea.style.display = "none";
                
        while(plotArea.hasChildNodes()) {
            plotArea.removeChild(plotArea.firstChild);
        }

        plotArea = document.querySelector("#xValue");
                
        while(plotArea.hasChildNodes()) {
            plotArea.removeChild(plotArea.firstChild);
        }

        plotArea = document.querySelector("#yValue");
                
        while(plotArea.hasChildNodes()) {
            plotArea.removeChild(plotArea.firstChild);
        }

        document.querySelector("#downArea").style.display = "none";

    }

}

let getDynamicScatterPlot = () => {

    let xAxis = document.getElementById('op1').value;
    let yAxis = document.getElementById('op2').value;
    
    let obj = {
        xAxis:xAxis,
        yAxis:yAxis
    }

    obj = JSON.stringify(obj);
    let xhttp = new XMLHttpRequest();
    startLoader("Load Dynamic image");
    
    let plotArea = document.querySelector("#dynamicScatterPlotShow");

    while(plotArea.hasChildNodes()) {
        plotArea.removeChild(plotArea.firstChild);
    }

    plotArea.style.display = "block";
    
    xhttp.onreadystatechange = function(){
        
        if(this.status == 200 && this.readyState == 4){
            
            if(errorAlert(this.responseText)){
                return false;
            }

            let images = JSON.parse(this.responseText);
            
            images.forEach(image => {

                let img = document.createElement("IMG");
                img.src = "data:image/png;base64, ";
                img.alt = "img";
                img.src += image;
                img.className = "w3-image";
                img.setAttribute("style", "width:80%");
                plotArea.appendChild(img);

            });
                        
            loadNewPreview();
            endLoader("Load Dataset");
        }

    }
    xhttp.open("GET", "getDynamicScatterPlot?vals="+obj, true);
    xhttp.send();

}

let start2dPlot = () => {

    let tD = document.getElementById("2dPlotcheck");

    if(tD.checked == true){
     
        let xhttp = new XMLHttpRequest();
        startLoader("Load 2D plot");
        
        let downArea = document.getElementById("2dArea");
        let dynamicImage = document.getElementById("2dPlotShow");
        while(dynamicImage.hasChildNodes()) {
            dynamicImage.removeChild(dynamicImage.firstChild);
        }

        xhttp.onreadystatechange = function(){
            
            if(this.status == 200 && this.readyState == 4){
                
                if(errorAlert(this.responseText)){
                    return false;
                }

                let val = JSON.parse(this.responseText);
                
                let op1 = document.createElement("SELECT");
                let op2 = document.createElement("SELECT");

                let label1 = document.createElement("LABEL");
                let label2 = document.createElement("LABEL");

                label1.innerText = "X-Axis";
                label2.innerText = "Y-Axis";

                op1.setAttribute("class", "w3-input w3-border");
                op1.setAttribute("id", "2dop1");

                op2.setAttribute("class", "w3-input w3-border");
                op2.setAttribute("id", "2dop2");

                label1.setAttribute('for', '2dop1');
                label2.setAttribute('for', '2dop2');

                val[0].forEach(element => {
                    let op = document.createElement("option");
                    op.innerText = element;
                    op.value = element;
                    op1.appendChild(op);
                });

                val[1].forEach(element => {
                    let op = document.createElement("option");
                    op.innerText = element;
                    op.value = element;
                    op2.appendChild(op);
                });

                document.getElementById('2dxValue').appendChild(label1);
                document.getElementById('2dxValue').appendChild(op1);
                
                document.getElementById('2dyValue').appendChild(label2);
                document.getElementById('2dyValue').appendChild(op2);

                downArea.style.display = "block";
        
                endLoader("Load Scatter plot");
            }

        }
        xhttp.open("GET", "getDistinctedColumns", true);
        xhttp.send();
    }
    else{
        let plotArea = document.getElementById("2dPlotShow");
        plotArea.style.display = "none";
                
        while(plotArea.hasChildNodes()) {
            plotArea.removeChild(plotArea.firstChild);
        }

        plotArea = document.getElementById("2dxValue");
                
        while(plotArea.hasChildNodes()) {
            plotArea.removeChild(plotArea.firstChild);
        }

        plotArea = document.getElementById("2dyValue");
                
        while(plotArea.hasChildNodes()) {
            plotArea.removeChild(plotArea.firstChild);
        }

        document.getElementById("2dArea").style.display = "none";

    }


}

let get2DPlot = () => {

    let xAxis = document.getElementById('2dop1').value;
    let yAxis = document.getElementById('2dop2').value;
    
    let obj = {
        xAxis:xAxis,
        yAxis:yAxis
    }

    obj = JSON.stringify(obj);
    let xhttp = new XMLHttpRequest();
    startLoader("Load 2D Plot");
    
    let plotArea = document.getElementById("2dPlotShow");

    while(plotArea.hasChildNodes()) {
        plotArea.removeChild(plotArea.firstChild);
    }

    plotArea.style.display = "block";
    
    xhttp.onreadystatechange = function(){
        
        if(this.status == 200 && this.readyState == 4){
            
            if(errorAlert(this.responseText)){
                return false;
            }

            let images = JSON.parse(this.responseText);
            
            images.forEach(image => {

                let img = document.createElement("IMG");
                img.src = "data:image/png;base64, ";
                img.alt = "img";
                img.src += image;
                img.className = "w3-image";
                img.setAttribute("style", "width:80%");
                plotArea.appendChild(img);

            });
                        
            loadNewPreview();
            endLoader("Load 2D Plot");
        }

    }
    xhttp.open("GET", "get2DPlot?vals="+obj, true);
    xhttp.send();

}

let pieChartDependentVariable = () => {

    let pC = document.getElementById("pieChart");

    if(pC.checked == true){

        let xhttp = new XMLHttpRequest();
        startLoader("Load Pie");
        
        let dynamicImage = document.querySelector("#pieChartShow");

        while(dynamicImage.hasChildNodes()) {
            dynamicImage.removeChild(dynamicImage.firstChild);
        }
        dynamicImage.style.display = "block";

        xhttp.onreadystatechange = function(){
            
            if(this.status == 200 && this.readyState == 4){
                
                if(errorAlert(this.responseText)){
                    return false;
                }

                let values = JSON.parse(this.responseText);
                
                values.forEach(element => {
                    
                    for (const [key, value] of Object.entries(element)){

                        if(key == 'image'){
                            let img = document.createElement("IMG");
                            img.src = "data:image/png;base64, ";
                            img.alt = "img";
                            img.src += value;
                            img.className = "w3-image";
                            img.setAttribute("style", "width:80%");
                            dynamicImage.appendChild(img);
                        }
                        else{
                            let ct = key;
                            
                            let div = document.createElement("DIV");
                            div.innerHTML = `Total ${ct} outputs: <b> ${value} </b>`;
                                
                            dynamicImage.appendChild(div);
                        }
    
                    }

                });

                loadNewPreview();
                endLoader("Load Pie");
            }

        }
        xhttp.open("GET", "pieChartData", true);
        xhttp.send();

    }
    else{

        let plotArea = document.querySelector("#pieChartShow");
        plotArea.style.display = "none";
                
        while(plotArea.hasChildNodes()) {
            plotArea.removeChild(plotArea.firstChild);
        }

    }

}

let showColumnsStats = () => {

    let cS = document.getElementById("columnStats");

    if(cS.checked == true){
     
        let xhttp = new XMLHttpRequest();
        startLoader("Load columns stats");
        
        let chooseNames = document.querySelector("#chooseNames");
        let dynamicImage = document.querySelector("#columnStatsPlotShow");

        while(dynamicImage.hasChildNodes()) {
            dynamicImage.removeChild(dynamicImage.firstChild);
        }

        xhttp.onreadystatechange = function(){
            
            if(this.status == 200 && this.readyState == 4){
                
                if(errorAlert(this.responseText)){
                    return false;
                }

                let val = JSON.parse(this.responseText);
                
                let op1 = document.createElement("SELECT");
                let label1 = document.createElement("LABEL");

                label1.innerText = "Select Column";

                op1.setAttribute("class", "w3-input w3-border");
                op1.setAttribute("id", "statOp1");

                label1.setAttribute('for', 'statOp1');
                
                let op = document.createElement('OPTION');
                op.innerText = 'Select coulmn';
                op.value = '';
                op.selected = true;
                op.disabled = true;
                op1.appendChild(op);
                

                val.forEach(element => {

                    let o1 = document.createElement("OPTION");
                    o1.innerText = element;
                    o1.value = element;
                    op1.appendChild(o1);

                });

                document.getElementById('columnValue').appendChild(label1);
                document.getElementById('columnValue').appendChild(op1);

                chooseNames.style.display = "block";
        
                endLoader("Load columns stat");
            }

        }
        xhttp.open("GET", "getNumericalIndipendentColumns", true);
        xhttp.send();
    }
    else{
        let plotArea = document.querySelector("#columnStatsPlotShow");
        document.getElementById("chooseNames").style.display = "none";
        plotArea.style.display = "none";
                
        while(plotArea.hasChildNodes()) {
            plotArea.removeChild(plotArea.firstChild);
        }
        
        plotArea = document.querySelector("#columnValue");

        while(plotArea.hasChildNodes()) {
            plotArea.removeChild(plotArea.firstChild);
        }

    }

}

let getStats = () => {

    let column = document.getElementById('statOp1').value;
    let operation = document.getElementById('operation').value;
    
    if(column == ''){
        alert("Please select a column");
        return false;
    }

    let obj = {
        column:column,
        operation:operation
    }

    obj = JSON.stringify(obj);
    let xhttp = new XMLHttpRequest();
    startLoader("Load Dynamic image");
    
    let plotArea = document.querySelector("#columnStatsPlotShow");

    while(plotArea.hasChildNodes()) {
        plotArea.removeChild(plotArea.firstChild);
    }

    plotArea.style.display = "block";
    
    xhttp.onreadystatechange = function(){
        
        if(this.status == 200 && this.readyState == 4){
            
            if(errorAlert(this.responseText)){
                return false;
            }

            let details = JSON.parse(this.responseText);
            
            details.forEach(detail => {
                
                for (const [key, value] of Object.entries(detail)){

                    if(key == "image"){

                        let img = document.createElement("IMG");
                        img.src = "data:image/png;base64, ";
                        img.alt = "img";
                        img.src += value;
                        img.className = "w3-image";
                        img.setAttribute("style", "width:80%");
                        plotArea.appendChild(img);

                    }
                    else{
                        let div = document.createElement("DIV");
                        div.innerHTML = value;
                        plotArea.appendChild(div);
                    }

                }

            });
                        
            loadNewPreview();   
            endLoader("Load Dataset");
        }

    }
    xhttp.open("GET", "getStatsOfColumns?vals="+obj, true);
    xhttp.send();

}


let showPairPlot = () => {

    let pP = document.getElementById("getPairPlot");

    if(pP.checked == true){

        let xhttp = new XMLHttpRequest();
        startLoader("Load Pair Plot");
        
        let dynamicImage = document.querySelector("#pairPlotShow");

        while(dynamicImage.hasChildNodes()) {
            dynamicImage.removeChild(dynamicImage.firstChild);
        }
        dynamicImage.style.display = "block";

        xhttp.onreadystatechange = function(){
            
            if(this.status == 200 && this.readyState == 4){
                
                if(errorAlert(this.responseText)){
                    return false;
                }

                let images = JSON.parse(this.responseText);
                
                images.forEach(image => {
                    
                    let img = document.createElement("IMG");
                    img.src = "data:image/png;base64, ";
                    img.alt = "img";
                    img.src += image;
                    img.className = "w3-image";
                    img.setAttribute("style", "width:80%");
                    dynamicImage.appendChild(img);

                });
                
                
                loadNewPreview();
                endLoader("Load Pair Plot");
            }

        }
        xhttp.open("GET", "getPairPlot", true);
        xhttp.send();

    }
    else{

        let plotArea = document.querySelector("#pairPlotShow");
        plotArea.style.display = "none";
                
        while(plotArea.hasChildNodes()) {
            plotArea.removeChild(plotArea.firstChild);
        }

    }

}

let getCorelationPlot = () => {

    let pP = document.getElementById("getCorelationPlot");

    if(pP.checked == true){

        let xhttp = new XMLHttpRequest();
        startLoader("Load Corelation Plot");
        
        let dynamicImage = document.querySelector("#CorelationPlotShow");

        while(dynamicImage.hasChildNodes()) {
            dynamicImage.removeChild(dynamicImage.firstChild);
        }
        dynamicImage.style.display = "block";

        xhttp.onreadystatechange = function(){
            
            if(this.status == 200 && this.readyState == 4){
                
                if(errorAlert(this.responseText)){
                    return false;
                }

                let val = this.responseText;
            
                let img = document.createElement("IMG");
                img.src = "data:image/png;base64, ";
                img.alt = "img";
                img.src += val;
                img.className = "w3-image";
                //img.setAttribute("style", "width:80%");
                dynamicImage.appendChild(img);
                
                loadNewPreview();
                endLoader("Load Pair Plot");
            }

        }
        xhttp.open("GET", "getCorelationPlot", true);
        xhttp.send();

    }
    else{

        let plotArea = document.querySelector("#CorelationPlotShow");
        plotArea.style.display = "none";
                
        while(plotArea.hasChildNodes()) {
            plotArea.removeChild(plotArea.firstChild);
        }

    }

}

let preview = (url) => {

    console.log("previewURL");
    let modal = document.createElement("DIV");
    modal.setAttribute("style", "z-index:5");
    let src = url;
    modal.setAttribute("ID", src);
    modal.className = 'w3-modal';
    
    let endTimes = document.createElement("SPAN");
    endTimes.className = 'w3-button kel-hover w3-white w3-hover-red w3-xlarge w3-display-topright';
    endTimes.innerHTML = "&times;";
    
    endTimes.addEventListener('click', ()=>{
        document.getElementById(src).remove(); 
    });

    let smallDiv = document.createElement("DIV");
    smallDiv.className = 'w3-modal-content w3-animate-zoom w3-center';
    smallDiv.style.backgroundColor = 'transparent';

    let image = document.createElement("IMG");
    image.style.maxWidth = '100%';
    image.style.minHeight = '80vh';
    image.style.maxHeight = '100vh';

    
    image.src = url;

    smallDiv.appendChild(image);
    modal.appendChild(endTimes);
    modal.appendChild(smallDiv);

    document.body.appendChild(modal);
    modal.style.display = 'block';

}

let loadNewPreview = () => {

    console.log("PreviewLoad");
    let images = document.getElementsByTagName("img");
    
    for(let i=0; i<images.length; i++){

        images[i].style.cursor = "pointer";
        images[i].onclick = function(){
            preview(this.src);
        }

    }

}

loadNewPreview();