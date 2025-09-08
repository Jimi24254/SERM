const trendingAnalyzer = require('../modules/trending-analyzer/google-trends');

module.exports = async (req, res) => {
    try {
        const trends = await trendingAnalyzer.getTrendingTopics();
        
        res.status(200).json({
            success: true,
            data: trends,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};