const moment = require('moment');
const Cart = require('../lib/cart');
const Product = require('../models/Product');
const formatCurrency = require('../lib/formatCurrency');
const { insertMany } = require('../models/Product');
const Seller = require('../models/Seller');

class CartController {
  async index(req, res) {
    const filters = {};
    const { change } = req.body;
    const variedProduct = await Product.findOne({
      name: 'PRODUTOS VARIADOS',
    });

    const sellers = await Seller.find();

    if (req.body.nome) {
      filters.nome = new RegExp(req.body.nome, 'i');

      let products = await Product.find({
        name: new RegExp(req.body.nome, 'i'),
      });

      const getProductsPromise = products.map(async (product) => {
        product.formattedExpirationDate = moment(
          product.expirationDate
        ).format('DD-MM-YYYY');

        return product;
      });

      products = await Promise.all(getProductsPromise);

      let { cart } = req.session;

      cart = Cart.init(cart);

      cart.productsVariedValues.map((item) => {
        item.formattedValue = formatCurrency.brl(item.value);
      });

      cart.totalproductsVariedFormated = formatCurrency.brl(
        cart.totalProdutsVaried
      );

      return res.render('cart/list', {
        cart,
        products,
        idVariedProduct: variedProduct,
        sellers,
      });
    }

    if (req.body.searchBarcode) {
      let products = await Product.find({
        barcode: req.body.searchBarcode,
      });

      const getProductsPromise = products.map(async (product) => {
        product.formattedExpirationDate = moment(
          product.expirationDate
        ).format('DD-MM-YYYY');

        product.formattedSalePrice = formatCurrency.brl(
          product.salePrice
        );

        return product;
      });

      products = await Promise.all(getProductsPromise);

      let { cart } = req.session;

      cart = Cart.init(cart);

      cart.productsVariedValues.map((item) => {
        item.formattedValue = formatCurrency.brl(item.value);
      });

      cart.totalproductsVariedFormated = formatCurrency.brl(
        cart.totalProdutsVaried
      );

      return res.render('cart/list', {
        cart,
        products,
        idVariedProduct: variedProduct._id,
        sellers,
      });
    }

    let { cart } = req.session;

    cart = Cart.init(cart);

    cart.items.map((item) => {
      item.formattedPrice = formatCurrency.brl(item.price);
    });

    cart.total.formattedPrice = formatCurrency.brl(cart.total.price);

    cart.productsVariedValues.map((item) => {
      item.formattedValue = formatCurrency.brl(item.value);
    });

    cart.totalproductsVariedFormated = formatCurrency.brl(
      cart.totalProdutsVaried
    );

    let changeFormate = 0;

    if (change) {
      changeFormate = formatCurrency.brl(change - cart.total.price);
    } else {
      changeFormate = formatCurrency.brl(0);
    }

    console.log(cart);

    return res.render('cart/list', {
      cart,
      changeFormate,
      change,
      idVariedProduct: variedProduct._id,
      sellers,
    });
  }

  async addOne(req, res) {
    let { searchBarcode, addValue } = req.body;
    const { id } = req.params;
    const variedProduct = await Product.findOne({
      name: 'PRODUTOS VARIADOS',
    });

    let idVariedProduct = '';

    // console.log(varie  dProduct);

    if (variedProduct) {
      idVariedProduct = variedProduct._id;
    }

    if (!addValue) {
      addValue = 0;
    }

    // console.log(req.body);

    let product;

    if (searchBarcode) {
      product = await Product.findOne({ barcode: searchBarcode });
    }

    if (id) {
      product = await Product.findById(req.params.id);
    }

    // console.log(product);
    let { quantity } = req.body;

    if (!product) {
      return;
    } else {
      var produc = [product];

      const teste = produc.map(async (value) => {
        value.teste = 100;
        return value;
      });

      product = await Promise.all(teste);

      let { cart } = req.session;

      if (!quantity) {
        quantity = 1;
      }

      cart = Cart.init(cart).addOne({
        product,
        quantity: quantity,
        addValue,
        idVariedProduct,
      });

      req.session.cart = cart;
    }

    return res.redirect('/cart');
  }

  async removeOne(req, res) {
    let { id } = req.params;

    let { cart } = req.session;

    if (!cart) return res.redirect('/cart');

    cart = Cart.init(cart).removeOne(id);

    req.session.cart = cart;

    return res.redirect('/cart');
  }

  async delete(req, res) {
    let { id } = req.params;

    let { cart } = req.session;

    const variedProduct = await Product.findOne({
      name: 'PRODUTOS VARIADOS',
    });

    // console.log(variedProduct);

    // cart.items.map(item => {
    //   // console.log(item);
    //   if(String(item.product._id) === String(id) ) {
    //     console.log("teste");
    //     item.price = 0;
    //   }
    // })

    // if(id === variedProduct._id) {

    // }

    if (!cart) return res.redirect('/cart');

    // cart = Cart.init(cart).addOne({product: [variedProduct], addValue: 0 , idVariedProduct: variedProduct._id, delete: true});

    cart = Cart.init(cart).delete({
      id,
      variedProductID: variedProduct._id,
    });

    // console.log(cart);

    req.session.cart = cart;

    return res.redirect('/cart');
  }
}

module.exports = new CartController();
