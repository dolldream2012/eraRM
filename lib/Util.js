const readline = require('readline');

const main_io = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

module.exports = {
	// 列印內容
	log: function (str) {
		process.stdout.write(str + "\n");
	},

	// 列印分隔線
	pl: function () {
		this.log("----------------------------------------------------------------------------------------------------");
	},

	// 取得指令
	getCode: function (exeCode) {
		main_io.question('', function (code) {
			process.stdout.moveCursor(0, -1);
			process.stdout.clearScreenDown();
			exeCode(code);
		});
	},

	// 檢查輸入資料
	chkCode: function (code) {
		var re = /^[\d]{0,3}$/;
		return re.test(code);
	},
}