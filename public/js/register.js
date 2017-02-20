function capture(id) {
    console.log("will send a request soon to " + id);
    var ajax = new XMLHttpRequest();

    ajax.open("GET", "/capture/" + id, true)
    ajax.send()
}

function verify() {
    var id = document.getElementById("v_id").value
    if(id == "") {
        var err = document.getElementById("err");
        err.innerHTML = "Please provide your voter id";
        return;
    } else {
        capture(id);
        return;
    }
}

function vote(){
    var id = document.getElementById("v_id").value
    if (id != "") {
        window.location = "/vote/" + id;
    } else {
        var err = document.getElementById("err");
        err.innerHTML = "Please provide your voter id";
        return;
    }
    // return
}