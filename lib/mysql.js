const mysql = require('mysql');

let db = null;
let host_data = {
	host: "185.224.138.154",
	user: "u308774430_rm",
	password: "Pa$$w0rd",
	database: "u308774430_game",
};
let record_index = 0;
let record = null;

module.exports = {
	record: null,

	getDB: function (host, user, password, database) {
		if (host != null) host_data["host"] = host;
		if (user != null) host_data["user"] = user;
		if (password != null) host_data["password"] = password;
		if (database != null) host_data["database"] = database;

		db = mysql.createConnection(host_data);
		db.connect(function (err) {
			if (err) {
				console.log("DB Connect Failed!");
			} else {
				let sql = "SET names 'utf8'";
				sql += ", character_set_results = 'utf8'";
				sql += ", character_set_client = 'utf8'";
				sql += ", character_set_connection = 'utf8'";
				sql += ", character_set_database = 'utf8'";
				sql += ", character_set_server = 'utf8'";
				module.exports.query(sql);

				console.log("DB Connected!");
			}
		});
	},

	query: function (sql, result) {
		if (sql != "") {
			let sql_list = sql.split(";");

			for (let sql of sql_list) {
				db.query(sql, function (err, result) {
					if (err) {
						console.log("Query Failed : " + sql);
					} else {
						if (result == null) {
							console.log("無效的 SQL 語法: " + sql);
						} else if (Array.isArray(result)) {
							record_index = 0;

							module.exports.record = JSON.parse(JSON.stringify(result));
							// module.exports.record = result;
						}
					}
				});
			}

			if (result != null) module.exports.next_record();
		}
	},

	next_record: function () {
		record_index++;
		return module.exports.record[record_index];
	},

	f: function (field) {
		return module.exports.record[record_index][field];
	}
}

let dbr = module.exports;
dbr.getDB();

let sql = "SELECT * FROM skill";
dbr.query(sql);
setTimeout(function () {
	console.log(dbr.record);
}, 1500);
// process.exit();