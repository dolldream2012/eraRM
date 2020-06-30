// const util = global.util;
const util = require('../lib/Util.js');	// test

const character_data = require('../data/character_data.js');
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
		var char = Object.assign(character_data["char_0"], character_data["char_" + char_no] || {});

		// 加入指定角色設定
		if (default_char = character_data["char_" + char_no]) {
			for (var key in default_char) char[key] = default_char[key];
		}

		for (var key in data) {	// 覆蓋角色資料
			if (key == "skill") {
				char[key] = this.chkSkill(char[key], data[key]);
			} else {
				char[key] = data[key];
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
		util.log("年齡 : " + this.tranCharData(char, "age"));
		util.log("種族 : " + this.tranCharData(char, "race"));
		util.log("性別 : " + this.tranCharData(char, "gender"));
	},

	// 顯示資料
	tranCharData: function (data, item) {
		var str = "";

		if (item == "gender") {	// 性別
			str = gender_list[data["gender"]];
		} else if (item == "race") {	// 種族
			var race = Math.floor(data["race"] / 10) * 10;	// 種族名
			var race_m = Math.floor(data["race_m"] / 10) * 10;	// 種族名(混血)

			if (race_m == 0) {	// 無混血
				str = race_data[race].name;
			} else {
				if (race == race_m) {	// 種族與混血種族相同
					str = race_data[race].name;
				} else if (race == human_race_id) {	// 種族為人類，顯示混血種族名
					if (race_data[race_m].name) str = "半" + race_data[race_m].name;
				} else {
					if (race_data[race_m].name) str = "半" + race_data[race].name;
				}
			}
		} else {
			str = data[item];
		}
		if (str == "" || typeof str == "undefined") {
			str = "不明";
		}

		return str;
	}
}

var data = {
	"skill": {
		1: 1,
	}
}

var char_id = module.exports.newChar(1, data);
module.exports.disCharData(char_id);