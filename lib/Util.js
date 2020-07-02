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
		let re = /^[\d]{0,3}$/;
		return re.test(code);
	},

	// 運算字串
	opeStr: function (str) {
		return new Function('return ' + str)();
	},

	// 取得隨機值
	getRandomData: function () {
		let r1 = Math.floor(Math.random() * arguments.length);
		let r2 = Math.floor(Math.random() * arguments[r1].length);
		return arguments[r1][r2];
	},

	// 取得加權隨機值
	getRandomValue: function (list_1, list_2, rate) {
		let tmp_list = new Array();
		rate = rate || 100;

		if (list_2 == null) {
			tmp_list = list_1;
		} else if (list_1.length != list_2.length) {
			console.error("Error : 陣列長度不符", list_1, list_2);
			tmp_list = list_1;
		} else {
			for (let i = 0; i < list_1.length; i++) {
				tmp_list[i] = list_1[i] * rate + list_2[i] * (100 - rate);
			}
		}

		let total = tmp_list.reduce(function (a, b) { return a + b; });
		let rand = Math.random() * total;

		let range = 0;
		for (let i = 0; i < tmp_list.length; i++) {
			range += tmp_list[i];

			if (rand < range) {
				return i;
			}
		}
	},
}