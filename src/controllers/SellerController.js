const Seller = require('../models/Seller');
const User = require('../models/User');

class SellerController {
  create(req, res) {
    return res.render('seller/register');
  }

  createUpdate(req, res) {
    return res.render('user/updateuser');
  }

  async index(req, res) {
    let filters = {};

    let products = await Seller.paginate(filters, {
      limit: parseInt(req.query.limit_page) || 2000,
      sort: '-createdAt',
    });

    const { sucesso } = req.params;

    const userLogged = req.session.userId;

    return res.render('seller/list', {
      products: products.docs,
      sucesso,
      userLoggedType: userLogged.type,
    });
  }

  async store(req, res) {
    const { name } = req.body;

    let products = await Seller.find();

    let sucesso = '';

    if (!name) {
      return res.render('seller/list', {
        products: products,
        message:
          'Preencha os campos obrigatórios (*) para continuar!',
        sucesso,
      });
    }

    await Seller.create(req.body);

    return res.redirect('/sellerslist');
  }

  async edit(req, res) {
    const { id } = req.params;

    const user = await Seller.findById(id);

    return res.render('seller/update', { user: user });
  }

  async update(req, res) {
    const { id } = req.params;

    await Seller.findByIdAndUpdate(id, req.body, { new: true });

    return res.redirect('/sellerslist');
  }

  async destroy(req, res) {
    const { id } = req.params;

    await User.findByIdAndRemove(id);

    return res.redirect('/userslist');
  }
}

module.exports = new SellerController();
