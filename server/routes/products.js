const express = require('express');
const router = express.Router();
const sql = require('mssql');

const sqlConfig = {
    user: 'sa', password: '123', database: 'ThreadsTreasureDB',
    server: 'NHI\\SQL1', 
    options: { encrypt: false, trustServerCertificate: true }
};

router.get('/', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request().query(`
           SELECT 
                p.ProductID, p.Name, p.Price, p.OriginalPrice, 
                p.ImageUrl, p.Description, p.Badge, p.Colors, p.Sizes, 
                c.Name AS CategoryName
            FROM Products p
            LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
        `);

        const formattedProducts = result.recordset.map(p => ({
            id: p.ProductID,
            name: p.Name,
            price: p.Price,
            originalPrice: p.OriginalPrice,
            image: p.ImageUrl,
            description: p.Description,
            badge: p.Badge,
            colors: p.Colors ? JSON.parse(p.Colors) : [],
            sizes: p.Sizes ? p.Sizes.split(',') : [],
            category: p.CategoryName
        }));

        res.json({ products: formattedProducts, totalPage: 1 });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi kết nối database' });
    }
});

module.exports = router;