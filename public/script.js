function mainMenu() {
    
}

function composer() {
    
}

function readMail(id) {
    
}

function searchKeyPress(event) {
    console.log(event.key);
    if (event.key == 'Enter') {
        onSearchMail();
    }
}

function deleteMail(id) {
    console.log('del');
    var request = new XMLHttpRequest();
    request.open("GET", "https://localhost:8080/deleteMail?id=" + id);
    request.setRequestHeader('Content-type', 'application/json');
    request.send();
    //EVENT HANDLERS

    //triggered when the response is completed
    request.onload = function() {
      if (request.status === 200) {
          //parse JSON datax`x
          //data = JSON.parse(request.responseText)
          location.replace('/inbox');
      } else if (request.status === 404) {
          console.log("No records found")
      }
    }

    //triggered when a network-level error occurs with the request
    request.onerror = function() {
        console.log("Network error occurred")
    }

    //triggered periodically as the client receives data
    //used to monitor the progress of the request
    request.onprogress = function(e) {
      if (e.lengthComputable) {
          console.log(`${e.loaded} B of ${e.total} B loaded!`)
      } else {
          console.log(`${e.loaded} B loaded!`)
      }
    }
}

function starMail(id) {
    console.log('star');
    var request = new XMLHttpRequest();
    request.open("GET", "https://localhost:8080/star?id=" + id);
    request.setRequestHeader('Content-type', 'application/json');
    request.send();
    //EVENT HANDLERS

    //triggered when the response is completed
    request.onload = function() {
      if (request.status === 200) {
          //parse JSON datax`x
          //data = JSON.parse(request.responseText)
          location.replace('/inbox');
      } else if (request.status === 404) {
          console.log("No records found")
      }
    }

    //triggered when a network-level error occurs with the request
    request.onerror = function() {
        console.log("Network error occurred")
    }

    //triggered periodically as the client receives data
    //used to monitor the progress of the request
    request.onprogress = function(e) {
      if (e.lengthComputable) {
          console.log(`${e.loaded} B of ${e.total} B loaded!`)
      } else {
          console.log(`${e.loaded} B loaded!`)
      }
    }
}

function onReceiveMail(mail) {
    
}

function onSearchMail() {
    let searchterm = document.getElementById("search-bar").value;
    //var request = new XMLHttpRequest();
    window.location = "https://localhost:8080/search?searchPattern=" + searchterm;
    /*request.open("GET", "https://localhost:8080/search?searchPattern=" + searchterm);
    request.setRequestHeader('Content-type', 'application/json');
    request.send();
    //EVENT HANDLERS

    //triggered when the response is completed
    request.onload = function() {
      if (request.status === 200) {
          //parse JSON datax`x
          //data = JSON.parse(request.responseText)
          console.log(request.responseText);
          data = JSON.parse(request.responseText);
          //location.replace(data);
          console.log(data);
      } else if (request.status === 404) {
          console.log("No records found")
      }
    }

    //triggered when a network-level error occurs with the request
    request.onerror = function() {
        console.log("Network error occurred")
    }

    //triggered periodically as the client receives data
    //used to monitor the progress of the request
    request.onprogress = function(e) {
      if (e.lengthComputable) {
          console.log(`${e.loaded} B of ${e.total} B loaded!`)
      } else {
          console.log(`${e.loaded} B loaded!`)
      }
    }*/
}

function showReceivedMail(id) {
    var request = new XMLHttpRequest();
    request.open("GET", "https://localhost:8080/getMail?id=" + id);
    request.setRequestHeader('Content-type', 'application/json');
    request.send();
    //EVENT HANDLERS

    //triggered when the response is completed
    request.onload = function() {
      if (request.status === 200) {
          //parse JSON datax`x
          //data = JSON.parse(request.responseText)
          data = JSON.parse(request.responseText);
          //location.replace(data);
          console.log(data);
          let subject_e = document.getElementById('subject');
          let author_e = document.getElementById('author-name');
          let address_e = document.getElementById('mail-address');
          //let category_e = document.getElementById('category');
          let date_e = document.getElementById('time');
          let body_e = document.getElementById('message-body');
          let del = document.getElementById('delete-button');
          let star = document.getElementById('star-button');
          if (data.star) star.style.color = 'orange';
          else star.style.color = 'black';
          del.onclick = () => {deleteMail(id)};
          star.onclick = () => {starMail(id)};
          subject_e.innerHTML = data.subject;
          author_e.innerHTML = data.author_name == undefined ? "Anonymous" : data.author_name;
          address_e.innerHTML = data.sender_id;
          date_e.innerHTML = data.date;
          body_e.innerHTML = data.body;
      } else if (request.status === 404) {
          console.log("No records found")
      }
    }

    //triggered when a network-level error occurs with the request
    request.onerror = function() {
        console.log("Network error occurred")
    }

    //triggered periodically as the client receives data
    //used to monitor the progress of the request
    request.onprogress = function(e) {
      if (e.lengthComputable) {
          console.log(`${e.loaded} B of ${e.total} B loaded!`)
      } else {
          console.log(`${e.loaded} B loaded!`)
      }
    }
}

function sendMail() {
    var request = new XMLHttpRequest();
    var target = document.getElementById("destination-address").value;
    var subject = document.getElementById("subject-input").innerHTML.replace('<br>', '');
    var body = document.getElementById("email-content-text").innerHTML.replace('<br>', '');
    var sender = document.getElementById("sender").innerHTML;
    request.open("POST", "https://localhost:8080/sendMail");
    request.setRequestHeader('Content-type', 'application/json');
    let json = JSON.stringify({
        target: target,
        sender: sender,
        subject: subject,
        body: body,
        date: new Date().toTimeString()
    });
    console.log(json);
    request.send(json);
    //EVENT HANDLERS

    //triggered when the response is completed
    request.onload = function() {
      if (request.status === 200) {
          //parse JSON datax`x
          //data = JSON.parse(request.responseText)
          data = request.responseText;
          location.replace(data);
          console.log(data);
      } else if (request.status === 404) {
          console.log("No records found")
      }
    }

    //triggered when a network-level error occurs with the request
    request.onerror = function() {
        console.log("Network error occurred")
    }

    //triggered periodically as the client receives data
    //used to monitor the progress of the request
    request.onprogress = function(e) {
      if (e.lengthComputable) {
          console.log(`${e.loaded} B of ${e.total} B loaded!`)
      } else {
          console.log(`${e.loaded} B loaded!`)
      }
    }
}

function discard() {
    if(confirm("Message will be discarded. Are you sure?")) {
        // navigate to homepage
    }
}

function draft() {
    if (confirm("Are you sure you want to save it as a draft?")) {
        // save draft
    }
}

function back() {
    // go back to main menu
}