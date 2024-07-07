import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import connectAndSeed from './seed';
import Transaction from './models/Transaction';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());


app.get('/api/seed', async (req, res) => {
    await connectAndSeed();
    res.send('Database seeded successfully');
});


app.get('/api/transactions', async (req, res) => {
    const { month, search = '', page = 1, perPage = 10 } = req.query;
    const regex = new RegExp(search, 'i');
    const transactions = await Transaction.find({
        dateOfSale: { $regex: `-${month}-` },
        $or: [
            { title: regex },
            { description: regex },
            { price: regex }
        ]
    })
    .skip((page - 1) * perPage)
    .limit(perPage);
    res.json(transactions);
});


app.get('/api/statistics', async (req, res) => {
    const { month } = req.query;

    const totalSaleAmount = await Transaction.aggregate([
        { $match: { dateOfSale: { $regex: `-${month}-` }, sold: true } },
        { $group: { _id: null, totalAmount: { $sum: "$price" } } }
    ]);

    const totalSoldItems = await Transaction.countDocuments({ dateOfSale: { $regex: `-${month}-` }, sold: true });

    const totalNotSoldItems = await Transaction.countDocuments({ dateOfSale: { $regex: `-${month}-` }, sold: false });

    res.json({
        totalSaleAmount: totalSaleAmount[0]?.totalAmount || 0,
        totalSoldItems,
        totalNotSoldItems
    });
});


app.get('/api/bar-chart', async (req, res) => {
    const { month } = req.query;

    const priceRanges = [
        { range: '0-100', min: 0, max: 100 },
        { range: '101-200', min: 101, max: 200 },
        { range: '201-300', min: 201, max: 300 },
        { range: '301-400', min: 301, max: 400 },
        { range: '401-500', min: 401, max: 500 },
        { range: '501-600', min: 501, max: 600 },
        { range: '601-700', min: 601, max: 700 },
        { range: '701-800', min: 701, max: 800 },
        { range: '801-900', min: 801, max: 900 },
        { range: '901-above', min: 901, max: Infinity }
    ];

    const barChartData = await Promise.all(priceRanges.map(async ({ range, min, max }) => {
        const count = await Transaction.countDocuments({
            dateOfSale: { $regex: `-${month}-` },
            price: { $gte: min, $lte: max }
        });
        return { range, count };
    }));

    res.json(barChartData);
});


app.get('/api/pie-chart', async (req, res) => {
    const { month } = req.query;

    const pieChartData = await Transaction.aggregate([
        { $match: { dateOfSale: { $regex: `-${month}-` } } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $project: { _id: 0, category: "$_id", count: 1 } }
    ]);

    res.json(pieChartData);
});


app.get('/api/combined-data', async (req, res) => {
    const { month } = req.query;

    const [transactions, statistics, barChartData, pieChartData] = await Promise.all([
        Transaction.find({ dateOfSale: { $regex: `-${month}-` } }),
        Transaction.aggregate([
            { $match: { dateOfSale: { $regex: `-${month}-` }, sold: true } },
            { $group: { _id: null, totalAmount: { $sum: "$price" } } }
        ]),
        Promise.all(priceRanges.map(async ({ range, min, max }) => {
            const count = await Transaction.countDocuments({
                dateOfSale: { $regex: `-${month}-` },
                price: { $gte: min, $lte: max }
            });
            return { range, count };
        })),
        Transaction.aggregate([
            { $match: { dateOfSale: { $regex: `-${month}-` } } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $project: { _id: 0, category: "$_id", count: 1 } }
        ])
    ]);

    res.json({
        transactions,
        statistics: {
            totalSaleAmount: statistics[0]?.totalAmount || 0,
            totalSoldItems: await Transaction.countDocuments({ dateOfSale: { $regex: `-${month}-` }, sold: true }),
            totalNotSoldItems: await Transaction.countDocuments({ dateOfSale: { $regex: `-${month}-` }, sold: false })
        },
        barChartData,
        pieChartData
    });
});

mongoose.connect('mongodb://localhost:27017/mernstack', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => console.error('MongoDB connection error:', err));
