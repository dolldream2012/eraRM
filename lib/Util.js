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

	// 取得加權隨機值: [25, 25, 25, 25], [25, 25, 25, 25], 80
	getRandomWeightedValue: function (list_1, list_2, rate) {
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

		let total = tmp_list.reduce(function (a, b) { return a * 1 + b * 1; });
		let rand = Math.random() * total;

		let range = 0;
		for (let i = 0; i < tmp_list.length; i++) {
			range += tmp_list[i] * 1;

			if (rand < range) return i;
		}
	},

	// 取得機率列表中的隨機值: {20: [0, 1, 2], 30: [0, 1, 2]}, 80
	getRandomListValue: function (rate_value_list, rate) {
		let value = "";

		// 調整列表機率
		if (rate == null || rate == 100) {
			let rate_list = Object.keys(rate_value_list);
			let rate_index = rate_list[this.getRandomWeightedValue(rate_list)];
			let value_list = rate_value_list[rate_index];
			if (value_list.length != 0) value = value_list[Math.floor(Math.random() * value_list.length)];
		} else {
			let tmp_index = null;	// 空值列表索引
			let tmp_old_total = 0;	// 原列表機率總和
			let tmp_new_total = 0;	// 新列表機率總和(扣除空值列表)

			let rate_list = Object.keys(rate_value_list);
			let tmp_rate_list = new Array();
			for (var index in rate_list) {
				let tmp_rate = rate_list[index];
				let tmp = tmp_rate * rate / 100;

				if (rate_value_list[rate_list[index]].length == 0) tmp_index = index;
				if (rate_value_list[rate_list[index]].length != 0) tmp_new_total += tmp;
				tmp_old_total += tmp_rate * 1;
				tmp_rate_list[index] = tmp;
			}

			tmp_rate_list[tmp_index] = Math.max(tmp_old_total - tmp_new_total, 0);

			let tmp_rate_index = rate_list[this.getRandomWeightedValue(tmp_rate_list)];
			let value_list = rate_value_list[tmp_rate_index];
			if (value_list.length != 0) value = value_list[Math.floor(Math.random() * value_list.length)];
		}


		return value;
	},

	// 取得符合鍵值
	getKeyFromList: function (list, key, sort) {
		if (list[key]) {
			return list[key];
		} else {
			let sorted_list;
			if (sort == "ceil") sorted_list = Object.keys(list).sort(function (a, b) { return a * 1 - b * 1; });
			else sorted_list = Object.keys(list).sort(function (a, b) { return b * 1 - a * 1; });	// 若未指定 sort 則取符合之較低數值

			for (let tmp_key of sorted_list) {
				if (key > tmp_key) return list[tmp_key];
			}
		}
	},

	// 依平均值和標準差取得隨機資料
	getDataBySD: function (avg, sd) {
		let true_data_list = new Object();
		true_data_list[25.1] = [avg + sd * 0.32, avg - sd * 0.32];	// 機率應是 25%，但使用 Object 時 key 值無法重覆
		true_data_list[25] = [avg + sd * 0.67, avg - sd * 0.67];
		true_data_list[18] = [avg + sd * 0.99, avg - sd * 0.99];
		true_data_list[12] = [avg + sd * 1.28, avg - sd * 1.28];
		true_data_list[10] = [avg + sd * 1.64, avg - sd * 1.64];
		true_data_list[5] = [avg + sd * 1.96, avg - sd * 1.96];
		true_data_list[4] = [avg + sd * 2.58, avg - sd * 2.58];
		true_data_list[0.9] = [avg + sd * 3.29, avg - sd * 3.29];

		let random_value = this.getRandomListValue(true_data_list);
		random_value = Math.round(random_value * 10) / 10;

		return random_value;
	},
}