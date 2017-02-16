function capture(id) {
    console.log("will send a request soon to " + id);
    var ajax = new XMLHttpRequest();

    ajax.open("GET", "/capture/" + id, true)
    ajax.send()
}

function verify() {
    var id = document.getElementById("v_id").value
    capture(id);
}

function vote(){
    var id = document.getElementById("v_id").value
    if (id != "") {
        window.location = "/vote/" + id;
    }
    return
}