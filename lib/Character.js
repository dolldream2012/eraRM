// const util = global.util;
const util = require('../lib/Util.js');	// test

const char_data = require('../data/character_data.js');
const char_name = require('../data/character_name.js');
const skill_data = require('../data/skill_data.js');
const race_data = require('../data/race_data.js');

var char_list = new Array();	// 角色列表

module.exports = {
	// 取得角色列表
	getCharList: function () {
		console.table(char_list);
	},

	// 製作新角色
	newChar: function (char_no, data) {
		var char = char_data.getData(char_no);

		for (var key in data) {	// 覆蓋角色資料
			if (key == "skill") {	// 技能向上整合
				char["skill"] = this.chkSkill(char["skill"], data["skill"]);
			} else {
				char[key] = data[key];
			}
		}

		// 補充、修正角色資料
		if (true) {
			// 種族
			char.race = char.race.filter(function (race_id) {	// 移除不存在之種族
				if (race_data.contains(race_id)) return race_id;
			});
			if (char.race.length == 0) {	// 無種族時預設為預設角色之預色種族
				char.race = char_data.getData(0).race;
			}
			// 移除無繁衍能力之種族的混血種族
			if (race_data.getData(char.race[0], "gender")[1] == 100) {
				char.race.length = 1;
			} else {
				char.race = char.race.filter(function (race_id) {
					if (race_data.getData(race_id, "gender")[1] != 100) return race_id;
				});
			}

			// 取得種族權重
			var rate = this.getRaceRate(char);

			// 決定角色性別
			if (char.gender == "" || race_data[char.race[0]][char.gender] == 0) {	// 未指定性別 / 該種族無指定指性別
				if (char.race.length > 1) {
					char.gender = util.getRandomValue(race_data.getData(char.race[0], "gender"), race_data.getData(char.race[1], "gender"), rate);
				} else {
					char.gender = util.getRandomValue(race_data.getData(char.race[0], "gender"));
				}
			}

			// 決定角色名字
			if (char.name == "") {	// 角色名字以填寫的主要種族為優先
				char.name = util.getRandomData(char_name.getData(char.gender, ...char.race));
			}
		}

		if (true) {	// 未完成
			// 隨機生成技能
			if (char.random_skill) {
				console.log("隨機生成技能");
			}

			// 決定角色外表年齡
			if (char.age == "") {

			}

			// 決定角色真實年齡
			if (char.age_t == "") {
				char.age_t = char.age;
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
						skill_list[key] = Math.max(skill_list[key]["level"], data[key]["level"]);	// 相同技能取等級較高者
					} else {
						skill_list[key] = data[key];
					}
				}
			}
		}

		// 移除下位技能
		for (var skill_no in skill_list) {
			for (var skill_id of skill_data.getData(skill_no, "up_list")) {	// 遍歷技能的上位技能
				if (skill_list[skill_id]) delete skill_list[skill_no];	// 如果已擁有上位技能，移除上位技能
			}
		}

		return skill_list;
	},

	// 取得種族權重(只計算主要種族及混血種族1)
	getRaceRate: function (data) {
		var rate = data.race_r;
		if (rate == 0 || rate == 100) return rate;

		if (data.race.length < 2) return 100;
		var race_r = race_data.getData(data.race[0], "rate");	// 主要種族權重
		var race_mr = race_data.getData(data.race[1], "rate");	// 混血種族權重

		if (race_mr == 0) return race_r;
		if (race_r == 0) return race_mr;

		var r = race_r * rate / 100;	// 主要種族加權
		var mr = race_mr * (1 - rate / 100);	// 混血種族加權

		return Math.round(r / (r + mr) * 100);
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
			var gender_list = ["扶他", "無", "女性", "男性"];

			str = gender_list[data["gender"]];
		} else if (item == "age" && showHidden) {	// 年齡
			str = data.age;
			if (data.age_t != "" && data.age != data.age_t) str += " (真實年齡 : " + data.age_t + ")";
		} else if (item == "race") {	// 種族
			var race = data.race[0];	// 主要種族
			var race_m = data.race[1];	// 混血種族1

			if (race_m == null) {	// 無混血
				str = race_data.getData(race, "name");
			} else {
				var rate = this.getRaceRate(data);	// 主要種族權重

				if (rate > 80) {	// 主要種族權重壓過混血種族
					str = race_data.getData(race, "name");
				} else {
					var race_sub = (rate >= 40) ? race : race_m;

					if (race_data.getData(race_sub, "rate") >= 70) {
						str += "半";
						var tmp_race = Math.floor(race / 10) * 10;	// 顯示混血特徵時僅顯示種族，不顯示亞種
						str += race_data.getData((race_data.contains(tmp_race)) ? tmp_race : race_sub, "name");
					} else {	// 權重較低(特徵不明顯的種族)不會被視為混血
						str = race_data.getData(race_sub, "name");
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
}

var data = {
	"race": [9998, 9999],
	// "race": [9997],
	"race_r": 80,
	"skill": {
		6: 1,
	}
}

var char_id = module.exports.newChar(0, data);
// var char_id = module.exports.newChar(1);
console.log();
module.exports.disCharData(char_id);