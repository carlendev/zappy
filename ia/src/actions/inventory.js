const inventory = {
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

function setInventory(key, value) {
    if (!Object.keys(inventory).find(e => e === key)) return
    inventory[key] = value
}

module.exports = { getInventory, setInventory }