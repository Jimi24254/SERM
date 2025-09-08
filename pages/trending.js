import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function TrendingPage() {
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchTrends() {
            try {
                const response = await fetch('/api/trending');
                const result = await response.json();

                if (result.success) {
                    setTrends(result.data);
                } else {
                    setError('خطا در دریافت ترندها');
                }
            } catch (err) {
                setError('مشکل در ارتباط با سرور');
            } finally {
                setLoading(false);
            }
        }

        fetchTrends();
    }, []);

    const handleSelectTrend = (topic) => {
        // انتقال به صفحه تحلیل با موضوع انتخاب شده
        router.push(`/analyze?topic=${encodeURIComponent(topic)}`);
    };

    if (loading) return <div>در حال بارگذاری...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <Head>
                <title>SERM - موضوعات ترند</title>
            </Head>
            <div className="container">
                <h1>موضوعات ترند در ایران</h1>
                <div className="trends-list">
                    {trends.map((trend, index) => (
                        <div key={index} className="trend-item">
                            <h3>{trend.title}</h3>
                            <p>محبوبیت: {trend.popularity}</p>
                            <p>رشد: {trend.growthRate}</p>
                            <button onClick={() => handleSelectTrend(trend.title)}>
                                انتخاب و تولید محتوا
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <style jsx>{`
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .trends-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                }
                .trend-item {
                    border: 1px solid #ddd;
                    padding: 15px;
                    border-radius: 8px;
                    text-align: center;
                }
                button {
                    background-color: #007bff;
                    color: white;
                    border: none;
                    padding: 10px 15px;
                    border-radius: 5px;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}