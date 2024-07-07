import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionsTable = ({ month }) => {
    const [transactions, setTransactions] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchTransactions = async () => {
            const response = await axios.get(`/api/transactions`, {
                params: { month, search, page }
            });
            setTransactions(response.data);
        };
        fetchTransactions();
    }, [month, search, page]);

    return (
        <div>
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transactions..."
            />
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Sold</th>
                        <th>Image</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction) => (
                        <tr key={transaction._id}>
                            <td>{transaction._id}</td>
                            <td>{transaction.title}</td>
                            <td>{transaction.description}</td>
                            <td>{transaction.price}</td>
                            <td>{transaction.category}</td>
                            <td>{transaction.sold ? 'Yes' : 'No'}</td>
                            <td><img src={transaction.image} alt={transaction.title} width="50" /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={() => setPage(page > 1 ? page - 1 : 1)}>Previous</button>
            <button onClick={() => setPage(page + 1)}>Next</button>
        </div>
    );
};

export default TransactionsTable;
