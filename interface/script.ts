
import { Subscribed } from '../src/entities/Subscribed';


import Client, { Product, Checkout, CartLineItemModel } from 'shopify-buy';


// Validate the structure of a cart item
const validateCartItem = (item) => {
    return item && item.variantId == '' && typeof item.quantity === 'number' && item.quantity > 0;
};

// Validate an array of cart items
const validateCartItems = (items) => {
    return Array.isArray(items) && items.every(validateCartItem);
};


const client = Client.buildClient({
    domain: 'spotify-dev.myshopify.com',
    storefrontAccessToken: import.meta.env.SHOPIFY_API_TOKEN
});

// Function to create a new cart
async function createCart(): Promise<Checkout> {
    const storedCheckoutId = localStorage.getItem('current_checkoutId');
    if (!storedCheckoutId) {
        const cart = await client.checkout.create();
        localStorage.setItem('current_checkoutId', cart.id);
        return cart;
    } else {
        return storedCheckoutId
    }

}

// Function to add an item to the cart
async function addItemToCart(Checkout_id, variantId: string, quantity: number): Promise<Checkout> {

    const lineItemsToAdd: CartLineItemModel[] = [
        {
            variantId,
            quantity,
        },
    ];
    console.log(lineItemsToAdd);
    if (validateCartItem(lineItemsToAdd)) {
        console.error('Invalid item to add to the cart');
        return;
    }

    const updatedCart = await client.checkout.addLineItems(Checkout_id, lineItemsToAdd);
    console.log(updatedCart);
    window.open(updatedCart.webUrl, '_blank').focus()
    return updatedCart;
}


//function to remove an item to the cart
async function removeItemFromCart(checkout_id: string, variantId: [], quantity: number) {

    if (validateCartItem(variantId)) {
        console.error('Invalid item to remove from the cart');
        return;
    }
    const lineItemsToRemove: CartLineItemModel[] = [
        {
            variantId,
            quantity,
        },
    ];
    // Remove a line item from the cart using the checkoutLineItemsRemove mutation
    const removedCart = client.checkout.removeLineItems(checkout_id, variantId);
    window.open(removedCart.webUrl, '_blank').focus()
    return removedCart;

}

// Function to fetch the cart by its ID
async function fetchCartById(cartId: string): Promise<Checkout> {
    const cart = await client.checkout.fetch(cartId);
    return cart;
}

// Function to fetch a product by its handle
async function fetchProductByHandle(productHandle: string): Promise<Product> {
    const product = await client.product.fetchByHandle(productHandle);
    return product;
}

const resultDiv = document.getElementById("result");
const nameInput = document.getElementById("product_handle") as HTMLInputElement;
const nameQuantityInput = document.getElementById("quantity") as HTMLInputElement;
const submitBtn = document.getElementById("submit_btn") as HTMLInputElement;
const canBtn = document.getElementById("remove_btn") as HTMLInputElement;

submitBtn.addEventListener("click", (e) => cartCustomization('add'), false);
canBtn.addEventListener("click", (e) => cartCustomization('remove'), false);

// Create a new cart


// Example usage
async function cartCustomization(action: string) {
    // Fetch a product by its handle

    try {
        const productHandle = nameInput.value;
        const productQuantity = Number(nameQuantityInput.value);
        const product = await fetchProductByHandle(productHandle);
        let updatedCart;



        const cart = await createCart();
        console.log(cart);

        // Add an item to the cart
        const variantId = product.variants[0].id; // Use the ID of a variant from the product
        var storedCheckoutId = localStorage.getItem('current_checkoutId');

        if (action == 'add') {

            updatedCart = await addItemToCart(storedCheckoutId, variantId, productQuantity);
            localStorage.setItem('current_checkoutId', updatedCart.id);
            console.log("add", localStorage.getItem('current_checkoutId'));
        } else if (action == 'remove') {
            storedCheckoutId = localStorage.getItem('current_checkoutId');
            console.log("remove", localStorage.getItem('current_checkoutId'));
            const fetchedCart = await fetchCartById(storedCheckoutId);
            console.log("fetchedcart", fetchedCart);
            //   const lineItemIds = ["gid://shopify/CheckoutLineItem/"+variantId+"?checkout="+storedCheckoutId];
            const lineItemIds = fetchedCart.lineItems.map(item => item.id);
            console.log("removal", lineItemIds);
            updatedCart = await removeItemFromCart(storedCheckoutId, lineItemIds, productQuantity);
        }

        const lineItemIds = updatedCart.lineItems.map(item => item.id);
        // const removedCart = await removeItemFromCart(updatedCart, variantId);
        //   const cartId = removedCart.id;

        // Fetch the cart by its ID (if needed)
        const cartId = updatedCart.id;
        const fetchedCart = await fetchCartById(cartId);


        //console.log('Updated Cart:', updatedCart.id);
    }
    catch (error) {
        // Handle errors here
        console.error('An error occurred: cart creation', error);
    }
}


