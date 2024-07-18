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
    if (typeof datas == 'object') {
        let new_datas = {};
        for (const [key, value] of Object.entries(datas)) {
            if (value && typeof value == "object") {
                if (value.id) {
                    new_datas[key] = value.id;
                } else {
                    new_datas[key] = []
                    for (var i = 0; i < value.length; i++) {
                        for (const [key1, value1] of Object.entries(value[i])) {
                            if (key1 == "id") {
                                new_datas[key].push(value1);
                                break;
                            }
                        }
                    }
                }
            } else {
                new_datas[key] = value;
            }
        }
        return new_datas;
    }
    return datas;
}

export function isToday(someDate) {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear();
}


export function range(start, stop, step) {
    if (typeof stop == 'undefined') {
        stop = start;
        start = 0;
    }

    if (typeof step == 'undefined') {
        step = 1;
    }

    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
        return [];
    }

    var result = [];
    for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
        result.push(i);
    }

    return result;
};

export function times_split(hours = 24, minutes = 60, minutes_between = 15) {
    let times = [];
    for (let h = 0; h < hours; h++) {
        for (let m = 0; m < minutes; m += minutes_between) {
            times.push(
                (h < 10 ? `0${h}` : `${h}`) + ':' + (m < 10 ? `0${m}` : `${m}`)
            )
        }
    }

    return times;
}

export function clear_duplicate_on_liste(myTable) {
    var cache = {};
    myTable = myTable.filter(function (elem, index, array) {
        return cache[elem.id] ? 0 : cache[elem.id] = 1;
    });
    return myTable;
}

export const capitalizeFirstLetterForEachWord = (str) => {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const capitalizeFirstLetter = (str) => {
    return str.split(' ').map((word, index) => index == 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word.toUpperCase()).join(' ');
};

export const image_compress = (size) => {
    let result;
    if (size <= 0.1) {
        result = 0.5;
    } if (size <= 0.2) {
        result = 0.4;
    } else if (size <= 0.3) {
        result = 0.3;
    } else if (size <= 0.7) {
        result = 0.15;
    } else if (size <= 1) {
        result = 0.1;
    } else if (size <= 2) {
        result = 0.08;
    } else if (size <= 3) {
        result = 0.07;
    } else {
        result = 0.05;
    }
    
    return result;
}