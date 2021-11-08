const moment = require("moment");
const Cart = require("../lib/cart");
const Product = require("../models/Product");
const formatCurrency = require("../lib/formatCurrency");

class CartController {
  async index(req, res) {
    const filters = {};
    const {change} = req.body;

    if (req.body.nome) {
      filters.nome = new RegExp(req.body.nome, "i");

      let products = await Product.find({
        name: new RegExp(req.body.nome, "i"),
      });

      const getProductsPromise = products.map(async (product) => {
        product.formattedExpirationDate = moment(product.expirationDate).format(
          "DD-MM-YYYY"
        );

        return product;
      });

      products = await Promise.all(getProductsPromise);

      let { cart } = req.session;

      cart = Cart.init(cart);

      return res.render("cart/list", { cart, products });
    }

    if (req.body.searchBarcode) {
      let products = await Product.find({
        barcode: req.body.searchBarcode,
      });

      const getProductsPromise = products.map(async (product) => {
        product.formattedExpirationDate = moment(product.expirationDate).format(
          "DD-MM-YYYY"
        );

        product.formattedSalePrice = formatCurrency.brl(product.salePrice);

        return product;
      });

      products = await Promise.all(getProductsPromise);

      let { cart } = req.session;

      cart = Cart.init(cart);

      return res.render("cart/list", { cart, products });
    }

    let { cart } = req.session;

    cart = Cart.init(cart);

    cart.items.map((item) => {
      item.formattedPrice = formatCurrency.brl(item.price);
    });

    cart.total.formattedPrice = formatCurrency.brl(cart.total.price);

    let changeFormate = 0;

    if(change) {
      changeFormate = formatCurrency.brl(change - cart.total.price);
    } else {
      changeFormate = formatCurrency.brl(0);
    }

    return res.render("cart/list", { cart, changeFormate, change });
  }

  async addOne(req, res) {
    let product = await Product.findById(req.params.id);
    let {quantity} = req.body;


    var produc = [product]

    const teste  = produc.map(async value => {
      value.teste = 100;
      return value
    })

    product = await Promise.all(teste);

    let { cart } = req.session;

    if(!quantity) {
      quantity = 1;
    }

    console.log(quantity);


    cart = Cart.init(cart).addOne({product, quantity: quantity});

    req.session.cart = cart;

    return res.redirect("/cart");
  }

  async removeOne(req, res) {
    let { id } = req.params;

    let { cart } = req.session;

    if (!cart) return res.redirect("/cart");

    cart = Cart.init(cart).removeOne(id);

    req.session.cart = cart;

    return res.redirect("/cart");
  }

  async delete(req, res) {
    let { id } = req.params;

    let { cart } = req.session;

    if (!cart) return res.redirect("/cart");

    cart = Cart.init(cart).delete(id);

    req.session.cart = cart;

    return res.redirect("/cart");
  }
}

module.exports = new CartController();
