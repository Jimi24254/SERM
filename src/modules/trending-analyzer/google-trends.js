const googleTrends = require('google-trends-api');
const NodeCache = require('node-cache');

// کش با زمان انقضای 1 ساعت
const trendCache = new NodeCache({ stdTTL: 3600 });

class TrendingAnalyzer {
    constructor() {
        this.geo = 'IR';  // محدوده جغرافیایی ایران
    }

    async getTrendingTopics() {
        // چک کردن کش
        const cachedTrends = trendCache.get('trending_topics');
        if (cachedTrends) return cachedTrends;

        try {
            // دریافت ترندهای روز
            const results = await googleTrends.realTimeTrends({
                geo: this.geo,
                date: new Date()
            });

            // پردازش و محاسبه محبوبیت و رشد
            const processedTrends = this._processTrends(results);

            // ذخیره در کش
            trendCache.set('trending_topics', processedTrends);

            return processedTrends;
        } catch (error) {
            console.error('خطا در دریافت ترندها:', error);
            return [];
        }
    }

    _processTrends(results) {
        // محدود کردن به 5 مورد
        return results.slice(0, 5).map(trend => ({
            title: trend.title,
            // محاسبه محبوبیت بر اساس تعداد جستجو
            popularity: this._calculatePopularity(trend),
            // محاسبه رشد بر اساس تغییرات در بازه زمانی
            growthRate: this._calculateGrowthRate(trend)
        }));
    }

    _calculatePopularity(trend) {
        // مثال ساده: محاسبه محبوبیت بر اساس طول عنوان
        // در عمل، از API های دقیق‌تر استفاده می‌شود
        return trend.title.length * 10;
    }

    _calculateGrowthRate(trend) {
        // مثال: محاسبه رشد بر اساس پیچیدگی عنوان
        // در عمل، از الگوریتم‌های پیشرفته‌تر استفاده می‌شود
        const complexity = trend.title.split(' ').length;
        return complexity * 5;
    }
}

module.exports = new TrendingAnalyzer();