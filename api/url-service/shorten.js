import pool from '../../utils/database';
import { encodeBase62 } from '../../utils/base62';  

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { original_url, custom_url } = req.body;

        try {
            let newUrlId;
            let shortUrl;

            const checkUrlQuery = 'SELECT id FROM original_urls WHERE original_url = $1';
            const result = await pool.query(checkUrlQuery, [original_url]);

            if (result.rows.length > 0) {
                newUrlId = result.rows[0].id;
            } else {
                const insertUrlQuery = 'INSERT INTO original_urls (original_url) VALUES ($1) RETURNING id';
                const insertResult = await pool.query(insertUrlQuery, [original_url]);
                newUrlId = insertResult.rows[0].id;
            }

            if (custom_url) {
                const checkCustomUrlQuery = 'SELECT * FROM short_urls WHERE short_url = $1';
                const customUrlResult = await pool.query(checkCustomUrlQuery, [custom_url]);

                if (customUrlResult.rows.length > 0) {
                    return res.status(400).json({ error: 'Custom URL already exists. Please choose another.' });
                }

                shortUrl = custom_url;
            } else {
                // Generate a short URL using base62 encoding if no custom URL is provided
                const lastShortUrlQuery = 'SELECT id FROM short_urls ORDER BY id DESC LIMIT 1';
                const lastShortUrlResult = await pool.query(lastShortUrlQuery);

                const newShortUrlId = lastShortUrlResult.rows.length > 0
                    ? lastShortUrlResult.rows[0].id + 1
                    : 1;

                shortUrl = encodeBase62(newShortUrlId);
            }

            // Insert the new short URL into the short_urls table
            const insertShortUrlQuery = 'INSERT INTO short_urls (original_url_id, short_url) VALUES ($1, $2) RETURNING id';
            const insertShortUrlResult = await pool.query(insertShortUrlQuery, [newUrlId, shortUrl]);

            // Insert a click history record with initial values for the new short URL
            const shortUrlId = insertShortUrlResult.rows[0].id;
            const insertClickHistoryQuery = 'INSERT INTO click_history (short_url_id, click_time) VALUES ($1, $2)';
            await pool.query(insertClickHistoryQuery, [shortUrlId, 0]);

            // Respond with the generated or custom short URL
            res.status(201).json({ short_url: shortUrl });

        } catch (error) {
            console.error('Error in shortening URL:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}