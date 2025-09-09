let v = 0;

function showDropdown() {
    document.getElementById('accMenu').classList.toggle("show");
    v = (v == 0 ? 1 : 0);
}

document.addEventListener("click", (evt) => {
    const menu = document.getElementById("accMenu");
    const button = document.getElementById("button");
    let targetEl = evt.target;   
    do {
        if(targetEl == menu || targetEl == button) {
            return;
        }
        targetEl = targetEl.parentNode;
    }  while (targetEl);
    if (v == 1){
        menu.classList.toggle("show");
        v = (v == 0 ? 1 : 0);
    }
    
});
