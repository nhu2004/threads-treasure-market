const sql = require('mssql');

const config = {
    user: 'sa', // Tài khoản vừa bật
    password: '123', // Mật khẩu vừa đặt
    server: 'NHI\\SQL1', 
    database: 'ThreadsTreasureDB',
    options: {
        encrypt: true,
        trustServerCertificate: true // Cho phép kết nối local
    },
    port: 1433
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Đã kết nối thành công tới SQL Server!');
        return pool;
    })
    .catch(err => {
        console.error('Kết nối thất bại: ', err);
    });

module.exports = { sql, poolPromise };