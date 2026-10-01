const todoForm = document.getElementById("todoForm");
const todoItem = document.getElementById("todoItem");
const udpateTodoBtn = document.getElementById("udpateTodoBtn");
const addTodoBtn = document.getElementById("addTodoBtn");
const todoContainer = document.getElementById("todoContainer");
const spinner = document.getElementById("spinner");

const baseApi = `https://posts-crud-c2796-default-rtdb.firebaseio.com`;
const todoApi = `${baseApi}/todo.json`

function snackBar(msg, icon) {
    Swal.fire({
        text: msg,
        icon: icon,
        timer: 3000
    })
}

let localState = {
    todoArray: [],
    updateId: null
}

function toggleSpinner(){
    spinner.classList.toggle("d-none")
}

function getTodos() {
    toggleSpinner()
    let xhr = new XMLHttpRequest();
    xhr.open("GET", todoApi);
    xhr.send(null);
    xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
            let response = JSON.parse(xhr.response);
            for (let key in response) {
                response[key].id = key;
                localState.todoArray.unshift(response[key]);
            }
            renderTodos(localState.todoArray);
        }
        else {
            snackBar(`Error while fetching data`, "error");
        }

        toggleSpinner()
    }

    xhr.onerror = () => {
        snackBar(`Network error while fetching todos`);
        toggleSpinner();
    }
}

getTodos();

//read 
function renderTodos(arr) {
    let res = ``;
    arr.forEach(todo => {
        res += `
            <li class="list-group-item d-flex justify-content-between" id="${todo.id}">
                <strong>${todo.todoItem}</strong>
                <div>
                  <button onclick="onEdit(this)"  class="btn btn-sm btn-info">Edit</button>
                  <button onclick="onDelete(this)" class="btn btn-sm btn-danger ml-2">Delete</button>
                </div>
            </li>
        `
    });
    todoContainer.innerHTML = res;
}

//create

function onFormSubmit(event) {
    event.preventDefault();
    const todoObj = {
        todoItem: todoItem.value
    }
    toggleSpinner()
    let xhr = new XMLHttpRequest();
    xhr.open("POST", todoApi);
    xhr.send(JSON.stringify(todoObj));
    todoForm.reset();
    xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status <= 299) {
            let res = JSON.parse(xhr.response);
            let li = document.createElement("li");
            li.id = res.name;
            li.className = "list-group-item d-flex justify-content-between";
            li.innerHTML = `
                <strong>${todoObj.todoItem}</strong>
                <div>
                  <button onclick="onEdit(this)" class="btn btn-sm btn-info">Edit</button>
                  <button onclick="onDelete(this)" class="btn btn-sm btn-danger ml-2">Delete</button>
                </div>
            `;
            todoContainer.prepend(li);
            todoObj.id = res.name;
            localState.todoArray.unshift(todoObj);
        } else {
            console.log("error while fetching...");
        }
        toggleSpinner();
    }

    xhr.onerror = () => {
        snackBar(`Ntework issue while making api calls`); 
        toggleSpinner();
    }

}

//edit 
function onEdit(ele){
    const editId = ele.closest("li").id;
    const editObject = localState.todoArray.find(todo => todo.id === editId);
    localState.updateId = editId;
    todoItem.value = editObject.todoItem;
    addTodoBtn.classList.add("d-none");
    udpateTodoBtn.classList.remove("d-none");   
}

function onTodoUpdate(){
    const updateId = localState.updateId;
    const udpaterUrl = `${baseApi}/todo/${updateId}.json`;
    const updatedObj = {
        todoItem : todoItem.value,
        id : updateId 
    }
    toggleSpinner()
    fetch(udpaterUrl, {
        method : "PATCH",
        headers : {
            "Content-Type" : "application/json",
            "Secutity" : "JWT token"
        },
        body : JSON.stringify(updatedObj)
    })
    .then( res => {
        return res.json();
    })
    .then( data => {
        const updateIndex = localState.todoArray.findIndex( todo => todo.id === updateId);
        localState.todoArray[updateIndex] = updatedObj;
        let updateLi = document.getElementById(updateId);
        updateLi.querySelector("strong").innerText = updatedObj.todoItem;
        todoForm.reset();
        snackBar(`Todo with id ${updateId} is updated successfully...`, "success");
        addTodoBtn.classList.remove("d-none");
        udpateTodoBtn.classList.add("d-none");
    })
    .catch( err => {
        snackBar("Error while updating todo" + err , "error");
    })
    .finally( () => {
        toggleSpinner();
    })
}
//delete
function onDelete(ele) {
    const deleteId = ele.closest("li").id;
    const deleteUrl = `${baseApi}/todo/${deleteId}.json`;
    Swal.fire({
        title: `Are you sure you want to delete todo with id : ${deleteId}?`,
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            toggleSpinner();
            let xhr = new XMLHttpRequest();
            xhr.open("DELETE", deleteUrl);
            xhr.send(null);
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const deleteIndex = localState.todoArray.findIndex(todo => todo.id === deleteId);
                    localState.todoArray.splice(deleteIndex, 1);
                    ele.closest("li").remove();
                    snackBar(`Todo with id : ${deleteId} is deleted successfully...`);
                    Swal.fire({
                        title: "Deleted!",
                        text: "Your todo has been deleted.",
                        icon: "success",
                        timer : 3000
                    });

                }
                else {
                    snackBar(`Error while deleting todo`);
                }
                toggleSpinner();
            }

            xhr.onerror = () => {
                toggleSpinner();
                snackBar(`api call failed due to network error!!!`, "error");
            }
        }
    });
}

todoForm.addEventListener("submit", onFormSubmit);
udpateTodoBtn.addEventListener("click", onTodoUpdate);