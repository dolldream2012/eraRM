/*
創立角色以角色模版為主，預設角色只需要填寫替換資料即可
※預設資料如果空白，表示為不明
*/

// 模板
const model = {
	"name": ""		// 角色名稱
	, "age": ""		// 外表年齡(以人類的審美標準為基礎)
	, "age_t": ""	// 真實年齡(留白表示真實年齡與外表年齡相同)
	, "gender": ""	// 性別(0: 扶他, 1: 無性, 2: 女性, 3: 男性)
	, "race": []	// 種族([主要種族, 混血種族1, 混血種族2])
	, "race_r": 60	// 主要種族權重
	, "soul": [0]	// 靈魂(0 表示自身靈魂，如果陣列為空表示驅體目前不存在靈魂)
	, "hight": 160	// 身高
	, "weight": 50	// 體重
	, "b": 60		// 胸圍
	, "w": 60		// 腰圍
	, "h": 60		// 臀圍
	, "lv": 1		// 等級
	, "gold": 0		// 持有金錢
	, "hp": 100		// 生命
	, "sp": 100		// 耐力
	, "mp": 100		// 魔力
	, "str": 5		// 力量
	, "vit": 5		// 體力
	, "agi": 5		// 速度
	, "dex": 5		// 靈巧
	, "int": 5		// 智力
	, "sen": 5		// 感知
	, "fri": 5		// 魅力
	, "luc": 5		// 幸運
	, "alias": []	// 稱號
	, "guild": []	// 組織
	, "status": []	// 身份
	, "job": []		// 職業
	, "equip": {}	// 裝備
	, "item": {}	// 物品
	, "skill": []	// 技能、天賦、個性
	// 角色資料僅能設定技能，技能等級預設為 1
	// 初始化完成後，資料型別會更改為 Object
	// 如果存在互斥技能，會互相抵消
	, "addict": []	// 喜好屬性
	, "favorite": []	// 喜好物品
	// , "random_skill": false	// 取得隨機技能
};

// 角色列表
const char_data = {
	// 角色模版
	"0": Object.assign({}, model, {
		"random_skill": true
	}),

	// 緹亞
	"1": Object.assign({}, model, {
		"name": "緹亞"
		, "gender": 2
		, "age": 10
		, "age_t": "不明"
		, "race": [3000, 5990, 6800]
		, "skill": [8, 43000]
	}),
};

module.exports = {
	getData: function (char_no) {
		return JSON.parse(JSON.stringify(char_data[char_no] || char_data[0]));	// 深拷貝以避免更動到原資料；如果查無角色資料，回傳角色模板
	}
}