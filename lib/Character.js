const character = require('../data/character_data.js');

var char_list = new Array();    // 角色列表

// 角色模板
var char_model = {
    name = "",  // 角色名稱

};

module.exports = {
    // 取得角色列表
    getCharList: function () {
        console.table(char_list);
    },

    // 製作新角色
    newChar: function (char_id) {

    },
}