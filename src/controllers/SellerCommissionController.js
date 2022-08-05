const moment = require('moment');
const Sale = require('../models/Sale');
const formatCurrency = require('../lib/formatCurrency');
const Seller = require('../models/Seller');

class SellerCommissionController {
  async index(req, res) {
    const { id } = req.params;

    const { startDate, finalDate } = req.body;

    const seller = await Seller.findById(id);

    const filters = {};

    let total = 0;

    let nameSeller = '';

    if (startDate || finalDate) {
      filters.createdAt = {};

      const startDate = moment(req.body.startDate).format(
        'YYYY-MM-DDT00:mm:ss.SSSZ'
      );

      const finalDate = moment(req.body.finalDate).format(
        'YYYY-MM-DDT23:59:ss.SSSZ'
      );

      filters.createdAt.$gte = startDate;
      filters.createdAt.$lte = finalDate;
    }

    let sales = await Sale.paginate(filters, {
      page: req.query.page || 1,
      limit: parseInt(req.query.limit_page) || 1000000000,
      populate: ['sale.products.product', 'seller'],
      sort: '-createdAt',
    });

    const getSalesPromise = sales.docs.map(async (sale) => {
      sale.formattedDate = moment(sale.createdAt).format(
        'DD-MM-YYYY'
      );
      sale.sale.products.map((product) => {
        product.formattedPrice = formatCurrency.brl(product.price);
      });

      sale.sale.formattedTotal = formatCurrency.brl(sale.sale.total);

      if (!sale.sale.descount) {
        sale.sale.descount = 0;
      }

      return sale;
    });

    sales = await Promise.all(getSalesPromise);

    let dateFilter = false;

    if (startDate || finalDate) {
      sales = sales.filter((sale) => {
        if (sale.seller) {
          if (String(id) === String(sale.seller._id)) {
            total += sale.sale.total;
            return sale;
          }
        }
      });

      dateFilter = true;
    }

    if (!startDate || !finalDate) {
      sales = sales.filter((sale) => {
        if (
          moment(sale.createdAt).month() ===
            moment(Date.now()).month() &&
          moment(sale.createdAt).year() === moment(Date.now()).year()
        ) {
          if (sale.seller) {
            if (String(id) === String(sale.seller._id)) {
              total += sale.sale.total;
              return sale;
            }
          }
        }
      });
    }

    if (seller) {
      nameSeller = seller.name;
    }

    const commission = (total / 100) * 4;

    return res.render('seller/commission', {
      sales,
      total: formatCurrency.brl(total),
      commission: formatCurrency.brl(commission),
      dateFilter: dateFilter,
      startDate,
      finalDate,
      id,
      nameSeller,
    });
  }
}

module.exports = new SellerCommissionController();
