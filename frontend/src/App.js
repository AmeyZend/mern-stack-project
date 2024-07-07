import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

const App = () => {
  const [month, setMonth] = useState('March');
  const [search, setSearch] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState({});
  const [barChart, setBarChart] = useState([]);
  const [pieChart, setPieChart] = useState([]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/transactions`, {
        params: { month, search, page }
      });
      setTransactions(response.data.transactions); // Assuming response.data.transactions contains array of transactions
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/statistics`, { params: { month } });
      setStats(response.data.stats); // Assuming response.data.stats contains statistics object
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchBarChart = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/bar-chart`, { params: { month } });
      setBarChart(response.data.barChart); // Assuming response.data.barChart contains bar chart data
    } catch (error) {
      console.error('Error fetching bar chart:', error);
    }
  };

  const fetchPieChart = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/pie-chart`, { params: { month } });
      setPieChart(response.data.pieChart); // Assuming response.data.pieChart contains pie chart data
    } catch (error) {
      console.error('Error fetching pie chart:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchStats();
    fetchBarChart();
    fetchPieChart();
  }, [month, search, page]);

  return (
    <div className="App">
      <header>Transactions Dashboard</header>
      <div className="container">
        <div className="dropdown">
          <label>Select Month: </label>
          <select value={month} onChange={e => setMonth(e.target.value)}>
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Price</th>
              <th>Category</th>
              <th>Sold</th>
              <th>Date of Sale</th>
              <th>Image</th> {/* Assuming you want to display image */}
            </tr>
          </thead>
          <tbody>
            {transactions.map(transaction => (
              <tr key={transaction.id}>
                <td>{transaction.id}</td>
                <td>{transaction.title}</td>
                <td>{transaction.description}</td>
                <td>{transaction.price}</td>
                <td>{transaction.category}</td>
                <td>{transaction.sold ? 'Yes' : 'No'}</td>
                <td>{transaction.dateOfSale}</td>
                <td><img src={transaction.image} alt={transaction.title} style={{ width: '50px', height: '50px' }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
          <button onClick={() => setPage(page + 1)}>Next</button>
        </div>
        <div className="stats">
          <div className="stat-box">
            <h3>Total Sale Amount</h3>
            <p>{stats.totalSaleAmount}</p>
          </div>
          <div className="stat-box">
            <h3>Total Sold Items</h3>
            <p>{stats.totalSoldItems}</p>
          </div>
          <div className="stat-box">
            <h3>Total Not Sold Items</h3>
            <p>{stats.totalNotSoldItems}</p>
          </div>
        </div>
        <div className="charts">
          <div className="chart">
            <h3 className="chart-title">Bar Chart</h3>
            {/* Render Bar Chart Here */}
          </div>
          <div className="chart">
            <h3 className="chart-title">Pie Chart</h3>
            {/* Render Pie Chart Here */}
          </div>
        </div>
      </div>
      <footer>&copy; 2024 Transactions Dashboard</footer>
    </div>
  );
};

export default App;
