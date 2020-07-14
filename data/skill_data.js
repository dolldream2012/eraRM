const char_data = global.char_data = require('../data/character_data.js');
const race_data = global.race_data = require('../data/race_data.js');

let type_list = { 0: "特徵", 1: "被動", 2: "攻擊", 3: "輔助", 8: "經歷", 9: "個性" };	// 類型
let tmp_type_list = {};	// 子類型
let action_list = { "char": "角色屬性" };	// 效果判定時機
let status_list = { "skill": "技能", "gender": "性別", "height": "身高", "weight": "體重", "age_inside": "年齡(內在)", "age_outside": "年齡(外在)", "age_exp": "年齡(經歷)", "age": "外表年齡", "age_t": "實際年齡", "race": "種族", "hp": "HP", "sp": "SP", "mp": "MP" }
let gender_list = ["扶他", "無性別", "女性", "男性"];	// 性別

// 模版
const model = {
	"name": ""	// 技能名稱
	, "type": ""	// 類型(0: 特徵, 1:被動, 2: 攻擊, 3: 輔助, 8: 經歷, 9: 個性)
	, "type_sub": []	// 子類型(技能判定用)(1: 正面性格, 2: 負面性格)
	, "max_lv": 1	// 技能等級上限
	, "up_list": []	// 上位技能
	// 可通過設置上位技能但不設置晉級條件的方式，來達成技能保留的判定權重
	, "group_f": ""	// 互斥技能群組，同群組技能只會出現一項
	, "skill_f": []	// 互斥技能
	// 如果擁有該技能則無法學習
	// 可通過下位技能設置互斥、上位技能不設置的方式，搭配 upgSkill 來達成上位技能不被下位技能抵消的設定
	, "flag": {}	// 獲得條件、限制(前置技能、性別、種族、經歷、能力值…)
	// skill: 可以使用 & 和 | 來設置多重條件，先判斷 | 再判斷 &，目前不支援更複雜的判斷方式
	// skill_compare: 技能1 與 技能2 比較等級 { "skill_compare" : "skill_no_1^skill_no_2^skill_1<skill_b"}
	// 複數條件: 可學習1&(可學習2-1|可學習2-1)@不可學習1|不可學習2
	, "cost": {}	// 消耗及發動條件
	, "effect": {}	// 效果(0: 行動, 1: 攻擊, 2: 防禦, 3: 探索, 4: 生產, 5: 製作, 6: 服務, 7: 日常, 8: 睡覺, 9: 天賦轉化, 10: 創造角色)
	// 效果1:屬性1-1^^條件1-1&&屬性1-2^^條件1-2;效果2:屬性2^^條件2(條件規則同 flag)
	// eg. "height": "+10:gender^^==3;+5" : 男性身高+10，非男性身高+5
	// 達成條件1後立即處理效果1，不會再進入條件2的判斷和效果2的發動，因此優先級較高的效果需向前放置
	, "exp": []	// 升級所需經驗
	, "enable": "S"	// 技能開關(N: 關閉, Y: 啟動, F: 禁止開關, S: 無開關效果)
};

// 技能列表
const skill_data = {
	// 0 ~ 2999 特徵
	// 0 ~ 特徵(體型)
	"0": Object.assign({}, model, { "name": "矮", "type": 0, "group_f": "height", "up_list": [6], "effect": { "char": { "height": "-10", "weight": "-5", "age_outside": "-2:gender^^==3;-1" } } }),
	"1": Object.assign({}, model, { "name": "高", "type": 0, "group_f": "height", "up_list": [7], "effect": { "char": { "height": "+10", "weight": "+5", "age_outside": "+2:gender^^==2;+1" } } }),
	"2": Object.assign({}, model, { "name": "瘦", "type": 0, "group_f": "weight", "up_list": [6], "effect": { "char": { "weight": "-5", "age_outside": "-1" } } }),
	"3": Object.assign({}, model, { "name": "胖", "type": 0, "group_f": "weight", "skill_f": [4], "effect": { "char": { "weight": "+10", "age_outside": "+1" } } }),
	"4": Object.assign({}, model, { "name": "瘦弱", "type": 0, "group_f": "weight|muscle", "skill_f": [3], "up_list": [6], "effect": { "char": { "weight": "-10", "age_outside": "-2:gender^^==3;-1" } } }),
	"5": Object.assign({}, model, { "name": "強壯", "type": 0, "group_f": "muscle", "up_list": [7], "effect": { "char": { "weight": "+5", "age_outside": "+2:gender^^==2;+1" } } }),
	"6": Object.assign({}, model, { "name": "嬌小", "type": 0, "group_f": "bodytype|height", "skill_f": [3, 5], "up_list": [8, 9], "flag": { "skill": "0^==1&2^==1|4^==1" }, "effect": { "char": { "height": "-10", "weight": "-10", "age_outside": "-3:gender^^==3;-2" } } }),
	"7": Object.assign({}, model, { "name": "魁梧", "type": 0, "group_f": "bodytype|height|muscle", "skill_f": [3], "flag": { "skill": "1^==1&5^==1" }, "effect": { "char": { "height": "+10", "weight": "+10", "age_outside": "+3:gender^^==3;+2" } } }),
	"8": Object.assign({}, model, { "name": "蘿莉", "type": 0, "group_f": "bodytype|height", "flag": { "skill": "6^==1", "gender": "==2", "age": "<30", "height": "<145" }, "effect": { "char": { "height": "-10", "weight": "-10", "age_outside": "-3:gender^^==1|==2&&height^^<150;-2" } } }),
	"9": Object.assign({}, model, { "name": "正太", "type": 0, "group_f": "bodytype|height", "flag": { "skill": "6^==1", "gender": "==3", "age": "<30", "height": "<145" }, "effect": { "char": { "height": "-10", "weight": "-10", "age_outside": "-3" } } }),

	// 50 ~ 特徵
	"50": Object.assign({}, model, { "name": "精靈尖耳", "type": 0, "group_f": "ears", "effect": {} }),
	"51": Object.assign({}, model, { "name": "貓耳", "type": 0, "group_f": "ears", "effect": {} }),
	"52": Object.assign({}, model, { "name": "犬耳", "type": 0, "group_f": "ears", "effect": {} }),
	"53": Object.assign({}, model, { "name": "兔耳", "type": 0, "group_f": "ears", "effect": {} }),
	"54": Object.assign({}, model, { "name": "狐耳", "type": 0, "group_f": "ears", "effect": {} }),
	"70": Object.assign({}, model, { "name": "牛角", "type": 0, "group_f": "horn", "effect": {} }),
	"71": Object.assign({}, model, { "name": "獨角", "type": 0, "group_f": "horn", "effect": {} }),

	// 2000 特徵(性相關)
	"2030": Object.assign({}, model, { "name": "未熟", "type": 0, "effect": { "char": { "age_inside": "**0.55+6.5" } } }),	// 預設年齡為 10 ~ 40 歲，通過運算使結果落在 10 ~ 14 之間
	"2031": Object.assign({}, model, { "name": "白虎", "type": 0, "flag": { "gender": "==2" }, "effect": {} }),
	"2040": Object.assign({}, model, { "name": "絕壁", "type": 0, "group_f": "chest", "flag": { "gender": "==2" }, "effect": { "char": { "age_outside": "-2" } } }),
	"2041": Object.assign({}, model, { "name": "貧乳", "type": 0, "group_f": "chest", "flag": { "gender": "==2" }, "effect": { "char": { "age_outside": "-1" } } }),
	"2042": Object.assign({}, model, { "name": "巨乳", "type": 0, "group_f": "chest", "flag": { "gender": "==2" }, "effect": { "char": { "age_outside": "+1" } } }),
	"2043": Object.assign({}, model, { "name": "爆乳", "type": 0, "group_f": "chest", "flag": { "gender": "==2" }, "effect": { "char": { "age_outside": "+2" } } }),
	"2044": Object.assign({}, model, { "name": "魔乳", "type": 0, "group_f": "chest", "flag": { "gender": "==2" }, "effect": { "char": { "age_outside": "+4" } } }),

	// 3000 ~ 5999 體質
	"3000": Object.assign({}, model, { "name": "害怕疼痛", "type": 0, "group_f": "painful", "effect": { "char": { "age_inside": "-3" } } }),
	"3001": Object.assign({}, model, { "name": "不怕疼痛", "type": 0, "group_f": "painful", "effect": { "char": { "age_inside": "+3" } } }),
	"3002": Object.assign({}, model, { "name": "喜歡疼痛", "type": 0, "group_f": "painful", "effect": {} }),
	"3500": Object.assign({}, model, { "name": "抗藥性", "type": 1, "effect": {} }),
	"3501": Object.assign({}, model, { "name": "藥人", "type": 1, "effect": {} }),

	// 6000 ~ 8999 體質(性相關)
	// "6000": Object.assign({}, model, { "name": "陰蒂鈍感", "effect": {} }),
	// "6001": Object.assign({}, model, { "name": "陰蒂敏感", "effect": {} }),
	// "6002": Object.assign({}, model, { "name": "乳房鈍感", "effect": {} }),
	// "6003": Object.assign({}, model, { "name": "乳房敏感", "effect": {} }),
	// "6004": Object.assign({}, model, { "name": "私處鈍感", "effect": {} }),
	// "6005": Object.assign({}, model, { "name": "私處敏感", "effect": {} }),
	// "6006": Object.assign({}, model, { "name": "肛門鈍感", "effect": {} }),
	// "6007": Object.assign({}, model, { "name": "肛門敏感", "effect": {} }),
	// "6008": Object.assign({}, model, { "name": "尿道敏感", "effect": {} }),
	// "6009": Object.assign({}, model, { "name": "尿道敏感", "effect": {} }),
	// "6010": Object.assign({}, model, { "name": "舌頭鈍感", "effect": {} }),	// 難以察覺下毒，容易接受口交系調教
	// "6011": Object.assign({}, model, { "name": "舌頭敏感", "effect": {} }),	// 容易察覺下毒，容易抗拒口交系調教
	// "6012": Object.assign({}, model, { "name": "持久", "effect": {} }),
	// "6013": Object.assign({}, model, { "name": "早洩", "effect": {} }),
	// "6014": Object.assign({}, model, { "name": "淫核", "effect": {} }),
	// "6015": Object.assign({}, model, { "name": "淫乳", "effect": {} }),
	// "6016": Object.assign({}, model, { "name": "淫壺", "effect": {} }),
	// "6017": Object.assign({}, model, { "name": "淫肛", "effect": {} }),
	// "6019": Object.assign({}, model, { "name": "性豪", "effect": {} }),
	// "6020": Object.assign({}, model, { "name": "容易濕", "effect": {} }),
	// "6021": Object.assign({}, model, { "name": "不易濕", "effect": {} }),
	// "6022": Object.assign({}, model, { "name": "漏尿癖", "effect": {} }),
	// "6023": Object.assign({}, model, { "name": "母乳體質", "effect": {} }),
	// "6500": Object.assign({}, model, { "name": "容易成癮", "effect": {} }),
	// "6501": Object.assign({}, model, { "name": "不易成癮", "effect": {} }),
	// "6502": Object.assign({}, model, { "name": "精液中毒", "effect": {} }),

	// 9000 ~ 9899 個性
	"9000": Object.assign({}, model, { "name": "膽小", "type": 9, "group_f": "gut", "effect": { "char": { "age_inside": "-2" } } }),
	"9001": Object.assign({}, model, { "name": "軟弱", "type": 9, "group_f": "gut", "effect": { "char": { "age_inside": "-1" } } }),
	"9002": Object.assign({}, model, { "name": "勇敢", "type": 9, "group_f": "gut", "effect": { "char": { "age_inside": "+1" } } }),
	"9003": Object.assign({}, model, { "name": "堅強", "type": 9, "group_f": "gut", "effect": { "char": { "age_inside": "+2" } } }),
	"9010": Object.assign({}, model, { "name": "好騙", "type": 9, "group_f": "trust", "effect": { "char": { "age_inside": "-3" } } }),
	"9011": Object.assign({}, model, { "name": "衝動", "type": 9, "group_f": "trust", "effect": { "char": { "age_inside": "-2" } } }),
	"9012": Object.assign({}, model, { "name": "粗心", "type": 9, "group_f": "trust", "effect": { "char": { "age_inside": "-1" } } }),
	"9013": Object.assign({}, model, { "name": "多疑", "type": 9, "group_f": "trust", "effect": { "char": { "age_inside": "+1" } } }),
	"9014": Object.assign({}, model, { "name": "謹慎", "type": 9, "group_f": "trust", "effect": { "char": { "age_inside": "+2" } } }),
	"9015": Object.assign({}, model, { "name": "戒心重", "type": 9, "group_f": "trust", "effect": { "char": { "age_inside": "+3" } } }),
	"9020": Object.assign({}, model, { "name": "調皮", "type": 9, "group_f": "steady", "effect": { "char": { "age_inside": "-2" } } }),
	"9021": Object.assign({}, model, { "name": "天真", "type": 9, "group_f": "steady", "effect": { "char": { "age_inside": "-1" } } }),
	"9022": Object.assign({}, model, { "name": "成熟", "type": 9, "group_f": "steady", "effect": { "char": { "age_inside": "+1" } } }),
	"9030": Object.assign({}, model, { "name": "虛偽", "type": 9, "group_f": "cooperation", "effect": { "char": { "age_inside": "+3" } } }),
	"9031": Object.assign({}, model, { "name": "忘恩負義", "type": 9, "group_f": "cooperation", "effect": { "char": { "age_inside": "+2" } } }),
	"9032": Object.assign({}, model, { "name": "腹黑", "type": 9, "group_f": "cooperation", "effect": { "char": { "age_inside": "+1" } } }),
	"9033": Object.assign({}, model, { "name": "叛逆", "type": 9, "group_f": "cooperation", "effect": { "char": { "age_inside": "-1" } } }),
	"9034": Object.assign({}, model, { "name": "傲嬌", "type": 9, "group_f": "cooperation", "effect": {} }),
	"9035": Object.assign({}, model, { "name": "老實", "type": 9, "group_f": "cooperation", "effect": {} }),
	"9036": Object.assign({}, model, { "name": "坦率", "type": 9, "group_f": "cooperation", "effect": {} }),
	"9037": Object.assign({}, model, { "name": "重情", "type": 9, "group_f": "cooperation", "effect": {} }),
	"9038": Object.assign({}, model, { "name": "盲從", "type": 9, "group_f": "cooperation", "effect": {} }),
	"9040": Object.assign({}, model, { "name": "自卑", "type": 9, "group_f": "modest", "effect": { "char": { "age_inside": "+2" } } }),
	"9041": Object.assign({}, model, { "name": "謙虛", "type": 9, "group_f": "modest", "effect": { "char": { "age_inside": "+1" } } }),
	"9042": Object.assign({}, model, { "name": "高傲", "type": 9, "group_f": "modest", "effect": {} }),
	"9043": Object.assign({}, model, { "name": "囂張", "type": 9, "group_f": "modest", "effect": { "char": { "age_inside": "-2" } } }),
	"9050": Object.assign({}, model, { "name": "不知羞恥", "type": 9, "group_f": "trovert", "effect": { "char": { "age_inside": "-3" } } }),
	"9051": Object.assign({}, model, { "name": "表演慾", "type": 9, "group_f": "trovert", "effect": { "char": { "age_inside": "-2" } } }),
	"9052": Object.assign({}, model, { "name": "開放", "type": 9, "group_f": "trovert", "effect": { "char": { "age_inside": "-1" } } }),
	"9053": Object.assign({}, model, { "name": "害羞", "type": 9, "group_f": "trovert", "effect": { "char": { "age_inside": "+1" } } }),
	"9054": Object.assign({}, model, { "name": "保守", "type": 9, "group_f": "trovert", "effect": { "char": { "age_inside": "+2" } } }),
	"9055": Object.assign({}, model, { "name": "壓抑", "type": 9, "group_f": "trovert", "effect": { "char": { "age_inside": "+3" } } }),
	"9060": Object.assign({}, model, { "name": "自我中心", "type": 9, "group_f": "curiosity", "effect": { "char": { "age_inside": "-2" } } }),
	"9061": Object.assign({}, model, { "name": "自戀", "type": 9, "group_f": "curiosity", "effect": { "char": {} } }),
	"9062": Object.assign({}, model, { "name": "好奇心", "type": 9, "group_f": "curiosity", "effect": { "char": { "age_inside": "-3" } } }),
	"9063": Object.assign({}, model, { "name": "熱心", "type": 9, "group_f": "curiosity", "effect": { "char": {} } }),
	"9064": Object.assign({}, model, { "name": "犧牲奉獻", "type": 9, "group_f": "curiosity", "effect": { "char": { "age_inside": "+1" } } }),
	"9070": Object.assign({}, model, { "name": "厭世", "type": 9, "group_f": "view", "effect": { "char": { "age_inside": "+2" } } }),
	"9071": Object.assign({}, model, { "name": "悲觀", "type": 9, "group_f": "view", "effect": { "char": { "age_inside": "+1" } } }),
	"9072": Object.assign({}, model, { "name": "樂觀", "type": 9, "group_f": "view", "effect": { "char": { "age_inside": "-1" } } }),
	"9073": Object.assign({}, model, { "name": "鼓舞人心", "type": 9, "group_f": "view", "effect": { "char": {} } }),
	"9080": Object.assign({}, model, { "name": "邋遢", "type": 9, "group_f": "hygiene", "effect": { "char": { "age_inside": "-2" } } }),
	"9081": Object.assign({}, model, { "name": "不怕髒", "type": 9, "group_f": "hygiene", "effect": { "char": { "age_inside": "-1" } } }),
	"9082": Object.assign({}, model, { "name": "愛乾淨", "type": 9, "group_f": "hygiene", "effect": { "char": { "age_inside": "+1" } } }),
	"9082": Object.assign({}, model, { "name": "潔癖", "type": 9, "group_f": "hygiene", "effect": { "char": { "age_inside": "+2" } } }),
	"9090": Object.assign({}, model, { "name": "嚴厲", "type": 9, "group_f": "familiar", "effect": { "char": { "age_inside": "+3" } } }),
	"9091": Object.assign({}, model, { "name": "冷漠", "type": 9, "group_f": "familiar", "effect": { "char": { "age_inside": "+2" } } }),
	"9092": Object.assign({}, model, { "name": "嚴肅", "type": 9, "group_f": "familiar", "effect": { "char": { "age_inside": "+1" } } }),
	"9093": Object.assign({}, model, { "name": "溫柔", "type": 9, "group_f": "familiar", "effect": { "char": { "age_inside": "-1" } } }),
	"9094": Object.assign({}, model, { "name": "平易近人", "type": 9, "group_f": "familiar", "effect": { "char": { "age_inside": "-2" } } }),
	"9100": Object.assign({}, model, { "name": "母性", "type": 9, "group_f": "paternity", "flag": { "gender": "==2", "age": ">20" }, "effect": { "char": { "age_inside": "+3" } } }),
	"9101": Object.assign({}, model, { "name": "父性", "type": 9, "group_f": "paternity", "flag": { "gender": "==3", "age": ">20" }, "effect": { "char": { "age_inside": "+3" } } }),
	"9110": Object.assign({}, model, { "name": "自私", "type": 9, "group_f": "selfish", "effect": { "char": { "age_inside": "+2" } } }),
	"9111": Object.assign({}, model, { "name": "善妒", "type": 9, "group_f": "selfish", "effect": { "char": { "age_inside": "+1" } } }),
	"9112": Object.assign({}, model, { "name": "樂於分享", "type": 9, "group_f": "selfish", "effect": { "char": { "age_inside": "-1" } } }),
	"9120": Object.assign({}, model, { "name": "自我懷疑", "type": 9, "group_f": "confidence", "effect": { "char": { "age_inside": "+1" } } }),
	"9121": Object.assign({}, model, { "name": "自信", "type": 9, "group_f": "confidence", "effect": { "char": { "age_inside": "-1" } } }),
	"9130": Object.assign({}, model, { "name": "冷靜", "type": 9, "group_f": "calm", "up_list": [9800], "effect": { "char": { "age_inside": "+1" } } }),
	"9131": Object.assign({}, model, { "name": "容易緊張", "type": 9, "group_f": "calm", "effect": { "char": { "age_inside": "-1" } } }),
	"9140": Object.assign({}, model, { "name": "面無表情", "type": 9, "skill_f": [9141, 9142, 9143, 9144], "up_list": [9800], "effect": { "char": { "age_inside": "+1" } } }),
	"9141": Object.assign({}, model, { "name": "愛哭", "type": 9, "skill_f": [9140], "up_list": [9144], "effect": { "char": { "age_inside": "-1" } } }),
	"9142": Object.assign({}, model, { "name": "愛笑", "type": 9, "skill_f": [9140], "up_list": [9144], "effect": { "char": { "age_inside": "-1" } } }),
	"9143": Object.assign({}, model, { "name": "易怒", "type": 9, "skill_f": [9140], "up_list": [9144], "effect": { "char": { "age_inside": "-1" } } }),
	"9144": Object.assign({}, model, { "name": "情感豐富", "type": 9, "skill_f": [9140], "flag": { "skill": "9141^==1&9142^==1&9143^==1" }, "effect": { "char": { "age_inside": "-2" } } }),
	"9150": Object.assign({}, model, { "name": "沉默寡言", "type": 9, "group_f": "gab", "up_list": [9800], "effect": { "char": { "age_inside": "+1" } } }),
	"9151": Object.assign({}, model, { "name": "多話", "type": 9, "group_f": "gab", "effect": { "char": { "age_inside": "-1" } } }),
	"9800": Object.assign({}, model, { "name": "三無", "type": 9, "group_f": "calm|gab|emotion", "flag": { "skill": "9130^==1&9140^==1&9150^==1" }, "effect": { "char": { "age_inside": "+3" } } }),

	// 9900 ~ 個性(性相關)
	// "9900": Object.assign({}, model, { "name": "重視貞操", "effect": {} }),
	// "9901": Object.assign({}, model, { "name": "輕視貞操", "effect": {} }),
	// "9902": Object.assign({}, model, { "name": "抵抗誘惑", "effect": {} }),
	// "9903": Object.assign({}, model, { "name": "易受誘惑", "effect": {} }),
	// "9904": Object.assign({}, model, { "name": "否定快感", "effect": {} }),
	// "9905": Object.assign({}, model, { "name": "接受快感", "effect": {} }),
	// "9980": Object.assign({}, model, { "name": "淫亂", "effect": {} }),
	// "9981": Object.assign({}, model, { "name": "自慰狂", "effect": {} }),
	// "9982": Object.assign({}, model, { "name": "弄乳狂", "effect": {} }),
	// "9983": Object.assign({}, model, { "name": "性愛狂", "effect": {} }),
	// "9984": Object.assign({}, model, { "name": "尻穴狂", "effect": {} }),
	// "9085": Object.assign({}, model, { "name": "施虐狂", "effect": {} }),
	// "9086": Object.assign({}, model, { "name": "受虐狂", "effect": {} }),
	// "9087": Object.assign({}, model, { "name": "露出狂", "effect": {} }),
	// "9088": Object.assign({}, model, { "name": "同性戀", "effect": {} }),
	// "9089": Object.assign({}, model, { "name": "雙性戀", "effect": {} }),

	// 9990 ~ 個性(異常)
	// "9990": Object.assign({}, model, { "name": "瘋狂", "effect": {} }),
	// "9991": Object.assign({}, model, { "name": "崩壞", "effect": {} }),
	// "9992": Object.assign({}, model, { "name": "幼兒退行", "effect": {} }),

	// 10000 ~ 12999 異常狀態
	// "10000": Object.assign({}, model, { "name": "風耐性", "effect": {} }),
	// "10001": Object.assign({}, model, { "name": "水耐性", "effect": {} }),
	// "10002": Object.assign({}, model, { "name": "火耐性", "effect": {} }),
	// "10003": Object.assign({}, model, { "name": "地耐性", "effect": {} }),
	// "10004": Object.assign({}, model, { "name": "光耐性", "effect": {} }),
	// "10005": Object.assign({}, model, { "name": "闇耐性", "effect": {} }),
	// "10006": Object.assign({}, model, { "name": "打擊耐性", "effect": {} }),
	// "10007": Object.assign({}, model, { "name": "穿刺耐性", "effect": {} }),
	// "10008": Object.assign({}, model, { "name": "斬擊耐性", "effect": {} }),
	// "10009": Object.assign({}, model, { "name": "毒耐性", "effect": {} }),
	// "10010": Object.assign({}, model, { "name": "睡眠耐性", "effect": {} }),
	// "10011": Object.assign({}, model, { "name": "麻痺耐性", "effect": {} }),
	// "10012": Object.assign({}, model, { "name": "先制", "effect": {} }),
	// "10013": Object.assign({}, model, { "name": "遲緩", "effect": {} }),

	// 13000 ~ 15999 被動
	// "13000": Object.assign({}, model, { "name": "學習快速", "effect": {} }),	// 經驗值獲得增加
	// "13001": Object.assign({}, model, { "name": "學習緩慢", "effect": {} }),	// 經驗值獲得減少
	// "13002": Object.assign({}, model, { "name": "悟性高", "effect": {} }),	// 升級所需經驗增加
	// "13003": Object.assign({}, model, { "name": "悟性差", "effect": {} }),	// 升級所需經驗減少
	"13004": Object.assign({}, model, { "name": "再生", "type": 1, "max_lv": 10, "up_list": [13005], "effect": {} }),	// 再生: 每回合恢復HP 5 ~ 50
	"13005": Object.assign({}, model, { "name": "高速再生", "type": 1, "max_lv": 10, "up_list": [13006], "flag": { "skill": "13004^==10", "hp": ">1000" }, "effect": {} }),	// 高速再生: 每回合恢復HP 5.5% ~ 10%
	"13006": Object.assign({}, model, { "name": "超速再生", "type": 1, "max_lv": 5, "flag": { "skill": "13005^==10", "race": "==6800" }, "effect": {} }),	// 超速再生: 每回合恢復HP 12% ~ 20% 或恢復HP 至 20 ~ 50%

	// 16000 ~ 18999 知識
	// "16000": Object.assign({}, model, { "name": "藥物知識", "effect": {} }),

	// 19000 ~ 20000 被動、異常狀態(性相關)
	// "19000": Object.assign({}, model, { "name": "懷孕", "effect": {} }),
	// "19001": Object.assign({}, model, { "name": "淫紋", "effect": {} }),
	// "19002": Object.assign({}, model, { "name": "發情", "effect": {} }),

	// 20000 ~ 29999 攻擊
	// "20000": Object.assign({}, model, { "name": "破甲", "effect": {} }),
	// "20000": Object.assign({}, model, { "name": "擬態", "effect": {} }),
	// "20000": Object.assign({}, model, { "name": "隱暱", "effect": {} }),
	// "20000": Object.assign({}, model, { "name": "潛行", "effect": {} }),
	// "20000": Object.assign({}, model, { "name": "誘惑", "effect": {} }),
	// "20000": Object.assign({}, model, { "name": "魔力吸收", "effect": {} }),

	// 30000 ~ 39999 輔助

	// 40000 ~ 41999 經歷
	// "40000": Object.assign({}, model, { "name": "初心者", "effect": {} }),

	// 42000 ~ 42999 經歷(人際相關)
	// "42000": Object.assign({}, model, { "name": "已婚", "effect": {} }),
	// "42001": Object.assign({}, model, { "name": "人妻", "effect": {} }),
	// "42001": Object.assign({}, model, { "name": "育兒中", "effect": {} }),

	// 43000 ~ 45999 經歷(性相關)
	"43000": Object.assign({}, model, { "name": "處女", "type": 8, "effect": { "char": { "age_exp": "-3" } } }),
	"43001": Object.assign({}, model, { "name": "童貞", "type": 8, "effect": { "char": { "age_exp": "-3" } } }),

	// 46000 ~ 48999 稱號
	// 49000 ~ 49999 稱號(性相關)
	// "49000": Object.assign({}, model, { "name": "牝犬", "effect": {} }),
};

// 起始技能獲取條件及獲得機率列表(空白列表表示不獲取技能的機率)
// 請注意不可設置相同機率，否則後者會覆蓋前者
const base_skill_data = [
	// { "flag": { "gender": "==2" }, skill_rate: { 40: [43000], 60: [] } },	// 女性 性經驗
	// { "flag": { "gender": "==3" }, skill_rate: { 20: [43001], 80: [] } },	// 男性 性經驗
	{ "flag": { "gender": "==2" }, skill_rate: { 35: [0], 15: [1], 50: [] } },	// 女性 身高
	{ "flag": { "gender": "==3" }, skill_rate: { 20: [0], 30: [1], 50: [] } },	// 男性 身高
	{ "flag": { "gender": "==2" }, skill_rate: { 40: [2], 20: [3], 40: [] } },	// 女性 體重
	{ "flag": { "gender": "==3" }, skill_rate: { 30: [2], 20: [3], 50: [] } },	// 男性 體重
	{ "flag": { "gender": "==2" }, skill_rate: { 20: [4, 5], 60: [] } },	// 女性 肌肉
	{ "flag": { "gender": "==3" }, skill_rate: { 20: [4], 40: [5], 40: [] } },	// 男性 肌肉
	// { "flag": { "gender": "!=1" }, skill_rate: { 5: [2030], 95: [] } },	// 未熟
	// { "flag": { "age": "<12" }, skill_rate: { 80: [2030], 20: [] } },	// 未熟
	// { "flag": { "gender": "==2" }, skill_rate: { 30: [2031], 70: [] } },	// 女性 白虎
	// { "flag": { "gender": "==2", "skill": "0^==1|4^==1|6^==1|8^==1" }, skill_rate: { 40: [2031], 60: [] } },	// 女性 下體(矮|瘦|瘦弱|蘿莉)
	{ "flag": { "gender": "==2" }, skill_rate: { 20: [2041, 2042], 1: [2043], 3: [2040, 2044], 766: [] } },	// 女性 胸部
	{ skill_rate: { 5: [9000, 9001, 9002, 9003], 95: [] } },	// 膽小, 軟弱, 勇敢, 堅強
	{ skill_rate: { 2: [9010, 9015], 3: [9011, 9014], 5: [9012, 9013], 90: [] } },	// 2: 好騙, 戒心重; 3: 衝動, 謹慎; 5: 粗心, 多疑
	{ skill_rate: { 5: [9020, 9021, 9022], 95: [] } },	// 調皮, 天真, 成熟
	{ "flag": { "age": "<15" }, skill_rate: { 20: [9020, 9021], 80: [] } },	// 調皮, 天真
	{ "flag": { "age": ">14" }, skill_rate: { 10: [9022], 95: [] } },	// 成熟
	{ skill_rate: { 5: [9030, 9031, 9032, 9033, 9034, 9035, 9036, 9037, 9038], 95: [] } },	// 虛偽, 忘恩負義, 腹黑, 叛逆, 傲嬌, 老實, 坦率, 重情, 盲從
	{ "flag": { "age": "<15" }, skill_rate: { 20: [9035, 9036, 9038], 80: [] } },	// 老實, 坦率, 盲從
	{ "flag": { "age": ">12|<18" }, skill_rate: { 30: [9033], 80: [] } },	// 叛逆
	{ "flag": { "age": ">14" }, skill_rate: { 2: [9030, 9032, 9038], 3: [9031, 9033], 5: [9034, 9035, 9036, 9037], 80: [] } },	// 2: 虛偽, 腹黑, 盲從; 3: 忘恩負義, 叛逆; 5: 傲嬌, 老實, 坦率, 重情
	{ skill_rate: { 2: [9040, 9043], 3: [9041, 9042], 95: [] } },	// 2: 自卑, 囂張; 3: 謙虛, 高傲
	{ "flag": { "gender": "==2" }, skill_rate: { 2: [9055], 3: [9050, 9054], 5: [9051, 9053], 10: [9052], 80: [] } },	// 2: 壓抑; 3: 不知羞恥, 保守; 5: 表演慾, 害羞, 10: 開放
	{ "flag": { "gender": "==3" }, skill_rate: { 2: [9050, 9055], 3: [9051, 9054], 5: [9052, 9053], 90: [] } },	// 2: 不知羞恥, 壓抑; 3: 表演慾, 保守; 5: 開放, 害羞
	{ "flag": { "age": "<12" }, skill_rate: { 10: [9050], 15: [9051], 25: [9052], 50: [] } },	// 10: 不知羞恥, 15: 表演慾, 25: 開放
	{ skill_rate: { 2: [9060, 9061, 9064], 3: [9062, 9063], 95: [] } },	// 2: 自我中心, 自戀, 犧牲奉獻; 3: 好奇心, 熱心
	{ skill_rate: { 2: [9070, 9073], 3: [9071, 9072], 95: [] } },	// 2: 厭世, 鼓舞人心; 3: 悲觀, 樂觀
	{ "flag": { "age": "<15" }, skill_rate: { 10: [9072, 9073], 80: [] } },	// 樂觀, 鼓舞人心
	{ "flag": { "age": ">50" }, skill_rate: { 10: [9070, 9071], 80: [] } },	// 悲觀, 厭世
	{ skill_rate: { 5: [9080, 9083], 10: [9081, 9082], 85: [] } },	// 5: 邋遢, 潔癖; 10: 不怕髒, 愛乾淨
	{ skill_rate: { 10: [9090, 9091], 80: [] } },	// 嚴厲, 冷漠, 嚴肅, 溫柔, 平易近人
	{ skill_rate: { 5: [9091, 9093, 9094], 95: [] } },	// 冷漠, 溫柔, 平易近人
	{ "flag": { "age": ">20" }, skill_rate: { 5: [9090], 80: [] } },	// 嚴厲
	{ "flag": { "age": ">12" }, skill_rate: { 5: [9092], 80: [] } },	// 嚴肅
	{ "flag": { "gender": "==2", "age": ">20" }, skill_rate: { 5: [9100], 95: [] } },	// 母性
	{ "flag": { "gender": "==3", "age": ">20" }, skill_rate: { 5: [9101], 95: [] } },	// 父性
	{ skill_rate: { 5: [9110, 9111, 9112], 95: [] } },	// 自私, 善妒, 樂於分享
	{ skill_rate: { 5: [9120, 9121], 95: [] } },	// 自我懷疑, 自信
	{ skill_rate: { 5: [9130, 9131], 95: [] } },	// 冷靜, 容易緊張
	{ skill_rate: { 5: [9140], 95: [] } },	// 面無表情
	{ skill_rate: { 5: [9141], 95: [] } },	// 愛哭
	{ skill_rate: { 5: [9142], 95: [] } },	// 愛笑
	{ skill_rate: { 5: [9143], 95: [] } },	// 易怒
	{ skill_rate: { 5: [9150, 9151], 95: [] } },	// 沉默寡言, 多話
	{ skill_rate: { 2: [3002], 3: [3000, 3001], 95: [] } },	// 2: 喜歡疼痛; 3: 害怕疼痛, 不怕疼痛
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

// module.exports.disSkillData();
// process.exit();