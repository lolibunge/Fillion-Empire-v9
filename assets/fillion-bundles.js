// bundle-component.js
class BundleComponent extends HTMLElement {
    constructor() {
      super();
  
      // Create shadow DOM
      this.attachShadow({ mode: 'open' });
  
      // Clone the template into the shadow DOM
      this.shadowRoot.appendChild(document.getElementById('bundle-template').content.cloneNode(true));
  
      // Find the button elements in the shadow DOM
      this.addToCartButton = this.shadowRoot.querySelector('.add-to-cart-button');
      this.removeFromCartButton = this.shadowRoot.querySelector('.remove-from-cart-button');
      this.addToCart2Button = this.shadowRoot.querySelector('#addToCart2');
  
      // Add event listeners
      this.addToCartButton.addEventListener('click', () => {
        this.addToCart(this.getAttribute('bundle-id'), this.getAttribute('variant-id'), this.getAttribute('price'));
      });
  
      this.removeFromCartButton.addEventListener('click', () => {
        this.removeFromCart(this.getAttribute('variant-id'), this.getAttribute('bundle-id'));
      });
  
      this.addToCart2Button?.addEventListener('click', (e) => {
        e.preventDefault();
        this.addBundlesToCart();
      });
  
      // Call updateCartCount on page load to initially show the cart count
      this.updateCartCount();
  
      // ... Other event listeners can be added here
    }
  
    // Function to add a product to the cart
    addToCart(bundleId, variantId, price) {
      var formData = new FormData();
      formData.append('id', variantId);
      formData.append('quantity', 1);
      formData.append('properties[bundleId]', bundleId);
      formData.append('properties[price]', price);
  
      fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      })
        .then(function(response) {
          console.log('Product added to cart:', response);
          // Perform any additional actions or UI updates as needed
  
          // Change button text and style after product is added
          this.addToCartButton.textContent = 'Added to Cart';
          this.addToCartButton.classList.add('added-to-cart');
  
          // Disable the button
          this.addToCartButton.disabled = true;
  
          // Update cart count
          this.updateCartCount();
        }.bind(this)) // Bind 'this' to the outer context
        .catch(function(error) {
          console.error('Error adding product to cart:', error);
        });
    }
  
    // Function to remove a product from the cart
    removeFromCart(variantId, bundleId) {
      fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: variantId,
          quantity: 0
        })
      })
        .then(function(response) {
          console.log('Product removed from cart:', response);
          // Perform any additional actions or UI updates as needed
  
          // Change button text and style after product is removed
          this.removeFromCartButton.textContent = 'Removed from Cart';
          this.removeFromCartButton.classList.add('removed-from-cart');
  
          // Enable the button
          this.removeFromCartButton.disabled = true;
  
          // Update cart count
          this.updateCartCount();
        }.bind(this)) // Bind 'this' to the outer context
        .catch(function(error) {
          console.error('Error removing product from cart:', error);
        });
    }
  
    // Function to update cart count
    updateCartCount() {
      fetch('/cart.js')
        .then(function(response) {
          if (!response.ok) {
            throw new Error('Error retrieving cart information: ' + response.status);
          }
          return response.json();
        })
        .then(function(cart) {
          var cartCount = cart.item_count;
          var cartCountElement = this.shadowRoot.querySelector('.site-header-cart--count');
  
          if (cartCountElement) {
            if (cartCount > 0) {
              cartCountElement.classList.add('visible');
  
              // Add the cart count value after the cart count
              cartCountElement.setAttribute('data-count', cartCount);
            } else {
              cartCountElement.classList.remove('visible');
            }
          }
  
          // Remove selected state from bundles that are not in the cart
          var bundleButtons = this.shadowRoot.querySelectorAll('.bundle-build__select');
          bundleButtons.forEach(function(button) {
            var bundleId = button.getAttribute('data-bundle-id');
            var isItemInCart = cart.items.some(function(item) {
              return item.properties && item.properties.bundleId === bundleId;
            });
  
            var slideContainer = button.closest('.bundle-build__slide');
            if (!isItemInCart) {
              slideContainer.classList.remove('selected');
            } else {
              slideContainer.classList.add('selected');
            }
          });
        }.bind(this)) // Bind 'this' to the outer context
        .catch(function(error) {
          console.error('Error retrieving cart information:', error);
        });
    }
  
    // Function to handle adding bundles to the cart
    addBundlesToCart() {
      const $variant = this.shadowRoot.querySelector('#add-to-cart-form input[name="id"]');
      const $variantQuantity = this.shadowRoot.querySelector('#quantity');
      const selectedVariantID = $variant.value;
      const selectedVariantQuantity = $variantQuantity.value || 1;
      const data = {}
      data.items = selectedBundles.map(
        bundleID => {
          const $variant = this.shadowRoot.querySelector(`.bundle-build__slide[data-bundle-id="${bundleID}"] select`);
          const bundleVariantID = $variant?.value;
          return {
            id: bundleVariantID,
            quantity: 1
          }
        }
      )
  
      data.items.unshift({
        id: selectedVariantID,
        quantity: selectedVariantQuantity
      });
  
      fetch("/cart/add.js", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then(response => response.json())
        .then(data => {
          window.open('/cart', '_self')
        })
        .catch(error => {
          alert('error!')
          console.error(error)
        });
    }
  
    // Function to update the total bundles price
    updateTotalBundlesPrice() {
      // ... Existing updateTotalBundlesPrice function code
      const $price = document.querySelector('.product-pricing-info .money');
        const $variant = document.querySelector('#add-to-cart-form input[name="id"]');
        const selectedVariantID = $variant.value;

        const basePrice = variantData.get(selectedVariantID)?.price;

        let price = basePrice;

        for (var i in selectedBundles) {
        const bundleID = selectedBundles[i];
        const $variant = document.querySelector(`.bundle-build__slide[data-bundle-id="${bundleID}"] select`);

        const bundleVariantID = $variant?.value;

        if (bundleVariantID) {

            price += variantData.get(bundleVariantID)?.price;

        }


        }

        let discount = 0;

        if (selectedBundles.length == 0) {
        discount = 0;
        } else {
        discount = 5;
        }

        const discountedPrice = price * (100 - discount) / 100;

        const priceFormatted = Math.round(discountedPrice) / 100;

        $price.innerHTML = `$${priceFormatted}`;
    }
  
    // Function to select a bundle
    selectBundle(bundleID) {
      // ... Existing selectBundle function code
      const $bundle = document.querySelector(`.bundle-build__slide[data-bundle-id="${bundleID}"]`);

        if (!selectedBundles.includes(bundleID)) {
        selectedBundles.push(bundleID);
        $bundle.classList.add('selected');
        } else {
        selectedBundles.splice(selectedBundles.indexOf(bundleID), 1);
        $bundle.classList.remove('selected');
        }
    }
  }
  
  customElements.define('bundle-product', BundleComponent);
  