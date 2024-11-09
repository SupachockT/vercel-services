import pool from "../../utils/database";

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const query = `
                SELECT ou.original_url, su.short_url, ch.click_time, ch.last_clicked_time
                FROM original_urls ou
                LEFT JOIN short_urls su ON ou.id = su.original_url_id
                LEFT JOIN click_history ch ON su.id = ch.short_url_id
                ORDER BY ou.original_url, su.short_url;
            `;
            const result = await pool.query(query);

            const historyData = result.rows.reduce((acc, row) => {
                if (!acc[row.original_url]) {
                    acc[row.original_url] = {
                        short_urls: {},
                    };
                }

                acc[row.original_url].short_urls[row.short_url] = {
                    click_time: row.click_time,
                    last_clicked_time: row.last_clicked_time,
                };

                return acc;
            }, {});

            const formattedHistory = Object.entries(historyData).map(([original_url, data]) => ({
                original_url,
                short_urls: Object.entries(data.short_urls).map(([short_url, shortData]) => ({
                    short_url,
                    click_time: shortData.click_time,
                    last_clicked_time: shortData.last_clicked_time,
                })),
            }));

            res.status(200).json({ history: formattedHistory });
        } catch (error) {
            console.error('Error fetching all URL history:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
