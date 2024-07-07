const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');


const initializeDatabase = async () => {
    const response = await fetch('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const data = await response.json();

    data.forEach(async (item) => {
        const dateOfSale = new Date(item.dateOfSale);
        const month = dateOfSale.getMonth() + 1;

        const transaction = new Transaction({
            title: item.title,
            description: item.description,
            price: item.price,
            category: item.category,
            sold: item.sold,
            dateOfSale: dateOfSale,
            month: month
        });

        await transaction.save();
    });
};


router.get('/transactions', async (req, res) => {
    const { month, search, page = 1, perPage = 10 } = req.query;
    const query = {
        month: Number(month)
    };

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { price: { $regex: search, $options: 'i' } }
        ];
    }

    const transactions = await Transaction.find(query)
        .skip((page - 1) * perPage)
        .limit(Number(perPage));

    res.json(transactions);
});


router.get('/statistics', async (req, res) => {
    const { month } = req.query;
    const totalAmount = await Transaction.aggregate([
        { $match: { month: Number(month) } },
        { $group: { _id: null, total: { $sum: "$price" } } }
    ]);
    const totalSoldItems = await Transaction.countDocuments({ month: Number(month), sold: true });
    const totalNotSoldItems = await Transaction.countDocuments({ month: Number(month), sold: false });

    res.json({
        totalAmount: totalAmount[0] ? totalAmount[0].total : 0,
        totalSoldItems: totalSoldItems,
        totalNotSoldItems: totalNotSoldItems
    });
});


router.get('/barchart', async (req, res) => {
    const { month } = req.query;
    const priceRanges = [
        { range: "0-100", min: 0, max: 100 },
        { range: "101-200", min: 101, max: 200 },
        { range: "201-300", min: 201, max: 300 },
        { range: "301-400", min: 301, max: 400 },
        { range: "401-500", min: 401, max: 500 },
        { range: "501-600", min: 501, max: 600 },
        { range: "601-700", min: 601, max: 700 },
        { range: "701-800", min: 701, max: 800 },
        { range: "801-900", min: 801, max: 900 },
        { range: "901-above", min: 901, max: Infinity }
    ];

    const barChartData = await Promise.all(priceRanges.map(async range => {
        const count = await Transaction.countDocuments({
            month: Number(month),
            price: { $gte: range.min, $lt: range.max }
        });

        return {
            range: range.range,
            count: count
        };
    }));

    res.json(barChartData);
});


router.get('/piechart', async (req, res) => {
    const { month } = req.query;
    const pieChartData = await Transaction.aggregate([
        { $match: { month: Number(month) } },
        { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    res.json(pieChartData.map(data => ({ name: data._id, count: data.count })));
});


router.get('/combined', async (req, res) => {
    const { month } = req.query;

    const transactions = await Transaction.find({ month: Number(month) });
    const statistics = await Transaction.aggregate([
        { $match: { month: Number(month) } },
        { $group: { _id: null, total: { $sum: "$price" } } }
    ]);
    const totalSoldItems = await Transaction.countDocuments({ month: Number(month), sold: true });
    const totalNotSoldItems = await Transaction.countDocuments({ month: Number(month), sold: false });

    const barChartData = await Transaction.aggregate([
        { $match: { month: Number(month) } },
        { $bucket: {
            groupBy: "$price",
            boundaries: [0, 101, 201, 301, 401, 501, 601, 701, 801, 901],
            default: "901-above",
            output: { count: { $sum: 1 } }
        }}
    ]);

    const pieChartData = await Transaction.aggregate([
        { $match: { month: Number(month) } },
        { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    res.json({
        transactions: transactions,
        statistics: {
            totalAmount: statistics[0] ? statistics[0].total : 0,
            totalSoldItems: totalSoldItems,
            totalNotSoldItems: totalNotSoldItems
        },
        barChartData: barChartData.map(data => ({
            range: data._id,
            count: data.count
        })),
        pieChartData: pieChartData.map(data => ({
            name: data._id,
            count: data.count
        }))
    });
});

module.exports = router;
