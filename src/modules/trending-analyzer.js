import googleTrends from 'google-trends-api';
import NodeCache from 'node-cache';

class TrendingAnalyzer {
    constructor() {
        this.cache = new NodeCache({ stdTTL: 3600 });
    }

    async getTrends() {
        const cachedTrends = this.cache.get('trending_topics');
        if (cachedTrends) return cachedTrends;

        try {
            const results = await this._fetchGoogleTrends();
            const processedTrends = this._processTrends(results);
            
            this.cache.set('trending_topics', processedTrends);
            return processedTrends;
        } catch (error) {
            console.error('خطا در دریافت ترندها:', error);
            return [];
        }
    }

    _fetchGoogleTrends() {
        return new Promise((resolve, reject) => {
            googleTrends.realTimeTrends({
                geo: 'IR',
                date: new Date()
            }, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    }

    _processTrends(results) {
        return results.slice(0, 5).map(trend => ({
            title: trend.title,
            popularity: trend.title.length * 10,
            growthRate: trend.title.split(' ').length * 5
        }));
    }
}

export default new TrendingAnalyzer();