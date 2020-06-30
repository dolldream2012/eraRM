/*
編號規則:
	千位數為屬性
	十位數為種族
	個位數為亞種
*/

// 模版
const model = {
	name: "",	// 種族名稱
	gender: [1, 1, 49, 49],	// 種族性別比例(0: 多性, 1:無性, 2:女性, 3:男性)
	rate: 0,	// 種族權重(越高越容易影響特徵)
};

module.exports = {
	// 0 ~ 999 古族
	0000: Object.assign({}, model, { name: "古族", gender: [0, 100, 0, 0] }),
	0990: Object.assign({}, model, { name: "威爾德", rate: 20, gender: [10, 10, 40, 40] }),
	// 1000 ~ 1999 風神眷族
	// 2000 ~ 2999 水神眷族
	// 3000 ~ 3999 火神眷族
	3000: Object.assign({}, model, { name: "精靈", rate: 100 }),
	3001: Object.assign({}, model, { name: "原生精靈", rate: 100 }),
	3001: Object.assign({}, model, { name: "白精靈", rate: 100 }),
	3002: Object.assign({}, model, { name: "黑精靈", rate: 100 }),
	// 4000 ~ 4999 地神眷族
	// 5000 ~ 5999 獸神眷族
	5990: Object.assign({}, model, { name: "人類", rate:50 }),
	5991: Object.assign({}, model, { name: "真人", rate:50 }),
	5992: Object.assign({}, model, { name: "異人", rate:50 }),
	5993: Object.assign({}, model, { name: "耶畢特人", rate:50 }),
	// 6000 ~ 6999 魔物
	6800: Object.assign({}, model, { name: "不死系魔物"}),
	// 測試種族
	998: Object.assign({}, model, { name: "測試種族1", rate:100, gender: [1, 1, 49, 49]}),
	999: Object.assign({}, model, { name: "測試種族2", rate:100, gender: [1, 1, 80, 20]}),
}