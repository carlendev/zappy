let lvl = 7

function getLvl() {
    return lvl
}

function setLvl(value) {
    lvl = value
}

let inventory = {
    food: 10,
    linemate: 0,
    deraumere: 0,
    sibur: 0,
    mendiane: 0,
    phiras: 0,
    thystame: 0
}

function getInventory() {
    return inventory
}

function setInventoryKey(key, value) {
    if (!Object.keys(inventory).find(e => e === key)) return
    inventory[key] = value
}

function setInventory(data) {
    inventory = data
}

module.exports = { getLvl, setLvl, getInventory, setInventory, setInventoryKey }