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