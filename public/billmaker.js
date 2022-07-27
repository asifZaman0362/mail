let count = 0;

console.log('hello');

function addPurchaseRow() {
    console.log('hello')
    let form = document.getElementById("stuff");
    let row = document.createElement('div');
    row.classList.add('purchase');
    let hor = document.createElement('div');
    hor.classList.add('horizontal-input-row');
    let fl = document.createElement('div');
    fl.classList.add('input-field');
    let label = document.createElement('label');
    label.attributes['for'] = 'id' + count.toString();
    label.innerHTML = "Product ID";
    let quantity = document.createElement('input');
    quantity.type = 'number';
    quantity.placeholder = 'Product ID';
    quantity.quantity = 'id' + count.toString();
    fl.append(label);
    fl.append(quantity);
    hor.append(fl);
    fl = document.createElement('div');
    fl.classList.add('input-field');
    label = document.createElement('label');
    label.attributes['for'] = 'discount' + count.toString();
    label.innerHTML = "Discount";
    quantity = document.createElement('input');
    quantity.type = 'number';
    quantity.placeholder = 'Enter Discount';
    quantity.quantity = 'discount' + count.toString();
    fl.append(label);
    fl.append(quantity);
    hor.append(fl);
    fl = document.createElement('div');
    fl.classList.add('input-field');
    label = document.createElement('label');
    label.attributes['for'] = 'quantity' + count.toString();
    label.innerHTML = "Quantity";
    quantity = document.createElement('input');
    quantity.type = 'text';
    quantity.placeholder = 'Enter quantity';
    quantity.quantity = 'quantity' + count.toString();
    fl.append(label);
    fl.append(quantity);
    hor.append(fl);
    row.append(hor);
    form.appendChild(row);
    console.log('created');
}

function verifyAll() {

}