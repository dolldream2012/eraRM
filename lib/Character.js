// const util = global.util;
const util = require('../lib/Util.js');	// test

const char_data = require('../data/character_data.js');
const char_name = require('../data/character_name.js');
const skill_data = require('../data/skill_data.js');
const race_data = require('../data/race_data.js');

let char_list = new Array();	// 角色列表

module.exports = {
	// 取得角色列表
	getCharList: function () {
		console.table(char_list);
	},

	// 製作新角色
	newChar: function (char_no, data) {
		let char = char_data.getData(char_no);

		for (let key in data) {	// 覆蓋角色資料
			if (key == "skill") {	// 技能
				// 技能整合
				char.skill = char.skill.concat(data.skill);
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
			if (char.race.length == 0) {	// 無種族時從隨機種族列表中挑選
				let base_race_list = race_data.getBaseData();
				let race_1 = util.getRandomListValue(base_race_list);
				char.race.push(race_1);

				if (Math.random() * 10 < 1) {
					let race_2 = util.getRandomListValue(base_race_list);
					if (race_1 != race_2) char.race.push(race_2);
				}
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
			let rate = this.getRaceRate(char);

			// 決定角色性別
			if (char.gender === "" || race_data.getData(char.race[0])["gender"][char.gender] == 0) {	// 未指定性別 / 該種族無指定指性別
				if (char.race.length > 1) {
					char.gender = util.getRandomWeightedValue(race_data.getData(char.race[0], "gender"), race_data.getData(char.race[1], "gender"), rate);
				} else {
					char.gender = util.getRandomWeightedValue(race_data.getData(char.race[0], "gender"));
				}
			}

			// 決定角色名字
			if (char.name == "") {	// 角色名字以填寫的主要種族為優先
				char.name = util.getRandomData(char_name.getData(char.gender, ...char.race));
			}

			// 隨機生成技能
			if (char.random_skill) {
				let base_skill_list = skill_data.getBaseData();

				for (let skill_group of base_skill_list) {
					if (skill_data.chkEnableSkill(char, null, skill_group.flag)) {	// 符合起始技能獲取條件
						let skill_no = util.getRandomListValue(skill_group.skill_rate);

						if (skill_no != "") {
							if (skill_data.chkEnableSkill(char, skill_no)) char.skill.push(skill_no);	// 符合技能獲取條件
						}
					}
				}

				let base_race_skill_list = race_data.getData(char.race[0], "skill");
				for (let skill_group of base_race_skill_list) {
					if (group_f = skill_group["group_f"]) {	// 判斷種族技能前，是否先移除指定群組技能
						for (let key in char.skill) {
							let tmp_skill_id = char.skill[key];

							if (skill_data.getData(tmp_skill_id, "group_f").split("|").includes(group_f)) {
								char.skill.splice(key, 1);
							}
						}
					}

					if (skill_data.chkEnableSkill(char, null, skill_group.flag)) {	// 符合起始技能獲取條件
						let skill_no = util.getRandomListValue(skill_group.skill_rate);

						if (skill_no != "") {
							if (skill_data.chkEnableSkill(char, skill_no)) char.skill.push(skill_no);	// 符合技能獲取條件
						}
					}
				}
			}

			// 技能初始化
			let skill_list = char.skill;
			char.skill = new Object();
			for (let skill_no of skill_list) char.skill[skill_no] = skill_data.initSkill(skill_no);

			// 技能升級、消除衝突技能
			skill_data.upgSkill(char);
		}

		if (true) {	// 未完成
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

	// 取得種族權重(只計算主要種族及混血種族1)
	getRaceRate: function (data) {
		let rate = data.race_r;
		if (rate == 0 || rate == 100) return rate;

		if (data.race.length < 2) return 100;
		let race_r = race_data.getData(data.race[0], "rate");	// 主要種族權重
		let race_mr = race_data.getData(data.race[1], "rate");	// 混血種族權重

		if (race_mr == 0) return race_r;
		if (race_r == 0) return race_mr;

		let r = race_r * rate / 100;	// 主要種族加權
		let mr = race_mr * (1 - rate / 100);	// 混血種族加權

		return Math.round(r / (r + mr) * 100);
	},

	// 顯示角色資料
	disCharData: function (id) {
		let char = char_list[id];

		util.log("姓名 : " + this.tranCharData(char, "name"));
		util.log("年齡 : " + this.tranCharData(char, "age", true));
		util.log("種族 : " + this.tranCharData(char, "race"));
		util.log("性別 : " + this.tranCharData(char, "gender"));
		util.log("特徵 : " + this.tranCharData(char, "feature"));
		util.log("個性 : " + this.tranCharData(char, "personality"));
		util.log("經歷 : " + this.tranCharData(char, "experience"));
		util.log("能力 : " + this.tranCharData(char, "talent"));
		util.log("技能 : " + this.tranCharData(char, "skill"));
	},

	// 顯示資料: 資料, 項目, 顯示隱藏資料
	tranCharData: function (char, item, showHidden) {
		let str = "";

		if (item == "gender") {	// 性別
			let gender_list = ["扶他", "無", "女性", "男性"];

			str = gender_list[char.gender];
		} else if (item == "age" && showHidden) {	// 年齡
			str = char.age;
			if (char.age_t != "" && char.age != char.age_t) str += " (真實年齡 : " + char.age_t + ")";
		} else if (item == "race") {	// 種族
			let race = char.race[0];	// 主要種族
			let race_m = char.race[1];	// 混血種族1

			if (race_m == null) {	// 無混血
				str = race_data.getData(race, "name");
			} else {
				let rate = this.getRaceRate(char);	// 主要種族權重

				if (rate > 80) {	// 主要種族權重壓過混血種族
					str = race_data.getData(race, "name");
				} else {
					let race_sub = (rate >= 40) ? race : race_m;

					if (race_data.getData(race_sub, "rate") >= 70) {
						str += "半";
						let tmp_race = Math.floor(race / 10) * 10;	// 顯示混血特徵時僅顯示種族，不顯示亞種
						str += race_data.getData((race_data.contains(tmp_race)) ? tmp_race : race_sub, "name");
					} else {	// 權重較低(特徵不明顯的種族)不會被視為混血
						str = race_data.getData(race_sub, "name");
					}
				}
			}
		} else if (item == "feature" || item == "personality" || item == "experience" || item == "talent" || item == "skill") {	// 特徵, 個性, 經歷, 能力, 技能
			let type_list = { "feature": [0], "personality": [9], "experience": [8], "talent": [1], "skill": [2, 3] };
			let skill_list = skill_data.getListByTypeFromList(char.skill, ...type_list[item]);

			if (skill_list.length > 0) {
				for (let skill_no of skill_list) {

					str += "[";
					str += skill_data.getData(skill_no, "name");
					if (item == "talent" || item == "skill") {
						let max_lv = skill_data.getData(skill_no, "max_lv");
						if (max_lv != 1) str += "Lv" + ((char.skill[skill_no].lv == max_lv) ? "Max" : char.skill[skill_no].lv);
					}
					str += "]";
				}
			} else {
				str = "無";
			}
		} else {
			str = char[item];
		}

		if (str == "" || typeof str == "undefined") {
			str = "不明";
		}

		return str;
	},
}

// test
let data = {
}

let char_id = module.exports.newChar(0, data);
// let char_id = module.exports.newChar(1);
console.log();
// console.log(char_list[char_id]);
module.exports.disCharData(char_id);
process.exit();