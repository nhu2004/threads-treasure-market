const sql = require('mssql');

const config = { 
    server: 'NHI\\SQL1', 
    database: 'ThreadsTreasureDB',
    options: {
        encrypt: true,
        trustServerCertificate: true,
        // Thêm dòng này để dùng Windows Authentication
        trustedConnection: true 
    },
    port: 1433
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('✅ Đã kết nối thành công bằng Windows Auth!');
        return pool;
    })
    .catch(err => {
        console.error('❌ Kết nối thất bại: ', err);
    });

module.exports = { sql, poolPromise };