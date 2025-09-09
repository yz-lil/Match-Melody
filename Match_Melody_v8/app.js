const form = document.getElementById("contactForm");
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name");
    const msg = document.getElementById("msg");
    const phone = document.getElementById("phone");
    const email = document.getElementById("email");

    if (name.value == "" || email.value == "" || phone.value == "") {
        alert("Error empty fields.");
    } else {
        let theName = name.value;
        let theEmail = email.value;
        let thePhone = phone.value;
        let theMsg = msg.value;
        console.log(theName+"\n"+theEmail+"\n"+thePhone+"\n"+theMsg);
        form.reset();
    }
  });