// const util = global.util;
const util = require('../lib/Util.js');	// test

// 模版
const model = {
	"name": ""	// 技能名稱
	, "type": ""	// 類型(0: 特徵, 1:被動, 2: 攻擊, 3: 輔助, 8: 經歷, 9: 個性)
	, "action": []	// 判定時機(0: 行動, 1: 攻擊, 2: 防禦, 3: 探索, 4: 生產, 5: 製作, 6: 服務, 7: 日常, 8: 睡覺, 9: 天賦轉化)
	, "type_sub": []	// 子類型(技能判定用)(1: 正面性格, 2: 負面性格)
	, "max_lv": 1	// 技能等級上限
	, "up_list": []	// 上位技能
	// 可通過設置上位技能但不設置晉級條件的方式，來達成技能保留的判定權重
	, "group_f": ""	// 互斥技能群組，同群組技能只會出現一項
	, "skill_f": []	// 互斥技能
	// 如果擁有該技能則無法學習
	// 可通過下位技能設置互斥、上位技能不設置的方式，搭配 upgSkill 來達成上位技能不被下位技能抵消的設定
	, "flag": {}	// 獲得條件、限制(前置技能、性別、種族、經歷、能力值…)
	, "keep_flag": {}	// 獲得上位技能時不被消除之條件 { "skill_no" : { "skill": "skill_id^==1"}}
	// skill: 可以使用 & 和 | 來設置多重條件，先判斷 | 再判斷 &，目前不支援更複雜的判斷方式
	// skill_compare: 技能1 與 技能2 比較等級 { "skill_compare" : "skill_no_1^skill_no_2^skill_1<skill_b"}
	// 複數條件: 可學習1|可學習2@不可學習1|不可學習2
	// 不同屬性條件必須同時成立
	, "cost": {}	// 消耗及發動條件
	, "effect": {}	// 效果
	, "exp": []	// 升級所需經驗
	, "enable": 9	// 技能開關(0: 關閉, 1: 啟動, 8: 禁止關閉, 9: 禁止啟動)
};

// 技能列表
const skill_data = {
	// 0 ~ 2999 特徵
	// 0 ~ 特徵(體型)
	"0": Object.assign({}, model, { "name": "矮", "type": 0, "group_f": "height", "up_list": [6] }),
	"1": Object.assign({}, model, { "name": "高", "type": 0, "group_f": "height", "up_list": [7] }),
	"2": Object.assign({}, model, { "name": "瘦", "type": 0, "group_f": "weight", "up_list": [6] }),
	"3": Object.assign({}, model, { "name": "胖", "type": 0, "group_f": "weight", "skill_f": [4] }),
	"4": Object.assign({}, model, { "name": "瘦弱", "type": 0, "group_f": "weight|muscle", "skill_f": [3], "up_list": [6], "keep_flag": { "6": "" } }),
	"5": Object.assign({}, model, { "name": "強壯", "type": 0, "group_f": "muscle", "up_list": [7] }),
	"6": Object.assign({}, model, { "name": "嬌小", "type": 0, "group_f": "bodytype|height", "up_list": [8, 9], "flag": { "skill": "0^==1&2^==1|4^==1" } }),
	"7": Object.assign({}, model, { "name": "魁梧", "type": 0, "group_f": "bodytype|height|muscle", "flag": { "skill": "1^==1&5^==1" } }),
	"8": Object.assign({}, model, { "name": "蘿莉", "type": 0, "group_f": "bodytype|height", "flag": { "skill": "6^==1", "gender": "==2" } }),
	"9": Object.assign({}, model, { "name": "正太", "type": 0, "group_f": "bodytype|height", "flag": { "skill": "6^==1", "gender": "==3" } }),

	// 50 ~ 特徵
	"50": Object.assign({}, model, { "name": "精靈尖耳", "type": 0, "group_f": "ears" }),
	"51": Object.assign({}, model, { "name": "貓耳", "type": 0, "group_f": "ears" }),
	"52": Object.assign({}, model, { "name": "犬耳", "type": 0, "group_f": "ears" }),
	"53": Object.assign({}, model, { "name": "兔耳", "type": 0, "group_f": "ears" }),
	"54": Object.assign({}, model, { "name": "狐耳", "type": 0, "group_f": "ears" }),
	"70": Object.assign({}, model, { "name": "牛角", "type": 0, }),
	"71": Object.assign({}, model, { "name": "獨角", "type": 0, }),

	// 2000 特徵(性相關)
	"2030": Object.assign({}, model, { "name": "白虎", "type": 0, "action": [8], "flag": { "gender": "==2" } }),
	"2031": Object.assign({}, model, { "name": "未熟", "type": 0, "action": [8] }),
	"2032": Object.assign({}, model, { "name": "絕壁", "type": 0, "action": [8], "skill_f": [2033, 2034, 2035, 2036], "flag": { "gender": "==2" } }),
	"2033": Object.assign({}, model, { "name": "貧乳", "type": 0, "action": [8], "skill_f": [2032, 2034, 2035, 2036], "flag": { "gender": "==2" } }),
	"2034": Object.assign({}, model, { "name": "巨乳", "type": 0, "action": [8], "skill_f": [2032, 2033, 2035, 2036], "flag": { "gender": "==2" } }),
	"2035": Object.assign({}, model, { "name": "爆乳", "type": 0, "action": [8], "skill_f": [2032, 2033, 2034, 2036], "flag": { "gender": "==2" } }),
	"2036": Object.assign({}, model, { "name": "魔乳", "type": 0, "action": [8], "skill_f": [2032, 2033, 2034, 2035], "flag": { "gender": "==2" } }),

	// 3000 ~ 5999 體質
	"3000": Object.assign({}, model, { "name": "害怕疼痛", "type": 0, "action": [8], "skill_f": [3001] }),
	"3001": Object.assign({}, model, { "name": "不怕疼痛", "type": 0, "action": [8], "skill_f": [3000] }),
	// "3002": Object.assign({}, model, { "name": "喜歡疼痛" }),
	// "3500": Object.assign({}, model, { "name": "抗藥性" }),
	// "3500": Object.assign({}, model, { "name": "藥人" }),

	// 6000 ~ 8999 體質(性相關)
	// "6000": Object.assign({}, model, { "name": "陰蒂鈍感" }),
	// "6001": Object.assign({}, model, { "name": "陰蒂敏感" }),
	// "6002": Object.assign({}, model, { "name": "乳房鈍感" }),
	// "6003": Object.assign({}, model, { "name": "乳房敏感" }),
	// "6004": Object.assign({}, model, { "name": "私處鈍感" }),
	// "6005": Object.assign({}, model, { "name": "私處敏感" }),
	// "6006": Object.assign({}, model, { "name": "肛門鈍感" }),
	// "6007": Object.assign({}, model, { "name": "肛門敏感" }),
	// "6008": Object.assign({}, model, { "name": "尿道敏感" }),
	// "6009": Object.assign({}, model, { "name": "尿道敏感" }),
	// "6010": Object.assign({}, model, { "name": "舌頭鈍感" }),	// 難以察覺下毒，容易接受口交系調教
	// "6011": Object.assign({}, model, { "name": "舌頭敏感" }),	// 容易察覺下毒，容易抗拒口交系調教
	// "6012": Object.assign({}, model, { "name": "淫核" }),
	// "6013": Object.assign({}, model, { "name": "淫乳" }),
	// "6014": Object.assign({}, model, { "name": "淫壺" }),
	// "6015": Object.assign({}, model, { "name": "淫肛" }),
	// "6019": Object.assign({}, model, { "name": "性豪" }),
	// "6020": Object.assign({}, model, { "name": "容易濕" }),
	// "6021": Object.assign({}, model, { "name": "不易濕" }),
	// "6022": Object.assign({}, model, { "name": "漏尿癖" }),
	// "6023": Object.assign({}, model, { "name": "早洩" }),
	// "6024": Object.assign({}, model, { "name": "母乳體質" }),
	// "6500": Object.assign({}, model, { "name": "容易成癮" }),
	// "6501": Object.assign({}, model, { "name": "不易成癮" }),
	// "6502": Object.assign({}, model, { "name": "精液中毒" }),

	// 9000 ~ 9999 個性
	// "9001": Object.assign({}, model, { "name": "軟弱" }),
	// "9002": Object.assign({}, model, { "name": "堅強" }),
	// "9003": Object.assign({}, model, { "name": "膽小" }),
	// "9004": Object.assign({}, model, { "name": "勇敢" }),
	// "9005": Object.assign({}, model, { "name": "粗心" }),
	// "9006": Object.assign({}, model, { "name": "謹慎" }),
	// "9007": Object.assign({}, model, { "name": "天真" }),
	// "9008": Object.assign({}, model, { "name": "腹黑" }),
	// "9009": Object.assign({}, model, { "name": "叛逆" }),
	// "9010": Object.assign({}, model, { "name": "盲從" }),
	// "9011": Object.assign({}, model, { "name": "坦率" }),
	// "9012": Object.assign({}, model, { "name": "虛偽" }),
	// "9013": Object.assign({}, model, { "name": "傲嬌" }),
	// "9014": Object.assign({}, model, { "name": "文靜" }),
	// "9015": Object.assign({}, model, { "name": "活潑" }),
	// "9016": Object.assign({}, model, { "name": "高傲" }),
	// "9017": Object.assign({}, model, { "name": "囂張" }),
	// "9018": Object.assign({}, model, { "name": "自卑" }),
	// "9019": Object.assign({}, model, { "name": "自戀" }),
	// "9020": Object.assign({}, model, { "name": "不知羞恥" }),
	// "9021": Object.assign({}, model, { "name": "害羞" }),
	// "9022": Object.assign({}, model, { "name": "開放" }),
	// "9023": Object.assign({}, model, { "name": "保守" }),
	// "9024": Object.assign({}, model, { "name": "克制" }),
	// "9025": Object.assign({}, model, { "name": "冷漠" }),
	// "9026": Object.assign({}, model, { "name": "自我中心" }),
	// "9027": Object.assign({}, model, { "name": "好奇心" }),
	// "9028": Object.assign({}, model, { "name": "悲觀" }),
	// "9029": Object.assign({}, model, { "name": "樂觀" }),
	// "9030": Object.assign({}, model, { "name": "戒心重" }),
	// "9032": Object.assign({}, model, { "name": "表演慾" }),
	// "9033": Object.assign({}, model, { "name": "壓抑" }),
	// "9034": Object.assign({}, model, { "name": "犧牲奉獻" }),
	// "9035": Object.assign({}, model, { "name": "潔癖" }),
	// "9036": Object.assign({}, model, { "name": "不怕髒" }),
	// "9037": Object.assign({}, model, { "name": "邋遢" }),
	// "9038": Object.assign({}, model, { "name": "厭男" }),
	// "9039": Object.assign({}, model, { "name": "厭女" }),
	// "9040": Object.assign({}, model, { "name": "平易近人" }),
	// "9041": Object.assign({}, model, { "name": "威嚴" }),
	// "9042": Object.assign({}, model, { "name": "鼓舞" }),
	// "9043": Object.assign({}, model, { "name": "厭世" }),
	// "9044": Object.assign({}, model, { "name": "重情" }),
	// "9045": Object.assign({}, model, { "name": "忘恩負義" }),
	// "9046": Object.assign({}, model, { "name": "母性" }),
	// "9047": Object.assign({}, model, { "name": "父性" }),
	// "9048": Object.assign({}, model, { "name": "慈愛" }),
	// "9049": Object.assign({}, model, { "name": "善妒" }),
	// "9050": Object.assign({}, model, { "name": "樂於分享" }),
	// "9051": Object.assign({}, model, { "name": "調皮" }),
	// "9052": Object.assign({}, model, { "name": "老實" }),
	// "9053": Object.assign({}, model, { "name": "自信" }),
	// "9054": Object.assign({}, model, { "name": "自我懷疑" }),
	// "9055": Object.assign({}, model, { "name": "冷靜" }),
	// "9056": Object.assign({}, model, { "name": "衝動" }),
	// "9057": Object.assign({}, model, { "name": "沉默寡言" }),
	// "9058": Object.assign({}, model, { "name": "面無表情" }),
	// "9059": Object.assign({}, model, { "name": "波瀾不驚" }),
	// "9060": Object.assign({}, model, { "name": "三無" }),
	// "9061": Object.assign({}, model, { "name": "愛哭" }),
	// "9062": Object.assign({}, model, { "name": "愛笑" }),
	// "9063": Object.assign({}, model, { "name": "易怒" }),
	// "9064": Object.assign({}, model, { "name": "情感豐富" }),
	// "9065": Object.assign({}, model, { "name": "多話" }),
	// "9066": Object.assign({}, model, { "name": "輕信" }),
	// "9067": Object.assign({}, model, { "name": "多疑" }),

	// 9900 ~ 個性(性相關)
	// "9900": Object.assign({}, model, { "name": "重視貞操" }),
	// "9901": Object.assign({}, model, { "name": "輕視貞操" }),
	// "9902": Object.assign({}, model, { "name": "抵抗誘惑" }),
	// "9903": Object.assign({}, model, { "name": "易受誘惑" }),
	// "9904": Object.assign({}, model, { "name": "否定快感" }),
	// "9905": Object.assign({}, model, { "name": "接受快感" }),
	// "9980": Object.assign({}, model, { "name": "淫亂" }),
	// "9981": Object.assign({}, model, { "name": "自慰狂" }),
	// "9982": Object.assign({}, model, { "name": "弄乳狂" }),
	// "9983": Object.assign({}, model, { "name": "性愛狂" }),
	// "9984": Object.assign({}, model, { "name": "尻穴狂" }),
	// "9085": Object.assign({}, model, { "name": "施虐狂" }),
	// "9086": Object.assign({}, model, { "name": "受虐狂" }),
	// "9087": Object.assign({}, model, { "name": "露出狂" }),
	// "9088": Object.assign({}, model, { "name": "同性戀" }),
	// "9089": Object.assign({}, model, { "name": "雙性戀" }),

	// 9990 ~ 個性(異常)
	// "9990": Object.assign({}, model, { "name": "瘋狂" }),
	// "9991": Object.assign({}, model, { "name": "崩壞" }),
	// "9992": Object.assign({}, model, { "name": "幼兒退行" }),

	// 10000 ~ 12999 異常狀態
	// "10000": Object.assign({}, model, { "name": "風耐性" }),
	// "10001": Object.assign({}, model, { "name": "水耐性" }),
	// "10002": Object.assign({}, model, { "name": "火耐性" }),
	// "10003": Object.assign({}, model, { "name": "地耐性" }),
	// "10004": Object.assign({}, model, { "name": "光耐性" }),
	// "10005": Object.assign({}, model, { "name": "闇耐性" }),
	// "10006": Object.assign({}, model, { "name": "打擊耐性" }),
	// "10007": Object.assign({}, model, { "name": "穿刺耐性" }),
	// "10008": Object.assign({}, model, { "name": "斬擊耐性" }),
	// "10009": Object.assign({}, model, { "name": "毒耐性" }),
	// "10010": Object.assign({}, model, { "name": "睡眠耐性" }),
	// "10011": Object.assign({}, model, { "name": "麻痺耐性" }),
	// "10012": Object.assign({}, model, { "name": "先制" }),
	// "10013": Object.assign({}, model, { "name": "遲緩" }),

	// 13000 ~ 15999 被動
	// "13000": Object.assign({}, model, { "name": "學習快速" }),	// 經驗值獲得增加
	// "13001": Object.assign({}, model, { "name": "學習緩慢" }),	// 經驗值獲得減少
	// "13002": Object.assign({}, model, { "name": "悟性高" }),	// 升級所需經驗增加
	// "13003": Object.assign({}, model, { "name": "悟性差" }),	// 升級所需經驗減少
	// "13004": Object.assign({}, model, { "name": "再生", "max_lv": 10, "up_list": [1, 2] }),	// 再生: 每回合恢復HP 5 ~ 50
	// "13005": Object.assign({}, model, { "name": "高速再生", "max_lv": 10, "up_list": [2], "flag": { "skill": "13004^==10", "hp": ">1000" } }),	// 高速再生: 每回合恢復HP 5.5% ~ 10%
	// "13006": Object.assign({}, model, { "name": "超速再生", "max_lv": 5, "flag": { "skill": "13005^==5", "race": "==6800" } }),	// 超速再生: 每回合恢復HP 12% ~ 20% 或恢復HP 至 20 ~ 50%

	// 16000 ~ 18999 知識
	// "16000": Object.assign({}, model, { "name": "藥物知識" }),

	// 19000 ~ 20000 被動、異常狀態(性相關)
	// "19000": Object.assign({}, model, { "name": "懷孕" }),
	// "19001": Object.assign({}, model, { "name": "淫紋" }),
	// "19002": Object.assign({}, model, { "name": "發情" }),

	// 20000 ~ 29999 攻擊
	// "20000": Object.assign({}, model, { "name": "破甲" }),
	// "20000": Object.assign({}, model, { "name": "擬態" }),
	// "20000": Object.assign({}, model, { "name": "隱暱" }),
	// "20000": Object.assign({}, model, { "name": "潛行" }),
	// "20000": Object.assign({}, model, { "name": "誘惑" }),
	// "20000": Object.assign({}, model, { "name": "魔力吸收" }),

	// 30000 ~ 39999 輔助

	// 40000 ~ 41999 經歷
	// "40000": Object.assign({}, model, { "name": "初心者" }),

	// 42000 ~ 42999 經歷(人際相關)
	// "42000": Object.assign({}, model, { "name": "已婚" }),
	// "42001": Object.assign({}, model, { "name": "人妻" }),
	// "42001": Object.assign({}, model, { "name": "育兒中" }),

	// 43000 ~ 45999 經歷(性相關)
	"43000": Object.assign({}, model, { "name": "處女", "type": 8, "action": [8] }),
	"43001": Object.assign({}, model, { "name": "童貞", "type": 8, "action": [8] }),

	// 46000 ~ 48999 稱號
	// 49000 ~ 49999 稱號(性相關)
	// "49000": Object.assign({}, model, { "name": "牝犬" }),
};

// 起始技能獲取條件及獲得機率列表(空白列表表示不獲取技能的機率)
const base_skill_data = [
	{ "flag": { "gender": "==2" }, skill_rate: { 40: [43000], 60: [] } },	// 女性 性經驗
	{ "flag": { "gender": "==3" }, skill_rate: { 40: [43001], 60: [] } },	// 男性 性經驗
	{ "flag": { "gender": "==2" }, skill_rate: { 35: [0], 15: [1], 50: [] } },	// 女性 身高
	{ "flag": { "gender": "==3" }, skill_rate: { 20: [0], 30: [1], 50: [] } },	// 男性 身高
	{ "flag": { "gender": "==2" }, skill_rate: { 40: [2], 20: [3], 40: [] } },	// 女性 體重
	{ "flag": { "gender": "==3" }, skill_rate: { 30: [2], 20: [3], 50: [] } },	// 男性 體重
	{ "flag": { "gender": "==2" }, skill_rate: { 20: [4], 20: [5], 60: [] } },	// 女性 肌肉
	{ "flag": { "gender": "==3" }, skill_rate: { 20: [4], 40: [5], 40: [] } },	// 男性 肌肉
	{ "flag": { "gender": "==2" }, skill_rate: { 30: [2030], 70: [] } },	// 女性 下體
	{ "flag": { "gender": "==2", "skill": "0^==1|4^==1|6^==1|8^==1" }, skill_rate: { 50: [2030], 50: [] } },	// 女性 下體(矮|瘦|瘦弱|蘿莉)
]

module.exports = {
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

	// 取得指定用途技能列表
	getDataByAction: function (action) {
		let obj = new Object();

		for (let skill_no in skill_data) {
			if (skill_data[skill_no]["action"].includes(action)) obj[skill_no] = skill_data[skill_no];
		}

		return obj;
	},

	// 取得指定類型技能列表
	getDataByType: function (...type) {
		let obj = new Object();

		for (let skill_no in skill_data) {
			if (type.includes(skill_data[skill_no]["type"])) obj[skill_no] = skill_data[skill_no];
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
		// 移除衝突技能
		for (let skill_id in char.skill) {
			for (let skill_no of skill_data[skill_id]["skill_f"]) {	// 遍歷技能的衝突技能
				if (char.skill[skill_no]) {	// 存在衝突技能
					// 抵消未升級之衝突技能
					if (char.skill[skill_id]["lv"] == 1 && char.skill[skill_id]["exp"] == 0) delete char.skill[skill_id];
					if (char.skill[skill_no]["lv"] == 1 && char.skill[skill_no]["exp"] == 0) delete char.skill[skill_no];
				}
			}
		}

		// 技能升級
		do {
			var isUpgrade = false;	// 技能是否升級

			for (let skill_id in char.skill) {
				for (let skill_no of skill_data[skill_id]["up_list"]) {	// 遍歷技能的上位技能
					if (char.skill[skill_no]) continue;	// 已存在上位技能則略過

					if (this.chkEnableSkill(char, skill_no)) {	// 滿足獲得上位技能條件
						char.skill[skill_no] = this.initSkill(skill_no);

						isUpgrade = true;
					}
				}
			}
		} while (isUpgrade);	// 如果技能升級，重新遍歷技能至無法升級為止

		// 移除下位技能
		for (let skill_id in char.skill) {
			for (let skill_no of skill_data[skill_id]["up_list"]) {	// 遍歷技能的上位技能
				if (char.skill[skill_no]) {
					if (skill_data[skill_id]["keep_flag"]) {	// 存在保留技能條件
						let keep_flag = skill_data[skill_id]["keep_flag"][skill_no];

						if (keep_flag == "" || keep_flag == 0) {	// 未填寫條件表示不需移除下位技能
						} else if (typeof keep_flag == "undefined") {	// 如果已擁有上位技能，移除上位技能
							delete char.skill[skill_id];
						} else if (this.chkEnableSkill(char, null, keep_flag) == false) {	// 反向利用 chkEnableSkill 的判斷條件，如果符合則保留技能
							delete char.skill[skill_id];
						}
					} else {
						delete char.skill[skill_id];	// 如果已擁有上位技能，移除上位技能
					}
				}
			}
		}
	},

	// 檢查可否獲得技能／是否滿足技能升級條件: 角色資料, 技能編號, 技能獲取條件
	chkEnableSkill: function (char, skill_no, flag_list) {
		if (skill_no && skill_data[skill_no] == null) return false;	// 不存在的技能編號
		let isArr = Array.isArray(char.skill);	// 技能尚未初始化

		if (skill_no) {
			// 檢查是否存在互斥技能群組(已擁有同類型屬性)
			let group_list_1 = skill_data[skill_no]["group_f"].split("|");
			for (let key in char.skill) {
				let tmp_skill_id = (isArr) ? char.skill[key] : key;
				let group_list_2 = skill_data[tmp_skill_id]["group_f"].split("|");

				if (group_list_1.some(group => group_list_2.includes(group))) {	// 存在相同技能群組
					if (skill_data[tmp_skill_id]["up_list"].includes(skill_no) == false) return false;	// 檢查技能並非已擁有技能的上位技能
				}
			}

			// 檢查是否存在互斥技能
			let skill_f = skill_data[skill_no]["skill_f"];
			for (let tmp_skill_no of skill_f) {
				if (isArr) {	// 技能尚未初始化
					if (char.skill.includes(tmp_skill_no)) return false;
				} else {
					if (char.skill[tmp_skill_no]) return false;
				}
			}
		}

		// 檢查技能獲取條件
		flag_list = flag_list || (skill_no && skill_data[skill_no]["flag"]);	// 帶入條件參數(物件) || 讀取技能設定
		if (flag_list) {	// 存在技能獲取條件
			for (let key in flag_list) {
				let flag = flag_list[key];

				if (key == "gender") {	// 判斷角色性別時，若條件僅指定為女性或男性，則默認扶他符合條件(若指定為女性或男性但不指定扶他，則不處理)
					if (flag == "==2" || flag == "==3") flag += "|==0";
				}

				if (key == "skill") {	// eg. no_1^==1|no_2^==1&no_3^==0
					let tmp_and_list = flag.split("&");

					for (let tmp_and_str of tmp_and_list) {
						if (tmp_and_str.includes("|")) {
							let tmp_pass = false;

							let tmp_or_list = tmp_and_str.split("|");
							for (let tmp_or_str of tmp_or_list) {
								let tmp = tmp_or_str.split("^");
								let skill_no = tmp[0];
								let skill_flag = tmp[1];

								if (char["skill"][skill_no] == null) continue;
								if (util.opeStr(char["skill"][skill_no]["lv"] + skill_flag) == true) {
									tmp_pass = true;
									break;
								}
							}

							if (tmp_pass == false) return false;
						} else {
							let tmp = tmp_and_str.split("^");
							let skill_no = tmp[0];
							let skill_flag = tmp[1];

							if (char["skill"][skill_no] == null) return false;
							if (util.opeStr(char["skill"][skill_no]["lv"] + skill_flag) == false) return false;
						}
					}
				} else if (key == "skill_compare") {	// { "skill_compare" : "skill_no_1^skill_no_2^skill_1<skill_b"}
					let tmp_and_list = flag.split("&");

					for (let tmp_list of tmp_and_list) {
						let tmp = tmp_list.split("^");
						let skill_no_1 = tmp[0];
						let skill_no_2 = tmp[1];
						let skill_flag = tmp[2];

						if (char["skill"][skill_no_1] == null || char["skill"][skill_no_2] == null) return false;
						skill_flag = skill_flag.replace("skill_1", char["skill"][skill_no_1]["lv"]);
						skill_flag = skill_flag.replace("skill_2", char["skill"][skill_no_2]["lv"]);
						if (util.opeStr(skill_flag) == false) return false;
					}
				} else if (Array.isArray(char[key]) || /[@|]/.test(flag)) {	// 檢查角色是否擁有某屬性 eg. no_1|no_2!no_3
					let tmp = flag.split("@");
					let enable_str = tmp[0];	// 可學習條件列表
					let disable_str = tmp[1];	// 不可學習條件列表

					if (enable_str != "") {
						let pass = false;

						let enable_list = enable_str.split("|");
						for (let enable_no of enable_list) {
							if (Array.isArray(char[key])) {
								if (char[key].includes(enable_no * 1)) {
									pass = true;
									break;
								}
							} else {
								if (util.opeStr(char[key] + enable_no) == true) {
									pass = true;
									break;
								}
							}
						}

						if (pass == false) return false;	// 角色不具備可學習技能條件
					}

					if (disable_str && disable_str != "") {
						let disable_list = disable_str.split("|");
						for (let disable_no of disable_list) {
							if (isNaN(disable_no)) disable_no = disable_no * 1;

							if (Array.isArray(char[key])) {	// 角色具備不可學習技能條件
								if (char[key].includes(disable_no * 1)) return false;
							} else {
								if (util.opeStr(char[key] + disable_no) == false) return false;
							}
						}
					}
				} else {
					if (util.opeStr(char[key] + flag) == false) return false;
				}
			}
		}

		return true;
	},
}