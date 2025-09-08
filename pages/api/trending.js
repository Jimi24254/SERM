import googleTrends from 'google-trends-api';
import NodeCache from 'node-cache';

// ایجاد کش
const trendCache = new NodeCache({ stdTTL: 3600 });

export default async function handler(req, res) {
    // CORS و محدودیت‌های امنیتی
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // چک کردن کش
        const cachedTrends = trendCache.get('trending_topics');
        if (cachedTrends) {
            return res.status(200).json({
                success: true,
                data: cachedTrends,
                timestamp: new Date().toISOString()
            });
        }

        // دریافت ترندها (نکته: این ممکن است نیاز به تغییر داشته باشد)
        const results = await new Promise((resolve, reject) => {
            googleTrends.realTimeTrends({
                geo: 'IR',
                date: new Date()
            }, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        // پردازش نتایج
        const processedTrends = results.slice(0, 5).map(trend => ({
            title: trend.title,
            popularity: trend.title.length * 10,
            growthRate: trend.title.split(' ').length * 5
        }));

        // ذخیره در کش
        trendCache.set('trending_topics', processedTrends);

        res.status(200).json({
            success: true,
            data: processedTrends,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('خطا در دریافت ترندها:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}