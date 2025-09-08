import { useState, useEffect } from 'react';
import styles from '../styles/trending.module.css';

export default function TrendingPage() {
    const [trends, setTrends] = useState([]);

    useEffect(() => {
        async function fetchTrends() {
            const response = await fetch('/api/trending');
            const result = await response.json();
            setTrends(result.data);
        }
        fetchTrends();
    }, []);

    return (
        <div className={styles.container}>
            <h1>موضوعات ترند</h1>
            {trends.map((trend, index) => (
                <div key={index} className={styles.trendItem}>
                    <h3>{trend.title}</h3>
                    <p>محبوبیت: {trend.popularity}</p>
                    <p>رشد: {trend.growthRate}</p>
                </div>
            ))}
        </div>
    );
}