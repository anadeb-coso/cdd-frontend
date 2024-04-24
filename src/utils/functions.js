export function moneyFormat(money, unit = "FCFA") {
    let list_money_str = String(Math.floor(money)).split("").reverse();
    let money_format = "";
    for (let i = 1; i <= list_money_str.length; i++) {
        money_format += list_money_str[i - 1];
        if (i % 3 == 0) {
            money_format += " "
        }
    }
    return money_format.split("").reverse().join("") + " " + unit;
}

export const return_numbers_only = (text) => {
    let n = Math.max(parseFloat(text.replace(/[^0-9]/g, '')), 0);
    return n = n ? n : 0;
}

export const convert_object_to_id = (datas) => {
    if(typeof datas == 'object'){
        let new_datas = {};
        for(const [key, value] of Object.entries(datas)){
            if(value && typeof value == "object"){
                if(value.id){
                    new_datas[key] = value.id;
                }else{
                    new_datas[key] = []
                    for(var i=0;i<value.length;i++){
                        for(const [key1, value1] of Object.entries(value[i])){
                            if(key1 == "id"){
                                new_datas[key].push(value1);
                                break;
                            }
                        }
                    }
                }
            }else{
                new_datas[key] = value;
            }
        }
        return new_datas;
    }
    return datas;
}