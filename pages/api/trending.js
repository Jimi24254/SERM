import TrendingAnalyzer from '../../src/modules/trending-analyzer';

export default async function handler(req, res) {
    try {
        const trends = await TrendingAnalyzer.getTrends();
        res.status(200).json({
            success: true,
            data: trends
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}