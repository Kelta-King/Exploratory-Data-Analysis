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

let predict = () => {

    let path = document.getElementById("path").value;
    if(path == ""){
        alert("Please provide path");
        return false;
    }

    if(path[path.length-1] == "\\"){
        alert("Provide the file name please");
        return false;
    }

    let algo = document.getElementById('modelAlgos').value;
    
    startLoader("Predict");

    let obj = {
        path:path,
        algo:algo,
    }

    let str = JSON.stringify(obj);

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){

        if(this.readyState == 4 && this.status == 200){

            if(errorAlert(this.responseText)){
                return false;
            }

            endLoader("Predict");
            let val = this.responseText;
            console.log(val);
            alert(val);

        }

    }
    xhttp.open("GET", "batchPredict?values="+str, true);
    xhttp.send();

}