const uuid  = require("uuid");

let addValue = 0;
let addValueDelete = 0;
const Cart = {
  init(oldCart) {
    if (oldCart) {
      this.items = oldCart.items;
      this.total = oldCart.total;
      this.productsVariedValues =  oldCart.productsVariedValues ? oldCart.productsVariedValues : [{}];;
      this.totalProdutsVaried = oldCart.totalProdutsVaried;
    } else {
      this.items = [];
      this.productsVariedValues = [{}];
      this.totalProdutsVaried = 0;
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



    if(String(product.product[0]._id) === String(product.idVariedProduct)) {
      addValue = Number(product.addValue);
      this.productsVariedValues.push({id: uuid.v4() ,value: addValue});
      addValueDelete += addValue;
      inCart.price += addValue; 
      this.total.price += addValue;
      this.totalProdutsVaried += addValue;
      if(inCart.price > 0 && addValue > 0) inCart.quantity++;
    } else {
      inCart.quantity++
      inCart.price = inCart.product.salePrice * inCart.quantity;
      this.total.price += inCart.product.salePrice;
    }

    this.total.quantity++;

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
  delete(product) {
    let inCart = this.items.find(
      (item) => String(item.product._id) === String(product.id) 
    );

    // console.log(inCart);

    if (!inCart) return this;

    if (this.items.length > 0) {
    // console.log("Caio aq");
      this.total.quantity -= inCart.quantity;
      if(String(inCart.product._id) === String(product.variedProductID)) {
        inCart.price = 0;
        inCart.formattedPrice  = 0;
        this.total.price -= addValueDelete;
        addValue = 0;
        addValueDelete = 0;
        this.productsVariedValues = [{}];
        this.totalProdutsVaried = 0;
      } else {
        this.total.price -= inCart.product.salePrice * inCart.quantity;
      }
    }

    // console.log(inCart);
    // console.log(this.items); 

    this.items = this.items.filter(
      (item) => String(inCart.product._id) != String(item.product._id)
    );

    // console.log(this.items); 

    return this;
  },
};

module.exports = Cart;
