const char_data = global.char_data = require('../data/character_data.js');
const race_data = global.race_data = require('./util_race.js');
const skill_data_obj = require('../data/data_skill.js');

let type_list = { 0: "特徵", 1: "被動", 2: "攻擊", 3: "輔助", 8: "經歷", 9: "個性" };	// 類型
let tmp_type_list = {};	// 子類型
let action_list = { "char": "角色屬性" };	// 效果判定時機
let status_list = { "skill": "技能", "gender": "性別", "height": "身高", "weight": "體重", "age_inside": "年齡(內在)", "age_outside": "年齡(外在)", "age_exp": "年齡(經歷)", "age": "外表年齡", "age_t": "實際年齡", "race": "種族", "hp": "HP", "sp": "SP", "mp": "MP" }
let gender_list = ["扶他", "無性別", "女性", "男性"];	// 性別
let skill_data = skill_data_obj.skill_data;
let base_skill_data = skill_data_obj.base_skill_data;

module.exports = {
	// 技能資料初始化
	init: function () {
		let dbr = require('./mysql.js');
		dbr.getDB();

		dbr.record = null;
		dbr.query("SELECT * FROM skill");

		setTimeout(function () {
			if (dbr.record == null) {
				setTimeout(() => { arguments.callee(); }, 500);
			} else {
				skill_data = dbr.record;
			}
		}, 500);
	},

	// 回傳技能資料
	getData: function (skill_no, item) {
		if (item == null) {
			return JSON.parse(JSON.stringify(skill_data[skill_no]));
		} else {
			return skill_data[skill_no][item];
		}
	},

	// 確認是否為有效的技能編號
	contains: function (skill_no) {
		return (skill_data[skill_no]);
	},

	// 取得起始技能列表
	getBaseData: function () {
		return base_skill_data;
	},

	// 取得指定效果類型技能列表
	getDataByEffect: function (skill_list, type) {
		let obj = new Object();

		skill_list = skill_list || skill_data;
		for (let skill_no in skill_list) {
			if (tmp_skill_data = skill_data[skill_no]) {
				if (tmp_skill_data["effect"][type]) obj[skill_no] = tmp_skill_data["effect"][type];
			}
		}

		return obj;
	},

	// 取得列表中指定類型技能
	getListByTypeFromList: function (skill_list, ...type) {
		let arr = new Array();

		for (let skill_no in skill_list) {
			if (skill_data[skill_no] && type.includes(skill_data[skill_no]["type"])) arr.push(skill_no);
		}

		return arr;
	},

	// 技能初始化
	initSkill: function (skill_no) {
		let obj = new Object();
		obj["lv"] = 1;
		obj["exp"] = 0;

		return obj;
	},

	// 技能升級
	upgSkill: function (char) {
		// 移除角色無法獲得技能
		for (let skill_id in char.skill) {
			let flag_list = new Object();
			for (let key in skill_data[skill_id]["flag"]) {
				if (key != "skill") flag_list[key] = skill_data[skill_id]["flag"][key];
			}

			if (char_data.chkCharFlag(char, flag_list) == false) {
				delete char.skill[skill_id];
				console.log("由於角色條件不符，移除 [" + skill_data[skill_id]["name"] + "]");
			}
		}

		for (let skill_id in char.skill) {	// 移除衝突技能
			for (let skill_no of skill_data[skill_id]["skill_f"]) {	// 遍歷技能的衝突技能
				if (char.skill[skill_no]) {	// 存在衝突技能
					// 抵消未升級之衝突技能
					if (char.skill[skill_id]["lv"] == 1 && char.skill[skill_id]["exp"] == 0) {
						delete char.skill[skill_id];
						console.log("由於存在衝突屬性，移除 [" + skill_data[skill_id]["name"] + "]");
					}
					if (char.skill[skill_no]["lv"] == 1 && char.skill[skill_no]["exp"] == 0) {
						delete char.skill[skill_no];
						console.log("由於存在衝突屬性，移除 [" + skill_data[skill_no]["name"] + "]");
					}
				}
			}
		}

		// 技能升級
		do {
			var isUpgrade = false;	// 技能是否升級

			for (let skill_id in char.skill) {
				for (let skill_no of skill_data[skill_id]["up_list"]) {	// 遍歷技能的上位技能
					if (char.skill[skill_no]) continue;	// 已存在上位技能則略過
					// console.log("檢查 [" + skill_data[skill_id]["name"] + "] 是否存在上位技能 [" + skill_data[skill_no]["name"] + "]");

					if (this.chkEnableSkill(char, skill_no)) {	// 滿足獲得上位技能條件
						char.skill[skill_no] = this.initSkill(skill_no);
						console.log("[" + skill_data[skill_id]["name"] + "] 升級為 [" + skill_data[skill_no]["name"] + "]");

						isUpgrade = true;
					}
				}
			}

			// 移除下位技能
			for (let skill_id in char.skill) {
				for (let skill_no of skill_data[skill_id]["up_list"]) {	// 遍歷技能的上位技能
					if (char.skill[skill_no]) {
						delete char.skill[skill_id];	// 如果已擁有上位技能，移除上位技能
					}
				}
			}
		} while (isUpgrade);	// 如果技能升級，重新遍歷技能至無法升級為止
	},

	// 檢查可否獲得技能／是否滿足技能升級條件: 角色資料, 技能編號, 技能獲取條件
	chkEnableSkill: function (char, skill_no, flag_list) {
		if (skill_no && skill_data[skill_no] == null) return false;	// 不存在的技能編號
		let isArr = Array.isArray(char.skill);	// 技能尚未初始化

		// 檢查是否存在互斥技能
		if (skill_no && Object.keys(char.skill).length > 0) {
			if (char_data.chkCharHasStatus(char, "skill", skill_no) == false) {	// 檢查角色是否已擁有技能
				// 檢查是否存在互斥技能群組(已擁有同類型屬性)
				let group_list_1 = skill_data[skill_no]["group_f"].split("|");
				for (let key in char.skill) {
					let tmp_skill_id = (isArr) ? char.skill[key] : key;
					let group_list_2 = skill_data[tmp_skill_id]["group_f"].split("|");

					if (group_list_1.some(group => group_list_2.includes(group))) {	// 存在相同技能群組
						if (skill_data[tmp_skill_id]["up_list"].includes(skill_no) == false) {	// 檢查技能並非已擁有技能的上位技能
							// console.log("角色 [" + char.name + "] 已擁有 [" + skill_data[tmp_skill_id]["name"] + "]，無法獲得 [" + skill_data[skill_no]["name"] + "]");
							return false;
						}
					}
				}

				// 檢查是否存在互斥技能
				let skill_f = skill_data[skill_no]["skill_f"];
				for (let tmp_skill_id of skill_f) {
					if (char_data.chkCharHasStatus(char, "skill", tmp_skill_id)) {
						// console.log("角色 [" + char.name + "] 已擁有 [" + skill_data[tmp_skill_id]["name"] + "]，無法獲得 [" + skill_data[skill_no]["name"] + "]");
						return false;
					}
				}
			}
		}

		// 檢查技能獲取條件
		flag_list = flag_list || (skill_no && skill_data[skill_no]["flag"]);	// 帶入條件參數(物件) || 讀取技能設定
		if (flag_list) {
			return char_data.chkCharFlag(char, flag_list);
		} else {
			return true;
		}
	},

	// 處理技能效果(依據技能調整屬性): 角色, 生效技能, 屬性值, 判斷項目
	// 效果1:屬性1-1^^條件1-1&&屬性1-2^^條件1-2;效果2:屬性2^^條件2(條件規則同 flag)
	setStatusByTalent: function (char, active_skill_list, value, item) {
		for (let skill_id in active_skill_list) {
			let effect = active_skill_list[skill_id];

			if (adjust_str = effect[item]) {
				let adjust_list = adjust_str.split(";");
				for (let adjust_flag_str of adjust_list) {
					let tmp = adjust_flag_str.split(":");
					let adjust = tmp[0];

					if (tmp.length == 1) {
						let tmp_value = value;
						value = util.opeStr(value + adjust);
						console.log("依據 [" + this.getData(skill_id, "name") + "] 的效果，" + item + " 由 " + tmp_value + " 變為 " + value);
						break;
					} else {
						let flag_str = tmp[1];
						let flag_arr = flag_str.split("&&");

						let flag_list = Object();
						for (let tmp_flag_str of flag_arr) {
							let flag_data = tmp_flag_str.split("^^");
							flag_list[flag_data[0]] = flag_data[1];
						}

						if (char_data.chkCharFlag(char, flag_list)) {
							let tmp_value = value;
							value = util.opeStr(value + adjust);
							console.log("依據 [" + this.getData(skill_id, "name") + "] 的效果，" + item + " 由 " + tmp_value + " 變為 " + value);
							break;
						}
					}
				}
			}
		}

		return value;
	},

	// 陳述技能
	disSkillData: function (...skill_list) {
		let tmp_skill_data = new Object();
		if (skill_list.length == 0) {
			tmp_skill_data = skill_data;
		} else {
			for (let skill_no of skill_list) tmp_skill_data[skill_no] = skill_data[skill_no];
		}
		tmp_skill_data = JSON.parse(JSON.stringify(tmp_skill_data));

		// 陳述項目
		dis_list = {
			"group_f": false,
			"up_list": false,
			"skill_f": false,
			"flag": false,
			"cost": false,
			"effect": false,
			"exp": false,
		};

		for (let skill_no in tmp_skill_data) {
			let data = tmp_skill_data[skill_no];

			let str = "";

			// 類型
			str += " " + type_list[data["type"]];
			delete data["type"];

			// 子類型
			if (data["type_sub"].length > 0) {
				let tmp_str = "";
				for (let type_sub of data["type_sub"]) {
					if (tmp_str != "") tmp_str += ", ";
					tmp_str += tmp_type_list[type_sub];
				}

				str += "(" + tmp_str + ")";
			}
			delete data["type_sub"];

			// 技能名稱
			str += " " + data["name"];
			delete data["name"];

			// 等級上限
			if (data["max_lv"] != 1) {
				str += " MaxLv" + data["max_lv"];
			}
			delete data["max_lv"];

			// 技能開關
			if (data["enable"] == "F") {
				str += "(禁止開關)";
			}
			delete data["enable"];

			// 互斥技能群組
			if (dis_list["group_f"] && data["group_f"] != "") {
				str += ", 群組 : " + data["group_f"].replace("|", ", ");
			}
			delete data["group_f"];

			// 上位技能
			if (dis_list["up_list"] && data["up_list"].length > 0) {
				let tmp_str = "";
				for (let tmp_skill_no of data["up_list"]) {
					if (tmp_str != "") tmp_str += ", ";
					tmp_str += skill_data[tmp_skill_no]["name"] + "(" + tmp_skill_no + ")";
				}

				str += "\n\t上位技能 : " + tmp_str;
			}
			delete data["up_list"];

			// 互斥技能
			if (dis_list["skill_f"] && data["skill_f"].length > 0) {
				let tmp_str = "";
				for (let tmp_skill_no of data["skill_f"]) {
					if (tmp_str != "") tmp_str += ", ";
					tmp_str += skill_data[tmp_skill_no]["name"] + "(" + tmp_skill_no + ")";
				}

				str += "\n\t互斥技能 : " + tmp_str;
			}
			delete data["skill_f"];

			// 獲得條件
			if (dis_list["flag"] && Object.keys(data["flag"]).length > 0) {
				let tmp_str = "";
				for (let key in data["flag"]) {
					let flag = data["flag"][key];

					tmp_str += "\n\t\t" + status_list[key] + " : " + this.disFlag(key, flag);
				}

				str += "\n\t獲得條件 : " + tmp_str;
			}
			delete data["flag"];

			// 消耗
			if (Object.keys(data["cost"]).length > 0) {
				let tmp_str = "";
				console.log(data["cost"]);
				// str += "\n\t消耗 : " + tmp_str;
			}
			delete data["cost"];

			// 效果
			if (dis_list["effect"] && Object.keys(data["effect"]).length > 0) {
				str += "\n\t效果 : ";

				for (let action in data["effect"]) {
					str += "\n\t\t" + action_list[action] + " : ";

					let tmp_str = "";
					for (let key in data["effect"][action]) {
						let value = data["effect"][action][key];

						if (tmp_str != "") tmp_str += ", ";
						if (value.match(";")) {
							tmp_str += status_list[key];

							let tmp_content = "";
							for (let value_str of value.split(";")) {
								if (tmp_content != "") tmp_content += "|";

								if (value_str.match(":")) {
									let tmp_value = value_str.split(":")[0];
									let tmp_flag_str = value_str.split(":")[1];

									let tmp_content_2 = "";
									for (let flag_str of tmp_flag_str.split("&&")) {
										if (tmp_content_2 != "") tmp_content_2 += ", ";

										let tmp = flag_str.split("^^");
										tmp_content_2 = this.disFlag(tmp[0], tmp[1]);
									}

									tmp_content += tmp_value + "(" + tmp_content_2 + ")";
								} else {
									tmp_content += value_str;
								}
							}

							tmp_str += " " + tmp_content;
						} else {
							tmp_str += status_list[key] + " " + value;
						}
					}

					str += tmp_str;
				}
			}
			delete data["effect"];

			// 升級所需經驗
			if (data["exp"].length > 0) {
				let tmp_str = "";
				console.log(data["exp"]);
				// str += "\n\t效果 : " + tmp_str;
			}
			delete data["exp"];

			console.log(skill_no + "." + str);

			for (let key in data) {
				console.log(key, data[key]);
			}
		}
	},

	// 陳述條件
	disFlag: function (key, flag) {
		let tmp_str = "";

		let tmp = flag.split("@");
		if (key == "skill") {
			let tmp_and_list = flag.split("&");

			for (let index in tmp_and_list) {
				let tmp_and_str = tmp_and_list[index];
				if (index != 0) tmp_str += ", 且";

				if (tmp_and_str.includes("|")) {
					let tmp_or_list = tmp_and_str.split("|");

					let tmp_content = "";
					for (let tmp_or_str of tmp_or_list) {
						let tmp = tmp_or_str.split("^");
						let skill_no = tmp[0] * 1;
						let skill_flag = tmp[1];

						if (tmp_content != "") tmp_content += " 或";

						if (skill_flag == "==1" || skill_flag == "<2") {
							tmp_content += "包含 " + skill_data[skill_no]["name"] + "(" + skill_no + ")";
						} else if (skill_flag == "!=1") {
							tmp_content += "不包含 " + skill_data[skill_no]["name"] + "(" + skill_no + ")";
						} else {
							tmp_content += skill_data[skill_no]["name"] + "(" + skill_no + ") 等級 " + skill_flag;
						}
					}

					tmp_str += tmp_content;
				} else {
					let tmp = tmp_and_str.split("^");
					let skill_no = tmp[0] * 1;
					let skill_flag = tmp[1];

					if (skill_flag == "==1" || skill_flag == "<2") {
						tmp_str += "包含 " + skill_data[skill_no]["name"] + "(" + skill_no + ")";
					} else if (skill_flag == "!=1") {
						tmp_str += "不包含 " + skill_data[skill_no]["name"] + "(" + skill_no + ")";
					} else {
						tmp_str += skill_data[skill_no]["name"] + "(" + skill_no + ") 等級 " + skill_flag;
					}
				}
			}
		} else {
			tmp_str += status_list[key];

			for (let index in tmp) {
				if (index == 1) tmp_str += ", 且不符合 ";

				let enable_list = tmp[index].split("|");
				for (let enable_no of enable_list) {
					if (enable_no.match("!=")) tmp_str += "不";
					enable_no = enable_no.replace("==", "").replace("!=", "");

					if (key == "gender") {
						enable_no = gender_list[enable_no];
					} else if (key == "race") {
						enable_no = race_data.getData(enable_no, "name");
					}

					if (Array.isArray(char_data.getData(0)[key])) {
						tmp_str += "包含" + enable_no;
					} else {
						tmp_str += "為 " + enable_no;
					}
				}
			}
		}

		return tmp_str;
	},
}

module.exports.init();
setTimeout(() => {
	console.log(skill_data);
}, 5000);
// process.exit();