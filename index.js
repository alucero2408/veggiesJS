const cartStorageKey = "CART"

let data = [];

const emptyCartButton = document.querySelector(".empty_cart");
const buyButton = document.querySelector(".buy");

emptyCartButton.addEventListener("click", emptyCart);
buyButton.addEventListener("click", finishBuy);


updateProducts();


function updateProducts(){

	fetch('https://mocki.io/v1/48810ef0-9427-4bb4-b9a9-93503d1656b8')
		.then( response => response.json() )
		.then( d => {

			data = d;
			document.querySelector(".card_container").innerHTML = "";

			for (const elem of data) {
				addProduct(elem);
			}

			updateCart();

		})

}

function updateCart(){

	const liBase = document.querySelector(".example_li");
	const ulCart = document.querySelector(".ul_cart");

	ulCart.innerHTML = "";

	let items = getItems()

	let total = 0;

	for (const elem of items) {

		let item = data.find(x => x.id == elem.id);

		let li = liBase.cloneNode(true);
		
		li.innerHTML = item.title + " ("+elem.quantity+") <b>$" + item.price+"</b>" ;

		total += item.price * elem.quantity;

		showElement(li);
		ulCart.appendChild(li)

	}

	if(items.length > 0){
		let li = liBase.cloneNode(true);
		li.innerHTML = "<b>TOTAL = $" + total + " </b>";
		showElement(li);
		ulCart.appendChild(li)
		showElement(emptyCartButton, "inline-block");
		showElement(buyButton, "inline-block");
	}else{
		let li = liBase.cloneNode(true);
		li.innerHTML = "Carrito vacio";
		showElement(li);
		ulCart.appendChild(li)
		hideElement(emptyCartButton);
		hideElement(buyButton);
	}




}

function addProduct(product){

	const baseCard = document.getElementsByClassName("example_card")[0];
	const newCard = baseCard.cloneNode(true);

	let itemInCart = getItem(product.id);
	const quantityElem = newCard.querySelector(".quantity");

	newCard.querySelector(".card-title").innerText = product.title;
	newCard.querySelector(".card-text").innerText = product.body;
	newCard.querySelector(".card-img-top").src = product.image;
	newCard.querySelector(".productId").value = product.id;
	newCard.querySelector(".price").innerText = "$ "+product.price;

	const addToCart = newCard.querySelector(".add_to_cart")
	const deleteCart = newCard.querySelector(".delete_cart")

	let qty = 1;
	if(itemInCart){
		hideElement(addToCart)
		hideElement(quantityElem)
		showElement(deleteCart)
		qty = itemInCart.quantity;
	}else{
		hideElement(deleteCart)
		showElement(addToCart)
		showElement(quantityElem)
	}

	quantityElem.value = qty;

	addToCart.addEventListener("click", () => {
		itemAddToCart(newCard, product)
	});

	deleteCart.addEventListener("click", () => {
		itemDeleteCart(newCard, product)
	});

	document.getElementsByClassName("card_container")[0].appendChild(newCard)





}

function itemAddToCart(element, product){

	const qty = element.querySelector(".quantity").value

	if(qty > 0){
		product.quantity = qty;
	
		addItem(product);
	
		showElement(element.querySelector(".delete_cart"))
		hideElement(element.querySelector(".add_to_cart"))
		hideElement(element.querySelector(".quantity"))
		
		updateCart();

	}else{
		showModal("La cantidad ingresada es incorrecta", "Error", "error", "Continuar")
	}

}

function itemDeleteCart(element, product){

	removeItem(product.id)

	showElement(element.querySelector(".add_to_cart"))
	showElement(element.querySelector(".quantity"))
	hideElement(element.querySelector(".delete_cart"))

	updateCart();

}

function addItem(product){
	let data = getItems();
	let itemExistKey = data.findIndex(x => x.id == product.id);

	let productSave = {
		id : product.id,
		quantity : product.quantity
	}

	if(itemExistKey > -1 ){
		data[itemExistKey] = productSave;
	}else{
		data.push(productSave);
	}

	showToast("success", "Agregado al carrito correctamente")

	localStorage.setItem(cartStorageKey, JSON.stringify(data));
}

function removeItem(id){
	let data = getItems();
	let itemExistKey = data.findIndex(x => x.id == id);
	data.splice(itemExistKey, 1);
	localStorage.setItem(cartStorageKey, JSON.stringify(data));
}

function emptyCart(wNotif = true){
	localStorage.setItem(cartStorageKey, JSON.stringify([]));
	updateCart();
	updateProducts();

	if(wNotif)
		showToast("info", "Carrito vaciado correctamente")

}

function getItems(){
	let data = localStorage.getItem(cartStorageKey)
	return data ? JSON.parse(data) : []
}

function getItem(id){

	let data = localStorage.getItem(cartStorageKey)

	if(data){
		let info = JSON.parse(data);
		let itemExistKey = info.findIndex(x => x.id == id);
		return itemExistKey > -1 ? info[itemExistKey] : null
	}

	return null;
	
}

function finishBuy(){
	showModal("¿Desea finalizar la compra?", "Comprar", "info", "Finalizar", () => {
		emptyCart(false);
		showToast("success", "Compra realizada correctamente")
	});
}

function hideElement(element){
	element.style.display = "none";
}

function showElement(element, display = "block"){
	element.style.display = display;
}

function showModal(text, title, icon, buttonText, callback = null){
	Swal.fire({
		title: title,
		text: text,
		icon: icon,
		confirmButtonColor: '#4fa062',
		confirmButtonText: buttonText
	  }).then((result) => {
		if (result.isConfirmed && callback != null) {
			callback();
		}
})
}

function showToast(icon, title){

	let Toast = Swal.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: 3000,
		timerProgressBar: true,
	  })
	  
	Toast.fire({
		icon: icon,
		title: title
	  })
}