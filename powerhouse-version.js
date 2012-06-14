/*==============================================================================
 * powerhouse-version.js
 *
 * PowerHouse Version Javascript
 *
 * Author: Kyle W T Sherman
 *
 * Time-stamp: <2012-06-04 14:20:47 (kyle)>
 *============================================================================*/

//==============================================================================
// Version Update
//==============================================================================

// version update class
/**@constructor*/
VersionUpdate = function(id, version, funct) {
    this.id = id;
    this.version = version;
    this.funct = funct;
    this.code = function() {
        return numToUrlCode(this.id);
    }
    this.equals = function(obj) {
        return (typeof(this) == typeof(obj) && this.id == obj.id);
    }
    this.toString = function() {
        return '[id='+this.id+', version=\''+this.version+'\', funct=\''+this.funct+'\', code='+this.code()+']';
    }
}

// version update data
// function must handle the following values for 'thing': pos, i, inc, code1, code2, code3, code4, archetype, superStat, innateTalent, talent, travelPower, framework, power, mask, specializationTree, specialization
// valid values: type, pos, i, inc, code1, code2, code3, code4, archetype, superStat, innateTalent, talent, travelPower, framework, power, mask, specializationTree, specialization
// valid types: start, archetype, superStat, innateTalent, talent, travelPower, power, specialization
// valid
// mask modifications:
//   advantageId:   0 1 2 3 4  5  6  7   8   9   10
//   decimal value: 1 2 4 8 16 32 64 128 256 512 1024
var dataVersionUpdate = new Array();
dataVersionUpdate[dataVersionUpdate.length] = new VersionUpdate(dataVersionUpdate.length, 0, null);
dataVersionUpdate[dataVersionUpdate.length] = new VersionUpdate(dataVersionUpdate.length, 1,
                                                                function(thing, value) {
                                                                    var codeNum1 = (value['code1'] == undefined) ? 0 : urlCodeToNum(value['code1']);
                                                                    var codeNum2 = (value['code2'] == undefined) ? 0 : urlCodeToNum(value['code2']);
                                                                    // var codeNum3 = (value['code3'] == undefined) ? 0 : urlCodeToNum(value['code3']);
                                                                    // var codeNum4 = (value['code4'] == undefined) ? 0 : urlCodeToNum(value['code4']);
                                                                    switch (thing) {
                                                                    case 'pos':
                                                                        // add archetype to start of data
                                                                        if (value['type'] == 'start' && value['pos'] == 0) return 1;
                                                                        else return value['pos'];
                                                                    case 'i': return value['i'];
                                                                    case 'inc':
                                                                        // advantages now use two digits
                                                                        if (value['type'] == 'power') return value['inc']-1;
                                                                        else return value['inc'];
                                                                    case 'code1': return value['code1'];
                                                                    case 'code2': return value['code2'];
                                                                    case 'code3':
                                                                        // advantages now use two characters
                                                                        if (value['type'] == 'power') return numToUrlCode(0);
                                                                        else return value['code3'];
                                                                    case 'code4':
                                                                        // advantages now use two characters
                                                                        if (value['type'] == 'power') return value['code3'];
                                                                        else return value['code4'];
                                                                    case 'archetype': return value['archetype'];
                                                                    case 'superStat': return value['superStat'];
                                                                    case 'innateTalent': return value['innateTalent'];
                                                                    case 'talent': return value['talent'];
                                                                    case 'travelPower': return value['travelPower'];
                                                                    case 'framework': return value['framework'];
                                                                    case 'power': return value['power'];
                                                                    case 'mask':
                                                                        // add Break the Trigger advantage to Bullet Beatdown power
                                                                        if (value['type'] == 'power' && codeNum1 == 8 && codeNum2 == 3) return value['mask']+(value['mask']&48);
                                                                        else return value['mask'];
                                                                    case 'specializationTree': return value['specializationTree'];
                                                                    case 'specialization': return value['specialization'];
                                                                    }
                                                                });
dataVersionUpdate[dataVersionUpdate.length] = new VersionUpdate(dataVersionUpdate.length, 2,
                                                                function(thing, value) {
                                                                    var codeNum1 = (value['code1'] == undefined) ? 0 : urlCodeToNum(value['code1']);
                                                                    var codeNum2 = (value['code2'] == undefined) ? 0 : urlCodeToNum(value['code2']);
                                                                    // var codeNum3 = (value['code3'] == undefined) ? 0 : urlCodeToNum(value['code3']);
                                                                    // var codeNum4 = (value['code4'] == undefined) ? 0 : urlCodeToNum(value['code4']);
                                                                    switch (thing) {
                                                                    case 'pos': return value['pos'];
                                                                    case 'i': return value['i'];
                                                                    case 'inc': return value['inc'];
                                                                    case 'code1': return value['code1'];
                                                                    case 'code2': return value['code2'];
                                                                    case 'code3': return value['code3'];
                                                                    case 'code4': return value['code4'];
                                                                    case 'archetype': return value['archetype'];
                                                                    case 'superStat': return value['superStat'];
                                                                    case 'innateTalent': return value['innateTalent'];
                                                                    case 'talent': return value['talent'];
                                                                    case 'travelPower':
                                                                        if (codeNum1 >= 5 && codeNum1 <= 31) return value['travelPower']+2;
                                                                        else if (codeNum1 >= 32 && codeNum1 <= 33) return value['travelPower']-27;
                                                                        else return value['travelPower'];
                                                                    case 'framework': return value['framework'];
                                                                    case 'power': return value['power'];
                                                                    case 'mask':
                                                                        // add Kindling advantage to Fire Strike power
                                                                        if (value['type'] == 'power' && codeNum1 == 2 && codeNum2 == 1) return value['mask']+(value['mask']&48);
                                                                        // add Strong Arm advantage to Shuriken Storm power
                                                                        if (value['type'] == 'power' && codeNum1 == 10 && codeNum2 == 19) return value['mask']+(value['mask']&16);
                                                                        if (value['type'] == 'power' && codeNum1 == 11 && codeNum2 == 18) return value['mask']+(value['mask']&16);
                                                                        if (value['type'] == 'power' && codeNum1 == 12 && codeNum2 == 18) return value['mask']+(value['mask']&16);
                                                                        if (value['type'] == 'power' && codeNum1 == 13 && codeNum2 == 24) return value['mask']+(value['mask']&16);
                                                                        // add It's That Time advantage to Clobber power
                                                                        if (value['type'] == 'power' && codeNum1 == 18 && codeNum2 == 0) return value['mask']+(value['mask']&16);
                                                                        // add Strong Arm advantage to Hurl power
                                                                        if (value['type'] == 'power' && codeNum1 == 18 && codeNum2 == 4) return value['mask']+(value['mask']&112);
                                                                        // add Accelerated Metabolism advantage to Reaper's Caress power
                                                                        if (value['type'] == 'power' && codeNum1 == 12 && codeNum2 == 1) return value['mask']+(value['mask']&16);
                                                                        else return value['mask'];
                                                                    case 'specializationTree': return value['specializationTree'];
                                                                    case 'specialization': return value['specialization'];
                                                                    }
                                                                });

//==============================================================================
// Get Methods
//==============================================================================

// get data methods
getDataVersionUpdate = function() { return dataVersionUpdate; }

//==============================================================================
// End of File
//==============================================================================
