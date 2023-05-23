function handleChangeCity(ele1, ele2, defaultOption) {
    let results = [];
    let value = $(ele1).find(":selected").val();
    $(ele2).empty();
    let data = findDistrictById(value);
    results = data.data;
    let lang = sessionStorage.getItem('lang');
    $(ele2).append(new Option(defaultOption, ""));
    results.map((item, index) => {
        if (lang === 'en') {
            $(ele2).append(new Option(item['Name_EN'], item['ClassificationCode']));
        }
        else {
            $(ele2).append(new Option(item['Name'], item['ClassificationCode']));
        }
    });
    $(ele2)[0][0].innerText = defaultOption
}

function handleChangeDistrict(ele1, ele2, defaultOption) {
    let results = [];
    let value = $(ele1).find(":selected").val();
    $(ele2).empty();
    let data = findWardById(value);
    results = data.data;
    let lang = sessionStorage.getItem('lang');
    $(ele2).append(new Option(defaultOption, ""));
    results.map((item, index) => {
        if (lang === 'en') {
            $(ele2).append(new Option(item['Name_EN'], item['ClassificationCode']));
        }
        else {
            $(ele2).append(new Option(item['Name'], item['ClassificationCode']));
        }
    });
    $(ele2)[0][0].innerText = defaultOption
}

function handleChangeCityVlos(ele1, ele2, defaultOption) {
    let results = [];
    let value = $(ele1).find(":selected").val();
    $(ele2).empty();
    let data = findDistrictVlosByProvinceId(value);
    results = data.data;
    $(ele2).append(new Option(defaultOption, ""));
    results.map((item, index) => {
        $(ele2).append(new Option(item['district'], item['district_code']));
    });
    $(ele2)[0][0].innerText = defaultOption
}

function handleChangeDistrictVlos(ele1, ele2, defaultOption) {
    let results = [];
    let value = $(ele1).find(":selected").val();
    $(ele2).empty();
    let data = findWardVlosByDistrictId(value);
    results = data.data;
    $(ele2).append(new Option(defaultOption, ""));
    results.map((item, index) => {
        $(ele2).append(new Option(item['ward'], item['ward_code']));
    });
    $(ele2)[0][0].innerText = defaultOption
}

function cleanDataCity(city) {
    if (city) {
        city = city.toLowerCase();
        if (city.includes('tỉnh')) {
            city = city.replace('tỉnh', '').trim();
        } else if (city.includes('thành phố')) {
            city = city.replace('thành phố', '').trim();
        } else if (city.includes('tp.')) {
            city = city.replace('tp.', '').trim();
        } else if (city.includes('tp')) {
            city = city.replace('tp', '').trim();
        } else if (city.includes('thủ đô')) {
            city = city.replace('thủ đô', '').trim();
        } else {
            city = city.trim();
        }
        return city;
    }
}

function cleanDataDistrict(district) {
    if (district) {
        district = district.toLowerCase();
        if (district.includes('huyện')) {
            district = district.replace('huyện', '').trim();
        } else if (district.includes('quận')) {
            district = district.replace('quận', '').trim();
        } else if (district.includes('thị xã')) {
            district = district.replace('thị xã', '').trim();
        } else if (district.includes('thành phố')) {
            district = district.replace('thành phố', '').trim();
        } else {
            district = district.trim();
        }
        return district;
    }
}

function cleanDataWard(ward) {
    if (ward) {
        ward = ward.toLowerCase();
        if (ward.includes('xã')) {
            ward = ward.replace('xã', '').trim();
        } else if (ward.includes('phường')) {
            ward = ward.replace('phường', '').trim();
        } else if (ward.includes('thị trấn')) {
            ward = ward.replace('thị trấn', '').trim();
        } else {
            ward = ward.trim();
        }
    }
    return ward;
}

function findCity(search) {
    let cities = getAllCity();
    let data = cities.data;
    search = search.trim().toLowerCase();
    let result = data.find(city_item => {
        let city = city_item.Name.trim().toLowerCase();
        let cityClean = cleanDataCity(city);
        return cityClean.indexOf(search) !== -1;
    });
    if (!result) {
        result = data.find(city_item => {
            let city = city_item.Name.trim().toLowerCase();
            let cityClean = cleanDataCity(city);
            return search.indexOf(cityClean) !== -1;
        });
    };
    return result;
}

function findDistrict(search) {
    let districts = getAllDistrict();
    let data = districts.data;
    search = search.trim().toLowerCase();
    let result = data.find(district_item => {
        let district = district_item.Name.trim().toLowerCase();
        let districtClean = cleanDataDistrict(district);
        return districtClean.indexOf(search) !== -1;
    });
    if (!result) {
        result = data.find(district_item => {
            let district = district_item.Name.trim().toLowerCase();
            let districtClean = cleanDataDistrict(district);
            return search.indexOf(districtClean) !== -1;
        });
    };
    return result;
}

function findWard(search) {
    let wards = getAllWard();
    let data = wards.data;
    search = search.trim().toLowerCase();
    let result = data.find(ward_item => {
        let ward = ward_item.Name.trim().toLowerCase();
        let wardClean = cleanDataWard(ward);
        return wardClean.indexOf(search) !== -1;
    });
    if (!result) {
        result = data.find(ward_item => {
            let ward = ward_item.Name.trim().toLowerCase();
            let wardClean = cleanDataWard(ward);
            return search.indexOf(wardClean) !== -1;
        });
    };
    return result;
}

function findDistrictById(ClassificationCode) {
    try {
        let district = getDetailDistricts(ClassificationCode);
        return district;
    }
    catch (error) {
        return {
            errorCode: error.status || 500,
            errorMessage: error.message
        }
    }
}

function findWardById(ClassificationCode) {
    try {
        let ward = getDetailWards(ClassificationCode);
        return ward;
    }
    catch (error) {
        return {
            errorCode: error.status || 500,
            errorMessage: error.message
        }
    }
}

function findCityVlos(search) {
    let cities = getAllProvinceVlos();
    let data = cities.data;
    search = search.trim().toLowerCase();
    let result = data.find(city_item => {
        let city = city_item.province.trim().toLowerCase();
        let cityClean = cleanDataCity(city);
        return cityClean.indexOf(search) !== -1;
    });
    if (!result) {
        result = data.find(city_item => {
            let city = city_item.province.trim().toLowerCase();
            let cityClean = cleanDataCity(city);
            return search.indexOf(cityClean) !== -1;
        });
    };
    return result;
}

function findDistrictVlos(search) {
    let districts = getAllDistrictVlos();
    let data = districts.data;
    search = search.trim().toLowerCase();
    let result = data.find(district_item => {
        let district = district_item.district.trim().toLowerCase();
        let districtClean = cleanDataDistrict(district);
        return districtClean.indexOf(search) !== -1;
    });
    if (!result) {
        result = data.find(district_item => {
            let district = district_item.district.trim().toLowerCase();
            let districtClean = cleanDataDistrict(district);
            return search.indexOf(districtClean) !== -1;
        });
    };
    return result;
}

function findWardVlos(search) {
    let wards = getAllWardVlos();
    let data = wards.data;
    search = search.trim().toLowerCase();
    let result = data.find(ward_item => {
        let ward = ward_item.ward.trim().toLowerCase();
        let wardClean = cleanDataWard(ward);
        return wardClean.indexOf(search) !== -1;
    });
    if (!result) {
        result = data.find(ward_item => {
            let ward = ward_item.ward.trim().toLowerCase();
            let wardClean = cleanDataWard(ward);
            return search.indexOf(wardClean) !== -1;
        });
    };
    return result;
}

function findDistrictVlosByProvinceId(id) {
    try {
        let districts = getDistrictsByProvinceIdVlos(id);
        return districts;
    }
    catch (error) {
        return {
            errorCode: error.status || 500,
            errorMessage: error.message
        }
    }
}

function findWardVlosByDistrictId(id) {
    try {
        let wards = getWardsByDistrictIdVlos(id);
        return wards;
    }
    catch (error) {
        return {
            errorCode: error.status || 500,
            errorMessage: error.message
        }
    }
}

