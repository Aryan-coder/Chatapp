const {Pool,Client} = require('pg')

module.exports.db_connect = function db_connect(u,h,db,pass,p){
    const pool = new Pool({
        user: u,
        host: h,
        database: db,
        password: pass,
        port: p,
      })
      return(pool)
}

//'SELECT * FROM user_data'
/*
    user: 'postgres',
        host: 'localhost',
        database: 'myuser',
        password: 'imgreat',
        port: 5432,
*/

model.exports.get = function(pool,id,){
    pool.connect()
    pool.query("SELECT "+need+", "++" FROM user_data WHERE id = "+id+"", (err, data)=>{
        pool.end()
        return(data.rows)
    })
}
