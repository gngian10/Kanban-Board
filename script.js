const itemsEls = document.querySelectorAll(".items");
const wrapperEls = document.querySelectorAll(".wrapper");
const btnAddEls = document.querySelectorAll(".btn-add");
const btnSaveEls = document.querySelectorAll(".btn-save");
const btnCancelEls = document.querySelectorAll(".btn-cancel");
const optionsContainerEls = document.querySelectorAll(".options-container");
const inputEls = document.querySelectorAll(".input");

let colList = [];
let colNames = ["backlog", "progress", "review", "done"];
let draggedItem = null;
let isDragging = false;

// Buttons
function handleAddBtn(index) {
    btnAddEls[index].style.display = "none";
    optionsContainerEls[index].style.display = "flex";

    inputEls[index].focus();
}

function handleCancelBtn(index) {
    btnAddEls[index].style.display = "block";
    optionsContainerEls[index].style.display = "none";

    inputEls[index].value = "";
}

function handleSaveBtn(index) {
    let hasContentToSave = inputEls[index].value;

    if (hasContentToSave) {
        colList[index].push(hasContentToSave);

        updateDOM();

        inputEls[index].value = "";
        btnAddEls[index].style.display = "block";
        optionsContainerEls[index].style.display = "none";
    } else {
        alert("Please enter a valid value to save!");
        inputEls[index].focus();
    }
}

function handleUpdateItem(e, indexCol, indexItem) {
    if (!isDragging) {
        if (e.target.value) {
            // update
            colList[indexCol][indexItem] = e.target.value;
        } else {
            // delete
            colList[indexCol].splice(indexItem, 1);
        }

        updateDOM();
    }
}

// Drag and drop
// item
function handleDragStartItem() {
    draggedItem = this;

    draggedItem.classList.add("start-drag");
    isDragging = true;
}

function handleDragEndItem() {
    draggedItem.classList.remove("start-drag");
}

// col
function handleDragOverCol(e, index) {
    if (e.preventDefault) {
        e.preventDefault();
    }

    e.dataTransfer.dropEffect = "move";

    wrapperEls[index].classList.add("over");
}

function handleDragEnterCol(index) {
    wrapperEls[index].classList.add("over");

    wrapperEls.forEach((wrapperEl) => {
        [...wrapperEl.children].forEach((item) => {
            item.style.pointerEvents = "none";
        });
    });
}

function handleDragLeaveCol(index) {
    wrapperEls[index].classList.remove("over");
}

function handleDragEndCol() {
    wrapperEls.forEach((wrapperEl) => {
        [...wrapperEl.children].forEach((item) => {
            item.style.pointerEvents = "visible";
        });
    });

    isDragging = false;
}

function handleDropCol(e, index) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    wrapperEls[index].classList.remove("over");

    if (draggedItem.parentNode !== e.target) {
        wrapperEls[index].appendChild(draggedItem);

        colNames.forEach((colName, colIndex) => {
            colList[colIndex] = Array.from(wrapperEls[colIndex].children).map(
                (elem) => elem.value
            );
        });

        updateDOM();
    }

    isDragging = false;
    e.dataTransfer.effectAllowed = "move";
}

// Session storage
function loadItems() {
    // let defaultColValues = [
    //     ["col1 item1", "col1 item2", "col1 item3", "col1 item4"],
    //     ["col2 item1", "col2 item2"],
    //     ["col3 item1"],
    //     ["col4 item1", "col4 item2", "col4 item3"],
    // ];

    let defaultColValues = [
        ["Example", "Just Drag and Drop", "Testing"],
        [],
        [],
        [],
    ];

    colNames.forEach((colName, index) => {
        let colSaved = sessionStorage.getItem(colName);

        if (colSaved) {
            colList[index] = JSON.parse(colSaved);
        } else {
            colList[index] = defaultColValues[index];

            sessionStorage.setItem(colName, JSON.stringify(colList[index]));
        }
    });
}

function updateDOM() {
    // display in dom
    colNames.forEach((colName, indexCol) => {
        wrapperEls[indexCol].innerHTML = "";

        colList[indexCol].forEach((colEl, indexItem) => {
            let textareaEl = document.createElement("textarea");
            textareaEl.classList.add("item");
            textareaEl.value = colEl;
            textareaEl.draggable = true;

            textareaEl.addEventListener("dragstart", handleDragStartItem);
            textareaEl.addEventListener("dragend", handleDragEndItem);
            textareaEl.addEventListener("focusout", (e) =>
                handleUpdateItem(e, indexCol, indexItem)
            );

            wrapperEls[indexCol].appendChild(textareaEl);
        });
    });

    colList.forEach((colEl, index) => {
        itemsEls[index].textContent = colEl.length;
    });

    // save to session storage
    colNames.forEach((colName, index) => {
        sessionStorage.setItem(colName, JSON.stringify(colList[index]));
    });
}

// Events
wrapperEls.forEach((wrapperEl, index) => {
    wrapperEl.addEventListener("dragover", (e) => handleDragOverCol(e, index));
    wrapperEl.addEventListener("dragenter", () => handleDragEnterCol(index));
    wrapperEl.addEventListener("dragleave", () => handleDragLeaveCol(index));
    wrapperEl.addEventListener("dragend", handleDragEndCol);
    wrapperEl.addEventListener("drop", (e) => handleDropCol(e, index));
});

btnAddEls.forEach((btnAdd, index) => {
    btnAdd.addEventListener("click", () => handleAddBtn(index));
});

btnCancelEls.forEach((btnCancel, index) => {
    btnCancel.addEventListener("click", () => handleCancelBtn(index));
});

btnSaveEls.forEach((btnSave, index) => {
    btnSave.addEventListener("click", () => handleSaveBtn(index));
});

// Helpers
function $(elem) {
    return document.querySelector(elem);
}

// Initialize
function initialize() {
    loadItems();
    updateDOM();
}

initialize();
