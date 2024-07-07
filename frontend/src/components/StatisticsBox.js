import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StatisticsBox = ({ month }) => {
    const [statistics, setStatistics] = useState({
        totalAmount: 0,
        totalSoldItems: 0,
        totalNotSoldItems: 0
    });

    useEffect(() => {
        const fetchStatistics = async () => {
            const response = await axios.get(`/api/statistics`, {
                params: { month }
            });
            setStatistics(response.data);
        };
        fetchStatistics();
    }, [month]);

    return (
        <div>
            <h2>Statistics for Month: {month}</h2>
            <p>Total Amount: {statistics.totalAmount}</p>
            <p>Total Sold Items: {statistics.totalSoldItems}</p>
            <p>Total Not Sold Items: {statistics.totalNotSoldItems}</p>
        </div>
    );
};

export default StatisticsBox;
