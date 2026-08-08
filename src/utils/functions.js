import i18n from '../translations/i18n';

const t = (key, options) => i18n.t(key, { ns: 'utils', ...options });

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
    if(!text) return 0;
    if(text){
        text = String(text);
    }
    // Keep digits and a single decimal point so users can enter decimal values.
    let cleaned = text.replace(/[^0-9.]/g, '');
    const firstDot = cleaned.indexOf('.');
    if (firstDot !== -1) {
        cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
    }
    let n = Math.max(parseFloat(cleaned), 0);
    return n = n ? n : 0;
}

export const convert_object_to_id = (datas) => {
    if (typeof datas == 'object') {
        let new_datas = {};
        for (const [key, value] of Object.entries(datas)) {
            if(["priority"].includes(key)){
                new_datas[key] = value;
            } //listeA.some(item => listeB.includes(item))
            else if (value && typeof value == "object") {
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
    /*
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
    */
    // if (size <= 0.1) {
    //     result = 0.8;
    // } if (size <= 0.2) {
    //     result = 0.7;
    // } else if (size <= 0.3) {
    //     result = 0.65;
    // } else if (size <= 0.7) {
    //     result = 0.6;
    // } else if (size <= 1) {
    //     result = 0.4;
    // } else if (size <= 2) {
    //     result = 0.3;
    // } else if (size <= 3) {
    //     result = 0.2;
    // } else {
    //     result = 0.25;
    // }

    // if (size <= 0.1) {
    //     result = 1;
    // } if (size <= 0.2) {
    //     result = 0.9;
    // } else if (size <= 0.3) {
    //     result = 0.8;
    // } else if (size <= 0.7) {
    //     result = 0.7;
    // } else if (size <= 1) {
    //     result = 0.5;
    // } else if (size <= 2) {
    //     result = 0.5;
    // } else if (size <= 3) {
    //     result = 0.5;
    // } else {
    //     result = 0.4;
    // }

    // if (size <= 0.3) {
    //     result = 1;
    // } if (size <= 0.7) {
    //     result = 0.9;
    // } else if (size <= 0.1) {
    //     result = 0.8;
    // } else if (size <= 0.2) {
    //     result = 0.7;
    // } else if (size <= 3) {
    //     result = 0.5;
    // } else if (size <= 4) {
    //     result = 0.5;
    // } else {
    //     result = 0.4;
    // }

    if (size <= 0.5) {
        result = 1;
    } else if (size <= 1.5) {
        result = 0.9;
    } else if (size <= 2) {
        result = 0.8;
    } else if (size <= 3) {
        result = 0.7;
    } else if (size <= 4) {
        result = 0.5;
    } else if (size <= 5) {
        result = 0.45;
    } else {
        result = 0.4;
    }

    return result;
}

export const chunkArray = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
};

export function substring(description, longueurMax = 50) {
    if (description && description.length > longueurMax) {
        return description.substring(0, longueurMax) + '...';
    } else {
        return description;
    }
}


export function isDateTimeInPastOrNow(inputDateTime) {
    const dateTimeToCheck = new Date(inputDateTime);
    const now = new Date();

    return dateTimeToCheck <= now;
}


export function getDatesBetween(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= new Date(endDate)) {
        dates.push(new Date(currentDate).toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}

export function calculerDifferenceEntreDeuxDates(date1, date2) {

    const d1 = new Date(date1);
    const d2 = new Date(date2);

    if (isNaN(d1) || isNaN(d2)) {
        throw new Error(t('please_provide_valid_dates'));
    }

    const startDate = d1 < d2 ? d1 : d2;
    const endDate = d1 < d2 ? d2 : d1;

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    let days = endDate.getDate() - startDate.getDate();
    let hours = endDate.getHours() - startDate.getHours();
    let minutes = endDate.getMinutes() - startDate.getMinutes();
    let seconds = endDate.getSeconds() - startDate.getSeconds();

    // Ajuster les valeurs négatives
    if (seconds < 0) {
        seconds += 60;
        minutes -= 1;
    }
    if (minutes < 0) {
        minutes += 60;
        hours -= 1;
    }
    if (hours < 0) {
        hours += 24;
        days -= 1;
    }
    if (days < 0) {
        const previousMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
        days += previousMonth.getDate();
        months -= 1;
    }
    if (months < 0) {
        months += 12;
        years -= 1;
    }

    return {
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
    };
}


export function construireDatesPhrase(difference) {
    const parts = [];
    if (difference.years > 0) parts.push(`${difference.years} ${difference.years > 1 ? t('duration_year_plural') : t('duration_year_singular')}`);
    if (difference.months > 0) parts.push(`${difference.months} ${difference.months > 1 ? t('duration_month_plural') : t('duration_month_singular')}`);
    if (difference.days > 0) parts.push(`${difference.days}${t('duration_day_abbr')}`);
    if (difference.hours > 0) parts.push(`${difference.hours}${t('duration_hour_abbr')}`);
    if (difference.minutes > 0) parts.push(`${difference.minutes}${t('duration_minute_abbr')}`);
    if (difference.seconds > 0) parts.push(`${difference.seconds}${t('duration_second_abbr')}`);

    return parts.join(" ");
}


export const isWithinRadius = (lat1, lon1, lat2, lon2, radius) => {
    /*
        Méthode (Formule) de Haversine
        lat1, lon1 => les coordonnées du 1er point
        lat2, lon2 => les coordonnées du 2e point
        radius => le rayon
    */
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    const earthRadius = 6371; // Rayon moyen de la Terre en kilomètres

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c; // Distance en kilomètres

    return distance <= radius; // Retourne vrai si la distance est dans le rayon
};


function adler32(str) {
    let a = 1, b = 0;
    const MOD_ADLER = 65521;

    for (let i = 0; i < str.length; i++) {
        a = (a + str.charCodeAt(i)) % MOD_ADLER;
        b = (b + a) % MOD_ADLER;
    }

    return (b << 16) | a;
}

export function getValidationCode(seed) {
    return String(adler32(String(seed))).slice(0, 6);
}

export function validatePassword(password) {
    // Vérifier si le mot de passe contient uniquement des lettres et des chiffres
    if (!/^[A-Za-z0-9]+$/.test(password)) {
        return t('password_letters_digits_only');
    }

    // Vérifier la longueur (au moins 8 caractères)
    if (password.length < 8) {
        return t('password_min_length');
    }

    // Vérifier si le mot de passe contient au moins une lettre
    if (!/[A-Za-z]/.test(password)) {
        return t('password_needs_letter');
    }

    // Vérifier si le mot de passe contient au moins un chiffre
    if (!/[0-9]/.test(password)) {
        return t('password_needs_digit');
    }


    return true;
}



export function applyStyleRecursively(t, fields, TcombType, width) {
    let stylesheet = t.form.Form.stylesheet;
    let itemStyle = t.form.Form.itemStyle;

    if (!fields) return {};

    const newFields = {};

    for (const key in fields) {
        if (!fields.hasOwnProperty(key)) continue;

        const field = fields[key];
        const newField = { ...field };

        // S'il y a des sous-champs imbriqués, on appelle récursivement
        if (field.fields) {
            newField.fields = applyStyleRecursively(t, field.fields, TcombType, width - 5);
        }

        if (!field.fields) {

            // Object.keys(TcombType.meta.props).forEach((_key) => {
            //     if (TcombType.meta.props[_key].meta && TcombType.meta.props[_key].meta.kind === 'enums') {
            //         console.log(fields[_key].itemStyle)
            //         console.log(itemStyle)
            //         newFields[_key] = {
            //             ...newFields[_key],
            //             pickerStyle: {
            //                 backgroundColor: 'red',
            //                 width: 500,
            //                 color: 'red',
            //             },
            //             // itemStyle: {
            //             //     ...itemStyle,
                            
            //             //     color: 'red',
            //             // }
            //         };
            //     }
            // });

            let typeChamps = [];//['textbox', 'select', 'checkbox', 'textboxView'];
            Object.keys(stylesheet).forEach(function (key) {
                let _key = String(key);
                if (((_key.includes("box") && !_key.includes("View")) || ["select", "button"].includes(_key))) {
                    typeChamps.push(_key)
                }
            });

            let typeChamps_styledFields = typeChamps.reduce((acc, champ) => {
                if (stylesheet[champ] && ![undefined, null].includes(stylesheet[champ])) {
                    if (champ == "button") {
                        acc[champ] = {
                            ...(stylesheet[champ] ?? {}),
                            marginBottom: 55
                        };
                    } else {
                        acc[champ] = {
                            ...(stylesheet[champ] ?? {}),
                            normal: {
                                ...(stylesheet[champ]?.normal ?? {}),
                                width: width,
                                borderColor: '#ddd',
                                borderRadius: 25,
                                borderWidth: 3,
                            },
                            error: {
                                ...(stylesheet[champ]?.error ?? {}),
                                width: width,
                            }
                        };
                    }
                }
                return acc;
            }, {});

            newField.stylesheet = {
                ...stylesheet,
                ...typeChamps_styledFields
            };

        } else {
            newField.normal = {
                width: width,
                borderColor: '#ddd',
                borderRadius: 25,
                borderWidth: 3,
                backgroundColor: "red"
            };
            // newField.stylesheet = {
            //     ...newField.stylesheet,
            //     normal : {
            //         width: width,
            //         borderColor: '#ddd',
            //         borderRadius: 25,
            //         borderWidth: 3,
            //         backgroundColor: "red"
            //     }
            // };
        }


        // S'il s'agit d'un champ textuel (tu peux ajouter plus de logique ici)
        // if (!field.fields) {
        //     newField.stylesheet = {
        //         ...stylesheet,
        //         textbox: {
        //             ...stylesheet.textbox,
        //             normal: {
        //                 ...stylesheet.textbox.normal,
        //                 width: width,
        //                 borderColor: '#ddd',
        //                 borderRadius: 25,
        //                 borderWidth: 3,
        //             },
        //             error: {
        //                 ...stylesheet.textbox.error,
        //                 width: width,
        //             }
        //         },
        //         select: {
        //             ...stylesheet.select,
        //             normal: {
        //                 ...stylesheet.select.normal,
        //                 width: width,
        //                 borderColor: '#ddd',
        //                 borderRadius: 25,
        //                 borderWidth: 3,
        //             },
        //             error: {
        //                 ...stylesheet.select.error,
        //                 width: width,
        //             }
        //         }
        //     };
        // }

        newFields[key] = newField;
    }
    
    return newFields;
}


export function applyStylesToOptions(t, options) {
    if (!options || typeof options !== 'object') return options;

    const newOptions = { ...options };

    if (newOptions.fields) {
        newOptions.fields = Object.keys(newOptions.fields).reduce((acc, key) => {
            acc[key] = applyStylesToOptions(newOptions.fields[key]);
            return acc;
        }, {});
    }

    if (newOptions.item) {
        newOptions.item = applyStylesToOptions(newOptions.item);
    }

    // Appliquer style uniquement s’il s’agit d’un champ (pas objet ou liste)
    const isLeafField = !newOptions.fields && !newOptions.item;

    if (isLeafField) {
        newOptions.stylesheet = {
            ...t.form.Form.stylesheet,
            textbox: {
                ...t.form.Form.stylesheet.textbox,
                normal: {
                    ...t.form.Form.stylesheet.textbox.normal,
                    width: 700,
                    color: 'red',
                    backgroundColor: 'red'
                },
                error: {
                    ...t.form.Form.stylesheet.textbox.error,
                    width: 700,
                }
            },
            select: {
                ...t.form.Form.stylesheet.select,
                normal: {
                    ...t.form.Form.stylesheet.select.normal,
                    width: 700,
                    color: 'red',
                    backgroundColor: 'red'
                },
                error: {
                    ...t.form.Form.stylesheet.select.error,
                    width: 700,
                }
            }
        };
    }

    return newOptions;
}




export function normaliserChaine(chaine) {

  chaine = chaine.toUpperCase(); // Mettre en majuscule

  chaine = chaine.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Supprimer les accents

  chaine = chaine.replace(/[^A-Z0-9]/g, ''); // Supprimer tous les caractères sauf lettres et chiffres

  return chaine;
}

export function comparerChaines(str1, str2) {
  return normaliserChaine(str1) === normaliserChaine(str2);
}