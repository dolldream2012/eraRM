// const util = global.util;
const util = require('../lib/Util.js');	// test

const char_data = require('../data/character_data.js');
const char_name = require('../data/character_name.js');
const skill_data = require('../data/skill_data.js');
const race_data = require('../data/race_data.js');

var char_list = new Array();	// 角色列表

var gender_list = ["扶他", "無", "女性", "男性"];
var human_race_id = 5990;	// 人類種族編號(用於判斷混血)

module.exports = {
	// 取得角色列表
	getCharList: function () {
		console.table(char_list);
	},

	// 製作新角色
	newChar: function (char_no, data) {
		// 建立角色
		var char = char_data[char_no] || char_data[0];

		for (var key in data) {	// 覆蓋角色資料
			if (key == "skill") {	// 技能向上整合
				char[key] = this.chkSkill(char[key], data[key]);
			} else {
				char[key] = data[key];
			}
		}

		// 補充、修正角色資料
		if (true) {
			// 種族
			// 移除無繁衍能力之種族的混血種族
			if (race_data[char.race]["gender"][1] == 100 || race_data[char.race_m]["gender"][1] == 100) {
				char.race_m = 0;
			}

			// 取得種族權重
			var rate = this.getRaceRate(char);

			// 決定角色性別
			if (char.gender == "" || race_data[char.race][char.gender] == 0) {	// 未指定性別 / 該種族無指定指性別
				var gender_list = race_data[char.race]["gender"];
				var gender_list_m = race_data[char.race_m]["gender"];
				var tmp_gender_list = new Array();

				var tmp_gender_list = new Array();
				for (var i = 0; i < gender_list.length; i++) {
					tmp_gender_list[i] = gender_list[i] * rate + gender_list_m[i] * (100 - rate);
				}

				var total = tmp_gender_list.reduce(function (a, b) { return a + b; });
				var rand = Math.random() * total;

				var range = 0;
				for (var i = 0; i < tmp_gender_list.length; i++) {
					range += tmp_gender_list[i];

					if (rand < range) {
						char.gender = i;
						break;
					}
				}
			}

			// 決定角色名字
			if (char.name == "") {
				if (race_gender_name = char_name["race_" + char.race + "_" + char.gender] || char_name["race_" + char.race_m + "_" + char.gender]) {	// 存在種族的指定性別名字列表
					char.name = this.getRandomData(race_gender_name);
				} else if (race_name = char_name["race_" + char.race] || char_name["race_" + char.race_m]) {	// 存在種族的指定名字列表
					char.name = this.getRandomData(race_name);
				} else if (gender_name = char_name["gender_" + char.gender]) {	// 存在指定性別名字列表
					char.name = this.getRandomData(gender_name);
				} else {
					char.name = this.getRandomData(char_name["gender_2"], char_name["gender_3"]);
				}
			}
		}

		return char_list.push(char) - 1;
	},

	// 合併技能
	chkSkill: function () {
		var skill_list = null;

		// 合併技能資料
		for (var data of arguments) {
			if (skill_list == null) {
				var skill_list = data;
			} else {
				for (var key in data) {
					if (skill_list[key]) {
						skill_list[key] = Math.max(skill_list[key], data[key]);	// 相同技能取等級較高者
					} else {
						skill_list[key] = data[key];
					}
				}
			}
		}

		// 移除下位技能
		// for (var key in skill_list) {
		// 	for (var skill_id of skill_data[key]["up_list"]) {
		// 		if (skill_list[skill_id]) delete skill_list[key];
		// 	}
		// }

		return skill_list;
	},

	// 顯示角色資料
	disCharData: function (id) {
		var char = char_list[id];

		util.log("姓名 : " + this.tranCharData(char, "name"));
		util.log("年齡 : " + this.tranCharData(char, "age", true));
		util.log("種族 : " + this.tranCharData(char, "race"));
		util.log("性別 : " + this.tranCharData(char, "gender"));
	},

	// 顯示資料: 資料, 項目, 顯示隱藏資料
	tranCharData: function (data, item, showHidden) {
		var str = "";

		if (item == "gender") {	// 性別
			str = gender_list[data["gender"]];
		} else if (item == "age" && showHidden) {	// 年齡
			str = data["age"];
			if (data["age_t"] != "" && data["age"] != data["age_t"]) str += " (真實年齡 : " + data["age_t"] + ")";
		} else if (item == "race") {	// 種族
			var race = data["race"];	// 主要種族
			var race_m = data["race_m"];	// 混血種族

			if (data["race_m"] == 0) {	// 無混血
				str = race_data[data["race"]].name;
			} else {
				if (race == race_m) {	// 主要種族與混血種族相同
					str = race_data[race].name;
				} else {
					var rate = this.getRaceRate(data);	// 主要種族權重

					if (rate > 80) {	// 主要種族權重壓過混血種族
						str = race_data[race].name;
					} else if (rate >= 40) {
						if (race_data[race]["rate"] >= 70) str += "半";	// 權重較低(特徵不明顯的種族)不會被視為混血
						str += race_data[race].name;
					} else {
						if (race_data[race_m]["rate"] >= 70) str += "半";	// 權重較低(特徵不明顯的種族)不會被視為混血
						str += race_data[race_m].name;
					}
				}
			}
		} else {
			str = data[item];
		}

		if (str == "" || typeof str == "undefined") {
			str = "不明";
		}

		return str;
	},

	// 取得種族權重
	getRaceRate: function (data) {
		var race = data["race"];
		var race_m = data["race_m"];
		var rate = data["race_r"];
		var race_r = race_data[race]["rate"];	// 主要種族權重
		var race_mr = race_data[race_m]["rate"];	// 混血種族權重

		if (rate == 0 || rate == 100) return rate;
		if (race_mr == 0) return race_r;
		if (race_r == 0) return race_mr;

		var r = race_r * rate / 100;	// 主要種族加權
		var mr = race_mr * (1 - rate / 100);	// 混血種族加權

		return Math.round(r / (r + mr) * 100);
	},

	// 取得隨機值
	getRandomData: function () {
		var r1 = Math.floor(Math.random() * arguments.length);
		var r2 = Math.floor(Math.random() * arguments[r1].length);
		return arguments[r1][r2];
	}
}

var data = {
	"race": 998,
	"race_m": 999,
	"race_r": 80,
	"skill": {
		1: 1,
	}
}

var char_id = module.exports.newChar(0, data);
console.log();
module.exports.disCharData(char_id);