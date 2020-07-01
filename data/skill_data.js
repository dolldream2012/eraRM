/*
判斷可否學習邏輯: 先挑選可學習種族，再剔除無法學習種族
*/

// 模版
const model = {
	name: ""	// 技能名稱
	, type: ""	// 類型(0: 特徵, 1:被動, 2: 攻擊, 3: 輔助, 8: 個性, 9: 個性)
	, activation: []	// 判定時機(0: 行動, 1: 攻擊, 2: 防禦, 6: 日常, 7: 生產, 8: 服務, 9: 創建角色)
	, max_lv: 1	// 技能等級上限
	, up_list: []	// 上位技能
	, skill_f: []	// 互斥技能(如果擁有該技能則無法學習)
	, race: []	// 可學習種族
	, race_f: []	// 無法學習種族
	, flag: {}	// 獲得條件
	, cost: {}	// 消耗及發動條件
	, effect: {}	// 效果
	, exp: []	// 升級所需經驗
	, enable: 9	// 技能開關(0: 關閉, 1: 啟動, 8: 禁止關閉, 9: 禁止啟動)
}

// 技能列表
const skill_data = {
	// 0 ~ 8999 特徵
	00000: Object.assign({}, model, { name: "矮" }),
	00001: Object.assign({}, model, { name: "高" }),
	00002: Object.assign({}, model, { name: "瘦" }),
	00003: Object.assign({}, model, { name: "胖" }),
	00004: Object.assign({}, model, { name: "貧弱" }),
	00005: Object.assign({}, model, { name: "強壯" }),
	00006: Object.assign({}, model, { name: "嬌小" }),
	00007: Object.assign({}, model, { name: "魁梧" }),
	00000: {	// 未處理
		0: Object.assign({}, model, { name: "處女" }),
		0: Object.assign({}, model, { name: "童貞" }),
		0: Object.assign({}, model, { name: "瘋狂" }),
		0: Object.assign({}, model, { name: "崩壞" }),
		// 體質
		0: Object.assign({}, model, { name: "害怕疼痛" }),
		0: Object.assign({}, model, { name: "不怕疼痛" }),
		0: Object.assign({}, model, { name: "容易濕" }),
		0: Object.assign({}, model, { name: "不容易濕" }),
		0: Object.assign({}, model, { name: "愛哭" }),
		0: Object.assign({}, model, { name: "不容易哭" }),
		0: Object.assign({}, model, { name: "成癮" }),
		0: Object.assign({}, model, { name: "喜歡精液" }),
		// 技術
		0: Object.assign({}, model, { name: "學習快速" }),
		0: Object.assign({}, model, { name: "學習緩慢" }),
		0: Object.assign({}, model, { name: "擅用舌頭" }),
		0: Object.assign({}, model, { name: "調合知識" }),
		0: Object.assign({}, model, { name: "抗藥性" }),
		0: Object.assign({}, model, { name: "漏尿癖" }),
		// 身體特徵
		0: Object.assign({}, model, { name: "陰蒂鈍感" }),
		0: Object.assign({}, model, { name: "陰蒂敏感" }),
		0: Object.assign({}, model, { name: "私處鈍感" }),
		0: Object.assign({}, model, { name: "私處敏感" }),
		0: Object.assign({}, model, { name: "肛門鈍感" }),
		0: Object.assign({}, model, { name: "肛門敏感" }),
		0: Object.assign({}, model, { name: "乳房鈍感" }),
		0: Object.assign({}, model, { name: "乳房敏感" }),
		0: Object.assign({}, model, { name: "回復力高" }),
		0: Object.assign({}, model, { name: "回復力低" }),
		0: Object.assign({}, model, { name: "魅力" }),
		0: Object.assign({}, model, { name: "絕壁" }),
		0: Object.assign({}, model, { name: "貧乳" }),
		0: Object.assign({}, model, { name: "巨乳" }),
		0: Object.assign({}, model, { name: "爆乳" }),
		0: Object.assign({}, model, { name: "魔乳" }),
		0: Object.assign({}, model, { name: "白虎" }),
		0: Object.assign({}, model, { name: "母乳體質" }),
		0: Object.assign({}, model, { name: "幼兒退行" }),
		0: Object.assign({}, model, { name: "幼稚" }),
		0: Object.assign({}, model, { name: "早洩" }),
		0: Object.assign({}, model, { name: "軟弱" }),
		0: Object.assign({}, model, { name: "未熟" }),
		0: Object.assign({}, model, { name: "牝犬" }),
		0: Object.assign({}, model, { name: "懷孕" }),
		0: Object.assign({}, model, { name: "育兒中" }),
		0: Object.assign({}, model, { name: "人妻" }),
		0: Object.assign({}, model, { name: "同族不育" }),
		0: Object.assign({}, model, { name: "私處產卵" }),
		0: Object.assign({}, model, { name: "直腸產卵" }),
		0: Object.assign({}, model, { name: "淫核" }),
		0: Object.assign({}, model, { name: "淫乳" }),
		0: Object.assign({}, model, { name: "淫壺" }),
		0: Object.assign({}, model, { name: "淫肛" }),
		0: Object.assign({}, model, { name: "角" }),
		0: Object.assign({}, model, { name: "獸耳" }),
		0: Object.assign({}, model, { name: "性豪" }),
	},
	// 9000 ~ 9999 個性
	09000: {	// 未處理
		0000: Object.assign({}, model, { name: "膽小" }),
		0000: Object.assign({}, model, { name: "堅強" }),
		0000: Object.assign({}, model, { name: "叛逆" }),
		0000: Object.assign({}, model, { name: "坦率" }),
		0000: Object.assign({}, model, { name: "文靜" }),
		0000: Object.assign({}, model, { name: "高傲" }),
		0000: Object.assign({}, model, { name: "囂張" }),
		0000: Object.assign({}, model, { name: "自卑" }),
		0000: Object.assign({}, model, { name: "傲嬌" }),
		// 少女心
		0: Object.assign({}, model, { name: "看重貞操" }),
		0: Object.assign({}, model, { name: "看輕貞操" }),
		0: Object.assign({}, model, { name: "壓抑" }),
		0: Object.assign({}, model, { name: "開放" }),
		0: Object.assign({}, model, { name: "抵抗" }),
		0: Object.assign({}, model, { name: "害羞" }),
		0: Object.assign({}, model, { name: "不知羞恥" }),
		0: Object.assign({}, model, { name: "把柄" }),
		// 性相關
		0: Object.assign({}, model, { name: "克制" }),
		0: Object.assign({}, model, { name: "冷漠" }),
		0: Object.assign({}, model, { name: "漠然" }),
		0: Object.assign({}, model, { name: "好奇心" }),
		0: Object.assign({}, model, { name: "保守" }),
		0: Object.assign({}, model, { name: "樂觀" }),
		0: Object.assign({}, model, { name: "悲觀" }),
		0: Object.assign({}, model, { name: "防備" }),
		0: Object.assign({}, model, { name: "表演慾" }),
		// 潔癖
		0: Object.assign({}, model, { name: "容易自慰" }),
		0: Object.assign({}, model, { name: "不怕污臭" }),
		0: Object.assign({}, model, { name: "反感污臭" }),
		0: Object.assign({}, model, { name: "獻身的" }),
		0: Object.assign({}, model, { name: "不怕髒" }),
		// 正直
		0: Object.assign({}, model, { name: "抵抗誘惑" }),
		0: Object.assign({}, model, { name: "接受快感" }),
		0: Object.assign({}, model, { name: "否定快感" }),
		0: Object.assign({}, model, { name: "容易上癮" }),
		0: Object.assign({}, model, { name: "容易陷落" }),
		// 特殊性癖
		0: Object.assign({}, model, { name: "自慰狂" }),
		0: Object.assign({}, model, { name: "性愛狂" }),
		0: Object.assign({}, model, { name: "淫亂" }),
		0: Object.assign({}, model, { name: "尻穴狂" }),
		0: Object.assign({}, model, { name: "弄乳狂" }),
		// 性癖
		0: Object.assign({}, model, { name: "厭女" }),
		0: Object.assign({}, model, { name: "倒錯" }),
		0: Object.assign({}, model, { name: "雙性戀" }),
		0: Object.assign({}, model, { name: "厭男" }),
		0: Object.assign({}, model, { name: "施虐狂" }),
		0: Object.assign({}, model, { name: "嫉妒" }),
		0: Object.assign({}, model, { name: "愛慕" }),
		0: Object.assign({}, model, { name: "盲從" }),
		0: Object.assign({}, model, { name: "小惡魔" }),
		0: Object.assign({}, model, { name: "受虐狂" }),
		0: Object.assign({}, model, { name: "露出狂" }),
		// 魅力
		0: Object.assign({}, model, { name: "魅惑" }),
		0: Object.assign({}, model, { name: "謎之魅力" }),
		0: Object.assign({}, model, { name: "威壓感" }),
		0: Object.assign({}, model, { name: "鼓舞" }),
		0: Object.assign({}, model, { name: "受歡迎" }),
		0: Object.assign({}, model, { name: "忘恩負義" }),
		0: Object.assign({}, model, { name: "母性" }),
		0: Object.assign({}, model, { name: "父性" }),
		0: Object.assign({}, model, { name: "慈愛" }),
		0: Object.assign({}, model, { name: "自信" }),
		0: Object.assign({}, model, { name: "懦弱" }),
		0: Object.assign({}, model, { name: "高貴" }),
		0: Object.assign({}, model, { name: "冷靜" }),
		0: Object.assign({}, model, { name: "智慧" }),
		0: Object.assign({}, model, { name: "庇護者" }),
		0: Object.assign({}, model, { name: "貴公子" }),
		0: Object.assign({}, model, { name: "傾城" }),
		0: Object.assign({}, model, { name: "巧言" }),
	},
	// 10000 ~ 19999 被動、異常狀態
	10000: {	// 未處理
		// 再生: 每回合恢復HP 10 ~ 100
		10000: Object.assign({}, model, { name: "再生", max_lv: 10, up_list: [1, 2] }),
		// 高速再生: 每回合恢復HP 6% ~ 15%／再生(0) lv6、HP > 1000
		10001: Object.assign({}, model, { name: "高速再生", max_lv: 10, up_list: [2], flag: { "skill_10000": ">5", "hp": ">1000" } }),
		// 超速再生: 每回合恢復HP 16% ~ 20% 或恢復HP 至 20 ~ 50%／高速再生(1) lv6／限定不死系魔物可學習
		10002: Object.assign({}, model, { name: "超速再生", max_lv: 5, race: [6800], flag: { "skill_10001": ">5" } }),
		0: Object.assign({}, model, { name: "先制" }),
		0: Object.assign({}, model, { name: "遲緩" }),
		0: Object.assign({}, model, { name: "淫紋" }),
		0: Object.assign({}, model, { name: "發情" }),
		0: Object.assign({}, model, { name: "風耐性" }),
		0: Object.assign({}, model, { name: "水耐性" }),
		0: Object.assign({}, model, { name: "火耐性" }),
		0: Object.assign({}, model, { name: "地耐性" }),
		0: Object.assign({}, model, { name: "光耐性" }),
		0: Object.assign({}, model, { name: "闇耐性" }),
		0: Object.assign({}, model, { name: "打擊耐性" }),
		0: Object.assign({}, model, { name: "穿刺耐性" }),
		0: Object.assign({}, model, { name: "斬擊耐性" }),
		0: Object.assign({}, model, { name: "毒耐性" }),
		0: Object.assign({}, model, { name: "睡眠耐性" }),
		0: Object.assign({}, model, { name: "麻痺耐性" }),
	},
	// 20000 ~ 29999 攻擊
	20000: {	// 未處理
		20000: Object.assign({}, model, { name: "破甲" }),
		20000: Object.assign({}, model, { name: "擬態" }),
		20000: Object.assign({}, model, { name: "隱暱" }),
		20000: Object.assign({}, model, { name: "潛行" }),
		20000: Object.assign({}, model, { name: "再生" }),
		20000: Object.assign({}, model, { name: "誘惑" }),
		20000: Object.assign({}, model, { name: "魔力吸收" }),
	},
	// 30000 ~ 39999 輔助
	30000: {	// 未處理

	},
	// 40000 ~ 49999 經歷
	40000: {	// 未處理
		40000: Object.assign({}, model, { name: "初心者" }),
	},
}

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
	contains: function (race_no) {
		return (race_data[race_no]);
	},
}