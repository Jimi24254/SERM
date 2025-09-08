document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('trending-container');

    try {
        const response = await fetch('/api/trending');
        const result = await response.json();

        if (result.success) {
            const trendsList = result.data.map(trend => `
                <div class="trend-item">
                    <h3>${trend.title}</h3>
                    <p>محبوبیت: ${trend.popularity}</p>
                    <p>رشد: ${trend.growthRate}</p>
                    <button onclick="selectTrend('${trend.title}')">انتخاب</button>
                </div>
            `).join('');

            container.innerHTML = trendsList;
        }
    } catch (error) {
        container.innerHTML = 'خطا در دریافت ترندها';
    }
});

function selectTrend(topic) {
    // انتقال به موتور SERM برای تولید محتوا
    window.location.href = `/analyze?topic=${encodeURIComponent(topic)}`;
}