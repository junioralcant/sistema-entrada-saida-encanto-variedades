const Cart = {
  init(oldCart) {
    if (oldCart) {
      this.items = oldCart.items;
      this.total = oldCart.total;
    } else {
      this.items = [];
      this.total = {
        quantity: 0,
        price: 0,
      };
    }
    return this;
  },
  addOne(product) {
    let inCart = this.items.find(
      (item) => String(item.product._id) == String(product.product[0]._id)
    );

    if (!inCart) {
      if(!product.quantity) {
        inCart = {
          product: product,
          quantity: 0,
          price: 0,
        };
      }else {
        inCart = {
          product: product.product[0],
          quantity:  product.quantity - 1,
          price: 0,
        };
  
        this.items.push(inCart);
        this.total.quantity += product.quantity - 1; 
        const quantity =  product.quantity - 1;
        this.total.price += product.product[0].salePrice * quantity; 
      }
    }

    if (inCart.quantity >= product.product[0].amount) return this; 

    inCart.quantity++;
    inCart.price = inCart.product.salePrice * inCart.quantity;

    this.total.quantity++;
    this.total.price += inCart.product.salePrice;

    return this;
  },
  removeOne(productId) {
    const inCart = this.items.find(
      (item) => String(item.product._id) == String(productId)
    );

    if (!inCart) return this;

    inCart.quantity--;
    inCart.price = inCart.product.salePrice * inCart.quantity;

    this.total.quantity--;
    this.total.price -= inCart.product.salePrice;

    if (inCart.quantity < 1) {
      const itemIndex = this.items.indexOf(inCart);
      this.items.splice(itemIndex, 1);
      return this;
    }

    return this;
  },
  delete(productId) {
    const inCart = this.items.find(
      (item) => String(item.product._id) == String(productId) 
    );

    if (!inCart) return this;

    if (this.items.length > 0) {
      this.total.quantity -= inCart.quantity;
      this.total.price -= inCart.product.salePrice * inCart.quantity;
    }

    this.items = this.items.filter(
      (item) => inCart.product._id != item.product._id
    );
    return this;
  },
};

module.exports = Cart;
